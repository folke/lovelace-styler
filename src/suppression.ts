type Declaration = [name: string, value: string, priority: string]

const properties = ["border", "box-shadow", "background"] as const
const suppressed = new WeakMap<
  HTMLElement,
  Map<string, { before: Declaration[]; applied: string }>
>()

function declarations(style: CSSStyleDeclaration, property: string): Declaration[] {
  return Array.from(style)
    .filter(
      (name) =>
        (name === property || name.startsWith(`${property}-`)) &&
        !name.endsWith("-radius") &&
        name !== "background-blend-mode"
    )
    .map((name) => [name, style.getPropertyValue(name), style.getPropertyPriority(name)])
}

export function suppressCard(card: HTMLElement, suppress: boolean) {
  const saved = suppressed.get(card)
  if (suppress) {
    if (saved) return
    const changes = new Map<string, { before: Declaration[]; applied: string }>()
    for (const property of properties) {
      // Preserve individual longhands too: setting a shorthand can erase them.
      const before = declarations(card.style, property)
      card.style.setProperty(property, "none")
      changes.set(property, {
        before,
        applied: JSON.stringify(declarations(card.style, property)),
      })
    }
    suppressed.set(card, changes)
  } else if (saved) {
    for (const [property, { before, applied }] of saved) {
      const current = declarations(card.style, property)
      // Another component may have taken ownership while suppression was active.
      if (JSON.stringify(current) !== applied) continue
      for (const [name] of current) card.style.removeProperty(name)
      for (const [name, value, priority] of before) card.style.setProperty(name, value, priority)
    }
    suppressed.delete(card)
  }
}
