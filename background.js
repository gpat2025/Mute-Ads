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
  
  const patterns = [ //Additional pattern founds for newer ad will go here.
    /DTD(\d+)s/i,
    /HIN_(\d{2})/,
    /HING_(\d{2})/,
    /ENG_(\d{2})/,
    /HINDI_(\d{2})/,
    /_(\d{2})_HIN/,
    /_(\d{2})_HING/,
    /_(\d{2})_ENG/,
    /_(\d{2})_HINDI/,
    /(\d{2})s/
  ];

  for (const pattern of patterns) {
    const match = adName.match(pattern);
    if (match) return parseInt(match[1]);
  }

  if (fullString.includes("15")) return 15;
  if (fullString.includes("30")) return 30;
  if (fullString.includes("bumper") || fullString.includes("short") || fullString.includes("pre-roll")) return 6;
  if (fullString.includes("midroll") || fullString.includes("full") || fullString.includes("spot")) return 30;

  return 10; // default fallback
}