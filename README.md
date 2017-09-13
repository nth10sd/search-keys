[![Build Status](https://travis-ci.org/nth10sd/add-search-number.svg?branch=master)](https://travis-ci.org/nth10sd/add-search-number/)

# Add Search Number
A WebExtension port of "Search Keys" that allows going to search results by pressing a number instead of clicking.

Ported from Jesse Ruderman's [legacy add-on](https://www.squarefree.com/extensions/search-keys/):

```
For example, pressing 1 takes you to the first result. Hold Alt (Windows/Mac) or Ctrl (Linux) to open results in new tabs, or Shift to open results in new windows.

This extension can save you time because your hands are usually on the keyboard after you enter a search.
```

Add Search Number supports Google only for now.

# Requirements
Tested in Firefox 55 and up.

# Known Bugs
* When you use Search Keys to follow a link, the referrer is not sent.
* Search Keys conflicts with Find
  * If you press a number key while viewing a search-results page, Search Keys always handles it, even if you're trying to use Find and typed `/` or `'` beforehand
  * This is arguably a bug in Firefox
* If a search result's title text has a direction different from the page's direction (e.g. a Hebrew result in an English page), the green box indicating the shortcut is misplaced.
* On the Hebrew-language version of Google, the hint should be placed to the left but is placed to the right.
* Doesn't work when the search-results page is in a frame.
