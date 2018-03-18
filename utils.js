// Copyright (c) 2018 Trevor Siemens.

function ftrace() {
   var err = new Error();
   stacks = err.stack.split('\n');
   console.log(stacks[2].replace(/^ *at */, ''))
}

// local storage settings
var useTitleDefaultOpt = 'useTitleDefault'; // bool
var ignoreFragmentDefaultOpt = 'ignoreFragmentDefault'; // bool
var urlExemptsOpt = 'urlExempts' // list of urls or regexeps
var titleOverrideOpt = 'titleOverrides'; // list of urls or regexps
var fragmentOverrideOpt = 'fragmentOverrides'; // list of urls or regexps
var urlTransformOpt = 'urlTranforms'; // list of pattern and replacement

function getOptionDefault(prop) {
   var defaultVal = undefined;
   switch(prop) {
    case useTitleDefaultOpt:
    case ignoreFragmentDefaultOpt:
      defaultVal = true;
      break;
    case urlExemptsOpt:
    case titleOverrideOpt:
    case fragmentOverrideOpt:
    case urlTransformOpt:
      defaultVal = '';
      break;
    default:
      console.error("No known option " + prop);
   }
   return defaultVal;
}

function getOptions(props, callback) {
   var keysAndDefaults = {}
   props.forEach((prop) => {
      var defaultVal = getOptionDefault(prop);
      keysAndDefaults[prop] = defaultVal;
   });
   chrome.storage.local.get(keysAndDefaults, callback);
}

function setOption(key, val, callback) {
   var keysAndVals = {}
   keysAndVals[key] = val;
   chrome.storage.local.set(keysAndVals, callback);
}

function setOptions(keysAndVals, callback) {
   chrome.storage.local.set(keysAndVals, callback);
}

function getSanitizedLines(textOption) {
   var lines = textOption.split('\n');
   var cleanLines = [];
   lines.forEach((line) => {
      line = line.trim();
      if (line !== '') {
         cleanLines.push(line);
      }
   });
   return cleanLines;
}

function lineToPatternOrStr(line) {
   if (line[0] === '`') {
      // Line is prefixed with a backtick, so it is a regexp
      return new RegExp(line.substr(1));
   } else {
      return line;
   }
}

class UrlRule {
   constructor(line) {
      if (line[0] == '-') {
         // rule is a negation
         this.negate = true;
         this.pattern = lineToPatternOrStr(line.substr(1));
      } else {
         this.negate = false;
         this.pattern = lineToPatternOrStr(line);
      }
   }
}

// Lines must be pre-sanitized
function linesToUrlRules(lines) {
   var rules = []
   lines.forEach((line) => {
      rules.push(new UrlRule(line));
   });
   return rules;
}

function isValidUrlTransformLine(line) {
   return line.match(/^[^`]+`/);
}

class UrlTransform {
   constructor(line) {
      // Produces 'xxx`yyy' -> ["", "xxx", "`", "yyy"]
      var groups = line.split(/^([^`]*)(`)/);
      this.pattern = new RegExp(groups[1]);
      this.sub = groups[3];
   }
}

function findMatchingRule(url, rules) {
   for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      var m = url.match(rule.pattern);
      if (m) {
         if (typeof(rule.pattern) === "string") {
            if (m.index === 0) {
               return rule;
            }
         } else {
            return rule;
         }
      }
   }
   return null;
}

var optionCache = {};
var optionCacheInitialized = false;
// callback is optional
function updateOptionCache(callback) {
   getOptions([
      useTitleDefaultOpt,
      ignoreFragmentDefaultOpt,
      urlExemptsOpt,
      titleOverrideOpt,
      fragmentOverrideOpt,
      urlTransformOpt
     ], (items) => {

      optionCache[useTitleDefaultOpt] = items[useTitleDefaultOpt];
      optionCache[ignoreFragmentDefaultOpt] = items[ignoreFragmentDefaultOpt];

      optionCache[urlExemptsOpt] = linesToUrlRules(getSanitizedLines(
         items[urlExemptsOpt]
      ));
      optionCache[titleOverrideOpt] = linesToUrlRules(getSanitizedLines(
         items[titleOverrideOpt]
      ));
      optionCache[fragmentOverrideOpt] = linesToUrlRules(getSanitizedLines(
         items[fragmentOverrideOpt]
      ));

      var sanReplacedLines = getSanitizedLines(items[urlTransformOpt]);
      var transforms = [];
      sanReplacedLines.forEach((line) => {
         if (isValidUrlTransformLine(line)) {
            transforms.push(new UrlTransform(line));
         }
      });
      optionCache[urlTransformOpt] = transforms;

      optionCacheInitialized = true;
      if (callback) {
         callback();
      }
   });
}


var httpStripRe = new RegExp("^[^/]+//([^/].*)")
function afterHttp(url) {
   var m = url.match(httpStripRe);
   if (m) {
      return m[1];
   } else {
      return url;
   }
}

var urlBaseRe = new RegExp('^([^#]*)(#|$)');
function stripFragment(url) {
   var m = url.match(urlBaseRe);
   return m[1];
}

function getTabDedupId(tab) {
   // https://developer.chrome.com/extensions/tabs#type-Tab
   var baseUrl = afterHttp(tab.url);
   var finalUrl = baseUrl;
   var sanTitle = '';

   // Title
   var titleOverride = findMatchingRule(baseUrl, optionCache[titleOverrideOpt]);
   var useTitle = false;
   if (titleOverride !== null) {
      // Negated title overrides disable title use
      useTitle = !titleOverride.negate;
   } else {
      useTitle = optionCache[useTitleDefaultOpt];
   }
   if (useTitle) {
      sanTitle = tab.title.replace(/#\*#\*#/g, '');
   }

   // Fragment
   var fragOverride = findMatchingRule(baseUrl, optionCache[fragmentOverrideOpt]);
   var removeFrag = false;
   if (fragOverride !== null) {
      removeFrag = !fragOverride.negate
   } else {
      removeFrag = optionCache[ignoreFragmentDefaultOpt];
   }
   if (removeFrag) {
      finalUrl = stripFragment(finalUrl);
   }

   // Tranform
   var transform = findMatchingRule(finalUrl, optionCache[urlTransformOpt]);
   if (transform !== null) {
      finalUrl = finalUrl.replace(transform.pattern, transform.sub);
   }

   return finalUrl + '#*#*#' + sanTitle;
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
         var url = afterHttp(t.url);
         var exemptRule = findMatchingRule(url, optionCache[urlExemptsOpt]);
         if (exemptRule === null) {
            var dedupId = getTabDedupId(t);
            console.log("DedupId: " + dedupId);
            if (tabsByDedupId[dedupId] === undefined) {
               tabsByDedupId[dedupId] = [];
            }
            tabsByDedupId[dedupId].push( t );
         } else {
            console.log("Ignoring url " + url + ". Matched " + exemptRule.pattern);
         }
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
   ftrace()
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

