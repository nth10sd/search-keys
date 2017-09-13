function getMessage(message) {
  if (message.selection) console.log("FOO");
  // console.log(browser.pageAction.getTitle())
  // browser.tabs.create({
  //     active: true,
  //     //  index: tabPosition,
  //     url: "https://www.google.com/"
  // })

}

browser.runtime.onMessage.addListener(getMessage);
