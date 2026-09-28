/* ===== bg-system-js ===== */
  (() => {
    'use strict';
  
    const layers = document.getElementById('bg-layers');
    if (!layers) return;
    document.documentElement.classList.add('bg-system-on');
  
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
    /* ---------- Helpers ---------- */
    const clamp   = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const lerp    = (a, b, t) => a + (b - a) * t;
    const smooth  = t => { t = clamp(t); return t * t * (3 - 2 * t); };
    const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
    const easeIn  = t => { t = clamp(t); return t * t * t; };
    let seed = 1;
    const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
    const VB  = 'viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"';
  
    const pine = (x, y, h, c) => {
      const w = h * .34;
      return `<path fill="${c}" d="M${x} ${y - h} L${x + w * .5} ${y - h * .62} L${x + w * .28} ${y - h * .62} L${x + w * .75} ${y - h * .28} L${x + w * .42} ${y - h * .28} L${x + w} ${y} L${x - w} ${y} L${x - w * .42} ${y - h * .28} L${x - w * .75} ${y - h * .28} L${x - w * .28} ${y - h * .62} L${x - w * .5} ${y - h * .62}Z"/>`;
    };
  
    /* =========================================================
       1. SCENE BUILDERS (illustrated defaults; swap for photos via the CSS variables)
       ========================================================= */
  
    /* ---- Stage 1: Glenfinnan Viaduct + Hogwarts Express ---- */
    function expressLayers() {
      const far = `<svg class="ex-layer" data-f=".22" ${VB}>
        <defs><linearGradient id="bgx-ex-far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a3c"/><stop offset="1" stop-color="#15101d"/></linearGradient></defs>
        <path fill="url(#bgx-ex-far)" d="M0 560 L120 470 L240 520 L380 400 L520 500 L660 430 L820 540 L980 440 L1120 510 L1280 410 L1440 500 L1600 450 V900 H0Z"/>
      </svg>`;
      const mid = `<svg class="ex-layer" data-f=".42" ${VB}>
        <path fill="#0c0b13" d="M0 650 L160 570 L300 620 L470 530 L640 610 L800 550 L980 630 L1150 540 L1330 620 L1480 570 L1600 610 V900 H0Z"/>
      </svg>`;
  
      // Viaduct: a slab with arch-shaped holes, so the valley shows through
      let holes = '';
      for (let i = 0; i < 13; i++) {
        const cx = -30 + 65 + i * 130;
        holes += ` M${cx - 48} 900 V640 A48 48 0 0 1 ${cx + 48} 640 V900 Z`;
      }
      let cars = '';
      for (let i = 0; i < 4; i++) {
        const x = 20 + i * 112;
        cars += `<rect x="${x}" y="-58" width="106" height="44" rx="4" fill="#7a0f14"/>
                 <rect x="${x}" y="-62" width="106" height="6" rx="2" fill="#120d10"/>
                 <rect x="${x}" y="-32" width="106" height="3" fill="#d4af37" opacity=".75"/>
                 <rect x="${x + 8}" y="-14" width="26" height="8" fill="#0a0a0a"/><rect x="${x + 72}" y="-14" width="26" height="8" fill="#0a0a0a"/>`;
        for (let j = 0; j < 5; j++) cars += `<rect class="ex-win" x="${x + 9 + j * 19}" y="-50" width="12" height="13" rx="2" fill="#f3d27a" style="animation-delay:${(rnd() * 3).toFixed(2)}s"/>`;
      }
      let puffs = '';
      for (let i = 0; i < 7; i++) puffs += `<circle class="ex-puff" cx="690" cy="-82" r="16" fill="#d9d2df" filter="url(#bgx-ex-blur)" style="--d:${(i * .4).toFixed(1)}s"/>`;
  
      const train = `<g class="ex-train"><g transform="translate(0 548)">
          ${cars}
          <rect x="470" y="-46" width="86" height="34" fill="#111"/>
          <rect x="556" y="-20" width="164" height="8" fill="#111"/>
          <rect x="580" y="-50" width="112" height="34" rx="14" fill="#8a0c10"/>
          <rect x="676" y="-52" width="34" height="36" rx="6" fill="#111"/>
          <rect x="684" y="-72" width="12" height="22" fill="#111"/><rect x="680" y="-77" width="20" height="6" rx="2" fill="#111"/>
          <rect x="560" y="-64" width="34" height="48" fill="#5c090c"/><rect x="556" y="-68" width="42" height="6" fill="#111"/>
          <rect class="ex-win" x="568" y="-52" width="14" height="14" fill="#f3d27a"/>
          <circle cx="632" cy="-52" r="9" fill="#d4af37"/>
          <g fill="#111" stroke="#d4af37" stroke-width="2"><circle cx="602" cy="-15" r="15"/><circle cx="642" cy="-15" r="15"/><circle cx="682" cy="-15" r="15"/></g>
          ${puffs}
        </g></g>`;
  
      const viaduct = `<svg class="ex-layer" data-f=".7" ${VB}>
        <defs><filter id="bgx-ex-blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5"/></filter></defs>
        ${train}
        <path fill="#08080c" fill-rule="evenodd" d="M-40 548 H1640 V900 H-40 Z${holes}"/>
        <rect x="-40" y="548" width="1680" height="3" fill="#a4571f" opacity=".55"/>
        <rect x="-40" y="538" width="1680" height="10" fill="#0e0d14"/>
      </svg>`;
  
      seed = 7;
      let pines = '';
      for (let i = 0; i < 10; i++) pines += pine(-10 + i * 42 + rnd() * 18, 900, 260 + rnd() * 240, '#050508');
      for (let i = 0; i < 10; i++) pines += pine(1610 - i * 42 - rnd() * 18, 900, 250 + rnd() * 250, '#050508');
      const fg = `<svg class="ex-layer" data-f="1" ${VB}>${pines}
        <path fill="#050508" d="M-40 900 V730 C60 720 170 770 270 900Z M1640 900 V720 C1540 712 1430 765 1330 900Z"/></svg>`;
  
      return `<div class="bg-photo" data-f=".3"></div>
        <div class="bg-art">
          <div class="ex-sky"></div><div class="ex-clouds"></div>
          ${far}${mid}<div class="ex-mist"></div><div class="ex-coolfog"></div>${viaduct}${fg}
        </div>`;
    }
  
    /* ---- Stage 2: Castle panorama, five depth layers ---- */
    function castleLayers() {
      seed = 3;
      let stars = '';
      for (let i = 0; i < 150; i++) {
        const tw = rnd() < .28;
        stars += `<circle cx="${(rnd() * 1600).toFixed(1)}" cy="${(rnd() * 620).toFixed(1)}" r="${(.5 + rnd() * 1.5).toFixed(2)}" fill="#e8dcc4" opacity="${(.35 + rnd() * .6).toFixed(2)}"${tw ? ` class="cs-tw" style="--d:${(rnd() * 4).toFixed(2)}s"` : ''}/>`;
      }
      const sky = `<svg ${VB}>
        <defs>
          <linearGradient id="bgx-cs-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03040a"/><stop offset=".55" stop-color="#0b1024"/><stop offset="1" stop-color="#1c1626"/></linearGradient>
          <radialGradient id="bgx-cs-moon" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f6ecd0" stop-opacity=".55"/><stop offset=".35" stop-color="#cdbf9c" stop-opacity=".16"/><stop offset="1" stop-color="#cdbf9c" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#bgx-cs-sky)"/>${stars}
        <circle cx="1210" cy="190" r="240" fill="url(#bgx-cs-moon)"/><circle cx="1210" cy="190" r="46" fill="#efe6cf"/>
        <circle cx="1196" cy="178" r="9" fill="#d8ccb0" opacity=".7"/><circle cx="1226" cy="204" r="6" fill="#d8ccb0" opacity=".6"/>
      </svg>`;
  
      const mountains = `<svg ${VB}>
        <path fill="#141828" d="M0 640 L110 560 L210 610 L330 500 L450 590 L560 540 L700 620 L840 560 L960 610 L1090 520 L1210 600 L1330 490 L1450 580 L1600 520 V900 H0Z"/>
        <path fill="#0d101d" d="M0 700 L140 640 L260 690 L400 610 L520 680 L660 650 L780 700 L900 660 L1040 690 L1180 620 L1320 690 L1460 630 L1600 680 V900 H0Z"/>
      </svg>`;
  
      seed = 11;
      const towers = [[500,44,500,60],[560,56,420,80],[632,48,330,100],[905,52,300,120],[976,44,380,90],[1038,70,450,70],[1122,50,500,60],[778,40,190,130],[830,32,240,90]];
      let body = '', roofs = '', wins = '';
      const win = (x, y) => `<rect class="cs-win" x="${x}" y="${y}" width="8" height="14" rx="3.5" style="--d:${(rnd() * 5).toFixed(2)}s"/>`;
      towers.forEach(([x, w, top, rh]) => {
        body  += `<rect x="${x}" y="${top}" width="${w}" height="${620 - top}"/>`;
        roofs += `<polygon points="${x - 5},${top} ${x + w / 2},${top - rh} ${x + w + 5},${top}"/>`;
        for (let y = top + 26; y < 580; y += 38) if (rnd() < .62) wins += win(x + w / 2 - 4, y);
      });
      for (let x = 722; x < 890; x += 34) for (let y = 430; y < 580; y += 40) if (rnd() < .7) wins += win(x, y);
      for (let x = 500; x < 1190; x += 46) if (rnd() < .5) wins += win(x, 566);
  
      const castle = `<svg ${VB}>
        <defs>
          <linearGradient id="bgx-cs-lake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1428"/><stop offset="1" stop-color="#04060c"/></linearGradient>
          <filter id="bgx-cs-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
        </defs>
        <rect y="770" width="1600" height="130" fill="url(#bgx-cs-lake)"/>
        <g fill="#efe6cf" opacity=".22"><rect x="1150" y="790" width="120" height="3"/><rect x="1170" y="812" width="80" height="2"/><rect x="1130" y="836" width="150" height="2"/></g>
        <g fill="#090b12">
          ${body}${roofs}
          <rect x="700" y="400" width="200" height="220"/><polygon points="690,400 800,290 910,400"/>
          <rect x="480" y="545" width="720" height="75"/>
          <rect x="120" y="596" width="380" height="12"/><rect x="120" y="574" width="380" height="4"/>
          <rect x="196" y="608" width="12" height="190"/><rect x="316" y="608" width="12" height="190"/><rect x="416" y="608" width="12" height="190"/>
          <rect x="100" y="552" width="44" height="56"/><polygon points="96,552 122,516 148,552"/>
        </g>
        <path fill="#07080c" d="M280 900 L350 772 L460 712 L520 645 L620 618 L1000 606 L1120 642 L1190 700 L1270 782 L1350 900Z"/>
        <g filter="url(#bgx-cs-blur)" opacity=".55" fill="#f2c761">${wins}</g>
        <g>${wins}</g>
      </svg>`;
  
      seed = 17;
      let fp = '';
      for (let i = 0; i < 11; i++) fp += pine(-20 + i * 38 + rnd() * 20, 900, 380 + rnd() * 300, '#04050a');
      for (let i = 0; i < 11; i++) fp += pine(1620 - i * 38 - rnd() * 20, 900, 360 + rnd() * 320, '#04050a');
      const fore = `<svg ${VB}>${fp}<path fill="#04050a" d="M0 900V820C120 800 240 840 340 900Z M1600 900V810C1470 800 1350 850 1250 900Z"/></svg>`;
  
      return `<div class="cs-view"><div class="cs-rig">
          <div class="cs-layer bg-photo" style="--z:-300px;--s:1.5"></div>
          <div class="cs-layer cs-art" style="--z:-700px;--s:2.05">${sky}</div>
          <div class="cs-layer cs-art" style="--z:-450px;--s:1.75">${mountains}</div>
          <div class="cs-layer cs-art" style="--z:-220px;--s:1.45">${castle}</div>
          <div class="cs-layer cs-art cs-mist" style="--z:-60px;--s:1.3"><i></i><i></i></div>
          <div class="cs-layer cs-art" style="--z:120px;--s:1.2">${fore}</div>
        </div></div>`;
    }
  
    /* ---- Stage 3: Great Hall interior + arched window frame ---- */
    function hallInteriorSVG() {
      seed = 5;
      const VPY = 292;
      const k   = y => (y - VPY) / 608;
      const xAt = (cx, y) => 800 + (cx - 800) * k(y);
      const P   = a => a.map(p => p.join(',')).join(' ');
  
      // Enchanted ceiling stars
      let stars = '';
      for (let i = 0; i < 80; i++) {
        const y = rnd() * 180, lo = lerp(0, 500, y / 182), hi = lerp(1600, 1100, y / 182);
        stars += `<circle cx="${(lo + rnd() * (hi - lo)).toFixed(1)}" cy="${y.toFixed(1)}" r="${(.6 + rnd() * 1.3).toFixed(2)}" fill="#e8dcc4" opacity="${(.4 + rnd() * .5).toFixed(2)}"/>`;
      }
  
      // Side walls: moonlit windows between dark pillars
      let sides = '';
      [.1, .34, .58, .8].forEach(t => {
        const t2 = t + .12;
        const xl = u => 500 * u, top = u => 182 * u, bot = u => 900 - 380 * u;
        const q = (fx) => [[fx(t), lerp(top(t), bot(t), .28)], [fx(t2), lerp(top(t2), bot(t2), .28)], [fx(t2), lerp(top(t2), bot(t2), .72)], [fx(t), lerp(top(t), bot(t), .72)]];
        sides += `<polygon points="${P(q(xl))}" fill="#28407a" opacity=".3"/>`;
        sides += `<polygon points="${P(q(u => 1600 - xl(u)))}" fill="#28407a" opacity=".3"/>`;
      });
      [.05, .29, .53, .77, .97].forEach(t => {
        const w = lerp(12, 4, t);
        sides += `<line x1="${500 * t}" y1="${182 * t}" x2="${500 * t}" y2="${900 - 380 * t}" stroke="#040302" stroke-width="${w}"/>`;
        sides += `<line x1="${1600 - 500 * t}" y1="${182 * t}" x2="${1600 - 500 * t}" y2="${900 - 380 * t}" stroke="#040302" stroke-width="${w}"/>`;
      });
  
      // Long tables and benches (one-point perspective)
      let tables = '', glints = '';
      [230, 560, 1040, 1370].forEach(cx => {
        const quad = (a, b, fill) => `<polygon points="${P([[xAt(cx, 900) + a, 900], [xAt(cx, 900) + b, 900], [xAt(cx, 520) + b * k(520), 520], [xAt(cx, 520) + a * k(520), 520]])}" fill="${fill}"/>`;
        tables += quad(-135, -88, '#150d07') + quad(88, 135, '#150d07') + quad(-85, 85, 'url(#bgx-hl-wood)');
        tables += `<polygon points="${P([[xAt(cx, 900) - 85, 900], [xAt(cx, 520) - 85 * k(520), 520]])}" fill="none" stroke="#d9a94a" stroke-opacity=".35" stroke-width="2"/>`;
        for (let j = 0; j < 13; j++) {
          const y = 520 + 380 / (1 + j * .55), hw = 85 * k(y), r = 1.5 + 9 * k(y);
          [-.45, .45].forEach(m => { glints += `<circle cx="${(xAt(cx, y) + hw * m).toFixed(1)}" cy="${(y - 4).toFixed(1)}" r="${r.toFixed(1)}" fill="#f7d98a" opacity=".55"/>`; });
        }
      });
  
      // Hanging banners on the back wall (house colours)
      let banners = '';
      [[545, '#780001'], [585, '#8a6d14'], [1015, '#0f2a55'], [1055, '#0d3b1e']].forEach(([x, c]) => {
        banners += `<polygon points="${x},190 ${x + 30},190 ${x + 30},330 ${x + 15},312 ${x},330" fill="${c}" opacity=".9"/>`;
      });
  
      const win = x => `<path d="M${x - 28} 430 V290 A28 28 0 0 1 ${x + 28} 290 V430Z" fill="#2a3f78" opacity=".5"/>`;
  
      return `<svg ${VB}>
        <defs>
          <linearGradient id="bgx-hl-ceil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#02030a"/><stop offset="1" stop-color="#101a36"/></linearGradient>
          <linearGradient id="bgx-hl-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1410"/><stop offset="1" stop-color="#0c0806"/></linearGradient>
          <linearGradient id="bgx-hl-left" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#050403"/><stop offset="1" stop-color="#1a130d"/></linearGradient>
          <linearGradient id="bgx-hl-right" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#050403"/><stop offset="1" stop-color="#1a130d"/></linearGradient>
          <linearGradient id="bgx-hl-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#231911"/><stop offset="1" stop-color="#070504"/></linearGradient>
          <linearGradient id="bgx-hl-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2c12"/><stop offset="1" stop-color="#24140a"/></linearGradient>
          <filter id="bgx-hl-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
        </defs>
        <rect width="1600" height="900" fill="#070504"/>
        <polygon points="0,0 1600,0 1100,182 500,182" fill="url(#bgx-hl-ceil)"/>${stars}
        <ellipse cx="800" cy="90" rx="380" ry="60" fill="#22305e" opacity=".25" filter="url(#bgx-hl-blur)"/>
        <rect x="500" y="182" width="600" height="338" fill="url(#bgx-hl-wall)"/>
        <polygon points="0,0 500,182 500,520 0,900" fill="url(#bgx-hl-left)"/>
        <polygon points="1600,0 1100,182 1100,520 1600,900" fill="url(#bgx-hl-right)"/>
        ${sides}${win(610)}${win(990)}
        <ellipse cx="800" cy="440" rx="260" ry="100" fill="#f0b955" opacity=".2" filter="url(#bgx-hl-blur)"/>
        ${banners}
        <polygon points="0,900 1600,900 1100,520 500,520" fill="url(#bgx-hl-floor)"/>
        <polygon points="620,522 980,522 962,500 638,500" fill="url(#bgx-hl-wood)"/>
        <g filter="url(#bgx-hl-blur)" fill="#f7d98a" opacity=".7">${[0,1,2,3,4,5,6,7].map(i => `<circle cx="${650 + i * 43}" cy="506" r="5"/>`).join('')}</g>
        ${tables}
        <g filter="url(#bgx-hl-blur)">${glints}</g>
      </svg>`;
    }
  
    function hallWindowSVG() {
      const arch = 'M600 830 V410 C600 250 690 150 800 60 C910 150 1000 250 1000 410 V830 Z';
      return `<svg ${VB}>
        <defs>
          <linearGradient id="bgx-wf-stone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e1a17"/><stop offset=".5" stop-color="#100d0b"/><stop offset="1" stop-color="#191410"/></linearGradient>
          <pattern id="bgx-wf-blocks" width="120" height="70" patternUnits="userSpaceOnUse"><path d="M0 0H120M0 35H120M0 70H120M0 0V35M60 35V70" stroke="#000" stroke-opacity=".4" stroke-width="2" fill="none"/></pattern>
          <clipPath id="bgx-wf-clip"><path d="${arch}"/></clipPath>
          <filter id="bgx-wf-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
        </defs>
        <path fill="url(#bgx-wf-stone)" fill-rule="evenodd" d="M-800 -800 H2400 V1700 H-800 Z ${arch}"/>
        <path fill="url(#bgx-wf-blocks)" fill-rule="evenodd" d="M-800 -800 H2400 V1700 H-800 Z ${arch}"/>
        <g clip-path="url(#bgx-wf-clip)" fill="none" stroke="#0b0907">
          <g stroke-width="12"><path d="M800 60 V830"/><path d="M600 470 H1000"/><circle cx="800" cy="290" r="46"/></g>
          <g stroke-width="2" opacity=".55"><path d="M700 100 V830M900 100 V830M600 300 H1000M600 640 H1000M600 750 H1000"/></g>
        </g>
        <path d="${arch}" fill="none" stroke="#2a221b" stroke-width="26"/>
        <path d="${arch}" fill="none" stroke="#d4af37" stroke-opacity=".55" stroke-width="4" filter="url(#bgx-wf-glow)"/>
        <path d="${arch}" fill="none" stroke="#d4af37" stroke-opacity=".5" stroke-width="1.5"/>
        <rect x="560" y="830" width="480" height="40" fill="#241d17"/><rect x="540" y="866" width="520" height="16" fill="#120e0b"/>
      </svg>`;
    }
  
    function buildCandles(host) {
      seed = 23;
      const n = window.innerWidth < 720 ? 26 : 46, list = [];
      for (let i = 0; i < n; i++) {
        list.push({ x: 3 + rnd() * 94, y: 4 + rnd() * 66, s: .45 + rnd() * 1.15, dur: 7 + rnd() * 8, del: -rnd() * 10,
                    dx: (rnd() - .5) * 40, dy: 14 + rnd() * 26, fl: 1.8 + rnd() * 1.6, fd: -rnd() * 2 });
      }
      list.sort((a, b) => a.s - b.s); // small (far) first, big (near) drawn on top
      host.innerHTML = list.map(c =>
        `<span class="hc" data-depth="${c.s > 1.15 ? 'near' : c.s < .7 ? 'far' : 'mid'}" style="--x:${c.x.toFixed(1)}%;--y:${c.y.toFixed(1)}%;--s:${c.s.toFixed(2)};--dur:${c.dur.toFixed(1)}s;--delay:${c.del.toFixed(1)}s;--dx:${c.dx.toFixed(0)}px;--dy:${c.dy.toFixed(0)}px;--fl:${c.fl.toFixed(1)}s;--fd:${c.fd.toFixed(1)}s"><i class="hc-halo"></i><i class="hc-wax"></i><i class="hc-flame"></i></span>`
      ).join('');
    }
  
    /* =========================================================
       2. MOUNT (stages are added under #bg-layers' canvas layers)
       ========================================================= */
    layers.insertAdjacentHTML('afterbegin', `
      <div class="bg-stage bg-express">${expressLayers()}<div class="bg-scrim"></div></div>
      <div class="bg-stage bg-hall is-off">
        <div class="hall-interior">
          <div class="bg-photo"></div>
          <div class="bg-art">${hallInteriorSVG()}<div class="hall-warm"></div></div>
          <div class="hall-candles"></div>
        </div>
        <div class="bg-scrim"></div>
      </div>`);
  
    const $ = s => layers.querySelector(s);
    const express = $('.bg-express'), hall = $('.bg-hall');
    const interior = $('.hall-interior'), candlesHost = $('.hall-candles');
    const exLayers = [...layers.querySelectorAll('.bg-express [data-f]')].map(el => [el, parseFloat(el.dataset.f)]);
    buildCandles(candlesHost);
  
    // Photo mode: if a CSS image variable is set, that stage uses the photo instead of the illustration
    const rootStyle = getComputedStyle(document.documentElement);
    [[express, '--bg-glenfinnan-image'], [hall, '--bg-hall-image']].forEach(([el, v]) => {
      const m = rootStyle.getPropertyValue(v).match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
      if (!m) return;
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => el.classList.add('is-photo'); // a broken link keeps the illustrated scene
      img.src = m[1];
    });
  
    const setOff = (el, off) => { if (el._off !== off) { el._off = off; el.classList.toggle('is-off', off); } };
  
    /* =========================================================
       3. SCROLL METRICS
       ========================================================= */
    let vh = 0, maxScroll = 1, heroH = 1, hallStart = 0, hallEnd = 1;
  
    function measure() {
      vh = window.innerHeight;
      maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      const home = document.getElementById('home'), contact = document.getElementById('contact');
      heroH = Math.max(1, home ? home.offsetHeight : vh);
      const contactTop = contact ? contact.getBoundingClientRect().top + window.scrollY : maxScroll;
      // The window transition plays while Contact scrolls into view
      hallEnd   = Math.min(contactTop - vh * .05, maxScroll - 2);
      hallStart = Math.min(Math.max(0, contactTop - vh * .9), hallEnd - vh * .4);
      hallStart = Math.max(0, hallStart);
      if (hallEnd - hallStart < 1) hallEnd = hallStart + 1;
    }
  
    /* =========================================================
       4. RENDER: everything is derived from one smoothed scroll value
       ========================================================= */
    function render(y) {
      const ep = clamp(y / heroH);       // hero progress: drives the viaduct parallax
      exLayers.forEach(([el, f]) => { el.style.transform = `translate3d(0,${(-ep * f * 90).toFixed(2)}px,0)`; });
  
      // The train scene holds through Home, then gently fades away as the page moves on
      const exFade = smooth((y - heroH * .65) / (heroH * .55));
      express.style.opacity = (1 - exFade).toFixed(3);
      setOff(express, exFade >= .999);
  
      // The Great Hall simply fades in as Contact scrolls into view -- no window pass-through
      const q  = clamp((y - hallStart) / (hallEnd - hallStart));
      const io = smooth(q);
      setOff(hall, q <= .001);
  
      interior.style.opacity = io.toFixed(3);
      interior.style.transform = reduce ? 'none' : `scale(${lerp(1.06, 1, easeOut(io)).toFixed(4)})`;
      candlesHost.style.transform = `translate3d(0,${((1 - q) * 40).toFixed(1)}px,0)`;

      // The static castle backdrop (About/Skills/Projects/Certifications) crossfades with
      // whichever scene is adjacent: it rises as the train fades (exFade), and sinks back
      // out as the Great Hall fades in (io) -- smooth both scrolling down and back up.
      document.documentElement.style.setProperty('--chapter-fade', (exFade * (1 - io)).toFixed(3));
    }
  
    /* =========================================================
       5. SCROLL LOOP (eases toward window.scrollY for a smooth feel)
       ========================================================= */
    let target = window.scrollY, current = target, raf = 0;
  
    function tick() {
      raf = 0;
      current += (target - current) * (reduce ? 1 : .11);
      if (Math.abs(target - current) < .05) current = target;
      render(current);
      if (current !== target) raf = requestAnimationFrame(tick);
    }
    function request() {
      target = window.scrollY;
      if (!raf) raf = requestAnimationFrame(tick);
    }
  
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', () => { measure(); request(); });
    window.addEventListener('load', () => { measure(); request(); });
    if ('ResizeObserver' in window) new ResizeObserver(() => { measure(); request(); }).observe(document.body);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); request(); });
  
    measure();
    current = target = window.scrollY;
    render(current);
  })();
  

/* ===== interactivity-js ===== */
  (() => {
    'use strict';
  
    /* =========================================================
       CONFIG
       ========================================================= */
    // Dobby's portrait, embedded as a data URI so it works without a separate image file.
    // Set this back to '' to fall back to the gold "D" crest instead.
    const DOBBY_IMAGE = 'data:image/jpeg;base64,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';
    const AUDIO_VOLUME = 0.3;        // master volume, 0 to 1
    const AUDIO_KEY = 'jj-music';    // localStorage key that remembers an explicit mute
  
    /* =========================================================
       HELPERS
       ========================================================= */
    const $  = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const store = {
      get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
      set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
    };
    const scrollToSel = sel => {
      const el = $(sel);
      if (el) el.scrollIntoView({ behavior: reduceMQ.matches ? 'auto' : 'smooth', block: 'start' });
    };
  
    /* =========================================================
       INJECTED STYLES (Dobby widget, wand canvas, navbar scrolled state)
       ========================================================= */
    const css = `
      #navbar.is-scrolled {
        background: rgba(14, 10, 4, .62); border-color: var(--gold-line);
        box-shadow: 0 10px 34px rgba(0, 0, 0, .45);
      }
  
      /* ---------- Dobby widget ---------- */
      .dobby {
        position: fixed; right: 1.1rem; bottom: 5.4rem; z-index: 105;
        display: flex; flex-direction: column-reverse; align-items: flex-end; gap: .9rem; pointer-events: none;
      }
      .dobby > * { pointer-events: auto; }
      .dobby-btn {
        position: relative; width: 4.6rem; height: 4.6rem; padding: 0; border: 0; border-radius: 50%;
        background: none; cursor: pointer;
      }
      .dobby-aura {
        position: absolute; inset: -.95rem; border-radius: 50%; pointer-events: none;
        background: radial-gradient(circle, rgba(212, 175, 55, .55) 0%, rgba(212, 175, 55, .22) 45%, transparent 70%);
        animation: dobbyAura 3.2s ease-in-out infinite;
      }
      .dobby-avatar {
        position: relative; display: block; width: 100%; height: 100%; overflow: hidden; border-radius: 50%;
        border: 2px solid var(--gold);
        background: radial-gradient(circle at 50% 35%, #2a1a06, var(--obsidian));
        box-shadow: 0 0 22px var(--gold-glow), inset 0 0 14px rgba(0, 0, 0, .6);
        transition: transform .25s ease, box-shadow .25s ease;
      }
      .dobby-btn:hover .dobby-avatar, .dobby.is-open .dobby-avatar { transform: scale(1.06); box-shadow: 0 0 34px var(--gold-glow), inset 0 0 14px rgba(0, 0, 0, .6); }
      .dobby-avatar img, .dobby-avatar svg { display: block; width: 100%; height: 100%; object-fit: cover; }

      /* A quick little "Hello!" that pops out beside Dobby's picture on hover, before the
         full bubble opens -- his default, wordless wave hello. */
      .dobby-hello {
        position: absolute; right: calc(100% + .7rem); top: 50%; z-index: 1; white-space: nowrap;
        padding: .4rem .85rem; border-radius: 999px; font-family: var(--font-script); font-weight: 400;
        font-size: 1.2rem; line-height: 1; color: var(--crimson);
        background: linear-gradient(160deg, #f4efe0, #e6dcbf);
        border: 1px solid rgba(107, 78, 30, .4);
        box-shadow: 0 6px 16px rgba(0, 0, 0, .45), 0 0 14px rgba(212, 175, 55, .25);
        opacity: 0; pointer-events: none; transform: translateY(-50%) translateX(6px) scale(.85);
        transition: opacity .2s ease, transform .25s cubic-bezier(.34, 1.56, .64, 1);
      }
      .dobby-hello::after {
        content: ""; position: absolute; left: 100%; top: 50%; width: .55rem; height: .55rem; margin-left: -.3rem;
        background: #e6dcbf; transform: translateY(-50%) rotate(45deg);
        border-right: 1px solid rgba(107, 78, 30, .4); border-bottom: 1px solid rgba(107, 78, 30, .4);
      }
      .dobby-btn:hover .dobby-hello { opacity: 1; transform: translateY(-50%) translateX(0) scale(1); }
      .dobby.is-open .dobby-hello { opacity: 0; pointer-events: none; }
  
      /* Ancient parchment speech bubble */
      .dobby-bubble {
        position: relative; display: flex; flex-direction: column;
        width: min(21rem, calc(100vw - 2rem)); max-height: min(30rem, 64vh); padding: 1.1rem 1.2rem 1rem;
        color: #2a1a06; font-family: var(--font-body);
        background:
          radial-gradient(90% 70% at 15% 10%, rgba(255, 246, 220, .75), transparent 60%),
          radial-gradient(80% 70% at 90% 100%, rgba(150, 95, 30, .35), transparent 65%),
          linear-gradient(160deg, #eadcb7, #d7c393 60%, #c9b27b);
        border-radius: 6px 14px 8px 12px / 12px 8px 14px 6px;
        box-shadow: inset 0 0 34px rgba(110, 60, 10, .5), inset 0 0 2px rgba(60, 30, 0, .7), 0 14px 34px rgba(0, 0, 0, .6), 0 0 28px rgba(212, 175, 55, .28);
        opacity: 0; visibility: hidden; transform: translateY(10px) scale(.96); transform-origin: bottom right;
        transition: opacity .25s ease, transform .25s ease, visibility 0s linear .25s;
      }
      .dobby.is-open .dobby-bubble { opacity: 1; visibility: visible; transform: none; transition-delay: 0s; }
      .dobby-bubble::after {
        content: ""; position: absolute; right: 1.9rem; bottom: -.55rem; width: 1.1rem; height: 1.1rem;
        background: #cdb884; transform: rotate(45deg); border-radius: 0 0 3px 0; box-shadow: 2px 2px 3px rgba(0, 0, 0, .25);
      }
      .dobby-name { padding-right: 1.8rem; margin-bottom: .45rem; font-family: var(--font-script); font-weight: 400; font-size: 1.35rem; color: var(--crimson); }
      .dobby-close {
        position: absolute; top: .55rem; right: .6rem; width: 1.7rem; height: 1.7rem; border-radius: 50%;
        border: 1px solid rgba(90, 40, 0, .4); background: none; color: #5a0001; font-size: 1.15rem; line-height: 1; cursor: pointer;
      }
      .dobby-close:hover { background: rgba(120, 0, 1, .12); }
      .dobby-log { display: grid; gap: .65rem; flex: 1; overflow-y: auto; padding-right: .25rem; font-size: 1.08rem; line-height: 1.45; scrollbar-width: thin; }
      .dobby-msg p { margin: 0; }
      .dobby-you {
        justify-self: end; max-width: 90%; padding: .3rem .65rem; font-family: var(--font-mono); font-size: .72rem; color: #5a0001;
        background: rgba(120, 0, 1, .1); border: 1px solid rgba(120, 0, 1, .35); border-radius: 999px;
      }
      .dobby-list { margin: .45rem 0 0 1.15rem; list-style: disc; font-size: 1.02rem; line-height: 1.4; }
      .dobby-list li + li { margin-top: .3rem; }
      .dobby-actions, .dobby-prompts { display: flex; flex-wrap: wrap; gap: .45rem; }
      .dobby-actions { margin-top: .6rem; }
      .dobby-prompts { margin-top: .8rem; padding-top: .7rem; border-top: 1px dashed rgba(90, 40, 0, .4); }
      .dobby-chip {
        padding: .42rem .8rem; font-family: var(--font-mono); font-size: .74rem; color: var(--parchment); cursor: pointer;
        background: linear-gradient(180deg, #950b0d, var(--crimson)); border: 1px solid #4a0001; border-radius: 999px;
        transition: transform .2s ease, box-shadow .2s ease;
      }
      .dobby-chip:hover { transform: translateY(-1px); box-shadow: 0 0 12px rgba(120, 0, 1, .5); }
      .dobby-chip--go { color: #5a0001; background: transparent; border-color: #780001; }
      .dobby-chip:focus-visible, .dobby-close:focus-visible { outline: 2px solid var(--crimson); outline-offset: 2px; }
      .dobby-btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 5px; }
      @keyframes dobbyAura { 0%, 100% { opacity: .75; transform: scale(.94); } 50% { opacity: 1; transform: scale(1.08); } }
      @media (max-width: 560px) { .dobby { right: .9rem; bottom: 4.9rem; } }
      @media (prefers-reduced-motion: reduce) { .dobby-aura { animation: none; } .dobby-bubble, .dobby-avatar, .dobby-hello { transition: none; } }
    `;
    const styleEl = document.createElement('style');
    styleEl.id = 'interactivity-css';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  
    /* =========================================================
       1. NAVBAR: scrolled state, active-link highlighter, mobile menu
       ========================================================= */
    function initNavbar() {
      const nav = $('#navbar');
      const toggle = $('#nav-toggle');
      const links = $$('.nav-links a');
      if (!nav || !links.length) return;
  
      const targets = links.map(a => ({ a, el: $(a.getAttribute('href')) })).filter(t => t.el);
      let ticking = false;
  
      function update() {
        ticking = false;
        nav.classList.toggle('is-scrolled', window.scrollY > 24);
        if (!targets.length) return;
        const line = nav.offsetHeight + window.innerHeight * 0.3;
        let current = targets[0];
        targets.forEach(t => { if (t.el.getBoundingClientRect().top <= line) current = t; });
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        if (atBottom) current = targets[targets.length - 1];
        links.forEach(a => {
          const on = a === current.a;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        });
      }
      const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      window.addEventListener('scroll', request, { passive: true });
      window.addEventListener('resize', request);
      update();
  
      // Mobile menu (the CSS-only checkbox does the opening; this adds the closing)
      if (toggle) {
        toggle.setAttribute('aria-controls', 'nav-links');
        const list = $('.nav-links');
        if (list) list.id = 'nav-links';
        const sync = () => toggle.setAttribute('aria-expanded', String(toggle.checked));
        sync();
        toggle.addEventListener('change', sync);
        links.forEach(a => a.addEventListener('click', () => { toggle.checked = false; sync(); }));
        document.addEventListener('click', e => { if (toggle.checked && !nav.contains(e.target)) { toggle.checked = false; sync(); } });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && toggle.checked) { toggle.checked = false; sync(); } });
        window.addEventListener('resize', () => { if (window.innerWidth > 860 && toggle.checked) { toggle.checked = false; sync(); } });
      }
    }
  
    /* =========================================================
       2. TYPEWRITER
       ========================================================= */
    function initTypewriter() {
      const el = $('#typewriter');
      if (!el) return;
      let roles = [];
      try { roles = JSON.parse(el.dataset.roles || '[]'); } catch (e) { roles = []; }
      if (!roles.length) return;
  
      el.setAttribute('aria-live', 'off'); // avoid announcing every keystroke
  
      if (reduceMQ.matches) { // swap roles without the typing animation
        let i = 0;
        el.textContent = roles[0];
        setInterval(() => { i = (i + 1) % roles.length; el.textContent = roles[i]; }, 3200);
        return;
      }
  
      let role = 0, count = roles[0].length, erasing = true;
      el.textContent = roles[0];
      function tick() {
        const full = roles[role];
        if (erasing) {
          count--;
          el.textContent = full.slice(0, count);
          if (count <= 0) { erasing = false; role = (role + 1) % roles.length; return setTimeout(tick, 380); }
          return setTimeout(tick, 32);
        }
        const next = roles[role];
        count++;
        el.textContent = next.slice(0, count);
        if (count >= next.length) { erasing = true; return setTimeout(tick, 1800); }
        setTimeout(tick, 60 + Math.random() * 40);
      }
      setTimeout(tick, 1800); // hold the first role, then erase it and type the next
    }
  
    /* =========================================================
       3. CERTIFICATE CARD EXPANDER
       ========================================================= */
    function initCerts() {
      $$('.cert-card[data-expandable="true"]').forEach(card => {
        const head = $('.cert-head', card);
        if (!head) return;
        head.addEventListener('click', () => {
          const open = card.classList.toggle('is-open');
          head.setAttribute('aria-expanded', String(open));
        });
      });
      // Lets Dobby's chat open a specific certificate: scrolls it into view and
      // flips it open (unless it's one of the not-yet-earned, non-expandable ones).
      function open(card) {
        if (!card) return;
        card.scrollIntoView({ behavior: reduceMQ.matches ? 'auto' : 'smooth', block: 'center' });
        if (card.dataset.expandable !== 'true') return;
        const head = $('.cert-head', card);
        if (!head) return;
        card.classList.add('is-open');
        head.setAttribute('aria-expanded', 'true');
      }
      return { open };
    }
  
    /* =========================================================
       4. PROJECT LIVE PREVIEW PANEL
       ========================================================= */
    function initProjects() {
      const grid = $('.project-grid');
      const panel = $('#projectPreview');
      const frame = $('#previewFrame');
      const title = $('#previewTitle');
      const urlEl = $('#previewUrl');
      const ext = $('#previewExternal');
      const closeBtn = $('#previewClose');
      const loader = $('#previewLoader');
      const api = { cards: [], open() {}, close() {} };
      if (!grid || !panel || !frame) return api;
  
      const cards = $$('.project-card', grid);
      let active = null, clearT = 0, loadT = 0;
  
      const setActive = card => {
        cards.forEach(c => {
          const on = c === card;
          c.classList.toggle('is-active', on);
          const b = $('.project-open', c);
          if (b) b.setAttribute('aria-expanded', String(on));
        });
        active = card;
      };
  
      function open(card) {
        const url = card.dataset.previewUrl;
        if (!url) return;
        clearTimeout(clearT);
        clearTimeout(loadT);
        setActive(card);
        const name = card.dataset.previewTitle || ($('.project-title', card) || {}).textContent || 'Project preview';
        title.textContent = name.trim();
        urlEl.textContent = url;
        urlEl.title = url;
        ext.href = url;
  
        const same = frame.getAttribute('src') === url;
        if (!same) {
          loader.classList.add('is-visible');
          frame.loading = 'eager';
          frame.onload = () => { loader.classList.remove('is-visible'); clearTimeout(loadT); };
          loadT = setTimeout(() => loader.classList.remove('is-visible'), 12000);
          frame.src = url;
        } else {
          loader.classList.remove('is-visible');
        }
  
        panel.classList.add('is-open');
        requestAnimationFrame(() => panel.scrollIntoView({ behavior: reduceMQ.matches ? 'auto' : 'smooth', block: 'start' }));
      }
  
      function close(returnFocus) {
        const was = active;
        panel.classList.remove('is-open');
        setActive(null);
        loader.classList.remove('is-visible');
        clearTimeout(clearT);
        clearT = setTimeout(() => { frame.onload = null; frame.src = 'about:blank'; }, 650);
        if (returnFocus && was) {
          const b = $('.project-open', was);
          if (b) b.focus({ preventScroll: true });
        }
      }
  
      grid.addEventListener('click', e => {
        const card = e.target.closest('.project-card');
        if (!card) return;
        if (card === active && panel.classList.contains('is-open')) close(false); else open(card);
      });
      if (closeBtn) closeBtn.addEventListener('click', () => close(true));
      document.addEventListener('keydown', e => {
        if (e.key !== 'Escape' || !panel.classList.contains('is-open')) return;
        if (document.activeElement && document.activeElement.closest && document.activeElement.closest('#dobby')) return;
        close(true);
      });
  
      api.cards = cards;
      api.open = open;
      api.close = close;
      return api;
    }
  
    /* =========================================================
       5. AUDIO CONTROLLER: a Web Audio synthesizer (no audio files)
       An original, gentle piece: soft pads, a low bass, celesta-style
       arpeggios and a wandering bell melody, in 3/4 with reverb and echo.
       ========================================================= */
    function initAudio() {
      const btn = $('#audio-toggle');
      if (!btn) return;
      const tip = $('.audio-tip', btn);
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        btn.disabled = true;
        btn.style.opacity = '.5';
        btn.setAttribute('aria-label', 'Background music is not supported in this browser');
        return;
      }
  
      // Em - C - G - D - Em - C - Am - B (MIDI notes per chord)
      const PROG = [
        [52, 55, 59, 64, 67], [48, 55, 60, 64, 67], [43, 50, 55, 59, 62], [50, 54, 57, 62, 66],
        [52, 55, 59, 64, 67], [48, 55, 60, 64, 67], [45, 52, 57, 60, 64], [47, 54, 59, 63, 66]
      ];
      const ARP = [[0, 1, 2, 3, 2, 1], [0, 2, 3, 4, 3, 2], [1, 2, 3, 2, 4, 3], [0, 1, 3, 4, 3, 1]];
      const EIGHTH = 60 / 76 / 2; // 76 bpm, six eighth notes per bar
      const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  
      let ctx = null, master = null, bus = null;
      let timer = 0, susT = 0, nextT = 0, step = 0, melody = null;
      let playing = false, busy = false, userMuted = store.get(AUDIO_KEY) === 'muted';
  
      function build() {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0;
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -20; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.3;
        master.connect(comp);
        comp.connect(ctx.destination);
  
        bus = ctx.createGain();
        const dry = ctx.createGain(); dry.gain.value = 0.65;
        bus.connect(dry); dry.connect(master);
  
        // Reverb from generated noise, so no impulse file is needed
        const rev = ctx.createConvolver();
        const len = Math.floor(ctx.sampleRate * 3);
        const ir = ctx.createBuffer(2, len, ctx.sampleRate);
        for (let c = 0; c < 2; c++) {
          const d = ir.getChannelData(c);
          for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
        }
        rev.buffer = ir;
        const wet = ctx.createGain(); wet.gain.value = 0.6;
        bus.connect(rev); rev.connect(wet); wet.connect(master);
  
        // Soft shimmering echo
        const dl = ctx.createDelay(1); dl.delayTime.value = EIGHTH * 3;
        const fb = ctx.createGain(); fb.gain.value = 0.32;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
        const eg = ctx.createGain(); eg.gain.value = 0.28;
        bus.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(eg); eg.connect(master);
      }
  
      function bell(freq, t, dur, vol) {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        [[1, 1], [2, 0.3], [4, 0.1], [5.4, 0.045]].forEach(([m, a]) => {
          const o = ctx.createOscillator();
          o.type = 'sine'; o.frequency.value = freq * m;
          const pg = ctx.createGain();
          pg.gain.setValueAtTime(a, t);
          pg.gain.exponentialRampToValueAtTime(0.0001, t + dur / (1 + m * 0.5));
          o.connect(pg); pg.connect(g);
          o.start(t); o.stop(t + dur + 0.05);
        });
        g.connect(bus);
      }
  
      function pad(freq, t, dur, vol, type) {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(vol, t + 1);
        g.gain.setValueAtTime(vol, t + dur - 0.1);
        g.gain.linearRampToValueAtTime(0.0001, t + dur + 1.3);
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = 0.4;
        [-6, 6].forEach(cents => {
          const o = ctx.createOscillator();
          o.type = type || 'triangle'; o.frequency.value = freq; o.detune.value = cents;
          o.connect(f); o.start(t); o.stop(t + dur + 1.4);
        });
        f.connect(g); g.connect(bus);
      }
  
      // Wandering bell melody built from the current chord's notes
      function nextMelodyNote(chord) {
        const pool = chord.map(n => n + 24).filter(n => n <= 88);
        let i = 0;
        if (melody == null) {
          i = Math.floor(Math.random() * pool.length);
        } else {
          let best = 0;
          pool.forEach((n, k) => { if (Math.abs(n - melody) < Math.abs(pool[best] - melody)) best = k; });
          const move = [-1, 0, 1, 1, -1][Math.floor(Math.random() * 5)];
          i = clamp(best + move, 0, pool.length - 1);
        }
        melody = pool[i];
        return melody;
      }
  
      function pump() {
        while (nextT < ctx.currentTime + 1.2) {
          const bar = Math.floor(step / 6) % PROG.length;
          const pos = step % 6;
          const chord = PROG[bar];
          const t = nextT;
  
          if (pos === 0) {
            const barLen = EIGHTH * 6;
            pad(mtof(chord[0] - 12), t, barLen, 0.05, 'sine');                       // low bass
            chord.slice(1, 4).forEach(n => pad(mtof(n), t, barLen + 0.25, 0.018));  // warm pad
          }
          const pat = ARP[bar % ARP.length];
          bell(mtof(chord[pat[pos]] + 12), t + (Math.random() - 0.5) * 0.012, 1.5, pos === 0 ? 0.055 : 0.038);
  
          if (pos === 0 || pos === 3 || pos === 4) {
            const prob = pos === 0 ? 1 : pos === 3 ? 0.7 : 0.5;
            if (Math.random() < prob) bell(mtof(nextMelodyNote(chord)), t, 2.4, 0.065);
          }
          nextT += EIGHTH;
          step++;
        }
      }
  
      async function start() {
        if (!ctx) build();
        clearTimeout(susT);
        try { await Promise.race([ctx.resume(), new Promise(r => setTimeout(r, 600))]); } catch (e) { /* ignore */ }
        if (ctx.state !== 'running') return false; // the browser still blocks audio; try again on the next gesture
        if (!playing) {
          playing = true;
          nextT = ctx.currentTime + 0.12;
          pump();
          timer = setInterval(pump, 200);
        }
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setTargetAtTime(AUDIO_VOLUME, ctx.currentTime, 0.8); // gentle fade in
        return true;
      }
  
      function stop() {
        if (!ctx || !playing) return;
        playing = false;
        clearInterval(timer);
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
        clearTimeout(susT);
        susT = setTimeout(() => { if (!playing) ctx.suspend(); }, 2200);
      }
  
      function ui(on) {
        btn.classList.toggle('is-muted', !on);
        btn.setAttribute('aria-pressed', String(on));
        btn.setAttribute('aria-label', on ? 'Mute background music' : 'Unmute background music');
        if (tip) tip.textContent = on ? 'Mute' : 'Unmute';
      }
      ui(false);
  
      // The toggle button itself
      btn.addEventListener('click', async () => {
        if (busy) return;
        busy = true;
        if (playing) {
          userMuted = true; store.set(AUDIO_KEY, 'muted');
          stop(); ui(false);
        } else {
          userMuted = false; store.set(AUDIO_KEY, 'on');
          ui(await start());
        }
        busy = false;
      });
  
      // Autoplay is blocked until the visitor interacts, so the first click, tap or key press
      // starts the music (unless they muted it on purpose earlier).
      const EVENTS = ['click', 'keydown', 'touchend'];
      const IGNORE_KEYS = ['Escape', 'Tab', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock'];
      const cleanup = () => EVENTS.forEach(ev => document.removeEventListener(ev, kick, true));
      async function kick(e) {
        if (userMuted) return cleanup();
        if (playing) return cleanup();
        if (busy) return;
        if (e.target && e.target.closest && e.target.closest('#audio-toggle')) return; // the toggle handles itself
        if (e.type === 'keydown' && IGNORE_KEYS.indexOf(e.key) !== -1) return;
        busy = true;
        const ok = await start();
        busy = false;
        if (ok) { ui(true); cleanup(); }
      }
      if (!userMuted) EVENTS.forEach(ev => document.addEventListener(ev, kick, true));
  
      // Pause the synth while the tab is hidden
      document.addEventListener('visibilitychange', () => {
        if (!ctx || !playing) return;
        if (document.hidden) ctx.suspend(); else ctx.resume();
      });
    }
  
    /* =========================================================
       6. WAND PARTICLE CURSOR (golden magic dust)
       ========================================================= */
    function initWand() {
      const canvas = document.createElement('canvas');
      canvas.id = 'wand-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '95' });
      document.body.appendChild(canvas);
      const g = canvas.getContext('2d');
      if (!g) return;
  
      let W = 0, H = 0, parts = [], raf = 0, last = 0, lx = null, ly = null;
  
      function resize() {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resize();
      window.addEventListener('resize', resize);
  
      function spawn(x, y, n, burst) {
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2;
          const sp = burst ? 60 + Math.random() * 140 : 8 + Math.random() * 40;
          parts.push({
            x: x + (Math.random() - 0.5) * 6, y: y + (Math.random() - 0.5) * 6,
            vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (burst ? 0 : 10),
            life: 0, max: 0.7 + Math.random() * 0.8, size: 0.8 + Math.random() * 2.4,
            hue: 42 + Math.random() * 10, light: 60 + Math.random() * 25,
            star: Math.random() < 0.18, tw: Math.random() * 6
          });
        }
        if (parts.length > 260) parts.splice(0, parts.length - 260);
        if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      }
  
      function frame(t) {
        const dt = Math.min(0.05, (t - last) / 1000);
        last = t;
        g.clearRect(0, 0, W, H);
        g.globalCompositeOperation = 'lighter';
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          p.life += dt;
          if (p.life >= p.max) { parts.splice(i, 1); continue; }
          p.vy += 30 * dt;
          p.vx *= 0.985; p.vy *= 0.985;
          p.x += p.vx * dt; p.y += p.vy * dt;
          p.tw += dt * 14;
          const k = 1 - p.life / p.max;
          const alpha = Math.pow(k, 1.5) * (0.65 + 0.35 * Math.sin(p.tw));
          const color = 'hsla(' + p.hue + ',90%,' + p.light + '%,';
          g.fillStyle = color + (alpha * 0.22) + ')';
          g.beginPath(); g.arc(p.x, p.y, p.size * 2.6, 0, Math.PI * 2); g.fill();
          g.fillStyle = color + alpha + ')';
          if (p.star) {
            const s = p.size * 2.4;
            g.beginPath();
            g.moveTo(p.x, p.y - s); g.lineTo(p.x + s * 0.28, p.y - s * 0.28); g.lineTo(p.x + s, p.y);
            g.lineTo(p.x + s * 0.28, p.y + s * 0.28); g.lineTo(p.x, p.y + s); g.lineTo(p.x - s * 0.28, p.y + s * 0.28);
            g.lineTo(p.x - s, p.y); g.lineTo(p.x - s * 0.28, p.y - s * 0.28);
            g.closePath(); g.fill();
          } else {
            g.beginPath(); g.arc(p.x, p.y, p.size * 0.9, 0, Math.PI * 2); g.fill();
          }
        }
        g.globalCompositeOperation = 'source-over';
        if (parts.length) raf = requestAnimationFrame(frame);
        else { raf = 0; g.clearRect(0, 0, W, H); }
      }
  
      window.addEventListener('pointermove', e => {
        if (reduceMQ.matches || e.pointerType === 'touch') return;
        if (lx === null) { lx = e.clientX; ly = e.clientY; }
        const dx = e.clientX - lx, dy = e.clientY - ly;
        const n = clamp(Math.floor(Math.hypot(dx, dy) / 14) + 1, 1, 4);
        for (let i = 1; i <= n; i++) spawn(lx + dx * (i / n), ly + dy * (i / n), 1, false);
        lx = e.clientX; ly = e.clientY;
      }, { passive: true });
      document.addEventListener('pointerleave', () => { lx = ly = null; });
      window.addEventListener('blur', () => { lx = ly = null; });
      window.addEventListener('pointerdown', e => {
        if (reduceMQ.matches) return;
        spawn(e.clientX, e.clientY, e.pointerType === 'touch' ? 14 : 18, true);
      }, { passive: true });
    }
  
    /* =========================================================
       7. DOBBY HOUSE-ELF ASSISTANT
       ========================================================= */
    function initDobby(projects, certs) {
      const crest = '<svg viewBox="0 0 100 100" role="img" aria-label="Dobby">' +
        '<circle cx="50" cy="50" r="44" fill="none" stroke="#d4af37" stroke-width="1.5" opacity=".6"/>' +
        '<circle cx="50" cy="50" r="36" fill="none" stroke="#d4af37" stroke-width=".8" opacity=".5"/>' +
        '<path d="M50 8l4 14 14-4-8 12 12 8-14 2 2 14-10-10-10 10 2-14-14-2 12-8-8-12 14 4z" fill="#d4af37" opacity=".22"/>' +
        '<text x="50" y="65" text-anchor="middle" font-family="Cinzel Decorative, serif" font-weight="900" font-size="44" fill="#f0d878">D</text></svg>';
      const avatar = DOBBY_IMAGE ? '<img src="' + DOBBY_IMAGE + '" alt="Dobby the house-elf">' : crest;
  
      const root = document.createElement('aside');
      root.id = 'dobby';
      root.className = 'dobby';
      root.setAttribute('aria-label', 'Dobby, the portfolio assistant');
      root.innerHTML =
        '<button type="button" id="dobby-btn" class="dobby-btn" aria-expanded="false" aria-controls="dobby-bubble" aria-label="Talk to Dobby">' +
          '<span class="dobby-aura" aria-hidden="true"></span><span class="dobby-avatar">' + avatar + '</span>' +
          '<span class="dobby-hello" aria-hidden="true">Hello!</span></button>' +
        '<div id="dobby-bubble" class="dobby-bubble" role="dialog" aria-labelledby="dobby-title">' +
          '<button type="button" class="dobby-close" aria-label="Close Dobby">&times;</button>' +
          '<p class="dobby-name" id="dobby-title">Dobby</p>' +
          '<div class="dobby-log" id="dobby-log" aria-live="polite"></div>' +
          '<div class="dobby-prompts" role="group" aria-label="Ask Dobby">' +
            '<button type="button" class="dobby-chip" data-ask="who">Who is John?</button>' +
            '<button type="button" class="dobby-chip" data-ask="skills">Show Skills</button>' +
            '<button type="button" class="dobby-chip" data-ask="projects">Top Projects</button>' +
            '<button type="button" class="dobby-chip" data-ask="certifications">View Certifications</button>' +
          '</div></div>';
      document.body.appendChild(root);
  
      const btn = $('#dobby-btn', root), closeBtn = $('.dobby-close', root), log = $('#dobby-log', root);
  
      // Answers are built from the page itself, so they stay in sync with your content
      const sentence = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : (a[0] || '');
      const skillNames = $$('.skill-card h4').map(h => h.textContent.trim());
      const projectList = projects.cards.map(card => ({
        name: card.dataset.previewTitle || (($('.project-title', card) || {}).textContent || '').trim(),
        desc: (($('.project-desc', card) || {}).textContent || '').trim(),
        card,
        hasPreview: !!card.dataset.previewUrl
      }));
      const certList = $$('.cert-card').map(c => ({
        name: (($('.cert-title', c) || {}).textContent || '').trim(),
        viewable: c.dataset.expandable === 'true',
        card: c
      }));
      const viewableCerts = certList.filter(c => c.viewable).map(c => c.name);
      const pendingCerts = certList.filter(c => !c.viewable).map(c => c.name);
  
      const RESPONSES = {
        who: {
          label: 'Who is John?',
          text: 'Dobby is delighted to tell Master about John Jesu! He is a Computer Science Engineering student at SASTRA University, a front end developer who is growing into a backend developer, and he is pursuing a minor degree in Quantum Computing. Dobby thinks John makes very fine magic with code, yes he does!',
          chips: [{ label: 'Read his story', go: '#about' }]
        },
        skills: {
          label: 'Show Skills',
          text: 'Dobby is delighted to tell Master about John\u2019s skills! His spell book holds ' + sentence(skillNames) + '. Dobby will take Master to the spell cards at once!',
          go: '#skills',
          chips: [{ label: 'Go to Skills', go: '#skills' }, { label: 'See certificates', go: '#certifications' }]
        },
        projects: {
          label: 'Top Projects',
          text: 'Dobby is delighted to tell Master about John\u2019s finest projects! Master may open any of them live, yes, yes!',
          go: '#projects',
          list: projectList,
          chips: projectList.filter(p => p.hasPreview).map(p => ({ label: 'Preview: ' + p.name, card: p.card }))
        },
        certifications: {
          label: 'View Certifications',
          text: 'Dobby is delighted to tell Master about the certificates! '
            + (viewableCerts.length ? sentence(viewableCerts) + (viewableCerts.length > 1 ? ' can' : ' can') + ' be opened right there for a closer look, yes! ' : '')
            + (pendingCerts.length ? sentence(pendingCerts) + (pendingCerts.length > 1 ? ' are' : ' is') + ' still being earned, Master \u2014 their certificates will appear the moment they\u2019re done.' : ''),
          go: '#certifications',
          chips: certList.map(c => ({ label: 'View: ' + c.name, card: c.card }))
        }
      };
  
      /* ---- Open / close ---- */
      let pinned = false, hoverT = 0, leaveT = 0, greeted = false;
      const isOpen = () => root.classList.contains('is-open');
  
      function openBubble(pin) {
        root.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        if (pin) pinned = true;
        if (!greeted) {
          greeted = true;
          say('Hello! I\u2019m Dobby, John\u2019s helper. What would you like to know?');
        }
      }
      function closeBubble() {
        root.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        pinned = false;
      }
  
      // Click: open and keep open, click again to close. Hovering only peeks.
      btn.addEventListener('click', () => {
        if (!isOpen()) openBubble(true);
        else if (!pinned) pinned = true;
        else closeBubble();
      });
      closeBtn.addEventListener('click', () => { closeBubble(); btn.focus(); });
  
      if (finePointer.matches) {
        root.addEventListener('mouseenter', () => {
          clearTimeout(leaveT);
          if (!isOpen()) { clearTimeout(hoverT); hoverT = setTimeout(() => openBubble(false), 140); }
        });
        root.addEventListener('mouseleave', () => {
          clearTimeout(hoverT);
          if (isOpen() && !pinned) { clearTimeout(leaveT); leaveT = setTimeout(closeBubble, 900); }
        });
      }
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && isOpen() && root.contains(document.activeElement)) { closeBubble(); btn.focus(); }
      });
      document.addEventListener('pointerdown', e => {
        if (isOpen() && window.innerWidth < 720 && !root.contains(e.target)) closeBubble(); // the bubble covers the page on phones
      });
  
      /* ---- Dobby's voice: typed replies ---- */
      let cancelTyping = null;
      const trim = () => { while (log.children.length > 8) log.removeChild(log.firstChild); };
  
      function typeText(el, text, done) {
        if (reduceMQ.matches) { el.textContent = text; if (done) done(); return; }
        let i = 0;
        log.setAttribute('aria-busy', 'true');
        const id = setInterval(() => {
          i = Math.min(text.length, i + 2);
          el.textContent = text.slice(0, i);
          log.scrollTop = log.scrollHeight;
          if (i >= text.length) end();
        }, 18);
        function end() {
          clearInterval(id);
          el.textContent = text;
          log.removeAttribute('aria-busy');
          cancelTyping = null;
          if (done) done();
        }
        cancelTyping = end;
      }
  
      function say(text, extras) {
        if (cancelTyping) cancelTyping();
        const box = document.createElement('div');
        box.className = 'dobby-msg';
        const p = document.createElement('p');
        box.appendChild(p);
        log.appendChild(box);
        trim();
        typeText(p, text, () => {
          if (extras) extras(box);
          log.scrollTop = log.scrollHeight;
        });
      }
  
      function addYou(label) {
        const you = document.createElement('div');
        you.className = 'dobby-you';
        you.textContent = label;
        log.appendChild(you);
      }
  
      function ask(key) {
        const r = RESPONSES[key];
        if (!r) return;
        pinned = true;
        if (cancelTyping) cancelTyping();
        addYou(r.label);
        say(r.text, box => {
          if (r.list && r.list.length) {
            const ul = document.createElement('ul');
            ul.className = 'dobby-list';
            r.list.forEach(item => {
              const li = document.createElement('li');
              const b = document.createElement('strong');
              b.textContent = item.name;
              li.appendChild(b);
              li.appendChild(document.createTextNode('. ' + item.desc));
              ul.appendChild(li);
            });
            box.appendChild(ul);
          }
          if (r.chips && r.chips.length) {
            const wrap = document.createElement('div');
            wrap.className = 'dobby-actions';
            r.chips.forEach(c => {
              const b = document.createElement('button');
              b.type = 'button';
              b.className = 'dobby-chip dobby-chip--go';
              b.textContent = c.label;
              b.addEventListener('click', () => {
                if (c.card) { if (c.card.classList.contains('cert-card')) certs.open(c.card); else projects.open(c.card); } else scrollToSel(c.go);
                if (window.innerWidth < 720) closeBubble();
              });
              wrap.appendChild(b);
            });
            box.appendChild(wrap);
          }
        });
        if (r.go && window.innerWidth >= 720) setTimeout(() => scrollToSel(r.go), 500);
      }
  
      $$('.dobby-chip[data-ask]', root).forEach(b => b.addEventListener('click', () => ask(b.dataset.ask)));
    }
  
    /* =========================================================
       INIT
       ========================================================= */
    initNavbar();
    initTypewriter();
    // Make sure "Cast Spell (Projects)" and the nav link always land on the Projects section
    $$('a[href="#projects"]').forEach(a => a.addEventListener('click', e => {
      const t = document.getElementById('projects');
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduceMQ.matches ? 'auto' : 'smooth', block: 'start' });
    }));
    const certs = initCerts();
    const projects = initProjects();
    initAudio();
    initWand();
    initDobby(projects, certs);
  })();
  
