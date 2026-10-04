/**
 * test-remote.js - Automated Verification of Channel Manager and Remote Control logic
 */

const assert = require('assert');

// Mock browser globals for Node testing
global.window = global;
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; }
};

// Load ChannelManager
require('../js/channels.js');

console.log("▶ Running ChannelManager & Remote Verification Tests...");

// 1. Initial channels test
const cm = new window.ChannelManager();
assert.ok(cm, "ChannelManager initialized");
cm.channels = [
  { id: "ch1", num: 1, name: "Channel One", category: "News", url: "http://stream1.m3u8" },
  { id: "ch2", num: 2, name: "Channel Two", category: "Sports", url: "http://stream2.m3u8" },
  { id: "ch3", num: 3, name: "Channel Three", category: "Movies", url: "http://stream3.m3u8" }
];
cm.extractCategories();

// 2. Channel navigation test
assert.strictEqual(cm.getCurrentChannel().num, 1, "Initial channel is 1");
const next = cm.nextChannel();
assert.strictEqual(next.num, 2, "Channel Up moves from 1 to 2");
const next2 = cm.nextChannel();
assert.strictEqual(next2.num, 3, "Channel Up moves from 2 to 3");
const wrapNext = cm.nextChannel();
assert.strictEqual(wrapNext.num, 1, "Channel Up wraps from 3 to 1");

const prev = cm.prevChannel();
assert.strictEqual(prev.num, 3, "Channel Down wraps from 1 to 3");

// 3. Jump to number test
const jumped = cm.jumpToNumber(2);
assert.strictEqual(jumped.num, 2, "Jump to number 2 works");

// 4. Favorites test
assert.strictEqual(cm.isFavorite(cm.getCurrentChannel()), false, "Initially not favorite");
const favState = cm.toggleFavorite(cm.getCurrentChannel());
assert.strictEqual(favState, true, "Toggled favorite to true");
assert.strictEqual(cm.isFavorite(cm.getCurrentChannel()), true, "isFavorite returns true");
assert.ok(localStorage.getItem("iptv_favorites").includes("ch2"), "Saved to localStorage");

// 5. M3U Parser test
const sampleM3u = `#EXTM3U
#EXTINF:-1 tvg-id="test-1" tvg-name="Test One" tvg-logo="http://logo.png" group-title="Documentary",Test HD Channel
https://live.stream.com/stream.m3u8
#EXTINF:-1 tvg-id="test-2" tvg-name="Test Two" group-title="Music",Music Hits
https://live.stream.com/music.m3u8`;

const parsed = cm.parseM3U(sampleM3u);
assert.strictEqual(parsed.length, 2, "Parsed 2 channels");
assert.strictEqual(parsed[0].num, 1, "Assigned channel number 1");
assert.strictEqual(parsed[0].name, "Test One", "Extracted channel name");
assert.strictEqual(parsed[0].category, "Documentary", "Extracted group title");
assert.strictEqual(parsed[0].url, "https://live.stream.com/stream.m3u8", "Extracted stream url");

// 6. Search test
const searchResults = cm.search("channel");
assert.strictEqual(searchResults.length, 3, "Search finds 3 channels matching 'channel'");

console.log("✔ ALL UNIT & INTEGRATION TESTS PASSED SUCCESSFULLY!");
