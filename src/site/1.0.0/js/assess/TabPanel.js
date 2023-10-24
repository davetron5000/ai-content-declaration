export default class TabPanel {
  constructor(id, tab, panel) {
    this.id    = id
    this.tab   = tab
    this.panel = panel
  }
  show() {
    this.tab.select()
    this.panel.show()
  }
  hide() {
    this.tab.unselect()
    this.panel.hide()
  }
}
