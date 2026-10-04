# LG webOS TV IPTV Application - Installation & Remote Guide

This guide walks you through installing and running the **IPTV Live TV** app on your LG webOS Smart TV, and explains how to use your LG TV remote control to change channels.

---

## 📺 Remote Control Key Reference

| Remote Button | Key Code / Key | Action in App |
| :--- | :--- | :--- |
| **CH +** (Channel Up) | `427` / `PageUp` | **Instant Channel Up** (next live channel) |
| **CH -** (Channel Down) | `428` / `PageDown` | **Instant Channel Down** (previous live channel) |
| **0 – 9 (Number Pad)** | `48–57` / `96–105` | **Direct Channel Dialing** (e.g., press `1` for DD Tamil HD, `2` for Puthiya Thalaimurai, `3` for News18 Tamil, `13` for Aaj Tak HD) |
| **OK / Enter** | `13` / `Enter` | **Open Channel Guide / EPG** (or select focused channel) |
| **D-Pad ▲ / ▼** | `38` / `40` | **Navigate Channel List** (in Guide) or change channels (in Full Screen) |
| **D-Pad ◀ / ▶** | `37` / `39` | **Switch Categories** (Tamil, News, Sports, Entertainment, Music, Movies, Favorites) |
| **Back / Exit** | `461` / `Escape` | **Close Guide / Dismiss OSD** (press twice to exit app) |
| **Red Button** | `403` / `r` | **Favorite Shortcut** (adds/removes current channel to Favorites) |
| **Green Button** | `404` / `g` | **Category Switcher** (quick cycle to Tamil, News, Sports, etc.) |
| **Yellow Button** | `405` / `y` | **Aspect Ratio** (Fit 16:9, Stretch, Zoom, 4:3) |
| **Blue Button** | `406` / `b` | **Settings & Playlists** (switch preset or enter custom M3U URL) |
| **Play / Pause** | `415` / `19` / `Space` | **Pause / Resume** live stream |
| **Magic Remote Pointer** | Air Mouse Click | **Point & Click** on any channel card, category, or control |

---

## 🇮🇳 Tamil & Indian Channels (Placed First by Default)

The app is pre-configured with **all Indian channels (530+)** with **Tamil language channels at the very top (Channels 1 to 40)**:

- **CH 01**: **DD Tamil HD** (Doordarshan Tamil 1080p)
- **CH 02**: **Puthiya Thalaimurai News**
- **CH 03**: **News18 Tamil Nadu** (1080p)
- **CH 04**: **News 7 Tamil**
- **CH 05**: **Kalaignar TV**
- **CH 06**: **Raj TV HD** (1080p)
- **CH 07**: **Raj Digital Plus** (1080p)
- **CH 08**: **Aastha Tamil**
- **CH 09**: **Mediacorp Entertainment Tamil** (1080p)
- **CH 10**: **Shakthi TV Tamil**
- **CH 11**: **Vasantham TV Tamil**
- **CH 12**: **Star Tamil Television**
- **CH 13+**: **Aaj Tak HD, India Today, ABP News, 9XM, 9X Jalwa, &TV, Zee, DD National, DD Sports, and 500+ Indian channels!**

---

## 🚀 Method 1: Instant TV Browser Test (No Installation Required)

You can run the app immediately in your LG TV's built-in web browser:

1. On your PC, open a terminal in `f:/iptv-master/webos-app` and run:
   ```bash
   npm start
   ```
2. Note your PC's local IP address (e.g., `192.168.1.100`).
3. Turn on your LG TV and open the **Web Browser** app from the TV launcher.
4. Enter the address: `http://<YOUR_PC_IP>:3000` (e.g. `http://192.168.1.100:3000`).
5. Press the full-screen button in the TV browser.
6. Use your LG TV Remote (`CH+`, `CH-`, numbers, D-pad) to change channels!

---

## 📦 Method 2: Install as Native webOS App via webOS Dev Manager (Recommended)

This installs the app permanently onto your LG TV home screen like Netflix or YouTube.

### Step 1: Enable Developer Mode on your LG TV
1. On your LG TV, open the **LG Content Store** (Apps).
2. Search for and install **Developer Mode**.
3. Open the **Developer Mode** app on your TV.
4. Sign in with your free LG account (or create one at [developer.lge.com](https://webostv.developer.lge.com/)).
5. Toggle **Developer Mode** to **ON**.
6. Toggle **Key Server** to **ON**.
7. Note down the **IP Address** and **Passphrase** displayed on your TV screen.

### Step 2: Build the `.ipk` Package on PC
In your terminal, navigate to `f:/iptv-master/webos-app`:
```bash
npm run build:ipk
```
This generates `dist/org.iptv.webos_1.0.0_all.ipk`.

### Step 3: Install via webOS Dev Manager GUI
1. Download and install **webOS Dev Manager** on your computer (Free open-source tool: [webosbrew.org/dev-manager](https://github.com/webosbrew/dev-manager/releases)).
2. Launch webOS Dev Manager and click **+ Add Device**.
3. Enter your LG TV's IP address and the Passphrase from Step 1.
4. Once connected, click **Install** and select `dist/org.iptv.webos_1.0.0_all.ipk`.
5. The **IPTV Live TV** app is now installed on your TV!

---

## 💻 Method 3: Install via Official LG webOS CLI (`@webos-tools/cli`)

If you prefer command-line installation:

1. Add your TV:
   ```bash
   npx ares-setup-device
   ```
   Follow the prompts to add your TV's IP and port (default 9922).

2. Get the security key:
   ```bash
   npx ares-novacom --device <TV_NAME> --getkey
   ```
   (Enter the passphrase shown on your TV screen).

3. Install the app onto your TV:
   ```bash
   npx ares-install ./dist/org.iptv.webos_1.0.0_all.ipk --device <TV_NAME>
   ```

4. Launch the app:
   ```bash
   npx ares-launch org.iptv.webos --device <TV_NAME>
   ```

---

## ⚙️ Custom Playlists & Channels

- Press the **Blue button** (or click **Settings**) on your remote.
- Choose from preloaded presets (Global News, Sports, Movies, Kids, Entertainment, or country packs: US, UK, India, Germany, France, etc.).
- Or paste your own custom **M3U / M3U8 URL** from your IPTV provider.
- Channels are saved locally on the TV and will reload automatically every time you launch the app.
