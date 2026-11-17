export function getCustomElements(): CustomElementConstructor[] {
  // HA's scoped-registry polyfill exposes no public enumeration API.
  const registry = customElements as CustomElementRegistry & { l?: unknown; h?: unknown }
  for (const candidate of [registry.l, registry.h]) {
    if (!(candidate instanceof Map)) continue
    return [...candidate.keys()]
      .filter((name): name is string => typeof name === "string")
      .map((name) => customElements.get(name))
      .filter(
        (constructor): constructor is CustomElementConstructor => typeof constructor === "function"
      )
  }
  return []
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
