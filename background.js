chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "samsungRedirect",
    title: "Get cookie",
    contexts: ["page"],
    documentUrlPatterns: [
      "*://*.samsung.com/*/SystemParking.html",
    ],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "samsungRedirect") {
    const url = new URL(tab.url);
    const newUrl = `${url.origin}/getcookie.html`;
    chrome.tabs.update(tab.id, { url: newUrl });
  }
});
