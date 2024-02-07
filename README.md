# 🎨 Lovelace Styler

Plugin to customize the styling of Lovelace cards.

## ✨ Features

- style any component as a card (like `vertical-stack`, `grid`, `layout-card`, ...)
- remove card styling from any card
- apply custom CSS to any component
- minimal overhead

## 🚀 Usage

Style any component as a card:

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

Remove card styling from any card:

```yaml
type: mushroom-light-card
entity: light.my_light
styler:
  card: false
```

Apply custom CSS to any component:

```yaml
type: mushroom-light-card
entity: light.my_light
styler:
  style: |
    .card {
      border-color: red;
    }
```

## 🏠 Advanced Example

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
