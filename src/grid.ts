import type { LitElement } from "lit"

for (const name of ["vertical-stack", "horizontal-stack", "grid"]) {
  void customElements.whenDefined(`hui-${name}-card`).then((el) => {
    for (let rows = 1; rows <= 4; rows++) {
      for (let cols = 1; cols <= 4; cols++) {
        const card = class extends (el as typeof LitElement) {
          getGridSize() {
            return [cols, rows]
          }
        }
        customElements.define(`${name}-${cols}-${rows}`, card)
      }
    }
  })
}
