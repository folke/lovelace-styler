import type { LitElement } from "lit"

export type StylerConfig = {
  card?: boolean
  style?: string
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
