import Panel    from "./Panel"
import Tab      from "./Tab"
import TabPanel from "./TabPanel"

export default class TabControl {
  constructor($tabControl) {
    this.tabControl = $tabControl
    this.tabPanels = {}
    this.tabControl.querySelectorAll("[role=tab]").forEach( (tab) => {
      const id = tab.getAttribute("aria-controls")
      const panel = document.getElementById(id)
      this.tabPanels[id] = new TabPanel(id, new Tab(tab), new Panel(panel))
    })
    Object.values(this.tabPanels).forEach( (tabPanel) => {
      tabPanel.tab.onClick( () => this.show(tabPanel.id) )
    })
    this.listeners = []
  }

  onShow(listener) {
    this.listeners.push(listener)
  }

  show(tabPanelId) {
    const tabPanel = this.tabPanels[tabPanelId]
    if (tabPanel) {
      Object.values(this.tabPanels).forEach( (other) => other.hide() )
      tabPanel.show()
      this.listeners.forEach( (listener) => listener(tabPanel) )
    }
  }
}
