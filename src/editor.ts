import { override } from "./patch"
import type { StylerConfig } from "./types"

type Config = Record<string, unknown> & { styler?: StylerConfig }

type ConfigElement = {
  setConfig: (config: Config) => void
}

type CardElementEditor = {
  getConfigElement: () => Promise<ConfigElement | undefined>
  _configElement?: ConfigElement
  _handleUIConfigChanged: (ev: CustomEvent<{ config: Config }>) => void
}

const configurations = new WeakMap<ConfigElement, StylerConfig | undefined>()

void customElements.whenDefined("hui-card-element-editor").then((el) => {
  const editor = el.prototype as CardElementEditor

  override(editor, "getConfigElement", async function (orig) {
    const configEl = await orig()
    if (!configEl || configurations.has(configEl)) return configEl

    configurations.set(configEl, undefined)
    override(configEl, "setConfig", function (original, config) {
      // Native editors must not validate or discard Styler-owned options.
      const { styler, ...nativeConfig } = config
      configurations.set(this, styler)
      original(nativeConfig)
    })
    return configEl
  })

  override(editor, "_handleUIConfigChanged", function (orig, ev) {
    const styler = this._configElement && configurations.get(this._configElement)
    if (styler !== undefined) ev.detail.config.styler = styler
    orig(ev)
  })
})
