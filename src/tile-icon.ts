import type { LitElement, CSSResultGroup } from "lit"

void customElements.whenDefined("hui-tile-card").then((el) => {
  const card = el as typeof LitElement
  const iconCard = class extends (el as typeof LitElement) {
    getCardSize() {
      return 1
    }

    getGridSize() {
      return [1, 1]
    }

    static get styles(): CSSResultGroup {
      const style = new CSSStyleSheet()
      style.replaceSync(`
          ha-tile-info {
            display: none;
          }
          hui-card-features {
            display: none;
          }
          .icon-container {
            margin-inline-start: 0;
            margin: 2px;
          }
        `)
      return [card.styles as CSSResultGroup, style]
    }
  }
  customElements.define("tile-icon", iconCard)
})
