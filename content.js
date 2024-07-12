chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showRedirectHint") {
    const hintElement = document.createElement("div");
    hintElement.id = "redirectHint";
    hintElement.textContent = `Redirecting back to ${request.targetUrl}`;
    document.body.appendChild(hintElement);

    setTimeout(() => {
      hintElement.remove();
    }, 3000);
  }
});
