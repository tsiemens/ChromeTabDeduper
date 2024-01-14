// Copyright (c) 2018 Trevor Siemens.
#ifndef UTILS_JS
#define UTILS_JS

function ftrace() {
   var err = new Error();
   stacks = err.stack.split('\n');
   console.log(stacks[2].replace(/^ *at */, ''))
}

function escapeHtml(html) {
    var text = document.createTextNode(html);
    var div = document.createElement('div');
    div.appendChild(text);
    return div.innerHTML;
}

function ebi(id) {
   return document.getElementById(id);
}

// local storage settings
var EOpt = {
   dedupAllWindows: 'dedupAllWindows', // bool
   useTitleDefault: 'useTitleDefault', // bool
   ignoreFragmentDefault: 'ignoreFragmentDefault', // bool
   urlExempts: 'urlExempts', // list of urls or regexeps
   titleOverride: 'titleOverrides', // list of urls or regexps
   fragmentOverride: 'fragmentOverrides', // list of urls or regexps
   urlTransform: 'urlTranforms' // list of pattern and replacement
};

function getOptionDefault(prop) {
   var defaultVal = undefined;
   switch(prop) {
    case EOpt.dedupAllWindows:
    case EOpt.useTitleDefault:
    case EOpt.ignoreFragmentDefault:
      defaultVal = true;
      break;
    case EOpt.urlExempts:
    case EOpt.titleOverride:
    case EOpt.fragmentOverride:
    case EOpt.urlTransform:
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

var optionCache = {};
var optionCacheInitialized = false;
// callback is optional
function updateOptionCache(callback) {
   getOptions([
      EOpt.dedupAllWindows,
      EOpt.useTitleDefault,
      EOpt.ignoreFragmentDefault,
      EOpt.urlExempts,
      EOpt.titleOverride,
      EOpt.fragmentOverride,
      EOpt.urlTransform
     ], (items) => {
      var errors = null;

      optionCache[EOpt.dedupAllWindows] = items[EOpt.dedupAllWindows];
      optionCache[EOpt.useTitleDefault] = items[EOpt.useTitleDefault];
      optionCache[EOpt.ignoreFragmentDefault] = items[EOpt.ignoreFragmentDefault];

      var updateOrCatch = (key, func) => {
         try {
            func();
         } catch (err) {
            if (errors == null) {
               errors = {};
            }
            if (err.forEach === undefined) {
               err = [err];
            }
            errors[key] = err;
         }
      };

      updateOrCatch(EOpt.urlExempts, () => {
         optionCache[EOpt.urlExempts] = linesToUrlRules(getSanitizedLines(
            items[EOpt.urlExempts]
         ));
      });

      updateOrCatch(EOpt.titleOverride, () => {
         optionCache[EOpt.titleOverride] = linesToUrlRules(getSanitizedLines(
            items[EOpt.titleOverride]
         ));
      });
      updateOrCatch(EOpt.fragmentOverride, () => {
         optionCache[EOpt.fragmentOverride] = linesToUrlRules(getSanitizedLines(
            items[EOpt.fragmentOverride]
         ));
      });

      updateOrCatch(EOpt.urlTransform, () => {
         var sanReplacedLines = getSanitizedLines(items[EOpt.urlTransform]);
         var transforms = [];
         var tErrors = null;
         sanReplacedLines.forEach((line) => {
            try {
               transforms.push(new UrlTransform(line));
            } catch (err) {
               if (tErrors === null) {
                  tErrors = [];
               }
               tErrors.push(err);
            }
         });
         if (tErrors !== null) {
            throw tErrors;
         }
         optionCache[EOpt.urlTransform] = transforms;
      });

      optionCacheInitialized = true;
      if (callback) {
         callback(errors);
      }
   });
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
   var errors = null;
   lines.forEach((line) => {
      try {
         rules.push(new UrlRule(line));
      } catch (err) {
         if (errors === null) {
            errors = [];
         }
         errors.push(err);
      }
   });
   if (errors !== null) {
      throw errors;
   }
   return rules;
}

class UrlTransform {
   constructor(line) {
      // Produces 'xxx`yyy`g' -> ["xxx", "yyy", "g"]
      var groups = line.split('`');
      if (groups.length < 2) {
         throw "Insufficient ` (backtick) separated groups in " + line;
      }
      var flags = undefined;
      if (groups.length >= 3) {
         flags = groups[2];
      }
      this.pattern = new RegExp(groups[0], flags);
      this.sub = groups[1];
   }
}

function findMatchingRule(url, rules) {
   for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      var m = url.match(rule.pattern);
      if (m) {
         if (typeof(rule.pattern) === "string") {
            // The pattern is just a string, which must match
            // at the beginning of the url.
            if (m.index === 0) {
               return rule;
            }
         } else {
            // The pattern was a regexp, so any match is ok
            return rule;
         }
      }
   }
   return null;
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

// The url must be pre-sanitized (run afterHttp on it)
function getUrlDedupIdPart(url) {
   var finalUrl = url;

   // Fragment
   var fragOverride = findMatchingRule(url, optionCache[EOpt.fragmentOverride]);
   var removeFrag = false;
   if (fragOverride !== null) {
      removeFrag = fragOverride.negate
   } else {
      removeFrag = optionCache[EOpt.ignoreFragmentDefault];
   }
   if (removeFrag) {
      finalUrl = stripFragment(finalUrl);
   }

   // Tranform
   var transforms = optionCache[EOpt.urlTransform];
   for (var i = 0; i < transforms.length; i++) {
      var tf = transforms[i];
      var m = finalUrl.match(tf.pattern);
      if (m) {
         finalUrl = finalUrl.replace(tf.pattern, tf.sub);
      }
   }
   return finalUrl;
}

function getTabDedupId(tab) {
   // https://developer.chrome.com/extensions/tabs#type-Tab
   var baseUrl = afterHttp(tab.url);

   // Title
   var sanTitle = '';
   var titleOverride = findMatchingRule(baseUrl, optionCache[EOpt.titleOverride]);
   var useTitle = false;
   if (titleOverride !== null) {
      // Negated title overrides disable title use
      useTitle = !titleOverride.negate;
   } else {
      useTitle = optionCache[EOpt.useTitleDefault];
   }
   if (useTitle) {
      sanTitle = tab.title.replace(/#\*#\*#/g, '');
   }

   var finalUrl = getUrlDedupIdPart(baseUrl);

   return finalUrl + '#*#*#' + sanTitle;
}

/**
 * Gets an array of tab arrays, grouped by duplicates.
 * func is function([][]Tab)
 */
function getDuplicateTabs(func) {
   var tabsByDedupId = {}
   var dupTabs = [];

   queryFilter = {}
   if (!optionCache[EOpt.dedupAllWindows]) {
      queryFilter["currentWindow"] = true;
   }

   chrome.tabs.query(queryFilter, function(resArr){
      resArr.forEach((t) => {
         var url = afterHttp(t.url);
         var exemptRule = findMatchingRule(url, optionCache[EOpt.urlExempts]);
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
      chrome.action.setBadgeBackgroundColor({'color': "#e01616"});
      chrome.action.setBadgeText({'text': "" + badgeText});
   });
}

function indexToColorStr(id) {
   let theId = id;
   let r = 0 + ( ( theId * 60 ) % 256 );
   let g = 255 - ( ( theId * 60 ) % 256 );
   let b = 255 - ( ( theId * 20 ) % 206 );
   return `rgb(${r}, ${g}, ${b})`;
}

#endif // UTILS_JS
