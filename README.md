# 🎨 Lovelace Styler

Plugin to customize the styling of Lovelace cards.

<img width="785" height="584" alt="image" src="https://github.com/user-attachments/assets/bf407310-9b7d-47bb-bf5c-9422dff3da07" />


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
  rounded: `
    :host {
      --ha-card-border-radius: 20px;
    }
  `,
  compact: `
    ha-card {
      padding: 8px;
    }
  `,
};

window.dispatchEvent(new Event("styler-presets-changed"));
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
type: tile
entity: light.kitchen
styler:
  preset: rounded
```

Or an ordered list, with optional local CSS overrides:

```yaml
styler:
  preset:
    - rounded
    - compact
  style: |
    ha-card {
      padding: 4px;
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
window.stylerPresets.compact = "ha-card { padding: 4px; }";
window.dispatchEvent(new Event("styler-presets-changed"));
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

## 🏠 Example: Room Summary with Native Cards

An oversized room icon, temperature and humidity, and a column of quick controls—all
built with Home Assistant's native **Grid**, **Area**, and **Heading** cards.
No Mushroom cards, wrapper cards, or templates required. Native visual editors
remain available, and the CSS is shared across rooms instead of repeated in YAML.

The composition has three parts:

| Card    | Preset                | Purpose                                                                                        |
| ------- | --------------------- | ---------------------------------------------------------------------------------------------- |
| Grid    | `area-summary`        | Combines the two cards into one surface, with a flexible summary and a narrow controls column. |
| Area    | `area-summary-area`   | Shows the room's name and sensors above a large, cropped area icon.                            |
| Heading | `area-summary-badges` | Hides the heading text and arranges entity badges vertically.                                  |

### 1. Add the shared presets

Add these definitions to `/config/www/styler-presets.js`, registered as a module
resource at `/local/styler-presets.js` as described [above](#install-a-shared-resource).
The spread preserves any presets already defined by other resources.

```javascript
window.stylerPresets = {
  ...window.stylerPresets,

  "area-summary": `
    #root {
      grid-template-columns: minmax(0, 1fr) max-content;
      align-items: stretch;
      gap: 0;
    }
  `,

  "area-summary-area": `
    :host {
      height: 100%;
    }

    ha-card {
      height: 100%;
      min-height: 180px;
      position: relative;
    }

    ha-tile-container {
      height: 100%;
    }

    ha-tile-info {
      position: absolute;
      top: 18px;
      left: 20px;
      right: 8px;
      z-index: 1;
    }

    ha-tile-icon {
      --area-accent: var(--tile-color);
      --tile-icon-color: var(--area-accent);
      position: absolute;
      bottom: -30px;
      left: -20px;
      margin: 0;
      padding: 0;

      display: block;
      width: 140px;
      height: 140px;
      --tile-icon-size: 140px;
      --mdc-icon-size: 90px;

      border-radius: 50%;
      background: color-mix(in srgb, var(--area-accent) 20%, transparent);
    }
  `,

  "area-summary-badges": `
    :host {
      --state-light-inactive-color: var(--grey-color);
      --state-binary_sensor-inactive-color: var(--grey-color);
    }

    ha-card {
      height: 100%;
    }

    .content {
      display: none;
    }

    .container {
      height: 100%;
      box-sizing: border-box;
      padding: 15px;
    }

    .badges {
      height: 100%;
      overflow: visible;
      max-width: none;
    }

    .badges-row {
      height: 100%;
      flex-direction: column;
      align-items: end;
      gap: 16px;
    }

    hui-heading-badge {
      zoom: 1.5;
    }
  `,
};

window.dispatchEvent(new Event("styler-presets-changed"));
```

Refresh the browser after saving the resource. These presets use modern browser
CSS and target Home Assistant's current internal card structure, which can change
between frontend versions. No `!important` is needed with Styler's adopted
stylesheet support on modern browsers.

### 2. Add a kitchen card

Paste this into a dashboard's manual card editor. Replace `kitchen` with your area
ID and the three entity IDs with your own. Set the area's icon in Home Assistant's
area settings to choose the large room icon.

```yaml
type: grid
columns: 2
square: false
cards:
  - type: area
    area: kitchen
    color: green
    alert_classes:
      - motion
      - occupancy
    sensor_classes:
      - temperature
      - humidity
    display_type: compact
    vertical: false
    features_position: bottom
    styler:
      preset: area-summary-area
  - type: heading
    badges:
      - type: entity
        entity: light.area_kitchen
        show_state: false
        show_icon: true
        color: state
        tap_action:
          action: toggle
      - type: entity
        entity: binary_sensor.kitchen_occupancy_status
        show_state: false
        show_icon: true
        color: state
        tap_action:
          action: more-info
      - type: entity
        entity: lock.side_door_lock
        show_state: false
        show_icon: true
        color: state
        tap_action:
          action: more-info
    styler:
      preset: area-summary-badges
grid_options:
  columns: 6
styler:
  card: true
  preset: area-summary
```

`card: true` gives the outer grid a card surface and suppresses nested card
backgrounds. Each child explicitly selects its own preset because CSS selectors
cannot cross shadow roots. The `grid_options` setting makes this card half-width
in a Sections view; omit or adjust it for your layout.

The Area card gets its temperature, humidity, and alerts from entities assigned
to that area. The light badge toggles your chosen light entity or group; the
occupancy and lock badges open their more-info dialogs.

### 3. Reuse it for other rooms

Duplicate only the card YAML: change the area, color, and badge entities. Keep the
same three presets. Add or remove badges through the Heading card's visual editor;
keep the Area card in compact, horizontal mode for this layout.

For a taller room card, append local CSS to the **Area** card's Styler config:

```yaml
styler:
  preset: area-summary-area
  style: |
    ha-card {
      min-height: 220px;
    }
```

Local CSS follows the shared preset, so this changes just that room. Edits to the
shared resource update the common design for every room after a browser refresh.

## 🔥 Contributing

Requires Node.js 22.12+ and pnpm (version pinned in `package.json`).

```sh
pnpm install
pnpm lint
pnpm check
pnpm format:check
pnpm test # builds the plugin and runs regression tests
```

Use `pnpm lint:fix` and `pnpm format` to apply fixes.
