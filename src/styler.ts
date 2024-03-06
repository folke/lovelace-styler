import type { CSSResult, LitElement } from "lit"
import "./editor"

import { Patcher, isReactiveController, override } from "./patch"
import type { CardElement, StylerState } from "./types"

let CARD_CSS = ""

// Check if we need to apply styles to the element or any of its ancestors
// This function will be called only once per element
function getState(node?: Node): StylerState | undefined {
  if (!node) return

  const card = node as CardElement

  const parentNode =
    node instanceof ShadowRoot ? node.host : node.parentElement ?? node.parentNode ?? undefined
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

  const card = node as CardElement

  if (card.tagName == "HUI-CARD-PREVIEW") return true

  const parentNode =
    node instanceof ShadowRoot ? node.host : node.parentElement ?? node.parentNode ?? undefined
  return isPreview(parentNode)
}

function applyStyles(node: CardElement, force = false) {
  const isPreviewMode = node.editMode && isPreview(node)

  if (!force && node._styler && !isPreviewMode) return

  const state = (node._styler = getState(node))

  if (!state) return

  let css: string | undefined

  // Should we style this as a card?
  if (state.card) {
    css = CARD_CSS
  }

  // Do we have any custom styles to apply?
  if (state.style) css = (css ?? "") + state.style

  if (css) {
    state.styleEl ??= document.createElement("style")
    if (state.styleEl.innerHTML !== css) state.styleEl.innerHTML = css
    if (state.styleEl.parentNode !== node.shadowRoot) {
      state.styleEl.remove()
      node.shadowRoot?.appendChild(state.styleEl)
    }
  } else if (state.styleEl) {
    state.styleEl.remove()
    state.styleEl = undefined
  }

  if (isPreviewMode && node.style) {
    if (node.style.border == "none") node.style.border = ""
    if (node.style.boxShadow == "none") node.style.boxShadow = ""
    if (node.style.background == "none") node.style.background = ""
  }

  // Remove the card styles if either:
  // - the parent is styled as a card
  // - the parent doesn't want to be styled as a card
  // - the card itself doesn't want to be styled as a card
  if (
    node.tagName == "HA-CARD" &&
    (state.card === false || state.parent_card || state.parent_card === false)
  ) {
    node.style.border = "none"
    node.style.boxShadow = "none"
    node.style.background = "none"
  }
}

function attach(re: HTMLElement) {
  const card = re as CardElement

  override(card, "getCardSize", (getCardSize) => {
    return card._config?.styler?.card_size ?? getCardSize?.()
  })

  override(card, "getGridSize", (getGridSize) => {
    return card._config?.styler?.grid_size ?? getGridSize?.()
  })

  if (isReactiveController(card)) {
    let config = card._config?.styler
    // Check if we need to apply any styles when the host is updated
    card.addController({
      hostUpdated() {
        // force the styles to be applied if the config has changed
        applyStyles(card, config !== card._config?.styler)
        config = card._config?.styler
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
