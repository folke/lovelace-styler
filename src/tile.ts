import type { TileCard } from "./types"

export function getTileCardCSS(card: TileCard): string[] {
  const css: string[] = []
  if (card._config?.info === false)
    css.push(`
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

  if (card._config?.animation == "spin")
    css.push(`
      @keyframes spin {
        from {transform: rotate(0deg);}
        to {transform: rotate(360deg);}
      }
      ha-tile-icon[data-state="on"] ha-state-icon {animation: spin 2s linear infinite;}
    `)

  if (card._config?.animation == "pulse")
    css.push(`
      @keyframes pulse {
        0% {opacity: 1;}
        50% {opacity: 0;}
        100% {opacity: 1;}
      }
      ha-tile-icon[data-state="on"] {animation: pulse 1s linear infinite;}
    `)

  if (card._config?.animation == "fade")
    css.push(`
      @keyframes fade {
        0% {opacity: 1;}
        50% {opacity: 0.5;}
        100% {opacity: 1;}
      }
      ha-tile-icon[data-state="on"] {animation: fade 2s linear infinite;}
    `)

  return css
}
