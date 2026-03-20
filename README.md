# Side Comments

**Watch YouTube videos and read comments at the same time.**

A Chrome extension that moves the comments section into the right sidebar — so you never have to scroll past the video to see what people are saying.

![Side Comments](icons/icon48.png)

---

## Features

- 📌 **Comments in sidebar** — fixed-height panel on the right, scrollable independently
- 🎵 **Playlist stays collapsed** — auto-collapses on load, expand freely anytime
- ⚡ **Instant loading** — comments appear without you having to scroll down
- 🎬 **More Videos below** — recommendations render natively beneath the comments
- 🌙 **Dark & light mode** — fully adapts to YouTube's theme
- 🔄 **SPA-aware** — works seamlessly when clicking between videos

---

## Installation

1. Download and extract the ZIP
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer Mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the `Side Comments` folder
5. Navigate to any YouTube video — the layout activates automatically

To disable: use the toggle on the extension card in `chrome://extensions`

---

## How It Works

The extension injects a content script into YouTube that listens for the `yt-navigate-finish` event to detect navigation, then uses a two-tier system to detect when comments are ready:

- **Tier 1** — `MutationObserver` watching for the `hidden` attribute to be removed from `#comments`
- **Tier 2** — A periodic interval fallback (every 500ms, up to 30 seconds)

Once comments are ready, they get prepended into `#secondary-inner` and the CSS layout activates.

---

## 🙏 Huge Credit — Sidesy by abinjohn123

**This extension would not exist without [Sidesy](https://github.com/abinjohn123/sidesy) by [@abinjohn123](https://github.com/abinjohn123).**

Sidesy is the original extension that pioneered moving YouTube comments to a sidebar. After many failed attempts at reliable SPA navigation detection, studying Sidesy's source code was the breakthrough.

### Key insights from Sidesy's code

```js
// The check that actually works — credit: Sidesy by abinjohn123
function areCommentsReady() {
  const comments = document.getElementById('comments');
  return comments &&
         !comments.hasAttribute('hidden') &&
         comments.innerHTML.length > 100; // ensures content is actually loaded
}

// yt-navigate-finish is YouTube's own reliable SPA navigation event
document.addEventListener('yt-navigate-finish', onNavigate);
```

- Use `getElementById('comments')` not `querySelector('ytd-comments#comments')`
- `innerHTML.length > 100` ensures comments are actually loaded, not just present in DOM
- `cleanup()` should only disconnect observers — never touch the DOM during navigation
- `yt-navigate-finish` is sufficient — no background scripts or extra permissions needed
- YouTube updates `#comments` in-place, so you never need to move it back on navigation

### Check out Sidesy

Sidesy is more full-featured — toggle button, keyboard shortcut, scroll position preservation, and a polished popup. If you want those features, use Sidesy:

- **GitHub**: https://github.com/abinjohn123/sidesy
- **Chrome Web Store**: https://chromewebstore.google.com/detail/mlceikceecooilkgiikkopipedhjjech
- **Developer**: [@abinjohn123](https://github.com/abinjohn123)

---

## License

MIT — do whatever you want with this. And if you build something cool on top of it, give a nod to [@abinjohn123](https://github.com/abinjohn123) too. 🙌
