/* =========================================================
   GitHub 연습장 - 가상 Git/GitHub 엔진
   (실제 GitHub와 통신하지 않는 브라우저 안의 시뮬레이터)
   ========================================================= */
'use strict';
const G = (window.G = {});
let S = null;
const LS_KEY = 'ghPractice.v1';

G.S = () => S;
G.emit = () => {};
G.onChange = () => {};
G.notify = () => {};

/* ---------- 저장 ---------- */
/* 큰 문자열(이미지·긴 파일)은 한 번만 저장해서 용량을 아껴요 */
G.load = () => {
  try {
    const t = localStorage.getItem(LS_KEY);
    if (t) { const o = JSON.parse(t); S = o && o.packed ? JSON.parse(o.d, (k, v) => (typeof v === 'string' && v.charCodeAt(0) === 2 ? o.b[+v.slice(1)] : v)) : o; }
  } catch (e) { S = null; }
  return S;
};
G.save = () => {
  if (!S) return;
  try {
    const big = [], idx = new Map();
    const d = JSON.stringify(S, (k, v) => { if (typeof v === 'string' && v.length > 300) { let i = idx.get(v); if (i === undefined) { i = big.length; big.push(v); idx.set(v, i); } return '\u0002' + i; } return v; });
    localStorage.setItem(LS_KEY, JSON.stringify({ packed: 1, d, b: big }));
  } catch (e) { if (!G._warned) { G._warned = true; G.notify('⚠️ 브라우저 저장 공간이 부족해서 진행 상황을 저장하지 못했어요. 큰 이미지 파일을 줄여 보세요.'); } }
};
G.reset = () => { try { localStorage.removeItem(LS_KEY); } catch (e) {} S = null; };

/* ---------- 유틸 ---------- */
G.hex = () => { let s = ''; for (let i = 0; i < 40; i++) s += '0123456789abcdef'[(Math.random() * 16) | 0]; return s; };
G.today = (t = Date.now()) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
G.bump = (n = 1) => { const k = G.today(); S.contrib[k] = (S.contrib[k] || 0) + n; };
G.FAKE_TOKEN = 'gh' + 'p_' + 'PracticeFakeToken1234567890abcdefghi';
G.SECRET_RE = new RegExp('gh' + '[pousr]_[A-Za-z0-9]{36}');
G.verLt = (a, b) => { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) < (y[i] || 0)) return true; if ((x[i] || 0) > (y[i] || 0)) return false; } return false; };
G.isBin = v => typeof v === 'string' && v.startsWith('data:');

/* ---------- 커밋 객체 ---------- */
G.mk = (tree, parents, msg, author, desc, t) => {
  const id = G.hex();
  S.obj[id] = { id, p: parents.filter(Boolean), m: msg, d: desc || '', a: author, t: t || Date.now(), tree: { ...tree } };
  return id;
};
G.c = id => S.obj[id];
G.treeOf = id => (id && S.obj[id] ? S.obj[id].tree : {});
G.tree = (r, br) => G.treeOf(r.branches[br]);
G.anc = id => {
  const set = new Set(), st = [id];
  while (st.length) { const x = st.pop(); if (!x || set.has(x)) continue; set.add(x); (S.obj[x]?.p || []).forEach(p => st.push(p)); }
  return set;
};
G.isAnc = (a, b) => !!a && G.anc(b).has(a);
G.mbase = (a, b) => {
  if (!a || !b) return null;
  const A = G.anc(a), q = [b], seen = new Set();
  while (q.length) { const x = q.shift(); if (!x || seen.has(x)) continue; seen.add(x); if (A.has(x)) return x; (S.obj[x]?.p || []).forEach(p => q.push(p)); }
  return null;
};
G.ahead = (base, head) => { const B = G.anc(base); return [...G.anc(head)].filter(x => !B.has(x)).map(G.c).sort((x, y) => x.t - y.t); };

/* ---------- diff / merge ---------- */
G.lcs = (a, b) => {
  const n = a.length, m = b.length;
  if (n * m > 4e6) return [...a.map((_, i) => ['-', i, -1]), ...b.map((_, j) => ['+', -1, j])];
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push(['=', i, j]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push(['-', i, -1]); i++; }
    else { ops.push(['+', -1, j]); j++; }
  }
  while (i < n) ops.push(['-', i++, -1]);
  while (j < m) ops.push(['+', -1, j++]);
  return ops;
};
G.lines = s => (s === undefined || s === null ? [] : String(s).replace(/\n$/, '').split('\n'));
G.lineDiff = (a, b) => {
  const A = G.lines(a), B = G.lines(b);
  return G.lcs(A, B).map(([t, i, j]) => t === '=' ? { t: ' ', s: A[i], an: i + 1, bn: j + 1 } : t === '-' ? { t: '-', s: A[i], an: i + 1 } : { t: '+', s: B[j], bn: j + 1 });
};
G.stat = (a, b) => { let add = 0, del = 0; if (G.isBin(a) || G.isBin(b)) return { add: 0, del: 0 }; G.lineDiff(a, b).forEach(r => { if (r.t === '+') add++; else if (r.t === '-') del++; }); return { add, del }; };
G.hunks = (a, b) => {
  const H = []; let cur = null, bi = 0;
  for (const [t, i, j] of G.lcs(a, b)) {
    if (t === '=') { if (cur) { H.push(cur); cur = null; } bi = i + 1; }
    else { if (!cur) cur = { s: bi, e: bi, ins: [] }; if (t === '-') { cur.e = i + 1; bi = i + 1; } else cur.ins.push(b[j]); }
  }
  if (cur) H.push(cur);
  return H;
};
G.mergeText = (b, o, t) => {
  const B = (b || '').split('\n'), O = o.split('\n'), T = t.split('\n');
  const ho = G.hunks(B, O), ht = G.hunks(B, T);
  const same = (x, y) => x.s === y.s && x.e === y.e && x.ins.join('\n') === y.ins.join('\n');
  for (const x of ho) for (const y of ht) { if (same(x, y)) continue; if (Math.max(x.s, y.s) <= Math.min(x.e, y.e)) return null; }
  const all = [...ho]; ht.forEach(y => { if (!ho.some(x => same(x, y))) all.push(y); });
  all.sort((p, q) => q.s - p.s);
  const R = B.slice(); all.forEach(h => R.splice(h.s, h.e - h.s, ...h.ins));
  return R.join('\n');
};
const nl = s => (s && !s.endsWith('\n') ? s + '\n' : s || '');
G.merge3 = (bT, oT, tT, oL, tL) => {
  const paths = new Set([...Object.keys(bT || {}), ...Object.keys(oT || {}), ...Object.keys(tT || {})]);
  const tree = {}, conflicts = [];
  for (const p of paths) {
    const b = bT?.[p], o = oT?.[p], t = tT?.[p];
    let r;
    if (o === t) r = o; else if (o === b) r = t; else if (t === b) r = o;
    else {
      let m = null;
      if (o !== undefined && t !== undefined && b !== undefined && !G.isBin(o) && !G.isBin(t)) m = G.mergeText(b, o, t);
      if (m !== null) r = m;
      else { conflicts.push(p); r = `<<<<<<< ${oL}\n${nl(o)}=======\n${nl(t)}>>>>>>> ${tL}\n`; }
    }
    if (r !== undefined) tree[p] = r;
  }
  return { tree, conflicts };
};
G.dtree = (a, b) => {
  const out = [], ps = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  [...ps].sort().forEach(p => { const x = a?.[p], y = b?.[p]; if (x === y) return; out.push({ p, k: x === undefined ? 'add' : y === undefined ? 'del' : 'mod', a: x, b: y }); });
  return out;
};
G.hasMarkers = s => typeof s === 'string' && /^(<<<<<<<|=======|>>>>>>>)/m.test(s);

/* ---------- 템플릿 ---------- */
G.GITIGNORE = {
  Node: 'node_modules/\nnpm-debug.log*\n.env\ndist/\n',
  Python: '__pycache__/\n*.py[cod]\n.venv/\n.env\n',
  Java: '*.class\n*.jar\ntarget/\n.idea/\n',
};
G.LICENSE = (k, who) => k === 'MIT'
  ? `MIT License\n\nCopyright (c) ${new Date().getFullYear()} ${who}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n`
  : `Apache License\nVersion 2.0, January 2004\nhttp://www.apache.org/licenses/\n\nCopyright ${new Date().getFullYear()} ${who}\n\n(연습용으로 줄인 버전이에요. 실제 GitHub에서는 전체 라이선스 본문이 들어가요.)\n`;
G.LABELS = [
  ['bug', 'd73a4a', "Something isn't working"], ['documentation', '0075ca', 'Improvements or additions to documentation'],
  ['duplicate', 'cfd3d7', 'This issue or pull request already exists'], ['enhancement', 'a2eeef', 'New feature or request'],
  ['good first issue', '7057ff', 'Good for newcomers'], ['help wanted', '008672', 'Extra attention is needed'],
  ['invalid', 'e4e669', "This doesn't seem right"], ['question', 'd876e3', 'Further information is requested'], ['wontfix', 'ffffff', 'This will not be worked on'],
].map(([name, color, desc]) => ({ name, color, desc }));

/* ---------- 상태 초기화 ---------- */
G.init = (login, name) => {
  S = {
    v: 1, login, name: name || login, created: Date.now(), obj: {}, repos: {}, gists: [], feed: [], contrib: {},
    local: { home: {}, cwd: '', cfg: {}, hist: [] },
    view: { page: 'home' }, hist: [],
    prog: { xp: 0, done: {}, cur: null, step: 0, badges: [], skipped: 0, seen: {} },
    seq: { run: 1, gist: 1 }, starred: {}, watching: {}, bio: '',
  };
  G.seed();
  return S;
};

G.seed = () => {
  const day = 864e5, T0 = Date.now() - 40 * day;
  const wb = G.repoNew({ owner: 'octo-academy', name: 'word-bank', desc: '전 세계 학생들이 함께 만드는 다국어 단어장 📚 (Fork & Pull Request 연습용)', stars: 1284, forks: 312 });
  let t1 = {
    'README.md': '# 📚 Word Bank\n\n전 세계 학생들이 함께 만드는 **다국어 단어장**이에요!\n\n## 기여하는 방법\n1. 이 저장소를 **Fork** 하세요.\n2. `words.md` 에 새 단어를 한 줄 추가하세요.\n3. **Pull Request** 를 보내 주세요. 메인테이너가 확인 후 머지해요 🎉\n\n> 처음이라도 괜찮아요. `good first issue` 라벨이 붙은 이슈부터 시작해 보세요!\n',
    'words.md': '# Words\n\n| English | 한국어 | Español |\n|---|---|---|\n| apple | 사과 | manzana |\n| book | 책 | libro |\n| friend | 친구 | amigo |\n',
  };
  let c1 = G.mk(t1, [], 'Initial commit', 'octo-teacher', '', T0);
  t1 = { ...t1, 'CONTRIBUTING.md': '# 기여 안내\n\n- 한 PR에는 단어를 1~3개만 추가해 주세요.\n- 표 형식(`| English | 한국어 | Español |`)을 지켜 주세요.\n- 친절하게 리뷰해 드릴게요 😊\n' };
  let c2 = G.mk(t1, [c1], 'Add contributing guide', 'octo-teacher', '', T0 + 5 * day);
  t1 = { ...t1, 'words.md': t1['words.md'] + '| water | 물 | agua |\n' };
  let c3 = G.mk(t1, [c2], 'Add "water" (#3)', 'mina-dev', '', T0 + 9 * day);
  wb.branches.main = c3;
  wb.num = 5;
  wb.features.discussions = true;
  wb.issues.push({ n: 1, kind: 'issue', title: '스페인어 단어를 더 추가해 주세요', body: '단어장에 동물 이름이 부족해요.\n\n- [ ] dog / 개 / perro\n- [ ] cat / 고양이 / gato', author: 'octo-teacher', state: 'open', t: T0 + 2 * day, labels: ['good first issue', 'help wanted'], assignees: [], milestone: null, comments: [], tl: [], reactions: { '👍': 12 } });
  wb.issues.push({ n: 2, kind: 'issue', title: '표 정렬이 깨져 보여요', body: '모바일에서 표가 넘쳐요.', author: 'leo-k', state: 'closed', t: T0 + 3 * day, labels: ['bug'], assignees: [], milestone: null, comments: [], tl: [], reactions: {} });

  const st = G.repoNew({ owner: 'octo-academy', name: 'study-tips', desc: '공부 잘하는 팁 모음 ✍️', stars: 532, forks: 41 });
  st.branches.main = G.mk({ 'README.md': '# ✍️ Study Tips\n\n1. **조금씩 자주** 공부하기 (커밋처럼!)\n2. 배운 것을 남에게 설명해 보기\n3. 틀린 문제는 *이슈*처럼 기록해 두기\n' }, [], 'Initial commit', 'octo-teacher', '', T0 + 1 * day);
  const hw = G.repoNew({ owner: 'dain-friend', name: 'hello-world', desc: '내 첫 GitHub 저장소 👋', stars: 3 });
  hw.branches.main = G.mk({ 'README.md': '# hello-world 👋\n\n안녕하세요! 저는 **dain-friend**예요. GitHub 공부 중!\n', 'hello.py': 'print("Hello, World!")\n' }, [], 'first commit', 'dain-friend', '', T0 + 20 * day);
};

/* ---------- 저장소 ---------- */
G.repo = key => S.repos[key];
G.key = r => r.owner + '/' + r.name;
G.repoNew = o => {
  const key = o.owner + '/' + o.name;
  const r = {
    owner: o.owner, name: o.name, desc: o.desc || '', priv: !!o.priv, created: Date.now(), branches: {}, def: 'main', tags: {}, releases: [],
    issues: [], pulls: [], num: 1, labels: G.LABELS.map(l => ({ ...l })), milestones: [], stars: o.stars || 0, forks: o.forks || 0, watchers: o.watchers || 1,
    forkOf: o.forkOf || null, collab: [], protect: {}, pages: null, runs: [], projects: [], wiki: [], discs: [], alerts: [], blocked: [],
    features: { issues: true, projects: true, wiki: true, discussions: false }, recent: null,
  };
  S.repos[key] = r;
  const tree = {};
  if (o.readme) tree['README.md'] = `# ${o.name}\n${o.desc ? '\n' + o.desc + '\n' : ''}`;
  if (o.gitignore && G.GITIGNORE[o.gitignore]) tree['.gitignore'] = G.GITIGNORE[o.gitignore];
  if (o.license) tree['LICENSE'] = G.LICENSE(o.license, o.owner);
  if (Object.keys(tree).length) r.branches.main = G.mk(tree, [], 'Initial commit', o.owner);
  return r;
};
G.urlKey = url => {
  const m = String(url || '').trim().match(/^(?:https?:\/\/)?(?:www\.)?github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i) || String(url || '').trim().match(/^git@github\.com:([\w.-]+)\/([\w.-]+?)(?:\.git)?$/i);
  return m ? m[1] + '/' + m[2] : null;
};
G.findKey = k => { if (!k) return null; const f = Object.keys(S.repos).find(x => x.toLowerCase() === k.toLowerCase()); return f || null; };

G.findSecret = changes => { for (const [p, v] of Object.entries(changes)) if (typeof v === 'string' && !G.isBin(v) && G.SECRET_RE.test(v)) return p; return null; };

/* 웹(또는 봇)에서 커밋 */
G.commitTo = (key, br, changes, msg, desc, author, opt = {}) => {
  author = author || S.login;
  const r = S.repos[key]; const parent = r.branches[br];
  const tree = { ...G.treeOf(parent) };
  for (const [p, v] of Object.entries(changes)) { if (v === null) delete tree[p]; else tree[p] = v; }
  if (!opt.skipSecret) { const leak = G.findSecret(changes); if (leak) { r.blocked.push({ file: leak, t: Date.now(), by: author, br }); G.emit('secret:blocked', { key, file: leak }); return { ok: false, secret: leak }; } }
  if (!opt.force && author === S.login && r.protect[br]?.pr) return { ok: false, protected: true };
  const id = G.mk(tree, parent ? [parent] : [], msg, author, desc);
  r.branches[br] = id;
  G.afterPush(key, br, parent, id, author);
  return { ok: true, id };
};

const KW = /\b(close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/gi;
G.closeRefs = (key, text, by, via) => {
  const r = S.repos[key]; let m; KW.lastIndex = 0;
  while ((m = KW.exec(text || ''))) {
    const it = r.issues.find(i => i.n === +m[2]);
    if (it && it.state === 'open') { it.state = 'closed'; it.closedBy = via; it.tl.push({ t: Date.now(), type: 'closed', by, via }); G.emit('issue:closed', { key, n: it.n, via }); G.notify(`🔒 이슈 #${it.n}이(가) ${via}에 의해 자동으로 닫혔어요!`); }
  }
};
G.afterPush = (key, br, oldId, newId, by) => {
  const r = S.repos[key];
  if (by === S.login || by === S.name || by === S.local.cfg.name) G.bump();
  if (br !== r.def) r.recent = { br, t: Date.now() };
  if (br === r.def) G.ahead(oldId, newId).forEach(c => G.closeRefs(key, c.m + '\n' + c.d, by, 'commit ' + c.id.slice(0, 7)));
  G.wfTrigger(key, 'push', br, newId);
  r.pulls.filter(p => p.state === 'open' && p.hrepo === key && p.head === br).forEach(p => { G.wfTrigger(p.base && key, 'pull_request', br, newId); });
  if (r.pages && r.pages.branch === br) G.pagesBuild(key);
  if (br === r.def) G.depScan(key);
  G.feed(`${by} pushed to ${key}:${br}`);
};
G.feed = s => { S.feed.unshift({ s, t: Date.now() }); S.feed.length = Math.min(S.feed.length, 40); };

/* 브랜치 */
G.branchNew = (key, name, from) => { const r = S.repos[key]; if (!name || r.branches[name]) return false; r.branches[name] = r.branches[from || r.def]; return true; };
G.branchDel = (key, name) => { const r = S.repos[key]; if (name === r.def) return false; delete r.branches[name]; return true; };

/* ---------- 이슈 / PR ---------- */
G.issueNew = (key, o) => {
  const r = S.repos[key];
  const it = { n: r.num++, kind: 'issue', title: o.title, body: o.body || '', author: o.author || S.login, state: 'open', t: Date.now(), labels: o.labels || [], assignees: o.assignees || [], milestone: o.milestone || null, comments: [], tl: [], reactions: {} };
  r.issues.push(it); if (it.author === S.login) G.bump(); return it;
};
G.item = (key, n) => { const r = S.repos[key]; return r.issues.find(i => i.n === n) || r.pulls.find(p => p.n === n); };
G.prNew = (key, o) => {
  const r = S.repos[key];
  const pr = { n: r.num++, kind: 'pr', title: o.title, body: o.body || '', author: o.author || S.login, base: o.base, head: o.head, hrepo: o.hrepo || key, state: 'open', t: Date.now(), tl: [], comments: [], reviewers: [], reviews: [], labels: [], assignees: [], merged: null, reactions: {}, lineComments: [] };
  r.pulls.push(pr);
  if (pr.author === S.login) G.bump();
  const ht = S.repos[pr.hrepo]?.branches[pr.head];
  if (ht) G.wfTrigger(key, 'pull_request', pr.head, ht, null, pr.hrepo);
  return pr;
};
G.prInfo = (key, pr) => {
  const r = S.repos[key], hr = S.repos[pr.hrepo];
  const bt = pr.state === 'merged' ? pr.merged.baseTip : r.branches[pr.base];
  const ht = pr.state === 'merged' ? pr.headTip : hr?.branches[pr.head];
  if (!ht || !bt) return { missing: true, commits: [], files: [], conflicts: [] };
  const mb = G.mbase(bt, ht);
  const commits = G.ahead(bt, ht);
  const files = G.dtree(G.treeOf(mb), G.treeOf(ht));
  const m = G.merge3(G.treeOf(mb), G.treeOf(bt), G.treeOf(ht), pr.base, pr.head);
  const prot = r.protect[pr.base];
  const approvals = pr.reviews.filter(v => v.state === 'approved').length;
  const changesReq = pr.reviews.some(v => v.state === 'changes');
  const needRev = prot?.pr ? prot.approvals || 0 : 0;
  const runs = (hr || r).runs.filter(x => x.cid === ht && !x.pages);
  return { bt, ht, mb, commits, files, conflicts: m.conflicts, mergeTree: m.tree, needRev, approvals, changesReq, reviewOK: approvals >= needRev, runs };
};
G.prMerge = (key, pr, method, by) => {
  by = by || S.login;
  const r = S.repos[key], i = G.prInfo(key, pr);
  if (i.missing || i.conflicts.length) return { ok: false };
  const hOwner = pr.hrepo.split('/')[0];
  let id;
  if (method === 'squash') id = G.mk(i.mergeTree, [i.bt], `${pr.title} (#${pr.n})`, by, i.commits.map(c => '* ' + c.m).join('\n'));
  else if (method === 'rebase') {
    let tip = i.bt, tree = { ...G.treeOf(i.bt) };
    for (const c of i.commits) { if (c.p.length > 1) continue; G.dtree(G.treeOf(c.p[0]), c.tree).forEach(d => { if (d.k === 'del') delete tree[d.p]; else tree[d.p] = d.b; }); tip = G.mk(tree, [tip], c.m, c.a, c.d); }
    id = tip;
  } else id = G.mk(i.mergeTree, [i.bt, i.ht], `Merge pull request #${pr.n} from ${hOwner}/${pr.head}`, by, pr.title);
  const old = r.branches[pr.base];
  r.branches[pr.base] = id;
  pr.state = 'merged'; pr.headTip = i.ht; pr.merged = { by, t: Date.now(), method, commit: id, baseTip: old };
  pr.tl.push({ t: Date.now(), type: 'merged', by, commit: id });
  G.closeRefs(key, pr.title + '\n' + pr.body, by, `PR #${pr.n}`);
  G.afterPush(key, pr.base, old, id, by);
  r.alerts.forEach(a => { if (a.pr === pr.n) a.state = 'fixed'; });
  return { ok: true, id };
};
/* 웹 충돌 해결: base를 head 브랜치로 머지하는 커밋 생성 */
G.prResolve = (key, pr, resolved) => {
  const r = S.repos[key], hr = S.repos[pr.hrepo], i = G.prInfo(key, pr);
  const tree = { ...i.mergeTree, ...resolved };
  const id = G.mk(tree, [i.ht, i.bt], `Merge branch '${pr.base}' into ${pr.head}`, S.login);
  hr.branches[pr.head] = id; G.bump();
  pr.tl.push({ t: Date.now(), type: 'resolved', by: S.login, commit: id });
  return id;
};

/* ---------- 포크 ---------- */
G.fork = key => {
  const u = S.repos[key]; const nk = S.login + '/' + u.name;
  if (S.repos[nk]) return S.repos[nk];
  const r = G.repoNew({ owner: S.login, name: u.name, desc: u.desc, forkOf: key });
  r.branches = { [u.def]: u.branches[u.def] }; r.def = u.def; r.features.issues = false;
  u.forks++;
  return r;
};
G.forkStatus = key => {
  const r = S.repos[key]; if (!r?.forkOf) return null;
  const u = S.repos[r.forkOf]; if (!u) return null;
  const a = r.branches[r.def], b = u.branches[u.def];
  return { behind: G.ahead(a, b).length, ahead: G.ahead(b, a).length, up: u };
};
G.forkSync = key => {
  const r = S.repos[key], st = G.forkStatus(key); if (!st || !st.behind) return false;
  const a = r.branches[r.def], b = st.up.branches[st.up.def];
  if (G.isAnc(a, b)) r.branches[r.def] = b;
  else { const m = G.merge3(G.treeOf(G.mbase(a, b)), G.treeOf(a), G.treeOf(b), r.def, 'upstream'); if (m.conflicts.length) return false; r.branches[r.def] = G.mk(m.tree, [a, b], `Merge branch '${st.up.def}' of ${r.forkOf}`, S.login); }
  return true;
};

/* ---------- Actions ---------- */
G.wfParse = text => {
  const L = String(text || '').split('\n');
  const wf = { name: '', on: [], jobs: [] };
  let sec = null, job = null, step = null, inSteps = false, block = null;
  for (let k = 0; k < L.length; k++) {
    const raw = L[k]; if (/^\s*#/.test(raw) || !raw.trim()) { if (block && step) step.run += '\n'; continue; }
    const ind = raw.match(/^ */)[0].length, line = raw.trim();
    if (block) { if (ind > block) { step.run += (step.run ? '\n' : '') + line; continue; } block = null; }
    if (ind === 0) {
      const m = line.match(/^([\w-]+):\s*(.*)$/); if (!m) continue;
      sec = m[1];
      if (sec === 'name') wf.name = m[2].replace(/^['"]|['"]$/g, '');
      if (sec === 'on') { const v = m[2]; if (v) wf.on.push(...v.replace(/[\[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean)); }
      continue;
    }
    if (sec === 'on') { const m = line.match(/^([\w-]+):?/); if (m && ind <= 2) wf.on.push(m[1]); continue; }
    if (sec === 'jobs') {
      if (ind === 2) { const m = line.match(/^([\w-]+):/); if (m) { job = { id: m[1], name: '', steps: [] }; wf.jobs.push(job); inSteps = false; } continue; }
      if (!job) continue;
      if (ind === 4) { inSteps = line.startsWith('steps:'); const m = line.match(/^name:\s*(.*)$/); if (m) job.name = m[1].replace(/^['"]|['"]$/g, ''); continue; }
      if (inSteps) {
        let l = line;
        if (l.startsWith('- ')) { step = { name: '', run: null, uses: null }; job.steps.push(step); l = l.slice(2).trim(); }
        if (!step) continue;
        const m = l.match(/^([\w-]+):\s*(.*)$/); if (!m) continue;
        const v = m[2].replace(/^['"]|['"]$/g, '');
        if (m[1] === 'name') step.name = v;
        else if (m[1] === 'uses') step.uses = v;
        else if (m[1] === 'run') { if (v === '|' || v === '>') { step.run = ''; block = ind + (line.startsWith('- ') ? 2 : 0); } else step.run = v; }
      }
    }
  }
  return wf;
};
G.wfTrigger = (key, ev, br, cid, onlyFile, srcKey) => {
  const r = S.repos[key]; if (!r || !cid) return;
  const tree = G.treeOf(cid);
  Object.keys(tree).filter(p => /^\.github\/workflows\/[^/]+\.ya?ml$/.test(p)).forEach(p => {
    if (onlyFile && onlyFile !== p) return;
    const wf = G.wfParse(tree[p]);
    if (wf.on.includes(ev) && wf.jobs.length) G.runStart(key, wf, p, ev, br, cid);
  });
};
G.runStart = (key, wf, file, ev, br, cid) => {
  const r = S.repos[key];
  const mkS = s => ({ ...s, status: 'queued', concl: null, log: [] });
  const run = {
    id: S.seq.run++, n: r.runs.filter(x => x.file === file).length + 1, name: wf.name || file.split('/').pop(), file, ev, br, cid, msg: S.obj[cid].m, actor: S.obj[cid].a,
    status: 'queued', concl: null, t: Date.now(), pages: !!wf.pages,
    jobs: wf.jobs.map(j => ({ id: j.id, name: j.name || j.id, status: 'queued', concl: null, steps: [{ name: 'Set up job', sys: 1 }, ...j.steps.map(s => ({ name: s.name || (s.uses ? 'Run ' + s.uses : 'Run ' + String(s.run || '').split('\n')[0]), run: s.run, uses: s.uses })), { name: 'Complete job', sys: 2 }].map(mkS) })),
  };
  r.runs.unshift(run);
  G.runSchedule(key, run.id);
  return run;
};
G.runExec = (key, run, st) => {
  const r = S.repos[key], tree = G.treeOf(run.cid), log = st.log; let ok = true;
  if (st.sys === 1) log.push('Current runner version: 2.321.0', 'Operating System: Ubuntu 24.04 LTS', 'Runner Image: ubuntu-latest', `GITHUB_TOKEN Permissions: Contents: read`);
  else if (st.sys === 2) log.push('Cleaning up orphan processes', 'Job completed ✔');
  else if (st.pagesStep) log.push(...st.pagesStep);
  else if (st.uses) {
    const u = st.uses;
    if (/checkout/.test(u)) log.push(`Syncing repository: ${key}`, `Checking out the ref: refs/heads/${run.br}`, `HEAD is now at ${run.cid.slice(0, 7)} ${run.msg}`);
    else if (/setup-node/.test(u)) log.push('Attempting to download 20.x...', 'Node.js 20.18.0 installed ✔');
    else if (/setup-python/.test(u)) log.push('Installed versions: Python 3.12.7 ✔');
    else log.push(`Download action repository '${u}'`, 'Done ✔');
  } else if (st.run != null) {
    const cmds = String(st.run).split('\n').map(s => s.trim()).filter(Boolean);
    log.push('\u001b[cmd]Run ' + cmds[0] + (cmds.length > 1 ? ' …' : ''));
    for (const c of cmds) {
      let m;
      if ((m = c.match(/^echo\s+(.*)$/))) log.push(m[1].replace(/^['"]|['"]$/g, '').replace(/\$\{\{\s*github\.actor\s*\}\}/g, run.actor).replace(/\$\{\{\s*github\.ref_name\s*\}\}/g, run.br).replace(/\$\{\{\s*github\.repository\s*\}\}/g, key).replace(/\$\{\{\s*github\.event_name\s*\}\}/g, run.ev));
      else if ((m = c.match(/^exit\s+(\d+)/))) { if (+m[1] !== 0) { log.push(`\u001b[err]Error: Process completed with exit code ${m[1]}.`); ok = false; break; } }
      else if (/^ls/.test(c)) log.push(Object.keys(tree).filter(p => !p.includes('/')).join('  ') || '(빈 폴더)');
      else if ((m = c.match(/^cat\s+(\S+)/))) { const f = tree[m[1]]; if (f === undefined) { log.push(`\u001b[err]cat: ${m[1]}: No such file or directory`); ok = false; break; } log.push(...G.lines(f)); }
      else if (/^npm (ci|install|i)\b/.test(c)) { if (!tree['package.json']) { log.push('\u001b[err]npm ERR! enoent Could not read package.json'); ok = false; break; } log.push('added 42 packages, and audited 43 packages in 2s', 'found 0 vulnerabilities'); }
      else if (/^npm (run )?test/.test(c)) { let pj = null; try { pj = JSON.parse(tree['package.json'] || 'null'); } catch (e) {} if (!pj?.scripts?.test) { log.push('\u001b[err]npm ERR! Missing script: "test"'); ok = false; break; } log.push('> test', '> ' + pj.scripts.test, '✓ 3 tests passed'); if (/exit 1|fail/.test(pj.scripts.test)) { ok = false; log.push('\u001b[err]Tests failed'); break; } }
      else if (/^npm run build/.test(c)) log.push('> build', 'Build finished ✔');
      else if (/^python/.test(c)) { const f = c.split(/\s+/)[1]; const src = tree[f] || ''; const outs = [...src.matchAll(/print\((['"])(.*?)\1\)/g)].map(x => x[2]); log.push(...(outs.length ? outs : ['(파이썬 실행 완료)'])); }
      else if (/^pip install/.test(c)) log.push('Successfully installed packages ✔');
      else log.push(`(시뮬레이션) "${c}" 실행 완료`);
    }
  }
  return ok;
};
G.runStep = (key, id) => {
  const r = S.repos[key]; const run = r?.runs.find(x => x.id === id); if (!run || run.status === 'completed') return false;
  run.status = 'in_progress';
  const job = run.jobs.find(j => j.status !== 'completed'); if (!job) { run.status = 'completed'; run.concl = run.jobs.every(j => j.concl === 'success') ? 'success' : 'failure'; run.done = Date.now(); G.onRunDone(key, run); return false; }
  job.status = 'in_progress';
  const st = job.steps.find(s => s.status !== 'completed');
  if (!st) { job.status = 'completed'; job.concl = job.steps.some(s => s.concl === 'failure') ? 'failure' : 'success'; return true; }
  const failed = job.steps.some(s => s.concl === 'failure');
  st.status = 'completed';
  if (failed && st.sys !== 2) { st.concl = 'skipped'; return true; }
  st.concl = G.runExec(key, run, st) ? 'success' : 'failure';
  return true;
};
G.runSchedule = (key, id) => {
  const tick = () => { const more = G.runStep(key, id); G.onChange('run'); if (more) setTimeout(tick, 450 + Math.random() * 350); };
  setTimeout(tick, 900);
};
G.runFinishAll = () => { Object.keys(S.repos).forEach(k => S.repos[k].runs.forEach(run => { if (run.status !== 'completed') { let g = 0; while (G.runStep(k, run.id) && g++ < 500); } })); };
G.onRunDone = (key, run) => {
  if (run.pages) { const r = S.repos[key]; if (r.pages) { r.pages.status = 'built'; r.pages.t = Date.now(); } G.emit('pages:built', { key }); G.notify('🌐 GitHub Pages 배포 완료! 사이트가 열렸어요.'); }
  else G.notify(run.concl === 'success' ? `✅ Actions "${run.name}" 성공!` : `❌ Actions "${run.name}" 실패 — 로그를 확인해 보세요.`);
  G.emit('run:done', { key, run });
};
G.runDispatch = (key, file) => { const r = S.repos[key]; const cid = r.branches[r.def]; const wf = G.wfParse(G.treeOf(cid)[file]); return G.runStart(key, wf, file, 'workflow_dispatch', r.def, cid); };

/* ---------- Pages ---------- */
G.pagesBuild = key => {
  const r = S.repos[key]; if (!r.pages) return; const cid = r.branches[r.pages.branch]; if (!cid) return;
  r.pages.status = 'building';
  const wf = { name: 'pages build and deployment', pages: true, jobs: [{ id: 'build', name: 'build', steps: [] }, { id: 'deploy', name: 'deploy', steps: [] }] };
  const run = G.runStart(key, wf, '(dynamic)', 'dynamic', r.pages.branch, cid);
  run.jobs[0].steps.splice(1, 0, { name: 'Checkout', status: 'queued', log: [], pagesStep: ['Syncing repository: ' + key] }, { name: 'Build with Jekyll', status: 'queued', log: [], pagesStep: ['Source: /github/workspace/', 'Generating...', 'done in 0.4 seconds.'] }, { name: 'Upload artifact', status: 'queued', log: [], pagesStep: ['Artifact github-pages uploaded ✔'] });
  run.jobs[1].steps.splice(1, 0, { name: 'Deploy to GitHub Pages', status: 'queued', log: [], pagesStep: ['Created deployment for ' + cid.slice(0, 7), `Reported success! 🌐 https://${r.owner.toLowerCase()}.github.io/${r.name}/`] });
};
G.pagesUrl = r => (r.name.toLowerCase() === r.owner.toLowerCase() + '.github.io' ? `https://${r.owner.toLowerCase()}.github.io/` : `https://${r.owner.toLowerCase()}.github.io/${r.name}/`);

/* ---------- Dependabot ---------- */
G.depScan = key => {
  const r = S.repos[key]; const t = G.tree(r, r.def); let pj = null;
  try { pj = JSON.parse(t['package.json'] || 'null'); } catch (e) {}
  const v = pj?.dependencies?.lodash || pj?.devDependencies?.lodash;
  const vuln = !!v && G.verLt(String(v).replace(/[^\d.]/g, ''), '4.17.21');
  const a = r.alerts.find(x => x.pkg === 'lodash' && x.state === 'open');
  if (vuln && !a) { r.alerts.push({ id: r.alerts.length + 1, pkg: 'lodash', cur: v, fix: '4.17.21', sev: 'High', title: 'Command Injection in lodash', state: 'open', t: Date.now(), pr: null }); G.emit('alert:new', { key }); G.notify('🛡️ Dependabot이 취약한 라이브러리를 발견했어요! Security 탭을 확인해 보세요.'); }
  if (!vuln && a) { a.state = 'fixed'; G.emit('alert:fixed', { key }); }
};
G.depPR = (key, alert) => {
  const r = S.repos[key]; const br = 'dependabot/npm_and_yarn/lodash-4.17.21';
  const pj = G.tree(r, r.def)['package.json'];
  r.branches[br] = r.branches[r.def];
  const nv = pj.replace(/("lodash"\s*:\s*")[^"]*(")/, '$1^4.17.21$2');
  G.commitTo(key, br, { 'package.json': nv }, `Bump lodash from ${alert.cur.replace(/[^\d.]/g, '')} to 4.17.21`, '', 'dependabot[bot]', { force: true });
  const pr = G.prNew(key, { title: `Bump lodash from ${alert.cur.replace(/[^\d.]/g, '')} to 4.17.21`, body: `Bumps [lodash](https://github.com/lodash/lodash) from ${alert.cur} to 4.17.21.\n\n**보안 업데이트:** Command Injection 취약점이 해결된 버전이에요.\n\n---\n*Dependabot이 자동으로 만든 PR이에요 🤖*`, base: r.def, head: br, author: 'dependabot[bot]' });
  pr.labels = ['dependencies'];
  if (!r.labels.find(l => l.name === 'dependencies')) r.labels.push({ name: 'dependencies', color: '0366d6', desc: 'Pull requests that update a dependency file' });
  alert.pr = pr.n;
  return pr;
};

/* ---------- 봇 (친구·메인테이너) ---------- */
const sched = new Set();
const later = (id, ms, fn) => { if (sched.has(id)) return; sched.add(id); setTimeout(() => { try { fn(); } finally { G.onChange('bot'); } }, ms); };
G.botTick = () => {
  if (!S) return;
  Object.entries(S.repos).forEach(([key, r]) => {
    r.collab.filter(c => c.status === 'pending').forEach(c => later('inv' + key + c.name, 2200, () => { c.status = 'accepted'; G.notify(`🤝 ${c.name}님이 ${key} 초대를 수락했어요!`); G.emit('collab:accepted', { key, name: c.name }); }));
    r.pulls.filter(p => p.state === 'open').forEach(pr => {
      pr.reviewers.forEach(rv => {
        if (pr.reviews.some(v => v.by === rv)) return;
        later('rv' + key + pr.n + rv, 2600, () => {
          if (pr.reviews.some(v => v.by === rv) || pr.state !== 'open') return;
          pr.reviews.push({ by: rv, state: 'approved', body: '꼼꼼하게 잘 작성했네요! 변경 내용 확인했어요. LGTM 👍 (Looks Good To Me)', t: Date.now() });
          G.notify(`✅ ${rv}님이 PR #${pr.n}을(를) 승인(Approve)했어요!`); G.emit('pr:approved', { key, n: pr.n, by: rv });
        });
      });
      if (key === 'octo-academy/word-bank' && pr.author === S.login) {
        later('mt' + key + pr.n, 3800, () => {
          if (pr.state !== 'open') return;
          const i = G.prInfo(key, pr);
          if (i.conflicts.length) { pr.comments.push({ a: 'octo-teacher', body: '앗, 충돌(conflict)이 있어요. 최신 내용으로 Sync fork 한 뒤 다시 보내 주세요 🙏', t: Date.now(), reactions: {} }); G.notify('💬 메인테이너가 PR에 코멘트를 남겼어요.'); return; }
          pr.comments.push({ a: 'octo-teacher', body: `@${S.login} 첫 기여 정말 고마워요! 🎉 단어장에 잘 추가할게요.`, t: Date.now(), reactions: { '🎉': 3 } });
          pr.reviews.push({ by: 'octo-teacher', state: 'approved', body: 'Looks great!', t: Date.now() });
          G.prMerge(key, pr, 'merge', 'octo-teacher');
          G.notify(`🎉 메인테이너 octo-teacher님이 PR #${pr.n}을(를) 머지했어요! 오픈소스 기여 성공!`); G.emit('pr:merge', { key, n: pr.n, by: 'octo-teacher', method: 'merge' });
        });
      }
    });
    r.discs.filter(d => d.cat === 'Q&A' && d.author === S.login && !d.comments.some(c => c.a === 'dain-friend')).forEach(d => {
      later('ds' + key + d.n, 3000, () => {
        d.comments.push({ a: 'dain-friend', body: '좋은 질문이에요! 저도 처음엔 헷갈렸는데, **브랜치**는 원본을 건드리지 않고 마음껏 실험할 수 있는 *평행 세계* 같은 거예요 🌿 실험이 끝나면 Pull Request로 합치면 돼요!', t: Date.now(), up: 2 });
        G.notify('💬 dain-friend님이 디스커션에 답변을 달았어요!'); G.emit('disc:reply', { key, n: d.n });
      });
    });
  });
};
