chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background:", message);
  if (message.type === "openViewer") {
    chrome.storage.local.set(
      {
        hierarchy: JSON.stringify(message.data.hierarchy),
        apiMessages: JSON.stringify(message.data.apiMessages), // Store apiMessages
      },
      () => {
        console.log("hierarchy and apiMessages saved to local storage");
        const url = chrome.runtime.getURL("viewer.html");
        chrome.tabs.create({ url }, (tab) => {
          console.log("New tab created:", tab);
        });
      },
    );
  }
  sendResponse("Message logged");
});
