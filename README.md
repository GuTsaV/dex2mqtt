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
`which node` gives the path to node.

* `crontab -e`
* `*/5 * * * * cd /path/to/dex2mqtt && /path/to/node --require ./node_modules/dotenv/config index.js >/dev/null 2>&1`

## Home Assistant
### Read values with sensor

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

### Change light color depending on glucose reading

In `automations.yml`:

```
  - alias: Glucose lamp color
    trigger:
      platform: mqtt
      topic: 'glucose/current'
    action:
      - service: light.turn_on
        entity_id: light.<lamp name>
        data_template:
          color_name: >
            {% if (trigger.payload|float) < 3 or (trigger.payload|float) > 15 %}
              red
            {% elif (trigger.payload|float) > 5 and (trigger.payload|float) < 10 %}
              green
            {% elif (((trigger.payload|float) - 8)|abs) < 1 %}
              greenyellow
            {% elif (((trigger.payload|float) - 8)|abs) < 2.5 %}
              yellow
            {% elif (((trigger.payload|float) - 8)|abs) < 5 %}
              orange
            {% elif (((trigger.payload|float) - 8)|abs) > 5 %}
              orangered
            {% else %}
              white
            {% endif %}
```
