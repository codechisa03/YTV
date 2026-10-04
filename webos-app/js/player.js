/**
 * player.js - High-performance HLS & HTML5 Video Stream Player for LG webOS TV
 */

class StreamPlayer {
  constructor(videoElement, options = {}) {
    this.video = videoElement;
    this.hls = null;
    this.options = options;
    this.onStatusChange = options.onStatusChange || (() => {});
    this.onResolutionChange = options.onResolutionChange || (() => {});

    this.aspectRatios = ['fit', 'fill', 'zoom', '4:3'];
    this.currentAspectIndex = 0;
    this.retryCount = 0;
    this.maxRetries = 2;
    this.currentUrl = null;
    this.state = 'idle'; // 'idle' | 'loading' | 'playing' | 'buffering' | 'error'

    this.setupListeners();
    this.setAspectRatio('fit');
  }

  setupListeners() {
    this.video.addEventListener('loadstart', () => this.updateStatus('loading'));
    this.video.addEventListener('waiting', () => this.updateStatus('buffering'));
    this.video.addEventListener('playing', () => {
      this.retryCount = 0;
      this.updateStatus('playing');
      this.detectResolution();
    });
    this.video.addEventListener('canplay', () => {
      if (this.state === 'loading') this.updateStatus('playing');
    });
    this.video.addEventListener('error', (e) => {
      console.warn("Native video error:", e);
      this.handlePlaybackError();
    });
  }

  detectResolution() {
    setTimeout(() => {
      const w = this.video.videoWidth;
      const h = this.video.videoHeight;
      let label = 'HD';
      if (w >= 3840 || h >= 2160) label = '4K UHD';
      else if (w >= 1920 || h >= 1080) label = '1080p FHD';
      else if (w >= 1280 || h >= 720) label = '720p HD';
      else if (w > 0 && h > 0) label = `${h}p SD`;
      this.onResolutionChange(label, w, h);
    }, 1000);
  }

  updateStatus(status, details = "") {
    this.state = status;
    this.onStatusChange(status, details);
  }

  playStream(url) {
    if (!url) return;
    this.currentUrl = url;
    this.retryCount = 0;
    this.loadCurrentSource();
  }

  loadCurrentSource() {
    this.updateStatus('loading');
    this.destroyHls();

    // Check HLS.js support (supported on webOS 3.0+ Chromium engine and modern browsers)
    const isHlsSupported = window.Hls && window.Hls.isSupported();
    const isNativeHlsSupported = this.video.canPlayType('application/vnd.apple.mpegurl');

    if (isHlsSupported) {
      this.loadWithHlsJs(this.currentUrl);
    } else if (isNativeHlsSupported || this.currentUrl.includes('.mp4') || this.currentUrl.includes('.ts')) {
      this.loadWithNativeVideo(this.currentUrl);
    } else {
      // Try native video anyway
      this.loadWithNativeVideo(this.currentUrl);
    }
  }

  loadWithHlsJs(url) {
    try {
      this.hls = new window.Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 10,
        maxMaxBufferLength: 20,
        maxBufferSize: 30 * 1000 * 1000, // 30MB max memory buffer for Smart TV stability
        manifestLoadingTimeOut: 12000,
        manifestLoadingMaxRetry: 2,
        levelLoadingTimeOut: 12000,
        fragLoadingTimeOut: 15000,
        fragLoadingMaxRetry: 2
      });

      this.hls.loadSource(url);
      this.hls.attachMedia(this.video);

      this.hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        const playPromise = this.video.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn("Autoplay blocked or stream paused:", err);
            // On some TVs user interaction or muted playback is required
            this.video.muted = false;
            this.video.play().catch(() => {});
          });
        }
      });

      this.hls.on(window.Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const level = this.hls.levels[data.level];
        if (level && level.height) {
          const res = level.height >= 1080 ? '1080p FHD' : (level.height >= 720 ? '720p HD' : `${level.height}p`);
          this.onResolutionChange(res, level.width, level.height);
        }
      });

      this.hls.on(window.Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case window.Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("HLS fatal network error, recovering...", data);
              this.hls.startLoad();
              break;
            case window.Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("HLS fatal media error, recovering...", data);
              this.hls.recoverMediaError();
              break;
            default:
              console.error("HLS unrecoverable error:", data);
              this.handlePlaybackError();
              break;
          }
        }
      });
    } catch (e) {
      console.error("Error initializing HLS.js:", e);
      this.loadWithNativeVideo(url);
    }
  }

  loadWithNativeVideo(url) {
    this.video.src = url;
    this.video.load();
    const p = this.video.play();
    if (p !== undefined) {
      p.catch(err => {
        console.warn("Native video play failed:", err);
      });
    }
  }

  handlePlaybackError() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Retrying stream (${this.retryCount}/${this.maxRetries})...`);
      this.updateStatus('buffering', `Reconnecting (${this.retryCount}/${this.maxRetries})...`);
      setTimeout(() => {
        this.loadCurrentSource();
      }, 2000);
    } else {
      this.updateStatus('error', 'Stream currently unavailable. Press CH+ to skip.');
    }
  }

  togglePlayPause() {
    if (this.video.paused) {
      this.video.play();
      return true;
    } else {
      this.video.pause();
      return false;
    }
  }

  toggleMute() {
    this.video.muted = !this.video.muted;
    return this.video.muted;
  }

  cycleAspectRatio() {
    this.currentAspectIndex = (this.currentAspectIndex + 1) % this.aspectRatios.length;
    const mode = this.aspectRatios[this.currentAspectIndex];
    this.setAspectRatio(mode);
    return mode;
  }

  setAspectRatio(mode) {
    this.video.classList.remove('aspect-fit', 'aspect-fill', 'aspect-zoom', 'aspect-43');
    switch (mode) {
      case 'fill':
        this.video.classList.add('aspect-fill');
        break;
      case 'zoom':
        this.video.classList.add('aspect-zoom');
        break;
      case '4:3':
        this.video.classList.add('aspect-43');
        break;
      case 'fit':
      default:
        this.video.classList.add('aspect-fit');
        break;
    }
  }

  destroyHls() {
    if (this.hls) {
      try {
        this.hls.destroy();
      } catch (e) {
        console.warn("Hls destroy error:", e);
      }
      this.hls = null;
    }
    this.video.removeAttribute('src');
    this.video.load();
  }
}

window.StreamPlayer = StreamPlayer;
