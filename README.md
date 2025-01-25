# Custom Departure Card for Home Assistant
This custom-card is based on the integration [ha-db_infoscreen](https://github.com/FaserF/ha-db_infoscreen/tree/main) developed by [FaserF](https://github.com/FaserF). 

![Image 1](path/to/image1.jpg) ![Image 2](path/to/image2.jpg)

## Card Configuration

The following example demonstrates how to configure the card in your dashboard. 

```yaml
type: custom:departure-card
title: Köln Hbf
entity: sensor.koln_hbf_departures
connections_attribute: next_departures
displayed_connections: 8
unix_time: false
connection_properties:
  targets: null
  train: train
  platform: platform
  show_platform: true
  departure: scheduledDeparture
  delay: delayDeparture
```

## Parameters Explained

### type
	•	Description: Specifies the type of card to display.

### title
	•	Description: The title displayed at the top of the card.
	•	Example: Köln Hbf

### connections_attribute
	•	Description: The attribute within the sensor data that holds the list of departures.
	•	Example: next_departures

### displayed_connections
	•	Description: The number of connections (departures) to display.
	•	Example: 8

### unix_time
	•	Description: Boolean flag that determines whether to convert Unix time format for timestamps. Check your sensor. If it shows something like 1737619740 it's unix-time.  
	•	Example: false

## connection_properties

Defines how each departure is displayed and which properties are included.

### targets
	•	Description: Targets for the connection. If no specific target is needed, set it to null.
	•	Example: null

### train
	•	Description: The attribute from the sensor data that represents the train information.
	•	Example: train

### platform
	•	Description: The attribute from the sensor data where the train departs from.
	•	Example: platform

### show_platform
	•	Description: Boolean flag to specify whether the platform number should be shown or not.
	•	Example: true

### departure
	•	Description: The attribute from the sensor data that contains the scheduled departure time of the train.
	•	Example: scheduledDeparture

### delay
	•	Description: The attribute from the sensor that represents the delay of the departure.
	•	Example: delayDeparture

### entity
	•	Description: The entity ID of the sensor that contains the departure data.
	•	Example: sensor.koln_hbf_departures

## Installation

To install this custom card, follow these steps:
	1.	Download the card’s JavaScript file and add it to the /www/ directory in your Home Assistant instance.
	2.	Add the path to this card to your dashboard ressources (options -> dashboard -> three dots -> ressources):

resources:
  - url: /local/your-custom-card.js
    type: javascript-module

	3.	Use the example configuration above in your dashboard (manual yaml-configuration).

# Have fun!