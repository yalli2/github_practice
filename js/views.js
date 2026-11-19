/* =========================================================
   가상 GitHub 화면 (1) – 공통, 대시보드, 코드, 커밋, 브랜치, PR, 이슈
   ========================================================= */
'use strict';
const V = (window.V = { ui: {}, A: {} });
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const val = id => ($(id) ? $(id).value : '');
const chk = id => !!($(id) && $(id).checked);
V.esc = esc; V.val = val;
const SS = () => G.S();
const ago = t => { const s = (Date.now() - t) / 1000; if (s < 60) return '방금 전'; if (s < 3600) return Math.floor(s / 60) + '분 전'; if (s < 86400) return Math.floor(s / 3600) + '시간 전'; const d = Math.floor(s / 86400); return d < 30 ? d + '일 전' : new Date(t).toLocaleDateString('ko-KR'); };
V.ago = ago;
const hue = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
const av = (n, sz = 20) => { n = String(n || '?'); const bot = n.endsWith('[bot]'); return `<span class="av${bot ? ' bot' : ''}" style="--h:${hue(n)};width:${sz}px;height:${sz}px;font-size:${Math.round(sz * 0.48)}px" title="${esc(n)}">${bot ? '🤖' : esc(n[0].toUpperCase())}</span>`; };
V.av = av;
const lbl = (r, name) => { const l = r.labels.find(x => x.name === name) || { name, color: 'cccccc' }; const c = l.color; const dark = parseInt(c.slice(0, 2), 16) * 0.299 + parseInt(c.slice(2, 4), 16) * 0.587 + parseInt(c.slice(4, 6), 16) * 0.114 < 150; return `<span class="label" style="background:#${c};color:${dark ? '#fff' : '#1f2328'}">${esc(name)}</span>`; };
V.lbl = lbl;
const t = (key, extra) => `data-t="${key}"${extra ? ' ' + extra : ''}`;
const ICON = {
  repo: '<svg viewBox="0 0 16 16" class="oi"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>',
  branch: '<svg viewBox="0 0 16 16" class="oi"><path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"/></svg>',
  pr: '<svg viewBox="0 0 16 16" class="oi"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"/></svg>',
  issue: '<svg viewBox="0 0 16 16" class="oi"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/></svg>',
  merged: '<svg viewBox="0 0 16 16" class="oi"><path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z"/></svg>',
  commit: '<svg viewBox="0 0 16 16" class="oi"><path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/></svg>',
};
V.ICON = ICON;

/* ---------- 마크다운 ---------- */
const EMO = { tada: '🎉', rocket: '🚀', '+1': '👍', thumbsup: '👍', smile: '😄', heart: '❤️', fire: '🔥', star: '⭐', wave: '👋', sparkles: '✨', bug: '🐛', books: '📚', eyes: '👀', white_check_mark: '✅', warning: '⚠️', memo: '📝', seedling: '🌱', computer: '💻', octocat: '🐱' };
V.md = (src, o = {}) => {
  src = String(src ?? '');
  const blocks = []; src = src.replace(/```(\w*)\n([\s\S]*?)```/g, (_, l, c) => { blocks.push(`<pre class="code-blk"><code>${esc(c.replace(/\n$/, ''))}</code></pre>`); return `\u0000${blocks.length - 1}\u0000`; });
  const safeUrl = u => { u = u.trim(); if (/^(https?:|mailto:|#|data:image\/)/i.test(u)) return u; if (/^[\w./-]+$/.test(u)) { if (o.tree && o.tree[u.replace(/^\.\//, '')] !== undefined) { const v = o.tree[u.replace(/^\.\//, '')]; return G.isBin(v) ? v : '#'; } return u; } return '#'; };
  const inline = s => {
    s = esc(s);
    const codes = []; s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(`<code>${c}</code>`); return `\u0001${codes.length - 1}\u0001`; });
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, a, u) => `<img src="${esc(safeUrl(u.replace(/&amp;/g, '&')))}" alt="${a}">`);
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, a, u) => `<a href="${esc(safeUrl(u.replace(/&amp;/g, '&')))}" target="_blank" rel="noopener">${a}</a>`);
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/__([^_]+)__/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>').replace(/(^|\W)_([^_\n]+)_(?=\W|$)/g, '$1<em>$2</em>');
    s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    s = s.replace(/:([\w+]+):/g, (m, k) => EMO[k] || m);
    if (o.repo) s = s.replace(/(^|[\s(])#(\d+)\b/g, (m, p, n) => `${p}<a href="#" data-a="goitem" data-n="${n}" class="ref">#${n}</a>`);
    s = s.replace(/(^|[\s(])@([\w-]+(?:\[bot\])?)/g, '$1<strong class="mention">@$2</strong>');
    s = s.replace(/(^|[\s(])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
    return s.replace(/\u0001(\d+)\u0001/g, (_, i) => codes[i]);
  };
  const L = src.split('\n'); let html = '', i = 0, taskI = 0;
  while (i < L.length) {
    const l = L[i];
    if (/^\u0000\d+\u0000$/.test(l.trim())) { html += blocks[+l.trim().slice(1, -1)]; i++; continue; }
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{1,6})\s+(.*)$/))) { html += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`; i++; continue; }
    if (/^(\*\s*\*\s*\*|-\s*-\s*-|_\s*_\s*_)[\s*_-]*$/.test(l)) { html += '<hr>'; i++; continue; }
    if (/^>\s?/.test(l)) { const q = []; while (i < L.length && /^>\s?/.test(L[i])) q.push(L[i++].replace(/^>\s?/, '')); html += `<blockquote>${V.md(q.join('\n'), o)}</blockquote>`; continue; }
    if (/^\|.*\|\s*$/.test(l) && L[i + 1] && /^\|?\s*:?-{2,}/.test(L[i + 1])) {
      const row = s => s.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const hd = row(l); i += 2; let rows = '';
      while (i < L.length && /^\|.*\|\s*$/.test(L[i])) { rows += '<tr>' + row(L[i]).map(c => `<td>${inline(c)}</td>`).join('') + '</tr>'; i++; }
      html += `<table><thead><tr>${hd.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`; continue;
    }
    if (/^\s*([-*+]|\d+\.)\s+/.test(l)) {
      const ordered = /^\s*\d+\./.test(l); let items = '';
      while (i < L.length && /^\s*([-*+]|\d+\.)\s+/.test(L[i])) {
        let it = L[i].replace(/^\s*([-*+]|\d+\.)\s+/, ''); let tm;
        if ((tm = it.match(/^\[([ xX])\]\s*(.*)$/))) { const on = tm[1] !== ' '; items += `<li class="task"><input type="checkbox" ${on ? 'checked' : ''} ${o.tasks ? `data-a="task" data-i="${taskI}"` : 'disabled'}> ${inline(tm[2])}</li>`; taskI++; }
        else items += `<li>${inline(it)}</li>`;
        i++;
      }
      html += ordered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`; continue;
    }
    const p = [];
    while (i < L.length && L[i].trim() && !/^(#{1,6}\s|>|\s*([-*+]|\d+\.)\s+|\u0000|\|)/.test(L[i])) p.push(L[i++]);
    if (!p.length) { p.push(L[i++]); }
    html += `<p>${p.map(inline).join('<br>')}</p>`;
  }
  return `<div class="md">${html}</div>`;
};

/* ---------- 라우팅 ---------- */
V.url = (v = SS().view) => {
  const r = v.key ? G.repo(v.key) : null; const base = 'github.com/' + (v.key || '');
  switch (v.page) {
    case 'home': return 'github.com';
    case 'new': return 'github.com/new';
    case 'profile': return 'github.com/' + (v.user || SS().login) + (v.ptab === 'repos' ? '?tab=repositories' : '');
    case 'explore': return 'github.com/explore';
    case 'notifications': return 'github.com/notifications';
    case 'gist-new': return 'gist.github.com';
    case 'gists': return 'gist.github.com/' + SS().login;
    case 'gist': return 'gist.github.com/' + SS().login + '/' + v.id;
    case 'site': return r ? G.pagesUrl(r).replace('https://', '') : '';
    case 'repo': {
      if (!r) return base;
      const br = v.br || r.def;
      const m = {
        code: () => ({ tree: v.path ? `/tree/${br}/${v.path}` : (v.br && v.br !== r.def ? `/tree/${br}` : ''), blob: `/blob/${br}/${v.path}`, edit: `/edit/${br}/${v.path}`, new: `/new/${br}`, upload: `/upload/${br}`, commits: `/commits/${br}`, commit: `/commit/${(v.id || '').slice(0, 7)}`, branches: '/branches', compare: `/compare/${v.base || r.def}...${v.hrepo && v.hrepo !== v.key ? v.hrepo.split('/')[0] + ':' : ''}${v.head || ''}`, releases: '/releases', 'release-new': '/releases/new', tags: '/tags' }[v.sub || 'tree']),
        issues: () => ({ list: '/issues', new: '/issues/new', view: '/issues/' + v.n, labels: '/labels', milestones: '/milestones' }[v.sub || 'list']),
        pulls: () => ({ list: '/pulls', view: `/pull/${v.n}${v.prtab && v.prtab !== 'conv' ? '/' + v.prtab : ''}`, resolve: `/pull/${v.n}/conflicts` }[v.sub || 'list']),
        actions: () => ({ list: '/actions', new: '/actions/new', run: '/actions/runs/' + v.id }[v.sub || 'list']),
        projects: () => (v.sub === 'view' ? '/projects/' + (v.id + 1) : '/projects'),
        wiki: () => '/wiki' + (v.sub === 'new' ? '/_new' : v.page2 ? '/' + v.page2.replace(/\s/g, '-') : ''),
        discussions: () => ({ list: '/discussions', new: '/discussions/new', view: '/discussions/' + v.n }[v.sub || 'list']),
        security: () => (v.sub === 'alert' ? '/security/dependabot/' + v.id : v.sub === 'dependabot' ? '/security/dependabot' : v.sub === 'secret' ? '/security/secret-scanning' : '/security'),
        settings: () => '/settings' + (v.sub && v.sub !== 'general' ? '/' + v.sub : ''),
        insights: () => '/pulse',
      }[v.tab || 'code'];
      return base + (m ? m() : '');
    }
  }
  return 'github.com';
};
V.go = (v, opt = {}) => {
  const S = SS();
  if (!opt.replace) { S.hist.push(S.view); if (S.hist.length > 60) S.hist.shift(); V.fwd = []; }
  S.view = v; V.ui.menu = null;
  if (!opt.keepUi) { V.ui.cmpForm = false; V.ui.confirmMerge = false; V.ui.review = false; }
  G.emit('nav', v);
  V.render(); const g = $('gh'); if (g && !opt.keepScroll) g.scrollTop = 0;
};
V.goRepo = (key, o = {}) => V.go({ page: 'repo', key, tab: 'code', ...o });
V.fwd = [];
V.back = () => { const S = SS(); if (!S.hist.length) return; V.fwd.push(S.view); S.view = S.hist.pop(); V.ui.menu = null; G.emit('nav', S.view); V.render(); };
V.forward = () => { const S = SS(); if (!V.fwd.length) return; S.hist.push(S.view); S.view = V.fwd.pop(); G.emit('nav', S.view); V.render(); };

/* ---------- 렌더 ---------- */
V.render = () => {
  const host = $('gh'); if (!host || !SS()) return;
  const keep = {}; host.querySelectorAll('input[id],textarea[id],select[id]').forEach(el => { if (el.type === 'checkbox' || el.type === 'radio') keep[el.id] = { c: el.checked }; else if (el.type !== 'file') keep[el.id] = { v: el.value }; });
  const act = document.activeElement; const focusId = act && host.contains(act) ? act.id : null; let sel = null; try { if (focusId) sel = [act.selectionStart, act.selectionEnd]; } catch (e) {}
  const sc = host.scrollTop;
  let html; try { html = V.page(); } catch (e) { console.error(e); html = `<div class="pad"><div class="flash err">화면을 그리다 문제가 생겼어요: ${esc(e.message)} <button class="btn" data-a="home">홈으로</button></div></div>`; }
  host.innerHTML = V.navbar() + `<div class="ghbody">${html}</div>` + V.codespace();
  host.scrollTop = sc;
  const sameUrl = V._lastUrl === V.url(); V._lastUrl = V.url();
  if (sameUrl) Object.entries(keep).forEach(([id, k]) => { const el = $(id); if (!el || el.dataset.fresh) return; if ('c' in k) el.checked = k.c; else if (el.value !== k.v && !el.dataset.nokeep) el.value = k.v; });
  if (focusId && $(focusId)) { const el = $(focusId); el.focus({ preventScroll: true }); try { if (sel && sel[0] != null) el.setSelectionRange(sel[0], sel[1]); } catch (e) {} }
  $('url').textContent = V.url();
  if (window.App) App.afterRender();
};
V.page = () => {
  const v = SS().view;
  if (v.page === 'repo' && !G.repo(v.key)) return V.notFound();
  return ({ home: V.home, new: V.newRepo, profile: V.profile, explore: V.explore, notifications: V.notifications, 'gist-new': V.gistNew, gists: V.gists, gist: V.gistView, site: V.site, repo: V.repoPage }[v.page] || V.home)();
};
V.notFound = () => `<div class="pad center"><div class="big404">404</div><h2>This is not the web page you are looking for.</h2><p class="muted">저장소가 없거나 삭제되었어요.</p><button class="btn" data-a="home">대시보드로</button></div>`;

V.navbar = () => {
  const S = SS(), m = V.ui.menu;
  const unread = (S.inbox || []).filter(x => !x.read).length;
  return `<nav class="ghnav">
    <button class="nav-ic" data-a="home" ${t('nav-home')} title="대시보드">☰</button>
    <a class="nav-logo" data-a="home" href="#"><span class="logo-mark">◆</span> GitHub <small>연습모드</small></a>
    <span class="nav-crumb">${S.view.page === 'repo' && S.view.key ? `<a href="#" data-a="goowner" data-u="${esc(S.view.key.split('/')[0])}">${esc(S.view.key.split('/')[0])}</a> / <a href="#" data-a="gorepo" data-k="${esc(S.view.key)}"><b>${esc(S.view.key.split('/')[1])}</b></a>` : S.view.page === 'profile' ? esc(S.view.user || S.login) : ''}</span>
    <div class="nav-right">
      <button class="nav-link" data-a="explore" ${t('nav-explore')}>🧭 Explore</button>
      <button class="nav-link" data-a="gists" ${t('nav-gists')}>📎 Gists</button>
      <div class="dd-wrap"><button class="nav-ic" data-a="menu" data-m="plus" ${t('plus')} title="새로 만들기">＋ ▾</button>
        ${m === 'plus' ? `<div class="dd right"><button data-a="newrepo" ${t('new-repo')}>📘 New repository</button><button data-a="gistnew" ${t('new-gist')}>📎 New gist</button><button data-a="importinfo">📥 Import repository</button></div>` : ''}</div>
      <button class="nav-ic" data-a="notifs" title="알림">🔔${unread ? `<span class="dot-n">${unread}</span>` : ''}</button>
      <div class="dd-wrap"><button class="nav-av" data-a="menu" data-m="me" ${t('avatar')}>${av(S.login, 26)}</button>
        ${m === 'me' ? `<div class="dd right"><div class="dd-h">Signed in as <b>${esc(S.login)}</b></div><button data-a="profile" ${t('your-profile')}>👤 Your profile</button><button data-a="profilerepos">📚 Your repositories</button><button data-a="gists">📎 Your gists</button><button data-a="stars">⭐ Your stars</button></div>` : ''}</div>
    </div></nav>`;
};

/* ---------- 대시보드 ---------- */
const myRepos = () => Object.values(SS().repos).filter(r => r.owner === SS().login).sort((a, b) => (G.c(b.branches[b.def])?.t || b.created) - (G.c(a.branches[a.def])?.t || a.created));
V.home = () => {
  const S = SS(); const repos = myRepos();
  return `<div class="dash">
    <aside class="dash-side"><div class="row-between"><h4>Top repositories</h4><button class="btn btn-primary btn-sm" data-a="newrepo" ${t('new-repo-side')}>${ICON.repo} New</button></div>
      <input class="inp" placeholder="Find a repository…" id="dash-find" data-live="1">
      <ul class="repo-mini">${repos.filter(r => !val('dash-find') || r.name.includes(val('dash-find'))).map(r => `<li>${av(r.owner, 16)} <a href="#" data-a="gorepo" data-k="${esc(G.key(r))}">${esc(G.key(r))}</a></li>`).join('') || '<li class="muted">아직 저장소가 없어요. 위 New 버튼으로 만들어 보세요!</li>'}</ul></aside>
    <section class="dash-main"><h3>Home</h3>
      <div class="card tip-card"><div class="tip-mascot">${App.mascot(46)}</div><div><b>깃토리의 한마디</b><p>${App.dailyTip()}</p></div></div>
      <h4 class="mt">최근 활동</h4>
      <div class="feed">${S.feed.slice(0, 12).map(f => `<div class="feed-it">${av(f.s.split(' ')[0], 20)} <span>${esc(f.s)}</span> <span class="muted small">${ago(f.t)}</span></div>`).join('') || '<p class="muted">활동이 생기면 여기에 표시돼요.</p>'}</div></section>
    <aside class="dash-right"><div class="card"><h4>🧭 Explore repositories</h4>${['octo-academy/word-bank', 'octo-academy/study-tips', 'dain-friend/hello-world'].map(k => { const r = G.repo(k); return `<div class="ex-it"><a href="#" data-a="gorepo" data-k="${k}">${k}</a><p class="small muted">${esc(r.desc)}</p><span class="small">⭐ ${r.stars.toLocaleString()}</span></div>`; }).join('')}</div></aside>
  </div>`;
};

/* ---------- 새 저장소 ---------- */
V.newRepo = () => {
  const S = SS(); const name = val('nr-name');
  const exists = name && G.repo(S.login + '/' + name);
  const bad = name && !/^[\w.-]+$/.test(name);
  return `<div class="narrow"><h2>Create a new repository</h2><p class="muted">저장소(repository)는 프로젝트의 모든 파일과 변경 기록을 담는 폴더예요.</p>
    <div class="form-row"><label>Owner *</label><div class="row"><span class="owner-chip">${av(S.login, 18)} ${esc(S.login)}</span> <span class="slash">/</span>
      <label class="sr">Repository name *</label><input class="inp" id="nr-name" ${t('nr-name')} placeholder="my-first-repo" data-live="1" autocomplete="off"></div>
      ${exists ? `<p class="err small">✗ ${esc(name)} 저장소가 이미 있어요.</p>` : bad ? '<p class="err small">✗ 영문, 숫자, - _ . 만 쓸 수 있어요.</p>' : name ? `<p class="ok small">✓ ${esc(name)} is available.</p>` : '<p class="small muted">짧고 기억하기 쉬운 이름이 좋아요. 띄어쓰기 대신 - 를 써요.</p>'}
      ${name && name.toLowerCase() === S.login.toLowerCase() ? `<div class="flash special">✨ <b>${esc(S.login)}/${esc(S.login)}</b> is a ✨special✨ repository! 이 저장소의 README.md는 <b>내 프로필 첫 화면</b>에 보여요.</div>` : ''}</div>
    <div class="form-row"><label>Description <span class="muted">(optional)</span></label><input class="inp" id="nr-desc" ${t('nr-desc')} placeholder="이 저장소를 한 줄로 소개해 주세요"></div>
    <div class="form-row radio-cards"><label class="rc"><input type="radio" name="vis" id="nr-pub" checked> 🌍 <b>Public</b><small>누구나 볼 수 있어요. 커밋은 내가 정한 사람만!</small></label>
      <label class="rc"><input type="radio" name="vis" id="nr-priv"> 🔒 <b>Private</b><small>나와 초대한 사람만 볼 수 있어요.</small></label></div>
    <div class="form-row"><h4>Initialize this repository with:</h4>
      <label class="cb"><input type="checkbox" id="nr-readme" ${t('nr-readme')}> <b>Add a README file</b> <small class="muted">저장소 소개글이에요. 처음엔 꼭 체크하는 걸 추천!</small></label>
      <div class="row gap"><label>Add .gitignore <select id="nr-gi" class="inp"><option value="">None</option><option>Node</option><option>Python</option><option>Java</option></select></label>
      <label>Choose a license <select id="nr-lic" class="inp"><option value="">None</option><option>MIT</option><option>Apache-2.0</option></select></label></div>
      <p class="small muted">.gitignore = Git이 무시할 파일 목록 · License = 다른 사람이 내 코드를 어떻게 써도 되는지 알려 주는 약속</p></div>
    <button class="btn btn-primary" data-a="createrepo" ${t('create-repo')} ${!name || exists || bad ? 'disabled' : ''}>Create repository</button></div>`;
};
V.A.createrepo = () => {
  const S = SS(); const name = val('nr-name').trim();
  if (!name || G.repo(S.login + '/' + name) || !/^[\w.-]+$/.test(name)) return;
  const r = G.repoNew({ owner: S.login, name, desc: val('nr-desc'), priv: chk('nr-priv'), readme: chk('nr-readme'), gitignore: val('nr-gi'), license: val('nr-lic') });
  G.bump(); G.feed(`${S.login} created repository ${S.login}/${name}`);
  App.toast(`📘 ${S.login}/${name} 저장소가 만들어졌어요!`);
  G.emit('repo:create', { key: G.key(r), name, readme: chk('nr-readme'), priv: r.priv, gi: val('nr-gi'), lic: val('nr-lic') });
  V.goRepo(G.key(r), {}, { replace: true });
};

/* ---------- 저장소 공통 ---------- */
V.repoPage = () => {
  const v = SS().view, r = G.repo(v.key), tab = v.tab || 'code';
  const body = { code: V.codeTab, issues: V.issuesTab, pulls: V.pullsTab, actions: V.actionsTab, projects: V.projectsTab, wiki: V.wikiTab, discussions: V.discTab, security: V.securityTab, settings: V.settingsTab, insights: V.insightsTab }[tab] || V.codeTab;
  return V.repoHead(r, tab) + `<div class="repo-body">${body(r, v)}</div>`;
};
V.repoHead = (r, tab) => {
  const S = SS(), key = G.key(r), own = r.owner === S.login;
  const openI = r.issues.filter(i => i.state === 'open').length, openP = r.pulls.filter(p => p.state === 'open').length;
  const alerts = r.alerts.filter(a => a.state === 'open').length;
  const tabs = [['code', '<b>&lt;&gt;</b> Code'], r.features.issues && ['issues', ICON.issue + ' Issues', openI], ['pulls', ICON.pr + ' Pull requests', openP], r.features.discussions && ['discussions', '💬 Discussions'], ['actions', '▶️ Actions'], r.features.projects && ['projects', '📋 Projects'], r.features.wiki && ['wiki', '📖 Wiki'], ['security', '🛡️ Security', alerts], ['insights', '📈 Insights'], own && ['settings', '⚙️ Settings']].filter(Boolean);
  return `<div class="repo-head"><div class="repo-title">${ICON.repo} <a href="#" data-a="goowner" data-u="${esc(r.owner)}">${esc(r.owner)}</a> / <a href="#" data-a="gorepo" data-k="${esc(key)}"><b>${esc(r.name)}</b></a> <span class="pill">${r.priv ? 'Private' : 'Public'}</span>
    ${r.forkOf ? `<div class="small muted forked">forked from <a href="#" data-a="gorepo" data-k="${esc(r.forkOf)}">${esc(r.forkOf)}</a></div>` : ''}</div>
    <div class="repo-acts">
      <button class="btn btn-sm ${S.watching[key] ? 'on' : ''}" data-a="watch" ${t('watch')}>👁 ${S.watching[key] ? 'Unwatch' : 'Watch'} <span class="cnt">${r.watchers}</span></button>
      <button class="btn btn-sm" data-a="fork" ${t('fork')} ${own ? 'title="내 저장소는 Fork할 필요가 없어요"' : ''}>🍴 Fork <span class="cnt">${r.forks}</span></button>
      <button class="btn btn-sm ${S.starred[key] ? 'on star' : ''}" data-a="star" ${t('star')}>${S.starred[key] ? '⭐ Starred' : '☆ Star'} <span class="cnt">${r.stars.toLocaleString()}</span></button></div></div>
    <div class="tabs repo-tabs">${tabs.map(([k, l, c]) => `<button class="tab ${tab === k ? 'sel' : ''}" data-a="tab" data-tab="${k}" ${t('tab-' + k)}>${l}${c ? ` <span class="cnt">${c}</span>` : ''}</button>`).join('')}</div>`;
};
const repoV = (o = {}) => { const v = SS().view; V.go({ page: 'repo', key: v.key, tab: v.tab, ...o }); };
V.repoV = repoV;

/* ---------- Code 탭 ---------- */
const dirList = (tree, path) => {
  const pre = path ? path + '/' : ''; const ent = {};
  Object.keys(tree).filter(p => p.startsWith(pre)).forEach(p => { const rest = p.slice(pre.length); const i = rest.indexOf('/'); if (i > 0) ent[rest.slice(0, i)] = 'dir'; else ent[rest] = 'file'; });
  return Object.entries(ent).sort((a, b) => (a[1] === b[1] ? a[0].localeCompare(b[0]) : a[1] === 'dir' ? -1 : 1));
};
const lastCommitFor = (tip, path) => {
  let c = G.c(tip); const pre = path;
  while (c) { const par = G.c(c.p[0]); const changed = Object.keys({ ...c.tree, ...(par?.tree || {}) }).some(p => (p === pre || p.startsWith(pre + '/')) && c.tree[p] !== par?.tree[p]); if (changed || !par) return c; c = par; }
  return null;
};
V.codeTab = (r, v) => {
  const sub = v.sub || 'tree';
  return ({ tree: V.codeTree, blob: V.blob, edit: V.editor, new: V.editor, upload: V.upload, commits: V.commits, commit: V.commitView, branches: V.branchesPage, compare: V.compare, releases: V.releases, 'release-new': V.releaseNew, tags: V.tagsPage }[sub] || V.codeTree)(r, v);
};
V.brMenu = (r, br, mode = 'code') => {
  const open = V.ui.menu === 'br'; const f = val('br-filter').trim();
  const list = Object.keys(r.branches).filter(b => !f || b.includes(f));
  const own = r.owner === SS().login || r.collab.some(c => c.name === SS().login && c.status === 'accepted');
  return `<div class="dd-wrap"><button class="btn btn-sm br-btn" data-a="menu" data-m="br" ${t('branch-btn')}>${ICON.branch} <b>${esc(br)}</b> ▾</button>
  ${open ? `<div class="dd br-dd"><div class="dd-h">Switch branches/tags</div><input class="inp" id="br-filter" data-live="1" ${t('br-filter')} placeholder="Find or create a branch…" autocomplete="off">
    <div class="dd-list">${list.map(b => `<button data-a="setbr" data-br="${esc(b)}">${b === br ? '✓ ' : '&nbsp;&nbsp; '}${esc(b)} ${b === r.def ? '<span class="pill sm">default</span>' : ''}</button>`).join('')}
    ${f && !r.branches[f] && own && /^[\w./-]+$/.test(f) ? `<button class="create-br" data-a="mkbr" data-br="${esc(f)}" ${t('create-branch')}>${ICON.branch} Create branch: <b>${esc(f)}</b> from '${esc(br)}'</button>` : ''}
    ${f && !r.branches[f] && !/^[\w./-]+$/.test(f) ? '<div class="small err pad-s">브랜치 이름에는 영문, 숫자, - _ / . 만 써요.</div>' : ''}
    ${!list.length && !f ? '<div class="muted small pad-s">브랜치가 없어요</div>' : ''}</div>
    <div class="dd-foot"><a href="#" data-a="sub" data-sub="branches">View all branches</a></div></div>` : ''}</div>`;
};
V.codeTree = (r, v) => {
  const S = SS(), key = G.key(r), br = r.branches[v.br] ? v.br : r.def, tip = r.branches[br], path = v.path || '';
  if (!tip) return V.emptyRepo(r);
  const tree = G.treeOf(tip); const ents = dirList(tree, path);
  const lc = G.c(tip); const nCommits = G.anc(tip).size;
  const own = r.owner === S.login;
  let banner = '';
  const rc = r.recent;
  if (own && rc && r.branches[rc.br] && rc.br !== r.def && Date.now() - rc.t < 36e5 && !r.pulls.some(p => p.state === 'open' && p.head === rc.br && p.hrepo === key) && G.ahead(r.branches[r.def], r.branches[rc.br]).length)
    banner = `<div class="flash warn row-between"><span>${ICON.branch} <b>${esc(rc.br)}</b> had recent pushes ${ago(rc.t)}</span><button class="btn btn-primary btn-sm" data-a="cmpbanner" data-br="${esc(rc.br)}" ${t('compare-pr')}>Compare &amp; pull request</button></div>`;
  const fs = G.forkStatus(key);
  const forkBar = fs ? `<div class="fork-bar row-between"><span>This branch is ${fs.ahead || fs.behind ? `${fs.ahead ? `<b>${fs.ahead} commit${fs.ahead > 1 ? 's' : ''} ahead of</b>` : ''}${fs.ahead && fs.behind ? ', ' : ''}${fs.behind ? `<b>${fs.behind} commit${fs.behind > 1 ? 's' : ''} behind</b>` : ''} <a href="#" data-a="gorepo" data-k="${esc(r.forkOf)}">${esc(r.forkOf)}</a>:${esc(fs.up.def)}` : `up to date with <a href="#" data-a="gorepo" data-k="${esc(r.forkOf)}">${esc(r.forkOf)}</a>:${esc(fs.up.def)}`}.</span>
    <span class="row gap"><button class="btn btn-sm" data-a="contribute" ${t('contribute')} ${fs.ahead ? '' : 'disabled title="먼저 커밋을 해야 기여할 수 있어요"'}>${ICON.pr} Contribute</button><button class="btn btn-sm" data-a="syncfork" ${t('sync-fork')} ${fs.behind ? '' : 'disabled'}>🔄 Sync fork</button></span></div>` : '';
  const readmePath = (path ? path + '/' : '') + 'README.md';
  const crumbs = path ? `<div class="crumbs"><a href="#" data-a="opendir" data-p="">${esc(r.name)}</a>${path.split('/').map((p, i, a) => ` / <a href="#" data-a="opendir" data-p="${esc(a.slice(0, i + 1).join('/'))}">${esc(p)}</a>`).join('')}</div>` : '';
  const ntags = Object.keys(r.tags).length;
  return `${banner}<div class="code-grid"><div class="code-main">
    <div class="code-bar">${V.brMenu(r, br)} <a href="#" class="muted small" data-a="sub" data-sub="branches" ${t('branches-link')}>${ICON.branch} <b>${Object.keys(r.branches).length}</b> Branch${Object.keys(r.branches).length > 1 ? 'es' : ''}</a> <a href="#" class="muted small" data-a="sub" data-sub="tags">🏷 <b>${ntags}</b> Tags</a>
      <span class="grow"></span>
      <div class="dd-wrap"><button class="btn btn-sm" data-a="menu" data-m="addfile" ${t('add-file')}>＋ Add file ▾</button>${V.ui.menu === 'addfile' ? `<div class="dd right"><button data-a="newfile" ${t('create-file')}>📄 Create new file</button><button data-a="uploadpage" ${t('upload-files')}>⬆️ Upload files</button></div>` : ''}</div>
      <div class="dd-wrap"><button class="btn btn-sm btn-primary" data-a="menu" data-m="clone" ${t('code-btn')}>&lt;&gt; Code ▾</button>${V.ui.menu === 'clone' ? V.cloneMenu(r) : ''}</div></div>
    ${forkBar}${crumbs}
    <div class="files"><div class="files-head">${av(lc.a, 20)} <b>${esc(lc.a)}</b> <a href="#" data-a="opencommit" data-id="${lc.id}" class="cmsg">${esc(lc.m)}</a><span class="grow"></span><code class="muted small">${lc.id.slice(0, 7)}</code> · <span class="muted small">${ago(lc.t)}</span> · <a href="#" data-a="sub" data-sub="commits" ${t('commits-link')}>🕘 <b>${nCommits}</b> Commit${nCommits > 1 ? 's' : ''}</a></div>
    ${path ? `<div class="file-row"><a href="#" data-a="opendir" data-p="${esc(path.split('/').slice(0, -1).join('/'))}">📁 ..</a></div>` : ''}
    ${ents.map(([n, kind]) => { const full = (path ? path + '/' : '') + n; const c = lastCommitFor(tip, full); return `<div class="file-row">${kind === 'dir' ? `<a href="#" data-a="opendir" data-p="${esc(full)}">📁 ${esc(n)}</a>` : `<a href="#" data-a="openfile" data-p="${esc(full)}" ${t('file-' + full)}>📄 ${esc(n)}</a>`}<span class="muted small fr-msg">${c ? esc(c.m) : ''}</span><span class="muted small">${c ? ago(c.t) : ''}</span></div>`; }).join('')}</div>
    ${tree[readmePath] !== undefined ? `<div class="readme"><div class="readme-h">📖 README <button class="btn-ic" data-a="editpath" data-p="${esc(readmePath)}" title="README 편집" ${t('edit-readme')}>✏️</button></div>${V.md(tree[readmePath], { tree, repo: key })}</div>` : !path ? `<div class="readme empty-readme"><p>Add a README with an overview of your project.</p><button class="btn btn-sm" data-a="addreadme" ${t('add-readme')}>Add a README</button></div>` : ''}
  </div><aside class="code-side"><h4>About</h4><p>${esc(r.desc) || '<span class="muted">No description, website, or topics provided.</span>'}</p>
    ${r.pages?.status === 'built' ? `<p>🔗 <a href="#" data-a="visitsite">${esc(G.pagesUrl(r).replace('https://', ''))}</a></p>` : ''}
    <p class="small muted">📖 Readme ${tree.LICENSE ? '<br>⚖️ ' + (/MIT/.test(tree.LICENSE) ? 'MIT' : 'Apache-2.0') + ' license' : ''}<br>⭐ ${r.stars} stars<br>👁 ${r.watchers} watching<br>🍴 ${r.forks} forks</p>
    <h4><a href="#" data-a="sub" data-sub="releases" ${t('releases-link')}>Releases</a> <span class="cnt">${r.releases.length}</span></h4>${r.releases[0] ? `<p class="small">🏷 <b>${esc(r.releases[0].title)}</b> <span class="pill sm green">Latest</span></p>` : `<p class="small"><a href="#" data-a="newrelease" ${t('create-release')}>Create a new release</a></p>`}
    ${r.pages?.status === 'built' ? '<h4>Deployments</h4><p class="small">🟢 github-pages</p>' : ''}
    <h4>Languages</h4>${V.langBar(tree)}</aside></div>`;
};
V.langBar = tree => {
  const ext = { md: ['Markdown', '#083fa1'], html: ['HTML', '#e34c26'], css: ['CSS', '#563d7c'], js: ['JavaScript', '#f1e05a'], py: ['Python', '#3572A5'], yml: ['YAML', '#cb171e'], yaml: ['YAML', '#cb171e'], json: ['JSON', '#292929'], txt: ['Text', '#999'] };
  const cnt = {}; let tot = 0;
  Object.entries(tree).forEach(([p, c]) => { const e = ext[p.split('.').pop()]; if (!e || G.isBin(c)) return; cnt[e[0]] = cnt[e[0]] || { n: 0, c: e[1] }; cnt[e[0]].n += c.length + 1; tot += c.length + 1; });
  const arr = Object.entries(cnt).sort((a, b) => b[1].n - a[1].n);
  if (!tot) return '<p class="small muted">—</p>';
  return `<div class="langbar">${arr.map(([n, o]) => `<span style="width:${(o.n / tot) * 100}%;background:${o.c}"></span>`).join('')}</div><p class="small">${arr.map(([n, o]) => `<span class="ldot" style="background:${o.c}"></span>${n} ${((o.n / tot) * 100).toFixed(1)}%`).join(' &nbsp; ')}</p>`;
};
V.cloneMenu = r => {
  const url = `https://github.com/${G.key(r)}.git`; const cs = V.ui.cloneTab === 'cs';
  return `<div class="dd right clone-dd"><div class="tabs sm"><button class="tab ${!cs ? 'sel' : ''}" data-a="clonetab" data-v="local">Local</button><button class="tab ${cs ? 'sel' : ''}" data-a="clonetab" data-v="cs" ${t('cs-tab')}>Codespaces</button></div>
  ${cs ? `<div class="pad-s"><p class="small"><b>Codespaces</b> = 브라우저 안에서 바로 열리는 클라우드 코딩 환경이에요. 설치 없이 VS Code처럼 코딩할 수 있어요.</p><button class="btn btn-primary btn-sm full" data-a="cscreate" ${t('cs-create')}>Create codespace on ${esc(SS().view.br && r.branches[SS().view.br] ? SS().view.br : r.def)}</button></div>`
    : `<div class="pad-s"><div class="small"><b>⧉ Clone</b> · HTTPS</div><div class="row"><input class="inp mono" readonly value="${esc(url)}" id="clone-url"><button class="btn btn-sm" data-a="copyclone" ${t('copy-clone')} title="복사">📋</button></div>
    <p class="small muted">이 주소로 <code>git clone</code> 하면 내 컴퓨터에 저장소를 통째로 받아요.</p><button class="btn btn-sm full" data-a="zipinfo">📦 Download ZIP</button></div>`}</div>`;
};
V.emptyRepo = r => {
  const url = `https://github.com/${G.key(r)}.git`;
  return `<div class="empty-repo"><div class="card"><h3>Quick setup — 빈 저장소예요</h3><p class="small"><button class="btn btn-sm" data-a="newfile" ${t('create-file')}>📄 creating a new file</button> 또는 <button class="btn btn-sm" data-a="uploadpage">⬆️ uploading an existing file</button> 로 시작하거나, 아래처럼 터미널에서 올릴 수 있어요.</p>
    <div class="row"><input class="inp mono" readonly value="${esc(url)}"><button class="btn btn-sm" data-a="copytext" data-v="${esc(url)}">📋</button></div>
    <h4>…or create a new repository on the command line</h4><pre class="code-blk">echo "# ${esc(r.name)}" >> README.md\ngit init\ngit add README.md\ngit commit -m "first commit"\ngit branch -M main\ngit remote add origin ${esc(url)}\ngit push -u origin main</pre>
    <h4>…or push an existing repository from the command line</h4><pre class="code-blk">git remote add origin ${esc(url)}\ngit branch -M main\ngit push -u origin main</pre></div></div>`;
};

/* 파일 보기 */
V.blob = (r, v) => {
  const br = r.branches[v.br] ? v.br : r.def, tip = r.branches[br]; const tree = G.treeOf(tip); const p = v.path; const c = tree[p];
  if (c === undefined) return `<div class="flash err">파일 "${esc(p)}"을(를) ${esc(br)} 브랜치에서 찾을 수 없어요. <button class="btn btn-sm" data-a="opendir" data-p="">파일 목록으로</button></div>`;
  const lc = lastCommitFor(tip, p); const isMd = /\.md$/i.test(p);
  const showCode = V.ui.blobCode || !isMd; const bin = G.isBin(c);
  return `<div class="code-bar">${V.brMenu(r, br)}<div class="crumbs"><a href="#" data-a="opendir" data-p="">${esc(r.name)}</a>${p.split('/').map((x, i, a) => i < a.length - 1 ? ` / <a href="#" data-a="opendir" data-p="${esc(a.slice(0, i + 1).join('/'))}">${esc(x)}</a>` : ` / <b>${esc(x)}</b>`).join('')}</div></div>
    <div class="files-head file-commit">${av(lc.a, 20)} <b>${esc(lc.a)}</b> <span class="cmsg">${esc(lc.m)}</span><span class="grow"></span><code class="small muted">${lc.id.slice(0, 7)}</code> · <a href="#" data-a="filehistory">🕘 History</a></div>
    <div class="blob"><div class="blob-bar">${isMd ? `<div class="seg"><button class="${!showCode ? 'sel' : ''}" data-a="blobmode" data-v="0">Preview</button><button class="${showCode ? 'sel' : ''}" data-a="blobmode" data-v="1">Code</button></div>` : ''}<span class="muted small">${bin ? '이미지' : G.lines(c).length + ' lines · ' + c.length + ' Bytes'}</span><span class="grow"></span>
      <button class="btn-ic" data-a="copytext" data-v="${bin ? '' : esc(c)}" title="Copy raw">📋</button>${bin ? '' : `<button class="btn-ic" data-a="editfile" ${t('edit-file')} title="Edit this file">✏️</button>`}<button class="btn-ic" data-a="delfile" ${t('delete-file')} title="Delete file">🗑️</button></div>
    ${bin ? `<div class="pad center"><img class="blob-img" src="${esc(c)}" alt="${esc(p)}"></div>` : showCode ? `<table class="codeview">${G.lines(c).map((l, i) => `<tr><td class="ln">${i + 1}</td><td><pre>${esc(l) || ' '}</pre></td></tr>`).join('')}</table>` : `<div class="pad">${V.md(c, { tree, repo: G.key(r) })}</div>`}</div>`;
};

/* 편집기 */
V.editor = (r, v) => {
  const S = SS(), br = r.branches[v.br] ? v.br : r.def, isNew = v.sub === 'new';
  const tree = G.tree(r, br);
  const dkey = G.key(r) + '|' + br + '|' + (isNew ? '#new' : v.path);
  if (V.ui.draftFor !== dkey) { V.ui.draftFor = dkey; V.ui.draft = isNew ? (V.ui.preset?.content ?? '') : tree[v.path] ?? ''; V.ui.draftPath = isNew ? (V.ui.preset?.path ?? '') : v.path; V.ui.edTab = 'edit'; V.ui.preset = null; }
  const path = V.ui.draftPath; const tab = V.ui.edTab || 'edit';
  const isMd = /\.md$/i.test(path || '');
  const prot = r.protect[br]?.pr && r.owner === S.login;
  return `<div class="code-bar"><div class="crumbs"><a href="#" data-a="opendir" data-p="">${esc(r.name)}</a> / ${isNew ? `<input class="inp inp-path" id="ed-path" ${t('ed-path')} data-a2="draftpath" placeholder="Name your file..." value="${esc(path)}" data-fresh="1">` : `<b>${esc(path)}</b>`} <span class="muted small">in</span> <span class="pill">${ICON.branch} ${esc(br)}</span></div>
    <span class="grow"></span><button class="btn btn-sm" data-a="canceledit">Cancel changes</button><button class="btn btn-primary btn-sm" data-a="commitdlg" ${t('commit-btn')}>Commit changes...</button></div>
    ${isNew ? '<p class="small muted">💡 폴더를 만들려면 이름에 / 를 넣어요. 예: <code>docs/guide.md</code>, <code>.github/workflows/hello.yml</code></p>' : ''}
    ${prot ? `<div class="flash warn small">🔒 <b>${esc(br)}</b>는 보호된 브랜치예요. 커밋할 때 새 브랜치를 만들어 Pull Request로 보내야 해요.</div>` : ''}
    <div class="editor"><div class="tabs sm"><button class="tab ${tab === 'edit' ? 'sel' : ''}" data-a="edtab" data-v="edit">Edit</button><button class="tab ${tab === 'preview' ? 'sel' : ''}" data-a="edtab" data-v="preview" ${t('preview-tab')}>Preview</button><span class="grow"></span><span class="small muted pad-s">${isMd ? 'Markdown 지원 ✓' : 'Spaces · 2'}</span></div>
    ${tab === 'edit' ? `<textarea id="ed-content" class="code-area" ${t('ed-content')} data-a2="draft" rows="18" spellcheck="false" placeholder="Enter file contents here" data-fresh="1">${esc(V.ui.draft)}</textarea>`
      : `<div class="pad preview">${isMd || !path ? V.md(V.ui.draft, { tree, repo: G.key(r) }) : `<pre class="code-blk">${esc(V.ui.draft)}</pre>`}${G.dtree({ a: tree[path] }, { a: V.ui.draft }).length && !isNew ? `<h4 class="mt">변경 내용 (diff)</h4>${V.diffBlock(tree[path], V.ui.draft)}` : ''}</div>`}</div>
    ${isMd && tab === 'edit' ? `<details class="md-help"><summary>📝 마크다운 문법 도우미</summary><table class="mdtab"><tr><td><code># 제목</code></td><td>큰 제목</td><td><code>**굵게**</code></td><td><b>굵게</b></td></tr><tr><td><code>- 항목</code></td><td>• 목록</td><td><code>*기울임*</code></td><td><i>기울임</i></td></tr><tr><td><code>[글](https://..)</code></td><td>링크</td><td><code>\`코드\`</code></td><td><code>코드</code></td></tr><tr><td><code>- [ ] 할 일</code></td><td>☐ 체크박스</td><td><code>&gt; 인용</code></td><td>인용문</td></tr><tr><td><code>![설명](이미지주소)</code></td><td>이미지</td><td><code>:tada:</code></td><td>🎉</td></tr></table></details>` : ''}`;
};
V.commitDialog = (r, br, isNew) => {
  const S = SS(); const path = V.ui.draftPath;
  const prot = r.protect[br]?.pr && r.owner === S.login;
  const def = isNew ? `Create ${path || 'file'}` : `Update ${path}`;
  let nb = S.login + '-patch-1', i = 1; while (r.branches[nb]) nb = S.login + '-patch-' + ++i;
  App.modal(`<h3>Commit changes</h3>
    <label class="lbl">Commit message</label><input class="inp" id="cm-msg" ${t('cm-msg')} value="${esc(def)}">
    <label class="lbl">Extended description</label><textarea class="inp" id="cm-desc" rows="3" placeholder="Add an optional extended description..."></textarea>
    <p class="small muted">💡 좋은 커밋 메시지 = "무엇을, 왜" 바꿨는지 짧게! 예: <code>Add greeting to README</code>, <code>Fix typo in hello.txt</code></p>
    <label class="cb"><input type="radio" name="cm-mode" id="cm-direct" ${prot ? 'disabled' : 'checked'}> ${ICON.commit} Commit directly to the <b>${esc(br)}</b> branch ${prot ? '<span class="err small">(보호된 브랜치라 불가)</span>' : ''}</label>
    <label class="cb"><input type="radio" name="cm-mode" id="cm-newbr" ${prot ? 'checked' : ''} ${t('cm-newbr')}> ${ICON.pr} Create a <b>new branch</b> for this commit and start a pull request</label>
    <input class="inp mono" id="cm-brname" value="${esc(nb)}" ${t('cm-brname')}>
    <div class="row-end"><button class="btn" data-a="modal-close">Cancel</button><button class="btn btn-primary" data-a="docommit" ${t('cm-commit')}>Commit changes</button></div>`);
};
V.A.commitdlg = () => {
  const v = SS().view, r = G.repo(v.key), br = r.branches[v.br] ? v.br : r.def;
  if ($('ed-content')) V.ui.draft = $('ed-content').value;
  if ($('ed-path')) V.ui.draftPath = $('ed-path').value.trim();
  if (!V.ui.draftPath) { App.toast('⚠️ 파일 이름을 먼저 적어 주세요!', 'warn'); $('ed-path')?.focus(); return; }
  if (/^\/|\.\.|\/\/|\/$/.test(V.ui.draftPath)) { App.toast('⚠️ 파일 이름이 올바르지 않아요.', 'warn'); return; }
  if (v.sub === 'new' && G.tree(r, br)[V.ui.draftPath] !== undefined) { App.toast(`⚠️ ${V.ui.draftPath} 파일이 이미 있어요. 다른 이름을 써 주세요.`, 'warn'); return; }
  V.commitDialog(r, br, v.sub === 'new');
};
V.A.docommit = () => {
  const S = SS(), v = S.view, key = v.key, r = G.repo(key); let br = r.branches[v.br] ? v.br : r.def;
  const msg = val('cm-msg').trim() || 'Update ' + V.ui.draftPath; const desc = val('cm-desc');
  const newBr = chk('cm-newbr'); const nb = val('cm-brname').trim();
  const isNew = v.sub === 'new'; const path = V.ui.draftPath;
  let content = V.ui.draft; if (content && !content.endsWith('\n')) content += '\n';
  if (newBr) { if (!nb || r.branches[nb] || !/^[\w./-]+$/.test(nb)) { App.toast('⚠️ 새 브랜치 이름을 확인해 주세요 (이미 있거나 올바르지 않아요).', 'warn'); return; } G.branchNew(key, nb, br); }
  const target = newBr ? nb : br;
  const res = G.commitTo(key, target, { [path]: content }, msg, desc);
  if (!res.ok) {
    if (newBr) G.branchDel(key, nb);
    if (res.secret) { App.closeModal(); return V.secretBlocked(res.secret); }
    if (res.protected) { App.toast('🔒 보호된 브랜치에는 바로 커밋할 수 없어요. "new branch" 옵션을 고르세요.', 'warn'); return; }
    return;
  }
  App.closeModal(); V.ui.draftFor = null;
  App.toast(`✅ 커밋 완료! "${msg}"`);
  G.emit('commit', { key, br: target, id: res.id, path, isNew, content, via: 'web', msg, newBranch: newBr ? nb : null });
  if (newBr) { V.go({ page: 'repo', key, tab: 'code', sub: 'compare', base: br, head: nb }); V.ui.cmpForm = true; V.render(); }
  else V.go({ page: 'repo', key, tab: 'code', sub: 'blob', path, br: target === r.def ? undefined : target }, { replace: true });
};
V.secretBlocked = file => {
  App.modal(`<div class="secret-modal"><h3>🛑 Secret detected! 커밋이 차단됐어요</h3><p><b>GitHub Push Protection</b>이 <code>${esc(file)}</code> 안에서 <b>GitHub Personal Access Token</b>처럼 보이는 비밀 값을 찾았어요.</p>
    <div class="flash err small">비밀 토큰이 공개 저장소에 올라가면 누구나 내 계정으로 무엇이든 할 수 있게 돼요! 실제로 해커들은 GitHub에서 유출된 키를 자동으로 수집해요.</div>
    <p><b>어떻게 해야 할까요?</b></p><ul><li>파일에서 토큰을 지우고 다시 커밋하세요.</li><li>토큰은 <b>Settings → Secrets and variables</b> 같은 안전한 곳에 보관해요.</li><li>이미 유출됐다면 즉시 토큰을 <b>폐기(revoke)</b>하세요.</li></ul>
    <div class="row-end"><button class="btn btn-primary" data-a="modal-close" ${t('secret-ok')}>알겠어요, 토큰을 지울게요</button></div></div>`);
};
V.A.canceledit = () => { V.ui.draftFor = null; const v = SS().view; if (v.sub === 'new') repoV({ sub: 'tree', br: v.br }); else repoV({ sub: 'blob', path: v.path, br: v.br }); };

/* 업로드 */
V.SAMPLES = {
  'notes.md': '# 공부 노트\n\n- Git은 **버전 관리** 도구\n- GitHub는 Git 저장소를 올려 두는 **클라우드**\n',
  'cat.svg': 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"><rect width="120" height="100" fill="#fff8e1"/><circle cx="60" cy="58" r="30" fill="#f4a261"/><polygon points="34,40 40,12 54,32" fill="#f4a261"/><polygon points="86,40 80,12 66,32" fill="#f4a261"/><circle cx="50" cy="55" r="4"/><circle cx="70" cy="55" r="4"/><path d="M55 66 Q60 71 65 66" stroke="#000" fill="none" stroke-width="2"/></svg>'),
  'todo.txt': '1. README 꾸미기\n2. 브랜치 만들어 보기\n3. Pull Request 보내기\n',
};
V.upload = (r, v) => {
  const br = r.branches[v.br] ? v.br : r.def; const ups = V.ui.uploads || (V.ui.uploads = []);
  return `<div class="narrow"><div class="crumbs"><a href="#" data-a="opendir" data-p="">${esc(r.name)}</a> / <b>Upload files</b> <span class="pill">${ICON.branch} ${esc(br)}</span></div>
    <label class="dropzone" id="dropzone" ${t('dropzone')}><input type="file" id="up-file" multiple hidden><div class="dz-ic">📂</div><b>Drag files here to add them to your repository</b><span class="small muted">또는 <u>choose your files</u> (텍스트·이미지, 300KB 이하)</span></label>
    <div class="small">연습용 샘플 파일: ${Object.keys(V.SAMPLES).map(n => `<button class="chip" data-a="upsample" data-f="${n}" ${t('sample-' + n)}>＋ ${n}</button>`).join(' ')}</div>
    ${ups.length ? `<div class="up-list">${ups.map((u, i) => `<div class="row-between up-it"><span>${G.isBin(u.content) ? '🖼️' : '📄'} ${esc(u.name)}</span><button class="btn-ic" data-a="uprm" data-i="${i}">✕</button></div>`).join('')}</div>` : ''}
    <div class="card mt"><h4>Commit changes</h4><input class="inp" id="up-msg" placeholder="Add files via upload" ${t('up-msg')}><textarea class="inp" id="up-desc" rows="2" placeholder="Add an optional extended description..."></textarea>
    <div class="row-end"><button class="btn" data-a="opendir" data-p="">Cancel</button><button class="btn btn-primary" data-a="doupload" ${t('up-commit')} ${ups.length ? '' : 'disabled'}>Commit changes</button></div></div></div>`;
};
V.A.upsample = el => { const n = el.dataset.f; const ups = V.ui.uploads || (V.ui.uploads = []); if (!ups.some(u => u.name === n)) ups.push({ name: n, content: V.SAMPLES[n] }); V.render(); };
V.A.uprm = el => { V.ui.uploads.splice(+el.dataset.i, 1); V.render(); };
V.readFiles = list => {
  [...list].forEach(f => {
    if (f.size > 300 * 1024) { App.toast(`⚠️ ${f.name}: 300KB 이하 파일만 올릴 수 있어요 (연습장 제한).`, 'warn'); return; }
    const rd = new FileReader(); const isImg = /^image\//.test(f.type);
    rd.onload = () => { (V.ui.uploads = V.ui.uploads || []).push({ name: f.name, content: rd.result }); V.render(); };
    if (isImg) rd.readAsDataURL(f); else rd.readAsText(f);
  });
};
V.A.doupload = () => {
  const v = SS().view, key = v.key, r = G.repo(key), br = r.branches[v.br] ? v.br : r.def; const ups = V.ui.uploads || [];
  if (!ups.length) return;
  const ch = {}; ups.forEach(u => { ch[u.name] = G.isBin(u.content) || u.content.endsWith('\n') ? u.content : u.content + '\n'; });
  const msg = val('up-msg').trim() || 'Add files via upload';
  const res = G.commitTo(key, br, ch, msg, val('up-desc'));
  if (!res.ok) { if (res.secret) return V.secretBlocked(res.secret); if (res.protected) return App.toast('🔒 보호된 브랜치에는 바로 업로드할 수 없어요.', 'warn'); return; }
  V.ui.uploads = [];
  App.toast(`⬆️ 파일 ${Object.keys(ch).length}개 업로드 완료!`);
  G.emit('commit', { key, br, id: res.id, via: 'upload', files: Object.keys(ch), msg });
  repoV({ sub: 'tree', br: v.br });
};

/* 커밋 기록 */
V.commits = (r, v) => {
  const br = r.branches[v.br] ? v.br : r.def; let list = [...G.anc(r.branches[br])].map(G.c).sort((a, b) => b.t - a.t);
  if (v.path) list = list.filter(c => { const p = G.c(c.p[0]); return c.tree[v.path] !== p?.tree[v.path]; });
  const groups = {}; list.forEach(c => { const d = new Date(c.t).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }); (groups[d] = groups[d] || []).push(c); });
  return `<div class="row-between"><h3>🕘 Commits${v.path ? ` <span class="muted small">— ${esc(v.path)}</span>` : ''}</h3>${V.brMenu(r, br)}</div>
    <p class="small muted">커밋 = 저장소의 "세이브 포인트". 누가, 언제, 무엇을 바꿨는지 모두 기록돼요. 커밋을 클릭하면 바뀐 내용을 볼 수 있어요.</p>
    ${Object.entries(groups).map(([d, cs]) => `<div class="cgroup"><div class="cg-h">${ICON.commit} Commits on ${d}</div>${cs.map(c => `<div class="commit-row"><div><a href="#" data-a="opencommit" data-id="${c.id}" class="cmsg" ${t('commit-item')}><b>${esc(c.m)}</b></a><div class="small muted">${av(c.a, 16)} <b>${esc(c.a)}</b> committed ${ago(c.t)}${c.p.length > 1 ? ' · <span class="pill sm">merge</span>' : ''}</div></div><button class="btn btn-sm mono" data-a="opencommit" data-id="${c.id}">${c.id.slice(0, 7)}</button></div>`).join('')}</div>`).join('')}`;
};
V.diffBlock = (a, b, o = {}) => {
  if (G.isBin(a) || G.isBin(b)) return `<div class="pad small">${a ? `<img src="${esc(a)}" class="thumb">` : ''} ${a && b ? '→' : ''} ${b ? `<img src="${esc(b)}" class="thumb">` : ''} <span class="muted">(이미지 파일)</span></div>`;
  const rows = G.lineDiff(a, b);
  return `<table class="diff">${rows.map((x, i) => `<tr class="d${x.t === '+' ? 'add' : x.t === '-' ? 'del' : ''}"><td class="ln">${x.an || ''}</td><td class="ln">${x.bn || ''}</td>${o.comment ? `<td class="ln addc">${x.t !== '-' ? `<button class="plus-c" data-a="linecomment" data-f="${esc(o.file)}" data-l="${x.bn}" title="이 줄에 코멘트" ${i === rows.findIndex(y => y.t === '+') ? t('line-plus') : ''}>+</button>` : ''}</td>` : ''}<td><pre>${x.t === ' ' ? ' ' : x.t} ${esc(x.s)}</pre>${o.comments ? o.comments.filter(c => c.file === o.file && c.line === x.bn && x.t !== '-').map(c => `<div class="line-cm">${av(c.a, 18)} <b>${esc(c.a)}</b> ${V.md(c.body)}</div>`).join('') : ''}</td></tr>`).join('')}</table>`;
};
V.fileDiffs = (ds, o = {}) => ds.map(d => { const s = G.stat(d.a, d.b); return `<div class="fdiff"><div class="fdiff-h"><span class="dstat"><span class="g">+${s.add}</span> <span class="r">-${s.del}</span></span> <b>${esc(d.p)}</b> <span class="pill sm ${d.k}">${{ add: 'added', del: 'deleted', mod: 'modified' }[d.k]}</span></div>${V.diffBlock(d.a, d.b, { ...o, file: d.p })}</div>`; }).join('') || '<p class="muted pad">변경된 파일이 없어요.</p>';
V.commitView = (r, v) => {
  const c = G.c(v.id); if (!c) return '<div class="flash err">커밋을 찾을 수 없어요.</div>';
  const ds = G.dtree(G.treeOf(c.p[0]), c.tree);
  return `<div class="card"><h3>${esc(c.m)}</h3>${c.d ? `<pre class="small">${esc(c.d)}</pre>` : ''}<div class="small muted">${av(c.a, 18)} <b>${esc(c.a)}</b> committed ${ago(c.t)} · commit <code>${c.id.slice(0, 7)}</code> ${c.p.length ? `· parent${c.p.length > 1 ? 's' : ''} ${c.p.map(p => `<a href="#" data-a="opencommit" data-id="${p}"><code>${p.slice(0, 7)}</code></a>`).join(' + ')}` : '· (첫 커밋)'}</div></div>
    <p class="small muted">초록색 줄(+)은 추가, 빨간색 줄(-)은 삭제된 내용이에요. 이렇게 "무엇이 바뀌었는지" 보는 걸 <b>diff</b>라고 해요.</p>
    <p class="small"><b>${ds.length}</b> file${ds.length !== 1 ? 's' : ''} changed</p>${V.fileDiffs(ds)}`;
};

/* 브랜치 목록 */
V.branchesPage = r => {
  const def = r.def, key = G.key(r);
  const row = b => { const ah = G.ahead(r.branches[def], r.branches[b]).length, bh = G.ahead(r.branches[b], r.branches[def]).length; const c = G.c(r.branches[b]); const pr = r.pulls.find(p => p.head === b && p.hrepo === key); return `<div class="br-row"><a href="#" data-a="setbr" data-br="${esc(b)}">${ICON.branch} <b>${esc(b)}</b></a> <span class="small muted">Updated ${ago(c.t)} by ${esc(c.a)}</span><span class="grow"></span>${b === def ? '<span class="pill">default</span>' : `<span class="small ab">${bh} | ${ah}</span>${pr ? `<a href="#" data-a="goitem" data-n="${pr.n}" class="pill ${pr.state}">${ICON.pr} #${pr.n} ${pr.state}</a>` : `<button class="btn btn-sm" data-a="cmpbanner" data-br="${esc(b)}">New pull request</button>`}<button class="btn-ic" data-a="delbr" data-br="${esc(b)}" title="Delete branch" ${t('del-br-' + b)}>🗑️</button>`}</div>`; };
  return `<h3>${ICON.branch} Branches</h3><p class="small muted">브랜치 = 원본을 건드리지 않고 실험하는 평행 세계 🌿 · 숫자 <b>뒤처진 | 앞선</b> 커밋 수 (기본 브랜치 기준)</p>
    <div class="card"><div class="cg-h">Default</div>${row(def)}</div>
    <div class="card"><div class="cg-h">Your branches</div>${Object.keys(r.branches).filter(b => b !== def).map(row).join('') || '<p class="muted pad-s">아직 다른 브랜치가 없어요. Code 탭의 브랜치 버튼(main ▾)에서 만들 수 있어요.</p>'}</div>`;
};

/* 비교 & PR 만들기 */
V.compare = (r, v) => {
  const key = G.key(r), hrepo = v.hrepo || key, hr = G.repo(hrepo);
  const base = v.base || r.def, head = v.head || '';
  const bt = r.branches[base], ht = hr?.branches[head];
  let status = '', info = null;
  if (head && ht) {
    info = G.prInfo(key, { base, head, hrepo, state: 'open', reviews: [] });
    if (!info.commits.length) status = `<div class="flash">There isn't anything to compare. <b>${esc(base)}</b>와(과) <b>${esc(head)}</b>가 같아요. 먼저 ${esc(head)} 브랜치에 커밋해 보세요.</div>`;
    else status = info.conflicts.length ? `<span class="err">✗ <b>Can't automatically merge.</b></span> <span class="small muted">그래도 PR을 만들 수 있어요. 충돌은 나중에 해결해요.</span>` : `<span class="ok">✓ <b>Able to merge.</b></span> <span class="small muted">These branches can be automatically merged.</span>`;
  }
  const existing = head && r.pulls.find(p => p.state === 'open' && p.head === head && p.hrepo === hrepo && p.base === base);
  const opts = (rr, sel) => Object.keys(rr.branches).map(b => `<option ${b === sel ? 'selected' : ''}>${esc(b)}</option>`).join('');
  const lastMsg = info?.commits.length === 1 ? info.commits[0].m : head.replace(/[-_/]/g, ' ');
  return `<h3>Comparing changes</h3><p class="small muted">두 브랜치를 비교하고 Pull Request(병합 요청)를 만들어요. 화살표 방향: <b>compare</b>(내 작업) → <b>base</b>(합칠 곳)</p>
    <div class="cmp-bar">${hrepo !== key ? `<span class="pill">base repository: ${esc(key)}</span>` : ''}<label>base: <select class="inp" id="cmp-base" data-a2="cmpsel">${opts(r, base)}</select></label> <span class="arrow">←</span>
    ${hrepo !== key ? `<span class="pill">head repository: ${esc(hrepo)}</span>` : ''}<label>compare: <select class="inp" id="cmp-head" data-a2="cmpsel" ${t('cmp-head')}><option value="">브랜치 선택…</option>${hr ? opts(hr, head) : ''}</select></label> ${status && info?.commits.length ? status : ''}</div>
    ${!head ? '<div class="flash">compare 칸에서 비교할 브랜치를 골라 주세요.</div>' : !ht ? '<div class="flash err">브랜치를 찾을 수 없어요.</div>' : !info.commits.length ? status : existing ? `<div class="flash">이미 열린 PR이 있어요: <a href="#" data-a="goitem" data-n="${existing.n}">#${existing.n} ${esc(existing.title)}</a></div>` : V.ui.cmpForm ? `
    <div class="card pr-form"><div class="row gap top">${av(SS().login, 36)}<div class="grow"><label class="lbl">Add a title</label><input class="inp" id="pr-title" ${t('pr-title')} value="${esc(lastMsg)}">
      <label class="lbl">Add a description</label><textarea class="inp" id="pr-body" ${t('pr-body')} rows="6" placeholder="무엇을, 왜 바꿨는지 설명해 주세요. 관련 이슈가 있으면 'Closes #번호' 를 적으면 머지될 때 이슈가 자동으로 닫혀요."></textarea>
      <div class="row-end"><button class="btn btn-primary" data-a="createpr" ${t('create-pr')}>Create pull request</button></div></div></div></div>`
    : `<div class="flash row-between"><span>📝 Discuss and review the changes in this comparison with others.</span><button class="btn btn-primary" data-a="cmpform" ${t('open-pr-form')}>Create pull request</button></div>`}
    ${info && info.commits.length ? `<div class="stats-bar">${ICON.commit} <b>${info.commits.length}</b> commit${info.commits.length > 1 ? 's' : ''} · 📄 <b>${info.files.length}</b> file${info.files.length > 1 ? 's' : ''} changed</div>
    ${info.commits.map(c => `<div class="commit-row small">${av(c.a, 16)} ${esc(c.m)} <code class="muted">${c.id.slice(0, 7)}</code></div>`).join('')}${V.fileDiffs(info.files)}` : ''}`;
};
V.A.createpr = () => {
  const v = SS().view, key = v.key, r = G.repo(key); const title = val('pr-title').trim();
  if (!title) { App.toast('⚠️ PR 제목을 적어 주세요.', 'warn'); return; }
  const pr = G.prNew(key, { title, body: val('pr-body'), base: v.base || r.def, head: v.head, hrepo: v.hrepo || key });
  App.toast(`${'🎉'} Pull Request #${pr.n} 를 만들었어요!`);
  G.feed(`${SS().login} opened pull request ${key}#${pr.n}`);
  G.emit('pr:create', { key, n: pr.n, pr, hrepo: pr.hrepo, base: pr.base, head: pr.head });
  V.go({ page: 'repo', key, tab: 'pulls', sub: 'view', n: pr.n }, { replace: true });
};

/* ---------- Pull requests 탭 ---------- */
V.pullsTab = (r, v) => {
  if (v.sub === 'view') return V.prView(r, v);
  if (v.sub === 'resolve') return V.resolveView(r, v);
  const st = V.ui.prFilter || 'open';
  const list = r.pulls.filter(p => (st === 'open' ? p.state === 'open' : p.state !== 'open')).sort((a, b) => b.n - a.n);
  return `<div class="row-between"><div class="seg"><button class="${st === 'open' ? 'sel' : ''}" data-a="prfilter" data-v="open">${ICON.pr} ${r.pulls.filter(p => p.state === 'open').length} Open</button><button class="${st !== 'open' ? 'sel' : ''}" data-a="prfilter" data-v="closed">✓ ${r.pulls.filter(p => p.state !== 'open').length} Closed</button></div><button class="btn btn-primary btn-sm" data-a="newpr" ${t('new-pr')}>New pull request</button></div>
    <div class="list">${list.map(p => `<div class="li"><span class="st-ic ${p.state}">${p.state === 'merged' ? ICON.merged : ICON.pr}</span><div class="grow"><a href="#" data-a="goitem" data-n="${p.n}" class="li-title" ${t('pr-item-' + p.n)}>${esc(p.title)}</a> ${p.labels.map(l => lbl(r, l)).join(' ')}<div class="small muted">#${p.n} ${p.state === 'merged' ? 'merged' : 'opened'} ${ago(p.t)} by ${esc(p.author)} · ${esc(p.head)} → ${esc(p.base)}</div></div>${p.reviews.some(x => x.state === 'approved') ? '<span class="pill sm green">Approved</span>' : ''}</div>`).join('') || `<div class="blank"><div class="big">${ICON.pr}</div><h3>${st === 'open' ? 'There aren\'t any open pull requests.' : '닫힌 PR이 없어요.'}</h3><p class="muted small">Pull Request = "내가 바꾼 걸 확인하고 합쳐 주세요!" 라는 요청이에요.</p></div>`}</div>`;
};
V.timeline = (r, it) => {
  const ev = [];
  it.comments.forEach((c, i) => ev.push({ t: c.t, h: `<div class="cmt">${av(c.a, 32)}<div class="cmt-box"><div class="cmt-h"><b>${esc(c.a)}</b> commented ${ago(c.t)}</div><div class="cmt-b">${V.md(c.body, { repo: G.key(r) })}</div>${V.reactBar(c.reactions || (c.reactions = {}), 'c' + i)}</div></div>` }));
  (it.reviews || []).forEach(v => ev.push({ t: v.t, h: `<div class="tl-ev">${v.state === 'approved' ? '<span class="tl-ic green">✓</span>' : v.state === 'changes' ? '<span class="tl-ic red">±</span>' : '<span class="tl-ic">👁</span>'} ${av(v.by, 18)} <b>${esc(v.by)}</b> ${v.state === 'approved' ? '<b class="ok">approved</b> these changes' : v.state === 'changes' ? '<b class="err">requested changes</b>' : 'reviewed'} ${ago(v.t)}${v.body ? `<div class="cmt-box mini">${V.md(v.body)}</div>` : ''}</div>` }));
  it.tl.forEach(e => {
    const m = { closed: `<span class="tl-ic purple">✓</span> <b>${esc(e.by)}</b> closed this as completed${e.via ? ` in <b>${esc(e.via)}</b>` : ''}`, reopened: `<span class="tl-ic green">↺</span> <b>${esc(e.by)}</b> reopened this`, merged: `<span class="tl-ic purple">${ICON.merged}</span> <b>${esc(e.by)}</b> merged commit <code>${(e.commit || '').slice(0, 7)}</code> into <b>${esc(it.base)}</b>`, labeled: `🏷 <b>${esc(e.by)}</b> added ${lbl(r, e.label)}`, assigned: `👤 <b>${esc(e.by)}</b> ${e.self ? 'self-assigned this' : 'assigned ' + esc(e.who)}`, reviewreq: `👀 <b>${esc(e.by)}</b> requested a review from <b>${esc(e.who)}</b>`, resolved: `<span class="tl-ic">⚙</span> <b>${esc(e.by)}</b> resolved conflicts (<code>${(e.commit || '').slice(0, 7)}</code>)`, branchdel: `🗑 <b>${esc(e.by)}</b> deleted the <code>${esc(e.br)}</code> branch`, ms: `🎯 <b>${esc(e.by)}</b> added this to the <b>${esc(e.ms)}</b> milestone`, project: `📋 <b>${esc(e.by)}</b> added this to <b>${esc(e.p)}</b>` }[e.type];
    if (m) ev.push({ t: e.t, h: `<div class="tl-ev">${m} <span class="muted small">${ago(e.t)}</span></div>` });
  });
  return ev.sort((a, b) => a.t - b.t).map(e => e.h).join('');
};
V.reactBar = (re, id) => `<div class="react">${Object.entries(re).filter(([, n]) => n).map(([e, n]) => `<button class="react-b on" data-a="react" data-id="${id}" data-e="${e}">${e} ${n}</button>`).join('')}<div class="dd-wrap"><button class="react-b add" data-a="menu" data-m="re-${id}" ${t('react-' + id)} title="반응 남기기">😊＋</button>${V.ui.menu === 're-' + id ? `<div class="dd emo">${['👍', '👎', '😄', '🎉', '😕', '❤️', '🚀', '👀'].map(e => `<button data-a="react" data-id="${id}" data-e="${e}">${e}</button>`).join('')}</div>` : ''}</div></div>`;
V.prView = (r, v) => {
  const S = SS(), key = G.key(r), pr = r.pulls.find(p => p.n === v.n); if (!pr) return '<div class="flash err">PR을 찾을 수 없어요.</div>';
  const i = G.prInfo(key, pr); const tab = v.prtab || 'conv';
  const badge = pr.state === 'merged' ? `<span class="state merged">${ICON.merged} Merged</span>` : pr.state === 'closed' ? `<span class="state closed">${ICON.pr} Closed</span>` : `<span class="state open">${ICON.pr} Open</span>`;
  const hOwner = pr.hrepo !== key ? pr.hrepo.split('/')[0] + ':' : '';
  const head = `<div class="it-head"><h2>${esc(pr.title)} <span class="muted">#${pr.n}</span></h2><div>${badge} <b>${esc(pr.author)}</b> ${pr.state === 'merged' ? `merged ${i.commits.length} commit${i.commits.length > 1 ? 's' : ''} into` : `wants to merge ${i.commits.length} commit${i.commits.length > 1 ? 's' : ''} into`} <code class="brc">${esc(pr.base)}</code> from <code class="brc">${esc(hOwner + pr.head)}</code></div></div>
    <div class="tabs"><button class="tab ${tab === 'conv' ? 'sel' : ''}" data-a="prtab" data-v="conv">💬 Conversation <span class="cnt">${pr.comments.length}</span></button><button class="tab ${tab === 'commits' ? 'sel' : ''}" data-a="prtab" data-v="commits">${ICON.commit} Commits <span class="cnt">${i.commits.length}</span></button><button class="tab ${tab === 'checks' ? 'sel' : ''}" data-a="prtab" data-v="checks">✔ Checks <span class="cnt">${i.runs.length}</span></button><button class="tab ${tab === 'files' ? 'sel' : ''}" data-a="prtab" data-v="files" ${t('pr-files-tab')}>📄 Files changed <span class="cnt">${i.files.length}</span></button></div>`;
  if (tab === 'commits') return head + i.commits.map(c => `<div class="commit-row">${av(c.a, 18)} <a href="#" data-a="opencommit" data-id="${c.id}">${esc(c.m)}</a><code class="muted">${c.id.slice(0, 7)}</code></div>`).join('');
  if (tab === 'checks') return head + (i.runs.map(x => `<div class="li">${V.runIcon(x)} <a href="#" data-a="openrun" data-id="${x.id}">${esc(x.name)}</a> <span class="small muted">${x.status === 'completed' ? x.concl : x.status}</span></div>`).join('') || '<p class="muted pad">이 PR에서 실행된 Actions 체크가 없어요. (.github/workflows 에 워크플로가 있으면 여기에 표시돼요)</p>');
  if (tab === 'files') return head + `<div class="row-between"><span class="small muted">💡 줄 번호 옆 <b>+</b> 버튼을 누르면 그 줄에 코멘트를 달 수 있어요 (코드 리뷰!)</span><div class="dd-wrap"><button class="btn btn-sm btn-primary" data-a="reviewtoggle" ${t('review-btn')}>Review changes ▾</button>${V.ui.review ? V.reviewBox(pr) : ''}</div></div>` + V.fileDiffs(i.files, { comment: pr.state === 'open', comments: pr.lineComments });
  const own = r.owner === S.login || r.collab.some(c => c.name === S.login && c.status === 'accepted');
  let box = '';
  if (pr.state === 'merged') box = `<div class="merge-box merged"><div class="mb-row"><span class="mb-ic purple">${ICON.merged}</span><div><b>Pull request successfully merged and closed</b><p class="small muted">You're all set — the <code>${esc(pr.head)}</code> branch can be safely deleted.</p></div>${pr.hrepo === key && r.branches[pr.head] && own ? `<button class="btn btn-sm" data-a="prdelbr" ${t('delete-branch')}>Delete branch</button>` : pr.hrepo === key && !r.branches[pr.head] ? '<span class="small muted">브랜치 삭제됨 ✓</span>' : ''}</div></div>`;
  else if (pr.state === 'closed') box = `<div class="merge-box"><b>닫힌 PR이에요.</b> <button class="btn btn-sm" data-a="prreopen">Reopen pull request</button></div>`;
  else {
    const runs = i.runs; const pending = runs.some(x => x.status !== 'completed'); const failed = runs.some(x => x.concl === 'failure');
    const checks = runs.length ? `<div class="mb-row">${pending ? '<span class="mb-ic yellow">●</span><div><b>Some checks haven\'t completed yet</b>' : failed ? '<span class="mb-ic red">✗</span><div><b>Some checks were not successful</b>' : '<span class="mb-ic green">✓</span><div><b>All checks have passed</b>'}<p class="small muted">${runs.map(x => `${V.runIcon(x)} ${esc(x.name)}`).join(' · ')}</p></div></div>` : '';
    const rev = i.needRev ? `<div class="mb-row">${i.reviewOK ? '<span class="mb-ic green">✓</span><div><b>Changes approved</b><p class="small muted">필요한 승인을 받았어요.</p></div>' : `<span class="mb-ic red">✗</span><div><b>Review required</b><p class="small muted">At least ${i.needRev} approving review is required by reviewers with write access. 오른쪽 Reviewers에서 리뷰를 요청하세요.</p></div>`}</div>` : '';
    const conf = i.conflicts.length ? `<div class="mb-row"><span class="mb-ic red">!</span><div><b>This branch has conflicts that must be resolved</b><p class="small muted">충돌 파일: ${i.conflicts.map(esc).join(', ')}</p></div>${pr.hrepo === key && own ? `<button class="btn btn-sm" data-a="resolve" ${t('resolve-btn')}>Resolve conflicts</button>` : ''}</div>` : `<div class="mb-row"><span class="mb-ic green">✓</span><div><b>This branch has no conflicts with the base branch</b><p class="small muted">Merging can be performed automatically.</p></div></div>`;
    const can = own && !i.conflicts.length && i.reviewOK && !i.missing;
    const method = V.ui.mergeMethod || 'merge'; const ml = { merge: 'Create a merge commit', squash: 'Squash and merge', rebase: 'Rebase and merge' };
    const btns = !own ? '<p class="small muted">이 저장소의 관리자만 머지할 수 있어요. 메인테이너의 확인을 기다려 주세요 ⏳</p>' : V.ui.confirmMerge ? `<div class="confirm-merge"><input class="inp" id="mg-msg" value="${esc(method === 'squash' ? `${pr.title} (#${pr.n})` : `Merge pull request #${pr.n} from ${hOwner || r.owner + '/'}${pr.head}`)}"><div class="row gap"><button class="btn btn-merge" data-a="domerge" ${t('confirm-merge')}>Confirm ${method === 'merge' ? 'merge' : method === 'squash' ? 'squash and merge' : 'rebase and merge'}</button><button class="btn" data-a="cancelmerge">Cancel</button></div></div>`
      : `<div class="row gap"><div class="dd-wrap btn-group"><button class="btn btn-merge" data-a="mergeclick" ${t('merge-btn')} ${can ? '' : 'disabled'}>${method === 'merge' ? 'Merge pull request' : ml[method]}</button><button class="btn btn-merge caret" data-a="menu" data-m="mm" ${t('merge-caret')} ${can ? '' : 'disabled'}>▾</button>${V.ui.menu === 'mm' ? `<div class="dd mm-dd">${Object.entries(ml).map(([k, l]) => `<button data-a="setmethod" data-v="${k}" ${t('mm-' + k)}>${method === k ? '✓ ' : ''}<b>${l}</b><small>${{ merge: '모든 커밋을 그대로 두고 병합 커밋을 하나 더 만들어요.', squash: '여러 커밋을 하나로 꾹 눌러 합쳐요. 기록이 깔끔해져요.', rebase: '커밋들을 base 끝에 차례로 다시 붙여요. 병합 커밋이 없어요.' }[k]}</small></button>`).join('')}</div>` : ''}</div>
       <span class="small muted">You can also merge this with the command line.</span></div>`;
    box = `<div class="merge-box">${rev}${checks}${conf}<div class="mb-row last">${btns}</div></div>`;
  }
  const reviewers = ['dain-friend', ...r.collab.filter(c => c.status === 'accepted').map(c => c.name)].filter((x, i, a) => a.indexOf(x) === i && x !== pr.author);
  return head + `<div class="it-grid"><div class="it-main">
    <div class="cmt">${av(pr.author, 32)}<div class="cmt-box"><div class="cmt-h"><b>${esc(pr.author)}</b> commented ${ago(pr.t)}</div><div class="cmt-b">${pr.body ? V.md(pr.body, { repo: key }) : '<i class="muted">No description provided.</i>'}</div>${V.reactBar(pr.reactions, 'body')}</div></div>
    ${V.timeline(r, pr)}${box}
    ${V.commentBox(pr, true)}
  </div><aside class="it-side">
    <div class="side-sec"><div class="row-between"><b>Reviewers</b><div class="dd-wrap"><button class="btn-ic" data-a="menu" data-m="rv" ${t('reviewers-gear')}>⚙️</button>${V.ui.menu === 'rv' ? `<div class="dd right"><div class="dd-h">Request up to 15 reviewers</div>${reviewers.map(n => `<button data-a="reqreview" data-u="${esc(n)}" ${t('rv-' + n)}>${pr.reviewers.includes(n) ? '✓ ' : ''}${av(n, 18)} ${esc(n)} ${n === 'dain-friend' && !r.collab.some(c => c.name === n) ? '<small class="muted">(연습용 친구)</small>' : ''}</button>`).join('')}</div>` : ''}</div></div>
      ${pr.reviewers.length ? pr.reviewers.map(n => { const rv = pr.reviews.find(x => x.by === n); return `<div class="small">${av(n, 18)} ${esc(n)} ${rv ? (rv.state === 'approved' ? '<span class="ok">✓ approved</span>' : '<span class="err">± changes</span>') : '<span class="muted">● 리뷰 대기 중…</span>'}</div>`; }).join('') : '<p class="small muted">No reviews</p>'}</div>
    <div class="side-sec"><b>Assignees</b><p class="small">${pr.assignees.length ? pr.assignees.map(a => av(a, 18) + ' ' + esc(a)).join('<br>') : 'No one — <a href="#" data-a="assignme">assign yourself</a>'}</p></div>
    <div class="side-sec"><b>Labels</b><p>${pr.labels.map(l => lbl(r, l)).join(' ') || '<span class="small muted">None yet</span>'}</p></div>
    <div class="side-sec"><b>Development</b><p class="small muted">PR 설명에 <code>Closes #이슈번호</code>를 쓰면 머지될 때 이슈가 자동으로 닫혀요.</p></div>
  </aside></div>`;
};
V.reviewBox = pr => {
  const mine = pr.author === SS().login;
  return `<div class="dd right review-dd"><h4>Finish your review</h4><textarea class="inp" id="rv-body" rows="4" placeholder="Leave a comment"></textarea>
  <label class="cb"><input type="radio" name="rv" id="rv-c" checked> <b>Comment</b> <small>승인 없이 의견만 남겨요.</small></label>
  <label class="cb ${mine ? 'disabled' : ''}"><input type="radio" name="rv" id="rv-a" ${mine ? 'disabled' : ''}> <b>Approve</b> <small>${mine ? '⚠️ 내가 만든 PR은 스스로 승인할 수 없어요!' : '변경 내용을 승인해요.'}</small></label>
  <label class="cb ${mine ? 'disabled' : ''}"><input type="radio" name="rv" id="rv-x" ${mine ? 'disabled' : ''}> <b>Request changes</b> <small>고쳐야 할 점이 있어요.</small></label>
  <div class="row-end"><button class="btn btn-primary btn-sm" data-a="submitreview" ${t('submit-review')}>Submit review</button></div></div>`;
};
V.commentBox = (it, isPr) => `<div class="cmt new-cmt">${av(SS().login, 32)}<div class="cmt-box"><div class="tabs sm"><button class="tab ${V.ui.cmTab !== 'p' ? 'sel' : ''}" data-a="cmtab" data-v="w">Write</button><button class="tab ${V.ui.cmTab === 'p' ? 'sel' : ''}" data-a="cmtab" data-v="p">Preview</button></div>
  ${V.ui.cmTab === 'p' ? `<div class="pad">${V.md(V.ui.cmDraft || '*Nothing to preview*')}</div>` : `<textarea class="inp" id="cm-body" ${t('comment-box')} rows="4" data-a2="cmdraft" placeholder="Add your comment here... (@아이디 로 사람을 부르고, #번호 로 이슈를 연결할 수 있어요)">${esc(V.ui.cmDraft || '')}</textarea>`}
  <div class="row-end">${it.state !== 'merged' ? `<button class="btn btn-sm" data-a="${it.state === 'open' ? 'closeitem' : 'reopenitem'}" ${t('close-item')}>${it.state === 'open' ? (isPr ? 'Close pull request' : '✓ Close issue') : 'Reopen'}</button>` : ''}<button class="btn btn-primary btn-sm" data-a="addcomment" ${t('comment-btn')}>Comment</button></div></div></div>`;

/* 충돌 해결 */
V.resolveView = (r, v) => {
  const key = G.key(r), pr = r.pulls.find(p => p.n === v.n); const i = G.prInfo(key, pr);
  const R = V.ui.resolve && V.ui.resolve.n === pr.n && V.ui.resolve.key === key ? V.ui.resolve : (V.ui.resolve = { key, n: pr.n, files: (() => { const m2 = G.merge3(G.treeOf(i.mb), G.treeOf(i.ht), G.treeOf(i.bt), pr.head, pr.base); return Object.fromEntries(i.conflicts.map(p => [p, m2.tree[p] ?? i.mergeTree[p]])); })(), done: {}, cur: i.conflicts[0] });
  if (!R.cur) return '<div class="flash">해결할 충돌이 없어요.</div>';
  const all = Object.keys(R.files).every(p => R.done[p]);
  return `<div class="row-between"><h3>⚔️ Resolving conflicts between <code>${esc(pr.head)}</code> and <code>${esc(pr.base)}</code></h3><button class="btn btn-primary" data-a="commitresolve" ${t('commit-merge')} ${all ? '' : 'disabled'}>Commit merge</button></div>
   <div class="card explain small"><b>충돌(conflict)이란?</b> 두 브랜치가 <b>같은 줄</b>을 서로 다르게 고쳐서 Git이 어느 쪽을 쓸지 모르는 상태예요.<br>
   <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; ${esc(pr.head)}</code> 아래는 <b>내 브랜치</b> 내용, <code>=======</code> 아래는 <b>${esc(pr.base)}</b> 내용, <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code>는 끝 표시예요. 남길 내용만 두고 <b>표시 3줄을 모두 지우면</b> 해결!</div>
   <div class="resolve"><div class="rs-files">${Object.keys(R.files).map(p => `<button class="${p === R.cur ? 'sel' : ''}" data-a="rsfile" data-p="${esc(p)}">${R.done[p] ? '✅' : '⚠️'} ${esc(p)}</button>`).join('')}</div>
   <div class="grow"><div class="row-between pad-s"><b>${esc(R.cur)}</b><span>${R.done[R.cur] ? '<span class="ok">✓ Resolved</span>' : `<span class="small muted">${(R.files[R.cur].match(/^<<<<<<</gm) || []).length} conflict</span> <button class="btn btn-sm" data-a="markresolved" ${t('mark-resolved')}>Mark as resolved</button>`}</span></div>
   <textarea id="rs-content" class="code-area" rows="14" spellcheck="false" data-a2="rsdraft" ${t('rs-content')}>${esc(R.files[R.cur])}</textarea></div></div>`;
};

/* ---------- Issues 탭 ---------- */
V.issuesTab = (r, v) => {
  if (v.sub === 'new') return V.newIssue(r);
  if (v.sub === 'view') return V.issueView(r, v);
  if (v.sub === 'labels') return V.labelsPage(r);
  if (v.sub === 'milestones') return V.msPage(r);
  const st = V.ui.isFilter || 'open';
  const list = r.issues.filter(i => i.state === st).sort((a, b) => b.n - a.n);
  return `<div class="row-between"><div class="row gap"><button class="btn btn-sm" data-a="sub" data-sub="labels" ${t('labels-btn')}>🏷 Labels <span class="cnt">${r.labels.length}</span></button><button class="btn btn-sm" data-a="sub" data-sub="milestones" ${t('ms-btn')}>🎯 Milestones <span class="cnt">${r.milestones.length}</span></button></div><button class="btn btn-primary btn-sm" data-a="newissue" ${t('new-issue')}>New issue</button></div>
  <div class="list"><div class="list-h"><button class="${st === 'open' ? 'sel' : ''}" data-a="isfilter" data-v="open" ${t('filter-open')}>${ICON.issue} ${r.issues.filter(i => i.state === 'open').length} Open</button><button class="${st === 'closed' ? 'sel' : ''}" data-a="isfilter" data-v="closed" ${t('filter-closed')}>✓ ${r.issues.filter(i => i.state === 'closed').length} Closed</button></div>
  ${list.map(i => `<div class="li"><span class="st-ic ${i.state === 'open' ? 'open' : 'done'}">${i.state === 'open' ? ICON.issue : '✓'}</span><div class="grow"><a href="#" data-a="goitem" data-n="${i.n}" class="li-title" ${t('issue-item-' + i.n)}>${esc(i.title)}</a> ${i.labels.map(l => lbl(r, l)).join(' ')}<div class="small muted">#${i.n} ${i.state === 'open' ? 'opened' : 'closed'} ${ago(i.t)} by ${esc(i.author)}${i.milestone ? ' · 🎯 ' + esc(i.milestone) : ''}</div></div>${i.assignees.map(a => av(a, 20)).join('')}${i.comments.length ? `<span class="small muted">💬 ${i.comments.length}</span>` : ''}</div>`).join('') || `<div class="blank"><div class="big">${ICON.issue}</div><h3>${st === 'open' ? 'Welcome to issues!' : 'No closed issues'}</h3><p class="muted small">Issue = 할 일, 버그, 아이디어를 기록하는 게시판이에요. 팀원과 의견을 나누며 일을 추적해요.</p></div>`}</div>`;
};
V.newIssue = r => `<div class="it-grid"><div class="it-main"><h3>Create new issue</h3>
  <label class="lbl">Add a title *</label><input class="inp" id="is-title" ${t('is-title')} placeholder="예: README에 설치 방법 추가하기">
  <label class="lbl">Add a description</label><div class="tabs sm"><button class="tab ${V.ui.isTab !== 'p' ? 'sel' : ''}" data-a="istab" data-v="w">Write</button><button class="tab ${V.ui.isTab === 'p' ? 'sel' : ''}" data-a="istab" data-v="p">Preview</button></div>
  ${V.ui.isTab === 'p' ? `<div class="pad card">${V.md(V.ui.isDraft || '*Nothing to preview*')}</div>` : `<textarea class="inp" id="is-body" ${t('is-body')} rows="8" data-a2="isdraft" placeholder="자세히 설명해 주세요.\n\n할 일 목록은 이렇게 써요:\n- [ ] 첫 번째 할 일\n- [ ] 두 번째 할 일">${esc(V.ui.isDraft || '')}</textarea>`}
  <div class="row-end"><button class="btn" data-a="tab" data-tab="issues">Cancel</button><button class="btn btn-primary" data-a="createissue" ${t('submit-issue')}>Create</button></div></div>
  <aside class="it-side"><p class="small muted">💡 이슈를 만든 뒤 오른쪽 사이드바에서 <b>담당자(Assignees)</b>, <b>라벨(Labels)</b>, <b>마일스톤</b>을 정할 수 있어요.</p></aside></div>`;
V.issueView = (r, v) => {
  const key = G.key(r), it = r.issues.find(i => i.n === v.n); if (!it) { const pr = r.pulls.find(p => p.n === v.n); if (pr) return V.prView(r, { ...v, n: pr.n }); return '<div class="flash err">이슈를 찾을 수 없어요.</div>'; }
  const open = it.state === 'open';
  const projs = r.projects.filter(p => p.items.some(x => x.n === it.n));
  return `<div class="it-head"><h2>${esc(it.title)} <span class="muted">#${it.n}</span></h2><div><span class="state ${open ? 'open' : 'done'}">${open ? ICON.issue + ' Open' : '✓ Closed'}</span> <b>${esc(it.author)}</b> opened this issue ${ago(it.t)} · ${it.comments.length} comments</div></div>
  <div class="it-grid"><div class="it-main">
    <div class="cmt">${av(it.author, 32)}<div class="cmt-box"><div class="cmt-h"><b>${esc(it.author)}</b> commented ${ago(it.t)}</div><div class="cmt-b">${it.body ? V.md(it.body, { repo: key, tasks: it.author === SS().login || r.owner === SS().login }) : '<i class="muted">No description provided.</i>'}</div>${V.reactBar(it.reactions, 'body')}</div></div>
    ${V.timeline(r, it)}${V.commentBox(it, false)}</div>
  <aside class="it-side">
    <div class="side-sec"><div class="row-between"><b>Assignees</b></div><p class="small">${it.assignees.length ? it.assignees.map(a => av(a, 18) + ' ' + esc(a)).join('<br>') : `No one — <a href="#" data-a="assignme" ${t('assign-me')}>assign yourself</a>`}</p></div>
    <div class="side-sec"><div class="row-between"><b>Labels</b><div class="dd-wrap"><button class="btn-ic" data-a="menu" data-m="lb" ${t('labels-gear')}>⚙️</button>${V.ui.menu === 'lb' ? `<div class="dd right lb-dd"><div class="dd-h">Apply labels to this issue</div>${r.labels.map(l => `<button data-a="toglabel" data-l="${esc(l.name)}" ${t('lb-' + l.name)}>${it.labels.includes(l.name) ? '✓' : '&nbsp;&nbsp;'} <span class="ldot" style="background:#${l.color}"></span> <b>${esc(l.name)}</b><small>${esc(l.desc)}</small></button>`).join('')}</div>` : ''}</div></div><p>${it.labels.map(l => lbl(r, l)).join(' ') || '<span class="small muted">None yet</span>'}</p></div>
    <div class="side-sec"><b>Projects</b><p class="small">${projs.map(p => '📋 ' + esc(p.title)).join('<br>') || '<span class="muted">None yet</span>'}</p></div>
    <div class="side-sec"><div class="row-between"><b>Milestone</b><div class="dd-wrap"><button class="btn-ic" data-a="menu" data-m="ms" ${t('ms-gear')}>⚙️</button>${V.ui.menu === 'ms' ? `<div class="dd right"><div class="dd-h">Set milestone</div>${r.milestones.map(m => `<button data-a="setms" data-v="${esc(m.title)}" ${t('setms-' + m.title)}>${it.milestone === m.title ? '✓ ' : ''}🎯 ${esc(m.title)}</button>`).join('') || '<div class="pad-s small muted">마일스톤이 없어요. Issues → Milestones에서 만들어요.</div>'}</div>` : ''}</div></div><p class="small">${it.milestone ? '🎯 ' + esc(it.milestone) : '<span class="muted">No milestone</span>'}</p></div>
    <div class="side-sec"><b>Development</b><p class="small muted">커밋 메시지에 <code>Fixes #${it.n}</code> 를 쓰면 기본 브랜치에 올라갈 때 이 이슈가 자동으로 닫혀요.</p></div>
  </aside></div>`;
};
V.labelsPage = r => `<div class="row-between"><h3>🏷 Labels</h3><button class="btn btn-primary btn-sm" data-a="labelform" ${t('new-label')}>New label</button></div><p class="small muted">라벨 = 이슈와 PR을 분류하는 색깔 꼬리표예요. (예: bug, enhancement)</p>
  ${V.ui.labelForm ? `<div class="card row gap wrap"><input class="inp" id="lb-name" ${t('lb-name')} placeholder="Label name (예: 숙제)"><input class="inp" id="lb-desc" placeholder="Description (optional)"><input type="color" id="lb-color" value="#${['f9d0c4', 'c2e0c6', 'bfd4f2', 'fef2c0', 'd4c5f9'][r.labels.length % 5]}"><button class="btn btn-primary btn-sm" data-a="createlabel" ${t('create-label')}>Create label</button></div>` : ''}
  <div class="list">${r.labels.map(l => `<div class="li">${lbl(r, l.name)}<span class="small muted grow">${esc(l.desc)}</span><span class="small muted">${r.issues.filter(i => i.labels.includes(l.name)).length} issues</span></div>`).join('')}</div>`;
V.msPage = r => `<div class="row-between"><h3>🎯 Milestones</h3><button class="btn btn-primary btn-sm" data-a="msform" ${t('new-ms')}>New milestone</button></div><p class="small muted">마일스톤 = 목표 날짜까지 끝낼 이슈들을 묶은 "중간 목표"예요. (예: 1학기 프로젝트, v1.0 출시)</p>
  ${V.ui.msForm ? `<div class="card"><label class="lbl">Title</label><input class="inp" id="ms-title" ${t('ms-title')} placeholder="예: v1.0 출시"><label class="lbl">Due date (optional)</label><input class="inp" type="date" id="ms-due"><label class="lbl">Description</label><textarea class="inp" id="ms-desc" rows="2"></textarea><div class="row-end"><button class="btn btn-primary btn-sm" data-a="createms" ${t('create-ms')}>Create milestone</button></div></div>` : ''}
  <div class="list">${r.milestones.map(m => { const its = r.issues.filter(i => i.milestone === m.title); const done = its.filter(i => i.state === 'closed').length; const pc = its.length ? Math.round((done / its.length) * 100) : 0; return `<div class="li"><div class="grow"><b>${esc(m.title)}</b><div class="small muted">${m.due ? '📅 Due by ' + esc(m.due) : 'No due date'} · ${esc(m.desc || '')}</div></div><div class="ms-prog"><div class="bar"><span style="width:${pc}%"></span></div><small>${pc}% complete · ${its.length - done} open · ${done} closed</small></div></div>`; }).join('') || '<div class="blank small muted">아직 마일스톤이 없어요.</div>'}</div>`;
