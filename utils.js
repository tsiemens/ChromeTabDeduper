// Copyright (c) 2018 Trevor Siemens.

// local storage settings
var useTitleDefaultOpt = 'useTitleDefault'; // bool

function getOptionDefault(prop) {
   var defaultVal = undefined;
   switch(prop) {
    case useTitleDefaultOpt:
      defaultVal = true;
      break;
    default:
      console.error("No known option " + prop);
   }
   return defaultVal;
}

function getOption(prop, callback) {
   var defaultVal = getOptionDefault(prop);
   var keysAndDefaults = {}
   keysAndDefaults[prop] = defaultVal;
   chrome.storage.local.get(keysAndDefaults, callback);
}

function setOption(key, val, callback) {
   var keysAndVals = {}
   keysAndVals[key] = val;
   chrome.storage.local.set(keysAndVals, callback);
}

var optionCache = {};
var optionCacheInitialized = false;
// callback is optional
function updateOptionCache(callback) {
   getOption(useTitleDefaultOpt, (items) => {
      optionCache[useTitleDefaultOpt] = items[useTitleDefaultOpt];
      optionCacheInitialized = true;
      if (callback) {
         callback();
      }
   });
}


var urlBaseRe = new RegExp('^([^#]*)(#|$)');

function getTabDedupId(tab) {
   // https://developer.chrome.com/extensions/tabs#type-Tab
   var m = tab.url.match(urlBaseRe);
   var baseUrl = m[1];
   var sanTitle = '';
   if (optionCache[useTitleDefaultOpt]) {
      sanTitle = tab.title.replace(/#\*#\*#/g, '');
   }
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
   if (!optionCacheInitialized) {
      console.warn("Options cache not yet initialized");
      return;
   }

   getDuplicateTabs((resArr) => {
      var totalTabs = 0;
      resArr.forEach((ts) => {
         totalTabs += ts.length
      });
      console.log("duped tabs: " + totalTabs);

      var badgeText = totalTabs > 0 ? totalTabs.toString() : "";
      chrome.browserAction.setBadgeBackgroundColor({'color': "#e01616"});
      chrome.browserAction.setBadgeText({'text': "" + badgeText});
   });
}

