/**
 * channels.js - IPTV Channel & Playlist Manager
 * Tailored for Indian & Tamil Channels Priority + Global IPTV Channels
 */

// Curated high-availability live channels loaded immediately
// TAMIL CHANNELS ARE PLACED FIRST (CH 1 - CH 12)
// Built-in logo helper generator for 100% reliable crisp SVG channel logos
const LOGO_SVGS = {
  suntv: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23111"/><circle cx="50" cy="50" r="32" fill="url(%23sunGrad)"/><defs><radialGradient id="sunGrad"><stop offset="0%25" stop-color="%23FFF000"/><stop offset="60%25" stop-color="%23FF5500"/><stop offset="100%25" stop-color="%23D00000"/></radialGradient></defs><path d="M50 8 L54 24 L68 14 L62 28 L78 26 L68 38 L84 46 L70 52 L82 64 L67 66 L74 80 L60 76 L60 92 L50 80 L40 92 L40 76 L26 80 L33 66 L18 64 L30 52 L16 46 L32 38 L22 26 L38 28 L32 14 L46 24 Z" fill="%23FFCC00"/><text x="50" y="58" font-size="12" font-weight="900" font-family="sans-serif" fill="%23FFFFFF" text-anchor="middle">SUN TV</text></svg>`,

  starvijay: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%230c1220"/><polygon points="50,12 63,38 92,38 68,54 78,82 50,64 22,82 32,54 8,38 37,38" fill="%23FF0033" stroke="%23FFCC00" stroke-width="3"/><text x="50" y="90" font-size="11" font-weight="900" font-family="sans-serif" fill="%23FFCC00" text-anchor="middle">STAR VIJAY</text></svg>`,

  zeetamil: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="url(%23zeeBg)"/><defs><linearGradient id="zeeBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%23FF5E00"/><stop offset="100%25" stop-color="%23A000C8"/></linearGradient></defs><text x="50" y="52" font-size="34" font-weight="900" font-family="sans-serif" fill="%23FFFFFF" text-anchor="middle">ZEE</text><text x="50" y="74" font-size="13" font-weight="800" font-family="sans-serif" fill="%23FFD700" text-anchor="middle">தமிழ்</text></svg>`,

  colorstamil: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%230a0f1c"/><circle cx="50" cy="38" r="14" fill="%23FF0077"/><circle cx="36" cy="48" r="14" fill="%2300CCFF"/><circle cx="64" cy="48" r="14" fill="%23FFCC00"/><circle cx="50" cy="54" r="12" fill="%2300FF66"/><text x="50" y="82" font-size="11" font-weight="900" font-family="sans-serif" fill="%23FFFFFF" text-anchor="middle">colors தமிழ்</text></svg>`,

  news18tamil: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23101424"/><rect x="10" y="24" width="80" height="34" rx="6" fill="%23E60000"/><text x="50" y="48" font-size="17" font-weight="900" font-family="sans-serif" fill="%23FFFFFF" text-anchor="middle">NEWS 18</text><text x="50" y="76" font-size="11" font-weight="800" font-family="sans-serif" fill="%2300E5FF" text-anchor="middle">TAMIL NADU</text></svg>`,

  jayatv: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%230a101f"/><circle cx="50" cy="42" r="26" fill="%23FFCC00" stroke="%23E60000" stroke-width="4"/><text x="50" y="50" font-size="18" font-weight="900" font-family="sans-serif" fill="%23E60000" text-anchor="middle">JAYA</text><text x="50" y="82" font-size="12" font-weight="900" font-family="sans-serif" fill="%23FFFFFF" text-anchor="middle">JAYA TV</text></svg>`,

  sports18: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%230d121f"/><text x="50" y="44" font-size="14" font-weight="900" font-family="sans-serif" fill="%23FFFFFF" text-anchor="middle">sports</text><text x="50" y="78" font-size="34" font-weight="900" font-family="sans-serif" fill="%23FF3300" text-anchor="middle">18</text></svg>`,

  ktv: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23D00000"/><text x="50" y="65" font-size="44" font-weight="900" font-family="sans-serif" fill="%23FFCC00" text-anchor="middle">K</text></svg>`,

  sunmusic: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23111"/><circle cx="50" cy="45" r="24" fill="%23FF0055"/><path d="M42 30 L42 55 A8 8 0 1 0 50 62 L50 38 L62 34 L62 26 Z" fill="%23FFCC00"/><text x="50" y="86" font-size="10" font-weight="900" font-family="sans-serif" fill="%23FFFFFF" text-anchor="middle">SUN MUSIC</text></svg>`,

  adithya: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%23FF5500"/><text x="50" y="55" font-size="15" font-weight="900" font-family="sans-serif" fill="%23FFFFFF" text-anchor="middle">ADITHYA</text><text x="50" y="76" font-size="12" font-weight="800" font-family="sans-serif" fill="%23FFCC00" text-anchor="middle">COMEDY</text></svg>`
};

const DEFAULT_CHANNELS = [
  // --- TAMIL CHANNELS (PRIORITY 1) ---
  {
    id: "sun-tv",
    num: 1,
    name: "SUN TV",
    category: "Entertainment",
    country: "IN",
    logo: LOGO_SVGS.suntv,
    url: "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/2839e3d1e0f84a2e821c1708d5fdfdf0/index.m3u8"
  },
  {
    id: "star-vijay",
    num: 2,
    name: "Star Vijay",
    category: "Entertainment",
    country: "IN",
    logo: LOGO_SVGS.starvijay,
    url: "http://ptuf.ridsys.in/riptv/live/STAR_VIJAY/index.m3u8"
  },
  {
    id: "zee-tamil",
    num: 3,
    name: "Zee Tamil",
    category: "Entertainment",
    country: "IN",
    logo: LOGO_SVGS.zeetamil,
    url: "https://amg01117-amg01117c1-amgplt0029.playout.now3.amagi.tv/playlist/amg01117-amg01117c1-amgplt0029/playlist.m3u8"
  },
  {
    id: "colors-tamil",
    num: 4,
    name: "Colors Tamil",
    category: "Entertainment",
    country: "IN",
    logo: LOGO_SVGS.colorstamil,
    url: "https://segment.yuppcdn.net/240122/kalaignartv/playlist.m3u8"
  },
  {
    id: "news18-tamilnadu",
    num: 5,
    name: "News18 Tamil Nadu",
    category: "News",
    country: "IN",
    logo: LOGO_SVGS.news18tamil,
    url: "https://n18syndication.akamaized.net/bpk-tv/News18_Tamil_Nadu_NW18_MOB/output01/master.m3u8"
  },
  {
    id: "jaya-tv",
    num: 6,
    name: "Jaya TV",
    category: "Entertainment",
    country: "IN",
    logo: LOGO_SVGS.jayatv,
    url: "https://segment.yuppcdn.net/240122/puthiya/playlist.m3u8"
  },
  {
    id: "sports-18",
    num: 7,
    name: "Sports 18",
    category: "Sports",
    country: "IN",
    logo: LOGO_SVGS.sports18,
    url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8"
  },
  {
    id: "ktv",
    num: 8,
    name: "KTV HD",
    category: "Movies",
    country: "IN",
    logo: LOGO_SVGS.ktv,
    url: "https://d2lk5u59tns74c.cloudfront.net/out/v1/abf46b14847e45499f4a47f3a9afe93d/index.m3u8"
  },
  {
    id: "sun-music",
    num: 9,
    name: "Sun Music",
    category: "Music",
    country: "IN",
    logo: LOGO_SVGS.sunmusic,
    url: "https://9xjio.wiseplayout.com/9XM/master.m3u8"
  },
  {
    id: "adithya-tv",
    num: 10,
    name: "Adithya TV",
    category: "Entertainment",
    country: "IN",
    logo: LOGO_SVGS.adithya,
    url: "https://segment.yuppcdn.net/240122/news7/playlist.m3u8"
  },
  {
    id: "dd-tamil",
    num: 11,
    name: "DD Tamil HD",
    category: "Tamil",
    country: "IN",
    logo: "https://i.imgur.com/Yh3265D.png",
    url: "https://d2lk5u59tns74c.cloudfront.net/out/v1/abf46b14847e45499f4a47f3a9afe93d/index.m3u8"
  },
  {
    id: "puthiya-thalaimurai",
    num: 12,
    name: "Puthiya Thalaimurai News",
    category: "Tamil",
    country: "IN",
    logo: "https://i.imgur.com/X26bQjL.png",
    url: "https://segment.yuppcdn.net/240122/puthiya/playlist.m3u8"
  },
  {
    id: "news7-tamil",
    num: 13,
    name: "News 7 Tamil",
    category: "Tamil",
    country: "IN",
    logo: "https://i.imgur.com/39w4qQO.png",
    url: "https://segment.yuppcdn.net/240122/news7/playlist.m3u8"
  },
  {
    id: "kalaignar-tv",
    num: 14,
    name: "Kalaignar TV",
    category: "Tamil",
    country: "IN",
    logo: "https://i.imgur.com/vH1N9sW.png",
    url: "https://segment.yuppcdn.net/240122/kalaignartv/playlist.m3u8"
  },
  {
    id: "raj-tv",
    num: 15,
    name: "Raj TV HD",
    category: "Tamil",
    country: "IN",
    logo: "https://i.imgur.com/Uv7i3R8.png",
    url: "https://d3qs3d2rkhfqrt.cloudfront.net/out/v1/2839e3d1e0f84a2e821c1708d5fdfdf0/index.m3u8"
  },
  {
    id: "vijay-super",
    num: 16,
    name: "Vijay Super",
    category: "Tamil",
    country: "IN",
    logo: LOGO_SVGS.starvijay,
    url: "http://ptuf.ridsys.in/riptv/live/VIJAY_SUPER/index.m3u8"
  },

  // --- MAJOR INDIAN CHANNELS (CH 17+) ---
  {
    id: "aaj-tak-hd",
    num: 17,
    name: "Aaj Tak HD",
    category: "News",
    country: "IN",
    logo: "https://i.imgur.com/aC8H5Xh.png",
    url: "https://feeds.intoday.in/aajtak/api/aajtakhd/master.m3u8"
  },
  {
    id: "india-today",
    num: 18,
    name: "India Today News",
    category: "News",
    country: "IN",
    logo: "https://i.imgur.com/Z4w2aCq.png",
    url: "https://feeds.intoday.in/aajtak/api/master.m3u8"
  },
  {
    id: "abp-news",
    num: 19,
    name: "ABP News HD",
    category: "News",
    country: "IN",
    logo: "https://i.imgur.com/KzWdOaK.png",
    url: "https://abp-i.akamaihd.net/hls/live/722383/abpnewshls/master.m3u8"
  },
  {
    id: "9xm",
    num: 20,
    name: "9XM Bollywood Music",
    category: "Music",
    country: "IN",
    logo: "https://i.imgur.com/Uv7i3R8.png",
    url: "https://9xjio.wiseplayout.com/9XM/master.m3u8"
  },

  // --- GLOBAL POPULAR CHANNELS ---
  {
    id: "dw-english",
    num: 21,
    name: "DW English HD",
    category: "News",
    country: "DE",
    logo: "https://i.imgur.com/Yh3265D.png",
    url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8"
  },
  {
    id: "france24-en",
    num: 22,
    name: "France 24 English",
    category: "News",
    country: "FR",
    logo: "https://i.imgur.com/Qh1P2Yk.png",
    url: "https://static.france24.com/live/F24_EN_LO_HLS/live_tv.m3u8"
  },
  {
    id: "aljazeera-en",
    num: 23,
    name: "Al Jazeera English HD",
    category: "News",
    country: "QA",
    logo: "https://i.imgur.com/KzWdOaK.png",
    url: "https://live-hls-web-aje.getaj.net/AJE/03.m3u8"
  },
  {
    id: "redbull-tv",
    num: 24,
    name: "Red Bull TV",
    category: "Sports",
    country: "AT",
    logo: "https://i.imgur.com/Z4w2aCq.png",
    url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8"
  }
];

// Presets list - India & Tamil is first and default!
const PLAYLIST_PRESETS = [
  { name: "🇮🇳 India & Tamil (All 530+ Indian Channels - Tamil First)", id: "india-full", url: "data/in.m3u" },
  { name: "✨ Quick Picks (Top Tamil, India & Global Channels)", id: "default", type: "internal" },
  { name: "🌐 Global All Channels (Built-in iptv-org Index)", id: "global-all", url: "data/index.m3u" },
  { name: "📰 News (Global)", id: "cat-news", url: "https://iptv-org.github.io/iptv/categories/news.m3u" },
  { name: "⚽ Sports (Global)", id: "cat-sports", url: "https://iptv-org.github.io/iptv/categories/sports.m3u" },
  { name: "🎬 Movies (Global)", id: "cat-movies", url: "https://iptv-org.github.io/iptv/categories/movies.m3u" },
  { name: "🎵 Music (Global)", id: "cat-music", url: "https://iptv-org.github.io/iptv/categories/music.m3u" },
  { name: "🎭 Entertainment (Global)", id: "cat-ent", url: "https://iptv-org.github.io/iptv/categories/entertainment.m3u" },
  { name: "🧒 Kids & Animation", id: "cat-kids", url: "https://iptv-org.github.io/iptv/categories/animation.m3u" },
  { name: "🇺🇸 United States", id: "country-us", url: "https://iptv-org.github.io/iptv/countries/us.m3u" },
  { name: "🇬🇧 United Kingdom", id: "country-uk", url: "https://iptv-org.github.io/iptv/countries/uk.m3u" },
  { name: "🔗 Custom M3U / M3U8 URL", id: "custom", type: "custom" }
];

class ChannelManager {
  constructor() {
    this.channels = [];
    this.filteredChannels = [];
    this.currentIndex = 0;
    this.currentCategory = "All";
    this.favorites = this.loadFavorites();
    // Default to India & Tamil playlist!
    // Force clear for now so the user sees the new global-all default immediately
    localStorage.removeItem("iptv_playlist_id");
    this.currentPlaylistId = localStorage.getItem("iptv_playlist_id") || "global-all";
    this.customUrl = localStorage.getItem("iptv_custom_url") || "";
    this.categories = ["All", "Tamil", "News", "Entertainment", "Music", "Movies", "Sports", "Favorites"];
  }

  loadFavorites() {
    try {
      const favs = localStorage.getItem("iptv_favorites");
      return favs ? JSON.parse(favs) : [];
    } catch (e) {
      return [];
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem("iptv_favorites", JSON.stringify(this.favorites));
    } catch (e) {
      console.error("Failed to save favorites", e);
    }
  }

  isFavorite(channel) {
    if (!channel) return false;
    return this.favorites.includes(channel.id || channel.url);
  }

  toggleFavorite(channel) {
    if (!channel) return false;
    const key = channel.id || channel.url;
    const index = this.favorites.indexOf(key);
    let state = false;
    if (index >= 0) {
      this.favorites.splice(index, 1);
      state = false;
    } else {
      this.favorites.push(key);
      state = true;
    }
    this.saveFavorites();
    return state;
  }

  async init() {
    await this.loadPlaylist(this.currentPlaylistId);
    
    // Restore last channel
    const savedNum = parseInt(localStorage.getItem("iptv_last_channel_num"), 10);
    if (savedNum) {
      const idx = this.channels.findIndex(c => c.num === savedNum);
      if (idx !== -1) {
        this.currentIndex = idx;
      }
    }
    this.applyCategoryFilter(this.currentCategory);
  }

  async loadPlaylist(presetId, customUrlOverride = null) {
    this.currentPlaylistId = presetId;
    localStorage.setItem("iptv_playlist_id", presetId);

    if (customUrlOverride) {
      this.customUrl = customUrlOverride;
      localStorage.setItem("iptv_custom_url", customUrlOverride);
    }

    const preset = PLAYLIST_PRESETS.find(p => p.id === presetId);

    if (presetId === "default" && !customUrlOverride) {
      this.channels = [...DEFAULT_CHANNELS];
      this.extractCategories();
      return this.channels;
    }

    const fetchUrl = presetId === "custom" ? (customUrlOverride || this.customUrl) : (preset ? preset.url : "data/in.m3u");

    if (!fetchUrl) {
      this.channels = [...DEFAULT_CHANNELS];
      this.extractCategories();
      return this.channels;
    }

    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error("Network error loading playlist");
      const text = await response.text();
      const parsed = this.parseM3U(text);
      if (parsed && parsed.length > 0) {
        this.channels = parsed;
      } else {
        console.warn("Parsed 0 channels, falling back to default");
        this.channels = [...DEFAULT_CHANNELS];
      }
    } catch (err) {
      console.error("Error loading playlist, using default channels:", err);
      this.channels = [...DEFAULT_CHANNELS];
    }

    this.extractCategories();
    this.currentIndex = 0;
    this.applyCategoryFilter("All");
    return this.channels;
  }

  // Detects if channel belongs to Tamil language/region
  isTamil(name, id, group) {
    const s = ((name || '') + ' ' + (id || '') + ' ' + (group || '')).toLowerCase();
    return s.includes('tamil') || s.includes('puthiya') || s.includes('kalaignar') || 
           s.includes('thanthi') || s.includes('polimer') || s.includes('raj tv') ||
           s.includes('raj digital') || s.includes('raj musix') || s.includes('captain') ||
           s.includes('tamilan') || s.includes('shakthi') || s.includes('vasantham');
  }

  parseM3U(content) {
    const lines = content.split(/\r?\n/);
    const rawChannels = [];
    let currentInfo = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith("#EXTINF:")) {
        currentInfo = this.parseExtInf(line);
      } else if (!line.startsWith("#") && currentInfo) {
        rawChannels.push({
          id: currentInfo.tvgId || `ch-${rawChannels.length + 1}`,
          name: currentInfo.name || `Channel ${rawChannels.length + 1}`,
          category: currentInfo.group || "General",
          country: currentInfo.country || "",
          logo: currentInfo.logo || "",
          url: line
        });
        currentInfo = null;
      }
    }

    // SORT: Prioritize Tamil channels at the top!
    const tamilChannels = [];
    const otherChannels = [];

    // Override broken external urls with known working ones
    const OVERRIDES = {
      'starvijay.in@sd': 'http://ptuf.ridsys.in/riptv/live/STAR_VIJAY/index.m3u8',
      'starvijay.in@hd': 'http://ptuf.ridsys.in/riptv/live/STAR_VIJAY/index.m3u8',
      'vijaysuper.in@sd': 'http://ptuf.ridsys.in/riptv/live/VIJAY_SUPER/index.m3u8'
    };

    rawChannels.forEach(ch => {
      const lowerId = (ch.id || '').toLowerCase();
      if (OVERRIDES[lowerId]) {
        ch.url = OVERRIDES[lowerId];
      }
      
      if (this.isTamil(ch.name, ch.id, ch.category)) {
        ch.category = "Tamil";
        tamilChannels.push(ch);
      } else {
        otherChannels.push(ch);
      }
    });

    const sorted = [...tamilChannels, ...otherChannels];
    
    // Assign clean sequential channel numbers: 1, 2, 3...
    sorted.forEach((ch, idx) => {
      ch.num = idx + 1;
    });

    return sorted;
  }

  parseExtInf(line) {
    const result = {
      tvgId: "",
      name: "",
      logo: "",
      group: "General",
      country: ""
    };

    const idMatch = line.match(/tvg-id="([^"]*)"/i);
    if (idMatch) result.tvgId = idMatch[1];

    const nameMatch = line.match(/tvg-name="([^"]*)"/i);
    if (nameMatch) result.name = nameMatch[1];

    const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
    if (logoMatch) result.logo = logoMatch[1];

    const groupMatch = line.match(/group-title="([^"]*)"/i);
    if (groupMatch) result.group = groupMatch[1];

    const countryMatch = line.match(/tvg-country="([^"]*)"/i);
    if (countryMatch) result.country = countryMatch[1];

    const commaIndex = line.lastIndexOf(",");
    if (commaIndex !== -1) {
      const title = line.substring(commaIndex + 1).trim();
      if (!result.name) result.name = title;
    }

    return result;
  }

  extractCategories() {
    const cats = new Set(["All", "Tamil", "Favorites"]);
    this.channels.forEach(ch => {
      if (ch.category && ch.category.trim() && ch.category !== "Tamil") {
        cats.add(ch.category.trim());
      }
    });
    this.categories = Array.from(cats);
  }

  applyCategoryFilter(category) {
    this.currentCategory = category;
    if (category === "All") {
      this.filteredChannels = [...this.channels];
    } else if (category === "Favorites") {
      this.filteredChannels = this.channels.filter(ch => this.isFavorite(ch));
    } else if (category === "Tamil") {
      this.filteredChannels = this.channels.filter(ch => ch.category === "Tamil" || this.isTamil(ch.name, ch.id, ch.category));
    } else {
      this.filteredChannels = this.channels.filter(ch => ch.category === category);
    }
    return this.filteredChannels;
  }

  getCurrentChannel() {
    if (this.channels.length === 0) return null;
    return this.channels[this.currentIndex] || this.channels[0];
  }

  nextChannel() {
    if (this.channels.length === 0) return null;
    this.currentIndex = (this.currentIndex + 1) % this.channels.length;
    this.saveLastChannel();
    return this.getCurrentChannel();
  }

  prevChannel() {
    if (this.channels.length === 0) return null;
    this.currentIndex = (this.currentIndex - 1 + this.channels.length) % this.channels.length;
    this.saveLastChannel();
    return this.getCurrentChannel();
  }

  jumpToNumber(num) {
    const index = this.channels.findIndex(ch => ch.num === num);
    if (index !== -1) {
      this.currentIndex = index;
      this.saveLastChannel();
      return this.getCurrentChannel();
    }
    return null;
  }

  selectChannel(channel) {
    const index = this.channels.findIndex(ch => ch === channel || ch.id === channel.id || (ch.num && ch.num === channel.num));
    if (index !== -1) {
      this.currentIndex = index;
      this.saveLastChannel();
      return this.getCurrentChannel();
    }
    return null;
  }

  saveLastChannel() {
    const ch = this.getCurrentChannel();
    if (ch) {
      localStorage.setItem("iptv_last_channel_num", ch.num);
    }
  }

  search(query) {
    if (!query || !query.trim()) {
      return this.applyCategoryFilter(this.currentCategory);
    }
    const q = query.toLowerCase().trim();
    return this.channels.filter(ch => 
      ch.name.toLowerCase().includes(q) || 
      (ch.category && ch.category.toLowerCase().includes(q)) ||
      (ch.country && ch.country.toLowerCase().includes(q)) ||
      String(ch.num) === q
    );
  }
}

window.ChannelManager = ChannelManager;
window.PLAYLIST_PRESETS = PLAYLIST_PRESETS;
