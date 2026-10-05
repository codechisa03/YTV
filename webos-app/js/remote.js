/**
 * remote.js - LG webOS TV Remote Control & Spatial Navigation Handler
 * Supports LG Magic Remote, IR remote, Channel Up/Down, Number keys, D-pad, and Color keys.
 */

class RemoteHandler {
  constructor(app) {
    this.app = app;
    this.numberBuffer = "";
    this.numberTimer = null;
    this.numberDebounceMs = 1200;
    this.backPressTimer = null;
    this.backPressCount = 0;

    // WebOS specific keycodes mapping
    this.KEY_CODES = {
      // Channel keys
      CHANNEL_UP: [427, 33],     // 427: webOS, 33: PageUp
      CHANNEL_DOWN: [428, 34],   // 428: webOS, 34: PageDown
      
      // D-Pad / Navigation
      UP: [38],                  // ArrowUp
      DOWN: [40],                // ArrowDown
      LEFT: [37],                // ArrowLeft
      RIGHT: [39],               // ArrowRight
      ENTER: [13],               // OK / Enter
      
      // Back / Return
      BACK: [461, 27, 8],        // 461: webOS Back, 27: Escape, 8: Backspace

      // Color keys (LG Magic Remote / Standard TV remote)
      RED: [403],                // Key 'r'
      GREEN: [404],              // Key 'g'
      YELLOW: [405],             // Key 'y'
      BLUE: [406],               // Key 'b'

      // Media keys
      PLAY: [415],
      PAUSE: [19],
      PLAY_PAUSE: [179],
      STOP: [413],
      FAST_FORWARD: [417],
      REWIND: [412],

      // TV utility keys
      INFO: [457, 170],          // Key 'i'
      GUIDE: [458, 18],          // Key 'm' / Guide
      MENU: [458]
    };

    this.init();
  }

  init() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  handleKeyDown(e) {
    const code = e.keyCode;
    const key = e.key;

    // Let input typing proceed normally inside search or text inputs
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
      if (code === 13 || code === 27 || code === 38 || code === 40) {
        // Allow navigation away or submit
      } else {
        return;
      }
    }

    // Number keys: 0-9
    if ((code >= 48 && code <= 57) || (code >= 96 && code <= 105)) {
      e.preventDefault();
      const digit = (code >= 96 && code <= 105) ? (code - 96).toString() : (code - 48).toString();
      this.handleNumberInput(digit);
      return;
    }

    // Channel Up
    if (this.isMatch(code, this.KEY_CODES.CHANNEL_UP) || key === 'PageUp' || key === 'ChannelUp') {
      e.preventDefault();
      this.onChannelUp();
      return;
    }

    // Channel Down
    if (this.isMatch(code, this.KEY_CODES.CHANNEL_DOWN) || key === 'PageDown' || key === 'ChannelDown') {
      e.preventDefault();
      this.onChannelDown();
      return;
    }

    // Back button
    if (this.isMatch(code, this.KEY_CODES.BACK) || key === 'Escape' || key === 'Back') {
      e.preventDefault();
      this.onBack();
      return;
    }

    // OK / Enter button
    if (this.isMatch(code, this.KEY_CODES.ENTER) || key === 'Enter') {
      if (this.onEnter()) e.preventDefault();
      return;
    }

    // D-Pad Up
    if (this.isMatch(code, this.KEY_CODES.UP) || key === 'ArrowUp') {
      if (this.onUp()) e.preventDefault();
      return;
    }

    // D-Pad Down
    if (this.isMatch(code, this.KEY_CODES.DOWN) || key === 'ArrowDown') {
      if (this.onDown()) e.preventDefault();
      return;
    }

    // D-Pad Left
    if (this.isMatch(code, this.KEY_CODES.LEFT) || key === 'ArrowLeft') {
      if (this.onLeft()) e.preventDefault();
      return;
    }

    // D-Pad Right
    if (this.isMatch(code, this.KEY_CODES.RIGHT) || key === 'ArrowRight') {
      if (this.onRight()) e.preventDefault();
      return;
    }

    // Color keys: RED (Favorite)
    if (this.isMatch(code, this.KEY_CODES.RED) || key === 'r' || key === 'R') {
      e.preventDefault();
      this.app.toggleFavorite();
      return;
    }

    // Color keys: GREEN (Category quick-picker)
    if (this.isMatch(code, this.KEY_CODES.GREEN) || key === 'g' || key === 'G') {
      e.preventDefault();
      this.app.cycleCategory();
      return;
    }

    // Color keys: YELLOW (Aspect Ratio toggle)
    if (this.isMatch(code, this.KEY_CODES.YELLOW) || key === 'y' || key === 'Y') {
      e.preventDefault();
      this.app.cycleAspectRatio();
      return;
    }

    // Color keys: BLUE (Settings / Playlist modal)
    if (this.isMatch(code, this.KEY_CODES.BLUE) || key === 'b' || key === 'B') {
      e.preventDefault();
      this.app.toggleSettings();
      return;
    }

    // Media keys
    if (this.isMatch(code, this.KEY_CODES.PLAY) || this.isMatch(code, this.KEY_CODES.PAUSE) || this.isMatch(code, this.KEY_CODES.PLAY_PAUSE) || key === ' ') {
      e.preventDefault();
      this.app.togglePlayPause();
      return;
    }

    // Info key
    if (this.isMatch(code, this.KEY_CODES.INFO) || key === 'i' || key === 'I') {
      e.preventDefault();
      this.app.toggleInfoOSD();
      return;
    }

    // Guide / Menu key
    if (this.isMatch(code, this.KEY_CODES.GUIDE) || key === 'm' || key === 'M') {
      e.preventDefault();
      this.app.toggleGuide();
      return;
    }
  }

  isMatch(code, codeList) {
    return codeList.indexOf(code) !== -1;
  }

  handleNumberInput(digit) {
    this.numberBuffer += digit;
    this.app.showNumberDial(this.numberBuffer);

    if (this.numberTimer) {
      clearTimeout(this.numberTimer);
    }

    // Jump to channel after 1200ms of inactivity
    this.numberTimer = setTimeout(() => {
      this.commitNumberInput();
    }, this.numberDebounceMs);
  }

  commitNumberInput() {
    if (!this.numberBuffer) return;
    const num = parseInt(this.numberBuffer, 10);
    this.numberBuffer = "";
    this.app.hideNumberDial();
    if (!isNaN(num) && num > 0) {
      this.app.jumpToChannelNumber(num);
    }
  }

  onChannelUp() {
    if (this.numberBuffer) {
      this.commitNumberInput();
      return;
    }
    this.app.nextChannel();
  }

  onChannelDown() {
    if (this.numberBuffer) {
      this.commitNumberInput();
      return;
    }
    this.app.prevChannel();
  }

  onEnter() {
    if (this.numberBuffer) {
      if (this.numberTimer) clearTimeout(this.numberTimer);
      this.commitNumberInput();
      return true;
    }

    if (this.app.isGuideOpen && this.app.isGuideOpen()) {
      this.app.selectFocusedGuideItem();
      return true;
    } else if (this.app.isSettingsOpen && this.app.isSettingsOpen()) { /* check if method exists */
      this.app.confirmSettings();
      return true;
    } else if (this.app.playerModalOpen) {
      // In fullscreen player, Enter can toggle play/pause or OSD, let's just toggle OSD
      this.app.toggleInfoOSD();
      return true;
    }
    
    // We are on the main screen. If the focus is on a button or link, let native click handle it!
    // But if focus is just on the body, open guide.
    if (document.activeElement && (document.activeElement.tagName === 'BUTTON' || document.activeElement.tagName === 'A' || document.activeElement.tagName === 'INPUT')) {
      return false; // Let browser trigger the click
    }
    
    // Toggle Channel Guide if nothing is focused
    this.app.openGuide();
    return true;
  }

  onUp() {
    if (this.app.isGuideOpen()) {
      this.app.navigateGuide('up');
      return true;
    } else if (this.app.isSettingsOpen()) {
      this.app.navigateSettings('up');
      return true;
    } else if (this.app.playerModalOpen) {
      this.app.prevChannel();
      return true;
    }
    return false; // Let native spatial navigation handle focus
  }

  onDown() {
    if (this.app.isGuideOpen()) {
      this.app.navigateGuide('down');
      return true;
    } else if (this.app.isSettingsOpen()) {
      this.app.navigateSettings('down');
      return true;
    } else if (this.app.playerModalOpen) {
      this.app.nextChannel();
      return true;
    }
    return false;
  }

  onLeft() {
    if (this.app.isGuideOpen()) {
      this.app.navigateGuide('left');
      return true;
    } else if (this.app.isSettingsOpen()) {
      this.app.navigateSettings('left');
      return true;
    } else if (this.app.playerModalOpen) {
      // Maybe volume down or seek in future, but for now just consume it
      return true;
    }
    return false;
  }

  onRight() {
    if (this.app.isGuideOpen()) {
      this.app.navigateGuide('right');
      return true;
    } else if (this.app.isSettingsOpen()) {
      this.app.navigateSettings('right');
      return true;
    } else if (this.app.playerModalOpen) {
      return true;
    }
    return false;
  }

  onBack() {
    if (this.numberBuffer) {
      this.numberBuffer = "";
      this.app.hideNumberDial();
      return;
    }

    if (this.app.isSettingsOpen && this.app.isSettingsOpen()) { /* fallback if method missing, wait, I can just use exact bool flag like others */ }
    
    // In app.js we have settingsOpen, guideOpen, playerModalOpen properties.
    if (this.app.settingsOpen) {
      this.app.closeSettings();
      return;
    }

    if (this.app.guideOpen) {
      this.app.closeGuide();
      return;
    }

    if (this.app.playerModalOpen) {
      this.app.closePlayerModal();
      return;
    }

    // if not on default category (All), return home
    if (this.app.channelManager && this.app.channelManager.currentCategory !== 'All') {
      this.app.handleGlobalBack(); // returns to home easily
      return;
    }

    // If watching full-screen, handle TV exit
    this.handleTvExit();
  }

  handleTvExit() {
    this.backPressCount++;
    if (this.backPressCount === 1) {
      this.app.showToast("Press BACK again to exit app", 2500);
      this.backPressTimer = setTimeout(() => {
        this.backPressCount = 0;
      }, 2500);
    } else if (this.backPressCount >= 2) {
      if (this.backPressTimer) clearTimeout(this.backPressTimer);
      // Close application on webOS
      if (window.webOS && window.webOS.platformBack) {
        window.webOS.platformBack();
      } else if (window.close) {
        window.close();
      }
    }
  }
}

window.RemoteHandler = RemoteHandler;
