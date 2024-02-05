import { LitElement, ReactiveElement } from "lit";

export type StylerConfig = {
  card?: boolean;
  style?: string;
  size?: number;
}

export type StylerElement = LitElement & ReactiveElement & {
  config?: { styler?: StylerConfig }
  _config?: { styler?: StylerConfig }
  _styler?: StylerConfig & { parent_card?: boolean };
  getCardSize?: () => number | undefined;
}

export type StylerElementConstructor = CustomElementConstructor & {
  _stylered?: boolean;
}

const VERSION = "0.0.1"
let CARD_CSS = "";

function check(node?: StylerElement) {
  if (!node || node._styler) return node?._styler;
  const parent = check((
    node instanceof ShadowRoot
      ? node.host
      : node.parentElement ?? node.parentNode) as StylerElement | undefined
  );
  node._styler = { ...node?._config?.styler, parent_card: parent?.card ?? parent?.parent_card };
  fix(node);
  return node._styler;
}

function fix(node: StylerElement) {
  const config = node._styler;
  if (!config) return;

  if (config.card) {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = CARD_CSS;
    node.shadowRoot?.appendChild(styleElement);
  }

  if (config.style) {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = config.style;
    node.shadowRoot?.appendChild(styleElement);
  }

  if (
    node.tagName == "HA-CARD" &&
    (config.card === false || config.parent_card)
  ) {
    node.style.transition = "none";
    node.style.border = "none";
    node.style.boxShadow = "none";
    node.style.background = "none";
    // node.style.transition = '';
  }
}

function patch(el: StylerElementConstructor) {
  if (el._stylered) return;
  el._stylered = true;
  const origUpdated = el.prototype.updated;
  el.prototype.updated = function(props: Map<string, any>) {
    origUpdated?.call(this, props);
    check(this);
  };

  (el as unknown as typeof LitElement).addInitializer((e: ReactiveElement) => {
    const el = e as StylerElement;
    const origGetCardSize = el.getCardSize;
    el.getCardSize = function() {
      if (this._config?.styler?.size) {
        console.log("size", this._config.styler.size)
        return this._config.styler.size;
      }
      return origGetCardSize?.call(el);
    }
  })
}

customElements.whenDefined("ha-card").then((el) => {
  const card = el as typeof LitElement;
  CARD_CSS = card.styles?.cssText ?? "";
  CARD_CSS += ":host{overflow:hidden}";
  const LitElement = Object.getPrototypeOf(card) as typeof LitElement;
  patch(LitElement);
  patch(card);
});

console.info(
  `%cStyler v${VERSION} is installed`,
  "color: blue; font-weight: bold"
);
