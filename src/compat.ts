export function getCustomElements(): CustomElementConstructor[] {
  // HA's scoped-registry polyfill exposes no public enumeration API.
  const names = Object.values(customElements)
    .filter((value): value is Map<unknown, unknown> => value instanceof Map)
    .flatMap((map) => [...map.keys()].filter((name): name is string => typeof name === "string"))
  return [...new Set(names)]
    .map((name) => customElements.get(name))
    .filter(
      (constructor): constructor is CustomElementConstructor => typeof constructor === "function"
    )
}

export function getStylesCSS(styles: unknown): string {
  if (Array.isArray(styles)) return styles.map(getStylesCSS).join("\n")
  if (styles && typeof styles === "object" && "cssText" in styles) {
    return typeof styles.cssText === "string" ? styles.cssText : ""
  }
  if (typeof CSSStyleSheet !== "undefined" && styles instanceof CSSStyleSheet) {
    return Array.from(styles.cssRules, (rule) => rule.cssText).join("\n")
  }
  return ""
}
