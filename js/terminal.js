/* =========================================================
   가상 터미널 + 로컬 Git
   ========================================================= */
'use strict';
const T = (window.T = {});
const tesc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

T.out = [];
T.hIdx = -1;
T.print = (text, cls = '') => {
  String(text).split('\n').forEach(l => T.out.push({ l, cls }));
  if (T.out.length > 600) T.out.splice(0, T.out.length - 600);
};
T.tip = t => T.print('💡 ' + t, 'tip');
T.err = t => T.print(t, 'err');

const L = () => G.S().local;
const dir = () => (L().cwd ? L().home[L().cwd] : null);
const git = () => dir()?.git || null;
const headId = g => g.branches[g.HEAD];
const headTree = g => G.treeOf(headId(g));
const author = () => L().cfg.name || G.S().login;

T.prompt = () => {
  const S = G.S(), d = dir(), g = d?.git;
  let br = '';
  if (g) br = g.merging ? ` (${g.HEAD}|MERGING)` : ` (${g.HEAD})`;
  return `<span class="p-user">${tesc(S.login)}@my-pc</span>:<span class="p-dir">~${L().cwd ? '/' + tesc(L().cwd) : ''}</span><span class="p-br">${tesc(br)}</span>$`;
};

/* ---------- 토크나이저 ---------- */
T.tokens = s => {
  const out = []; let cur = '', q = null, has = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) { if (ch === q) q = null; else cur += ch; continue; }
    if (ch === '"' || ch === "'") { q = ch; has = true; continue; }
    if (ch === '>' ) { if (cur || has) { out.push(cur); cur = ''; has = false; } if (s[i + 1] === '>') { out.push('>>'); i++; } else out.push('>'); continue; }
    if (/\s/.test(ch)) { if (cur || has) { out.push(cur); cur = ''; has = false; } continue; }
    cur += ch;
  }
  if (cur || has) out.push(cur);
  return out;
};
const splitAnd = s => { const parts = []; let cur = '', q = null; for (let i = 0; i < s.length; i++) { const ch = s[i]; if (q) { if (ch === q) q = null; cur += ch; continue; } if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; } if (ch === '&' && s[i + 1] === '&') { parts.push(cur); cur = ''; i++; continue; } cur += ch; } parts.push(cur); return parts.map(x => x.trim()).filter(Boolean); };

T.run = line => {
  const S = G.S();
  T.print(T.prompt().replace(/<[^>]+>/g, '') + ' ' + line, 'cmdline');
  if (line.trim()) { L().hist.push(line); if (L().hist.length > 100) L().hist.shift(); }
  for (const part of splitAnd(line)) { const ok = T.exec(part); if (ok === false) break; }
  G.save();
};

T.exec = line => {
  const a = T.tokens(line); if (!a.length) return true;
  const cmd = a[0];
  const sh = T.SH[cmd];
  if (cmd === 'git') return T.git(a.slice(1), line);
  if (sh) return sh(a.slice(1), line);
  if (cmd === 'gh') { T.err('gh: 이 연습장에서는 GitHub CLI(gh)를 지원하지 않아요.'); T.tip('gh는 터미널에서 PR·이슈를 다루는 공식 도구예요. 실제 컴퓨터에서 "gh auth login"으로 시작할 수 있어요.'); return false; }
  T.err(`${cmd}: command not found`);
  T.tip('사용 가능한 명령은 help 를 입력해 확인해 보세요.');
  return false;
};

/* ---------- 파일 유틸 ---------- */
const files = () => (dir() ? dir().files : L().loose || (L().loose = {}));
const ignoreList = () => { const gi = files()['.gitignore']; return gi ? gi.split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#')) : []; };
const isIgnored = p => ignoreList().some(pat => {
  if (pat.endsWith('/')) return p.startsWith(pat);
  if (pat.includes('*')) { const re = new RegExp('^' + pat.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*') + '$'); return re.test(p) || re.test(p.split('/').pop()); }
  return p === pat || p.split('/').pop() === pat || p.startsWith(pat + '/');
});
T.isIgnored = isIgnored;

T.SH = {
  help: () => {
    T.print('사용 가능한 명령어', 'ok');
    T.print('  ls, cd <폴더>, pwd, cat <파일>, echo "글" > <파일>, touch, rm, mkdir, clear, history');
    T.print('  edit <파일>   ← 파일을 편집기로 열어요 (nano, code 도 같아요)');
    T.print('  git --version, git config, git init, git clone, git status, git add, git commit');
    T.print('  git log, git diff, git branch, git switch, git checkout, git merge');
    T.print('  git push, git pull, git fetch, git remote, git restore, git stash, git tag, git show, git rm, git mv');
    T.tip('↑/↓ 키로 이전 명령, Tab 키로 자동완성을 쓸 수 있어요.');
    return true;
  },
  clear: () => { T.out = []; return true; },
  pwd: () => { T.print('/home/' + G.S().login + (L().cwd ? '/' + L().cwd : '')); return true; },
  whoami: () => { T.print(G.S().login); return true; },
  history: () => { L().hist.forEach((h, i) => T.print(String(i + 1).padStart(4) + '  ' + h)); return true; },
  ls: a => {
    const all = a.includes('-a') || a.includes('-la') || a.includes('-al');
    if (!L().cwd) {
      const names = Object.keys(L().home).map(n => n + '/').concat(Object.keys(files()));
      T.print(names.length ? names.join('  ') : '(비어 있어요)', names.length ? 'dirs' : 'dim');
      G.emit('sh:ls', { cwd: '' }); return true;
    }
    const f = files(); const top = new Set();
    Object.keys(f).forEach(p => { const i = p.indexOf('/'); top.add(i > 0 ? p.slice(0, i + 1) : p); });
    let list = [...top].sort();
    if (!all) list = list.filter(x => !x.startsWith('.'));
    else list = ['.', '..', ...(dir().git ? ['.git/'] : []), ...list];
    T.print(list.length ? list.join('  ') : '(비어 있어요)', 'dirs');
    G.emit('sh:ls', { cwd: L().cwd });
    return true;
  },
  cd: a => {
    const t = (a[0] || '~').replace(/\/$/, '');
    if (t === '~' || t === '..' || t === '/home/' + G.S().login) { L().cwd = ''; G.emit('sh:cd', { cwd: '' }); return true; }
    if (t === '.') return true;
    const name = t.replace(/^~\//, '');
    if (!L().cwd && L().home[name]) { L().cwd = name; G.emit('sh:cd', { cwd: name }); return true; }
    if (L().cwd && Object.keys(files()).some(p => p.startsWith(name + '/'))) { T.tip('이 연습장에서는 저장소 최상위 폴더에서 작업해요. 하위 폴더 파일은 "폴더/파일" 경로로 써 주세요 (예: cat docs/a.md).'); return true; }
    T.err(`cd: ${t}: No such file or directory`); return false;
  },
  mkdir: a => {
    const n = a.filter(x => !x.startsWith('-'))[0]; if (!n) { T.err('mkdir: missing operand'); return false; }
    if (L().cwd) { T.tip('Git은 빈 폴더를 기록하지 않아요. 폴더 안에 파일을 만들면(예: echo hi > docs/a.md) 폴더가 생겨요.'); return true; }
    if (L().home[n]) { T.err(`mkdir: cannot create directory '${n}': File exists`); return false; }
    L().home[n] = { files: {}, git: null }; G.emit('sh:mkdir', { name: n }); return true;
  },
  touch: a => { a.forEach(p => { if (files()[p] === undefined) files()[p] = ''; G.emit('sh:write', { file: p, content: files()[p] }); }); return true; },
  cat: a => {
    if (!a[0]) { T.err('cat: 파일 이름을 적어 주세요'); return false; }
    for (const p of a) {
      const v = files()[p];
      if (v === undefined) { if (!L().cwd && L().home[p]) T.err(`cat: ${p}: Is a directory`); else T.err(`cat: ${p}: No such file or directory`); return false; }
      if (G.isBin(v)) T.print('(이미지/바이너리 파일이에요)', 'dim');
      else T.print(v.replace(/\n$/, ''), /^(<<<<<<<|=======|>>>>>>>)/m.test(v) ? 'conflict' : '');
      G.emit('sh:cat', { file: p, content: v });
    }
    return true;
  },
  echo: (a) => {
    const gi = a.findIndex(x => x === '>' || x === '>>');
    if (gi < 0) { T.print(a.join(' ')); return true; }
    const text = a.slice(0, gi).join(' '), f = a[gi + 1];
    if (!f) { T.err('bash: syntax error near unexpected token `newline\''); return false; }
    if (!L().cwd && L().home[f]) { T.err(`bash: ${f}: Is a directory`); return false; }
    const prev = files()[f];
    files()[f] = a[gi] === '>>' ? (prev ? (prev.endsWith('\n') ? prev : prev + '\n') : '') + text + '\n' : text + '\n';
    G.emit('sh:write', { file: f, content: files()[f] });
    return true;
  },
  rm: a => {
    const fs = a.filter(x => !x.startsWith('-')); if (!fs.length) { T.err('rm: missing operand'); return false; }
    for (const p of fs) {
      if (!L().cwd && L().home[p]) { if (!a.some(x => /r/.test(x) && x.startsWith('-'))) { T.err(`rm: cannot remove '${p}': Is a directory`); return false; } delete L().home[p]; continue; }
      if (files()[p] === undefined) { T.err(`rm: cannot remove '${p}': No such file or directory`); return false; }
      delete files()[p]; G.emit('sh:rm', { file: p });
    }
    return true;
  },
  mv: a => { const [x, y] = a; if (files()[x] === undefined) { T.err(`mv: cannot stat '${x}': No such file or directory`); return false; } files()[y] = files()[x]; delete files()[x]; return true; },
  edit: a => { if (!a[0]) { T.err('편집할 파일 이름을 적어 주세요. 예: edit hello.txt'); return false; } T.openEditor(a[0]); return true; },
};
T.SH.nano = T.SH.edit; T.SH.code = T.SH.edit; T.SH.vim = T.SH.edit; T.SH.vi = T.SH.edit; T.SH.dir = T.SH.ls; T.SH.cls = T.SH.clear;

T.openEditor = path => {
  const v = files()[path] ?? '';
  if (G.isBin(v)) { T.err('바이너리 파일은 편집할 수 없어요.'); return; }
  App.modal(`<h3>📝 ${tesc(path)} 편집 <small class="muted">(터미널 편집기)</small></h3>
    <textarea id="te-area" class="code-area" rows="14" spellcheck="false">${tesc(v)}</textarea>
    <p class="muted small">저장하면 작업 폴더의 파일이 바뀌어요. 바뀐 내용은 <code>git status</code>로 확인할 수 있어요.</p>
    <div class="row-end"><button class="btn" data-a="modal-close">취소</button><button class="btn btn-primary" id="te-save">💾 저장 (Ctrl+S)</button></div>`, { wide: true });
  const ta = document.getElementById('te-area'); ta.focus();
  const save = () => { files()[path] = ta.value.endsWith('\n') || !ta.value ? ta.value : ta.value + '\n'; T.print(`"${path}" 저장됨 (${G.lines(files()[path]).length}줄)`, 'ok'); G.emit('sh:write', { file: path, content: files()[path], editor: true }); App.closeModal(); G.save(); T.render(); T.focus(); };
  document.getElementById('te-save').onclick = save;
  ta.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } });
};

/* ---------- 상태 계산 ---------- */
T.status = g => {
  const d = dir(), head = headTree(g), idx = g.index, work = d.files;
  const staged = G.dtree(head, idx);
  const unstaged = [], untracked = [];
  Object.keys(idx).forEach(p => { if (g.merging?.conflicts.includes(p)) return; if (work[p] === undefined) unstaged.push({ p, k: 'del' }); else if (work[p] !== idx[p]) unstaged.push({ p, k: 'mod' }); });
  Object.keys(work).forEach(p => { if (idx[p] === undefined && !isIgnored(p)) untracked.push(p); });
  return { staged: staged.filter(s => !g.merging?.conflicts.includes(s.p)), unstaged, untracked, conflicts: g.merging?.conflicts || [] };
};
const dirtyPaths = g => { const st = T.status(g); return new Set([...st.staged.map(x => x.p), ...st.unstaged.map(x => x.p), ...st.conflicts]); };
const checkoutTree = (g, target, ctxName) => {
  const head = headTree(g), dirty = dirtyPaths(g), d = dir();
  const conflict = [...dirty].filter(p => head[p] !== target[p]);
  const untrackedClash = Object.keys(target).filter(p => head[p] === undefined && d.files[p] !== undefined && d.files[p] !== target[p] && g.index[p] === undefined);
  if (conflict.length || untrackedClash.length) {
    T.err(`error: Your local changes to the following files would be overwritten by ${ctxName}:`);
    [...conflict, ...untrackedClash].forEach(p => T.err('\t' + p));
    T.err('Please commit your changes or stash them before you switch branches.');
    T.tip('바뀐 내용을 먼저 커밋(git commit)하거나 임시 저장(git stash)한 뒤 다시 시도해 보세요.');
    return false;
  }
  const ni = { ...target };
  dirty.forEach(p => { if (g.index[p] === undefined) delete ni[p]; else ni[p] = g.index[p]; });
  new Set([...Object.keys(head), ...Object.keys(target)]).forEach(p => { if (dirty.has(p)) return; if (target[p] === undefined) delete d.files[p]; else d.files[p] = target[p]; });
  g.index = ni;
  return true;
};
const deco = (g, id) => {
  const out = [];
  Object.entries(g.branches).forEach(([b, x]) => { if (x === id) out.push(b === g.HEAD ? 'HEAD -> ' + b : b); });
  Object.entries(g.rt).forEach(([b, x]) => { if (x === id) out.push(b); });
  Object.entries(g.tags || {}).forEach(([b, x]) => { if (x === id) out.push('tag: ' + b); });
  if (out.length && !out.some(o => o.startsWith('HEAD'))) { if (headId(g) === id) out.unshift('HEAD'); }
  return out.length ? ` (${out.join(', ')})` : '';
};
const remoteKey = (g, name = 'origin') => { const u = g.remotes[name]; return u ? G.findKey(G.urlKey(u)) : null; };
const fmtDate = t => new Date(t).toString().replace(/ GMT.*$/, ' +0900');
const changeSummary = (a, b) => {
  const ds = G.dtree(a, b); let add = 0, del = 0; ds.forEach(d => { const s = G.stat(d.a, d.b); add += s.add; del += s.del; });
  const lines = [` ${ds.length} file${ds.length === 1 ? '' : 's'} changed${add ? `, ${add} insertion${add === 1 ? '' : 's'}(+)` : ''}${del ? `, ${del} deletion${del === 1 ? '' : 's'}(-)` : ''}`];
  ds.forEach(d => { if (d.k === 'add') lines.push(` create mode 100644 ${d.p}`); if (d.k === 'del') lines.push(` delete mode 100644 ${d.p}`); });
  return lines;
};

/* ---------- git ---------- */
T.git = (a, raw) => {
  const S = G.S(); const sub = a[0];
  if (!sub || sub === 'help' || sub === '--help') { T.print('usage: git [--version] <command> [<args>]\n\n자주 쓰는 명령: init clone status add commit log branch switch merge push pull fetch'); return true; }
  if (sub === '--version' || sub === 'version') { T.print('git version 2.47.1'); G.emit('git:version', {}); return true; }
  if (sub === 'config') return T.gconfig(a.slice(1));
  if (sub === 'clone') return T.gclone(a.slice(1));
  if (sub === 'init') return T.ginit();
  const g = git();
  if (!g) { T.err('fatal: not a git repository (or any of the parent directories): .git'); T.tip(L().cwd ? '이 폴더는 아직 Git 저장소가 아니에요. git init 으로 시작하거나, git clone 한 폴더로 cd 해 보세요.' : '지금은 홈 폴더(~)예요. ls 로 폴더를 확인하고 cd 폴더이름 으로 저장소 안에 들어가세요.'); return false; }
  const f = T.G[sub];
  if (!f) { T.err(`git: '${sub}' is not a git command. See 'git --help'.`); return false; }
  return f(g, a.slice(1), raw);
};

T.gconfig = a => {
  const c = L().cfg; const args = a.filter(x => x !== '--global' && x !== '--local');
  if (args[0] === '--list' || args[0] === '-l') { Object.entries(c).forEach(([k, v]) => T.print(`user.${k}=${v}`)); if (!Object.keys(c).length) T.print('(설정 없음)', 'dim'); return true; }
  const k = args[0], v = args.slice(1).join(' ');
  const m = k && k.match(/^user\.(name|email)$/);
  if (!m) { if (k === 'init.defaultBranch' || k === 'core.editor' || k === 'pull.rebase') { T.print(''); T.tip(`${k} 설정을 저장했어요 (연습장에서는 기록만 해요).`); return true; } T.err('error: key does not contain a section: ' + (k || '')); return false; }
  if (!v) { if (c[m[1]]) T.print(c[m[1]]); return true; }
  c[m[1]] = v;
  T.tip(m[1] === 'name' ? `이제 커밋 작성자 이름이 "${v}"(으)로 기록돼요.` : `커밋에 이메일 "${v}"이(가) 기록돼요. GitHub 계정 이메일과 같게 하면 잔디가 심어져요 🌱`);
  G.emit('git:config', { key: m[1], value: v });
  return true;
};

T.gclone = a => {
  const url = a.find(x => !x.startsWith('-')); const dest = a.filter(x => !x.startsWith('-'))[1];
  if (!url) { T.err('fatal: You must specify a repository to clone.'); T.tip('예: git clone https://github.com/' + G.S().login + '/my-first-repo.git'); return false; }
  if (L().cwd) { T.tip('보통은 홈 폴더(~)에서 clone 해요. 먼저 cd ~ 로 이동해 볼까요?'); }
  const key = G.findKey(G.urlKey(url));
  if (!key) { T.print(`Cloning into '${(G.urlKey(url) || url).split('/').pop()}'...`); T.err('remote: Repository not found.'); T.err(`fatal: repository '${url}' not found`); T.tip('주소를 다시 확인하세요. 저장소 화면의 초록색 "<> Code" 버튼에서 주소를 복사할 수 있어요.'); return false; }
  const r = G.repo(key); const name = dest || r.name;
  if (L().cwd) { T.err('이 연습장에서는 홈 폴더(~)에서만 clone 할 수 있어요. cd ~ 를 먼저 입력하세요.'); return false; }
  if (L().home[name]) { T.err(`fatal: destination path '${name}' already exists and is not an empty directory.`); T.tip(`이미 받아 둔 폴더가 있어요. cd ${name} 으로 들어가서 git pull 로 최신 내용을 받을 수 있어요.`); return false; }
  T.print(`Cloning into '${name}'...`);
  const g = { branches: {}, HEAD: r.def, index: {}, remotes: { origin: `https://github.com/${key}.git` }, rt: {}, up: {}, merging: null, stash: [], tags: { ...r.tags } };
  Object.entries(r.branches).forEach(([b, id]) => (g.rt['origin/' + b] = id));
  const tip = r.branches[r.def];
  if (tip) { g.branches[r.def] = tip; g.up[r.def] = 'origin/' + r.def; g.index = { ...G.treeOf(tip) }; const n = G.anc(tip).size; T.print(`remote: Enumerating objects: ${n * 3}, done.\nremote: Total ${n * 3} (delta 0), reused 0 (delta 0)\nReceiving objects: 100% (${n * 3}/${n * 3}), done.`); }
  else T.print('warning: You appear to have cloned an empty repository.', 'warn');
  L().home[name] = { files: { ...G.treeOf(tip) }, git: g };
  T.tip(`"${name}" 폴더가 생겼어요! cd ${name} 으로 들어가 보세요.`);
  G.emit('git:clone', { key, name });
  return true;
};

T.ginit = () => {
  if (!L().cwd) { T.err('홈 폴더에서는 git init을 하지 않는 게 좋아요.'); T.tip('mkdir my-project → cd my-project → git init 순서로 해 보세요.'); return false; }
  const d = dir();
  if (d.git) { T.print(`Reinitialized existing Git repository in /home/${G.S().login}/${L().cwd}/.git/`); return true; }
  d.git = { branches: {}, HEAD: 'main', index: {}, remotes: {}, rt: {}, up: {}, merging: null, stash: [], tags: {} };
  T.print(`Initialized empty Git repository in /home/${G.S().login}/${L().cwd}/.git/`);
  T.tip('숨겨진 .git 폴더가 생겼어요. 이제 이 폴더의 변화를 Git이 기록할 수 있어요! (ls -a 로 확인)');
  G.emit('git:init', { name: L().cwd });
  return true;
};

T.G = {};
T.G.status = g => {
  const st = T.status(g);
  T.print(`On branch ${g.HEAD}`);
  const up = g.up[g.HEAD];
  if (!headId(g)) T.print('\nNo commits yet');
  else if (up && g.rt[up]) {
    const ah = G.ahead(g.rt[up], headId(g)).length, bh = G.ahead(headId(g), g.rt[up]).length;
    if (!ah && !bh) T.print(`Your branch is up to date with '${up}'.`);
    else if (ah && !bh) { T.print(`Your branch is ahead of '${up}' by ${ah} commit${ah > 1 ? 's' : ''}.\n  (use "git push" to publish your local commits)`); }
    else if (bh && !ah) T.print(`Your branch is behind '${up}' by ${bh} commit${bh > 1 ? 's' : ''}, and can be fast-forwarded.\n  (use "git pull" to update your local branch)`);
    else T.print(`Your branch and '${up}' have diverged.`);
  }
  if (g.merging) T.print('\nYou have unmerged paths.\n  (fix conflicts and run "git commit")\n  (use "git merge --abort" to abort the merge)');
  const label = k => (k === 'add' ? 'new file:   ' : k === 'del' ? 'deleted:    ' : 'modified:   ');
  if (st.staged.length) { T.print('\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)'); st.staged.forEach(s => T.print('\t' + label(s.k) + s.p, 'g')); }
  if (st.conflicts.length) { T.print('\nUnmerged paths:\n  (use "git add <file>..." to mark resolution)'); st.conflicts.forEach(p => T.print('\tboth modified:   ' + p, 'r')); }
  if (st.unstaged.length) { T.print('\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)'); st.unstaged.forEach(s => T.print('\t' + label(s.k) + s.p, 'r')); }
  if (st.untracked.length) { T.print('\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)'); st.untracked.forEach(p => T.print('\t' + p, 'r')); }
  if (!st.staged.length && !st.unstaged.length && !st.untracked.length && !st.conflicts.length) T.print(headId(g) ? '\nnothing to commit, working tree clean' : '\nnothing to commit (create/copy files and use "git add" to track)');
  else if (!st.staged.length && !g.merging) T.print(`\nno changes added to commit (use "git add" and/or "git commit -a")`);
  if (st.untracked.length) T.tip('빨간 Untracked 파일은 Git이 아직 모르는 새 파일이에요. git add 로 스테이지에 올려 주세요.');
  else if (st.unstaged.length) T.tip('빨간색 = 바뀌었지만 아직 add 안 함, 초록색 = 커밋 준비 완료(스테이지)예요.');
  else if (st.staged.length) T.tip('초록색 파일이 커밋 준비 완료! git commit -m "메시지" 로 기록하세요.');
  const ignoredNow = Object.keys(dir().files).filter(p => isIgnored(p) && g.index[p] === undefined);
  G.emit('git:status', { ...st, ignored: ignoredNow });
  return true;
};
T.G.add = (g, a) => {
  const d = dir(); const targets = a.filter(x => !x.startsWith('-') || x === '-A');
  if (!targets.length) { T.print('Nothing specified, nothing added.\nhint: Maybe you wanted to say \'git add .\'?'); return false; }
  const added = [];
  const all = targets.some(x => x === '.' || x === '-A' || x === '--all' || x === '*');
  const doPath = p => { if (d.files[p] !== undefined) { if (isIgnored(p) && g.index[p] === undefined && !all) return 'ign'; if (isIgnored(p) && g.index[p] === undefined) return; g.index[p] = d.files[p]; added.push(p); } else if (g.index[p] !== undefined) { delete g.index[p]; added.push(p); } if (g.merging) g.merging.conflicts = g.merging.conflicts.filter(x => x !== p); };
  if (all) new Set([...Object.keys(d.files), ...Object.keys(g.index)]).forEach(doPath);
  else for (const t of targets) {
    const matches = new Set([...Object.keys(d.files), ...Object.keys(g.index)].filter(p => p === t || p.startsWith(t.replace(/\/$/, '') + '/')));
    if (!matches.size) { T.err(`fatal: pathspec '${t}' did not match any files`); return false; }
    for (const p of matches) if (doPath(p) === 'ign') { T.print(`The following paths are ignored by one of your .gitignore files:\n${p}`, 'warn'); T.tip('.gitignore에 적힌 파일은 Git이 무시해요. 비밀번호 같은 파일을 실수로 올리지 않게 막아 줘요!'); }
  }
  added.forEach(p => { if (G.hasMarkers(g.index[p])) { T.print(`warning: ${p} 에 아직 충돌 표시(<<<<<<<)가 남아 있어요!`, 'warn'); } });
  G.emit('git:add', { files: added });
  return true;
};
T.G.commit = (g, a) => {
  const d = dir(); let msg = null;
  const mi = a.findIndex(x => x === '-m' || x === '-am' || x === '-ma' || x === '--message');
  const aflag = a.includes('-a') || a.includes('-am') || a.includes('-ma');
  if (mi >= 0) msg = a[mi + 1];
  const amend = a.includes('--amend');
  if (msg === null || msg === undefined) { if (g.merging && !g.merging.conflicts.length) msg = g.merging.msg; else { T.err('error: 커밋 메시지가 없어요.'); T.tip('실제 Git은 편집기를 열지만, 여기서는 git commit -m "무엇을 바꿨는지" 처럼 -m 옵션으로 메시지를 적어 주세요.'); return false; } }
  if (!msg.trim()) { T.err('Aborting commit due to empty commit message.'); return false; }
  if (!L().cfg.name || !L().cfg.email) {
    T.err('Author identity unknown\n\n*** Please tell me who you are.\n\nRun\n\n  git config --global user.email "you@example.com"\n  git config --global user.name "Your Name"\n\nto set your account\'s default identity.');
    T.tip('처음 한 번은 "누가 커밋했는지" 이름과 이메일을 알려 줘야 해요. 위 두 명령을 먼저 입력하세요!'); return false;
  }
  if (aflag) Object.keys(g.index).forEach(p => { if (d.files[p] === undefined) delete g.index[p]; else g.index[p] = d.files[p]; });
  if (g.merging?.conflicts.length) { T.err('error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use \'git add/rm <file>\'\nfatal: Exiting because of an unresolved conflict.'); return false; }
  const head = headId(g); const ht = headTree(g);
  if (!g.merging && !amend && !G.dtree(ht, g.index).length) {
    const st = T.status(g);
    T.print(`On branch ${g.HEAD}`);
    if (st.unstaged.length || st.untracked.length) { T.print('no changes added to commit (use "git add" and/or "git commit -a")'); T.tip('커밋 전에 git add 로 파일을 스테이지에 올려야 해요!'); }
    else T.print('nothing to commit, working tree clean');
    return false;
  }
  const parents = amend ? G.c(head).p : [head, g.merging?.theirs];
  const id = G.mk(g.index, parents, msg, author());
  G.S().obj[id].email = L().cfg.email;
  g.branches[g.HEAD] = id;
  const wasMerge = !!g.merging; g.merging = null;
  T.print(`[${g.HEAD}${head ? '' : ' (root-commit)'} ${id.slice(0, 7)}] ${msg}`);
  changeSummary(G.treeOf(head && !amend ? head : (amend ? G.c(head).p[0] : null)), g.index).forEach(l => T.print(l));
  T.tip(wasMerge ? '병합(merge) 커밋 완료! 충돌을 해결했어요 🎉' : '내 컴퓨터(로컬)에 기록됐어요. GitHub에 올리려면 git push 를 해야 해요!');
  G.bump();
  G.emit('git:commit', { id, msg, br: g.HEAD, merge: wasMerge, files: Object.keys(g.index) });
  return true;
};
T.G.log = (g, a) => {
  const id = headId(g);
  if (!id) { T.err(`fatal: your current branch '${g.HEAD}' does not have any commits yet`); return false; }
  const one = a.includes('--oneline'); const graph = a.includes('--graph');
  let n = 30; const ni = a.findIndex(x => /^-\d+$/.test(x) || x === '-n'); if (ni >= 0) n = a[ni] === '-n' ? +a[ni + 1] : -a[ni];
  const list = [...G.anc(id)].map(G.c).sort((x, y) => y.t - x.t).slice(0, n);
  list.forEach(c => {
    const pre = graph ? (c.p.length > 1 ? '*   ' : '* ') : '';
    if (one) T.print(`${pre}${c.id.slice(0, 7)}${deco(g, c.id)} ${c.m}`, 'log');
    else { T.print(`${pre}commit ${c.id}${deco(g, c.id)}`, 'y'); if (c.p.length > 1) T.print(`Merge: ${c.p.map(x => x.slice(0, 7)).join(' ')}`); T.print(`Author: ${c.a} <${c.email || c.a.toLowerCase().replace(/\s/g, '') + '@users.noreply.github.com'}>\nDate:   ${fmtDate(c.t)}\n\n    ${c.m}\n`); }
  });
  if (!one) T.tip('git log --oneline 으로 한 줄씩 짧게 볼 수 있어요. (q 키는 필요 없어요)');
  G.emit('git:log', { oneline: one, n: list.length });
  return true;
};
const diffPrint = (a, b, pathFilter) => {
  const ds = G.dtree(a, b).filter(d => !pathFilter || d.p === pathFilter);
  if (!ds.length) return 0;
  ds.forEach(d => {
    T.print(`diff --git a/${d.p} b/${d.p}`, 'b'); T.print(`--- ${d.a === undefined ? '/dev/null' : 'a/' + d.p}\n+++ ${d.b === undefined ? '/dev/null' : 'b/' + d.p}`, 'b');
    if (G.isBin(d.a) || G.isBin(d.b)) { T.print('Binary files differ'); return; }
    G.lineDiff(d.a, d.b).forEach(r => T.print(r.t + r.s, r.t === '+' ? 'g' : r.t === '-' ? 'r' : ''));
  });
  return ds.length;
};
T.G.diff = (g, a) => {
  const staged = a.includes('--staged') || a.includes('--cached'); const p = a.find(x => !x.startsWith('-'));
  let n;
  if (staged) n = diffPrint(headTree(g), g.index, p);
  else { const w = {}; Object.keys(g.index).forEach(k => { if (dir().files[k] !== undefined) w[k] = dir().files[k]; }); n = diffPrint(g.index, w, p); }
  if (!n) T.tip(staged ? '스테이지에 올라간 변경이 없어요.' : '아직 add 하지 않은 변경이 없어요. (스테이지된 변경은 git diff --staged)');
  else T.tip('초록 + 는 추가된 줄, 빨강 - 는 지워진 줄이에요.');
  G.emit('git:diff', { staged });
  return true;
};
T.G.show = (g, a) => {
  let id = a[0] ? Object.keys(G.S().obj).find(x => x.startsWith(a[0])) || g.branches[a[0]] : headId(g);
  if (!id) { T.err(`fatal: ambiguous argument '${a[0]}': unknown revision`); return false; }
  const c = G.c(id);
  T.print(`commit ${c.id}${deco(g, c.id)}`, 'y'); T.print(`Author: ${c.a}\nDate:   ${fmtDate(c.t)}\n\n    ${c.m}\n`);
  diffPrint(G.treeOf(c.p[0]), c.tree);
  return true;
};
T.G.branch = (g, a) => {
  const flags = a.filter(x => x.startsWith('-')), args = a.filter(x => !x.startsWith('-'));
  if (flags.includes('-M') || flags.includes('-m')) {
    const nn = args[args.length - 1], old = args.length > 1 ? args[0] : g.HEAD;
    if (g.branches[old]) { g.branches[nn] = g.branches[old]; if (nn !== old) delete g.branches[old]; }
    if (g.HEAD === old) g.HEAD = nn;
    if (g.up[old]) { g.up[nn] = g.up[old]; if (nn !== old) delete g.up[old]; }
    G.emit('git:branch', { rename: nn }); return true;
  }
  if (flags.includes('-d') || flags.includes('-D')) {
    const n = args[0];
    if (!g.branches[n]) { T.err(`error: branch '${n}' not found.`); return false; }
    if (n === g.HEAD) { T.err(`error: Cannot delete branch '${n}' checked out at '/home/${G.S().login}/${L().cwd}'`); T.tip('지금 있는 브랜치는 지울 수 없어요. 다른 브랜치로 switch 한 뒤 지우세요.'); return false; }
    if (flags.includes('-d') && !G.isAnc(g.branches[n], headId(g)) && !Object.values(g.rt).some(x => G.isAnc(g.branches[n], x))) { T.err(`error: The branch '${n}' is not fully merged.\nIf you are sure you want to delete it, run 'git branch -D ${n}'.`); return false; }
    T.print(`Deleted branch ${n} (was ${g.branches[n].slice(0, 7)}).`); delete g.branches[n]; G.emit('git:branch', { del: n }); return true;
  }
  if (args.length) {
    const n = args[0];
    if (!headId(g)) { T.err(`fatal: Not a valid object name: '${g.HEAD}'.`); T.tip('브랜치를 만들려면 먼저 커밋이 하나 이상 있어야 해요.'); return false; }
    if (g.branches[n]) { T.err(`fatal: a branch named '${n}' already exists`); return false; }
    g.branches[n] = headId(g);
    T.tip(`"${n}" 브랜치를 만들었어요. 하지만 아직 ${g.HEAD}에 있어요! git switch ${n} 으로 이동하세요.`);
    G.emit('git:branch', { create: n }); return true;
  }
  const names = Object.keys(g.branches); if (!names.includes(g.HEAD)) names.push(g.HEAD);
  names.sort().forEach(b => T.print((b === g.HEAD ? '* ' : '  ') + b, b === g.HEAD ? 'g' : ''));
  if (flags.includes('-a') || flags.includes('-r')) Object.keys(g.rt).forEach(b => T.print('  remotes/' + b, 'r'));
  G.emit('git:branch', { list: true });
  return true;
};
const doSwitch = (g, n, create, from) => {
  if (create) {
    if (g.branches[n]) { T.err(`fatal: a branch named '${n}' already exists`); return false; }
    if (!headId(g)) { g.HEAD = n; T.print(`Switched to a new branch '${n}'`); return true; }
    g.branches[n] = from ? (g.branches[from] || g.rt[from]) : headId(g); g.HEAD = n;
    T.print(`Switched to a new branch '${n}'`);
    T.tip(`새 브랜치 "${n}"(으)로 이동했어요. 여기서 하는 커밋은 다른 브랜치에 영향을 주지 않아요 🌿`);
    G.emit('git:switch', { br: n, created: true }); return true;
  }
  if (n === g.HEAD) { T.print(`Already on '${n}'`); return true; }
  let target = g.branches[n];
  let tracked = false;
  if (!target && g.rt['origin/' + n]) { target = g.rt['origin/' + n]; tracked = true; }
  if (!target) { T.err(`fatal: invalid reference: ${n}`); T.tip('브랜치 목록은 git branch -a 로 볼 수 있어요. 새로 만들려면 git switch -c 이름'); return false; }
  if (g.merging) { T.err('error: you need to resolve your current index first'); return false; }
  if (!checkoutTree(g, G.treeOf(target), 'checkout')) return false;
  if (tracked) { g.branches[n] = target; g.up[n] = 'origin/' + n; T.print(`branch '${n}' set up to track 'origin/${n}'.`); }
  g.HEAD = n;
  T.print(`Switched to branch '${n}'`);
  G.emit('git:switch', { br: n });
  return true;
};
T.G.switch = (g, a) => { const c = a.includes('-c') || a.includes('-C') || a.includes('--create'); const args = a.filter(x => !x.startsWith('-')); if (!args[0]) { T.err('fatal: missing branch or commit argument'); return false; } return doSwitch(g, args[0], c, args[1]); };
T.G.checkout = (g, a) => {
  const di = a.indexOf('--');
  if (di >= 0) return T.G.restore(g, a.slice(di + 1));
  const b = a.includes('-b') || a.includes('-B'); const args = a.filter(x => !x.startsWith('-'));
  if (!args[0]) { T.err('fatal: 브랜치 이름을 적어 주세요'); return false; }
  if (!b && !g.branches[args[0]] && !g.rt['origin/' + args[0]] && (dir().files[args[0]] !== undefined || g.index[args[0]] !== undefined)) return T.G.restore(g, args);
  return doSwitch(g, args[0], b, args[1]);
};
T.G.restore = (g, a) => {
  const staged = a.includes('--staged') || a.includes('-S'); const ps = a.filter(x => !x.startsWith('-'));
  if (!ps.length) { T.err('fatal: you must specify path(s) to restore'); return false; }
  const all = ps.includes('.');
  const list = all ? Object.keys({ ...g.index, ...headTree(g) }) : ps;
  for (const p of list) {
    if (staged) { const h = headTree(g)[p]; if (h === undefined) delete g.index[p]; else g.index[p] = h; }
    else { if (g.index[p] === undefined) { if (!all) { T.err(`error: pathspec '${p}' did not match any file(s) known to git`); return false; } continue; } dir().files[p] = g.index[p]; }
  }
  T.tip(staged ? '스테이지에서 내렸어요(unstage). 파일 내용은 그대로예요.' : '마지막으로 저장(add/commit)한 상태로 되돌렸어요. 되돌린 변경은 복구할 수 없으니 조심!');
  G.emit('git:restore', { staged, files: list });
  return true;
};
const doMerge = (g, ref, label) => {
  const theirs = g.branches[ref] || g.rt[ref];
  if (!theirs) { T.err(`merge: ${ref} - not something we can merge`); return false; }
  const ours = headId(g);
  if (g.merging) { T.err('error: Merging is not possible because you have unmerged files.'); return false; }
  if (!ours) { if (!checkoutTree(g, G.treeOf(theirs), 'merge')) return false; g.branches[g.HEAD] = theirs; T.print('Fast-forward'); return true; }
  if (G.isAnc(theirs, ours)) { T.print('Already up to date.'); G.emit('git:merge', { ref, upToDate: true }); return true; }
  if (G.isAnc(ours, theirs)) {
    if (!checkoutTree(g, G.treeOf(theirs), 'merge')) return false;
    g.branches[g.HEAD] = theirs;
    T.print(`Updating ${ours.slice(0, 7)}..${theirs.slice(0, 7)}\nFast-forward`);
    changeSummary(G.treeOf(ours), G.treeOf(theirs)).forEach(l => T.print(l));
    T.tip('Fast-forward: 갈라진 적이 없어서 브랜치 포인터만 앞으로 쭉 이동했어요 ⏩');
    G.emit('git:merge', { ref, ff: true }); return true;
  }
  if (dirtyPaths(g).size) { T.err('error: Your local changes would be overwritten by merge.\nPlease commit your changes or stash them before you merge.\nAborting'); return false; }
  const mb = G.mbase(ours, theirs);
  const m = G.merge3(G.treeOf(mb), G.treeOf(ours), G.treeOf(theirs), 'HEAD', label || ref);
  G.dtree(G.treeOf(ours), m.tree).forEach(d => T.print('Auto-merging ' + d.p));
  if (m.conflicts.length) {
    const d = dir();
    Object.entries(m.tree).forEach(([p, v]) => { d.files[p] = v; if (!m.conflicts.includes(p)) g.index[p] = v; });
    Object.keys(G.treeOf(ours)).forEach(p => { if (m.tree[p] === undefined) { delete d.files[p]; delete g.index[p]; } });
    g.merging = { theirs, conflicts: [...m.conflicts], msg: `Merge branch '${label || ref}'` };
    m.conflicts.forEach(p => T.print(`CONFLICT (content): Merge conflict in ${p}`, 'r'));
    T.print('Automatic merge failed; fix conflicts and then commit the result.', 'r');
    T.tip('충돌 발생! 두 브랜치가 같은 곳을 다르게 고쳤어요. cat 으로 파일을 보고, edit 로 <<<<<<< ======= >>>>>>> 표시를 지운 뒤 git add → git commit 하세요.');
    G.emit('git:merge', { ref, conflict: true, files: m.conflicts }); return false;
  }
  const id = G.mk(m.tree, [ours, theirs], `Merge branch '${label || ref}'${g.HEAD !== 'main' ? ' into ' + g.HEAD : ''}`, author());
  g.branches[g.HEAD] = id; g.index = { ...m.tree }; Object.assign(dir().files, m.tree);
  Object.keys(G.treeOf(ours)).forEach(p => { if (m.tree[p] === undefined) delete dir().files[p]; });
  T.print("Merge made by the 'ort' strategy.");
  changeSummary(G.treeOf(ours), m.tree).forEach(l => T.print(l));
  T.tip('두 갈래의 작업을 하나로 합친 "병합 커밋"이 만들어졌어요.');
  G.bump();
  G.emit('git:merge', { ref, commit: id }); return true;
};
T.G.merge = (g, a) => {
  if (a.includes('--abort')) { if (!g.merging) { T.err('fatal: There is no merge to abort (MERGE_HEAD missing).'); return false; } const ht = headTree(g); const d = dir(); Object.keys(d.files).forEach(p => { if (ht[p] === undefined && g.index[p] !== undefined) delete d.files[p]; }); Object.assign(d.files, ht); g.index = { ...ht }; g.merging = null; T.print('병합을 취소하고 원래 상태로 돌아왔어요.', 'ok'); G.emit('git:merge', { abort: true }); return true; }
  const ref = a.find(x => !x.startsWith('-'));
  if (!ref) { T.err('fatal: No remote for the current branch.'); return false; }
  return doMerge(g, ref);
};
T.G.remote = (g, a) => {
  if (a[0] === 'add') { if (!a[1] || !a[2]) { T.err('usage: git remote add <name> <url>'); return false; } if (g.remotes[a[1]]) { T.err(`error: remote ${a[1]} already exists.`); return false; } g.remotes[a[1]] = a[2]; T.tip(`"${a[1]}"이라는 별명으로 GitHub 주소를 등록했어요. 이제 git push -u ${a[1]} ${g.HEAD} 로 올릴 수 있어요.`); G.emit('git:remote', { add: a[1], url: a[2] }); return true; }
  if (a[0] === 'remove' || a[0] === 'rm') { delete g.remotes[a[1]]; return true; }
  if (a[0] === 'set-url') { g.remotes[a[1]] = a[2]; return true; }
  const v = a.includes('-v');
  Object.entries(g.remotes).forEach(([n, u]) => { if (v) { T.print(`${n}\t${u} (fetch)`); T.print(`${n}\t${u} (push)`); } else T.print(n); });
  if (!Object.keys(g.remotes).length) T.tip('연결된 원격 저장소가 없어요. git remote add origin <주소> 로 연결하세요.');
  G.emit('git:remote', { list: true });
  return true;
};
const doFetch = (g, quiet) => {
  const key = remoteKey(g);
  if (!key) { T.err("fatal: 'origin' does not appear to be a git repository\nfatal: Could not read from remote repository."); return null; }
  const r = G.repo(key); let any = false;
  const lines = [];
  Object.entries(r.branches).forEach(([b, id]) => { const old = g.rt['origin/' + b]; if (old !== id) { any = true; lines.push(old ? `   ${old.slice(0, 7)}..${id.slice(0, 7)}  ${b.padEnd(10)} -> origin/${b}` : ` * [new branch]      ${b.padEnd(10)} -> origin/${b}`); } g.rt['origin/' + b] = id; });
  Object.keys(g.rt).forEach(rb => { if (!r.branches[rb.replace(/^origin\//, '')]) delete g.rt[rb]; });
  Object.entries(r.tags).forEach(([t, id]) => { if (!g.tags[t]) { g.tags[t] = id; lines.push(` * [new tag]         ${t} -> ${t}`); any = true; } });
  if (any) { T.print(`From https://github.com/${key}`); lines.forEach(l => T.print(l)); }
  else if (!quiet) T.print('(가져올 새 내용이 없어요)', 'dim');
  return key;
};
T.G.fetch = g => { const k = doFetch(g); if (!k) return false; T.tip('fetch는 GitHub의 최신 기록을 "가져오기만" 해요. 내 파일에 합치려면 git merge 또는 git pull!'); G.emit('git:fetch', {}); return true; };
T.G.pull = (g, a) => {
  if (g.merging) { T.err('error: Pulling is not possible because you have unmerged files.'); return false; }
  const args = a.filter(x => !x.startsWith('-'));
  const br = args[1] || (g.up[g.HEAD] || '').replace(/^origin\//, '');
  if (!br) { T.err(`There is no tracking information for the current branch.\nPlease specify which branch you want to merge with.\n\n    git pull origin ${g.HEAD}\n\nIf you wish to set tracking information for this branch you can do so with:\n\n    git branch --set-upstream-to=origin/${g.HEAD} ${g.HEAD}`); return false; }
  const before = headId(g);
  const key = doFetch(g, true); if (!key) return false;
  if (!g.rt['origin/' + br]) { T.err(`fatal: couldn't find remote ref ${br}`); return false; }
  T.print(`From https://github.com/${key}\n * branch            ${br}       -> FETCH_HEAD`);
  const ok = doMerge(g, 'origin/' + br, `origin/${br}`);
  const n = before ? G.ahead(before, headId(g)).length : 0;
  if (ok) { if (n) T.tip(`GitHub에 있던 새 커밋 ${n}개를 내 컴퓨터로 가져와 합쳤어요 ⬇️`); G.emit('git:pull', { br, n }); }
  return ok;
};
T.G.push = (g, a) => {
  const S = G.S();
  const u = a.includes('-u') || a.includes('--set-upstream');
  const force = a.includes('-f') || a.includes('--force');
  const args = a.filter(x => !x.startsWith('-'));
  if (a.includes('--tags')) return pushTags(g, Object.keys(g.tags || {}));
  let remote = args[0], br = args[1];
  if (br && (g.tags || {})[br] && !g.branches[br]) return pushTags(g, [br]);
  if (!remote) {
    if (!Object.keys(g.remotes).length) { T.err('fatal: No configured push destination.\nEither specify the URL from the command-line or configure a remote repository using\n\n    git remote add <name> <url>\n\nand then push using the remote name\n\n    git push <name>'); return false; }
    if (!g.up[g.HEAD]) { T.err(`fatal: The current branch ${g.HEAD} has no upstream branch.\nTo push the current branch and set the remote as upstream, use\n\n    git push --set-upstream origin ${g.HEAD}\n`); T.tip(`처음 올리는 브랜치는 어디로 보낼지 알려 줘야 해요: git push -u origin ${g.HEAD}`); return false; }
    remote = 'origin'; br = g.up[g.HEAD].replace(/^origin\//, '');
  }
  if (!g.remotes[remote]) { T.err(`fatal: '${remote}' does not appear to be a git repository`); return false; }
  br = br || g.HEAD;
  const src = br.includes(':') ? br.split(':')[0] : br; const dst = br.includes(':') ? br.split(':')[1] : br;
  const key = remoteKey(g, remote);
  if (!key) { T.err('remote: Repository not found.\nfatal: repository \'' + g.remotes[remote] + '\' not found'); T.tip('GitHub에 저장소를 먼저 만들었는지, 주소가 맞는지 확인하세요 (git remote -v).'); return false; }
  const r = G.repo(key);
  if (r.owner !== S.login && !r.collab.some(c => c.name === S.login && c.status === 'accepted')) { T.err(`remote: Permission to ${key}.git denied to ${S.login}.\nfatal: unable to access 'https://github.com/${key}.git/': The requested URL returned error: 403`); T.tip('남의 저장소에는 바로 push 할 수 없어요. Fork 한 내 저장소에 push 하고 Pull Request를 보내세요!'); return false; }
  const local = g.branches[src];
  if (!local) { T.err(`error: src refspec ${src} does not match any\nerror: failed to push some refs to 'https://github.com/${key}.git'`); T.tip('아직 커밋이 없거나 브랜치 이름이 달라요. git branch 로 확인해 보세요.'); return false; }
  const remoteTip = r.branches[dst];
  if (!S.local.pushedOnce) { S.local.pushedOnce = true; T.tip('실제 GitHub에서는 처음 push 할 때 로그인 창이 뜨거나 비밀번호 대신 "토큰"을 입력해요. 연습장에서는 자동 로그인됐어요 🔑'); }
  if (remoteTip === local) { T.print('Everything up-to-date'); T.tip('올릴 새 커밋이 없어요. 먼저 git commit 을 했는지 확인하세요.'); if (u) g.up[src] = 'origin/' + dst; G.emit('git:push', { key, br: dst, n: 0 }); return true; }
  if (remoteTip && !G.isAnc(remoteTip, local) && !force) {
    T.print(`To https://github.com/${key}.git`); T.err(` ! [rejected]        ${src} -> ${dst} (fetch first)\nerror: failed to push some refs to 'https://github.com/${key}.git'\nhint: Updates were rejected because the remote contains work that you do not\nhint: have locally. You may want to first integrate the remote changes\nhint: (e.g., 'git pull ...') before pushing again.`);
    T.tip('GitHub에 내가 아직 안 받은 커밋이 있어요. git pull 로 먼저 받아서 합친 뒤 다시 push 하세요.');
    G.emit('git:push', { key, rejected: true }); return false;
  }
  const newCommits = G.ahead(remoteTip, local);
  for (const c of newCommits) {
    const ch = {}; G.dtree(G.treeOf(c.p[0]), c.tree).forEach(d => { if (d.b !== undefined) ch[d.p] = d.b; });
    const leak = G.findSecret(ch);
    if (leak) {
      T.print('Enumerating objects: 5, done.\nWriting objects: 100% (3/3), done.');
      T.err(`remote: error: GH013: Repository rule violations found for refs/heads/${dst}.\nremote:\nremote: - GITHUB PUSH PROTECTION\nremote:   —————————————————————————————————————————\nremote:     Resolve the following violations before pushing again\nremote:\nremote:     - Push cannot contain secrets\nremote:\nremote:       —— GitHub Personal Access Token ——————————————\nremote:        locations:\nremote:          - commit: ${c.id.slice(0, 7)}\nremote:            path: ${leak}:1\nremote:\nTo https://github.com/${key}.git\n ! [remote rejected] ${src} -> ${dst} (push declined due to repository rule violations)`);
      T.tip('GitHub가 비밀 토큰이 섞인 커밋을 막았어요(Push Protection)! 토큰은 절대 코드에 넣지 마세요.');
      r.blocked.push({ file: leak, t: Date.now(), by: S.login, br: dst }); G.emit('secret:blocked', { key, file: leak, via: 'push' }); return false;
    }
  }
  if (r.protect[dst]?.pr) { T.err(`remote: error: GH006: Protected branch update failed for refs/heads/${dst}.\nremote: error: Changes must be made through a pull request.\nTo https://github.com/${key}.git\n ! [remote rejected] ${src} -> ${dst} (protected branch hook declined)`); T.tip(`${dst}는 보호된 브랜치예요. 새 브랜치에 push 하고 Pull Request로 합치세요.`); G.emit('git:push', { key, protectedBlock: true }); return false; }
  const n = Math.max(3, newCommits.length * 3);
  T.print(`Enumerating objects: ${n}, done.\nCounting objects: 100% (${n}/${n}), done.\nWriting objects: 100% (${n}/${n}), 312 bytes | 312.00 KiB/s, done.\nTotal ${n} (delta 0), reused 0 (delta 0), pack-reused 0`);
  if (!remoteTip) T.print(`remote:\nremote: Create a pull request for '${dst}' on GitHub by visiting:\nremote:      https://github.com/${key}/pull/new/${dst}\nremote:`);
  T.print(`To https://github.com/${key}.git`);
  T.print(remoteTip ? `   ${remoteTip.slice(0, 7)}..${local.slice(0, 7)}  ${src} -> ${dst}` : ` * [new branch]      ${src} -> ${dst}`);
  r.branches[dst] = local; g.rt['origin/' + dst] = local;
  if (u) { g.up[src] = 'origin/' + dst; T.print(`branch '${src}' set up to track 'origin/${dst}'.`); }
  T.tip(`GitHub에 올라갔어요! 🚀 위쪽 GitHub 화면에서 ${key} 저장소를 확인해 보세요.`);
  G.afterPush(key, dst, remoteTip, local, S.login);
  G.emit('git:push', { key, br: dst, n: newCommits.length, newBranch: !remoteTip, files: Object.keys(G.treeOf(local)) });
  return true;
};
const pushTags = (g, names) => {
  const key = remoteKey(g); if (!key) { T.err('fatal: No configured push destination.'); return false; }
  const r = G.repo(key); const out = [];
  names.forEach(t => { if (!r.tags[t]) { r.tags[t] = g.tags[t]; out.push(` * [new tag]         ${t} -> ${t}`); } });
  if (!out.length) { T.print('Everything up-to-date'); return true; }
  T.print(`To https://github.com/${key}.git`); out.forEach(l => T.print(l));
  T.tip('태그가 GitHub에 올라갔어요. Releases 화면에서 이 태그로 릴리스를 만들 수 있어요 🏷️');
  G.emit('git:pushtag', { key, tags: names }); return true;
};
T.G.tag = (g, a) => {
  const args = a.filter(x => !x.startsWith('-')); const mi = a.indexOf('-m'); const msg = mi >= 0 ? a[mi + 1] : null;
  const name = args.filter(x => x !== msg)[0];
  g.tags = g.tags || {};
  if (!name) { Object.keys(g.tags).sort().forEach(t => T.print(t)); if (!Object.keys(g.tags).length) T.print('(태그 없음)', 'dim'); return true; }
  if (a.includes('-d')) { delete g.tags[name]; T.print(`Deleted tag '${name}'`); return true; }
  if (g.tags[name]) { T.err(`fatal: tag '${name}' already exists`); return false; }
  if (!headId(g)) { T.err('fatal: Failed to resolve \'HEAD\' as a valid ref.'); return false; }
  g.tags[name] = headId(g);
  T.tip(`현재 커밋에 "${name}" 이름표를 붙였어요. GitHub에 올리려면 git push origin ${name}`);
  G.emit('git:tag', { name }); return true;
};
T.G.stash = (g, a) => {
  const sub = a[0] || 'push';
  if (sub === 'list') { g.stash.forEach((s, i) => T.print(`stash@{${i}}: WIP on ${s.br}: ${s.msg}`)); if (!g.stash.length) T.print('(stash 없음)', 'dim'); G.emit('git:stash', { list: true }); return true; }
  if (sub === 'pop' || sub === 'apply') {
    const s = g.stash[0]; if (!s) { T.err('No stash entries found.'); return false; }
    const d = dir();
    Object.entries(s.work).forEach(([p, v]) => { if (v === null) delete d.files[p]; else d.files[p] = v; });
    Object.entries(s.index).forEach(([p, v]) => { if (v === null) delete g.index[p]; else g.index[p] = v; });
    if (sub === 'pop') g.stash.shift();
    T.G.status(g);
    if (sub === 'pop') T.print(`Dropped refs/stash@{0} (${s.id.slice(0, 7)})`);
    T.tip('서랍에 넣어 두었던 작업을 다시 꺼냈어요 📤');
    G.emit('git:stash', { pop: true }); return true;
  }
  const dirty = dirtyPaths(g);
  if (!dirty.size) { T.print('No local changes to save'); return false; }
  const d = dir(), ht = headTree(g), work = {}, index = {};
  dirty.forEach(p => { work[p] = d.files[p] ?? null; index[p] = g.index[p] ?? null; if (ht[p] === undefined) { delete d.files[p]; delete g.index[p]; } else { d.files[p] = ht[p]; g.index[p] = ht[p]; } });
  const c = G.c(headId(g));
  g.stash.unshift({ id: G.hex(), br: g.HEAD, msg: c ? c.id.slice(0, 7) + ' ' + c.m : '', work, index });
  T.print(`Saved working directory and index state WIP on ${g.HEAD}: ${c ? c.id.slice(0, 7) + ' ' + c.m : ''}`);
  T.tip('작업 중이던 변경을 서랍(stash)에 넣고 깨끗한 상태로 돌아왔어요 📥 꺼낼 때는 git stash pop');
  G.emit('git:stash', { push: true }); return true;
};
T.G.rm = (g, a) => { const ps = a.filter(x => !x.startsWith('-')); for (const p of ps) { if (g.index[p] === undefined) { T.err(`fatal: pathspec '${p}' did not match any files`); return false; } delete g.index[p]; if (!a.includes('--cached')) delete dir().files[p]; T.print(`rm '${p}'`); } G.emit('git:rm', { files: ps }); return true; };
T.G.mv = (g, a) => { const [x, y] = a; if (g.index[x] === undefined) { T.err(`fatal: not under version control, source=${x}`); return false; } g.index[y] = g.index[x]; delete g.index[x]; dir().files[y] = dir().files[x]; delete dir().files[x]; return true; };
T.G.reset = (g, a) => { if (a.includes('--hard')) { T.tip('git reset --hard 는 작업을 영영 날릴 수 있어서 연습장에서는 막아 두었어요. git restore 나 git stash 를 써 보세요.'); return false; } return T.G.restore(g, ['--staged', ...a.filter(x => !x.startsWith('-') && x !== 'HEAD')]); };

/* ---------- UI ---------- */
T.render = () => {
  const o = document.getElementById('tout'); if (!o) return;
  o.innerHTML = T.out.map(x => `<div class="tl ${x.cls}">${x.cls === 'cmdline' ? tesc(x.l).replace(/^([^$]*\$)/, '<span class="p-user">$1</span>') : tesc(x.l) || '&nbsp;'}</div>`).join('');
  o.scrollTop = o.scrollHeight;
  const p = document.getElementById('tps'); if (p) p.innerHTML = T.prompt();
};
T.focus = () => { const i = document.getElementById('tinput'); if (i) i.focus({ preventScroll: true }); };
T.complete = v => {
  const parts = v.split(/\s+/); const last = parts[parts.length - 1];
  let cands = [];
  if (parts.length === 1) cands = ['git', 'ls', 'cd', 'cat', 'echo', 'edit', 'clear', 'help', 'pwd', 'mkdir', 'touch', 'rm', 'history'];
  else if (parts[0] === 'git' && parts.length === 2) cands = ['add', 'branch', 'checkout', 'clone', 'commit', 'config', 'diff', 'fetch', 'init', 'log', 'merge', 'pull', 'push', 'remote', 'restore', 'show', 'stash', 'status', 'switch', 'tag'];
  else { cands = L().cwd ? Object.keys(files()) : Object.keys(L().home); const g = git(); if (g && /switch|checkout|merge|branch/.test(parts[1] || '')) cands = cands.concat(Object.keys(g.branches)); }
  const m = cands.filter(c => c.startsWith(last));
  if (m.length === 1) { parts[parts.length - 1] = m[0]; return parts.join(' ') + (parts.length === 1 || parts[0] === 'git' && parts.length === 2 ? ' ' : ''); }
  if (m.length > 1) { T.print(m.join('  '), 'dim'); T.render(); }
  return v;
};
T.mount = () => {
  const i = document.getElementById('tinput');
  i.addEventListener('keydown', e => {
    const H = L().hist;
    if (e.key === 'Enter') { if (e.isComposing || e.keyCode === 229) return; const v = i.value; i.value = ''; T.hIdx = -1; T.run(v); T.render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (!H.length) return; T.hIdx = T.hIdx < 0 ? H.length - 1 : Math.max(0, T.hIdx - 1); i.value = H[T.hIdx]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (T.hIdx < 0) return; T.hIdx++; if (T.hIdx >= H.length) { T.hIdx = -1; i.value = ''; } else i.value = H[T.hIdx]; }
    else if (e.key === 'Tab') { e.preventDefault(); i.value = T.complete(i.value); }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); T.out = []; T.render(); }
  });
  document.getElementById('tout').addEventListener('click', () => { if (!window.getSelection().toString()) T.focus(); });
  if (!T.out.length) { T.print('🐿️ 깃토리 터미널에 오신 걸 환영해요! (연습용 가상 컴퓨터예요)', 'ok'); T.print('help 를 입력하면 쓸 수 있는 명령어가 나와요.', 'dim'); }
  T.render();
};
