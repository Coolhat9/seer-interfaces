/* Seer · Electric Foundation — shared shell + helpers */
(function () {
  const LOGO = `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M19.5 2.5 5 17.2c-.6.6-.2 1.6.7 1.6h7.1l-2.6 9.1c-.2.8.8 1.3 1.4.7L26.9 13c.6-.6.2-1.6-.7-1.6h-7.4l2.4-7.6c.3-.9-.7-1.6-1.4-.9Z" fill="currentColor"/><path d="M9 17.5l14.2-6" stroke="var(--bg)" stroke-width="2.6" stroke-linecap="round"/></svg>`;
  window.SEER_LOGO = LOGO;

  // ---------- splash intro: Seer logo first, then the page ----------
  (function () {
    try {
      const internal = document.referrer && new URL(document.referrer).origin === location.origin;
      if (internal || /[?&]nosplash/.test(location.search)) return;   // skip when moving between our own pages
    } catch (e) {}
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const st = document.createElement('style');
    st.textContent = `
      #splash{position:fixed;inset:0;z-index:9999;background:var(--bg,#101013);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;transition:opacity .55s ease,visibility .55s;cursor:pointer;overflow:hidden}
      #splash.out{opacity:0;visibility:hidden}
      #splash::before{content:"";position:absolute;width:560px;height:560px;max-width:140vw;border-radius:50%;background:radial-gradient(circle,var(--glow,rgba(116,53,248,.28)),transparent 65%);animation:spGlow 2.4s ease-in-out infinite}
      .sp-mark{position:relative;display:flex;align-items:center;gap:8px;font-family:'Outfit',system-ui,sans-serif;font-weight:700;font-size:clamp(52px,14vw,76px);letter-spacing:-.04em;color:var(--text,#ededf2);line-height:1}
      .sp-mark svg{width:1em;height:1em;color:var(--text,#ededf2);animation:spPop .9s cubic-bezier(.2,1.4,.3,1) both}
      .sp-mark span{animation:spUp .7s .25s ease-out both}
      .sp-tag{position:relative;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--btn2-text,#9c6ff2);animation:spUp .7s .6s ease-out both}
      .sp-bar{position:relative;width:132px;height:3px;border-radius:9px;background:rgba(127,127,140,.22);overflow:hidden}
      .sp-bar i{display:block;height:100%;width:0;background:var(--primary,#7435f8);border-radius:9px;animation:spFill 1.5s .1s ease-out forwards}
      @keyframes spPop{0%{opacity:0;transform:scale(.4) rotate(-14deg)}100%{opacity:1;transform:none}}
      @keyframes spUp{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:none}}
      @keyframes spFill{to{width:100%}}
      @keyframes spGlow{50%{transform:scale(1.12);opacity:.75}}
      @media (prefers-reduced-motion:reduce){#splash *,#splash::before{animation:none!important}.sp-bar i{width:100%}}`;
    document.documentElement.appendChild(st);
    const sp = document.createElement('div');
    sp.id = 'splash'; sp.setAttribute('role', 'status'); sp.setAttribute('aria-label', 'Loading Seer');
    sp.innerHTML = `<div class="sp-mark">${LOGO}<span>seer</span></div><div class="sp-tag">See the signal</div><div class="sp-bar"><i></i></div>`;
    document.documentElement.appendChild(sp);
    document.documentElement.style.overflow = 'hidden';
    let gone = false;
    const end = () => {
      if (gone) return; gone = true;
      sp.classList.add('out'); document.documentElement.style.overflow = '';
      setTimeout(() => { sp.remove(); st.remove(); }, 700);
    };
    const minShow = reduced ? 500 : 1800, t0 = Date.now();
    const go = () => setTimeout(end, Math.max(0, minShow - (Date.now() - t0)));
    if (document.readyState === 'complete') go(); else addEventListener('load', go);
    setTimeout(end, 4000);          // safety: never block the page
    sp.addEventListener('click', end);
  })();

  // ---------- wallet connect ----------
  const WALLETS = [['MetaMask', 'M', '#f6851b', 'Browser extension'], ['Coinbase Wallet', 'C', '#0052ff', 'Mobile & extension'], ['WalletConnect', 'W', '#3b99fc', 'Scan with any wallet'], ['Rabby', 'R', '#7084ff', 'Browser extension']];
  const Wallet = {
    addr: null, name: null, real: false, ov: null,
    short(a) { return a.slice(0, 6) + '…' + a.slice(-4); },
    paint() {
      const b = document.getElementById('connectBtn'); if (!b) return;
      b.innerHTML = this.addr ? `<span class="dot" style="color:var(--green)"></span>${this.short(this.addr)}` : 'Connect<span class="hide-sm">&nbsp;wallet</span>';
    },
    close() { if (this.ov) this.ov.classList.remove('open'); },
    open() {
      if (!this.ov) {
        this.ov = document.createElement('div'); this.ov.className = 'overlay';
        this.ov.onclick = e => { if (e.target === this.ov) this.close(); };
        document.body.append(this.ov);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });
      }
      this.render(); this.ov.classList.add('open');
    },
    head(t) { return `<div class="whead"><h3>${t}</h3><button id="wX" aria-label="Close">✕</button></div>`; },
    render() {
      const o = this.ov;
      if (this.addr) {
        o.innerHTML = `<div class="wmodal" role="dialog" aria-modal="true">${this.head('Wallet connected')}
          <div class="wacct"><span class="badge green"><i class="dot"></i> ${this.name}</span><div class="addr">${this.addr}</div>
          <div style="display:flex;justify-content:space-between;font-size:13.5px"><span class="t2">Balance</span><b>${this.real ? '—' : '1,250.00 USDC'}</b></div></div>
          <button class="btn btn-ghost" style="width:100%" id="wCopy">Copy address</button>
          <button class="btn btn-sell" style="width:100%;margin-top:8px" id="wOut">Disconnect</button>
          ${this.real ? '' : '<p class="wnote">Demo wallet · no real funds or signatures</p>'}</div>`;
        $('#wCopy', o).onclick = () => { try { navigator.clipboard.writeText(this.addr); toast('Address copied'); } catch (e) { toast('Copy not available'); } };
        $('#wOut', o).onclick = () => { this.addr = null; this.name = null; this.real = false; this.paint(); this.close(); toast('Wallet disconnected'); };
      } else {
        o.innerHTML = `<div class="wmodal" role="dialog" aria-modal="true">${this.head('Connect a wallet')}
          <p class="sub">Choose a wallet to start trading on Seer.</p>
          ${WALLETS.map(w => `<button class="wopt" data-w="${w[0]}"><span class="wico" style="background:${w[2]}">${w[1]}</span><b>${w[0]}</b><small>${w[3]}</small></button>`).join('')}
          <p class="wnote">By connecting you accept the Seer terms. Demo only: no real transactions are sent.</p></div>`;
        $$('.wopt', o).forEach(b => b.onclick = () => this.connect(b.dataset.w));
      }
      $('#wX', o).onclick = () => this.close();
    },
    async connect(name) {
      const o = this.ov;
      o.innerHTML = `<div class="wmodal">${this.head('Connecting…')}<div class="wstate"><div class="spin"></div><b>Approve in ${name}</b><p class="t2" style="font-size:13px;margin-top:4px">Confirm the connection request in your wallet.</p></div></div>`;
      $('#wX', o).onclick = () => this.close();
      let addr = null, real = false;
      try {
        if (window.ethereum && name !== 'WalletConnect') {
          const a = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (a && a[0]) { addr = a[0]; real = true; }
        } else { await new Promise(r => setTimeout(r, 1100)); }
      } catch (e) {
        o.innerHTML = `<div class="wmodal">${this.head('Connection cancelled')}<p class="sub">The request was rejected. You can try again.</p><button class="btn btn-primary" style="width:100%" id="wRetry">Try again</button></div>`;
        $('#wX', o).onclick = () => this.close(); $('#wRetry', o).onclick = () => this.render();
        return;
      }
      this.addr = addr || '0x7a3F9c21B4e8d05A6c1E92f3b7D40a8C5e19d3B2';
      this.name = name; this.real = real; this.paint(); this.close(); toast(`${name} connected`);
    }
  };
  window.Wallet = Wallet;

  const PAGES = [
    ['index.html', 'Home'], ['app.html', 'Seer App'], ['deep.html', 'Deep'],
    ['futarchy.html', 'Futarchy'], ['opportunity.html', 'Opportunity'], ['risk.html', 'Risk Pricing']
  ];

  // theme
  const saved = (() => { try { return localStorage.getItem('seer-theme'); } catch (e) { return null; } })();
  if (saved) document.documentElement.dataset.theme = saved;
  const isLight = () => document.documentElement.dataset.theme === 'light' ||
    (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: light)').matches);

  window.mountShell = function (active) {
    const nav = document.createElement('header');
    nav.className = 'nav';
    nav.innerHTML = `<div class="wrap">
      <a class="logo" href="index.html" aria-label="Seer home">${LOGO}<span>seer</span></a>
      <nav class="nav-links" id="links">${PAGES.map(([h, n]) => `<a href="${h}" class="${h === active ? 'active' : ''}">${n}</a>`).join('')}
        <a href="rationale.html" class="${active === 'rationale.html' ? 'active' : ''}">Rationale</a></nav>
      <div class="nav-right">
        <button class="btn btn-ghost btn-sm" id="themeBtn" aria-label="Toggle theme"></button>
        <button class="btn btn-primary btn-connect" id="connectBtn">Connect wallet</button>
        <button class="menu-btn" id="menuBtn" aria-label="Menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
      </div></div>`;
    document.body.prepend(nav);

    const foot = document.createElement('footer');
    foot.className = 'footer';
    foot.innerHTML = `<div class="wrap"><div><b>SEER / ELECTRIC FOUNDATION</b><br>One forecasting ecosystem.</div>
      <div style="text-align:right">Design concept · illustrative data<br>Not connected to live markets or trading.</div></div>`;
    document.body.append(foot);

    const tb = document.getElementById('themeBtn');
    const paint = () => tb.innerHTML = isLight() ? '☾<span class="hide-sm">&nbsp;Dark</span>' : '☀<span class="hide-sm">&nbsp;Light</span>';
    paint();
    tb.onclick = () => {
      const next = isLight() ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('seer-theme', next); } catch (e) {}
      paint(); window.dispatchEvent(new Event('themechange'));
    };
    document.getElementById('menuBtn').onclick = () => document.getElementById('links').classList.toggle('open');
    document.getElementById('connectBtn').onclick = () => Wallet.open();
    Wallet.paint();
  };

  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status');
  document.addEventListener('DOMContentLoaded', () => document.body.append(t));
  window.toast = function (m) { t.textContent = m; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200); };

  window.$ = (s, r = document) => r.querySelector(s);
  window.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  window.bar = (pct, cls = '') => `<div class="bar ${cls}"><i style="width:${pct}%"></i></div>`;

  // ---------- trade ticket (kit: market card + amount panel) ----------
  window.openTicket = function (title, side, price, vol) {
    let ov = $('#ticket');
    if (!ov) {
      ov = document.createElement('div'); ov.id = 'ticket'; ov.className = 'overlay';
      ov.innerHTML = `<div class="ticket" role="dialog" aria-modal="true" aria-label="Trade ticket">
        <div class="card"><div class="mkt-foot" style="margin-bottom:10px"><span class="badge" id="tVol"></span><span class="sp"></span><span>Just now</span></div>
          <h3 id="tTitle" style="margin-bottom:14px"></h3>
          <div class="sidebyside"><div class="opt" id="oYes"><small>Yes</small><b></b></div><div class="opt" id="oNo"><small>No</small><b></b></div></div>
          <div class="nested" style="padding:12px;margin-top:12px;font-size:13px" id="tEst"></div></div>
        <div class="card"><div class="amount"><span>Amount</span><b id="tAmt">$0.00</b></div>
          <div class="quick"><button data-a="1">+$1</button><button data-a="5">+$5</button><button data-a="20">+$20</button><button data-a="100">+$100</button></div>
          <div class="ticket-actions"><button class="btn btn-primary" id="tOk">Confirm</button><button class="x" id="tX" aria-label="Close">✕</button></div></div></div>`;
      document.body.append(ov);
      ov.onclick = e => { if (e.target === ov) ov.classList.remove('open'); };
      $('#tX').onclick = () => ov.classList.remove('open');
      $$('.quick button', ov).forEach(b => b.onclick = () => { ov._amt += +b.dataset.a; ov._upd(); });
      $('#tOk').onclick = () => { if (!Wallet.addr) { ov.classList.remove('open'); return Wallet.open(); } if (!ov._amt) return toast('Add an amount first'); ov.classList.remove('open'); toast(`Order preview: $${ov._amt.toFixed(2)} on ${ov._side}`); };
      document.addEventListener('keydown', e => { if (e.key === 'Escape') ov.classList.remove('open'); });
    }
    ov._amt = 0; ov._side = side;
    const yes = side === 'Yes' ? price : 100 - price, no = 100 - yes;
    $('#tTitle', ov).textContent = title; $('#tVol', ov).textContent = vol || '—';
    $('#oYes b', ov).textContent = yes + '¢'; $('#oNo b', ov).textContent = no + '¢';
    $('#oYes', ov).className = 'opt yes-o' + (side === 'Yes' ? ' on' : ''); $('#oNo', ov).className = 'opt no-o' + (side === 'No' ? ' on' : '');
    ov._upd = () => {
      const px = (side === 'Yes' ? yes : no) / 100;
      $('#tAmt', ov).textContent = '$' + ov._amt.toFixed(2);
      $('#tOk', ov).className = 'btn btn-lg ' + (side === 'Yes' ? 'btn-buy' : 'btn-sell');
      $('#tOk', ov).textContent = Wallet.addr ? 'Confirm ' + side : 'Connect wallet to trade';
      $('#tEst', ov).innerHTML = ov._amt ? `Est. shares <b>${(ov._amt / px).toFixed(1)}</b> · Max payout <b>$${(ov._amt / px).toFixed(2)}</b>` : `Buying <b>${side}</b> at ${(px * 100).toFixed(0)}¢. Pick an amount.`;
    };
    ov._upd(); ov.classList.add('open');
  };

  // ---------- line chart helper ----------
  window.lineChart = function (el, series, opts = {}) {
    const W = 640, H = opts.h || 220, p = { l: 38, r: 12, t: 12, b: 24 };
    const n = series[0].data.length, min = opts.min ?? 0, max = opts.max ?? 100;
    const x = i => p.l + (W - p.l - p.r) * i / (n - 1), y = v => p.t + (H - p.t - p.b) * (1 - (v - min) / (max - min));
    let g = '';
    for (let k = 0; k <= 4; k++) { const v = min + (max - min) * k / 4; g += `<line x1="${p.l}" x2="${W - p.r}" y1="${y(v)}" y2="${y(v)}" stroke="currentColor" stroke-opacity=".08"/><text x="${p.l - 6}" y="${y(v) + 4}" text-anchor="end">${Math.round(v * 10) / 10}${opts.unit || ''}</text>`; }
    const labels = opts.labels || [];
    labels.forEach((l, i) => { if (l) g += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${l}</text>`; });
    const lines = series.map(s => {
      const d = s.data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
      const area = s.area ? `<path d="${d} L${x(n - 1)} ${y(min)} L${x(0)} ${y(min)}Z" fill="${s.color}" opacity=".12"/>` : '';
      return `${area}<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" ${s.dash ? 'stroke-dasharray="5 5"' : ''}/><circle cx="${x(n - 1)}" cy="${y(s.data[n - 1])}" r="4" fill="${s.color}"/>`;
    }).join('');
    el.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" style="color:var(--text)" role="img" aria-label="${opts.label || 'Chart'}">${g}${lines}</svg>`;
  };

  // ---------- who's asking · what it prices · how to use it ----------
  window.signalStrip = function (el, o) {
    el.innerHTML = `<div class="signal" role="group" aria-label="How to read this signal">
      <div><div class="n">01 · Who is asking</div><b>${o.who[0]}</b><p>${o.who[1]}</p></div>
      <div><div class="n">02 · What it prices</div><b>${o.prices[0]}</b><p>${o.prices[1]}</p></div>
      <div><div class="n">03 · How to use it</div><b>${o.use[0]}</b><p>${o.use[1]}</p></div></div>`;
  };

  // deterministic pseudo-random walk for demo charts
  window.walk = function (seed, n, start, step, lo = 1, hi = 99) {
    let s = seed, v = start; const out = [];
    for (let i = 0; i < n; i++) { s = (s * 9301 + 49297) % 233280; v += ((s / 233280) - .5) * step; v = Math.max(lo, Math.min(hi, v)); out.push(+v.toFixed(1)); }
    return out;
  };
})();
