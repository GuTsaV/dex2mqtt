# dex2mqtt

This script fetches latest glucose reading from Dexcom and publishes to MQTT. 

## Requirements

* Dexcom G6 CGM System with credentials for Dexcom Share
* node 14.4 or later
* MQTT broker

## Setup

* `cp .env.sample .env`
* Add variables to .env
* `npm install`
* `npm start`

## Schedule with cron
`which npm` gives the path to npm.

* `crontab -e`
* `*/5 * * * * cd /path/to/dex2mqtt && /path/to/npm start >/dev/null 2>&1`

## Read values with Home Assistant sensor

In `configuration.yml`

MQTT configuration

```
mqtt:
  broker: <broker IP>
  port: <broker port>
  discovery: true
```

Sensor configuration
```
sensor:
  - platform: mqtt
    state_topic: 'glucose/current'
    name: Glucose
    icon: mdi:chart-bell-curve-cumulative
    unit_of_measurement: mmol/L
```
