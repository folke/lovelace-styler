import type { StylerConfig } from "./types"

export function getTileCardCSS(animation: StylerConfig["animation"]): string[] {
  const css: string[] = []

  if (animation === "spin")
    css.push(`
      @keyframes spin {
        from {transform: rotate(0deg);}
        to {transform: rotate(360deg);}
      }
      ha-tile-icon[data-state="on"] ha-state-icon {animation: spin 2s linear infinite;}
    `)

  if (animation === "pulse")
    css.push(`
      @keyframes pulse {
        0% {opacity: 1;}
        50% {opacity: 0;}
        100% {opacity: 1;}
      }
      ha-tile-icon[data-state="on"] {animation: pulse 1s linear infinite;}
    `)

  if (animation === "fade")
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
