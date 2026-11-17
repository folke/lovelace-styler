import type { ReactiveElement } from "lit"

import { getCustomElements } from "./compat"

let installed = false

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
  private patched = new WeakSet<CustomElementConstructor>()

  constructor(private attach: (el: HTMLElement) => void) {
    if (installed) return
    installed = true
    const define = customElements.define.bind(customElements)
    customElements.define = (
      name: string,
      constructor: CustomElementConstructor,
      options?: ElementDefinitionOptions
    ) => {
      this.patch(constructor)
      define(name, constructor, options)
    }

    getCustomElements().forEach((constructor) => this.patch(constructor))

    // Attach to existing elements on the page
    walk(document.body, (el) => {
      this.patch(el.constructor as CustomElementConstructor)
      this._attach(el)
    })
  }

  patch(constructor: CustomElementConstructor) {
    if (!isLitClass(constructor) || this.patched.has(constructor)) return
    this.patched.add(constructor)
    constructor.addInitializer((el: HTMLElement) => this._attach(el))
  }

  _attach(el: HTMLElement) {
    const card = el as HTMLElement & { _stylerAttached?: boolean }
    if (card._stylerAttached) return
    card._stylerAttached = true
    this.attach(el)
  }
}

function isLitClass(constructor: unknown): constructor is typeof ReactiveElement {
  return typeof (constructor as typeof ReactiveElement)?.addInitializer === "function"
}

export function isReactiveController(el: unknown): el is ReactiveElement {
  return typeof (el as ReactiveElement)?.addController === "function"
}

export function override<
  M extends keyof T,
  T extends object,
  F extends T[M],
  // @ts-expect-error typing shananigans
>(klass: T, method: M, fn: (this: T, orig: F, ...args: Parameters<F>) => ReturnType<F>) {
  const orig = klass[method] as F
  // @ts-expect-error typing shananigans
  klass[method] = function (this: T, ...args: Parameters<F>) {
    // @ts-expect-error typing shananigans
    return fn.apply(this, [orig?.bind(this) as F, ...args])
  } as F
}
