# 🎨 Lovelace Styler

Plugin to customize the styling of Lovelace cards.

<img src="https://github.com/folke/lovelace-styler/assets/292349/6314dc34-4750-4cf4-b7b4-c3d0b6132486">

## ✨ Features

- style any component as a card (like `vertical-stack`, `grid`, `layout-card`, ...)
- remove card styling from any card
- apply custom CSS to any component
- override a component's `getCardSize` method.
  Useful for custom cards that don't calculate their size correctly.
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

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=folke&repository=lovelace-styler&category=lovelace)

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

### Override a component's `getCardSize` method

Useful for custom cards that don't calculate their size correctly,
or to make the masonry layout work properly.

```yaml
type: custom:any-card
styler:
  size: 8
```

## 🏠 Advanced Example

The code below was used to create the two room cards in the screenshot above.

```yaml
square: false
type: grid
columns: 2
cards:
  - type: custom:layout-card
    styler:
      card: true
    layout_type: custom:grid-layout
    layout:
      grid-template-columns: 1fr auto
      grid-template-areas: |
        "title buttons"
        "icon buttons"
    cards:
      - type: custom:mushroom-template-card
        primary: Lounge
        secondary: >-
          {{ states('sensor.unknown_70_ee_50_a9_99_52_living_temperature') |
          round(0) }} °C
        tap_action:
          action: navigate
          navigation_path: downstairs
        view_layout:
          grid-area: title
        styler:
          style: |
            ha-card {
              min-height: 66px;
            }
      - type: custom:mushroom-template-card
        icon: mdi:sofa
        tap_action:
          action: navigate
          navigation_path: downstairs
        icon_color: pink
        secondary_info: none
        primary_info: none
        view_layout:
          grid-area: icon
        styler:
          style: |
            ha-card {
              margin-right: -25px;
              margin-top: -40px;
              left: -25px;
              bottom: -30px;
              --spacing: 0;
              --icon-size: 130px;
            }
      - type: vertical-stack
        view_layout:
          grid-area: buttons
        cards:
          - type: custom:mushroom-light-card
            entity: light.group_lounge
            primary_info: none
            secondary_info: none
            styler:
              style: |
                ha-card {
                  --spacing: 6px 6px 0 0;
                }
          - type: custom:mushroom-entity-card
            entity: sensor.unknown_70_ee_50_a9_99_52_living_temperature
            primary_info: none
            secondary_info: none
            icon_color: red
            styler:
              style: |
                ha-card {
                  --spacing: 6px 6px 0 0;
                }
          - type: custom:mushroom-entity-card
            entity: binary_sensor.presence_living_room
            primary_info: none
            secondary_info: none
            styler:
              style: |
                ha-card {
                  --spacing: 6px 6px 0 0;
                }
  - type: custom:layout-card
    layout_type: custom:grid-layout
    styler:
      card: true
    layout:
      grid-template-columns: minmax(10px, 1fr) auto
      grid-template-areas: |
        "title buttons"
        "icon buttons"
    cards:
      - type: custom:mushroom-template-card
        primary: Upstairs
        secondary: >-
          {{
          states('sensor.unknown_70_ee_50_a9_99_52_1e_verdieping_temperature') |
          round(0) }} °C
        tap_action:
          action: navigate
          navigation_path: upstairs
        view_layout:
          grid-area: title
        styler:
          style: |
            ha-card {
              border:none;
              min-height: 66px;
            }
      - type: custom:mushroom-template-card
        icon: mdi:bed
        tap_action:
          action: navigate
          navigation_path: upstairs
        icon_color: indigo
        secondary_info: none
        primary_info: none
        view_layout:
          grid-area: icon
        styler:
          style: |
            ha-card {
              border: none;
              margin-right: -25px;
              margin-top: -40px;
              left: -25px;
              bottom: -30px;
              --spacing: 0;
              --icon-size: 130px;
            }
      - type: grid
        columns: 2
        view_layout:
          grid-area: buttons
        cards:
          - type: custom:mushroom-alarm-control-panel-card
            entity: alarm_control_panel.upstairs
            primary_info: none
            secondary_info: none
            fill_container: true
            styler:
              style: |
                ha-card {
                  --spacing: 6px 6px 0 0;
                }
          - type: custom:mushroom-light-card
            entity: light.group_all_upstairs
            primary_info: none
            layout: vertical
            secondary_info: none
            styler:
              style: |
                ha-card {
                  --spacing: 6px 6px 0 0;
                }
          - type: custom:mushroom-fan-card
            entity: fan.ventilos
            icon_animation: true
            primary_info: none
            secondary_info: none
            tap_action:
              action: navigate
              navigation_path: upstairs
            layout: vertical
            styler:
              style: |
                ha-card {
                  --spacing: 6px 6px 0 0;
                }
          - type: custom:mushroom-entity-card
            entity: sensor.unknown_70_ee_50_a9_99_52_1e_verdieping_temperature
            primary_info: none
            secondary_info: none
            layout: vertical
            icon_color: red
            styler:
              style: |
                ha-card {
                  --spacing: 6px 6px 0 0;
                }
          - type: custom:gap-card
          - type: custom:mushroom-entity-card
            entity: binary_sensor.presence_upstairs
            primary_info: none
            secondary_info: none
            layout: vertical
            styler:
              style: |
                ha-card {
                  --spacing: 6px 6px 0 0;
                }
```
