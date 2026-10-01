const T = window.__TAURI__,
  $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const C = new URLSearchParams(location.search).has("c"),
  K = "wobble.v1",
  cl = (v) => Math.max(0, Math.min(100, v)),
  rnd = (a) => a[Math.floor(Math.random() * a.length)];
const FOODS = {
  berry: { e: "🍓", t: "+happiness", h: 8, p: 15 },
  fish: { e: "🐟", t: "+hunger", h: 30 },
  treat: { e: "🍞", t: "+energy", h: 10, n: 20 },
  milk: { e: "🥛", t: "+cleanliness", h: 8, c: 15 },
  cookie: { e: "🍪", t: "+happiness", h: 8, p: 18 },
  carrot: { e: "🥕", t: "+hunger", h: 25 },
};
const ACC = {
  hat: { e: "🎩", lv: 1 },
  bow: { e: "🎀", lv: 2 },
  glasses: { e: "👓", lv: 3 },
  backpack: { e: "🎒", lv: 4 },
  costume: { e: "🦖", lv: 5 },
};
const GAMES = {
  stars: ["⭐", "catch the stars"],
  bubbles: ["🫧", "bubble pop"],
  memory: ["🃏", "memory match"],
  splash: ["🎨", "color splash"],
};
const L = {
  happy: ["You're here! That makes me so happy!", "Today is a good day 💗"],
  sleepy: ["*yawn* so sleepy...", "Can I curl up for a nap?"],
  hungry: ["Feeling a bit hungry over here...", "My tummy is rumbling..."],
  bored: ["A little play would be nice!", "Nothing to do... play with me?"],
  dirty: ["I feel a bit messy...", "Bath time? 🫧"],
  excited: ["Wheee! Let's go!", "I'm bouncing off the walls!"],
  lonely: [
    "Where did you go? I missed you...",
    "It's been quiet without you...",
  ],
  grumpy: ["Hmph. I need some care.", "Not in the mood..."],
  energetic: ["I have SO much energy!", "Zoom zoom!"],
};
const BOND = [
  "I really like you!",
  "We're best friends now 💞",
  "Thanks for always being here.",
];
const def = () => ({
  hunger: 70,
  happiness: 80,
  energy: 60,
  clean: 75,
  boredom: 40,
  sleep: false,
  last: Date.now(),
  seen: Date.now(),
  xp: 0,
  remAt: 0,
  worn: [],
  inv: { berry: 3, fish: 2, treat: 2, milk: 2, cookie: 3, carrot: 3 },
  set: { remind: 10, sound: true, top: true, comp: true },
});
const load = () => {
  try {
    const d = def(),
      s = JSON.parse(localStorage[K]);
    return { ...d, ...s, set: { ...d.set, ...s.set } };
  } catch {
    return def();
  }
};
let S = load(),
  page = "home",
  bt = "",
  bu = 0,
  line = "",
  lastKey = "",
  clicks = [];
const save = () => {
  localStorage[K] = JSON.stringify(S);
};
const lvl = () => Math.floor(Math.sqrt(S.xp / 5)) + 1;
function beep(f = 660) {
  if (!S.set.sound) return;
  try {
    const a = new AudioContext(),
      o = a.createOscillator(),
      g = a.createGain();
    o.frequency.value = f;
    o.type = "sine";
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(a.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(1e-4, a.currentTime + 0.2);
    o.stop(a.currentTime + 0.2);
  } catch {}
}
function decay(m) {
  const idle = (Date.now() - S.last) / 6e4;
  if (S.sleep) {
    S.energy += 2 * m;
    S.hunger -= 0.2 * m;
    S.boredom += 0.1 * m;
    if (S.energy >= 100) {
      S.sleep = false;
      say("Good morning! 🌞");
    }
  } else {
    S.hunger -= 0.5 * m;
    S.energy -= 0.25 * m;
    S.clean -= 0.3 * m;
    S.boredom += 0.5 * m;
    S.happiness -= (idle > 10 ? 0.5 : 0.15) * m;
  }
  for (const k of ["hunger", "happiness", "energy", "clean", "boredom"])
    S[k] = cl(S[k]);
}
function mood() {
  const idle = (Date.now() - S.last) / 6e4;
  if (S.sleep || S.energy < 20) return "sleepy";
  if (S.hunger < 30) return "hungry";
  if (S.clean < 30) return "dirty";
  if (S.happiness < 25) return "grumpy";
  if (idle > 20) return "lonely";
  if (S.boredom > 70) return "bored";
  if (S.happiness > 85 && S.energy > 55) return "excited";
  if (S.energy > 85) return "energetic";
  return "happy";
}
function say(t, ms = 4000) {
  bt = t;
  bu = Date.now() + ms;
  save();
  render();
}
function touch(xp = 1) {
  S.last = Date.now();
  S.xp += xp;
  const o = lvl();
  save();
  if (lvl() > o) {
    const n = Object.entries(ACC).find(([, a]) => a.lv === lvl());
    say(
      `Level up! 💖 Bond level ${lvl()}${n ? ` — unlocked ${n[0]}!` : ""}`,
      6000,
    );
    beep(880);
  }
}
function react(c) {
  const p = $(C ? "#cpet" : "#pet");
  p.classList.add(c);
  setTimeout(() => p.classList.remove(c), 800);
}
/* ---------- the pet (SVG) ---------- */
function svg(m, worn) {
  const ink = "#4A3B5C",
    body = "#FFF7EC";
  const open = (r = 9) =>
    `<g class="eye"><circle cx="78" cy="110" r="${r}" fill="${ink}"/><circle cx="122" cy="110" r="${r}" fill="${ink}"/><circle cx="75" cy="106" r="3" fill="#fff"/><circle cx="119" cy="106" r="3" fill="#fff"/></g>`;
  const arc = (d) =>
    `<path d="${d}" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  let eyes = {
    happy: open(),
    excited: open(11) + '<text x="150" y="70" font-size="18">⭐</text>',
    energetic: open(10) + '<text x="150" y="70" font-size="18">⚡</text>',
    sleepy:
      arc("M68 112q10 8 20 0M112 112q10 8 20 0") +
      '<text x="140" y="70" font-size="20">💤</text>',
    grumpy:
      open(8) +
      arc("M64 94l24 7M136 94l-24 7") +
      '<text x="145" y="75" font-size="18">💢</text>',
    bored:
      open(8) +
      `<rect x="66" y="98" width="24" height="9" fill="${body}"/><rect x="110" y="98" width="24" height="9" fill="${body}"/>`,
    hungry: open() + '<text x="148" y="72" font-size="18">🍴</text>',
    dirty:
      open() +
      '<circle cx="60" cy="150" r="4" fill="#c9a98a"/><circle cx="140" cy="160" r="5" fill="#c9a98a"/><circle cx="105" cy="168" r="3" fill="#c9a98a"/>',
    lonely: open() + '<path d="M134 122q-5 9 0 13 5-4 0-13z" fill="#8fd0f5"/>',
  }[m];
  if (m === "happy") eyes = open();
  const mouth = {
    happy: `<path d="M90 126q5 6 10 0q5 6 10 0" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    excited: '<path d="M88 124q12 18 24 0z" fill="#e88aa0"/>',
    energetic: '<path d="M90 124q10 14 20 0z" fill="#e88aa0"/>',
    sleepy: '<ellipse cx="100" cy="130" rx="5" ry="6" fill="#e88aa0"/>',
    grumpy: `<path d="M90 132q10-8 20 0" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    bored: `<path d="M92 130h16" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`,
    hungry:
      '<ellipse cx="100" cy="130" rx="6" ry="8" fill="#e88aa0"/><path d="M106 136v10" stroke="#8fd0f5" stroke-width="3"/>',
    dirty: `<path d="M92 130q8-5 16 0" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    lonely: `<path d="M92 132q8-6 16 0" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  }[m];
  const a = {
    costume: `<path d="M40 150q-30 0-30 30 20 5 40-12z" fill="#9ad49a"/><path d="M62 70l8-18 8 18zM92 62l8-20 8 20zM122 70l8-18 8 18z" fill="#7cbf7c"/>`,
    backpack: `<rect x="138" y="120" width="34" height="46" rx="12" fill="#a68de0"/><rect x="144" y="134" width="22" height="14" rx="5" fill="#c9b6f0"/>`,
    glasses: `<g fill="#ffffff55" stroke="${ink}" stroke-width="3"><circle cx="78" cy="110" r="17"/><circle cx="122" cy="110" r="17"/><path d="M95 110h10"/></g>`,
    bow: `<path d="M100 66l-24-14v28zM100 66l24-14v28z" fill="#ff8fb0"/><circle cx="100" cy="66" r="6" fill="#ff6f9a"/>`,
    hat: `<ellipse cx="100" cy="60" rx="42" ry="9" fill="#5b3f7a"/><path d="M72 58l22-50 22 50z" fill="#6f4d94"/><rect x="78" y="46" width="32" height="7" fill="#ffb4c6"/>`,
  };
  return `<svg viewBox="0 0 200 200"><ellipse cx="100" cy="188" rx="55" ry="7" fill="#4a3b5c18"/>${worn.includes("costume") ? a.costume : ""}${worn.includes("backpack") ? a.backpack : ""}
 <ellipse cx="42" cy="112" rx="17" ry="36" transform="rotate(20 42 112)" fill="#DBC8F0"/><ellipse cx="158" cy="112" rx="17" ry="36" transform="rotate(-20 158 112)" fill="#BBDCF0"/>
 <ellipse cx="100" cy="125" rx="62" ry="57" fill="${body}" stroke="#f1dcc9" stroke-width="3"/><path d="M96 72q-4-24 10-24 8 8-2 24z" fill="${body}" stroke="#f1dcc9" stroke-width="3"/>
 <ellipse cx="78" cy="180" rx="16" ry="9" fill="#fff0e0"/><ellipse cx="122" cy="180" rx="16" ry="9" fill="#fff0e0"/>
 <ellipse cx="62" cy="128" rx="11" ry="7" fill="#FFB4C6" opacity=".7"/><ellipse cx="138" cy="128" rx="11" ry="7" fill="#FFB4C6" opacity=".7"/>${eyes}${mouth}
 ${worn.includes("glasses") ? a.glasses : ""}${worn.includes("bow") ? a.bow : ""}${worn.includes("hat") ? a.hat : ""}</svg>`;
}
/* ---------- render ---------- */
function render() {
  const m = mood(),
    worn = S.worn.filter((k) => lvl() >= ACC[k].lv),
    key = m + worn;
  if (key !== lastKey) {
    lastKey = key;
    line = rnd(L[m]);
    if (lvl() > 2 && Math.random() < 0.3) line = rnd(BOND);
  }
  const txt = Date.now() < bu ? bt : line;
  $$(".say").forEach((e) => (e.textContent = txt));
  const p = $(C ? "#cpet" : "#pet");
  p.className = "pet m-" + m;
  if (p.dataset.k !== key) {
    p.dataset.k = key;
    p.innerHTML = svg(m, worn);
  }
  if (C) return;
  const B = [
    ["hunger", "hunger", "🍴", "#FFCDB2", "#FFB4C6"],
    ["happiness", "happiness", "😊", "#eadcf8", "#DBC8F0"],
    ["energy", "energy", "⚡", "#fff3c9", "#FFE9AB"],
    ["clean", "cleanliness", "💧", "#d9eefa", "#BBDCF0"],
    ["boredom", "boredom", "⭐", "#dff0de", "#BBDBBA"],
  ];
  $("#bars").innerHTML = B.map(
    ([k, n, i, bg, c]) =>
      `<div class="bar"><div class="ic" style="background:${bg}">${i}</div><div class="tr">${n}<div class="t"><div class="f" style="width:${S[k]}%;background:${c}"></div></div></div><em>${Math.round(S[k])}%</em></div>`,
  ).join("");
  const need =
    S.hunger < 45
      ? "A little snack would be nice!"
      : S.clean < 45
        ? "A bath would feel great!"
        : S.energy < 35
          ? "I could use a nap..."
          : S.boredom > 55
            ? "A little play would be nice!"
            : S.happiness < 50
              ? "Some pets, please?"
              : "I feel wonderful! 💗";
  $("#hint").textContent = "💜 " + need;
  const L0 = lvl(),
    a = 5 * (L0 - 1) ** 2,
    b = 5 * L0 ** 2;
  $("#bond").innerHTML =
    `💞 bond level ${L0}<div class="t"><div class="f" style="width:${((S.xp - a) / (b - a)) * 100}%"></div></div>`;
}
const NAV = [
  ["home", "🏠"],
  ["food", "🥣"],
  ["play", "🎮"],
  ["clean", "💧"],
  ["sleep", "🌙"],
  ["inventory", "🎒"],
  ["settings", "⚙️"],
];
function nav() {
  $("#nav").innerHTML = NAV.map(
    ([p, i]) =>
      `<button data-p="${p}" class="${p === page ? "on" : ""}"><i>${i}</i>${p}</button>`,
  ).join("");
}
function dock() {
  const P = {
    home: `<button class="big" data-x="pet">💗 pet wobble</button>`,
    food: `<div class="grid">${Object.entries(FOODS)
      .map(
        ([k, f]) =>
          `<button class="tile ${S.inv[k] ? "" : "lock"}" data-f="${k}"><b>${f.e}</b>${k}<small>${f.t} · x${S.inv[k]}</small></button>`,
      )
      .join("")}</div>`,
    play: `<div class="grid" style="grid-template-columns:1fr 1fr">${Object.entries(
      GAMES,
    )
      .map(
        ([k, g]) =>
          `<button class="tile" data-g="${k}"><b>${g[0]}</b>${g[1]}</button>`,
      )
      .join("")}</div>`,
    clean: `<button class="big" data-x="clean">🫧 clean wobble</button>`,
    sleep: `<button class="big" data-x="sleep">${S.sleep ? "☀️ wake up" : "🌙 tuck in"}</button>`,
    inventory: `<div class="grid" style="grid-template-columns:repeat(5,1fr)">${Object.entries(
      ACC,
    )
      .map(
        ([k, a]) =>
          `<button class="tile ${lvl() < a.lv ? "lock" : ""} ${S.worn.includes(k) ? "on" : ""}" data-a="${k}"><b>${lvl() < a.lv ? "🔒" : a.e}</b>${k}<small>${lvl() < a.lv ? "bond Lv " + a.lv : S.worn.includes(k) ? "wearing" : "wear"}</small></button>`,
      )
      .join("")}</div>`,
    settings: `<div style="width:100%"><div class="row">reminder after (minutes)<input type="number" min="1" max="240" data-s="remind" value="${S.set.remind}"></div>
 ${[
   ["sound", "sounds"],
   ["top", "always on top"],
   ["comp", "show desktop companion"],
 ]
   .map(
     ([k, n]) =>
       `<div class="row">${n}<input type="checkbox" data-s="${k}" ${S.set[k] ? "checked" : ""}></div>`,
   )
   .join("")}</div>`,
  }[page];
  $("#dock").innerHTML = P;
}
function go(p) {
  page = p;
  nav();
  dock();
}
/* ---------- actions ---------- */
function petIt() {
  if (S.sleep) {
    S.sleep = false;
    say("Mmm... I was sleeping! 😴");
    return;
  }
  const n = Date.now();
  clicks = clicks.filter((t) => n - t < 10000);
  clicks.push(n);
  if (clicks.length > 7) {
    S.happiness = cl(S.happiness - 3);
    react("r-wiggle");
    say("Okay okay, that's a lot! 😣");
    touch(0);
    return;
  }
  S.happiness = cl(S.happiness + 8);
  S.boredom = cl(S.boredom - 4);
  react("r-bounce");
  beep(700);
  touch(1);
  say(
    rnd([
      "Hehe, that tickles!",
      "You're here! That makes me so happy!",
      "Purrr... 💗",
      "More pets please!",
    ]),
  );
}
function feed(k) {
  const f = FOODS[k];
  if (!S.inv[k]) {
    say("No more " + k + "!");
    return;
  }
  if (S.sleep) S.sleep = false;
  S.inv[k]--;
  S.hunger = cl(S.hunger + (f.h || 0));
  S.happiness = cl(S.happiness + (f.p || 0));
  S.energy = cl(S.energy + (f.n || 0));
  S.clean = cl(S.clean + (f.c || 0));
  react("r-bounce");
  beep(520);
  touch(2);
  say(`Yum! ${f.e} Thank you!`);
  dock();
}
function clean() {
  if (S.sleep) S.sleep = false;
  S.clean = cl(S.clean + 40);
  S.happiness = cl(S.happiness - 2);
  react("r-wiggle");
  beep(900);
  touch(2);
  say("Squeaky clean! 🫧");
}
function sleep() {
  S.sleep = !S.sleep;
  touch(1);
  say(S.sleep ? "Goodnight... 💤" : "Good morning! 🌞");
  dock();
}
function wear(k) {
  if (lvl() < ACC[k].lv) return;
  S.worn = S.worn.includes(k) ? S.worn.filter((x) => x !== k) : [...S.worn, k];
  lastKey = "";
  touch(0);
  say("So stylish! ✨");
  dock();
}
/* ---------- mini-games ---------- */
function finish(sc, max) {
  const r = sc / max,
    f = rnd(Object.keys(FOODS));
  S.boredom = cl(S.boredom - 30 * r - 5);
  S.happiness = cl(S.happiness + 15 * r);
  S.energy = cl(S.energy - 8);
  S.inv[f] += sc > 0 ? 1 : 0;
  $("#mb").innerHTML =
    `<h2>${sc}/${max} ${r > 0.5 ? "🎉" : "💛"}</h2><p>Wobble had fun!${sc > 0 ? ` You won a ${FOODS[f].e} ${f}.` : ""}</p><button class="big" data-x="close">done</button>`;
  touch(5 + Math.round(10 * r));
  beep(800);
  render();
}
function game(id) {
  $("#modal").classList.add("on");
  const mb = $("#mb");
  if (id === "stars" || id === "bubbles") {
    let sc = 0,
      t = 12;
    const e = GAMES[id][0];
    mb.innerHTML = `<h3>${GAMES[id][1]}</h3><div>⏱ <b id="tm">12</b> &nbsp; score <b id="sc">0</b></div><div class="area" id="ar"></div>`;
    const sp = setInterval(() => {
      const s = document.createElement("span");
      s.textContent = e;
      s.style.left = Math.random() * 85 + "%";
      s.style.top = Math.random() * 80 + "%";
      s.onclick = () => {
        s.remove();
        $("#sc").textContent = ++sc;
        beep(600 + sc * 20);
      };
      $("#ar").append(s);
      setTimeout(() => s.remove(), 1500);
    }, 550);
    const ti = setInterval(() => {
      $("#tm").textContent = --t;
      if (t <= 0) {
        clearInterval(ti);
        clearInterval(sp);
        finish(Math.min(sc, 12), 12);
      }
    }, 1000);
  } else if (id === "memory") {
    const em = ["🍓", "🐟", "🥕", "🍪", "🥛", "🍞"],
      cards = [...em, ...em].sort(() => Math.random() - 0.5);
    let open = [],
      done = 0,
      lock = 0;
    mb.innerHTML = `<h3>memory match</h3><div class="mem">${cards.map((c, i) => `<button data-i="${i}">❔</button>`).join("")}</div>`;
    $$(".mem button").forEach(
      (b) =>
        (b.onclick = () => {
          if (lock || b.disabled || open.includes(b)) return;
          b.textContent = cards[b.dataset.i];
          open.push(b);
          beep(500);
          if (open.length === 2) {
            const [x, y] = open;
            if (x.textContent === y.textContent) {
              x.disabled = y.disabled = true;
              open = [];
              if (++done === 6) setTimeout(() => finish(6, 6), 400);
            } else {
              lock = 1;
              setTimeout(() => {
                x.textContent = y.textContent = "❔";
                open = [];
                lock = 0;
              }, 700);
            }
          }
        }),
    );
  } else {
    const cs = [
      ["pink", "#FFB4C6"],
      ["sky", "#BBDCF0"],
      ["sage", "#BBDBBA"],
      ["butter", "#FFE9AB"],
      ["lavender", "#DBC8F0"],
    ];
    let n = 0,
      sc = 0,
      tg;
    const round = () => {
      if (n++ >= 8) return finish(sc, 8);
      tg = rnd(cs);
      const wrong = rnd(cs);
      mb.innerHTML = `<h3>color splash</h3><p>Tap the color named:</p><h1 style="color:${wrong[1]};text-shadow:0 0 2px #4a3b5c">${tg[0]}</h1><div class="sw">${cs.map((c) => `<button style="background:${c[1]}" data-c="${c[0]}"></button>`).join("")}</div>`;
      $$(".sw button").forEach(
        (b) =>
          (b.onclick = () => {
            if (b.dataset.c === tg[0]) {
              sc++;
              beep(700);
            } else beep(250);
            round();
          }),
      );
    };
    round();
  }
}
/* ---------- events ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("button,#pet");
  if (!t) return;
  if (t.id === "pet") return petIt();
  const d = t.dataset;
  if (d.p) go(d.p);
  else if (d.f) feed(d.f);
  else if (d.g) game(d.g);
  else if (d.a) wear(d.a);
  else if (d.x === "pet") petIt();
  else if (d.x === "clean") clean();
  else if (d.x === "sleep") sleep();
  else if (d.x === "close") $("#modal").classList.remove("on");
});
document.addEventListener("change", (e) => {
  const k = e.target.dataset.s;
  if (!k) return;
  S.set[k] =
    e.target.type === "checkbox"
      ? e.target.checked
      : Math.max(1, +e.target.value || 10);
  save();
  sync();
});
addEventListener("storage", (e) => {
  if (e.key === K) {
    S = load();
    render();
  }
});
const sync = () => {
  try {
    T.core.invoke("companion", { show: S.set.comp, onTop: S.set.top });
  } catch {}
};
async function notify(title, body) {
  try {
    const n = T.notification;
    if (
      (await n.isPermissionGranted()) ||
      (await n.requestPermission()) === "granted"
    )
      n.sendNotification({ title, body });
  } catch {}
}
if (C) {
  document.body.classList.add("c");
  let d;
  const p = $("#cpet");
  p.onmousedown = (e) => (d = [e.clientX, e.clientY]);
  addEventListener("mousemove", (e) => {
    if (d && e.buttons && Math.hypot(e.clientX - d[0], e.clientY - d[1]) > 5) {
      d = 0;
      try {
        T.window.getCurrentWindow().startDragging();
      } catch {}
    }
  });
  p.onmouseup = () => {
    if (d) petIt();
    d = 0;
  };
  render();
} else {
  decay(Math.min((Date.now() - S.seen) / 6e4, 720));
  S.seen = Date.now();
  save();
  nav();
  dock();
  render();
  sync();
  try {
    T.event.listen("tray", (e) => {
      if (e.payload === "mute") {
        S.set.sound = !S.set.sound;
        save();
        go(page);
      } else go("settings");
    });
  } catch {}
  setInterval(() => {
    const n = Date.now();
    decay((n - S.seen) / 6e4);
    S.seen = n;
    const idle = (n - S.last) / 6e4;
    if (idle >= S.set.remind && n - S.remAt > S.set.remind * 6e4) {
      const m =
        S.hunger < 45
          ? "Feeling a bit hungry over here... Can you give me some food?"
          : S.boredom > 60
            ? "I am bored! Can we play?"
            : S.happiness < 50
              ? "I miss you! Can I have some attention?"
              : null;
      if (m) {
        S.remAt = n;
        notify("Wobble", m);
        bt = m;
        bu = n + 8000;
      }
    }
    save();
    render();
    if (page === "food" || page === "inventory") dock();
  }, 5000);
  setInterval(() => {
    if (!S.sleep && Date.now() > bu && Math.random() < 0.5) {
      lastKey = "";
      render();
    }
  }, 15000);
}
