import type { LitElement } from "lit"

declare global {
  interface Window {
    stylerPresets?: Record<string, string>
  }
}

export type StylerConfig = {
  preset?: string | string[]
  card?: boolean
  style?: string
  animation?: "spin" | "pulse" | "fade"
}

export type StylerState = StylerConfig & {
  styleEl?: HTMLStyleElement
  styleSheet?: CSSStyleSheet
  styleRoot?: ShadowRoot
  cssText?: string
  parent_card?: boolean
}

export type Card = LitElement & {
  editMode?: boolean
  getCardSize?: () => number | undefined
  getGridSize?: () => [number, number] | undefined
  _styler?: StylerState
}
