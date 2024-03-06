import { override } from "./patch"
import type { StylerConfig } from "./types"

type ConfigElement = {
  setConfig: (config: { styler?: StylerConfig }) => void
  _stylerConfig?: StylerConfig
}

type CardElementEditor = {
  getConfigElement: () => Promise<ConfigElement | undefined>
  _configElement?: ConfigElement
  _handleUIConfigChanged: (ev: CustomEvent<{ config: { styler?: StylerConfig } }>) => void
}

void customElements.whenDefined("hui-card-element-editor").then((el) => {
  const editor = el.prototype as CardElementEditor

  override(editor, "getConfigElement", async function (orig) {
    const configEl = await orig()
    if (!configEl) return configEl

    override(configEl, "setConfig", function (orig, config) {
      const newConfig = JSON.parse(JSON.stringify(config)) as typeof config
      this._stylerConfig = newConfig.styler
      delete newConfig.styler
      orig(newConfig)
    })
    return configEl
  })

  override(editor, "_handleUIConfigChanged", function (orig, ev) {
    const config = this._configElement?._stylerConfig
    if (config) {
      ev.detail.config.styler = config
    }
    orig(ev)
  })
})
