chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.tabId >= 0) {
      const prefix = "ct_i";

      if (details.url.indexOf(prefix) !== -1) {
        chrome.tabs.update(details.tabId, { muted: true });
        console.log("Muted tab (ID):", details.tabId);

        // Extract ad duration
        const urlParams = new URLSearchParams(details.url.split('?')[1]);
        const adName = urlParams.get("adName");
        let delay = 10;

        if (adName) {
          const match = adName.match(/DTD(\d+)s/i);
          if (match && match[1]) {
            delay = parseInt(match[1]);
            console.log("Extracted ad duration:", delay, "seconds");
          }
        }

        // Countdown logic
        let remaining = delay - 0.5;
        const intervalId = setInterval(() => {
          chrome.action.setBadgeText({ text: (remaining + 0.5).toString(), tabId: details.tabId });
          chrome.action.setBadgeBackgroundColor({ color: "#FFFFFF", tabId: details.tabId });

          remaining--;

          if (remaining < 0) {
            clearInterval(intervalId);
            chrome.tabs.update(details.tabId, { muted: false });
            console.log("Unmuted tab after", delay, "seconds");

            chrome.action.setBadgeText({ text: "", tabId: details.tabId });
          }
        }, 1000);
      }
    }
  },
  { urls: ["<all_urls>"] }
);
