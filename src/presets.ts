import type { StylerConfig } from "./types"

const warnings = new Set<string>()
let warningsResetAt = 0

function clearWarnings() {
  warnings.clear()
  warningsResetAt = Date.now() + 60_000
}

window.addEventListener("styler-presets-changed", clearWarnings)

function warn(message: string) {
  if (Date.now() >= warningsResetAt) clearWarnings()
  if (warnings.has(message)) return
  warnings.add(message)
  console.warn(`[Styler] ${message}`)
}

export function getPresetCSS(preset: StylerConfig["preset"]): string[] {
  if (preset === undefined) return []

  if (typeof preset !== "string" && !Array.isArray(preset)) {
    warn("styler.preset must be a name or an array of names.")
    return []
  }

  const registry = window.stylerPresets ?? {}
  if (typeof registry !== "object" || Array.isArray(registry)) {
    warn("window.stylerPresets must be an object mapping preset names to CSS strings.")
    return []
  }

  const css: string[] = []
  for (const name of typeof preset === "string" ? [preset] : preset) {
    if (typeof name !== "string") {
      warn("styler.preset entries must be strings.")
    } else if (!Object.prototype.hasOwnProperty.call(registry, name)) {
      warn(`Unknown preset "${name}" in window.stylerPresets.`)
    } else if (typeof registry[name] !== "string") {
      warn(`Preset "${name}" must be a CSS string.`)
    } else {
      css.push(registry[name])
    }
  }
  return css
}
