// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

function getMessage(message) {
  if (message.selection) console.log("FOO");
  // console.log(browser.pageAction.getTitle())
  // browser.tabs.create({
  //     active: true,
  //     //  index: tabPosition,
  //     url: "https://www.google.com/"
  // })

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
