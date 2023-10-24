export default class Tab {
  constructor($tab) {
    this.tab = $tab
    this.selectedClasses = $tab.dataset["selected-classes"].split(/\s+/)
    this.unSelectedClasses = $tab.dataset["unselected-classes"].split(/\s+/)
    this.listeners = []
    this.tab.addEventListener("click", (event) => {
      event.preventDefault()
      this.listeners.forEach( (listener) => listener() )
    })
  }
  select() {
    this.tab.classList.remove(...this.unSelectedClasses)
    this.tab.classList.add(...this.selectedClasses)
  }
  unselect() {
    this.tab.classList.add(...this.unSelectedClasses)
    this.tab.classList.remove(...this.selectedClasses)
  }
  onClick(listener) {
    this.listeners.push(listener)
  }
}
