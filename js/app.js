/* =========================================================
   앱: 미션 진행, 가이드, 레이아웃, 이벤트
   ========================================================= */
'use strict';
const App = (window.App = { A: {} });
(() => {
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const S = () => G.S();
const P = () => S().prog;

const LEVELS = [[0, '🌱 새싹 커미터'], [200, '🌿 브랜치 탐험가'], [600, '🌳 PR 마스터'], [1200, '🚀 오픈소스 기여자'], [2000, '⭐ 깃허브 고수'], [3000, '👑 그랜드마스터']];
const TIPS = [
  '커밋은 작게, 자주! 하나의 커밋에는 하나의 목적만 담아요.',
  'git status 는 길을 잃었을 때 쓰는 나침반이에요 🧭',
  '커밋 메시지는 "무엇을 했는지" 동사로 시작하면 읽기 쉬워요. (Add, Fix, Update…)',
  '작업 시작 전에 git pull! 충돌을 줄이는 최고의 습관이에요.',
  '비밀번호·토큰은 절대 코드에 쓰지 말고 Secrets에 보관해요 🔐',
  'README는 저장소의 첫인상! 무엇을, 왜, 어떻게 쓰는지 적어요.',
  'main에서 바로 작업하지 말고 브랜치를 만들어 실험해요 🌿',
  '좋은 PR = 작은 변경 + 친절한 설명 + 스크린샷',
];
App.dailyTip = () => TIPS[Math.floor(Date.now() / 864e5) % TIPS.length];

/* ---------- 마스코트 깃토리 (오리지널 도토리 캐릭터) ---------- */
App.mascot = (sz = 64, mood = 'happy') => `<svg class="mascot" width="${sz}" height="${sz}" viewBox="0 0 100 100" aria-hidden="true">
  <path d="M50 6 q4 -4 9 -2 q-4 3 -6 8z" fill="#5a9a3a"/><rect x="47" y="8" width="5" height="9" rx="2" fill="#6b4423"/>
  <path d="M14 40 Q14 14 50 14 Q86 14 86 40 Q86 46 80 47 L20 47 Q14 46 14 40Z" fill="#8a5a2b"/>
  <path d="M22 24 L78 24 M18 33 L82 33 M30 16 L26 46 M50 14 L50 47 M70 16 L74 46" stroke="#6b4423" stroke-width="2.5" opacity=".55"/>
  <path d="M20 46 Q20 92 50 94 Q80 92 80 46Z" fill="#e8b46a"/>
  <ellipse cx="38" cy="62" rx="${mood === 'wow' ? 5 : 4.5}" ry="${mood === 'wow' ? 6 : 5.5}" fill="#2b1d10"/><ellipse cx="62" cy="62" rx="${mood === 'wow' ? 5 : 4.5}" ry="${mood === 'wow' ? 6 : 5.5}" fill="#2b1d10"/>
  <circle cx="39.5" cy="60" r="1.6" fill="#fff"/><circle cx="63.5" cy="60" r="1.6" fill="#fff"/>
  <ellipse cx="29" cy="72" rx="5" ry="3" fill="#f39b8a" opacity=".7"/><ellipse cx="71" cy="72" rx="5" ry="3" fill="#f39b8a" opacity=".7"/>
  ${mood === 'wow' ? '<ellipse cx="50" cy="76" rx="5" ry="6" fill="#7a3b1e"/>' : '<path d="M42 73 Q50 81 58 73" stroke="#2b1d10" stroke-width="3" fill="none" stroke-linecap="round"/>'}
</svg>`;

/* ---------- 토스트 / 모달 ---------- */
App.toast = (msg, kind = '') => {
  const box = $('toasts'); const el = document.createElement('div');
  el.className = 'toast ' + kind; el.textContent = msg; box.appendChild(el);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => el.classList.add('out'), 3600); setTimeout(() => el.remove(), 4100);
};
App.modal = (html, o = {}) => { const m = $('modal'); m.innerHTML = `<div class="modal-bg" data-a="modal-bg"></div><div class="modal-box ${o.wide ? 'wide' : ''} ${o.cls || ''}">${html}</div>`; m.classList.add('open'); setTimeout(() => { const f = m.querySelector('input:not([readonly]),textarea'); if (f && !o.noFocus) f.focus(); }, 30); };
App.closeModal = () => { const m = $('modal'); m.classList.remove('open'); m.innerHTML = ''; };
App.confirm = (msg, yes) => { App.modal(`<p>${esc(msg)}</p><div class="row-end"><button class="btn" data-a="modal-close">취소</button><button class="btn btn-primary" id="cf-yes">확인</button></div>`); $('cf-yes').onclick = () => { App.closeModal(); yes(); }; };
App.copy = txt => { const fb = () => { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (er) {} t.remove(); }; try { navigator.clipboard.writeText(txt).catch(fb); } catch (e) { fb(); } };
App.confetti = () => {
  const fx = $('fx'); const colors = ['#2da44e', '#0969da', '#bf3989', '#fb8f44', '#8250df', '#d4a72c'];
  for (let i = 0; i < 90; i++) { const c = document.createElement('i'); c.className = 'conf'; c.style.left = Math.random() * 100 + 'vw'; c.style.background = colors[i % colors.length]; c.style.animationDelay = Math.random() * 0.6 + 's'; c.style.animationDuration = 2 + Math.random() * 1.6 + 's'; c.style.transform = `rotate(${Math.random() * 360}deg)`; fx.appendChild(c); setTimeout(() => c.remove(), 4500); }
};

/* ---------- 레벨/배지 ---------- */
App.level = xp => { let i = 0; LEVELS.forEach((l, k) => { if (xp >= l[0]) i = k; }); const next = LEVELS[i + 1]; return { i, name: LEVELS[i][1], cur: LEVELS[i][0], next: next ? next[0] : null }; };
App.badgeList = () => M.list.filter(m => m.badge).map(m => ({ id: m.id, icon: m.badge[0], name: m.badge[1], got: !!P().done[m.id], mission: m.title }));

/* ---------- 레이아웃 렌더 ---------- */
App.renderTop = () => {
  const p = P(); const lv = App.level(p.xp); const pct = lv.next ? ((p.xp - lv.cur) / (lv.next - lv.cur)) * 100 : 100;
  const bl = App.badgeList(); const done = Object.keys(p.done).length;
  $('top-stats').innerHTML = `<div class="lv">${lv.name}</div><div class="xpbar" title="${p.xp} XP"><span style="width:${pct}%"></span><b>${p.xp}${lv.next ? ' / ' + lv.next : ''} XP</b></div>
    <button class="tbtn" data-a="badges">🏅 ${bl.filter(b => b.got).length}/${bl.length}</button><span class="tprog">✅ ${done}/${M.list.length}</span>`;
};
App.renderSide = () => {
  const p = P();
  $('side').innerHTML = `<div class="side-h"><b>📚 미션 지도</b><span class="small muted">${Object.keys(p.done).length}/${M.list.length} 완료</span></div>` + M.chapters.map((c, ci) => {
    const ms = M.list.filter(m => m.ch === c.id); const dn = ms.filter(m => p.done[m.id]).length;
    return `<div class="chap ${ms.some(m => m.id === p.cur) ? 'open' : ''}"><div class="chap-h"><span>${c.icon} ${ci}. ${esc(c.title)}</span><span class="chip-n ${dn === ms.length ? 'all' : ''}">${dn}/${ms.length}</span></div>
      ${ms.map(m => `<button class="mis ${p.cur === m.id ? 'cur' : ''} ${p.done[m.id] ? 'done' : ''}" data-a="start" data-id="${m.id}"><span class="mis-ic">${p.done[m.id] ? '✅' : p.cur === m.id ? '▶️' : m.icon}</span><span>${esc(m.title)}</span></button>`).join('')}</div>`;
  }).join('') + `<div class="side-foot small muted">이 사이트는 GitHub 화면을 단순화해 흉내 낸 <b>교육용 시뮬레이터</b>예요. GitHub, Inc.와는 관련이 없고, 실제 GitHub 계정에는 아무 영향도 주지 않아요.<br><br>💾 진행 상황은 이 브라우저에만 저장돼요.</div>`;
};
const resolve = (x, ...a) => (typeof x === 'function' ? x(...a) : x);
App.renderGuide = () => {
  const p = P(); const g = $('guide');
  if (!p.cur) {
    const next = M.list.find(m => !p.done[m.id]);
    g.innerHTML = `<div class="guide-card welcome-card"><div class="g-mascot">${App.mascot(78)}</div><div><h2>안녕하세요, ${esc(S().name)}님! 🐿️</h2><p>저는 깃토리예요. 왼쪽 <b>미션 지도</b>에서 하나씩 따라 하면 GitHub의 거의 모든 기능을 직접 체험할 수 있어요.</p>${next ? `<button class="btn btn-primary" data-a="start" data-id="${next.id}">${Object.keys(p.done).length ? '이어서 하기' : '시작하기'}: ${esc(next.title)} ▶</button>` : '<p>🎓 모든 미션을 끝냈어요! 대단해요!</p>'}</div></div>`;
    return;
  }
  const m = M.byId(p.cur); const si = p.step; const st = m.steps[si]; const ch = M.chapters.find(c => c.id === m.ch); const chi = M.chapters.indexOf(ch);
  const dots = m.steps.map((s, i) => `<i class="${i < si ? 'd' : i === si ? 'c' : ''}"></i>`).join('');
  if (p.collapsed) { g.innerHTML = `<div class="guide-card mini"><span>${m.icon} <b>${esc(m.title)}</b> · STEP ${Math.min(si + 1, m.steps.length)}/${m.steps.length}: ${st ? esc(st.t) : '완료'}</span><button class="btn btn-sm" data-a="gexpand">펼치기 ▾</button></div>`; return; }
  let body = '';
  if (!st) body = `<div class="g-step done-step"><h3>🎉 미션 완료!</h3><p>${esc(m.goal)}</p><div class="row gap">${App.nextMission() ? `<button class="btn btn-primary" data-a="start" data-id="${App.nextMission().id}">다음 미션: ${esc(App.nextMission().title)} ▶</button>` : ''}<button class="btn" data-a="restart">↺ 처음부터 다시</button></div></div>`;
  else {
    const desc = resolve(st.d, S());
    let extra = '';
    if (st.snip) extra += `<div class="snips">${st.snip.map((s, i) => { const c = resolve(s.code); return `<div class="snip ${s.kind === 'cmd' ? 'cmd' : ''}">${s.label ? `<div class="snip-l">${esc(s.label)}</div>` : ''}<pre>${esc(c)}</pre><div class="snip-b">${s.kind === 'cmd' ? `<button class="btn btn-sm btn-dark" data-a="snipcmd" data-i="${i}">⌨ 터미널에 입력</button>` : ''}${s.into ? `<button class="btn btn-sm" data-a="snipinto" data-i="${i}">↘ 입력칸에 넣기</button>` : ''}<button class="btn btn-sm" data-a="snipcopy" data-i="${i}">📋 복사</button></div></div>`; }).join('')}</div>`;
    if (st.quiz) extra += `<div class="quiz"><p class="q">❓ ${esc(st.quiz.q)}</p>${st.quiz.o.map((o, i) => `<button class="qopt ${App._wrong === i ? 'wrong' : ''}" data-a="answer" data-i="${i}">${'ABCD'[i]}. ${esc(o)}</button>`).join('')}${App._wrong != null ? `<p class="small err">앗, 다시 생각해 볼까요? 🤔</p>` : ''}</div>`;
    const waiting = !st.concept && !st.quiz && st.target && !st.target.length;
    body = `<div class="g-step ${App._flash ? 'flash-ok' : ''}"><div class="g-num">STEP ${si + 1} / ${m.steps.length}</div><h3>${st.quiz ? '🧠 ' : st.concept ? '📖 ' : waiting ? '⏳ ' : '🎯 '}${esc(st.t)}</h3><div class="g-desc">${desc}</div>${extra}
      ${App._hint ? `<div class="g-hint">💡 ${esc(resolve(st.hint) || '화면에서 반짝이는 부분을 찾아보세요! 위치 보기 버튼을 눌러도 돼요.')}</div>` : ''}
      <div class="g-btns">${st.concept ? `<button class="btn btn-primary" data-a="nextstep">알겠어요! 다음 ▶</button>` : ''}${!st.concept && !st.quiz && !waiting ? `<button class="btn btn-sm" data-a="hint">💡 힌트</button>${st.target && st.target.length ? '<button class="btn btn-sm" data-a="locate">👀 위치 보기</button>' : ''}` : ''}${st.term || m.ch === 'c5' ? '<button class="btn btn-sm" data-a="termfocus">⌨ 터미널 열기</button>' : ''}${waiting ? '<span class="waiting"><i></i><i></i><i></i></span>' : ''}<span class="grow"></span>${!st.concept ? `<button class="btn-link small" data-a="skip" title="이 단계를 건너뛰어요 (XP 없음)">건너뛰기 ⏭</button>` : ''}</div></div>`;
  }
  g.innerHTML = `<div class="guide-card"><div class="g-top"><span class="g-ch">${ch.icon} ${chi}장 · ${esc(ch.title)}</span><span class="g-dots">${dots}</span><span class="grow"></span>${m.real ? `<a class="small" href="${esc(m.real[0])}" target="_blank" rel="noopener" title="실제 GitHub/공식 문서 열기">🌍 공식 문서</a>` : ''}<button class="btn-ic" data-a="gcollapse" title="접기">▴</button></div>
    <div class="g-main"><div class="g-mascot">${App.mascot(64, App._flash ? 'wow' : 'happy')}${App._flash ? '<div class="bubble">잘했어요! +10 XP</div>' : ''}</div><div class="g-body"><h2>${m.icon} ${esc(m.title)}</h2><p class="g-goal">${esc(m.goal)}</p>${body}</div></div></div>`;
};
App.renderAll = () => { App.renderTop(); App.renderSide(); App.renderGuide(); V.render(); T.render(); };

/* ---------- 하이라이트 ---------- */
const visible = el => !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
App.findTarget = () => {
  const p = P(); const m = p.cur && M.byId(p.cur); const st = m && m.steps[p.step];
  if (!st || !st.target) return null;
  for (const sel of st.target) { let els; try { els = document.querySelectorAll('#gh ' + sel); } catch (e) { continue; } for (const el of els) if (visible(el) && !el.disabled) return el; }
  return null;
};
App.afterRender = () => {
  document.querySelectorAll('.hl').forEach(e => e.classList.remove('hl'));
  const el = App.findTarget(); if (el) el.classList.add('hl');
};
App.locate = () => {
  const el = App.findTarget();
  if (!el) { App.toast('🤔 지금 화면에는 눌러야 할 곳이 안 보여요. 힌트를 확인하거나 다른 화면으로 이동해 보세요.', 'warn'); App._hint = true; App.renderGuide(); return; }
  el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.classList.add('hl-strong'); setTimeout(() => el.classList.remove('hl-strong'), 2600);
};

/* ---------- 미션 진행 ---------- */
App.nextMission = () => { const i = M.index(P().cur); return M.list.slice(i + 1).find(m => !P().done[m.id]) || M.list.find(m => !P().done[m.id] && m.id !== P().cur); };
App.start = id => {
  const p = P(), m = M.byId(id); if (!m) return;
  App._hint = false; App._wrong = null; App._flash = false;
  p.cur = id; p.collapsed = false; p.steps = p.steps || {};
  p.step = p.done[id] ? 0 : p.steps[id] || 0;
  try { m.setup && m.setup(); } catch (e) { console.error(e); }
  try { if (m.go) V.go(m.go()); } catch (e) { console.error(e); }
  if (m.ch === 'c5' || m.steps[p.step]?.term) App.openTerm(true);
  App.renderAll(); G.save();
  document.getElementById('guide').scrollIntoView({ block: 'nearest' });
  App.checkAuto();
  if (window.innerWidth < 900) document.body.classList.remove('side-open');
};
App.checkAuto = () => {
  clearTimeout(App._autoT);
  App._autoT = setTimeout(() => { const p = P(); const m = p.cur && M.byId(p.cur); const st = m && m.steps[p.step]; if (st && st.auto) { let ok = false; try { ok = st.auto(S()); } catch (e) {} if (ok) App.completeStep(true); } }, 450);
};
App.completeStep = (silent) => {
  const p = P(), m = M.byId(p.cur); if (!m || p.step >= m.steps.length) return;
  const first = !p.done[m.id];
  if (first) p.xp += 10;
  p.step++; p.steps[m.id] = p.step; App._hint = false; App._wrong = null;
  App._flash = true; clearTimeout(App._flT); App._flT = setTimeout(() => { App._flash = false; App.renderGuide(); App.afterRender(); }, 1600);
  if (p.step >= m.steps.length) App.completeMission(m, first);
  const nst = m.steps[p.step]; if (nst && (nst.term)) App.openTerm(true);
  App.renderTop(); App.renderGuide(); App.afterRender(); G.save();
  App.checkAuto();
};
App.completeMission = (m, first) => {
  const p = P();
  if (first) { p.xp += m.xp; p.done[m.id] = Date.now(); }
  App.renderSide(); App.renderTop();
  App.confetti();
  const nx = App.nextMission();
  setTimeout(() => {
    if (m.id === 'exam') { App.certificate(); return; }
    App.modal(`<div class="done-modal"><div class="dm-mascot">${App.mascot(90, 'wow')}</div><h2>🎉 미션 완료!</h2><h3>${m.icon} ${esc(m.title)}</h3>
      <p class="xp-gain">${first ? `+${m.xp + m.steps.length * 10} XP` : '복습 완료!'}</p>
      ${m.badge && first ? `<div class="new-badge"><span>${m.badge[0]}</span><div><small>새 배지 획득!</small><b>${esc(m.badge[1])}</b></div></div>` : ''}
      ${m.real ? `<div class="real-tip">🌍 <b>실제 GitHub에서는?</b><br>${esc(m.real[1] || '')}<br><a href="${esc(m.real[0])}" target="_blank" rel="noopener">공식 자료 보러 가기 ↗</a></div>` : ''}
      <div class="row-end">${nx ? `<button class="btn btn-primary" data-a="startnext" data-id="${nx.id}">다음 미션: ${esc(nx.title)} ▶</button>` : ''}<button class="btn" data-a="modal-close">닫기</button></div></div>`, { noFocus: true });
  }, 700);
};
App.onEvent = (type, d) => {
  if (!S()) return;
  const p = P(); const m = p.cur && M.byId(p.cur); const st = m && m.steps[p.step];
  if (st && st.on && !st.concept && !st.quiz) {
    const ons = Array.isArray(st.on) ? st.on : [st.on];
    let ok = false; if (ons.includes(type)) { try { ok = !st.when || st.when(d || {}, S()); } catch (e) { ok = false; } }
    if (ok) App.completeStep();
  }
  App.saveSoon();
};
App.saveSoon = () => { clearTimeout(App._svT); App._svT = setTimeout(() => G.save(), 250); };

/* ---------- 수료증 ---------- */
App.certificate = () => {
  const p = P(); const d = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  App.modal(`<div class="cert" id="cert"><div class="cert-in"><div class="cert-m">${App.mascot(70, 'happy')}</div><div class="cert-t">수 료 증</div><div class="cert-e">CERTIFICATE OF COMPLETION</div>
    <div class="cert-n">${esc(S().name)}</div><div class="small muted">@${esc(S().login)}</div>
    <p>위 사람은 <b>깃토리의 GitHub 연습장</b>에서 저장소·커밋·브랜치·Pull Request·이슈·협업·터미널 Git·Actions·Pages·보안 등<br>GitHub의 핵심 기능을 직접 실습하고 졸업 시험을 통과하였으므로 이 증서를 드립니다.</p>
    <div class="cert-badges">${App.badgeList().filter(b => b.got).map(b => `<span title="${esc(b.name)}">${b.icon}</span>`).join('')}</div>
    <div class="cert-f"><span>✅ 미션 ${Object.keys(p.done).length}/${M.list.length}</span><span>⭐ ${p.xp} XP</span><span>📅 ${d}</span></div><div class="cert-sign">깃토리 🐿️ 드림</div></div></div>
    <div class="row-end no-print"><button class="btn" data-a="printcert">🖨 인쇄 / PDF로 저장</button><button class="btn btn-primary" data-a="modal-close">닫기</button></div>`, { wide: true, noFocus: true });
};

/* ---------- 터미널 패널 ---------- */
App.openTerm = force => { const t = $('termwrap'); if (force) t.classList.add('open'); else t.classList.toggle('open'); const open = t.classList.contains('open'); document.body.classList.toggle('term-open', open); if (S()) P().termOpen = open; if (open) { T.render(); setTimeout(() => { T.focus(); }, 50); } };

/* ---------- 앱 액션 ---------- */
const A = App.A;
A['modal-close'] = () => App.closeModal();
A['modal-bg'] = () => { if (!document.querySelector('#modal .cert, #modal .onb')) App.closeModal(); };
A.start = el => { App.closeModal(); App.start(el.dataset.id); };
A.startnext = A.start;
A.restart = () => { const p = P(); p.steps[p.cur] = 0; p.step = 0; App.start(p.cur); };
A.nextstep = () => App.completeStep();
A.skip = () => { P().skipped++; const p = P(), m = M.byId(p.cur); p.step++; p.steps[m.id] = p.step; App._hint = false; if (p.step >= m.steps.length) App.completeMission(m, !p.done[m.id]); App.renderAll(); G.save(); App.checkAuto(); };
A.hint = () => { App._hint = !App._hint; App.renderGuide(); };
A.locate = () => App.locate();
A.gcollapse = () => { P().collapsed = true; App.renderGuide(); };
A.gexpand = () => { P().collapsed = false; App.renderGuide(); App.afterRender(); };
A.answer = el => {
  const p = P(), m = M.byId(p.cur), st = m.steps[p.step]; const i = +el.dataset.i;
  if (i === st.quiz.a) { App._wrong = null; App.toast('⭕ 정답! ' + st.quiz.e); App.completeStep(); }
  else { App._wrong = i; App.renderGuide(); const q = document.querySelector('.quiz'); q && q.classList.add('shake'); setTimeout(() => q && q.classList.remove('shake'), 500); }
};
const curSnip = el => { const p = P(), m = M.byId(p.cur), st = m.steps[p.step]; const s = st.snip[+el.dataset.i]; return { s, code: resolve(s.code) }; };
A.snipcmd = el => { const { code } = curSnip(el); App.openTerm(true); const i = $('tinput'); i.value = code; i.focus(); i.scrollIntoView({ block: 'nearest' }); App.toast('⌨ 터미널에 입력했어요. Enter 키를 눌러 실행하세요!'); };
A.snipcopy = el => { App.copy(curSnip(el).code); App.toast('📋 복사했어요!'); };
A.snipinto = el => {
  const { s, code } = curSnip(el); const t = document.querySelector(s.into);
  if (!t) { App.toast('🤔 넣을 입력칸이 지금 화면에 없어요. 먼저 해당 화면을 열어 주세요!', 'warn'); return; }
  t.value = code; t.dispatchEvent(new Event('input', { bubbles: true })); t.focus(); t.classList.add('hl-strong'); setTimeout(() => t.classList.remove('hl-strong'), 1200);
};
A.termfocus = () => App.openTerm(true);
A.termtoggle = () => App.openTerm();
A.termclear = () => { T.out = []; T.render(); };
A.termbig = () => { $('termwrap').classList.toggle('big'); };
A.badges = () => {
  const bl = App.badgeList();
  App.modal(`<h3>🏅 배지 컬렉션 (${bl.filter(b => b.got).length}/${bl.length})</h3><div class="badge-grid">${bl.map(b => `<div class="bdg ${b.got ? 'got' : ''}"><span>${b.got ? b.icon : '🔒'}</span><b>${esc(b.name)}</b><small>${esc(b.mission)}</small></div>`).join('')}</div><div class="row-end"><button class="btn" data-a="modal-close">닫기</button></div>`, { noFocus: true });
};
A.settings = () => {
  App.modal(`<h3>⚙️ 설정</h3><label class="lbl">표시 이름</label><input class="inp" id="set-name" value="${esc(S().name)}"><p class="small muted">GitHub 아이디(@${esc(S().login)})는 바꿀 수 없어요. 바꾸려면 처음부터 다시 시작해야 해요.</p>
   <div class="row-end"><button class="btn" data-a="modal-close">닫기</button><button class="btn btn-primary" data-a="savename">저장</button></div><hr><h4 class="err">처음부터 다시 하기</h4><p class="small">모든 미션 진행 상황, 저장소, 터미널 기록이 지워져요.</p><button class="btn btn-danger btn-sm" data-a="resetall">전체 초기화</button>`);
};
A.savename = () => { const n = $('set-name').value.trim(); if (n) S().name = n; App.closeModal(); App.renderAll(); G.save(); };
A.resetall = () => App.confirm('정말 모든 진행 상황을 지울까요? 되돌릴 수 없어요!', () => { G.reset(); location.reload(); });
A.help = () => App.modal(`<h3>❓ 도움말</h3><ul class="howto"><li>🎯 위쪽 <b>미션 카드</b>의 설명대로 가상 GitHub를 조작하면 자동으로 다음 단계로 넘어가요.</li><li>💡 <b>힌트</b> · 👀 <b>위치 보기</b> 버튼으로 어디를 눌러야 할지 알 수 있어요. 눌러야 할 곳은 <span class="hl-demo">점선</span>으로 표시돼요.</li><li>↘ <b>입력칸에 넣기</b> / ⌨ <b>터미널에 입력</b> 버튼으로 예시를 바로 넣을 수 있어요.</li><li>⏭ 정말 막히면 <b>건너뛰기</b>를 눌러도 돼요.</li><li>◀ ▶ 가상 브라우저의 뒤로/앞으로 버튼도 쓸 수 있어요.</li><li>💾 모든 진행은 이 브라우저에 자동 저장돼요. 다른 컴퓨터에서는 처음부터 시작해요.</li></ul><div class="row-end"><button class="btn btn-primary" data-a="modal-close">알겠어요</button></div>`, { noFocus: true });
A.printcert = () => { document.body.classList.add('printing'); window.print(); setTimeout(() => document.body.classList.remove('printing'), 500); };
A.navback = () => V.back();
A.navfwd = () => V.forward();
A.navreload = () => { V.render(); };
A.sidetoggle = () => document.body.classList.toggle('side-open');

/* ---------- 온보딩 ---------- */
App.onboard = () => {
  App.modal(`<div class="onb"><div class="onb-m">${App.mascot(110)}</div><h2>반가워요! 저는 <span class="brand">깃토리</span>예요 🐿️</h2><p>여기는 진짜 GitHub처럼 생긴 <b>연습용 놀이터</b>예요. 마음껏 눌러 보고, 실수해도 괜찮아요!</p>
    <label class="lbl">내 이름 (화면에 보일 이름)</label><input class="inp" id="ob-name" placeholder="예: 홍길동" maxlength="20">
    <label class="lbl">GitHub 아이디로 쓸 영문 이름</label><input class="inp mono" id="ob-login" placeholder="예: gildong-dev" maxlength="39"><p class="small muted">영문·숫자·하이픈(-)만 가능해요. 실제 GitHub 계정이 있다면 같은 아이디를 써도 좋아요. (실제 계정과 연결되지는 않아요)</p>
    <p class="small err" id="ob-err"></p><div class="row-end"><button class="btn btn-primary btn-lg" id="ob-go">연습 시작하기 🚀</button></div></div>`, { noFocus: false });
  const go = () => {
    const name = $('ob-name').value.trim(); const login = $('ob-login').value.trim();
    if (!name) { $('ob-err').textContent = '이름을 적어 주세요!'; return; }
    if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(login)) { $('ob-err').textContent = '아이디는 영문/숫자/하이픈만, 하이픈으로 시작하거나 끝날 수 없어요.'; return; }
    if (['octo-academy', 'dain-friend', 'octo-teacher', 'mina-dev', 'leo-k'].includes(login.toLowerCase())) { $('ob-err').textContent = '연습장 친구들이 쓰는 아이디예요. 다른 아이디를 골라 주세요!'; return; }
    G.init(login, name); App.closeModal(); App.boot2(); App.start('welcome');
  };
  $('ob-go').onclick = go;
  $('ob-login').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
};

/* ---------- 부팅 ---------- */
App.safeRender = () => {
  const a = document.activeElement; const gh = $('gh');
  if (a && gh && gh.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName) && a.type !== 'checkbox') { App._pending = true; return; }
  V.render(); App._pending = false;
};
App.boot2 = () => {
  G.emit = App.onEvent;
  G.notify = msg => { App.toast(msg); const s = S(); s.inbox = s.inbox || []; s.inbox.unshift({ s: msg, t: Date.now(), read: false }); s.inbox.length = Math.min(s.inbox.length, 30); };
  G.onChange = kind => { clearTimeout(App._chT); App._chT = setTimeout(() => { App.safeRender(); App.renderTop(); App.saveSoon(); }, 60); };
  G.runFinishAll(); G.botTick();
  T.mount();
  if (P().termOpen) App.openTerm(true);
  App.renderAll();
  setInterval(() => { if (S()) G.botTick(); }, 1500);
  App.checkAuto();
};
App.boot = () => {
  bindEvents();
  if (G.load()) { App.boot2(); } else { App.onboard(); }
};

function bindEvents() {
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-a]');
    if (V.ui.menu && !e.target.closest('.dd-wrap')) { V.ui.menu = null; if (!el) { V.render(); return; } }
    if (!el) return;
    const isInput = el.tagName === 'INPUT';
    if (!isInput) e.preventDefault();
    const a = el.dataset.a;
    if (!S() && a !== 'modal-close') return;
    try { if (A[a]) A[a](el, e); else if (V.A[a]) V.A[a](el, e); } catch (err) { console.error(err); App.toast('⚠️ 오류가 났어요: ' + err.message, 'warn'); }
    App.saveSoon();
  });
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.a2 && el.tagName !== 'SELECT') V.A2[el.dataset.a2]?.(el);
    if (el.dataset.live && !e.isComposing) V.render();
  });
  document.addEventListener('compositionend', e => { if (e.target.dataset?.live) V.render(); });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.tagName === 'SELECT' && el.dataset.a2) V.A2[el.dataset.a2]?.(el);
    if (el.id === 'up-file') V.readFiles(el.files);
  });
  document.addEventListener('focusout', e => { if (App._pending) setTimeout(() => { const a = document.activeElement; if (!a || !$('gh').contains(a) || !/^(INPUT|TEXTAREA)$/.test(a.tagName)) { App._pending = false; V.render(); } }, 120); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if ($('modal').classList.contains('open') && !document.querySelector('#modal .onb')) App.closeModal(); else if (V.ui.menu) { V.ui.menu = null; V.render(); } }
    if (e.key === 'Enter' && e.target.id === 'br-filter') { e.preventDefault(); const b = document.querySelector('[data-a=mkbr]') || document.querySelector('.br-dd [data-a=setbr]'); b && b.click(); }
    if (e.key === 'Enter' && e.target.id === 'nr-name') { const b = document.querySelector('[data-a=createrepo]'); b && !b.disabled && b.click(); }
  });
  document.addEventListener('dragover', e => { if (e.target.closest('#dropzone') || e.target.closest('.col')) { e.preventDefault(); (e.target.closest('#dropzone') || e.target.closest('.col')).classList.add('drag'); } });
  document.addEventListener('dragleave', e => { const z = e.target.closest && (e.target.closest('#dropzone') || e.target.closest('.col')); z && z.classList.remove('drag'); });
  document.addEventListener('dragstart', e => { const c = e.target.closest && e.target.closest('.pcard'); if (c) { e.dataTransfer.setData('text/plain', c.dataset.item + '|' + c.dataset.pi); c.classList.add('dragging'); } });
  document.addEventListener('drop', e => {
    const dz = e.target.closest('#dropzone'); if (dz) { e.preventDefault(); dz.classList.remove('drag'); V.readFiles(e.dataTransfer.files); return; }
    const col = e.target.closest('.col'); if (col) { e.preventDefault(); col.classList.remove('drag'); const [id, pi] = (e.dataTransfer.getData('text/plain') || '').split('|'); if (id) V.pmove(+pi, id, col.dataset.col); }
  });
  window.addEventListener('beforeunload', () => { if (S()) G.save(); });
}
document.addEventListener('DOMContentLoaded', App.boot);
})();
