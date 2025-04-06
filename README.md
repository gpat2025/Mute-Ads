# 🧹 Chrome Extension: Auto Mute Tab When Ad Plays

This Chrome extension automatically mutes a browser tab when a live sports stream plays an ad, and unmutes it after the ad ends — based on detecting specific tracking URLs and parsing the ad duration.

#### Created by : Akshay S, Gaurav P
#### Documentation : Gaurav P (by chat-gpt)
#### Idea by : Sanket


---

## 🔧 Features

- ✅ Mutes tab when ad is detected
- ⏳ Shows countdown on extension badge
  ![image](https://github.com/user-attachments/assets/6470a136-c10a-4307-b999-34d14ddf23de)
- 🔇 Unmutes tab automatically when ad is over
- 🧠 Ad duration extracted dynamically from URL (e.g. `DTD15s` → 15 seconds)

---

## 📦 Installation (Manual for Chrome)

Chrome doesn’t allow unlisted extensions without publishing, but you can easily **install this as an unpacked extension**. Here's how:

### 🦪 Step-by-Step Instructions

1. **Download or Clone the Repository**

   ```bash
   git clone https://github.com/gpat2025/Mute-Ads.git
   ```

   Or click **Code → Download ZIP**, then extract it.

2. **Open Chrome Extensions Page**

   In Chrome, go to:

   ```
   chrome://extensions/
   ```

3. **Enable Developer Mode**

   Toggle the switch in the top-right corner labeled **Developer mode**.

4. **Click “Load Unpacked”**

   - Browse and select the folder where you cloned or extracted the extension.
   - It should contain `manifest.json`, `background.js`, etc.

5. **Extension Will Appear in Toolbar**

   You’ll now see the extension icon in the top-right of your browser.

6. **Test It**

   - Open supported stream.
   - When an ad plays (and the tracking URL includes a known pattern), the tab will mute.
   - A countdown appears in the extension badge.
   - Once the ad duration completes, the tab unmutes automatically.

---

## 🔒 Permissions Used

- `tabs`: To mute and unmute the tab
- `webRequest` : To intercept and analyze ad-related URLs
- `storage`: (optional) for storing settings like mute delay (not implemented)
- `notification`: Required for `<all_urls>` to monitor network traffic (not implemented)

---

## 🛠️ Customize

You can change the default delay or enhance features by editing:

- `background.js`: The core logic
- `manifest.json`: Extension configuration

---

## 🧪 Development Notes

- This is a local-only tool meant for personal use.
- Chrome may disable unpacked extensions after restart in some systems; just re-enable from `chrome://extensions/`.

---

## 📄 License

MIT – free to use, modify, and distribute.

---

## 🙌 Contributions

Got an idea to improve this? Pull requests and issues are welcome!

