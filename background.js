chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.remained_seconds) {
      console.log(`I got you ${message.remained_seconds}`)
      setTimeout(() => {
        // Send a message back to the content script indicating that the sleep is over
        sendResponse({message: "course_done"})
        
        //chrome.tabs.sendMessage(sender.tab.id, 'course_done');
      }, message.remained_seconds * 1000);
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type == "executeCode") {
      // Execute the code on the page's context
      chrome.tabs.executeScript(sender.tab.id, {code: request.code}, function() {
          // Send a response back to the content script
          sendResponse({message: "Code executed successfully!"});
      });
      console.log(request.code)
      // Indicate that we want to send a response asynchronously
      return true;
  }
});