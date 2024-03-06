import type { ReactiveElement } from "lit"

function getCustomElements() {
  const els = (customElements as unknown as { l: Map<string, unknown> }).l
  return [...els.keys()].map((k) => ({
    name: k,
    constructor: customElements.get(k) as CustomElementConstructor,
  }))
}

function isCustomElement(el: Element | ShadowRoot): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false
  const name = el.tagName.toLowerCase()
  return name.includes("-") && customElements.get(name) !== undefined
}

// Get all existing custom element instances on the page, including those recursively inside shadow roots
function walk(element: Element | ShadowRoot, callback: (elem: HTMLElement) => void): void {
  // Check if the passed 'element' is actually a ShadowRoot. If it is, we need to get its host element to check if it's a custom element.
  if (isCustomElement(element)) callback(element)

  // Get the children of the element
  const children = element instanceof Element ? element.children : element.host.shadowRoot?.children

  if (children) {
    for (let i = 0; i < children.length; i++) {
      const child: Element = children[i]

      // Recursively walk through each child element
      walk(child, callback)

      // Check if the child has a shadow root, and if so, walk through its elements
      if (child.shadowRoot) {
        walk(child.shadowRoot, callback)
      }
    }
  }
}

export class Patcher {
  enabled = true

  constructor(private attach: (el: HTMLElement) => void) {
    if (this.enabled) {
      // Override customElements.define to patch new elements
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const define = customElements.define.bind(customElements)
      customElements.define = (
        name: string,
        constructor: CustomElementConstructor,
        options?: ElementDefinitionOptions
      ) => {
        // this.patch(name, customElements.get(name) as CustomElementConstructor)
        this.patch(name, constructor)
        define(name, constructor, options)
      }

      // Patch existing elements
      getCustomElements().forEach(({ name, constructor }) => this.patch(name, constructor))
    }

    // Attach to existing elements on the page
    walk(document.body, (el) => this._attach(el))
  }

  patch(name: string, constructor: CustomElementConstructor) {
    if (isLitClass(constructor)) {
      // console.log("Patching", name)
      constructor.addInitializer((el: HTMLElement) => this._attach(el))
    }
  }

  _attach(el: HTMLElement) {
    const card = el as HTMLElement & { _stylerAttached?: boolean }
    if (card._stylerAttached) return
    card._stylerAttached = true
    this.attach(el)
  }
}

function isLitClass(constructor: unknown): constructor is typeof ReactiveElement {
  return (constructor as typeof ReactiveElement).addInitializer !== undefined
}

export function isReactiveController(el: unknown): el is ReactiveElement {
  return (el as ReactiveElement).addController !== undefined
}

export function override<
  M extends keyof T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends object,
  F extends T[M],
  // @ts-expect-error typing shananigans
>(klass: T, method: M, fn: (this: T, orig: F, ...args: Parameters<F>) => ReturnType<F>) {
  const orig = klass[method] as F
  // @ts-expect-error typing shananigans
  klass[method] = function (this: T, ...args: Parameters<F>) {
    // @ts-expect-error typing shananigans
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return fn.apply(this, [orig?.bind(this) as F, ...args])
  } as F
}
