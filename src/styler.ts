import type { CSSResult, ReactiveElement, LitElement } from "lit"

type StylerConfig = {
  card?: boolean
  style?: string
  size?: number
}

type StylerState = StylerConfig & {
  parent_card?: boolean
  preview?: boolean
  styleElement?: HTMLStyleElement
}

type StylerElement = LitElement & {
  config?: { styler?: StylerConfig }
  _config?: { styler?: StylerConfig }
  _styler?: StylerState
  getCardSize?: () => number | undefined
}

const VERSION = "1.4.1" // x-release-please-version
let CARD_CSS = ""

// Check if we need to apply styles to the element or any of its ancestors
// This function will be called only once per element
function check(node?: StylerElement): StylerState | undefined {
  // Only re-apply styles if this is a new element, or we're in preview mode
  if (!node || (node._styler && !node._styler.preview)) return node?._styler

  const parent = check(
    (node instanceof ShadowRoot ? node.host : node.parentElement ?? node.parentNode) as
      | StylerElement
      | undefined
  )
  node._styler = {
    ...node._styler,
    ...node?._config?.styler,
    parent_card: parent?.card ?? parent?.parent_card,
    preview: node?.tagName == "HUI-CARD-PREVIEW" || parent?.preview,
  }
  fix(node)
  return node._styler
}

function fix(node: StylerElement) {
  const config = node._styler
  if (!config) return

  let css: string | undefined

  // Should we style this as a card?
  if (config.card) css = CARD_CSS

  // Do we have any custom styles to apply?
  if (config.style) css = (css ?? "") + config.style

  if (css) {
    config.styleElement ??= document.createElement("style")
    if (config.styleElement.innerHTML !== css) config.styleElement.innerHTML = css
    if (config.styleElement.parentNode !== node.shadowRoot) {
      config.styleElement.remove()
      node.shadowRoot?.appendChild(config.styleElement)
    }
  } else if (config.styleElement) {
    config.styleElement.remove()
    config.styleElement = undefined
  }

  if (config.preview && node.style) {
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
    (config.card === false || config.parent_card || config.parent_card === false)
  ) {
    node.style.border = "none"
    node.style.boxShadow = "none"
    node.style.background = "none"
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
