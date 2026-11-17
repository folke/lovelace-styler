import type { LitElement } from "lit"
import "./editor"

import { Patcher, isReactiveController } from "./patch"
import { getStylesCSS } from "./compat"
import { getStylerConfig, observeConfig, patchSetConfig } from "./config"
import { getPresetCSS } from "./presets"
import { applyCSS } from "./styles"
import { suppressCard } from "./suppression"
import type { Card, StylerConfig } from "./types"
import { getTileCardCSS } from "./tile"

let CARD_CSS = ""
const connected = new Map<Card, () => void>()

function parent(node: Node): Node | null {
  return (
    (node as Element).assignedSlot ?? (node instanceof ShadowRoot ? node.host : node.parentNode)
  )
}

function inheritedCard(card: Card): boolean | undefined {
  for (let node = parent(card); node; node = parent(node)) {
    const value = getStylerConfig(node)?.card
    if (value !== undefined) return value
  }
}

function refreshDescendants(ancestor: Card) {
  // Configuration changes are rare; ordinary hass updates never walk descendants.
  for (const [card, refresh] of connected) {
    for (let node = parent(card); node; node = parent(node)) {
      if (node === ancestor) {
        refresh()
        break
      }
    }
  }
}

function isPreview(node: Node): boolean {
  for (let current: Node | null = node; current; current = parent(current)) {
    if ((current as Element).tagName === "HUI-CARD-PREVIEW") return true
  }
  return false
}

function applyStyles(card: Card, config: StylerConfig | undefined) {
  const state = (card._styler ??= {})
  state.card = config?.card
  state.preset = config?.preset
  state.style = config?.style
  state.animation = config?.animation
  state.parent_card = inheritedCard(card)
  const css: string[] = []
  if (state.card) css.push(CARD_CSS)
  css.push(...getPresetCSS(state.preset))
  if (state.style) css.push(state.style)
  if (card.tagName === "HUI-TILE-CARD") css.push(...getTileCardCSS(state.animation))
  applyCSS(card.shadowRoot, state, css.length ? css.join("\n") : undefined)

  if (card.tagName === "HA-CARD") {
    suppressCard(card, state.card === false || state.parent_card !== undefined)
  }
}

function attach(re: HTMLElement) {
  const card = re as Card
  if (!isReactiveController(card)) return

  // Lit initializers run before subclass fields, so config getters are not safe yet.
  let config: StylerConfig | undefined
  let cardOption: boolean | undefined
  let dirty = true
  let listening = false
  let previousParent: Node | null
  const refresh = () => {
    dirty = true
    card.requestUpdate()
  }
  observeConfig(card, refresh)
  card.addController({
    hostConnected() {
      patchSetConfig(card)
      connected.set(card, refresh)
      refresh()
    },
    hostDisconnected() {
      connected.delete(card)
      if (listening) window.removeEventListener("styler-presets-changed", refresh)
      listening = false
    },
    hostUpdated() {
      if (!card.isConnected) return
      const nextConfig = getStylerConfig(card)
      const preset = nextConfig?.preset
      const usesPresets = typeof preset === "string" || (Array.isArray(preset) && preset.length > 0)
      if (usesPresets !== listening) {
        if (usesPresets) window.addEventListener("styler-presets-changed", refresh)
        else window.removeEventListener("styler-presets-changed", refresh)
        listening = usesPresets
      }

      const nextCardOption = nextConfig?.card
      const nextParent = parent(card)
      const cardChanged = cardOption !== nextCardOption
      if (
        dirty ||
        config !== nextConfig ||
        cardChanged ||
        previousParent !== nextParent ||
        (card.editMode && isPreview(card))
      ) {
        applyStyles(card, nextConfig)
        dirty = false
      }
      config = nextConfig
      cardOption = nextCardOption
      previousParent = nextParent
      if (cardChanged) refreshDescendants(card)
    },
  })
  card.requestUpdate()
}

void customElements.whenDefined("ha-card").then((el) => {
  CARD_CSS = getStylesCSS((el as typeof LitElement).styles) + ":host{overflow:hidden}"
  new Patcher(attach)
})
