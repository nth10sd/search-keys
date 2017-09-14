# Changelog

* 2.0.0 (2017-09-13)
  * Finally move off old legacy interfaces, e.g. nsIIOService
  * Make search result link detection use querySelector
  * We no longer focus on elements when they are selected as the focus code was not working well
  * Reinstated/Added support for most major default search engines
    * Yahoo HK/TW/US
    * Bing
    * DuckDuckGo
    * Wikipedia

* 1.9.0 beta (2017-09-08) - unreleased
  * Forked from [Search Keys](https://www.squarefree.com/extensions/search-keys/) version 1.0.1
  * Name changed to "Add Search Number"
  * Ported to WebExtensions
  * Beta for now, until it is stable enough to hit 2.0.0

The following is adapted from the [changelog](https://www.squarefree.com/extensions/search-keys/) of the Firefox legacy Search Keys add-on. All links updated to use https or point to an archive.org version where unavailable.

* Search Keys 1.0.1 (2010-01-05)
  * Fix JavaScript strict warnings

* Search Keys 1.0 (2009-11-05)
  * Updated to work with Google's next/previous page   links again
  * Updated to work on Yahoo again
  * Added Bing
  * Removed many engines that broke over the years.
  * Unjarred chrome
  * Switched from `contents.rdf` to `chrome.manifest`
    * Required for Firefox 3.6

* Search Keys 0.8.1 (2006-11-28)
  * Updated to work on Google again.
  * Dropped support for Google Groups.
    * The site recently changed to use less semantic HTML
      * Made it harder for Search Keys to identify the main links
    * Also, there's a beta, which uses different HTML
      * May presumably replace Google Groups at some point.

* Search Keys 0.8 (2006-10-28)
  * Updated to make the previous/next shortcuts (`,` and `.`) work on Google again
    * Google made a clever change
      * The navigation section no longer uses a bunch of tiny images
      * Instead splits [this image](https://www.google.com/images/nav_logo.png) using CSS
  * Updated to work on Google News again
  * Updated to work on Yahoo Local again
  * Removed support for Google Local, which has been merged in Google Maps
    * These shortcuts don't make much sense on Google Maps
  * Made the hints show up on trunk again
    * Using the technique in [this article](https://developer.mozilla.org/en-US/Add-ons/Code_snippets/On_page_load)
  * Fixed it to create DOM nodes for the hints in the correct document
    * So it won't break when [Firefox trunk starts throwing WRONG_DOCUMENT_ERR](https://bugzilla.mozilla.org/show_bug.cgi?id=47903) in compliance with DOM specs

* Search Keys 0.7.3 (2006-01-13)
  * Fixed a potential minor leak by adding `var link;` to the goToResult function

* Search Keys 0.7.2 (2005-11-29)
  * Made it work on pages resulting from address bar searches
    * You'll only notice this fix if you have [changed keyword.URL](https://www.squarefree.com/2004/09/09/googles-browse-by-name-in-firefox/) to something other than Google's "I'm Feeling Lucky"
    * The fix is a workaround for a bug in Firefox, [bug 264830](https://bugzilla.mozilla.org/show_bug.cgi?id=264830)

* Search Keys 0.7.1 (2005-11-28)
  * Fixed it to work on Google again
    * Broken by a recent change by Google
  * Fixed it to work with del.icio.us again
    * Broken by a not-so-recent change by del.icio.us

* Search Keys 0.7
  * Fixed a JavaScript Strict warning: `function getActiveEngine does not always return a value`
  * Made `.` and `,` navigate between pages of search results on Google
  * Marked the extension as working in Firefox 1.1α1

* Search Keys 0.6 (2004-11-13)
  * Add support for [Google Local](https://local.google.com/)
  * Add support for [Yahoo!](https://search.yahoo.com/), [Yahoo! Image Search](https://images.search.yahoo.com/), [Yahoo! News search](https://news.yahoo.com/), [Yahoo! Local](https://local.yahoo.com/), and [Yahoo! Personals](https://personals.yahoo.com/)
    * [Code provided by Marc Abramowitz of Yahoo!](https://web.archive.org/web/20081211234854/http://www.ysearchblog.com/archives/000044.html)

* Search Keys 0.5 (2004-10-29)
  * Make number keys on numeric keypad work
    * They only work when Numlock is on and they don't work with Shift

* Search Keys 0.4.2 (2004-10-16)
  * Support custom Google web searches in addition to normal Google searches
  * Support Google Images, with no boxes showing shortcuts

* Search Keys 0.4.1 (2004-10-16)
  * Also avoid conflict with tab-switching shortcut on Linux

* Search Keys 0.4 (2004-10-16)
  * On Windows and Mac, use Alt+number instead of Ctrl+number for opening in a new tab
    * To avoid conflict with tab-switching shortcuts
  * Skip preview links added by the Search Preview and McSearchPreview extensions
  * Remove Bugzilla support
  * Update maxVersion so Firefox 1.0 knows this extension works with it

* Search Keys 0.3 (2004-10-15)
  * Support international versions of Google, Google News, and Google Groups
  * Make boxes containing numbers slightly shorter
  * Add an extension icon

* Search Keys 0.2 (2004-10-14)
  * Next to each search result, show its number

* Search Keys 0.1 (2004-10-14)
  * Initial release
