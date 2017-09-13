// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

function getMessage(message) {
  if (message.selection == "current") {
    // Navigate to the URL in the current tab
    browser.tabs.update({
      active: true,
      url: message.url
    })
  } else if (message.selection == "tab") {
    // Navigate to the URL in a new tab
    browser.tabs.create({
      active: true,
      // openerTabId: XX,  # Wait for Firefox 57, see bug 1238314
      url: message.url
    })
  } else if (message.selection == "window") {
    // Navigate to the URL in a new window
    browser.windows.create({
      url: message.url
    })
  }
}


// function getActiveTab() {
//   return browser.tabs.query({
//     active: true,
//     currentWindow: true
//   });
// }


// function gotPlatformInfo(info) {
//   getActiveTab().then((tabs) => {
//     browser.tabs.sendMessage(tabs[0].id, {
//       platform: info.os
//     })
//   })
// }


browser.runtime.onMessage.addListener(getMessage);
// browser.runtime.getPlatformInfo().then(gotPlatformInfo);
