/*
 * Side Comments v5
 * - Comments panel in right sidebar
 * - Playlist collapses on load, user can expand freely
 */

const WATCH = 'youtube.com/watch';

let obs1        = null;
let interval    = null;
let activated   = false;
let nudgeTmr    = null;
let playlistObs = null;

const isWatch = () => location.href.includes(WATCH);

function commentsReady() {
  const c = document.getElementById('comments');
  return c && !c.hasAttribute('hidden') && c.innerHTML.length > 100;
}

function cleanup() {
  obs1?.disconnect();        obs1 = null;
  playlistObs?.disconnect(); playlistObs = null;
  if (interval) { clearInterval(interval); interval = null; }
  activated = false;
}

function forceCommentsLoad() {
  const savedY = window.scrollY;
  window.scrollTo({ top: 800, behavior: 'instant' });
  requestAnimationFrame(() => {
    window.scrollTo({ top: savedY, behavior: 'instant' });
  });
}

/* ── Collapse playlist once on load ──────────────────
   Watch for ytd-playlist-panel-renderer to appear, then
   immediately stamp collapsed="" on it before YouTube
   renders it open. We only do this once per navigation —
   after that the user can expand/collapse freely.
──────────────────────────────────────────────────────── */
function collapseOnce(pl) {
  if (pl.hasAttribute('collapsed')) return; // already collapsed
  pl.setAttribute('collapsed', '');
  try { pl.collapsed = true; } catch(e) {}
}

function watchAndCollapsePlaylist() {
  const existing = document.querySelector('ytd-playlist-panel-renderer');
  if (existing) {
    collapseOnce(existing);
    return;
  }
  playlistObs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        const pl = node.tagName === 'YTD-PLAYLIST-PANEL-RENDERER'
          ? node
          : node.querySelector?.('ytd-playlist-panel-renderer');
        if (pl) {
          collapseOnce(pl);
          playlistObs.disconnect();
          playlistObs = null;
          return;
        }
      }
    }
  });
  playlistObs.observe(document.body, { childList: true, subtree: true });
}

/* ── Detection ─────────────────────────────────────── */
function detect() {
  if (!isWatch()) return;

  watchAndCollapsePlaylist();

  if (tryActivate()) return;

  const c = document.getElementById('comments');
  if (c?.hasAttribute('hidden')) {
    obs1 = new MutationObserver(() => {
      if (!c.hasAttribute('hidden')) {
        obs1.disconnect(); obs1 = null;
        if (!tryActivate()) startInterval();
      }
    });
    obs1.observe(c, { attributes: true, attributeFilter: ['hidden'] });
  }

  forceCommentsLoad();
  startInterval();
}

function startInterval() {
  if (interval) return;
  let n = 0;
  interval = setInterval(() => {
    n++;
    if (tryActivate() || n >= 60) { clearInterval(interval); interval = null; }
  }, 500);
}

function tryActivate() {
  if (activated) return true;
  if (!commentsReady()) return false;
  activated = true;
  obs1?.disconnect(); obs1 = null;
  if (interval) { clearInterval(interval); interval = null; }
  activate();
  return true;
}

/* ── Activate layout ───────────────────────────────── */
function activate() {
  const comments = document.getElementById('comments');
  const secInner = document.querySelector('#secondary-inner');
  const columns  = document.querySelector('#columns');
  if (!comments || !secInner || !columns) return;

  document.documentElement.classList.add('sc-active');
  columns.setAttribute('data-sc', '1');

  secInner.prepend(comments);
  comments.classList.add('sc-comments');

  nudge();
}

/* ── Navigation ────────────────────────────────────── */
document.addEventListener('yt-navigate-finish', () => {
  if (!isWatch()) {
    document.documentElement.classList.remove('sc-active');
    document.querySelector('#columns')?.removeAttribute('data-sc');
    document.getElementById('comments')?.classList.remove('sc-comments');
    cleanup();
    return;
  }
  cleanup();
  detect();
});

/* ── Initial load ───────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { if (isWatch()) detect(); });
} else if (isWatch()) {
  detect();
}

/* ── Nudge ──────────────────────────────────────────── */
function nudge() {
  clearInterval(nudgeTmr);
  const sec = document.querySelector('#secondary');
  const fire = () => {
    window.dispatchEvent(new Event('resize'));
    if (sec) { sec.scrollTop = 1; requestAnimationFrame(() => { sec.scrollTop = 0; }); }
  };
  fire();
  let t = 0;
  nudgeTmr = setInterval(() => { fire(); if (++t >= 16) clearInterval(nudgeTmr); }, 500);
}
