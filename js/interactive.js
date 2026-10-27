// Small interactive demos plus the one-slide-at-a-time pager that drives the
// page. Dependency-free. Animations only touch transform/opacity, and the
// pager drops to a lighter mode on slower machines.

/* ---------- Performance mode ---------- */
let LITE =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  (navigator.hardwareConcurrency || 8) <= 2 ||
  (navigator.deviceMemory || 8) <= 2;

function setLite(on) {
  LITE = on;
  document.documentElement.classList.toggle("lite", on);
}

/* ---------- Typewriter (one DOM write per frame at most) ---------- */
function stopTyping(el) {
  if (el) cancelAnimationFrame(el._raf);
}

// Splits an HTML string after the first n visible characters. `head` is the
// typed part (tags balanced); `tail` is the rest, with open tags re-opened,
// so the two can be shown together with the tail visually hidden.
function splitHtml(html, n) {
  let head = "";
  let count = 0;
  const open = [];
  let i = 0;
  for (; i < html.length; ) {
    const ch = html[i];
    if (ch === "<") {
      const end = html.indexOf(">", i);
      const tag = html.slice(i, end + 1);
      const m = /^<\/?([a-z0-9]+)/i.exec(tag);
      if (/^<\//.test(tag)) open.pop();
      else if (m && !/\/>$/.test(tag)) open.push({ name: m[1], tag });
      head += tag;
      i = end + 1;
      continue;
    }
    if (count >= n) break;
    if (ch === "&") {
      const end = html.indexOf(";", i);
      const ent = end > -1 && end - i < 9 ? html.slice(i, end + 1) : ch;
      head += ent;
      i += ent.length;
    } else {
      head += ch;
      i++;
    }
    count++;
  }
  const closing = open
    .slice()
    .reverse()
    .map((o) => "</" + o.name + ">")
    .join("");
  const reopening = open.map((o) => o.tag).join("");
  return { head: head + closing, tail: reopening + html.slice(i) };
}

function visibleLength(html) {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.textContent.length;
}

function typeInto(el, html, msPerChar, onDone) {
  stopTyping(el);
  el.classList.remove("tw-pending");
  const total = visibleLength(html);
  const per = msPerChar * (LITE ? 0.5 : 1);
  const t0 = performance.now();
  let shown = -1;
  function frame(now) {
    const n = Math.min(total, Math.floor((now - t0) / per) + 1);
    if (n !== shown) {
      shown = n;
      const { head, tail } = splitHtml(html, n);
      // The untyped rest stays in the page (hidden), so the full text is
      // always there for search engines and keeps the layout from jumping.
      el.innerHTML = head + (tail ? '<span class="tw-rest">' + tail + "</span>" : "");
    }
    if (n < total) {
      el._raf = requestAnimationFrame(frame);
    } else if (onDone) {
      el.innerHTML = html;
      onDone();
    }
  }
  el._raf = requestAnimationFrame(frame);
}

/* ---------- Reveal: eyebrow, heading, body and widget of one slide ---------- */
function createSectionRevealer(container) {
  const eyebrow = container.querySelector(".section-head .eyebrow");
  const heading = container.querySelector(".section-head h2");
  const bodyItems = Array.from(container.querySelectorAll(".prompt-body > p, .prompt-body > ul > li"));
  const widget = container.querySelector(".prompt-reveal-widget");
  let timers = [];

  function schedule(fn, delay) {
    const t = setTimeout(fn, delay);
    timers.push(t);
  }

  function clearPending() {
    timers.forEach(clearTimeout);
    timers = [];
    dots.remove();
    stopTyping(heading);
    bodyItems.forEach(stopTyping);
  }

  // The page text is the source of truth. Strip any typing wrappers, then
  // remember the full markup of each element.
  function recapture() {
    [heading, ...bodyItems].forEach((el) => {
      if (!el || !el.textContent.trim()) return;
      const tmp = document.createElement("div");
      tmp.innerHTML = el.innerHTML;
      tmp.querySelectorAll(".tw-rest").forEach((n) => n.replaceWith(...n.childNodes));
      el.dataset.fullText = tmp.innerHTML.trim();
    });
  }

  function reset() {
    clearPending();
    if (eyebrow) eyebrow.style.opacity = "0";
    [heading, ...bodyItems].forEach((el) => {
      if (!el) return;
      if (el.dataset.fullText) el.innerHTML = el.dataset.fullText;
      el.classList.add("tw-pending");
    });
    if (widget) widget.style.opacity = "0";
  }

  // Between paragraphs: a short "thinking" pause with three typing dots,
  // laid over the spot where the next paragraph will appear.
  const dots = document.createElement("div");
  dots.className = "typing-dots";
  dots.setAttribute("aria-hidden", "true");
  dots.innerHTML = "<span></span><span></span><span></span>";

  function revealBody(i, onComplete) {
    if (i >= bodyItems.length) {
      if (widget) requestAnimationFrame(() => (widget.style.opacity = "1"));
      schedule(() => onComplete && onComplete(), widget ? 180 : 0);
      return;
    }
    typeInto(bodyItems[i], bodyItems[i].dataset.fullText, 3, () => {
      const next = bodyItems[i + 1];
      if (next && next.tagName === "P") {
        schedule(() => {
          const host = next.parentElement;
          host.style.position = "relative";
          dots.style.top = next.offsetTop + "px";
          host.appendChild(dots);
          schedule(() => {
            dots.remove();
            revealBody(i + 1, onComplete);
          }, LITE ? 600 : 1500 + Math.random() * 600);
        }, LITE ? 150 : 700);
      } else {
        schedule(() => revealBody(i + 1, onComplete), 60);
      }
    });
  }

  function reveal(delay, onComplete) {
    schedule(() => {
      if (eyebrow) eyebrow.style.opacity = "1";
      if (heading) {
        typeInto(heading, heading.dataset.fullText, 7, () => {
          schedule(() => revealBody(0, onComplete), 70);
        });
      } else {
        revealBody(0, onComplete);
      }
    }, delay);
  }

  function finishAll() {
    clearPending();
    if (eyebrow) eyebrow.style.opacity = "1";
    [heading, ...bodyItems].forEach((el) => {
      if (!el) return;
      el.classList.remove("tw-pending");
      if (el.dataset.fullText) el.innerHTML = el.dataset.fullText;
    });
    if (widget) widget.style.opacity = "1";
  }

  recapture();
  reset();
  return { recapture, reset, reveal, finishAll };
}

/* ---------- Slide controllers ----------
   enter(instant): show the slide, animating unless `instant` (used when
   coming back from below). finish(): jump to the fully revealed state.
   Every forward visit replays the animation from the start. */
function buildPromptController(container) {
  const promptEl = container.querySelector(".section-prompt");
  if (!promptEl) return null;
  const typed = promptEl.querySelector(".section-prompt-typed");
  const source = container.querySelector(".prompt-source");
  if (!typed || !source) return null;

  const revealer = createSectionRevealer(container);
  let done = false;

  // "Sending": the arrow presses and fades, then the pill glides into a
  // small right-aligned message bubble in one continuous motion. Width and
  // offset are animated in pixels so nothing snaps when it finishes.
  let morphTimer = null;

  function clearInline() {
    promptEl.style.width = "";
    promptEl.style.marginLeft = "";
  }

  function morph() {
    const parent = promptEl.parentElement;
    const first = promptEl.getBoundingClientRect().width;
    const clone = promptEl.cloneNode(true);
    clone.removeAttribute("id");
    clone.classList.add("prompt-sent", "no-transition");
    clone.style.visibility = "hidden";
    parent.appendChild(clone);
    const finalW = clone.getBoundingClientRect().width;
    clone.remove();
    promptEl.style.width = first + "px";
    promptEl.style.marginLeft = "0px";
    void promptEl.offsetWidth;
    promptEl.classList.add("prompt-sent");
    promptEl.style.width = finalW + "px";
    promptEl.style.marginLeft = parent.clientWidth - finalW + "px";
    morphTimer = setTimeout(clearInline, 1500);
  }

  function markSent(animate) {
    clearTimeout(morphTimer);
    const sendBtn = promptEl.querySelector(".section-prompt-send");
    if (!animate) {
      promptEl.classList.add("no-transition", "sending", "prompt-sent");
      clearInline();
      void promptEl.offsetWidth;
      requestAnimationFrame(() => promptEl.classList.remove("no-transition"));
      return;
    }
    promptEl.classList.add("sending");
    if (sendBtn) {
      sendBtn.classList.remove("sent");
      void sendBtn.offsetWidth;
      sendBtn.classList.add("sent");
    }
    morphTimer = setTimeout(morph, LITE ? 150 : 800);
  }

  let startTimer = null;

  function finish() {
    clearTimeout(startTimer);
    promptEl.classList.remove("no-transition");
    stopTyping(typed);
    typed.textContent = source.textContent.trim();
    markSent(false);
    revealer.finishAll();
    done = true;
  }

  function run() {
    done = false;
    clearTimeout(startTimer);
    stopTyping(typed);
    // Snap the pill back to its empty state without animating, so it doesn't
    // visibly shrink/grow while the slide is flying in.
    promptEl.classList.add("no-transition");
    clearTimeout(morphTimer);
    clearInline();
    promptEl.classList.remove("prompt-sent", "sending");
    typed.textContent = "";
    revealer.recapture();
    revealer.reset();
    void promptEl.offsetWidth;
    requestAnimationFrame(() => promptEl.classList.remove("no-transition"));
    // Let the slide land before the first letter appears.
    startTimer = setTimeout(() => {
      typeInto(typed, source.textContent.trim(), 9, () => {
        // A beat before "sending", then let the bubble settle before the answer starts.
        startTimer = setTimeout(() => {
          markSent(true);
          revealer.reveal(LITE ? 400 : 2300, () => {
            done = true;
          });
        }, LITE ? 150 : 650);
      });
    }, LITE ? 100 : 500);
  }

  return {
    enter(instant) {
      if (instant) {
        revealer.recapture();
        finish();
      } else {
        run();
      }
    },
    finish,
    isDone: () => done,
  };
}

function buildAgentController(container) {
  const demo = container.querySelector("#agentDemo");
  if (!demo) return null;
  const source = container.querySelector(".ai-prompt-source");
  const typed = demo.querySelector("#agentTyped");
  const typing = demo.querySelector("#agentTyping");
  if (!source || !typed) return null;

  const revealer = createSectionRevealer(container);
  let done = false;
  let timer = null;

  function finish() {
    clearTimeout(timer);
    stopTyping(typed);
    typed.textContent = source.textContent.trim();
    if (typing) typing.style.visibility = "visible";
    revealer.finishAll();
    done = true;
  }

  function run() {
    done = false;
    clearTimeout(timer);
    revealer.recapture();
    revealer.reset();
    if (typing) typing.style.visibility = "hidden";
    typeInto(typed, source.textContent.trim(), 11, () => {
      timer = setTimeout(() => {
        if (typing) typing.style.visibility = "visible";
        revealer.reveal(110, () => {
          done = true;
        });
      }, 180);
    });
  }

  return {
    enter(instant) {
      if (instant) {
        revealer.recapture();
        finish();
      } else {
        run();
      }
    },
    finish,
    isDone: () => done,
  };
}

function buildInstantController() {
  return { enter() {}, finish() {}, isDone: () => true };
}

function buildSlideController(section) {
  return buildPromptController(section) || buildAgentController(section) || buildInstantController();
}

/* ---------- Vandra design-system demo ---------- */
function initVandraDemo() {
  const root = document.getElementById("vandraDemo");
  if (!root) return;
  const tokens = document.getElementById("vdTokens");
  const cursor = document.createElement("div");
  cursor.className = "vd-cursor";
  cursor.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M5 3l14 8-6.2 1.6L16 20l-2.6 1-3.2-7.4L5 18z"/></svg>';
  root.appendChild(cursor);
  const names = { "#2f4a3c": "moss", "#c8582f": "ember", "#1f2d44": "dusk", "#4f8697": "glacier" };
  const state = { color: "#2f4a3c", font: null, radius: "0px", theme: "light" };
  let touched = false;
  function markTouched() {
    touched = true;
    root.classList.add("touched");
    cursor.style.opacity = "0";
  }

  function render() {
    root.style.setProperty("--b", state.color);
    if (state.font) root.style.setProperty("--font", state.font);
    root.style.setProperty("--radius", state.radius);
    root.dataset.theme = state.theme;
    if (tokens) {
      const font = (state.font || "Archivo").split(",")[0].replace(/['"]/g, "");
      const radius = state.radius === "999px" ? "round" : state.radius === "0px" ? "square" : "soft";
      tokens.textContent =
        "brand.color  " + (names[state.color] || state.color) +
        "\nbrand.font   " + font +
        "\nbutton.shape " + radius +
        "\ntheme        " + state.theme;
    }
  }

  root.querySelectorAll("[data-vd]").forEach((group) => {
    const key = group.dataset.vd;
    group.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (e.isTrusted) markTouched();
        group.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
        state[key] = btn.dataset.value;
        render();
      });
    });
  });

  root.querySelectorAll(".vd-chips button").forEach((chip) => {
    const on = () => {
      root.classList.add("dim");
      root.querySelectorAll('.vd-mails [data-c="' + chip.dataset.c + '"]').forEach((el) => el.classList.add("hl"));
    };
    const off = () => {
      root.classList.remove("dim");
      root.querySelectorAll(".hl").forEach((el) => el.classList.remove("hl"));
    };
    chip.addEventListener("mouseenter", on);
    chip.addEventListener("mouseleave", off);
    chip.addEventListener("focus", on);
    chip.addEventListener("blur", off);
  });

  // When the slide appears, a cursor visibly clicks through the design
  // system once, so it's clear the panel is interactive and drives the emails.
  const slide = root.closest(".slide");
  let demoed = false;

  function moveTo(el) {
    const r = el.getBoundingClientRect();
    const p = root.getBoundingClientRect();
    cursor.style.transform =
      "translate(" + (r.left - p.left + r.width / 2 - 4) + "px," + (r.top - p.top + r.height / 2 - 2) + "px)";
  }

  function wait(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async function demo() {
    const sw = root.querySelectorAll('[data-vd="color"] button');
    const corners = root.querySelectorAll('[data-vd="radius"] button');
    const steps = [sw[1], corners[2], sw[3]];
    cursor.style.transition = "none";
    cursor.style.transform = "translate(120px, 40px)";
    void cursor.offsetWidth;
    cursor.style.transition = "";
    cursor.style.opacity = "1";
    await wait(500);
    for (const el of steps) {
      if (touched) return;
      moveTo(el);
      await wait(1000);
      if (touched) return;
      cursor.classList.add("press");
      el.classList.add("vd-ping");
      el.click();
      await wait(220);
      cursor.classList.remove("press");
      await wait(900);
      el.classList.remove("vd-ping");
    }
    cursor.style.opacity = "0";
  }

  if (slide) {
    new MutationObserver(() => {
      if (!slide.classList.contains("active") || demoed || touched) return;
      demoed = true;
      setTimeout(() => {
        if (!touched && slide.classList.contains("active")) demo();
      }, 1400);
    }).observe(slide, { attributes: true, attributeFilter: ["class"] });
  }

  render();
}

/* ---------- ESP carousel ----------
   Cards crossfade in place (no sliding track, so wrapping from the last card
   back to the first is as smooth as any other step). It only runs while its
   slide is on screen and restarts from the first card every time the slide
   is entered, so it never changes under you while the text is still typing. */
function initEspCarousel() {
  const carousel = document.getElementById("espCarousel");
  const track = document.getElementById("espTrack");
  const dotsWrap = document.getElementById("espDots");
  if (!carousel || !track || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll(".esp-card"));
  const slide = carousel.closest(".slide");
  let index = 0;
  let timer = null;
  let hovering = false;

  const dots = cards.map((_, i) => {
    const dot = document.createElement("span");
    dotsWrap.appendChild(dot);
    return dot;
  });

  function show(i) {
    index = i;
    cards.forEach((c, k) => c.classList.toggle("active", k === i));
    dots.forEach((d, k) => d.classList.toggle("active", k === i));
  }

  function stop() {
    clearTimeout(timer);
  }

  function schedule(delay) {
    stop();
    timer = setTimeout(tick, delay);
  }

  function tick() {
    if (!slide || !slide.classList.contains("active")) return;
    if (!hovering) show((index + 1) % cards.length);
    schedule(3600);
  }

  carousel.addEventListener("mouseenter", () => (hovering = true));
  carousel.addEventListener("mouseleave", () => {
    hovering = false;
  });

  show(0);

  if (slide) {
    new MutationObserver(() => {
      if (slide.classList.contains("active")) {
        show(0);
        // Wait until the answer has typed in and the card has faded up.
        schedule(6000);
      } else {
        stop();
      }
    }).observe(slide, { attributes: true, attributeFilter: ["class"] });
  }
}

/* ---------- Betty video ----------
   Starts from 0:00 each time its slide is entered and pauses when it's left.
   Custom controls (play, seek, time, sound, enlarge). "Enlarge" moves the
   same player into an in-page modal instead of using native fullscreen. */
function isModalOpen() {
  return document.documentElement.classList.contains("modal-open");
}

function initBettyVideo() {
  const player = document.getElementById("bettyPlayer");
  const video = document.getElementById("bettyVideo");
  const modal = document.getElementById("videoModal");
  const modalSlot = document.getElementById("videoModalSlot");
  const homeSlot = document.getElementById("bettySlot");
  if (!player || !video || !modal || !modalSlot || !homeSlot) return;
  const slide = player.closest(".slide");

  const playBtn = player.querySelector(".bv-play");
  const centerBtn = player.querySelector(".bv-center");
  const seek = player.querySelector(".bv-seek");
  const timeEl = player.querySelector(".bv-time");
  const muteBtn = player.querySelector(".bv-mute");
  const expandBtn = player.querySelector(".bv-expand");
  let seeking = false;
  let lastFocus = null;

  const fmt = (t) => {
    if (!isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const sec = Math.floor(t % 60);
    return m + ":" + String(sec).padStart(2, "0");
  };

  function syncPlay() {
    const paused = video.paused;
    player.classList.toggle("paused", paused);
    playBtn.setAttribute("aria-label", paused ? "Play" : "Pause");
    centerBtn.setAttribute("aria-label", paused ? "Play" : "Pause");
  }

  function syncSound() {
    const on = !video.muted && video.volume > 0;
    player.classList.toggle("sound", on);
    muteBtn.setAttribute("aria-label", on ? "Turn sound off" : "Turn sound on");
  }

  function syncTime() {
    const d = video.duration || 0;
    timeEl.textContent = fmt(video.currentTime) + " / " + fmt(d);
    if (!seeking && d) {
      const v = (video.currentTime / d) * 1000;
      seek.value = v;
      seek.style.setProperty("--p", v / 10 + "%");
    }
  }

  function play() {
    const p = video.play();
    if (p && p.catch) {
      p.catch(() => {
        // Autoplay with sound can be refused; fall back to muted.
        video.muted = true;
        syncSound();
        video.play().catch(() => {});
      });
    }
  }

  function toggle() {
    if (video.paused) play();
    else video.pause();
  }

  video.addEventListener("play", syncPlay);
  video.addEventListener("pause", syncPlay);
  video.addEventListener("volumechange", syncSound);
  video.addEventListener("timeupdate", syncTime);
  video.addEventListener("loadedmetadata", syncTime);
  video.addEventListener("click", toggle);
  playBtn.addEventListener("click", toggle);
  centerBtn.addEventListener("click", toggle);
  muteBtn.addEventListener("click", () => {
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 1;
  });
  seek.addEventListener("input", () => {
    seeking = true;
    const d = video.duration || 0;
    video.currentTime = (seek.value / 1000) * d;
    seek.style.setProperty("--p", seek.value / 10 + "%");
    timeEl.textContent = fmt(video.currentTime) + " / " + fmt(d);
  });
  seek.addEventListener("change", () => {
    seeking = false;
  });

  function moveTo(slot) {
    const wasPlaying = !video.paused;
    slot.appendChild(player);
    if (wasPlaying && video.paused) play();
  }

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.documentElement.classList.add("modal-open");
    moveTo(modalSlot);
    modal.querySelector(".video-modal-close").focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.documentElement.classList.remove("modal-open");
    moveTo(homeSlot);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  expandBtn.addEventListener("click", () => (isModalOpen() ? closeModal() : openModal()));
  modal.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
  window.addEventListener("keydown", (e) => {
    if (!isModalOpen()) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    } else if (e.key === " " && !/^(BUTTON|INPUT)$/.test(document.activeElement.tagName)) {
      e.preventDefault();
      toggle();
    }
  });

  if (slide) {
    new MutationObserver(() => {
      if (slide.classList.contains("active")) {
        video.currentTime = 0;
        play();
      } else if (!isModalOpen()) {
        video.pause();
      }
    }).observe(slide, { attributes: true, attributeFilter: ["class"] });
  }

  syncPlay();
  syncSound();
}

/* ---------- One-slide-at-a-time pager ----------
   The hero is slide 0 and the footer lives in the last slide, so the page
   never scrolls natively: wheel / swipe / keys step between slides. A step on
   an unfinished slide first finishes it; the next one moves on. Going back
   shows slides already complete; going forward replays their animation. */
function initSlidePager() {
  const pager = document.getElementById("slidePager");
  const progress = document.getElementById("pagerProgress");
  if (!pager) return;

  const slides = Array.from(pager.querySelectorAll(":scope > .slide"));
  if (!slides.length) return;

  setLite(LITE);
  const controllers = slides.map(buildSlideController);

  // Each slide's top-level pieces fly in/out one after another.
  slides.forEach((slide) => {
    let items = slide.querySelectorAll(".prompt-sequence > *");
    if (!items.length) items = slide.querySelectorAll(".be-inner > *");
    if (!items.length) items = slide.querySelectorAll(".wrap > *");
    items.forEach((el, i) => {
      el.classList.add("fly-item");
      el.style.setProperty("--i", i);
    });
  });

  const dots = slides.map((_, i) => {
    const dot = document.createElement("span");
    dot.addEventListener("click", () => goTo(i));
    if (progress) progress.appendChild(dot);
    return dot;
  });

  let index = 0;
  let busy = false;

  document.documentElement.classList.add("pager-engaged");
  pager.classList.add("engaged");

  // The booking calendar (a Google embed) only loads once it is about to be seen.
  const lazyFrames = slides.map((s) => s.querySelector("iframe[data-src]"));
  function loadFrames(i) {
    [i, i + 1].forEach((k) => {
      const f = lazyFrames[k];
      if (f && !f.getAttribute("src")) f.setAttribute("src", f.dataset.src);
    });
  }

  function show(i, instant) {
    index = i;
    loadFrames(i);
    slides.forEach((s, k) => s.classList.toggle("active", k === i));
    dots.forEach((d, k) => d.classList.toggle("active", k === i));
    controllers[i].enter(instant);
  }

  // A few frames' worth of timing on the first transition decides whether
  // this machine gets the lighter animations.
  let probed = false;
  function probeFrameRate() {
    if (probed) return;
    probed = true;
    let last = performance.now();
    let n = 0;
    let sum = 0;
    requestAnimationFrame(function f(now) {
      sum += now - last;
      last = now;
      if (++n < 24) requestAnimationFrame(f);
      else if (sum / n > 28) setLite(true);
    });
  }

  // Every slide has its own URL (#the-fix, #kontakt, ...) and the browser's
  // back/forward buttons step between slides.
  function setHash(i) {
    const url = i === 0 ? location.pathname + location.search : "#" + slides[i].id;
    history.pushState(null, "", url);
  }

  function indexFromLocation() {
    const id = location.hash.slice(1);
    const i = slides.findIndex((sl) => sl.id === id);
    return i === -1 ? 0 : i;
  }

  function goTo(target, fromHistory) {
    if (busy || target === index || target < 0 || target >= slides.length) return;
    busy = true;
    if (fromHistory !== true) setHash(target);
    probeFrameRate();
    const from = index;
    const prev = slides[from];
    const forward = target > from;
    pager.style.setProperty("--fly", forward ? -1 : 1);
    controllers[from].finish();
    prev.classList.remove("active");
    prev.classList.add("leaving");
    index = target;
    loadFrames(target);
    dots.forEach((d, k) => d.classList.toggle("active", k === target));
    setTimeout(() => {
      prev.classList.remove("leaving");
      slides[target].classList.add("active");
      controllers[target].enter(!forward);
      setTimeout(() => {
        busy = false;
      }, LITE ? 120 : 450);
    }, LITE ? 150 : 420);
  }

  function step(dir) {
    if (busy) return;
    if (dir > 0 && !controllers[index].isDone()) {
      controllers[index].finish();
      return;
    }
    goTo(index + dir);
  }

  // Links to #id and #top.
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href").slice(1);
    const target = id ? slides.findIndex((s) => s.id === id) : -1;
    if (target === -1) return;
    e.preventDefault();
    goTo(target);
  });

  /* Wheel / trackpad. One physical gesture = one step; momentum tails are
     ignored, a clearly stronger new push or a pause starts a new gesture. */
  let wheelLocked = false;
  let wheelTimer = null;
  let lastAbs = 0;
  let lockedAt = 0;

  function lockWheel(abs, now) {
    wheelLocked = true;
    lockedAt = now;
    lastAbs = abs;
  }

  window.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey) return;
      if (isModalOpen()) {
        e.preventDefault();
        return;
      }
      const abs = Math.abs(e.deltaY);
      const now = performance.now();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        wheelLocked = false;
      }, 160);

      // A slide taller than the screen scrolls inside itself first.
      const active = slides[index];
      const down = e.deltaY > 0;
      const canScroll = down
        ? active.scrollTop + active.clientHeight < active.scrollHeight - 2
        : active.scrollTop > 0;
      if (canScroll && active.contains(e.target)) {
        lockWheel(abs, now);
        return;
      }

      e.preventDefault();
      if (wheelLocked && abs > lastAbs * 1.6 + 4 && now - lockedAt > 250) wheelLocked = false;
      lastAbs = abs;
      if (abs < 2 || wheelLocked) return;
      lockWheel(abs, now);
      step(down ? 1 : -1);
    },
    { passive: false }
  );

  // Touch: swipe, but only when the slide is already scrolled to that edge.
  let touchY = null;
  let atTop = true;
  let atBottom = true;
  pager.addEventListener(
    "touchstart",
    (e) => {
      touchY = e.touches[0].clientY;
      const a = slides[index];
      atTop = a.scrollTop <= 0;
      atBottom = a.scrollTop + a.clientHeight >= a.scrollHeight - 2;
    },
    { passive: true }
  );
  pager.addEventListener("touchend", (e) => {
    if (touchY == null) return;
    const dy = touchY - e.changedTouches[0].clientY;
    touchY = null;
    if (Math.abs(dy) < 45) return;
    if (dy > 0 && atBottom) step(1);
    if (dy < 0 && atTop) step(-1);
  });

  window.addEventListener("keydown", (e) => {
    if (isModalOpen()) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    const k = e.key;
    if (k === " " && /^(BUTTON|A)$/.test(document.activeElement.tagName)) return;
    if (k === "ArrowDown" || k === "PageDown" || (k === " " && !e.shiftKey)) {
      e.preventDefault();
      step(1);
    } else if (k === "ArrowUp" || k === "PageUp" || (k === " " && e.shiftKey)) {
      e.preventDefault();
      step(-1);
    } else if (k === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (k === "End") {
      e.preventDefault();
      goTo(slides.length - 1);
    }
  });

  const hashTarget = indexFromLocation();
  show(hashTarget, hashTarget > 0);

  function followHistory() {
    const t = indexFromLocation();
    if (t === index) return;
    if (busy) setTimeout(followHistory, 300);
    else goTo(t, true);
  }
  window.addEventListener("popstate", followHistory);
  window.addEventListener("hashchange", followHistory);
}

document.addEventListener("DOMContentLoaded", () => {
  initSlidePager();
  initVandraDemo();
  initBettyVideo();
  initEspCarousel();
});
