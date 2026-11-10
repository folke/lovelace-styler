# 🎨 Lovelace Styler

Plugin to customize the styling of Lovelace cards.

## Development

Requires Node.js 22.12+ and pnpm (version pinned in `package.json`).

```sh
pnpm install
pnpm lint
pnpm check
pnpm format:check
pnpm test # builds the plugin and runs regression tests
```

Use `pnpm lint:fix` and `pnpm format` to apply fixes.

<img src="https://github.com/folke/lovelace-styler/assets/292349/6314dc34-4750-4cf4-b7b4-c3d0b6132486">

## ✨ Features

- style any component as a card (like `vertical-stack`, `grid`, `layout-card`, ...)
- remove card styling from any card
- apply custom CSS to any component
- reuse named CSS presets across cards and dashboards
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
and a custom [Reactive Controller](https://lit.dev/docs/composition/controllers/#lifecycle).
Styles are applied after the first update, then refreshed when Styler configuration
changes or shared presets are explicitly updated.

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

### Shared CSS presets

Presets let you reuse CSS without replacing native cards or their visual editors.
They contain CSS strings only: keep `card: true/false` explicit on each card.

#### Install a shared resource

Create `/config/www/styler-presets.js` on your Home Assistant installation:

```javascript
window.stylerPresets = {
  "area-summary": `
    #root {
      grid-template-columns: minmax(0, 1fr) max-content !important;
      align-items: stretch;
      gap: 0 !important;
      min-height: 240px;
    }
  `,
  "area-summary-badges": `
    .content {
      display: none !important;
    }
    hui-heading-badge {
      zoom: 1.75;
    }
  `,
  compact: `
    :host {
      --ha-card-border-radius: 12px;
    }
  `,
}

window.dispatchEvent(new Event("styler-presets-changed"))
```

Register `/local/styler-presets.js` as an additional Lovelace **JavaScript module**
resource (Settings → Dashboards → Resources, with advanced mode enabled).
For YAML-managed resources:

```yaml
resources:
  - url: /local/styler-presets.js
    type: module
```

Keep the Styler resource registered too. Either resource load order works, provided
the presets resource dispatches the event after assigning the registry. The registry
is shared across dashboards in the same browser page; no backend integration or
presets in dashboard YAML are needed.

#### Use presets on cards

Use one name:

```yaml
type: grid
columns: 2
styler:
  card: true
  preset: area-summary
cards: ...
```

Or an ordered list, with optional local CSS overrides:

```yaml
styler:
  preset:
    - area-summary
    - compact
  style: |
    :host {
      --room-icon-size: 100px;
    }
```

CSS is composed in this order: Styler's card CSS when `card: true`, then the named
presets in list order, then local `style`. Normal CSS specificity and `!important`
still apply. Existing Tile customization is preserved.

On modern browsers, Styler appends its own constructed stylesheet after the
component's adopted stylesheets. Equal-specificity rules therefore override the
component defaults without `!important`; more-specific selectors, inline styles,
and existing `!important` declarations still follow normal cascade rules.
Browsers without constructed stylesheet support use a regular `<style>` element.
CSS containing `@import` also uses that compatibility path, since constructed
stylesheets do not support imports. On that path, adopted component stylesheets
still come after Styler's CSS, so equal-specificity overrides may need stronger
selectors or `!important`.

Presets are inserted into the **same component shadow root** as local `styler.style`.
Selectors cannot cross nested shadow roots, and parent presets are not automatically
applied to children. For example, reference `area-summary` on the grid and
`area-summary-badges` on its heading card separately. Existing parent `card`
inheritance is unchanged.

There is no variable substitution, YAML/card templating, or automatic nested-component
targeting. Use CSS custom properties and local CSS for per-room differences.
Unknown names and non-string definitions are skipped with console warnings; valid
presets and local CSS still work. Identical warnings are shared across cards and
suppressed until the next change event or a minute has elapsed; expiry is checked
when another warning occurs, without a background timer. An absent registry is fine
when no presets are used.

#### Updating presets

The resource can replace `window.stylerPresets` or edit individual entries. Dispatch
`styler-presets-changed` afterward to refresh mounted cards, including presets that
were previously missing. Deleting a definition and dispatching the event removes
its CSS while retaining other presets and local styles.

```javascript
window.stylerPresets.compact = ":host { --ha-card-border-radius: 8px; }"
window.dispatchEvent(new Event("styler-presets-changed"))
```

Editing the resource **file** does not execute it again in an already-open browser.
Refresh the page after file edits; if cached, clear the cache or change the resource
URL, for example `/local/styler-presets.js?v=2`. The event handles late resource
execution and intentional runtime changes, not file watching.

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
