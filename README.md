# 🎨 Lovelace Styler

Plugin to customize the styling of Lovelace cards.

<img src="https://github.com/folke/lovelace-styler/assets/292349/6314dc34-4750-4cf4-b7b4-c3d0b6132486">

## ✨ Features

- style any component as a card (like `vertical-stack`, `grid`, `layout-card`, ...)
- remove card styling from any card
- apply custom CSS to any component
- tile card customization
- similar plugins:
  - [card-mod](https://github.com/thomasloven/lovelace-card-mod)
  - [vertical-stack-in-card](https://github.com/ofekashery/vertical-stack-in-card)
  - [stack-in-card](https://github.com/custom-cards/stack-in-card)
  - [lovelace-canary](https://github.com/jcwillox/lovelace-canary)

## ⚡ Performance

Great care has been taken to minimize the overhead of this plugin.
This plugin works by hooking into [Lit](https://lit.dev)'s [reactive life-cycle](https://lit.dev/docs/components/lifecycle/#reactive-update-cycle)
using [ReactiveElement.addInitializer](https://lit.dev/docs/components/lifecycle/#addInitializer)
and a custom [Reactive Controller](https://lit.dev/docs/composition/controllers/#lifecycle)
that only runs once per card in the `hostUpdated` live-cycle callback.

## 📦 Installation via HACS

Have [HACS](https://hacs.xyz/) installed, this will allow you to update easily.

- Adding **Styler** to HACS can be done using this button:

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=folke&repository=lovelace-styler&category=plugin)

(If the button above doesn't work, add `https://github.com/folke/lovelace-styler` as a custom repository of type Integration in HACS.)

- Click Download on the HACS page
- Reload the Home Assistant web page

## 🚀 Usage

### Style any component as a card

```yaml
type: vertical-stack
styler:
  card: true
cards: ...

type: grid
styler:
  card: true
cards: ...

type: custom:layout-card
styler:
  card: true
cards: ...

```

### Remove card styling from any card

```yaml
type: mushroom-light-card
entity: light.my_light
styler:
  card: false
```

### Apply custom CSS to any component

```yaml
type: mushroom-light-card
entity: light.my_light
styler:
  style: |
    .card {
      border-color: red;
    }
```

## Configuring the sections view

With styler, it's fairly easy to configure some options related to the sections view.

The example below sets the grid gap to 10px and the maximum number of sections to 2.

```yaml
title: Home
type: sections
styler:
  style: |
    .container {
      --column-gap: 10px !important;
      --column-max-width: 100hw !important;
      --max-column-count: 2 !important;
    }
sections: ...
```

## Tile Card Customization

```yaml
type: tile
info: false # hides the info section, so only shows the icon
animation: spin # adds a spinning animation to the icon
animation: pulse # adds a pulsing animation to the icon
```

## 🏠 Advanced Example

The code below was used to create the two room cards in the screenshot above.
The example code uses the [Mushroom Custom Cards](https://github.com/piitaya/lovelace-mushroom).

### Living Room Card

```yaml
type: horizontal-stack
layout_options:
  grid_columns: 2
styler:
  card: true
cards:
  - type: custom:mushroom-template-card
    primary: Living Room
    secondary: "{{ states('sensor.netatmo_living_room_temperature_2') | round(0) }} °C"
    icon: mdi:sofa
    icon_color: pink
    tap_action:
      action: navigate
      navigation_path: downstairs
    styler:
      style: |
        mushroom-state-info { min-height: 150px }
        ha-card { --icon-size: 130px }
        mushroom-shape-icon {
          position: absolute;
          margin: -20px -25px;
        }
  - type: grid
    columns: 1
    square: false
    styler:
      style: |
        :host {
          flex: 0 0 auto !important;
          margin: 12px;
        }
    cards:
      - type: tile
        info: false
        entity: light.group_lounge
      - type: tile
        info: false
        entity: binary_sensor.presence_living_room
        color: blue
```

### Upstairs Card

```yaml
type: horizontal-stack
layout_options:
  grid_columns: 2
styler:
  card: true
cards:
  - type: custom:mushroom-template-card
    primary: Upstairs
    secondary: "{{ states('sensor.netatmo_upstairs_temperature_3') | round(0) }} °C"
    icon: mdi:bed
    icon_color: brown
    tap_action:
      action: navigate
      navigation_path: downstairs
    styler:
      style: |
        mushroom-state-info { min-height: 150px }
        ha-card { --icon-size: 130px }
        mushroom-shape-icon {
          position: absolute;
          margin: -20px -25px;
        }
  - type: grid
    columns: 2
    square: false
    styler:
      style: |
        :host {
          flex: 0 0 auto !important;
          margin: 12px;
        }
    cards:
      - type: tile
        info: false
        entity: alarm_control_panel.upstairs
      - type: tile
        info: false
        entity: light.group_all_upstairs
      - type: custom:mushroom-template-card
      - type: tile
        info: false
        entity: binary_sensor.presence_upstairs
        color: blue
      - type: custom:mushroom-template-card
      - type: tile
        info: false
        entity: fan.ventilos
```
