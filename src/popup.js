// Copyright (c) 2018 Trevor Siemens.
#include "utils.js"

function onDeleteClick(btn) {
   var tabIdStr = btn.getAttribute('data-tabid');
   var tabId = parseInt(tabIdStr);
   if (Number.isNaN(tabId)) {
      console.error("Failed to parse tabid " + tabIdStr);
      return;
   }
   console.log("Deleting tab " + tabId);
   chrome.tabs.remove([tabId]);
}

chrome.tabs.onRemoved.addListener(function(tabId, ri) {
   reloadTabList();
});

function onTabLineClick(line) {
   var tabIdStr = line.getAttribute('data-tabid');
   var tabId = parseInt(tabIdStr);
   if (Number.isNaN(tabId)) {
      console.error("Failed to parse tabid " + tabIdStr);
      return;
   }
   chrome.tabs.update(tabId, {active: true}, () => {
      reloadTabList();
   });
}

function populateTabList(dupTabGrps, currTab) {
   var tabList = document.getElementById('tab_list');
   // Clear the list
   tabList.innerHTML = "";
   console.log(currTab);
   dupTabGrps.forEach((tabs) => { tabs.forEach((t) => {
      var boldStyle = '';
      if (currTab && currTab.id === t.id) {
         boldStyle = 'font-weight:bold';
      }
      tabList.innerHTML +=
         '<div class="tab-list-item">' +
           '<div class="short-w tab-icon-title-grp" data-tabid="' + t.id + '">' +
           '<img class="tab-icon" src="' + t.favIconUrl + '">' +
           '<div class="short-w tab-title" ' +
                'style="padding-left:2pt;' + boldStyle +'">' + t.title +
             '</div>' +
           '</div>' +
           '<button data-tabid="' + t.id + '" class="kill-tab-button">X</button>' +
         "</div>";
   })});

   var tabLines = document.getElementsByClassName('tab-icon-title-grp');
   for (var i = 0; i < tabLines.length; i++) {
      // Navigate to the tab, if the line is clicked
      tabLines[i].addEventListener('click', (d) => {
         onTabLineClick(d.target);
      });
   }

   var buttons = document.getElementsByClassName('kill-tab-button');
   for (var i = 0; i < buttons.length; i++) {
      // Delete the tab for the button clicked
      buttons[i].addEventListener('click', (d) => {
         onDeleteClick(d.target);
      });
   }

   if (buttons.length == 0) {
      tabList.innerHTML +=
         '<div class="no-tabs-item">No duplicate tabs</div>';
   }
}

function reloadTabList() {
   console.log("reloadTabList");
   if (!optionCacheInitialized) {
      console.warn("Options cache not yet initialized");
      return;
   }
   getDuplicateTabs((tabGrps) => {
      chrome.tabs.query({"active": true}, function(resArr){
         populateTabList(tabGrps, resArr[0]);
      });
   });
}

updateOptionCache(() => {
   reloadTabList();
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
   reloadTabList();
});
