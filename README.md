[![Build Status](https://travis-ci.org/nth10sd/search-keys.svg?branch=master)](https://travis-ci.org/nth10sd/search-keys/)

# Search Keys
Now ported to WebExtensions, originally a [legacy add-on](https://www.squarefree.com/extensions/search-keys/):

```
For example, pressing 1 takes you to the first result. Hold Alt (Windows/Mac) or Ctrl (Linux) to open results in new tabs, or Shift to open results in new windows.

This extension can save you time because your hands are usually on the keyboard after you enter a search.
```

Search Keys supports Google, Yahoo HK/TW/US, Bing, DuckDuckGo and Wikipedia.

# Requirements
Tested in Firefox 55 and up.

# Known Bugs
* When you use Search Keys to follow a link, the referrer is not sent.
* If a search result's title text has a direction different from the page's direction (e.g. a Hebrew result in an English page), the green box indicating the shortcut is misplaced.
* On the Hebrew-language version of Google, the hint should be placed to the left but is placed to the right.
* Doesn't work when the search-results page is in a frame.

# Screenshots
* Google:
![Screenshot of Google Search with search numbers][google-search]

* Yahoo (US)
![Screenshot of Yahoo Search (US) with search numbers][yahoo-us-search]

* Bing
![Screenshot of Bing Search with search numbers][bing-search]

[google-search]: https://github.com/nth10sd/search-keys/blob/master/screenshots/google.png "Screenshot of Google Search with search numbers"
[yahoo-us-search]: https://github.com/nth10sd/search-keys/blob/master/screenshots/yahoo-us.png "Screenshot of Yahoo Search (US) with search numbers"
[bing-search]: https://github.com/nth10sd/search-keys/blob/master/screenshots/bing.png "Screenshot of Bing Search with search numbers"
