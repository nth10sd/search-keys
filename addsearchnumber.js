// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

// Returns the first item of an array or NodeList.  If empty, returns null (without triggering a strict warning).
function firstItem(a) {
  if (a.length > 0)
    return a[0];
  return null;
}


var searchnumbersEngines = [
  // Each search engine has two boolean functions:
  //
  // * test(url).  Returns true if this URL is a search results page for this search engine.
  // * testLink(linkNode).  Returns true if this link represents a search result.
  //
  // Two optional functions return link nodes:
  //
  // * prev(doc).  Returns an object with the link to the previous page of search results and the node to be clicked,
  //               or null if none.
  //
  // * next(doc).  Returns an object with the link to the next page of search results and the node to be clicked,
  //               or null if none.
  {
    // results in the "did you mean?" section have no className. other results have classname of l (lowercase L).

    name: "Google (web search)",
    test: function (url) {
      return url.host.indexOf("google") != -1 && url.pathname.substr(0, 7) == "/search";
    },
    testLink: function (linkNode) {
      return (linkNode.className == "l" || linkNode.className == "") && // empty for did-you-mean results (desired)
        linkNode.parentNode.tagName.toLowerCase() == "h3" && // h4 for local maps results (not desired)
        linkNode.parentNode.className == "r";
    },
    prev: function (document) {
      var c = document.getElementById("nav").rows[0].cells;
      var pNode = firstItem(c[0].getElementsByTagName("a"));
      if (!pNode)
        return null;
      return {
        "focus": pNode.focus(),
        "href": pNode.href,
        "clickNode": pNode.lastElementChild
      }
    },
    next: function (document) {
      var c = document.getElementById("nav").rows[0].cells;
      var nNode = firstItem(c[c.length - 1].getElementsByTagName("a"));
      if (!nNode)
        return null;
      return {
        "focus": nNode.focus(),
        "href": nNode.href,
        "clickNode": nNode.lastElementChild
      }
    },
  }
];

// With Shift+1, keydown gets "1" (keyCode-48) while keypress gets "!" (charCode) with an American keyboard.
// But we have to use keypress to suppress FAYT.
// Crazy solution: assume keypress happens only immediately after keydown.  Have onkeydown set
// a global variable, suppressKeypress, to tell onkeypress whether to stopPropagation and stuff.
//
// https://bugzilla.mozilla.org/show_bug.cgi?id=167145

var suppressKeypress = false;

window.addEventListener("keydown", searchnumbersKeydown, true); // Use capturing to beat FAYT.
window.addEventListener("keypress", searchnumbersKeypress, true); // Use capturing to beat FAYT.


function init() {
  var engine = getActiveEngine(document);
  if (!engine)
    return null;

  var currentResultNumber = 0;

  var i, link;
  for (i = 0;
    (link = document.links[i]); ++i) { // Warning: loop is very similar to a loop in another function
    if (engine.testLink(link)) {
      ++currentResultNumber;
      addHint(link, currentResultNumber);
      if (currentResultNumber == 10)
        break;
    }
  }

  if (engine.next) {
    var next = engine.next(document);
    if (next)
      next.clickNode.appendChild(document.createTextNode(" (.)"));
  }

  if (engine.prev) {
    var prev = engine.prev(document);
    if (prev)
      prev.clickNode.appendChild(document.createTextNode(" (,)"));
  }
}

init();


function ensureURL(urllink) {
  var url;
  url = new URL(urllink);

  if (!url) return null;

  if (url.protocol.indexOf("http") !== -1 || url.protocol.indexOf("https") !== -1) {
    return url;
  } else {
    return null;
  }
}


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
  var elt = document.activeElement;
  if (elt) {
    var ln = new String(elt.localName).toLowerCase();
    if (ln == "input" || ln == "textarea" || ln == "select" || ln == "isindex")
      return;
  }

  // Only trigger for modifiers we should trigger for. (And calculate |where| for later.)
  var where = whereToOpen(event);
  if (where == "ignore")
    return; // in particular, don't suppress the keypress

  var activeEngine = getActiveEngine(document);
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
  // This isn't working yet. This will likely improve cross-browser support.
  //
  // var currentPlatform = "";
  // browser.runtime.onMessage.addListener(request => {
  //   currentPlatform = request.platform;
  // });
  // var win = (currentPlatform.indexOf("win") !== -1);
  // var mac = (currentPlatform.indexOf("mac") !== -1);

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


function getActiveEngine(doc) {
  if (!doc.location) // when would this happen? it did...
    return null;

  var url = ensureURL(doc.location.href);

  if (!url)
    return null;

  var i, engine;
  for (i = 0;
    (engine = searchnumbersEngines[i]); ++i)
    if (engine.test(url))
      return engine;

  return null;
}


function goToResult(engine, resultNumber, where) {
  var link;

  if (resultNumber == "next" && engine.next) {
    link = engine.next(document);
  } else if (resultNumber == "prev" && engine.prev) {
    link = engine.prev(document);
  } else {
    link = findResultNumbered(engine, resultNumber);
  }

  if (link) {
    // Focus the link.
    // (Selecting it might be better, but this works for now.)
    link.focus;

    var urlout = ensureURL(link.href);

    if (!urlout)
      return;

    // Follow the link, but note that no referrer is sent.
    if (where == "current") {
      browser.runtime.sendMessage({
        "selection": where,
        "url": urlout.href
      });
    } else if (where == "tab") {
      browser.runtime.sendMessage({
        "selection": where,
        "url": urlout.href
      });
    } else if (where == "window") {
      browser.runtime.sendMessage({
        "selection": where,
        "url": urlout.href
      });
    } else return;
  } else return;  // Might be an absent "prev" or "next"
}


function findResultNumbered(engine, resultNumber) {
  var links = document.links;

  var currentResultNumber = 0;

  var i, link;
  for (i = 0;
    (link = links[i]); ++i) { // Warning: loop is very similar to a loop in another function
    if (engine.testLink(link)) {
      ++currentResultNumber;
      if (currentResultNumber == resultNumber) {
        return link;
      }
    }
  }

  return null;
}
