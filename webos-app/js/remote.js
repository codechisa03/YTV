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
      e.preventDefault();
      this.onEnter();
      return;
    }

    // D-Pad Up
    if (this.isMatch(code, this.KEY_CODES.UP) || key === 'ArrowUp') {
      e.preventDefault();
      this.onUp();
      return;
    }

    // D-Pad Down
    if (this.isMatch(code, this.KEY_CODES.DOWN) || key === 'ArrowDown') {
      e.preventDefault();
      this.onDown();
      return;
    }

    // D-Pad Left
    if (this.isMatch(code, this.KEY_CODES.LEFT) || key === 'ArrowLeft') {
      e.preventDefault();
      this.onLeft();
      return;
    }

    // D-Pad Right
    if (this.isMatch(code, this.KEY_CODES.RIGHT) || key === 'ArrowRight') {
      e.preventDefault();
      this.onRight();
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
      return;
    }

    if (this.app.isGuideOpen()) {
      this.app.selectFocusedGuideItem();
    } else if (this.app.isSettingsOpen()) {
      this.app.confirmSettings();
    } else {
      // Toggle Channel Guide
      this.app.openGuide();
    }
  }

  onUp() {
    if (this.app.isGuideOpen()) {
      this.app.navigateGuide('up');
    } else if (this.app.isSettingsOpen()) {
      this.app.navigateSettings('up');
    } else {
      // In full-screen, Up switches to previous channel or opens guide
      this.app.prevChannel();
    }
  }

  onDown() {
    if (this.app.isGuideOpen()) {
      this.app.navigateGuide('down');
    } else if (this.app.isSettingsOpen()) {
      this.app.navigateSettings('down');
    } else {
      // In full-screen, Down switches to next channel
      this.app.nextChannel();
    }
  }

  onLeft() {
    if (this.app.isGuideOpen()) {
      this.app.navigateGuide('left');
    } else if (this.app.isSettingsOpen()) {
      this.app.navigateSettings('left');
    } else {
      this.app.cycleCategory(-1);
    }
  }

  onRight() {
    if (this.app.isGuideOpen()) {
      this.app.navigateGuide('right');
    } else if (this.app.isSettingsOpen()) {
      this.app.navigateSettings('right');
    } else {
      this.app.cycleCategory(1);
    }
  }

  onBack() {
    if (this.numberBuffer) {
      this.numberBuffer = "";
      this.app.hideNumberDial();
      return;
    }

    if (this.app.isSettingsOpen()) {
      this.app.closeSettings();
      return;
    }

    if (this.app.isGuideOpen()) {
      this.app.closeGuide();
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
