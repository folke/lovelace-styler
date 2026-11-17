import { LitElement, ReactiveElement, css, html } from "lit"

let assertions = 0
function assert(condition, message) {
  if (!condition) throw new Error(message)
  assertions++
}
async function settle(...cards) {
  for (let i = 0; i < 3; i++) await Promise.all(cards.map((card) => card.updateComplete))
}
function configure(card, config) {
  card.setConfig(config)
}

try {
  class HaCard extends ReactiveElement {
    get _config() {
      throw new Error("private getter unavailable")
    }
    setConfig(config) {
      this.config = config
      this.requestUpdate()
    }
    static styles = [
      css`
        :host {
          display: block;
          background: rgb(255, 0, 0);
        }
      `,
      [
        css`
          :host {
            border: 1px solid black;
          }
        `,
      ],
    ]
  }
  class Stack extends ReactiveElement {
    setConfig(_config) {}
  }
  const configElement = {
    setConfig(config) {
      this.received = config
    },
  }
  class Editor extends HTMLElement {
    _configElement = configElement
    async getConfigElement() {
      return configElement
    }
    _handleUIConfigChanged(event) {
      this.received = event.detail.config
    }
  }
  customElements.define("ha-card", HaCard)
  customElements.define("test-stack", Stack)
  customElements.define("hui-card-element-editor", Editor)

  // No private registry fields: existing DOM must still be attached, and future
  // definitions must still be intercepted with the native CustomElementRegistry.
  const stack = new Stack()
  document.body.append(stack)
  await stack.updateComplete
  const card = new HaCard()
  card.setConfig({ styler: { style: ":host { color: rgb(0, 0, 255); }" } })
  stack.shadowRoot.append(card)
  await card.updateComplete
  await import("/dist/styler.js")
  await settle(stack, card)
  assert(!!card._styler, "existing native-registry card was attached")
  assert(
    getComputedStyle(card).color === "rgb(0, 0, 255)",
    "preloaded public config fallback works"
  )

  configure(stack, { styler: { card: true } })
  await settle(stack, card)
  assert(getComputedStyle(stack).backgroundColor === "rgb(255, 0, 0)", "nested Lit styles copied")
  assert(getComputedStyle(stack).borderTopWidth === "1px", "nested Lit style order preserved")
  assert(getComputedStyle(card).backgroundColor === "rgba(0, 0, 0, 0)", "descendant suppressed")
  configure(stack, {})
  await settle(stack, card)
  assert(
    getComputedStyle(card).backgroundColor === "rgb(255, 0, 0)",
    "ancestor removal restores native CSS"
  )

  card.style.setProperty("border-left-width", "7px", "important")
  card.style.setProperty("background-color", "purple", "important")
  configure(card, { styler: { card: false } })
  await settle(card)
  card.style.borderRadius = "12px"
  card.style.backgroundBlendMode = "multiply"
  configure(card, {})
  await settle(card)
  assert(
    card.style.getPropertyValue("border-left-width") === "7px",
    "original border longhand restored"
  )
  assert(
    card.style.getPropertyPriority("border-left-width") === "important",
    "original priority restored"
  )
  assert(
    getComputedStyle(card).backgroundColor === "rgb(128, 0, 128)",
    "original background restored"
  )
  assert(card.style.borderRadius === "12px", "unrelated border radius preserved")
  assert(card.style.backgroundBlendMode === "multiply", "unrelated background blending preserved")

  configure(card, { styler: { card: false } })
  await settle(card)
  card.style.setProperty("background", "green", "important")
  configure(card, {})
  await settle(card)
  assert(
    getComputedStyle(card).backgroundColor === "rgb(0, 128, 0)",
    "later external styles preserved"
  )

  configure(stack, { styler: { card: true } })
  await settle(stack, card)
  document.body.append(card)
  await settle(card)
  assert(card._styler.parent_card === undefined, "reparenting refreshes inherited state")
  assert(card.style.background === "green", "reparenting restores owned inline styling")

  class Tile extends ReactiveElement {
    setConfig(_config) {}
    createRenderRoot() {
      const root = super.createRenderRoot()
      root.innerHTML =
        '<ha-tile-icon data-state="on"><ha-state-icon></ha-state-icon></ha-tile-icon>'
      return root
    }
  }
  customElements.define("hui-tile-card", Tile)
  const tile = new Tile()
  configure(tile, { styler: { animation: "spin" } })
  document.body.append(tile)
  await settle(tile)
  const icon = tile.shadowRoot.querySelector("ha-state-icon")
  assert(getComputedStyle(icon).animationName === "spin", "newly registered Lit card is patched")
  const sheet = tile._styler.styleSheet
  assert(tile.shadowRoot.adoptedStyleSheets.includes(sheet), "constructed sheet adopted")
  tile.requestUpdate()
  await settle(tile)
  assert(tile._styler.styleSheet === sheet, "unchanged sheet reused")
  const tileConfig = { styler: { animation: "pulse" } }
  configure(tile, tileConfig)
  await settle(tile)
  assert(
    getComputedStyle(icon.parentElement).animationName === "pulse",
    "captured config works without storage"
  )
  tileConfig.styler.animation = "fade"
  configure(tile, tileConfig)
  await settle(tile)
  assert(getComputedStyle(icon).animationName === "none", "old animation removed")
  assert(
    getComputedStyle(icon.parentElement).animationName === "fade",
    "replacement animation applied"
  )
  configure(tile, {})
  await settle(tile)
  assert(
    !tile.shadowRoot.adoptedStyleSheets.includes(sheet),
    "removed animation releases stylesheet"
  )

  // CSS containing @import must use the DOM fallback rather than replaceSync.
  configure(tile, {
    styler: { style: '@import url("data:text/css,"); :host { color: rgb(0, 0, 255); }' },
  })
  await settle(tile)
  assert(!!tile._styler.styleEl, "import CSS uses DOM fallback")
  assert(getComputedStyle(tile).color === "rgb(0, 0, 255)", "fallback CSS renders")

  class HeadingWrapper extends ReactiveElement {
    createRenderRoot() {
      return this
    }
  }
  class EntityHeadingBadge extends LitElement {
    static properties = { entityState: {}, iconVisible: {} }
    constructor() {
      super()
      this.entityState = "off"
      this.iconVisible = true
    }
    setConfig(_config) {}
    render() {
      return html`<ha-heading-badge>
        ${
          this.iconVisible
            ? html`<ha-state-icon
                slot="icon"
                .stateObj=${{ state: this.entityState }}
              ></ha-state-icon>`
            : null
        }
        <span id="state">${this.entityState}</span>
      </ha-heading-badge>`
    }
  }
  customElements.define("hui-heading-badge", HeadingWrapper)
  customElements.define("hui-entity-heading-badge", EntityHeadingBadge)
  const wrapper = new HeadingWrapper()
  const badge = new EntityHeadingBadge()
  wrapper.append(badge)
  document.body.append(wrapper)
  await settle(wrapper, badge)
  for (const animation of ["spin", "pulse", "fade"]) {
    configure(badge, { styler: { animation } })
    await settle(badge)
    const badgeSheet = badge._styler.styleSheet
    for (const state of ["off", "on", "unavailable", "unknown", "playing", "on"]) {
      badge.entityState = state
      await settle(badge)
      const badgeIcon = badge.shadowRoot.querySelector("ha-state-icon")
      assert(
        getComputedStyle(badgeIcon).animationName === (state === "on" ? animation : "none"),
        `${animation} heading badge follows ${state}`
      )
      assert(badge._styler.styleSheet === badgeSheet, "heading state change reuses stylesheet")
      assert(
        getComputedStyle(badge.shadowRoot.querySelector("#state")).animationName === "none",
        "badge text does not animate"
      )
    }
  }
  badge.iconVisible = false
  await settle(badge)
  assert(!badge.hasAttribute("data-styler-active"), "missing icon disables heading animation")
  badge.iconVisible = true
  await settle(badge)
  assert(
    badge.hasAttribute("data-styler-active"),
    "returning on-state icon enables heading animation"
  )
  configure(badge, {})
  await settle(badge)
  assert(!badge.hasAttribute("data-styler-active"), "removed heading animation clears active flag")
  assert(!badge._styler.styleSheet, "removed heading animation releases stylesheet")
  configure(badge, { styler: { animation: "spin" } })
  await settle(badge)
  wrapper.remove()
  assert(!badge.hasAttribute("data-styler-active"), "disconnect clears heading animation flag")
  document.body.append(wrapper)
  await settle(wrapper, badge)
  assert(badge.hasAttribute("data-styler-active"), "reconnect refreshes heading animation flag")

  const editor = new Editor()
  await editor.getConfigElement()
  const element = await editor.getConfigElement()
  element.setConfig({ type: "tile", styler: { animation: "pulse" }, info: "native" })
  assert(
    !("styler" in element.received) && element.received.info === "native",
    "editor isolates only Styler fields"
  )
  editor._handleUIConfigChanged({ detail: { config: { type: "tile" } } })
  assert(editor.received.styler.animation === "pulse", "reused editor retains Styler settings")

  document.body.dataset.status = "passed"
  document.body.append(`Passed ${assertions} browser assertions`)
} catch (error) {
  document.body.dataset.status = "failed"
  document.body.append(error.stack ?? String(error))
}
