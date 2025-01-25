# Custom Departure Card for Home Assistant

![Image 1](path/to/image1.jpg) ![Image 2](path/to/image2.jpg)

## Example Code

The following example demonstrates how to use the `custom:departure-card`:

```yaml
type: custom:departure-card
title: Köln Hbf
connection_properties:
  targets: null
  train: train
  platform: platform
  show_platform: true
  departure: scheduledDeparture
  delay: delayDeparture
entity: sensor.koln_hbf_departures
connections_attribute: next_departures
displayed_connections: 8
unix_time: false