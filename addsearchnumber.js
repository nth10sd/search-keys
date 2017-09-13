// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

(function () { // just for scoping

  // With Shift+1, keydown gets "1" (keyCode-48) while keypress gets "!" (charCode) with an American keyboard.
  // But we have to use keypress to suppress FAYT.
  // Crazy solution: assume keypress happens only immediately after keydown.  Have onkeydown set
  // a global variable, suppressKeypress, to tell onkeypress whether to stopPropagation and stuff.
  //
  // https://bugzilla.mozilla.org/show_bug.cgi?id=167145

  var suppressKeypress = false;

  window.addEventListener("keydown", searchnumbersKeydown, true); // Use capturing to beat FAYT.
  window.addEventListener("keypress", searchnumbersKeypress, true); // Use capturing to beat FAYT.


  function keycodeToTarget(keyCode) {
    // Number keys above letter keys
    if (48 < keyCode && keyCode <= 57) return keyCode - 48;
    if (keyCode == 48) return 10; // zero

    // Numeric keypad, with numlock on
    if (96 < keyCode && keyCode <= 105) return keyCode - 96;
    if (keyCode == 96) return 10; // zero

    if (keyCode == 188) // , or <
      return "prev";

    if (keyCode == 190) // . or >
      return "next";

    // Any other key
    return null;
  }


  function searchnumbersKeydown(event) {
    suppressKeypress = false;

    // A number from 1 to 10, "next", "prev", or null.
    var target = keycodeToTarget(event.keyCode);

    // Only trigger for digits, comma, and period.
    if (target == null)
      return;

    // Don't trigger if a form element has focus.
    // Copied from https://dxr.mozilla.org/aviarybranch/source/browser/base/content/browser.js#shouldFastFind
    // Modified to not care about <button> elements.  (<input type="button">, though...)
    // Modified for paranoia.
    var elt = document.commandDispatcher.focusedElement;
    if (elt) {
      var ln = new String(elt.localName).toLowerCase();
      if (ln == "input" || ln == "textarea" || ln == "select" || ln == "isindex")
        return;
    }

    // Only trigger for modifiers we should trigger for. (And calculate |where| for later.)
    var where = whereToOpen(event);
    if (where == "ignore")
      return; // in particular, don't suppress the keypress

    var activeEngine = getActiveEngine(_content.document);
    if (!activeEngine)
      return;

    // Go there.
    goToResult(activeEngine, target, where);

    // Suppress the keypress associated with this keydown, to stop FAYT.
    suppressKeypress = true;
  }


  function searchnumbersKeypress(event) {
    if (suppressKeypress) {
      // We handled the event, discourage others from handling it too.
      event.preventDefault(); // seems like a good idea
      event.stopPropagation(); // stop FAYT. would like to just stop FAYT from *starting*, but oh well.
    }
  }


  // Based on utilityOverlay.js from Firefox.
  function whereToOpen(e) {
    // Platform differences suck.
    // Really want to say "#ifndef XP_UNIX" from 256635, but I don't know how to do that in JS.
    var win = (navigator.platform.indexOf("Win") != -1);
    var mac = (navigator.platform.indexOf("Mac") != -1);
    var altForTabs = win || mac;

    var shift = e.shiftKey;
    var ctrl = e.ctrlKey;
    // var meta =  e.metaKey;
    var alt = e.altKey;

    if (altForTabs ? (alt && !ctrl) : (ctrl && !alt)) { /* Mac normally uses cmd (meta), btw */
      if (shift)
        return "tabshifted";
      else
        return "tab";
    } else if (!altForTabs ? (alt && !ctrl) : (ctrl && !alt)) {
      return "ignore";
    } else if (alt && ctrl) {
      // Bug 69954 prevents this from being reached on Windows.
      return null;
    } else if (shift) {
      return "window";
    } else {
      return "current";
    }
  }


  // https://developer.mozilla.org/en-US/Add-ons/Code_snippets/On_page_load
  // https://bugzilla.mozilla.org/show_bug.cgi?id=329514
  // Need to test: load in foreground tab. middle-clicking "next" should do the right thing (and not the wrong thing).
  // Need to test: Firefox 1.5.0.7, Firefox 2.
  window.addEventListener("load", searchNumbersInit, false);


  function searchNumbersInit() {
    window.removeEventListener("load", searchNumbersInit, false); // Don't want this firing for e.g. page loads in Firefox 2

    var appcontent = document.getElementById("appcontent");
    appcontent.addEventListener("load", onPageLoad, true);
  }


  function onPageLoad(event) {
    var doc = event.originalTarget;
    if (doc.nodeName != "#document")
      return;

    var engine = getActiveEngine(doc);
    if (!engine || engine.noHints)
      return;

    var links = doc.links;

    var currentResultNumber = 0;

    var i, link;
    for (i = 0;
      (link = links[i]); ++i) { // Warning: loop is very similar to a loop in another function
      if (testLink(engine, link)) {
        ++currentResultNumber;
        addHint(link, currentResultNumber);
        if (currentResultNumber == 10)
          break;
      }
    }

    if (engine.next) {
      var next = engine.next(doc);
      if (next)
        next.appendChild(doc.createTextNode(" (.)"));
    }

    if (engine.prev) {
      var prev = engine.prev(doc);
      if (prev)
        prev.appendChild(doc.createTextNode(" (,)"));
    }
  }


  function addHint(linkNode, resultNumber) {
    var doc = linkNode.ownerDocument;

    var hint = doc.createElementNS("http://www.w3.org/1999/xhtml", "span");
    hint.className = "searchnumbers-hint" // for the benefit of user style sheets, test styles
    hint.style.color = "green";
    hint.style.background = "white";
    hint.style.border = "1px solid";
    hint.style.padding = "1px 2px 1px 2px";
    hint.style.marginLeft = ".5em"; // inline elements can have margins? cool!
    // hint.style.marginRight = ".5em"; // just in case we're in RTL-land?

    hint.appendChild(doc.createTextNode(resultNumber == 10 ? 0 : resultNumber));

    linkNode.parentNode.insertBefore(hint, linkNode.nextSibling);
  }


  function testLink(engine, link) {
    // Hack to not conflict with Search Preview and McSearchPreview extensions, which should be nice and use .className.
    if (link.firstChild && link.firstChild.tagName && link.firstChild.tagName.toUpperCase() == "IMG" &&
      link.firstChild.style && link.firstChild.style.margin)
      return false;

    // Additional hack to not conflict with "new-window" link added by McSearchPreview extension.
    if (link.getElementsByTagName("img")[0] &&
      link.getElementsByTagName("img")[0].src == "http://docs.g-blog.net/code/mozilla_extensions/img/nw.gif")
      return false;

    return engine.testLink(link);
  }


  /*
   * stringToURI: converts URL (string) to URI (nsIURI object), relative to base URI (if provided).
   * Returns null for bogus or non-http URLs!  Caller must check!
   * From Thumbs.
   */
  function stringToURI(url, base) {
    var uri;

    var ioService = Components.classes["@mozilla.org/network/io-service;1"].
    getService(Components.interfaces.nsIIOService);

    try {
      uri = ioService.newURI(url, null, base || null);
    } catch (er) {
      // aim: URLs, totally bogus URLs resulting from "remove redirects" on a javascript: link, etc.
      return null;
    }

    if (uri.schemeIs("http") || uri.schemeIs("https"))
      return uri;

    return null;
  }


  function getActiveEngine(doc) {
    if (!doc.location) // when would this happen? it did...
      return null;

    // Use doc.documentURI instead of doc.location.href to work around bug 264830.
    var uri = stringToURI(doc.documentURI);

    if (!uri)
      return null;

    var i, engine;
    for (i = 0;
      (engine = searchnumbersEngines[i]); ++i)
      if (engine.test(uri))
        return engine;

    return null;
  }


  function goToResult(engine, resultNumber, where) {
    var link;
    var doc = _content.document; // only called for the current tab, so should be correct.

    if (resultNumber == "next" && engine.next) {
      link = engine.next(doc);
    } else if (resultNumber == "prev" && engine.prev) {
      link = engine.prev(doc);
    } else {
      link = findResultNumbered(engine, resultNumber);
    }

    if (link)
      followLink(link, where);

    // Using alert breaks the blocking-FAYT hack, sucks if you press '1' while the page is loading, etc.
    // So just fail silently.
    // alert("Can't go to result number " + resultNumber + " of (number of search results)!");
  }


  function findResultNumbered(engine, resultNumber) {
    var links = _content.document.links;

    var currentResultNumber = 0;

    var i, link;
    for (i = 0;
      (link = links[i]); ++i) { // Warning: loop is very similar to a loop in another function
      if (testLink(engine, link)) {
        ++currentResultNumber;
        if (currentResultNumber == resultNumber) {
          return link;
        }
      }
    }

    return null;
  }


  function followLink(linkNode, where) {
    // Focus the link.
    // (Selecting it might be better, but this works for now.)
    linkNode.focus();

    // Follow the link.
    // (Using openUILink means we don't send a referrer.  That's a little sketchy.
    // How about simulating a click and calling contentAreaClick or handleLinkClick?)
    var uri = stringToURI(linkNode.href); // for paranoia
    var url = uri.spec;
    openUILinkIn(url, where);
  }


  // Returns the first item of an array or NodeList.  If empty, returns null (without triggering a strict warning).
  function firstItem(a) {
    if (a.length > 0)
      return a[0];
    return null;
  }


  var searchnumbersEngines = [
    // Each search engine has two boolean functions:
    //
    // * test(uri).  Returns true if this URL is a search results page for this search engine.
    //     Look at the following page for how to use nsIURI objects:
    //       https://hg.mozilla.org/mozilla-central/file/ea7b55d65d76/netwerk/base/nsIURI.idl#l8
    //
    // * testLink(linkNode).  Returns true if this link represents a search result.
    //
    // Two optional functions return link nodes:
    //
    // * prev(doc).  Returns a link to the previous page of search results, or null/undefined if none.
    //
    // * next(doc).  Returns a link to the next page of search results, or null/undefined if none.
    {
      // results in the "did you mean?" section have no className. other results have classname of l (lowercase L).

      name: "Google (web search)",
      test: function (uri) {
        return uri.host.indexOf("google") != -1 &&
          (uri.path.substr(0, 8) == "/search?" || uri.path.substr(0, 8) == "/custom?");
      },
      testLink: function (linkNode) {
        return (linkNode.className == "l" || linkNode.className == "") && // empty for did-you-mean results (desired)
          linkNode.parentNode.tagName.toLowerCase() == "h3" && // h4 for local maps results (not desired)
          linkNode.parentNode.className == "r";
      },
      prev: function (doc) {
        var c = doc.getElementById("nav").rows[0].cells;
        return firstItem(c[0].getElementsByTagName("a"));
      },
      next: function (doc) {
        var c = doc.getElementById("nav").rows[0].cells;
        return firstItem(c[c.length - 1].getElementsByTagName("a"));
      },
    },

    {
      name: "Yahoo (web search)",
      test: function (uri) {
        return uri.host == "search.yahoo.com";
      },
      testLink: function (linkNode) {
        return linkNode.className == "yschttl spt";
      },
      prev: function (doc) {
        return doc.getElementById("pg-prev");
      },
      next: function (doc) {
        return doc.getElementById("pg-next");
      }
    },

    {
      name: "Bing (web search)",
      test: function (uri) {
        return uri.host.match(/(^|\.)bing.com$/)
      },
      testLink: function (linkNode) {
        return linkNode.parentNode && linkNode.parentNode.parentNode &&
          linkNode.parentNode.tagName.toLowerCase() == "h3" &&
          linkNode.parentNode.parentNode.className == "sb_tlst"
      },
      prev: function (doc) {
        return firstItem(doc.getElementsByClassName("sb_pagP"));
      },
      next: function (doc) {
        return firstItem(doc.getElementsByClassName("sb_pagN"));
      }
    }
  ];

})();