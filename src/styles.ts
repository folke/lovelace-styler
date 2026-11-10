import type { StylerState } from "./types"

function removeSheet(state: StylerState) {
  if (state.styleSheet && state.styleRoot) {
    state.styleRoot.adoptedStyleSheets = state.styleRoot.adoptedStyleSheets.filter(
      (sheet) => sheet !== state.styleSheet
    )
  }
  state.styleSheet = undefined
  state.styleRoot = undefined
  state.cssText = undefined
}

export function applyCSS(root: ShadowRoot | null, state: StylerState, cssText?: string) {
  if (
    root &&
    cssText &&
    "adoptedStyleSheets" in root &&
    typeof CSSStyleSheet !== "undefined" &&
    "replaceSync" in CSSStyleSheet.prototype &&
    // Constructed sheets discard @import rules. Keep those on the DOM path.
    !/@import\b/i.test(cssText)
  ) {
    if (state.styleRoot !== root) removeSheet(state)
    state.styleSheet ??= new CSSStyleSheet()
    if (state.cssText !== cssText) {
      state.styleSheet.replaceSync(cssText)
      state.cssText = cssText
    }
    state.styleEl?.remove()
    state.styleEl = undefined

    const sheets = root.adoptedStyleSheets
    // Adopted sheets follow DOM styles; ours must also follow Lit's adopted sheets.
    if (sheets[sheets.length - 1] !== state.styleSheet) {
      root.adoptedStyleSheets = [
        ...sheets.filter((sheet) => sheet !== state.styleSheet),
        state.styleSheet,
      ]
    }
    state.styleRoot = root
    return
  }

  removeSheet(state)
  if (root && cssText) {
    state.styleEl ??= document.createElement("style")
    if (state.styleEl.textContent !== cssText) state.styleEl.textContent = cssText
    if (state.styleEl.parentNode !== root) root.appendChild(state.styleEl)
  } else {
    state.styleEl?.remove()
    state.styleEl = undefined
  }
}
