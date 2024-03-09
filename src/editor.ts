import { override } from "./patch"
import type { StylerConfig, TileConfig } from "./types"

type CustomConfig = TileConfig & {
  styler?: StylerConfig
}

type ConfigElement = {
  setConfig: (config: { styler?: StylerConfig }) => void
  _stylerConfig?: CustomConfig
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

    // Temporarily store the styler config and remove it from the original config
    // This is to ensure the visual editor works as expected
    override(configEl, "setConfig", function (orig, config) {
      const newConfig = JSON.parse(JSON.stringify(config)) as CustomConfig
      this._stylerConfig = {
        styler: newConfig.styler,
        info: newConfig.info,
        animation: newConfig.animation,
      }
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      Object.keys(this._stylerConfig).forEach((key) => delete newConfig[key])
      orig(newConfig)
    })
    return configEl
  })

  // Reapply the styler config when the UI config changes
  override(editor, "_handleUIConfigChanged", function (orig, ev) {
    Object.assign(ev.detail.config, this._configElement?._stylerConfig ?? {})
    orig(ev)
  })
})
