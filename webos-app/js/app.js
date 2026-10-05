/**
 * app.js - Main Application Orchestrator for LG webOS TV IPTV App
 */

class IPTVApp {
  constructor() {
    this.channelManager = new ChannelManager();
    this.player = null;
    this.remote = null;

    // UI state
    this.osdTimer = null;
    this.toastTimer = null;
    this.guideOpen = false;
    this.settingsOpen = false;
    this.guideFocusArea = 'channels'; // 'categories' | 'channels'
    this.focusedCategoryIndex = 0;
    this.focusedChannelIndex = 0;
    this.focusedSettingsIndex = 0;

    // Clock
    this.clockInterval = null;
  }

  async init() {
    const videoEl = document.getElementById('video-player');
    this.player = new StreamPlayer(videoEl, {
      onStatusChange: (status, details) => this.onPlayerStatusChange(status, details),
      onResolutionChange: (res) => this.onResolutionChange(res)
    });

    this.remote = new RemoteHandler(this);

    this.initClock();
    this.setupEventListeners();

    // Initialize channels and load initial stream
    await this.channelManager.init();
    this.renderCategories();
    this.renderChannelList();

    const initialChannel = this.channelManager.getCurrentChannel();
    if (initialChannel) {
      this.playChannel(initialChannel);
    }

    // Set initial focus
    this.focusedChannelIndex = this.channelManager.currentIndex;
  }

  initClock() {
    const clockEl = document.getElementById('osd-clock');
    const update = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      if (clockEl) clockEl.textContent = `${hours}:${minutes}`;
    };
    update();
    this.clockInterval = setInterval(update, 1000);
  }

  setupEventListeners() {
    // Magic Remote pointer / mouse hover and clicks
    document.getElementById('btn-guide-toggle').addEventListener('click', () => this.toggleGuide());
    document.getElementById('btn-settings-toggle').addEventListener('click', () => this.toggleSettings());
    const fullscreenBtn = document.getElementById('btn-fullscreen-toggle');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    // Sync UI when user presses Escape to exit fullscreen
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        this._applyFullscreenUI(false);
      }
    });

    // Tap anywhere on video to show header again in fullscreen
    document.getElementById('video-container').addEventListener('click', () => {
      if (document.body.classList.contains('is-fullscreen')) {
        const header = document.getElementById('header-bar');
        if (header) {
          header.style.opacity = '1';
          header.style.pointerEvents = '';
          clearTimeout(this._headerHideTimer);
          this._headerHideTimer = setTimeout(() => {
            if (document.body.classList.contains('is-fullscreen')) {
              header.style.opacity = '0';
              header.style.pointerEvents = 'none';
            }
          }, 3000);
        }
      }
    });
    document.getElementById('modal-close-btn').addEventListener('click', () => this.closeSettings());
    document.getElementById('guide-backdrop').addEventListener('click', () => this.closeGuide());

    // Settings save button
    document.getElementById('btn-save-playlist').addEventListener('click', () => this.saveCustomPlaylist());

    // Search input
    const searchInput = document.getElementById('channel-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const filtered = this.channelManager.search(e.target.value);
        this.renderChannelList(filtered);
      });
    }

    // Virtual remote toggler
    const toggleRemoteBtn = document.getElementById('btn-virtual-remote-toggle');
    if (toggleRemoteBtn) {
      toggleRemoteBtn.addEventListener('click', () => {
        document.getElementById('virtual-remote-container').classList.toggle('hidden');
      });
    }

    this.setupVirtualRemoteButtons();
  }

  setupVirtualRemoteButtons() {
    const map = {
      'vrem-ch-up': () => this.nextChannel(),
      'vrem-ch-down': () => this.prevChannel(),
      'vrem-up': () => this.remote.onUp(),
      'vrem-down': () => this.remote.onDown(),
      'vrem-left': () => this.remote.onLeft(),
      'vrem-right': () => this.remote.onRight(),
      'vrem-ok': () => this.remote.onEnter(),
      'vrem-back': () => this.remote.onBack(),
      'vrem-guide': () => this.toggleGuide(),
      'vrem-info': () => this.toggleInfoOSD(),
      'vrem-fullscreen': () => this.toggleFullscreen(),
      'vrem-red': () => this.toggleFavorite(),
      'vrem-green': () => this.cycleCategory(),
      'vrem-yellow': () => this.cycleAspectRatio(),
      'vrem-blue': () => this.toggleSettings(),
      'vrem-play': () => this.togglePlayPause()
    };

    Object.keys(map).forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          map[id]();
        });
      }
    });

    // Digits 0-9
    for (let i = 0; i <= 9; i++) {
      const btn = document.getElementById(`vrem-${i}`);
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.remote.handleNumberInput(String(i));
        });
      }
    }
  }

  // --- Channel Playback ---

  playChannel(channel) {
    if (!channel) return;
    this.player.playStream(channel.url);
    this.updateOSD(channel);
    this.showOSD();
    this.highlightCurrentChannelInList();
  }

  nextChannel() {
    const ch = this.channelManager.nextChannel();
    if (ch) {
      this.playChannel(ch);
      this.showToast(`CH ${ch.num}: ${ch.name}`);
    }
  }

  prevChannel() {
    const ch = this.channelManager.prevChannel();
    if (ch) {
      this.playChannel(ch);
      this.showToast(`CH ${ch.num}: ${ch.name}`);
    }
  }

  jumpToChannelNumber(num) {
    const ch = this.channelManager.jumpToNumber(num);
    if (ch) {
      this.playChannel(ch);
      this.showToast(`Jumped to CH ${ch.num}: ${ch.name}`);
    } else {
      this.showToast(`Channel ${num} not found`, 3000);
    }
  }

  selectChannelByIndex(index) {
    const channels = this.channelManager.filteredChannels;
    if (channels && channels[index]) {
      const ch = channels[index];
      this.channelManager.selectChannel(ch);
      this.playChannel(ch);
      this.closeGuide();
    }
  }

  // --- OSD Banner & Dial Overlays ---

  updateOSD(channel) {
    const numEl = document.getElementById('osd-channel-num');
    const nameEl = document.getElementById('osd-channel-name');
    const catEl = document.getElementById('osd-channel-category');
    const logoEl = document.getElementById('osd-channel-logo');
    const favIcon = document.getElementById('osd-fav-icon');

    if (numEl) numEl.textContent = String(channel.num).padStart(2, '0');
    if (nameEl) nameEl.textContent = channel.name;
    if (catEl) catEl.textContent = channel.category || 'General';

    if (logoEl) {
      if (channel.logo) {
        logoEl.src = channel.logo;
        logoEl.style.display = 'block';
        logoEl.onerror = () => { logoEl.style.display = 'none'; };
      } else {
        logoEl.style.display = 'none';
      }
    }

    if (favIcon) {
      favIcon.style.display = this.channelManager.isFavorite(channel) ? 'inline-block' : 'none';
    }
  }

  showOSD() {
    const osd = document.getElementById('channel-osd');
    if (!osd) return;

    osd.classList.remove('hidden');
    osd.classList.add('visible');

    if (this.osdTimer) clearTimeout(this.osdTimer);
    this.osdTimer = setTimeout(() => {
      this.hideOSD();
    }, 4500);
  }

  hideOSD() {
    const osd = document.getElementById('channel-osd');
    if (osd) {
      osd.classList.remove('visible');
      osd.classList.add('hidden');
    }
  }

  toggleInfoOSD() {
    const osd = document.getElementById('channel-osd');
    if (osd && osd.classList.contains('visible')) {
      this.hideOSD();
    } else {
      const current = this.channelManager.getCurrentChannel();
      if (current) this.updateOSD(current);
      this.showOSD();
    }
  }

  showNumberDial(digits) {
    const dialEl = document.getElementById('number-dial-osd');
    const textEl = document.getElementById('number-dial-digits');
    if (dialEl && textEl) {
      textEl.textContent = digits;
      dialEl.classList.remove('hidden');
      dialEl.classList.add('visible');
    }
  }

  hideNumberDial() {
    const dialEl = document.getElementById('number-dial-osd');
    if (dialEl) {
      dialEl.classList.remove('visible');
      dialEl.classList.add('hidden');
    }
  }

  showToast(message, duration = 2200) {
    const toast = document.getElementById('tv-toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('visible');

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
      toast.classList.add('hidden');
    }, duration);
  }

  // --- Player Status Callbacks ---

  onPlayerStatusChange(status, details = "") {
    const statusEl = document.getElementById('stream-status-badge');
    const errorOverlay = document.getElementById('stream-error-overlay');
    const errorMsg = document.getElementById('stream-error-message');

    if (statusEl) {
      statusEl.className = 'status-badge ' + status;
      statusEl.textContent = status.toUpperCase();
    }

    if (status === 'error') {
      if (errorOverlay) errorOverlay.classList.remove('hidden');
      if (errorMsg) errorMsg.textContent = details || 'Stream offline. Press CH+ or CH- for next channel.';
    } else {
      if (errorOverlay) errorOverlay.classList.add('hidden');
    }
  }

  onResolutionChange(res) {
    const resEl = document.getElementById('osd-channel-res');
    if (resEl) {
      resEl.textContent = res;
    }
  }

  // --- Shortcuts: Fav, Aspect, Category ---

  toggleFavorite() {
    const current = this.channelManager.getCurrentChannel();
    if (!current) return;
    const isFav = this.channelManager.toggleFavorite(current);
    this.showToast(isFav ? `★ Added ${current.name} to Favorites` : `Removed ${current.name} from Favorites`);
    this.updateOSD(current);
    if (this.guideOpen) {
      this.renderCategories();
      this.renderChannelList();
    }
  }

  cycleAspectRatio() {
    const mode = this.player.cycleAspectRatio();
    this.showToast(`Aspect Ratio: ${mode.toUpperCase()}`);
  }

  cycleCategory(direction = 1) {
    const cats = this.channelManager.categories;
    let idx = cats.indexOf(this.channelManager.currentCategory);
    if (idx === -1) idx = 0;
    idx = (idx + direction + cats.length) % cats.length;
    const newCat = cats[idx];
    this.channelManager.applyCategoryFilter(newCat);
    this.renderCategories();
    this.renderChannelList();
    this.showToast(`Category: ${newCat}`);
  }

  togglePlayPause() {
    const isPlaying = this.player.togglePlayPause();
    this.showToast(isPlaying ? "▶ Play" : "❚❚ Pause");
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
        // Fallback: hide header and go as close to fullscreen as possible
        this._applyFullscreenUI(true);
        this.showToast("📺 Fullscreen Mode");
      });
      this._applyFullscreenUI(true);
    } else {
      document.exitFullscreen();
      this._applyFullscreenUI(false);
    }
  }

  _applyFullscreenUI(isFullscreen) {
    const header = document.getElementById('header-bar');
    const remote = document.getElementById('virtual-remote-container');
    const btn = document.getElementById('btn-fullscreen-toggle');

    if (isFullscreen) {
      if (header) header.style.opacity = '0';
      if (header) header.style.pointerEvents = 'none';
      if (remote) remote.classList.add('hidden');
      if (btn) btn.querySelector('span').textContent = '⛶ Exit Full';
      document.body.classList.add('is-fullscreen');
    } else {
      if (header) header.style.opacity = '';
      if (header) header.style.pointerEvents = '';
      if (btn) btn.querySelector('span').textContent = '⛶ Fullscreen';
      document.body.classList.remove('is-fullscreen');
    }
  }

  // --- Guide Drawer & Spatial Navigation ---

  isGuideOpen() {
    return this.guideOpen;
  }

  openGuide() {
    this.guideOpen = true;
    document.getElementById('guide-drawer').classList.add('open');
    document.getElementById('guide-backdrop').classList.add('open');
    this.guideFocusArea = 'channels';
    this.highlightGuideItem();
  }

  closeGuide() {
    this.guideOpen = false;
    document.getElementById('guide-drawer').classList.remove('open');
    document.getElementById('guide-backdrop').classList.remove('open');
  }

  toggleGuide() {
    if (this.guideOpen) {
      this.closeGuide();
    } else {
      this.openGuide();
    }
  }

  renderCategories() {
    const container = document.getElementById('guide-categories-list');
    if (!container) return;
    container.innerHTML = '';

    this.channelManager.categories.forEach((cat, index) => {
      const btn = document.createElement('button');
      btn.className = 'category-tab' + (cat === this.channelManager.currentCategory ? ' active' : '');
      btn.textContent = cat;
      btn.setAttribute('data-index', index);
      btn.addEventListener('click', () => {
        this.channelManager.applyCategoryFilter(cat);
        this.renderCategories();
        this.renderChannelList();
      });
      container.appendChild(btn);
    });
  }

  renderChannelList(customList = null) {
    const container = document.getElementById('guide-channels-list');
    if (!container) return;
    container.innerHTML = '';

    const list = customList || this.channelManager.filteredChannels;

    if (!list || list.length === 0) {
      container.innerHTML = '<div class="empty-state">No channels found in this category</div>';
      return;
    }

    const currentChannel = this.channelManager.getCurrentChannel();
    const maxRender = 300;
    const renderList = list.slice(0, maxRender);

    renderList.forEach((ch, idx) => {
      const item = document.createElement('div');
      item.className = 'channel-card' + (currentChannel && ch.num === currentChannel.num ? ' playing' : '');
      item.setAttribute('data-index', idx);

      const isFav = this.channelManager.isFavorite(ch);

      item.innerHTML = `
        <div class="channel-num-badge">${String(ch.num).padStart(2, '0')}</div>
        <div class="channel-logo-wrap">
          ${ch.logo ? `<img class="channel-card-logo" src="${ch.logo}" onerror="this.style.display='none'" />` : '<div class="logo-placeholder">TV</div>'}
        </div>
        <div class="channel-card-info">
          <div class="channel-card-name">${ch.name}</div>
          <div class="channel-card-sub">${ch.category} ${ch.country ? '• ' + ch.country : ''}</div>
        </div>
        ${isFav ? '<div class="channel-fav-badge">★</div>' : ''}
        ${currentChannel && ch.num === currentChannel.num ? '<div class="channel-now-playing-icon">▶ ON AIR</div>' : ''}
      `;

      item.addEventListener('click', () => {
        this.selectChannelByIndex(idx);
      });

      container.appendChild(item);
    });

    if (list.length > maxRender) {
      const moreInfo = document.createElement('div');
      moreInfo.style.padding = "20px";
      moreInfo.style.textAlign = "center";
      moreInfo.style.color = "#888";
      moreInfo.textContent = `+ ${list.length - maxRender} more channels. Use search to find them.`;
      container.appendChild(moreInfo);
    }

    this.highlightCurrentChannelInList();
  }

  highlightCurrentChannelInList() {
    const container = document.getElementById('guide-channels-list');
    if (!container) return;
    const cards = container.querySelectorAll('.channel-card');
    const current = this.channelManager.getCurrentChannel();

    cards.forEach((card, idx) => {
      const isCurrent = current && this.channelManager.filteredChannels[idx] && this.channelManager.filteredChannels[idx].num === current.num;
      card.classList.toggle('playing', !!isCurrent);
    });
  }

  navigateGuide(direction) {
    if (this.guideFocusArea === 'categories') {
      const tabs = document.querySelectorAll('.category-tab');
      if (direction === 'up') {
        this.focusedCategoryIndex = Math.max(0, this.focusedCategoryIndex - 1);
      } else if (direction === 'down') {
        this.focusedCategoryIndex = Math.min(tabs.length - 1, this.focusedCategoryIndex + 1);
      } else if (direction === 'right') {
        this.guideFocusArea = 'channels';
      }
    } else {
      // Guide focus area: channels
      const cards = document.querySelectorAll('.channel-card');
      if (cards.length === 0) return;

      if (direction === 'up') {
        this.focusedChannelIndex = Math.max(0, this.focusedChannelIndex - 1);
      } else if (direction === 'down') {
        this.focusedChannelIndex = Math.min(cards.length - 1, this.focusedChannelIndex + 1);
      } else if (direction === 'left') {
        this.guideFocusArea = 'categories';
      }
    }

    this.highlightGuideItem();
  }

  highlightGuideItem() {
    // Remove focus from all
    document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));

    if (this.guideFocusArea === 'categories') {
      const tabs = document.querySelectorAll('.category-tab');
      const target = tabs[this.focusedCategoryIndex];
      if (target) {
        target.classList.add('focused');
        target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    } else {
      const cards = document.querySelectorAll('.channel-card');
      const target = cards[this.focusedChannelIndex];
      if (target) {
        target.classList.add('focused');
        target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }

  selectFocusedGuideItem() {
    if (this.guideFocusArea === 'categories') {
      const tabs = document.querySelectorAll('.category-tab');
      const target = tabs[this.focusedCategoryIndex];
      if (target) {
        target.click();
        this.guideFocusArea = 'channels';
        this.focusedChannelIndex = 0;
        this.highlightGuideItem();
      }
    } else {
      this.selectChannelByIndex(this.focusedChannelIndex);
    }
  }

  // --- Settings & Playlist Modal ---

  isSettingsOpen() {
    return this.settingsOpen;
  }

  openSettings() {
    this.settingsOpen = true;
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');

    // Populate presets dropdown
    const select = document.getElementById('playlist-preset-select');
    if (select) {
      select.innerHTML = '';
      window.PLAYLIST_PRESETS.forEach(preset => {
        const opt = document.createElement('option');
        opt.value = preset.id;
        opt.textContent = preset.name;
        if (preset.id === this.channelManager.currentPlaylistId) {
          opt.selected = true;
        }
        select.appendChild(opt);
      });
    }

    const customInput = document.getElementById('custom-m3u-url');
    if (customInput) customInput.value = this.channelManager.customUrl || '';
  }

  closeSettings() {
    this.settingsOpen = false;
    document.getElementById('settings-modal').classList.add('hidden');
  }

  toggleSettings() {
    if (this.settingsOpen) {
      this.closeSettings();
    } else {
      this.openSettings();
    }
  }

  async saveCustomPlaylist() {
    const select = document.getElementById('playlist-preset-select');
    const customInput = document.getElementById('custom-m3u-url');
    const presetId = select ? select.value : 'default';
    const customUrl = customInput ? customInput.value.trim() : '';

    this.showToast('Loading playlist...');
    this.closeSettings();

    await this.channelManager.loadPlaylist(presetId, customUrl);
    this.renderCategories();
    this.renderChannelList();

    const first = this.channelManager.getCurrentChannel();
    if (first) {
      this.playChannel(first);
    }
    this.showToast(`Loaded ${this.channelManager.channels.length} channels`);
  }
}

// Instantiate on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new IPTVApp();
  window.app = app;
  app.init();
});
