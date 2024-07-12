chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "samsungRedirect",
    title: "Grab a cookie and run back",
    contexts: ["page"],
    documentUrlPatterns: ["*://*.samsung.com/*/SystemParking.html"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "samsungRedirect") {
    const url = new URL(tab.url);
    const newUrl = `${url.origin}/getcookie.html`;
    chrome.tabs.update(tab.id, { url: newUrl });
  }
});

chrome.webRequest.onBeforeRedirect.addListener(
  (details) => {
    console.log("Redirect detected:", details.url, "->", details.redirectUrl);
    if (details.redirectUrl.endsWith("SystemParking.html")) {
      originalUrl = details.url;
      console.log(
        "SystemParking.html redirect detected. Original URL:",
        originalUrl
      );
      chrome.storage.local.set({ originalUrl: originalUrl }, () => {
        console.log("Original URL saved to storage:", originalUrl);
      });
    }
  },
  { urls: ["*://*.samsung.com/*"] },
  ["responseHeaders"]
);

chrome.webNavigation.onCompleted.addListener(
  (details) => {
    console.log("Page load completed:", details.url);
    if (details.url.endsWith("/getcookie.html")) {
      console.log("getcookie.html page detected");
      chrome.storage.local.get(["originalUrl"], (result) => {
        console.log("Retrieved from storage:", result.originalUrl);
        if (result.originalUrl) {
          console.log("Redirecting back to:", result.originalUrl);

          // Send message to content script to show redirect hint
          chrome.tabs.sendMessage(details.tabId, {
            action: "showRedirectHint",
            targetUrl: result.originalUrl
          });

          // Delay the redirect to allow time for the hint to be shown
          setTimeout(() => {
            chrome.tabs.update(
              details.tabId,
              { url: result.originalUrl },
              () => {
                if (chrome.runtime.lastError) {
                  console.error(
                    "Error updating tab:",
                    chrome.runtime.lastError
                  );
                } else {
                  console.log("Tab updated successfully");
                }
              }
            );
            chrome.storage.local.remove("originalUrl", () => {
              console.log("Original URL removed from storage");
            });
          }, 3000); // 3 second delay
        } else {
          console.log("No original URL found in storage");
        }
      });
    }
  },
  { url: [{ hostSuffix: "samsung.com" }] }
);
