import type { CSSResult, LitElement, ReactiveElement } from "lit"

type StylerConfig = {
  card?: boolean
  style?: string
  size?: number
}

type StylerState = StylerConfig & { parent_card?: boolean }

type StylerElement = LitElement & {
  config?: { styler?: StylerConfig }
  _config?: { styler?: StylerConfig }
  _styler?: StylerState
  getCardSize?: () => number | undefined
}

const VERSION = "1.4.0" // x-release-please-version
let CARD_CSS = ""

// Check if we need to apply styles to the element or any of its ancestors
// This function will be called only once per element
function check(node?: StylerElement): StylerState | undefined {
  // When this is a top-level preview card, delete any custom style child elements from the shadow root
  if (node?.parentElement?.tagName == "HUI-CARD-PREVIEW") {
    node._styler = undefined
    for (const child of node.shadowRoot?.children ?? []) {
      if (child.tagName == "STYLE") {
        child.remove()
      }
    }
  }

  if (!node || node._styler) return node?._styler

  const parent = check(
    (node instanceof ShadowRoot ? node.host : node.parentElement ?? node.parentNode) as
      | StylerElement
      | undefined
  )
  node._styler = { ...node?._config?.styler, parent_card: parent?.card ?? parent?.parent_card }
  fix(node)
  return node._styler
}

function fix(node: StylerElement) {
  const config = node._styler
  if (!config) return

  // Should we style this as a card?
  if (config.card) {
    const styleElement = document.createElement("style")
    styleElement.innerHTML = CARD_CSS
    node.shadowRoot?.appendChild(styleElement)
  }

  // Do we have any custom styles to apply?
  if (config.style) {
    const styleElement = document.createElement("style")
    styleElement.innerHTML = config.style
    node.shadowRoot?.appendChild(styleElement)
  }

  // Remove the card styles if any ancestor is a card
  if (node.tagName == "HA-CARD" && (config.card === false || config.parent_card)) {
    node.style.transition = "none"
    node.style.border = "none"
    node.style.boxShadow = "none"
    node.style.background = "none"
    // node.style.transition = '';
  }
}

void customElements.whenDefined("ha-card").then((el) => {
  const card = el as typeof LitElement

  // Store the original styles for an ha-card
  CARD_CSS = (card.styles as CSSResult).cssText
  CARD_CSS += ":host{overflow:hidden}"

  // Get the LitElement class used by Home Assistant
  const Lit = Object.getPrototypeOf(card) as typeof LitElement

  // Add a new initializer to the LitElement class
  Lit.addInitializer((re: ReactiveElement) => {
    const el = re as StylerElement

    // Check if we need to apply any styles when the host is updated
    el.addController({
      hostUpdated() {
        check(el)
      },
    })

    // Allow overriding the card size
    const origGetCardSize = el.getCardSize
    el.getCardSize = function () {
      return this._config?.styler?.size ?? origGetCardSize?.call(el)
    }
  })
})

console.info(`%cStyler v${VERSION} is installed`, "color: blue; font-weight: bold")
