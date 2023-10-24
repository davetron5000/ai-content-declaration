export default class SelectedTabState {
  constructor(window) {
    this.window = window
    this.searchParams = new URLSearchParams(window.location.search)
    this.selectedTabId = this.searchParams.get("selectedPanel")
    this.listeners = []
    this.window.addEventListener("popstate", (event) => {
      const tabId = (event.state || {}).selectedPanel
      if (tabId) {
        this.listeners.forEach( (listener) => listener(tabId) )
      }
    })
  }

  onNavigation(listener) {
    this.listeners.push(listener)
  }

  setSelectedTabId(tabId) {
    this.selectedTabId = tabId
    this.searchParams.set("selectedPanel", tabId)
    this.window.history.pushState(
      { selectedPanel: tabId },
      "unused",
      "?" + this.searchParams.toString()
    )
  }
}
