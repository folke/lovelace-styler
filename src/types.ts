import type { LitElement } from "lit"

export type StylerConfig = {
  card?: boolean
  style?: string
  card_size?: number
  grid_size?: [number, number]
}

export type StylerState = StylerConfig & {
  styleEl?: HTMLStyleElement
  parent_card?: boolean
}

export type CardElement = LitElement & {
  _config?: { styler?: StylerConfig }
  editMode?: boolean
  getCardSize?: () => number | undefined
  getGridSize?: () => [number, number] | undefined
  _styler?: StylerState
}
