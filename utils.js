// Copyright (c) 2018 Trevor Siemens.

var urlBaseRe = new RegExp('^([^#]*)(#|$)');

function getTabDedupId(tab) {
   // https://developer.chrome.com/extensions/tabs#type-Tab
   var m = tab.url.match(urlBaseRe);
   var baseUrl = m[1];
   var sanTitle = tab.title.replace(/#\*#\*#/g, '');
   return baseUrl + '#*#*#' + sanTitle;
}

/**
 * Gets an array of tab arrays, grouped by duplicates.
 * func is function([][]Tab)
 */
function getDuplicateTabs(func) {
   var tabsByDedupId = {}
   var dupTabs = [];

   chrome.tabs.query({"currentWindow": true}, function(resArr){
      resArr.forEach((t) => {
         var dedupId = getTabDedupId(t);
         if (tabsByDedupId[dedupId] === undefined) {
            tabsByDedupId[dedupId] = [];
         }
         tabsByDedupId[dedupId].push( t );
      });

      for (var k in tabsByDedupId) {
         var tabs = tabsByDedupId[k];
         if (tabs.length > 1) {
            dupTabs.push(tabs);
         }
      }
      func(dupTabs);
   });
}

function handleTab() {
   console.log("handleTab");
   getDuplicateTabs((resArr) => {
      var totalTabs = 0;
      resArr.forEach((ts) => {
         totalTabs += ts.length
      });

      var badgeText = totalTabs > 0 ? totalTabs.toString() : "";
      chrome.browserAction.setBadgeBackgroundColor({'color': "#e01616"});
      chrome.browserAction.setBadgeText({'text': "" + badgeText});
   });
}

