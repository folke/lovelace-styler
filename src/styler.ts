import type { CSSResult, LitElement } from "lit"
import "./editor"

import { Patcher, isReactiveController } from "./patch"
import { getPresetCSS } from "./presets"
import type { Card, StylerConfig, StylerState, TileCard } from "./types"
import { getTileCardCSS } from "./tile"

let CARD_CSS = ""

// Check if we need to apply styles to the element or any of its ancestors
// This function will be called only once per element
function getState(node?: Node): StylerState | undefined {
  if (!node) return

  const card = node as Card

  const parentNode =
    node instanceof ShadowRoot ? node.host : (node.parentElement ?? node.parentNode ?? undefined)
  const parentState = getState(parentNode)

  return {
    ...card._config?.styler,
    styleEl: card._styler?.styleEl,
    parent_card: parentState?.card ?? parentState?.parent_card,
  }
}

// Check if the element is in preview mode
function isPreview(node?: Node): boolean {
  if (!node) return false

  const card = node as Card

  if (card.tagName == "HUI-CARD-PREVIEW") return true

  const parentNode =
    node instanceof ShadowRoot ? node.host : (node.parentElement ?? node.parentNode ?? undefined)
  return isPreview(parentNode)
}

function applyStyles(card: Card, force: boolean) {
  const isPreviewMode = card.editMode && isPreview(card)

  if (!force && card._styler && !isPreviewMode) return

  const state = (card._styler = getState(card))

  if (!state) return

  const css: string[] = []

  // Should we style this as a card?
  if (state.card) {
    css.push(CARD_CSS)
  }

  css.push(...getPresetCSS(state.preset))

  // Do we have any custom styles to apply?
  if (state.style) css.push(state.style)

  if (card.tagName.toLowerCase() == "hui-tile-card") {
    css.push(...getTileCardCSS(card as TileCard))
  }

  const cssText = css.length ? css.join("\n") : undefined

  if (cssText) {
    state.styleEl ??= document.createElement("style")
    if (state.styleEl.innerHTML !== cssText) state.styleEl.innerHTML = cssText
    if (state.styleEl.parentNode !== card.shadowRoot) {
      state.styleEl.remove()
      card.shadowRoot?.appendChild(state.styleEl)
    }
  } else if (state.styleEl) {
    state.styleEl.remove()
    state.styleEl = undefined
  }

  if (isPreviewMode && card.style) {
    if (card.style.border == "none") card.style.border = ""
    if (card.style.boxShadow == "none") card.style.boxShadow = ""
    if (card.style.background == "none") card.style.background = ""
  }

  // Remove the card styles if either:
  // - the parent is styled as a card
  // - the parent doesn't want to be styled as a card
  // - the card itself doesn't want to be styled as a card
  if (
    card.tagName == "HA-CARD" &&
    (state.card === false || state.parent_card || state.parent_card === false)
  ) {
    card.style.border = "none"
    card.style.boxShadow = "none"
    card.style.background = "none"
  }
}

function attach(re: HTMLElement) {
  const card = re as Card

  if (isReactiveController(card)) {
    // Lit initializers run before subclass fields, so config getters are not safe yet.
    let config: StylerConfig | undefined
    let presetsChanged = false
    let usesPresets = false
    let listening = false
    const refreshPresets = () => {
      presetsChanged = true
      card.requestUpdate()
    }
    card.addController({
      hostConnected() {
        // Catch registry changes made while a preset-using card was disconnected.
        if (usesPresets) refreshPresets()
      },
      hostDisconnected() {
        if (!listening) return
        window.removeEventListener("styler-presets-changed", refreshPresets)
        listening = false
      },
      hostUpdated() {
        const nextConfig = card._config?.styler
        const preset = nextConfig?.preset
        usesPresets = typeof preset === "string" || (Array.isArray(preset) && preset.length > 0)
        const shouldListen = card.isConnected && usesPresets
        if (shouldListen !== listening) {
          if (shouldListen) {
            window.addEventListener("styler-presets-changed", refreshPresets)
          } else {
            window.removeEventListener("styler-presets-changed", refreshPresets)
          }
          listening = shouldListen
        }
        applyStyles(card, config !== nextConfig || presetsChanged)
        config = nextConfig
        presetsChanged = false
      },
    })
    card.requestUpdate()
  }
}

void customElements.whenDefined("ha-card").then((el) => {
  const card = el as typeof LitElement
  // Store the original styles for an ha-card
  CARD_CSS = (card.styles as CSSResult).cssText
  CARD_CSS += ":host{overflow:hidden}"
  new Patcher(attach)
})
