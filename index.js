import 'dotenv/config.js';
import axios from 'axios';
import mqtt from 'async-mqtt';
import { stringify } from 'querystring';

// Prevent TLS errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const axiosInstance = axios.create({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  baseURL: `https://${process.env.SERVER}/ShareWebServices/Services`,
  method: 'post',
});

const DIRECTIONS = ['none', '2 up', '1 up', 'forty-five up', 'flat', 'forty-five down', '1 down', '2 down', 'not computable', 'out of range'];

let options = {
  login: { accountName: process.env.USERNAME, password: process.env.PASSWORD },
  fetch: { maxCount: 1, minutes: 1440 },
  maxFailures: 3,
  firstFetchCount: 3,
};

const main = async() => {
  // Connect to MQTT broken
  const client = await mqtt.connectAsync(process.env.MQTT_URL);

  // Login to Dexcom and save session id
  await authorize(options).then(res => {
    options.fetch.sessionId = res.data;
  });

  // Fetch and parse latest glucose reading
  const res = await fetchGlucose(options);
  const result = parseDexcomData(res.data[0]);
  console.log(result);

  // Publish to MQTT
  await client.publish(process.env.CHANNEL, result.glucose);
  await client.end();

  process.exit(0);
}

const parseDexcomData = (data) => ({
  glucose: mgdlToMMOL(data.Value),
  trend: data.Trend,
  direction: DIRECTIONS[data.Trend],
});

const loginPayload = (options) => ({
  password: options.password,
  applicationId: process.env.APPLICATION_ID,
  accountName: options.accountName,
});

const authorize = async(options) => axiosInstance({
  url: '/General/LoginPublisherAccountByName',
  data: loginPayload(options.login),
});

const fetchQuery = (options) => `/Publisher/ReadPublisherLatestGlucoseValues?${stringify({
    sessionID: options.sessionId,
    minutes: options.minutes,
    maxCount: options.maxCount,
  })}`;

const fetchGlucose = async(options) => axiosInstance({ url: fetchQuery(options.fetch) });

const mgdlToMMOL = mgdl => (Math.round((mgdl / 18) * 10) / 10).toFixed(1);

main();
