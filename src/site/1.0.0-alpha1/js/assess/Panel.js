export default class Panel {
  constructor($panel) {
    this.panel = $panel
  }
  show() {
    this.panel.removeAttribute("hidden")
    this.panel.setAttribute("aria-selected", true)
    this.panel.style.display = "block"
  }
  hide() {
    this.panel.setAttribute("hidden", true)
    this.panel.setAttribute("aria-selected", false)
    this.panel.style.display = "none"
  }
}
