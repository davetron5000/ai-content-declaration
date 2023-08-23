(() => {
  // src/site/1.0.0-alpha1/js/assess/SelectedTabState.js
  var SelectedTabState = class {
    constructor(window2) {
      this.window = window2;
      this.searchParams = new URLSearchParams(window2.location.search);
      this.selectedTabId = this.searchParams.get("selectedPanel");
      this.listeners = [];
      this.window.addEventListener("popstate", (event) => {
        const tabId = (event.state || {}).selectedPanel;
        if (tabId) {
          this.listeners.forEach((listener) => listener(tabId));
        }
      });
    }
    onNavigation(listener) {
      this.listeners.push(listener);
    }
    setSelectedTabId(tabId) {
      this.selectedTabId = tabId;
      this.searchParams.set("selectedPanel", tabId);
      this.window.history.pushState(
        { selectedPanel: tabId },
        "unused",
        "?" + this.searchParams.toString()
      );
    }
  };

  // src/site/1.0.0-alpha1/js/assess/Panel.js
  var Panel = class {
    constructor($panel) {
      this.panel = $panel;
    }
    show() {
      this.panel.removeAttribute("hidden");
      this.panel.setAttribute("aria-selected", true);
      this.panel.style.display = "block";
    }
    hide() {
      this.panel.setAttribute("hidden", true);
      this.panel.setAttribute("aria-selected", false);
      this.panel.style.display = "none";
    }
  };

  // src/site/1.0.0-alpha1/js/assess/Tab.js
  var Tab = class {
    constructor($tab) {
      this.tab = $tab;
      this.selectedClasses = $tab.dataset["selected-classes"].split(/\s+/);
      this.unSelectedClasses = $tab.dataset["unselected-classes"].split(/\s+/);
      this.listeners = [];
      this.tab.addEventListener("click", (event) => {
        event.preventDefault();
        this.listeners.forEach((listener) => listener());
      });
    }
    select() {
      this.tab.classList.remove(...this.unSelectedClasses);
      this.tab.classList.add(...this.selectedClasses);
    }
    unselect() {
      this.tab.classList.add(...this.unSelectedClasses);
      this.tab.classList.remove(...this.selectedClasses);
    }
    onClick(listener) {
      this.listeners.push(listener);
    }
  };

  // src/site/1.0.0-alpha1/js/assess/TabPanel.js
  var TabPanel = class {
    constructor(id, tab, panel) {
      this.id = id;
      this.tab = tab;
      this.panel = panel;
    }
    show() {
      this.tab.select();
      this.panel.show();
    }
    hide() {
      this.tab.unselect();
      this.panel.hide();
    }
  };

  // src/site/1.0.0-alpha1/js/assess/TabControl.js
  var TabControl = class {
    constructor($tabControl) {
      this.tabControl = $tabControl;
      this.tabPanels = {};
      this.tabControl.querySelectorAll("[role=tab]").forEach((tab) => {
        const id = tab.getAttribute("aria-controls");
        const panel = document.getElementById(id);
        this.tabPanels[id] = new TabPanel(id, new Tab(tab), new Panel(panel));
      });
      Object.values(this.tabPanels).forEach((tabPanel) => {
        tabPanel.tab.onClick(() => this.show(tabPanel.id));
      });
      this.listeners = [];
    }
    onShow(listener) {
      this.listeners.push(listener);
    }
    show(tabPanelId) {
      const tabPanel = this.tabPanels[tabPanelId];
      if (tabPanel) {
        Object.values(this.tabPanels).forEach((other) => other.hide());
        tabPanel.show();
        this.listeners.forEach((listener) => listener(tabPanel));
      }
    }
  };

  // src/site/1.0.0-alpha1/js/assess/index.js
  window.addEventListener("DOMContentLoaded", (event) => {
    const $tabView = document.querySelector("[data-decision-tab-view]");
    if (!$tabView) {
      return;
    }
    const tabControl = new TabControl($tabView);
    const selectedTabState = new SelectedTabState(window);
    tabControl.show(selectedTabState.selectedTabId);
    tabControl.onShow((tabPanel) => selectedTabState.setSelectedTabId(tabPanel.id));
    selectedTabState.onNavigation((tabId) => tabControl.show(tabId));
  });
})();
//# sourceMappingURL=main.js.map
