import SelectedTabState from "./SelectedTabState"
import TabControl       from "./TabControl"

window.addEventListener("DOMContentLoaded", (event) => {
  const $tabView = document.querySelector("[data-decision-tab-view]")
  if (!$tabView) {
    return
  }
  const tabControl       = new TabControl($tabView)
  const selectedTabState = new SelectedTabState(window)

  tabControl.show(selectedTabState.selectedTabId)

  tabControl.onShow( (tabPanel) => selectedTabState.setSelectedTabId(tabPanel.id) )
  selectedTabState.onNavigation( (tabId) => tabControl.show(tabId) )
})
