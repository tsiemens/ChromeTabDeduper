# Tab Deduper - A Chrome Extension
A Chome extension for deduplicating tabs

[![License: MIT](https://img.shields.io/badge/License-MIT-lightgray.svg)](https://opensource.org/licenses/MIT)
![Chrome Web Store version](https://img.shields.io/chrome-web-store/v/fpcohiaaphpfoneofdlabjnpipbnkplj.svg)

[Chrome Web Store page](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/tbyBjqi7Zu733AAKA5n4.png)

## Why Another of these?
Yes, this kind of extension already exists for Chrome. However, after using Firefox for some time,
I found the [Duplicate Tab Closer](https://addons.mozilla.org/en-US/firefox/addon/duplicate-tabs-closer/)
plugin and realised how disatisfied I was with the existing Chrome extensions, and was going to have a hard time migrating
back if I was forced to use the existing options.

Things I wanted to solve with Tab Deduper:
- Allow manual closing of dupped tabs, rather than forcing automatic
- Allowing more complex control over what is considered a duplicate (with RegExps, etc)

## Configuration Guidelines

### URL Transforms / Pattern Replacements
URL Transforms are a feature - configured in the extension's options page - which allow custom "transformations" of a URL using [regular expressions](https://www.w3schools.com/js/js_regexp.asp) or "regexps". These are very powerful, but for the uninitiated, they can be a bit intimidating. Below are some guidelines and examples for how to effectively use URL Transforms.

#### Testing your pattern
The options page includes a "Try URL Conversions" section, which allows you to enter a URL and see how all of your applied conversions would affect it. If two URLs convert to the same one, then they should be detected as duplicates.

If your transform patterns are not working as expected, first make sure you hit Save before testing it.

If that didn't help, try debugging your transforms using a more powerful tool like [regex101.com](https://regex101.com). This is my go-to for debugging regular expressions. In this case, you'll want to set the "Flavor" to "ECMAScript", change the "Delimiter" (by default it is `/`) to backtick (``` ` ```), the "Function" from "match" to "substitution", and move the part of the pattern after the backtick into the lower replacement value section.

For example: If you have a pattern like "```blablabla.com.*`www.blablabla.com```", you would put "`blablabla.com.*`" in the "pattern" section and "`www.blablabla.com`" in the substitution section.

#### Common Replacement Patterns
##### Remove Header/Section Bookmarks For Google Docs
Google Docs uses URL query parameters (after a `?`) instead of fragment markers (after a `#`) to jump you to sections in a document.
This is not standard behaviour, and requires a custom pattern to address.
```
(docs.google.com/document/d/.*)\?.*`$1
```

##### Remove start-time specifier from YouTube URLs
```
^(.*youtube\.com/.*)&t=.*`$1
```

#### Detailed Replacement Examples
##### Remove start-time specifier from YouTube URLs (like `https://youtube.com/watch=xxxx&t=5s`)

```
^(.*youtube\.com/.*)&t=.*`$1
```

Explanation:

* `^` : This matches the start of the URL. It may be optional, but is useful for clarity.
* `(` : This starts a new "match group", which we'll use later.
* `.` : This matches any character
* `*` : This applies to the previous ".", matching zero or more times. So ".*" matches anything zero or more times.
* `youtube\.com/` : This matches the string "youtube.com/". There is a backslash before the dot, because dot is a special character, as we already saw.
* `.*` : Again, matches anything zero or more times.
* `)` : This closes the match group we started
* `&t=` : This literally matches "&t=", which is how we are detecting the time specifier.
* `.*` : Again, matches anything zero or more times.
* ``` ` ``` : This denotes the separation of the match and substitution pattern.
* `$1` : This is a special group reference. It means we should use put here whatever matched inside of "match group" 1. In this instance, that is everything up until the time code.

Additional notes:

* This pattern does not check for characters after the time code. If there were additional parts after the time code, they are ignored here, and would not cause the URL to appear as unique. To solve this, you could make the pattern more complicated, like so (if we assume all time codes are structured as an integer value for seconds followed by the letter "s")

```
^(.*youtube\.com/.*)&t=\d+s(.*)`$1$2
```

* `\d` : This matches any number
* `s` : This matches the letter s.
* `(.*)` : A second group, matching anything.
* `$1$2` : This just concatenates whatever matched group 1 and group 2, leaving out the time code in the substitution.
