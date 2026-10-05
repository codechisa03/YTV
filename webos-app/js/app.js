/**
 * app.js - Main Application Orchestrator for YTV Live TV Streaming Platform
 * 100% Dedicated to TV Channels with logos, numbers, names & categories
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
    this.playerModalOpen = false;

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

    // Initialize channels and render channel sections
    await this.channelManager.init();
    this.renderCategories();
    this.renderChannelList();
    this.renderAllChannelCarousels();
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
    const guideToggleBtn = document.getElementById('btn-guide-toggle');
    if (guideToggleBtn) guideToggleBtn.addEventListener('click', () => this.toggleGuide());

    const settingsToggleBtn = document.getElementById('btn-settings-toggle');
    if (settingsToggleBtn) settingsToggleBtn.addEventListener('click', () => this.toggleSettings());

    const fullscreenBtn = document.getElementById('btn-fullscreen-toggle');
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

    const closePlayerBtn = document.getElementById('btn-close-player');
    if (closePlayerBtn) closePlayerBtn.addEventListener('click', () => this.closePlayerModal());

    // Shared category apply helper
    const applyCategory = (cat) => {
      this.channelManager.applyCategoryFilter(cat);
      this.renderAllChannelCarousels();
      this.showToast(cat === 'All' ? 'All Channels' : `${cat} Channels`);
      document.querySelectorAll('.nav-item[data-category]').forEach(b => b.classList.toggle('active', b.getAttribute('data-category') === cat));
      document.querySelectorAll('.mob-nav-btn[data-category]').forEach(b => b.classList.toggle('active', b.getAttribute('data-category') === cat));
      document.querySelectorAll('.cat-pill[data-category]').forEach(b => b.classList.toggle('active', b.getAttribute('data-category') === cat));
      this.updateGlobalBackButton();
    };

    document.querySelectorAll('.nav-item[data-category]').forEach(btn => {
      btn.addEventListener('click', () => applyCategory(btn.getAttribute('data-category')));
    });
    document.querySelectorAll('.mob-nav-btn[data-category]').forEach(btn => {
      btn.addEventListener('click', () => applyCategory(btn.getAttribute('data-category')));
    });
    document.querySelectorAll('.cat-pill[data-category]').forEach(btn => {
      btn.addEventListener('click', () => applyCategory(btn.getAttribute('data-category')));
    });

    const btnGlobalBack = document.getElementById('btn-global-back');
    if (btnGlobalBack) btnGlobalBack.addEventListener('click', () => this.handleGlobalBack());

    const mobGuideBtn = document.getElementById('btn-mob-guide');
    if (mobGuideBtn) mobGuideBtn.addEventListener('click', () => this.toggleGuide());

    const mobSettingsBtn = document.getElementById('btn-mob-settings');
    if (mobSettingsBtn) mobSettingsBtn.addEventListener('click', () => this.toggleSettings());

    // Hero Watch Now Button
    const heroPlayBtn = document.getElementById('btn-hero-play');
    if (heroPlayBtn) {
      heroPlayBtn.addEventListener('click', () => {
        const sunTv = this.channelManager.channels.find(c => c.id === 'sun-tv') || this.channelManager.channels[0];
        if (sunTv) this.playChannelModal(sunTv);
      });
    }

    const heroGuideBtn = document.getElementById('btn-hero-guide');
    if (heroGuideBtn) {
      heroGuideBtn.addEventListener('click', () => this.openGuide());
    }

    // Hero Carousel Arrow Controls
    const heroPrev = document.getElementById('hero-prev');
    const heroNext = document.getElementById('hero-next');
    if (heroPrev && heroNext) {
      const heroSlides = [
        { channelId: "sun-tv", title: "SUN TV LIVE", desc: "Watch live blockbuster Tamil hit movies, exclusive daily serials, and live show telecasts uninterrupted on Sun TV." },
        { channelId: "star-vijay", title: "STAR VIJAY LIVE", desc: "Enjoy live reality shows, award functions, mega serials, and high-energy Tamil entertainment." },
        { channelId: "zee-tamil", title: "ZEE TAMIL LIVE", desc: "Stream live serials, fiction dramas, and popular Sunday Tamil cinema specials." }
      ];
      let slideIdx = 0;
      const updateHeroSlide = (idx) => {
        slideIdx = (idx + heroSlides.length) % heroSlides.length;
        const item = heroSlides[slideIdx];
        const titleEl = document.getElementById('hero-title-text');
        const descEl = document.getElementById('hero-desc-text');
        if (titleEl) titleEl.textContent = item.title;
        if (descEl) descEl.textContent = item.desc;
      };
      heroPrev.addEventListener('click', () => updateHeroSlide(slideIdx - 1));
      heroNext.addEventListener('click', () => updateHeroSlide(slideIdx + 1));
    }

    // Global Search Input
    const globalSearchInput = document.getElementById('global-search-input');
    if (globalSearchInput) {
      globalSearchInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const filtered = this.channelManager.search(val);
        this.renderAllChannelCarousels(filtered);
      });
    }

    // Guide search
    const guideSearchInput = document.getElementById('channel-search-input');
    if (guideSearchInput) {
      guideSearchInput.addEventListener('input', (e) => {
        const filtered = this.channelManager.search(e.target.value);
        this.renderChannelList(filtered);
      });
    }

    document.getElementById('modal-close-btn').addEventListener('click', () => this.closeSettings());
    document.getElementById('guide-backdrop').addEventListener('click', () => this.closeGuide());
    document.getElementById('btn-save-playlist').addEventListener('click', () => this.saveCustomPlaylist());

    // ESC Key to close player or modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        if (this.playerModalOpen) this.closePlayerModal();
        if (this.guideOpen) this.closeGuide();
        if (this.settingsOpen) this.closeSettings();
      }
    });

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

  // Helper to create TV Channel Card HTML element
  createChannelCardElement(ch) {
    const card = document.createElement('div');
    card.className = 'live-channel-card';
    card.setAttribute('data-id', ch.id || ch.num);
    card.setAttribute('tabindex', '0'); // CRITICAL: Makes the card focusable by TV remote D-Pad

    card.innerHTML = `
      <div class="card-top-badges">
        <span class="ch-number-badge">CH ${String(ch.num).padStart(2, '0')}</span>
        <span class="live-badge">LIVE</span>
      </div>
      <div class="channel-card-logo-box">
        <img class="channel-card-logo-img" src="${ch.logo}" alt="${ch.name}" onerror="this.src='https://i.imgur.com/Yh3265D.png'" />
      </div>
      <div class="channel-card-details">
        <div class="channel-name-title">${ch.name}</div>
        <div class="channel-genre-sub">${ch.category || 'Entertainment'}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      this.channelManager.selectChannel(ch);
      this.playChannelModal(ch);
    });

    return card;
  }

  // --- Render TV Channels Carousels & Grid ---
  renderAllChannelCarousels(customList = null) {
    const list = customList || this.channelManager.filteredChannels;

    // Row 1: Live Tamil Channels
    const tamilContainer = document.getElementById('tamil-channels-container');
    if (tamilContainer) {
      tamilContainer.innerHTML = '';
      const tamilList = list.filter(c => c.country === 'IN' || c.category === 'Entertainment' || c.name.toLowerCase().includes('tamil') || c.num <= 16);
      (tamilList.length > 0 ? tamilList : list).forEach(ch => {
        tamilContainer.appendChild(this.createChannelCardElement(ch));
      });
    }

    // Row 2: Entertainment & Serials
    const entContainer = document.getElementById('entertainment-channels-container');
    if (entContainer) {
      entContainer.innerHTML = '';
      const entList = list.filter(c => c.category === 'Entertainment' || c.category === 'Movies');
      (entList.length > 0 ? entList : list).forEach(ch => {
        entContainer.appendChild(this.createChannelCardElement(ch));
      });
    }

    // Row 3: News & Sports Channels
    const newsContainer = document.getElementById('news-sports-channels-container');
    if (newsContainer) {
      newsContainer.innerHTML = '';
      const newsList = list.filter(c => c.category === 'News' || c.category === 'Sports');
      (newsList.length > 0 ? newsList : list).slice(0, 20).forEach(ch => {
        newsContainer.appendChild(this.createChannelCardElement(ch));
      });
    }

    // Section 4: All TV Channels Grid
    const allGrid = document.getElementById('all-channels-grid-container');
    if (allGrid) {
      allGrid.innerHTML = '';
      list.forEach(ch => {
        allGrid.appendChild(this.createChannelCardElement(ch));
      });
    }
  }

  // --- Channel Playback Modal Surface ---
  playChannelModal(channel) {
    if (!channel) return;
    this.playerModalOpen = true;

    const playerContainer = document.getElementById('video-container');
    if (playerContainer) playerContainer.classList.remove('hidden');

    this.player.playStream(channel.url);
    this.updateOSD(channel);
    this.showOSD();
    this.highlightCurrentChannelInList();
    this.showToast(`Now Live: CH ${channel.num} - ${channel.name}`);
    this.updateGlobalBackButton();

    // Auto-enter fullscreen for TV/mobile immersive experience
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => console.warn(`Auto-fullscreen rejected: ${err.message}`));
    }
  }

  closePlayerModal() {
    this.playerModalOpen = false;
    const playerContainer = document.getElementById('video-container');
    if (playerContainer) playerContainer.classList.add('hidden');
    if (this.player) this.player.stop();
    this.updateGlobalBackButton();

    // Auto-exit fullscreen when closing player
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(err => console.warn(`Exit-fullscreen rejected: ${err.message}`));
    }
  }

  playChannel(channel) {
    this.playChannelModal(channel);
  }

  nextChannel() {
    const ch = this.channelManager.nextChannel();
    if (ch) this.playChannelModal(ch);
  }

  prevChannel() {
    const ch = this.channelManager.prevChannel();
    if (ch) this.playChannelModal(ch);
  }

  jumpToChannelNumber(num) {
    const ch = this.channelManager.jumpToNumber(num);
    if (ch) {
      this.playChannelModal(ch);
    } else {
      this.showToast(`Channel ${num} not found`, 3000);
    }
  }

  selectChannelByIndex(index) {
    const channels = this.channelManager.filteredChannels;
    if (channels && channels[index]) {
      const ch = channels[index];
      this.channelManager.selectChannel(ch);
      this.playChannelModal(ch);
      this.closeGuide();
    }
  }

  // --- OSD Banner & Overlays ---
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

    if (this.osdTimer) clearTimeout(this.osdTimer);
    this.osdTimer = setTimeout(() => {
      this.hideOSD();
    }, 4500);
  }

  hideOSD() {
    const osd = document.getElementById('channel-osd');
    if (osd) osd.classList.add('hidden');
  }

  toggleInfoOSD() {
    const osd = document.getElementById('channel-osd');
    if (osd && !osd.classList.contains('hidden')) {
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
    }
  }

  hideNumberDial() {
    const dialEl = document.getElementById('number-dial-osd');
    if (dialEl) dialEl.classList.add('hidden');
  }

  showToast(message, duration = 2200) {
    const toast = document.getElementById('tv-toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('visible');

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, duration);
  }

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
    if (resEl) resEl.textContent = res;
  }

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
    this.renderAllChannelCarousels();
    this.showToast(`Category: ${newCat}`);
  }

  togglePlayPause() {
    const isPlaying = this.player.togglePlayPause();
    this.showToast(isPlaying ? "▶ Play" : "❚❚ Pause");
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Fullscreen error: ${err.message}`);
      });
      this.showToast("📺 Fullscreen Mode");
    } else {
      document.exitFullscreen();
    }
  }

  // --- Guide Drawer ---
  openGuide() {
    this.guideOpen = true;
    document.getElementById('guide-drawer').classList.add('open');
    document.getElementById('guide-backdrop').classList.add('open');
    this.updateGlobalBackButton();
  }

  closeGuide() {
    this.guideOpen = false;
    document.getElementById('guide-drawer').classList.remove('open');
    document.getElementById('guide-backdrop').classList.remove('open');
    this.updateGlobalBackButton();
  }

  toggleGuide() {
    if (this.guideOpen) this.closeGuide();
    else this.openGuide();
  }

  renderCategories() {
    const container = document.getElementById('guide-categories-list');
    if (!container) return;
    container.innerHTML = '';

    this.channelManager.categories.forEach((cat) => {
      const btn = document.createElement('button');
      btn.className = 'category-tab' + (cat === this.channelManager.currentCategory ? ' active' : '');
      btn.textContent = cat;
      btn.addEventListener('click', () => {
        this.channelManager.applyCategoryFilter(cat);
        this.renderCategories();
        this.renderChannelList();
        this.renderAllChannelCarousels();
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
      container.innerHTML = '<div class="empty-state" style="padding:20px;text-align:center;color:#888;">No channels found</div>';
      return;
    }

    const currentChannel = this.channelManager.getCurrentChannel();
    const renderList = list.slice(0, 150);

    renderList.forEach((ch, idx) => {
      const item = document.createElement('div');
      item.className = 'channel-card' + (currentChannel && ch.num === currentChannel.num ? ' playing' : '');

      item.innerHTML = `
        <div class="channel-num-badge">${String(ch.num).padStart(2, '0')}</div>
        <div class="channel-logo-wrap">
          <img class="channel-card-logo" src="${ch.logo}" onerror="this.style.display='none'" />
        </div>
        <div class="channel-card-info">
          <div class="channel-card-name">${ch.name}</div>
          <div class="channel-card-sub">${ch.category || 'General'}</div>
        </div>
      `;

      item.addEventListener('click', () => {
        this.selectChannelByIndex(idx);
      });

      container.appendChild(item);
    });
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

  // --- Settings ---
  openSettings() {
    this.settingsOpen = true;
    document.getElementById('settings-modal').classList.remove('hidden');
    const select = document.getElementById('playlist-preset-select');
    if (select) {
      select.innerHTML = '';
      window.PLAYLIST_PRESETS.forEach(preset => {
        const opt = document.createElement('option');
        opt.value = preset.id;
        opt.textContent = preset.name;
        if (preset.id === this.channelManager.currentPlaylistId) opt.selected = true;
        select.appendChild(opt);
      });
    }
    this.updateGlobalBackButton();
  }

  closeSettings() {
    this.settingsOpen = false;
    document.getElementById('settings-modal').classList.add('hidden');
    this.updateGlobalBackButton();
  }

  toggleSettings() {
    if (this.settingsOpen) this.closeSettings();
    else this.openSettings();
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
    this.renderAllChannelCarousels();

    this.showToast(`Loaded ${this.channelManager.channels.length} channels`);
  }

  updateGlobalBackButton() {
    const btn = document.getElementById('btn-global-back');
    if (!btn) return;
    if (this.playerModalOpen || this.guideOpen || this.settingsOpen || this.channelManager.currentCategory !== 'All') {
      btn.style.display = 'flex';
    } else {
      btn.style.display = 'none';
    }
  }

  handleGlobalBack() {
    if (this.playerModalOpen) {
      this.closePlayerModal();
    } else if (this.settingsOpen) {
      this.closeSettings();
    } else if (this.guideOpen) {
      this.closeGuide();
    } else if (this.channelManager.currentCategory !== 'All') {
      // Simulate clicking the Home tab
      const allBtn = document.querySelector('.nav-item[data-category="All"]');
      if (allBtn) allBtn.click();
    }
  }
}

// Instantiate on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new IPTVApp();
  window.app = app;
  app.init();
});
