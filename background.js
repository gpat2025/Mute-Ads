chrome.webRequest.onBeforeRequest.addListener(
  async function (details) {
    if (details.tabId < 0) return;

    // Get the tab's actual URL
    const tab = await chrome.tabs.get(details.tabId);
    const tabUrl = tab.url || "";
  
    // Only proceed if it's a Hotstar tab
    if (!tabUrl.includes("hotstar.com")) return;

    const prefix = "ct_i";

    if (details.url.includes(prefix)) {

      // Store ad mute history for later
      const timestamp = new Date().toLocaleString();

      chrome.storage.local.get({ muteHistory: [] }, (data) => {
        const history = data.muteHistory;
        history.push({ adName, delay, timestamp });

        // Keep only latest 50 entries
        if (history.length > 50) history.shift();

        chrome.storage.local.set({ muteHistory: history });
      });

      chrome.tabs.update(details.tabId, { muted: true });

      const urlParams = new URLSearchParams(details.url.split('?')[1]);
      const adName = urlParams.get("adName");

      const delay = estimateAdDuration(adName, urlParams.get("campaignName"), urlParams.get("goalName"));

      let remaining = delay - 0.5;
      const intervalId = setInterval(() => {
        const badgeText = remaining > 99 ? "99+" : (remaining + 0.5).toString();
        chrome.action.setBadgeText({ text: badgeText, tabId: details.tabId });
        chrome.action.setBadgeBackgroundColor({ color: "#FFFFFF", tabId: details.tabId });

        remaining--;

        if (remaining < 0) {
          clearInterval(intervalId);
          chrome.tabs.update(details.tabId, { muted: false });
          chrome.action.setBadgeText({ text: "", tabId: details.tabId });
        }
      }, 1000);
    }
  },
  { urls: ["<all_urls>"] }
);

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "viewHistory",
    title: "View Ad Mute History",
    contexts: ["action"]
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "viewHistory") {
    chrome.tabs.create({ url: chrome.runtime.getURL("history.html") });
  }
});

function estimateAdDuration(adName = "", campaignName = "", goalName = "") {
  const fullString = [adName, campaignName, goalName].join(" ").toLowerCase();
  
  const directMatch = adName?.match(/DTD(\d+)s/i);
  if (directMatch) return parseInt(directMatch[1]);
  const hinMatch = adName?.match(/HIN_(\d{2})/);
  if(hinMatch) return parseInt(hinMatch[1]);
  const hingMatch = adName?.match(/HING_(\d{2})/);
  if(hingMatch) return parseInt(hingMatch[1]);
  const engMatch = adName?.match(/ENG_(\d{2})/);
  if(engMatch) return parseInt(engMatch[1]);

  const hindiMatch = adName?.match(/HINDI_(\d{2})/);
  if(hindiMatch) return parseInt(hindiMatch[1]);

  const hinMatchRev = adName?.match(/_(\d{2})_HIN/);
  if (hinMatchRev) return parseInt(hinMatchRev[1]);
  const hingMatchRev = adName?.match(/_(\d{2})_HING/);
  if (hingMatchRev) return parseInt(hingMatchRev[1]);
  const engMatchRev = adName?.match(/_(\d{2})_ENG/);
  if (engMatchRev) return parseInt(engMatchRev[1]);

  const hindiMatchRev = adName?.match(/_(\d{2})_HINDI/);
  if (hindiMatchRev) return parseInt(hindiMatchRev[1]);


  const secMatch = adName?.match(/(\d{2})s/);
  if(secMatch) return parseInt(secMatch[1]);
  /*
  const patterns = [
    /(\d{2})s/,                              // Pattern 1: 20s, 30s, etc.
    /_(\d{2})$/,                             // Pattern 2: ends with _20, _10
    /(ENG|HIN|TAM|KAN|BEN|MAR|TEL)_(\d{2})/,
    /_(\d{2})_(ENG|HIN|HING|TAM|KAN|BEN|MAR|TEL)/, // Pattern 3: _20_ENG, etc.
  ];

  for (const pattern of patterns) {
    const match = adName.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  */
  if (fullString.includes("15")) return 15;
  if (fullString.includes("30")) return 30;
  if (fullString.includes("bumper") || fullString.includes("short") || fullString.includes("pre-roll")) return 6;
  if (fullString.includes("midroll") || fullString.includes("full") || fullString.includes("spot")) return 30;

  return 10; // default fallback
}