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
  spin_icon?: boolean
}

export type TileConfig = {
  info?: boolean
  animation?: "spin" | "pulse" | "fade"
}

export type StylerState = StylerConfig & {
  styleEl?: HTMLStyleElement
  parent_card?: boolean
}

export type Card<C extends Record<string, unknown> = Record<string, unknown>> = LitElement & {
  _config?: C & { styler?: StylerConfig }
  editMode?: boolean
  getCardSize?: () => number | undefined
  getGridSize?: () => [number, number] | undefined
  _styler?: StylerState
}

export type TileCard = Card<TileConfig>
