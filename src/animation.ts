import type { StylerConfig } from "./types"

export function getAnimationCSS(animation: StylerConfig["animation"], tagName: string): string[] {
  let selector: string
  if (tagName === "HUI-TILE-CARD") {
    selector = `ha-tile-icon[data-state="on"]${animation === "spin" ? " ha-state-icon" : ""}`
  } else if (tagName === "HUI-ENTITY-HEADING-BADGE") {
    selector = ":host([data-styler-active]) ha-state-icon"
  } else {
    return []
  }
  const css: string[] = []

  if (animation === "spin")
    css.push(`
      @keyframes spin {
        from {transform: rotate(0deg);}
        to {transform: rotate(360deg);}
      }
      ${selector} {animation: spin 2s linear infinite;}
    `)

  if (animation === "pulse")
    css.push(`
      @keyframes pulse {
        0% {opacity: 1;}
        50% {opacity: 0;}
        100% {opacity: 1;}
      }
      ${selector} {animation: pulse 1s linear infinite;}
    `)

  if (animation === "fade")
    css.push(`
      @keyframes fade {
        0% {opacity: 1;}
        50% {opacity: 0.5;}
        100% {opacity: 1;}
      }
      ${selector} {animation: fade 2s linear infinite;}
    `)

  return css
}
