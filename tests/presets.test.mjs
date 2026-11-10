import assert from "node:assert/strict"
import { afterEach, test } from "node:test"
import { ReactiveElement } from "lit"

// Exercise the built plugin with real Lit initializers and updates. Only the DOM
// surface used by Styler is stubbed; this is not a browser rendering test.
class Element {}
class ShadowRoot {
  children = []
  constructor(host) {
    this.host = host
  }
  appendChild(el) {
    el.remove()
    this.children.push(el)
    el.parentNode = this
  }
}
class StyleElement {
  innerHTML = ""
  parentNode = null
  remove() {
    if (!this.parentNode) return
    const children = this.parentNode.children
    children.splice(children.indexOf(this), 1)
    this.parentNode = null
  }
}
class Window extends EventTarget {
  listeners = new Set()
  addEventListener(type, listener, options) {
    if (type === "styler-presets-changed") this.listeners.add(listener)
    super.addEventListener(type, listener, options)
  }
  removeEventListener(type, listener, options) {
    if (type === "styler-presets-changed") this.listeners.delete(listener)
    super.removeEventListener(type, listener, options)
  }
}
Object.assign(globalThis, {
  Element,
  HTMLElement: class extends Element {},
  ShadowRoot,
  window: new Window(),
  document: {
    body: Object.assign(new Element(), { children: [] }),
    createElement: () => new StyleElement(),
  },
})
const registry = new Map()
const configEditor = {
  setConfig(config) {
    this.received = config
  },
}
class Editor {
  _configElement = configEditor
  async getConfigElement() {
    return configEditor
  }
  _handleUIConfigChanged(event) {
    this.received = event.detail.config
  }
}
Object.assign(globalThis, {
  customElements: {
    l: registry,
    get: (name) => registry.get(name),
    define: (name, klass) => registry.set(name, klass),
    whenDefined: (name) =>
      Promise.resolve(name === "ha-card" ? { styles: { cssText: "/* card CSS */" } } : Editor),
  },
})
window.stylerPresets = { early: "/* loaded before Styler */" }
await import("../dist/styler.js")
await Promise.resolve()

class Card extends ReactiveElement {
  constructor(config = {}, tagName = "TEST-CARD", parent = null) {
    super()
    this._controller = { config }
    this._tagName = tagName
    this._parent = parent
    this._root = new ShadowRoot(this)
    this.style = { border: "", boxShadow: "", background: "" }
    this.updatesRequested = 0
  }
  get _config() {
    // Like Advanced Camera Card: accessing config during super() must throw.
    return this._controller.config
  }
  set _config(config) {
    this._controller.config = config
  }
  get tagName() {
    return this._tagName
  }
  get parentNode() {
    return this._parent
  }
  get parentElement() {
    return null
  }
  get shadowRoot() {
    return this._root
  }
  get isConnected() {
    return this.connected ?? false
  }
  createRenderRoot() {
    return this._root
  }
  requestUpdate(...args) {
    this.updatesRequested = (this.updatesRequested ?? 0) + 1
    return super.requestUpdate(...args)
  }
  connect() {
    this.connected = true
    this.connectedCallback()
    return this.updateComplete
  }
  disconnect() {
    this.connected = false
    this.disconnectedCallback()
  }
  get css() {
    return this._styler?.styleEl?.innerHTML
  }
}
customElements.define("test-card", Card)
const cards = []
async function mount(config = {}, tagName, parent) {
  const card = new Card(config, tagName, parent)
  cards.push(card)
  await card.connect()
  return card
}
async function notify() {
  window.dispatchEvent(new Event("styler-presets-changed"))
  await Promise.all(cards.filter((card) => card.isConnected).map((card) => card.updateComplete))
}
afterEach(() => {
  for (const card of cards) card.disconnect()
  cards.length = 0
  assert.equal(window.listeners.size, 0, "all card listeners must be removed")
  delete window.stylerPresets
})

test("resource loaded before Styler is available on first render", async () => {
  const card = await mount({ styler: { preset: "early" } })
  assert.equal(card.css, "/* loaded before Styler */")
})

test("no preset preserves existing card, local, tile and background behavior", async () => {
  const empty = await mount()
  assert.equal(empty.css, undefined)
  const card = await mount({ styler: { card: true, style: "/* local */" } })
  assert.equal(card.css, "/* card CSS */:host{overflow:hidden}\n/* local */")
  const tile = await mount({ info: false, animation: "spin" }, "HUI-TILE-CARD")
  assert.match(tile.css, /ha-tile-info/)
  assert.match(tile.css, /@keyframes spin/)
  const borderless = await mount({ styler: { card: false } }, "HA-CARD")
  assert.deepEqual(borderless.style, { border: "none", boxShadow: "none", background: "none" })
})

test("multiple presets compose after card CSS and before local CSS in configured order", async () => {
  window.stylerPresets = { first: "/* first */", second: "/* second */" }
  const card = await mount({
    styler: { card: true, preset: ["second", "first"], style: "/* local */" },
  })
  assert.equal(
    card.css,
    "/* card CSS */:host{overflow:hidden}\n/* second */\n/* first */\n/* local */"
  )
  assert.equal(card.shadowRoot.children.length, 1)
})

test("a late resource updates mounted cards with unchanged configuration", async () => {
  const warning = console.warn
  console.warn = () => {}
  try {
    const config = { styler: { preset: "late", style: "/* local */" } }
    const card = await mount(config)
    assert.equal(card.css, "/* local */")
    window.stylerPresets = { late: "/* late */" }
    await notify()
    assert.equal(card._config, config)
    assert.equal(card.css, "/* late */\n/* local */")
  } finally {
    console.warn = warning
  }
})

test("registry replacement, in-place edits, and removals refresh existing CSS", async () => {
  window.stylerPresets = { shared: "/* original */" }
  const card = await mount({ styler: { preset: "shared", style: "/* local */" } })
  window.stylerPresets = { shared: "/* replaced */" }
  await notify()
  assert.equal(card.css, "/* replaced */\n/* local */")
  window.stylerPresets.shared = "/* edited */"
  await notify()
  assert.equal(card.css, "/* edited */\n/* local */")
  const warning = console.warn
  console.warn = () => {}
  try {
    delete window.stylerPresets.shared
    await notify()
    assert.equal(card.css, "/* local */")
    card._config = { styler: { preset: [] } }
    card.requestUpdate()
    await card.updateComplete
    assert.equal(card.css, undefined)
    assert.equal(card.shadowRoot.children.length, 0)
  } finally {
    console.warn = warning
  }
})

test("removing a preset-only definition removes its style element", async () => {
  window.stylerPresets = { shared: "/* shared */" }
  const card = await mount({ styler: { preset: "shared" } })
  const style = card._styler.styleEl
  const warning = console.warn
  console.warn = () => {}
  try {
    delete window.stylerPresets
    await notify()
    assert.equal(card.css, undefined)
    assert.equal(style.parentNode, null)
    assert.equal(card.shadowRoot.children.length, 0)
  } finally {
    console.warn = warning
  }
})

test("invalid and inherited definitions warn once per card without discarding valid CSS", async () => {
  const messages = []
  const warning = console.warn
  console.warn = (message) => messages.push(message)
  try {
    window.stylerPresets = Object.assign(Object.create({ inherited: "/* forbidden */" }), {
      valid: "/* valid */",
      bad: 42,
    })
    const card = await mount({
      styler: {
        preset: ["missing", "inherited", "toString", "__proto__", "bad", null, "valid"],
        style: "/* local */",
      },
    })
    assert.equal(card.css, "/* valid */\n/* local */")
    assert.equal(messages.length, 6)
    assert.ok(messages.some((message) => message.includes('Unknown preset "missing"')))
    assert.ok(messages.some((message) => message.includes('Preset "bad" must be a CSS string')))
    await notify()
    card.requestUpdate()
    await card.updateComplete
    assert.equal(messages.length, 6)
    window.stylerPresets.missing = "/* now present */"
    await notify()
    assert.match(card.css, /^\/\* now present \*\//)
    window.stylerPresets = "not a registry"
    await notify()
    assert.equal(card.css, "/* local */")
    assert.match(messages.at(-1), /must be an object/)
    await notify()
    assert.equal(messages.length, 7)
    card._config = { styler: { preset: 42, style: "/* local */" } }
    card.requestUpdate()
    await card.updateComplete
    assert.equal(card.css, "/* local */")
    assert.match(messages.at(-1), /must be a name or an array/)
  } finally {
    console.warn = warning
  }
})

test("parent presets stay scoped while parent card inheritance is preserved", async () => {
  window.stylerPresets = { parent: "/* parent */", child: "/* child */" }
  const parent = await mount({ styler: { card: true, preset: "parent" } })
  const child = await mount({ styler: { preset: "child" } }, "HA-CARD", parent.shadowRoot)
  assert.equal(child.css, "/* child */")
  assert.equal(child.style.border, "none")
  window.stylerPresets.parent = "/* changed parent */"
  window.stylerPresets.child = "/* changed child */"
  await notify()
  assert.equal(child.css, "/* changed child */")
  assert.match(parent.css, /changed parent/)
  const dynamic = await mount({ styler: { preset: "child" } }, "TEST-CARD", parent.shadowRoot)
  assert.equal(dynamic.css, "/* changed child */")
})

test("preview updates retain preset order and do not duplicate styles", async () => {
  window.stylerPresets = { shared: "/* shared */" }
  const preview = await mount({}, "HUI-CARD-PREVIEW")
  const card = await mount({ styler: { preset: "shared" } }, "TEST-CARD", preview.shadowRoot)
  card.editMode = true
  card._config = { styler: { preset: "shared", style: "/* preview */" } }
  card.requestUpdate()
  await card.updateComplete
  assert.equal(card.css, "/* shared */\n/* preview */")
  await notify()
  assert.equal(card.shadowRoot.children.length, 1)
})

test("disconnect cleans up listeners and reconnect refreshes missed registry changes", async () => {
  window.stylerPresets = { shared: "/* before */" }
  const card = await mount({ styler: { preset: "shared" } })
  assert.equal(window.listeners.size, 1)
  card.disconnect()
  assert.equal(window.listeners.size, 0)
  const requests = card.updatesRequested
  window.stylerPresets.shared = "/* while disconnected */"
  await notify()
  assert.equal(card.updatesRequested, requests)
  assert.equal(card.css, "/* before */")
  await card.connect()
  assert.equal(window.listeners.size, 1)
  assert.equal(card.css, "/* while disconnected */")
  card.disconnect()
  await card.connect()
  assert.equal(window.listeners.size, 1)
})

test("visual editor round trip preserves preset configuration", async () => {
  const editor = new Editor()
  const element = await editor.getConfigElement()
  const styler = { preset: ["shared", "compact"], card: true, style: "/* local */" }
  element.setConfig({ type: "grid", styler, columns: 2 })
  assert.equal(element.received.styler, undefined)
  editor._handleUIConfigChanged({ detail: { config: { type: "grid", columns: 3 } } })
  assert.deepEqual(editor.received.styler, styler)
  assert.equal(editor.received.columns, 3)
})
