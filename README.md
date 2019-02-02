# ZeverCloud Solar Power for Homey

When you connect your ZeverSolar device to the ZeverCloud you can use this homey app for retrieving the 5 minute values of your solar panels and use this in your Homey home automation flows. Like charging your car or start your washing machine when there is enough solar power.

## Device

Every ZeverSolar plant is a device which you can monitor in homey.

### Retrieving the api key of a plant

When you go this page https://www.zevercloud.com/station/update and add step 5 you can get the api key of your plant. Use this api key as input for this app.

## Flows

### triggers

- PowerAbove100W
- PowerAbove500W
- PowerAbove1000W
- PowerIs0W

### conditions

- is_generating
- generating_output
  - minimal, under 100W
  - ok, between 100 & 500W"
  - better, between 500 & 1000W
  - nice, between 1000 & 1500W
  - super, between 1500 & 2000W
  - chill, between 2000 & 3000W
  - awesome, between 3000 & 4000W