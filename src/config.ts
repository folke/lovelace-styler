import type { StylerConfig } from "./types"

type Config = { styler?: StylerConfig }
type SetConfig = (this: object, config: Config, ...args: unknown[]) => unknown

const configurations = new WeakMap<object, StylerConfig | undefined>()
const refreshers = new WeakMap<object, () => void>()
const wrappers = new WeakSet<SetConfig>()
const configuring = new WeakSet<object>()

export function getStylerConfig(element: object): StylerConfig | undefined {
  if (configurations.has(element)) return configurations.get(element)
  // Older cards may already be configured. Their private getters are not reliable.
  for (const key of ["_config", "config"] as const) {
    try {
      const config = (element as { _config?: Config; config?: Config })[key]
      const styler = config?.styler
      if (styler != null) return styler
    } catch {
      // An unavailable private getter must not prevent trying the public fallback.
    }
  }
}

export function patchSetConfig(target: object) {
  let original: SetConfig | undefined
  try {
    original = (target as { setConfig?: SetConfig }).setConfig
  } catch {
    return
  }
  if (typeof original !== "function" || wrappers.has(original)) return
  const method = original
  const wrapped: SetConfig = function (config, ...args) {
    // A subclass may call an already-wrapped super.setConfig(). Only the outer
    // successful call owns the capture, including when the subclass throws.
    if (configuring.has(this)) return method.call(this, config, ...args)
    const styler = config?.styler
    configuring.add(this)
    try {
      const result = method.call(this, config, ...args)
      configurations.set(this, styler)
      refreshers.get(this)?.()
      return result
    } finally {
      configuring.delete(this)
    }
  }
  const descriptor = Object.getOwnPropertyDescriptor(target, "setConfig")
  try {
    Object.defineProperty(target, "setConfig", {
      value: wrapped,
      configurable: descriptor?.configurable ?? true,
      enumerable: descriptor?.enumerable ?? false,
      writable: descriptor?.writable ?? true,
    })
    wrappers.add(wrapped)
  } catch {
    // Do not break registration for cards with a non-configurable method.
  }
}

export function observeConfig(element: object, refresh: () => void) {
  refreshers.set(element, refresh)
  patchSetConfig(element)
  // Lit initializers precede subclass fields, which can replace setConfig.
  queueMicrotask(() => patchSetConfig(element))
}
