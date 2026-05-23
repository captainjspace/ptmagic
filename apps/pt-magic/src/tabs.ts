import { Tabs } from "flowbite";
import type { TabsOptions, TabsInterface, TabItem } from "flowbite";
import type { InstanceOptions } from "flowbite";

const tabsElement: HTMLElement = document.getElementById("tabs-example");

// create an array of objects with the id, trigger element (eg. button), and the content element
const tabElements: TabItem[] = [
    {
        id: "profile",
        triggerEl: document.querySelector("#profile-tab-example"),
        targetEl: document.querySelector("#profile-example"),
    },
    {
        id: "dashboard",
        triggerEl: document.querySelector("#dashboard-tab-example"),
        targetEl: document.querySelector("#dashboard-example"),
    },
    {
        id: "settings",
        triggerEl: document.querySelector("#settings-tab-example"),
        targetEl: document.querySelector("#settings-example"),
    },
    {
        id: "contacts",
        triggerEl: document.querySelector("#contacts-tab-example"),
        targetEl: document.querySelector("#contacts-example"),
    },
];

// options with default values
const options: TabsOptions = {
    defaultTabId: "settings",
    activeClasses:
        "text-fg-brand hover:text-fg-brand border-brand",
    inactiveClasses:
        "text-body hover:text-fg-brand border-base hover:border-brand",
    onShow: () => {
        console.log("tab is shown");
    },
};

// instance options with default values
const instanceOptions: InstanceOptions = {
  id: "tabs-example",
  override: true
};

/*
* tabsElement: parent element of the tabs component (required)
* tabElements: array of tab elements (required)
* options (optional)
* instanceOptions (optional)
*/
const tabs: TabsInterface = new Tabs(tabsElement, tabElements, options, instanceOptions);

// open tab item based on id
tabs.show("contacts");

