// Copyright (c) 2018 Trevor Siemens.
#include "utils.js"

updateOptionCache(() => {
   ftrace();
   handleTab();
});

chrome.tabs.onCreated.addListener(function(tab) {
   handleTab();
});
chrome.tabs.onUpdated.addListener(function(tabId, ci, tab) {
   handleTab();
});
chrome.tabs.onAttached.addListener(function(tabId, ai) {
   handleTab();
});
chrome.tabs.onRemoved.addListener(function(tabId, ri) {
   handleTab();
});
chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
   handleTab();
});
chrome.tabs.onActivated.addListener(function(activeInfo) {
   handleTab();
});
chrome.windows.onFocusChanged.addListener(function(window_) {
   handleTab();
});
chrome.runtime.onInstalled.addListener((details) => {
   ftrace();
   updateOptionCache(() => {
      handleTab();
   });
});

chrome.storage.onChanged.addListener((changes, areaName) => {
   ftrace();
   updateOptionCache(() => {
      handleTab();
   });
});

settingsContextMenuId = "settings_context_menu_item";
chrome.contextMenus.create({
   id: settingsContextMenuId,
   title: "Settings",
   contexts: ["browser_action"],
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
   if(info.menuItemId === settingsContextMenuId) {
      chrome.tabs.create({url: chrome.extension.getURL('options.html')});
   }
})

// chrome.webNavigation.onCommitted.addListener(function (details) {
   // console.log("naved!");
// });
