chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.remained_seconds) {
      console.log(`I got you ${message.remained_seconds}`)
      setTimeout(() => {
        // Send a message back to the content script indicating that the sleep is over
        chrome.tabs.sendMessage(sender.tab.id, 'course_done');
      }, message.remained_seconds * 1000);
    }
});