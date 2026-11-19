/* =========================================================
   가상 GitHub 화면 (2) – Actions, Projects, Wiki, Discussions,
   Security, Settings, Releases, Profile, Explore, Gist, Pages, Codespaces
   ========================================================= */
'use strict';
(() => {
const esc = V.esc, val = V.val, av = V.av, ago = V.ago, ICON = V.ICON;
const $ = id => document.getElementById(id);
const chk = id => !!($(id) && $(id).checked);
const SS = () => G.S();
const t = (key, extra) => `data-t="${key}"${extra ? ' ' + extra : ''}`;
const cur = () => { const v = SS().view; return { v, key: v.key, r: G.repo(v.key) }; };
const repoV = V.repoV;
V.goRepo = (key, o = {}, opt) => V.go({ page: 'repo', key, tab: 'code', ...o }, opt);

/* ---------- Actions ---------- */
V.WF = {
  simple: { name: 'Simple workflow', file: 'blank.yml', desc: '처음 시작하기 좋은 가장 기본 워크플로예요.', icon: '⚙️', body: `# 첫 번째 GitHub Actions 워크플로예요!\nname: CI\n\n# 언제 실행할까? (push 하거나 PR을 만들 때, 또는 버튼으로)\non:\n  push:\n    branches: [ "main" ]\n  pull_request:\n    branches: [ "main" ]\n  workflow_dispatch:\n\n# 무엇을 실행할까?\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n\n      - name: Run a one-line script\n        run: echo Hello, world!\n\n      - name: Run a multi-line script\n        run: |\n          echo Add other actions to build,\n          echo test, and deploy your project.\n` },
  greet: { name: 'Greeting', file: 'greeting.yml', desc: 'push 할 때마다 인사해 주는 귀여운 워크플로예요.', icon: '👋', body: `name: 인사하기\non: [push]\njobs:\n  greet:\n    runs-on: ubuntu-latest\n    steps:\n      - name: 인사\n        run: echo "안녕하세요, \${{ github.actor }}님! 오늘도 커밋 고마워요 🎉"\n      - name: 파일 목록 보기\n        run: ls\n` },
  node: { name: 'Node.js', file: 'node.js.yml', desc: 'Node.js 프로젝트를 설치하고 테스트해요. (package.json 필요)', icon: '🟩', body: `name: Node.js CI\n\non:\n  push:\n    branches: [ "main" ]\n  pull_request:\n    branches: [ "main" ]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v4\n    - name: Use Node.js\n      uses: actions/setup-node@v4\n      with:\n        node-version: 20.x\n    - run: npm ci\n    - run: npm test\n` },
  python: { name: 'Python application', file: 'python-app.yml', desc: '파이썬 코드를 실행해 봐요.', icon: '🐍', body: `name: Python application\n\non:\n  push:\n    branches: [ "main" ]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v4\n    - name: Set up Python 3.12\n      uses: actions/setup-python@v5\n      with:\n        python-version: "3.12"\n    - name: Run\n      run: python hello.py\n` },
};
V.runIcon = x => x.status !== 'completed' ? '<span class="ric run">●</span>' : x.concl === 'success' ? '<span class="ric ok">✔</span>' : x.concl === 'skipped' ? '<span class="ric skip">⊘</span>' : '<span class="ric fail">✖</span>';
V.actionsTab = (r, v) => {
  if (v.sub === 'new') return V.actionsNew(r);
  if (v.sub === 'run') return V.runView(r, v);
  const tree = G.tree(r, r.def);
  const wfs = Object.keys(tree).filter(p => /^\.github\/workflows\/[^/]+\.ya?ml$/.test(p));
  if (!wfs.length && !r.runs.length) return V.actionsNew(r, true);
  const sel = V.ui.wfSel || ''; const runs = r.runs.filter(x => !sel || x.file === sel);
  const selWf = sel && tree[sel] ? G.wfParse(tree[sel]) : null;
  return `<div class="act-grid"><aside class="act-side"><div class="row-between"><b>Actions</b><button class="btn btn-sm" data-a="sub" data-sub="new" ${t('new-workflow')}>New workflow</button></div>
    <button class="side-it ${!sel ? 'sel' : ''}" data-a="wfsel" data-v="">All workflows</button>${wfs.map(p => `<button class="side-it ${sel === p ? 'sel' : ''}" data-a="wfsel" data-v="${esc(p)}">${esc(G.wfParse(tree[p]).name || p.split('/').pop())}</button>`).join('')}${r.runs.some(x => x.pages) ? `<button class="side-it ${sel === '(dynamic)' ? 'sel' : ''}" data-a="wfsel" data-v="(dynamic)">pages-build-deployment</button>` : ''}</aside>
    <div class="act-main"><div class="row-between"><h3>${sel ? esc(selWf?.name || sel) : 'All workflows'}</h3>${selWf?.on.includes('workflow_dispatch') ? `<button class="btn btn-sm" data-a="dispatch" ${t('run-workflow')}>▶ Run workflow</button>` : ''}</div>
    <p class="small muted">GitHub Actions = 내가 정한 순간(push, PR 등)에 로봇이 자동으로 일(테스트, 배포 등)을 해 주는 기능이에요 🤖</p>
    <div class="list"><div class="list-h small">${runs.length} workflow run${runs.length !== 1 ? 's' : ''}</div>${runs.map(x => `<div class="li run-li">${V.runIcon(x)}<div class="grow"><a href="#" data-a="openrun" data-id="${x.id}" class="li-title" ${t('run-item')}>${esc(x.msg)}</a><div class="small muted">${esc(x.name)} #${x.n}: ${x.ev === 'dynamic' ? 'deployment' : 'Commit ' + x.cid.slice(0, 7) + ' ' + (x.ev === 'workflow_dispatch' ? 'manually run' : x.ev === 'pull_request' ? 'pull request' : 'pushed')} by ${esc(x.actor)}</div></div><span class="pill sm">${esc(x.br)}</span><span class="small muted">${ago(x.t)}</span></div>`).join('') || '<p class="pad muted">아직 실행 기록이 없어요.</p>'}</div></div></div>`;
};
V.actionsNew = (r, first) => `<h3>${first ? 'Get started with GitHub Actions' : 'Choose a workflow'}</h3><p class="muted">워크플로(workflow) = <code>.github/workflows/</code> 폴더에 넣는 <b>YAML</b> 설정 파일이에요. 템플릿을 골라 <b>Configure</b>를 눌러 보세요.</p>
  <div class="wf-grid">${Object.entries(V.WF).map(([k, w]) => `<div class="card wf-card"><div class="wf-ic">${w.icon}</div><b>${esc(w.name)}</b><p class="small muted">${esc(w.desc)}</p><button class="btn btn-sm" data-a="wfconfig" data-k="${k}" ${t('wf-' + k)}>Configure</button></div>`).join('')}</div>`;
V.runView = (r, v) => {
  const run = r.runs.find(x => x.id === +v.id); if (!run) return '<div class="flash err">실행 기록을 찾을 수 없어요.</div>';
  const job = run.jobs[V.ui.jobSel || 0] || run.jobs[0]; const dur = run.done ? Math.max(1, Math.round((run.done - run.t) / 1000)) + 's' : '…';
  return `<div class="run-head"><h3>${V.runIcon(run)} ${esc(run.msg)} <span class="muted">${esc(run.name)} #${run.n}</span></h3>
   <div class="run-sum card"><div><small class="muted">Triggered via ${run.ev === 'dynamic' ? 'dynamic' : run.ev}</small><br>${av(run.actor, 18)} ${esc(run.actor)} · <code>${run.cid.slice(0, 7)}</code> · <span class="pill sm">${esc(run.br)}</span></div><div><small class="muted">Status</small><br><b class="${run.concl === 'success' ? 'ok' : run.concl === 'failure' ? 'err' : ''}">${run.status === 'completed' ? (run.concl === 'success' ? 'Success' : 'Failure') : run.status === 'queued' ? 'Queued' : 'In progress'}</b></div><div><small class="muted">Total duration</small><br><b>${dur}</b></div>${run.status === 'completed' && !run.pages ? `<button class="btn btn-sm" data-a="rerun">↻ Re-run jobs</button>` : ''}</div></div>
   <div class="act-grid"><aside class="act-side"><b class="small">Jobs</b>${run.jobs.map((j, i) => `<button class="side-it ${j === job ? 'sel' : ''}" data-a="jobsel" data-i="${i}">${V.runIcon(j)} ${esc(j.name)}</button>`).join('')}</aside>
   <div class="act-main"><div class="job-box"><div class="job-h">${V.runIcon(job)} <b>${esc(job.name)}</b> <span class="small muted">${job.status === 'completed' ? (job.concl === 'success' ? 'succeeded' : 'failed') : 'running…'}</span></div>
   ${job.steps.map((s, i) => { const open = V.ui.stepOpen?.[run.id + '-' + job.id + '-' + i] ?? s.concl === 'failure'; return `<div class="step"><button class="step-h" data-a="stepopen" data-k="${run.id}-${job.id}-${i}">${s.status !== 'completed' ? (job.status === 'in_progress' && job.steps.findIndex(x => x.status !== 'completed') === i ? '<span class="ric run spin">◌</span>' : '<span class="ric skip">○</span>') : V.runIcon(s)} ${open ? '▾' : '▸'} ${esc(s.name)}</button>${open && s.log.length ? `<pre class="log">${s.log.map((l, k) => `<span class="lno">${k + 1}</span>${l.startsWith('\u001b[err]') ? `<span class="err">${esc(l.slice(6))}</span>` : l.startsWith('\u001b[cmd]') ? `<span class="cmdl">${esc(l.slice(6))}</span>` : esc(l)}`).join('\n')}</pre>` : ''}</div>`; }).join('')}</div>
   ${run.concl === 'failure' ? '<div class="flash err small">❌ 실패했어요! 빨간 단계를 펼쳐 로그를 읽어 보세요. 원인을 고쳐서 다시 push 하면 자동으로 다시 실행돼요.</div>' : ''}</div></div>`;
};
V.A.wfsel = el => { V.ui.wfSel = el.dataset.v; V.render(); };
V.A.wfconfig = el => { const w = V.WF[el.dataset.k]; const { r } = cur(); V.ui.preset = { path: '.github/workflows/' + w.file, content: w.body }; V.ui.draftFor = null; G.emit('wf:config', { k: el.dataset.k }); V.go({ page: 'repo', key: G.key(r), tab: 'code', sub: 'new' }); };
V.A.openrun = el => { const { key } = cur(); V.ui.jobSel = 0; V.go({ page: 'repo', key, tab: 'actions', sub: 'run', id: +el.dataset.id }); G.emit('run:view', { key, id: +el.dataset.id }); };
V.A.jobsel = el => { V.ui.jobSel = +el.dataset.i; V.render(); };
V.A.stepopen = el => { V.ui.stepOpen = V.ui.stepOpen || {}; const k = el.dataset.k; const cur0 = V.ui.stepOpen[k]; V.ui.stepOpen[k] = cur0 === undefined ? !el.textContent.includes('▾') : !cur0; V.render(); };
V.A.dispatch = () => { const { key } = cur(); const run = G.runDispatch(key, V.ui.wfSel); App.toast('▶ 워크플로를 수동으로 실행했어요!'); G.emit('run:dispatch', { key }); V.render(); };
V.A.rerun = () => { const { key, r, v } = cur(); const run = r.runs.find(x => x.id === +v.id); const wf = G.wfParse(G.treeOf(run.cid)[run.file]); const nr = G.runStart(key, wf, run.file, run.ev, run.br, run.cid); V.go({ page: 'repo', key, tab: 'actions', sub: 'run', id: nr.id }, { replace: true }); };

/* ---------- Projects ---------- */
V.projectsTab = (r, v) => {
  if (v.sub === 'view' && r.projects[v.id]) return V.board(r, r.projects[v.id], v.id);
  return `<div class="row-between"><h3>📋 Projects</h3><button class="btn btn-primary btn-sm" data-a="newproject" ${t('new-project')}>New project</button></div><p class="small muted">Projects = 이슈와 할 일을 <b>칸반 보드</b>로 정리하는 기능이에요. 카드를 Todo → In Progress → Done 으로 옮기며 진행 상황을 한눈에 봐요.</p>
  ${V.ui.projForm ? `<div class="card"><label class="lbl">Project name</label><input class="inp" id="pj-name" ${t('pj-name')} placeholder="예: 1학기 프로젝트"><div class="row gap mt"><label class="rc sel"><input type="radio" checked> 📋 <b>Board</b><small>칸반 보드</small></label><label class="rc dim"><input type="radio" disabled> ▦ <b>Table</b><small>(연습장에선 보드만)</small></label></div><div class="row-end"><button class="btn btn-primary btn-sm" data-a="createproject" ${t('create-project')}>Create project</button></div></div>` : ''}
  <div class="list">${r.projects.map((p, i) => `<div class="li">📋 <a href="#" data-a="openproject" data-i="${i}" class="li-title grow" ${t('project-item')}>${esc(p.title)}</a><span class="small muted">${p.items.length} items</span></div>`).join('') || '<div class="blank small muted">아직 프로젝트가 없어요.</div>'}</div>`;
};
V.board = (r, p, pi) => {
  const openIssues = r.issues.filter(i => !p.items.some(x => x.n === i.n));
  return `<div class="row-between"><h3>📋 ${esc(p.title)}</h3><button class="btn btn-sm" data-a="tab" data-tab="projects">← Projects</button></div><p class="small muted">💡 카드를 <b>끌어다 놓거나(drag)</b>, 카드의 ◀ ▶ 버튼으로 옮겨 보세요.</p>
  <div class="board">${p.cols.map((c, ci) => { const items = p.items.filter(x => x.col === c); return `<div class="col" data-col="${esc(c)}" data-pi="${pi}" ${t('col-' + c)}><div class="col-h"><span class="cdot c${ci}"></span><b>${esc(c)}</b> <span class="cnt">${items.length}</span><small class="muted">${['아직 시작 전', '하는 중!', '끝 🎉'][ci] || ''}</small></div>
   ${items.map(x => { const iss = x.n ? r.issues.find(i => i.n === x.n) : null; return `<div class="pcard" draggable="true" data-item="${x.id}" data-pi="${pi}" ${t('card-' + (x.n || x.id))}><div class="small muted">${iss ? `${iss.state === 'open' ? ICON.issue : '✓'} ${esc(r.name)} #${iss.n}` : '📝 Draft'}</div><b>${esc(iss ? iss.title : x.title)}</b>${iss ? `<div>${iss.labels.map(l => V.lbl(r, l)).join(' ')}</div>` : ''}<div class="pc-move">${ci > 0 ? `<button class="btn-ic" data-a="pmove" data-item="${x.id}" data-d="-1" data-pi="${pi}">◀</button>` : ''}${ci < p.cols.length - 1 ? `<button class="btn-ic" data-a="pmove" data-item="${x.id}" data-d="1" data-pi="${pi}" ${t('move-' + (x.n || x.id))}>▶</button>` : ''}</div></div>`; }).join('')}
   ${ci === 0 ? `<div class="add-item"><select class="inp" id="pj-add" ${t('pj-add')}><option value="">＋ Add item…</option>${openIssues.map(i => `<option value="#${i.n}">#${i.n} ${esc(i.title)}</option>`).join('')}<option value="draft">📝 새 메모(Draft) 만들기</option></select><input class="inp" id="pj-draft" placeholder="메모 내용 (Draft일 때)"><button class="btn btn-sm full" data-a="padd" data-pi="${pi}" ${t('pj-add-btn')}>Add</button></div>` : ''}</div>`; }).join('')}</div>`;
};
V.pmove = (pi, id, col) => {
  const { r, key } = cur(); const p = r.projects[pi]; const it = p.items.find(x => x.id === id); if (!it || it.col === col) return;
  it.col = col; G.emit('project:move', { key, col, n: it.n }); App.toast(`📋 카드를 "${col}"(으)로 옮겼어요`);
  if (col === 'Done' && it.n && p.autoClose) { const iss = r.issues.find(i => i.n === it.n); if (iss && iss.state === 'open') { iss.state = 'closed'; iss.tl.push({ t: Date.now(), type: 'closed', by: SS().login, via: 'project' }); } }
  V.render();
};
V.A.newproject = () => { V.ui.projForm = true; V.render(); };
V.A.createproject = () => { const { r, key } = cur(); const n = val('pj-name').trim() || `@${SS().login}'s project`; r.projects.push({ title: n, cols: ['Todo', 'In Progress', 'Done'], items: [], seq: 1 }); V.ui.projForm = false; G.emit('project:create', { key, title: n }); App.toast('📋 프로젝트 보드를 만들었어요!'); V.go({ page: 'repo', key, tab: 'projects', sub: 'view', id: r.projects.length - 1 }); };
V.A.openproject = el => { const { key } = cur(); V.go({ page: 'repo', key, tab: 'projects', sub: 'view', id: +el.dataset.i }); };
V.A.padd = el => {
  const { r, key } = cur(); const p = r.projects[+el.dataset.pi]; const s = val('pj-add');
  if (!s) { App.toast('⚠️ 추가할 이슈나 메모를 골라 주세요.', 'warn'); return; }
  if (s === 'draft') { const tx = val('pj-draft').trim(); if (!tx) { App.toast('⚠️ 메모 내용을 적어 주세요.', 'warn'); return; } p.items.push({ id: 'd' + p.seq++, title: tx, col: 'Todo' }); }
  else { const n = +s.slice(1); p.items.push({ id: 'i' + p.seq++, n, col: 'Todo' }); const iss = r.issues.find(i => i.n === n); iss?.tl.push({ t: Date.now(), type: 'project', by: SS().login, p: p.title }); }
  $('pj-add').value = ''; G.emit('project:add', { key }); V.render();
};
V.A.pmove = el => { const { r } = cur(); const p = r.projects[+el.dataset.pi]; const it = p.items.find(x => x.id === el.dataset.item); const ci = p.cols.indexOf(it.col) + +el.dataset.d; V.pmove(+el.dataset.pi, it.id, p.cols[ci]); };

/* ---------- Wiki ---------- */
V.wikiTab = (r, v) => {
  const own = r.owner === SS().login;
  if (v.sub === 'new' || v.sub === 'edit') { const pg = v.sub === 'edit' ? r.wiki.find(w => w.title === v.page2) : null; return `<h3>${pg ? 'Editing ' + esc(pg.title) : 'Create new page'}</h3><input class="inp" id="wk-title" ${t('wk-title')} value="${esc(pg ? pg.title : r.wiki.length ? '' : 'Home')}" placeholder="Title"><textarea class="inp code-area" id="wk-body" ${t('wk-body')} rows="12" placeholder="마크다운으로 문서를 작성해요.">${esc(pg ? pg.body : r.wiki.length ? '' : `# ${r.name} 위키에 오신 걸 환영해요!\n\n이 프로젝트의 사용 설명서를 여기에 적어요.\n\n## 목차\n- 설치 방법\n- 사용 방법\n`)}</textarea><div class="row-end"><button class="btn" data-a="tab" data-tab="wiki">Cancel</button><button class="btn btn-primary" data-a="savewiki" data-old="${esc(pg ? pg.title : '')}" ${t('save-wiki')}>Save page</button></div>`; }
  if (!r.wiki.length) return `<div class="blank"><div class="big">📖</div><h3>Welcome to the ${esc(r.name)} wiki!</h3><p class="muted">Wiki = 프로젝트의 <b>설명서·문서</b>를 여러 페이지로 정리하는 공간이에요. README보다 긴 문서에 좋아요.</p>${own ? `<button class="btn btn-primary" data-a="newwiki" ${t('create-wiki')}>Create the first page</button>` : ''}</div>`;
  const pg = r.wiki.find(w => w.title === v.page2) || r.wiki[0];
  return `<div class="wiki-grid"><div><div class="row-between"><h2>${esc(pg.title)}</h2>${own ? `<span><button class="btn btn-sm" data-a="editwiki" data-p="${esc(pg.title)}">Edit</button> <button class="btn btn-primary btn-sm" data-a="newwiki" ${t('new-wiki')}>New Page</button></span>` : ''}</div><p class="small muted">${esc(pg.by)} edited this page ${ago(pg.t)} · ${pg.rev} revision${pg.rev > 1 ? 's' : ''}</p>${V.md(pg.body, { repo: G.key(r) })}</div>
  <aside class="card"><b>Pages <span class="cnt">${r.wiki.length}</span></b>${r.wiki.map(w => `<div><a href="#" data-a="openwiki" data-p="${esc(w.title)}">${w === pg ? '▸ ' : ''}${esc(w.title)}</a></div>`).join('')}</aside></div>`;
};
V.A.newwiki = () => { const { key } = cur(); V.go({ page: 'repo', key, tab: 'wiki', sub: 'new' }); };
V.A.editwiki = el => { const { key } = cur(); V.go({ page: 'repo', key, tab: 'wiki', sub: 'edit', page2: el.dataset.p }); };
V.A.openwiki = el => { const { key } = cur(); V.go({ page: 'repo', key, tab: 'wiki', page2: el.dataset.p }); };
V.A.savewiki = el => {
  const { r, key } = cur(); const title = val('wk-title').trim(); const body = val('wk-body');
  if (!title) { App.toast('⚠️ 페이지 제목을 적어 주세요.', 'warn'); return; }
  const old = el.dataset.old; let pg = r.wiki.find(w => w.title === (old || title));
  if (pg) { pg.title = title; pg.body = body; pg.t = Date.now(); pg.rev++; } else { pg = { title, body, by: SS().login, t: Date.now(), rev: 1 }; r.wiki.push(pg); }
  G.bump(); G.emit('wiki:create', { key, title }); App.toast('📖 위키 페이지를 저장했어요!'); V.go({ page: 'repo', key, tab: 'wiki', page2: title }, { replace: true });
};

/* ---------- Discussions ---------- */
const CATS = [['📣', 'Announcements', '공지사항'], ['💬', 'General', '자유 수다'], ['💡', 'Ideas', '아이디어 제안'], ['🙏', 'Q&A', '질문과 답변 (답변 채택 가능)'], ['🙌', 'Show and tell', '내 작품 자랑']];
V.discTab = (r, v) => {
  if (v.sub === 'new') return `<h3>Start a new discussion</h3><label class="lbl">Select a category</label><div class="cat-grid">${CATS.map(([e, n, d]) => `<label class="rc ${V.ui.discCat === n ? 'sel' : ''}"><input type="radio" name="dcat" data-a="setcat" data-v="${n}" ${V.ui.discCat === n ? 'checked' : ''} ${t('cat-' + n)}> ${e} <b>${n}</b><small>${d}</small></label>`).join('')}</div>
    <label class="lbl">Title</label><input class="inp" id="ds-title" ${t('ds-title')} placeholder="예: 브랜치는 언제 만들어야 하나요?"><label class="lbl">Body</label><textarea class="inp" id="ds-body" rows="6" ${t('ds-body')}></textarea><div class="row-end"><button class="btn btn-primary" data-a="creatdisc" ${t('start-disc')}>Start discussion</button></div>`;
  if (v.sub === 'view') {
    const d = r.discs.find(x => x.n === v.n); if (!d) return '<div class="flash err">디스커션을 찾을 수 없어요.</div>';
    const mine = d.author === SS().login;
    return `<div class="it-head"><h2>${esc(d.title)} <span class="muted">#${d.n}</span></h2><div><span class="pill">${CATS.find(c => c[1] === d.cat)?.[0]} ${esc(d.cat)}</span> ${d.answer != null ? '<span class="state merged">✓ Answered</span>' : d.cat === 'Q&A' ? '<span class="pill">Unanswered</span>' : ''} <b>${esc(d.author)}</b> started this ${ago(d.t)}</div></div>
     <div class="cmt">${av(d.author, 32)}<div class="cmt-box"><div class="cmt-b">${V.md(d.body)}</div></div></div>
     ${d.comments.map((c, i) => `<div class="cmt ${d.answer === i ? 'answer' : ''}">${av(c.a, 32)}<div class="cmt-box">${d.answer === i ? '<div class="ans-b">✓ Marked as answer</div>' : ''}<div class="cmt-h"><b>${esc(c.a)}</b> ${ago(c.t)}<span class="grow"></span><button class="btn-ic" data-a="upvote" data-i="${i}">▲ ${c.up || 0}</button></div><div class="cmt-b">${V.md(c.body)}</div>${mine && d.cat === 'Q&A' && c.a !== SS().login && d.answer !== i ? `<button class="btn btn-sm" data-a="markanswer" data-i="${i}" ${t('mark-answer')}>✓ Mark as answer</button>` : ''}</div></div>`).join('')}
     ${!d.comments.length && d.cat === 'Q&A' ? '<p class="small muted">⏳ 친구가 답변을 쓰는 중이에요…</p>' : ''}
     <div class="cmt new-cmt">${av(SS().login, 32)}<div class="cmt-box"><textarea class="inp" id="dc-body" rows="3" placeholder="Write a comment"></textarea><div class="row-end"><button class="btn btn-primary btn-sm" data-a="disccomment">Comment</button></div></div></div>`;
  }
  return `<div class="row-between"><h3>💬 Discussions</h3><button class="btn btn-primary btn-sm" data-a="newdisc" ${t('new-disc')}>New discussion</button></div><p class="small muted">Discussions = 커뮤니티 <b>게시판</b>이에요. 버그·할 일은 Issues에, 질문·아이디어·잡담은 Discussions에 써요.</p>
   <div class="list">${r.discs.slice().reverse().map(d => `<div class="li"><span class="dcat">${CATS.find(c => c[1] === d.cat)?.[0]}</span><div class="grow"><a href="#" data-a="opendisc" data-n="${d.n}" class="li-title">${esc(d.title)}</a><div class="small muted">${esc(d.author)} started · ${esc(d.cat)} ${d.answer != null ? '· <span class="ok">✓ Answered</span>' : ''}</div></div><span class="small muted">💬 ${d.comments.length}</span></div>`).join('')}</div>`;
};
V.A.newdisc = () => { const { key } = cur(); V.ui.discCat = V.ui.discCat || 'Q&A'; V.go({ page: 'repo', key, tab: 'discussions', sub: 'new' }); };
V.A.setcat = el => { V.ui.discCat = el.dataset.v; V.render(); };
V.A.creatdisc = () => {
  const { r, key } = cur(); const title = val('ds-title').trim(); if (!title) { App.toast('⚠️ 제목을 적어 주세요.', 'warn'); return; }
  const d = { n: r.num++, title, body: val('ds-body') || '(내용 없음)', cat: V.ui.discCat || 'General', author: SS().login, t: Date.now(), comments: [], answer: null };
  r.discs.push(d); G.bump(); G.emit('disc:create', { key, n: d.n, cat: d.cat }); App.toast('💬 디스커션을 시작했어요!'); G.botTick();
  V.go({ page: 'repo', key, tab: 'discussions', sub: 'view', n: d.n }, { replace: true });
};
V.A.opendisc = el => { const { key } = cur(); V.go({ page: 'repo', key, tab: 'discussions', sub: 'view', n: +el.dataset.n }); };
V.A.markanswer = el => { const { r, v, key } = cur(); const d = r.discs.find(x => x.n === v.n); d.answer = +el.dataset.i; G.emit('disc:answer', { key, n: d.n }); App.toast('✅ 답변으로 채택했어요! 답변자에게 고마움이 전해져요.'); V.render(); };
V.A.upvote = el => { const { r, v } = cur(); const d = r.discs.find(x => x.n === v.n); const c = d.comments[+el.dataset.i]; c.up = (c.up || 0) + 1; V.render(); };
V.A.disccomment = () => { const { r, v } = cur(); const d = r.discs.find(x => x.n === v.n); const b = val('dc-body').trim(); if (!b) return; d.comments.push({ a: SS().login, body: b, t: Date.now(), up: 0 }); $('dc-body').value = ''; V.render(); };

/* ---------- Security ---------- */
V.securityTab = (r, v) => {
  const key = G.key(r), tree = G.tree(r, r.def);
  const open = r.alerts.filter(a => a.state === 'open');
  if (v.sub === 'alert') {
    const a = r.alerts.find(x => x.id === +v.id); if (!a) return '';
    return `<div class="it-head"><h2>${esc(a.title)} <span class="muted">#${a.id}</span></h2><div><span class="state ${a.state === 'open' ? 'closed' : 'merged'}">${a.state === 'open' ? '🛡 Open' : '✓ Fixed'}</span> <span class="pill red">${esc(a.sev)} severity</span> Dependabot alert · <code>package.json</code></div></div>
     <div class="card"><b>📦 Package</b><p><code>lodash</code> (npm) · 현재 버전 <code>${esc(a.cur)}</code> → 안전한 버전 <code>${a.fix}</code></p><b>무슨 문제인가요?</b><p class="small">이 버전의 lodash에는 <b>명령어 주입(Command Injection)</b> 취약점이 알려져 있어요. 나쁜 사람이 이 기능을 이용해 서버에서 원하지 않는 명령을 실행할 수 있어요. 고쳐진 버전으로 올리면 해결돼요.</p>
     ${a.state === 'open' ? (a.pr ? `<div class="flash">🤖 Dependabot이 PR을 만들었어요: <a href="#" data-a="goitem" data-n="${a.pr}" ${t('dep-pr-link')}>#${a.pr} Bump lodash</a> — 확인하고 머지하세요!</div>` : `<button class="btn btn-primary" data-a="deppr" data-id="${a.id}" ${t('dep-create-pr')}>🤖 Create Dependabot security update</button>`) : '<div class="flash ok">✓ 안전한 버전으로 업데이트되어 해결됐어요!</div>'}</div>`;
  }
  if (v.sub === 'dependabot') return `<h3>🤖 Dependabot alerts</h3><div class="list">${r.alerts.map(a => `<div class="li">🛡 <a href="#" data-a="openalert" data-id="${a.id}" class="li-title grow" ${t('alert-item')}>${esc(a.title)}</a><span class="pill red sm">${a.sev}</span><span class="pill sm">${a.state}</span></div>`).join('') || '<p class="pad muted">No Dependabot alerts 🎉</p>'}</div>`;
  if (v.sub === 'secret') return `<h3>🔑 Secret scanning</h3><p class="small muted">Push protection이 막아 낸 비밀 값 기록이에요.</p><div class="list">${r.blocked.map(b => `<div class="li">🛑 <b>GitHub Personal Access Token</b> <span class="small muted grow">in ${esc(b.file)} · blocked ${ago(b.t)} · by ${esc(b.by)}</span><span class="pill sm green">Blocked</span></div>`).join('') || '<p class="pad muted">차단된 비밀 값이 없어요.</p>'}</div>`;
  const hasPolicy = tree['SECURITY.md'] !== undefined;
  return `<h3>🛡️ Security overview</h3><p class="small muted">GitHub는 내 코드가 안전한지 여러 가지 방법으로 지켜 줘요.</p>
   <div class="sec-grid">
    <div class="card sec-card"><b>📜 Security policy</b> ${hasPolicy ? '<span class="pill green sm">Enabled</span>' : '<span class="pill sm">Disabled</span>'}<p class="small muted">보안 문제를 발견한 사람이 어떻게 알려야 하는지 안내하는 SECURITY.md 파일이에요.</p>${hasPolicy ? `<button class="btn btn-sm" data-a="openfile2" data-p="SECURITY.md">View policy</button>` : r.owner === SS().login ? `<button class="btn btn-sm" data-a="secpolicy" ${t('sec-policy')}>Start setup</button>` : ''}</div>
    <div class="card sec-card"><b>🤖 Dependabot alerts</b> ${open.length ? `<span class="pill red sm">${open.length} open</span>` : '<span class="pill green sm">Enabled</span>'}<p class="small muted">내가 쓰는 라이브러리(package.json 등)에 알려진 취약점이 있으면 알려 주고, 고치는 PR까지 만들어 줘요.</p><button class="btn btn-sm" data-a="secsub" data-v="dependabot" ${t('dep-alerts')}>View Dependabot alerts</button></div>
    <div class="card sec-card"><b>🔑 Secret scanning</b> <span class="pill green sm">Enabled</span><p class="small muted">비밀번호·토큰이 코드에 섞여 올라가는 걸 감지하고 <b>push 자체를 막아요</b>(Push protection).</p><button class="btn btn-sm" data-a="secsub" data-v="secret">View alerts (${r.blocked.length})</button></div>
    <div class="card sec-card"><b>🔍 Code scanning</b> <span class="pill sm">Not set up</span><p class="small muted">CodeQL 같은 도구가 내 코드에서 위험한 패턴(버그·보안 구멍)을 자동으로 찾아줘요. (Actions로 설정)</p></div>
   </div>`;
};
V.A.secsub = el => { const { key } = cur(); V.go({ page: 'repo', key, tab: 'security', sub: el.dataset.v }); };
V.A.openalert = el => { const { key } = cur(); G.emit('alert:view', { key }); V.go({ page: 'repo', key, tab: 'security', sub: 'alert', id: +el.dataset.id }); };
V.A.deppr = el => { const { r, key } = cur(); const a = r.alerts.find(x => x.id === +el.dataset.id); const pr = G.depPR(key, a); App.toast('🤖 Dependabot이 보안 업데이트 PR을 만들었어요!'); G.emit('dependabot:pr', { key, n: pr.n }); V.render(); };
V.A.secpolicy = () => { const { key } = cur(); V.ui.preset = { path: 'SECURITY.md', content: '# Security Policy\n\n## Reporting a Vulnerability\n\n보안 문제를 발견하면 공개 이슈 대신 이메일로 알려 주세요.\n\n- 연락처: security@example.com\n- 3일 안에 답장드릴게요.\n' }; V.ui.draftFor = null; V.go({ page: 'repo', key, tab: 'code', sub: 'new' }); };
V.A.openfile2 = el => { const { key } = cur(); V.go({ page: 'repo', key, tab: 'code', sub: 'blob', path: el.dataset.p }); };

/* ---------- Settings ---------- */
V.settingsTab = (r, v) => {
  const sub = v.sub || 'general'; const key = G.key(r);
  const nav = [['general', '⚙️ General'], ['access', '👥 Collaborators'], ['branches', `${ICON.branch} Branches`], ['secrets', '🔐 Secrets and variables'], ['pages', '🌐 Pages']];
  let body = '';
  if (sub === 'general') body = `<h3>General</h3><label class="lbl">Repository name</label><div class="row gap"><input class="inp" id="st-name" value="${esc(r.name)}"><button class="btn btn-sm" data-a="rename">Rename</button></div>
    <h4 class="mt">Features</h4><p class="small muted">저장소 탭에 보일 기능을 켜고 끌 수 있어요.</p>
    ${[['wiki', 'Wikis', '문서 페이지'], ['issues', 'Issues', '할 일·버그 추적'], ['discussions', 'Discussions', '커뮤니티 게시판'], ['projects', 'Projects', '칸반 보드']].map(([k, n, d]) => `<label class="cb"><input type="checkbox" data-a="feature" data-f="${k}" ${r.features[k] ? 'checked' : ''} ${t('feat-' + k)}> <b>${n}</b> <small class="muted">${d}</small></label>`).join('')}
    <h4 class="mt err">Danger Zone</h4><div class="danger"><div class="row-between"><div><b>Change repository visibility</b><p class="small muted">This repository is currently ${r.priv ? 'private' : 'public'}.</p></div><button class="btn btn-danger btn-sm" data-a="togglevis">Make ${r.priv ? 'public' : 'private'}</button></div>
    <div class="row-between"><div><b>Delete this repository</b><p class="small muted">Once you delete a repository, there is no going back. Please be certain.</p></div><button class="btn btn-danger btn-sm" data-a="delrepo">Delete this repository</button></div></div>`;
  if (sub === 'access') body = `<h3>Collaborators</h3><p class="small muted">공동작업자(Collaborator)를 초대하면 그 사람도 이 저장소에 직접 push 할 수 있어요. 팀 프로젝트할 때 써요!</p>
    <div class="card"><div class="row-between"><b>Manage access</b><button class="btn btn-primary btn-sm" data-a="addpeople" ${t('add-people')}>Add people</button></div>
    ${V.ui.addPeople ? `<div class="pad-s"><input class="inp" id="ap-q" data-live="1" placeholder="Search by username" ${t('ap-q')}><div>${['dain-friend', 'mina-dev', 'leo-k'].filter(n => !val('ap-q') || n.includes(val('ap-q'))).map(n => `<button class="pick" data-a="invite" data-u="${n}" ${t('invite-' + n)}>${av(n, 22)} <b>${n}</b> <small class="muted">Invite</small></button>`).join('')}</div></div>` : ''}
    ${r.collab.map(c => `<div class="li">${av(c.name, 24)} <b>${esc(c.name)}</b> <span class="grow"></span>${c.status === 'pending' ? '<span class="pill sm">⏳ Pending invite</span>' : '<span class="pill sm green">Collaborator</span>'}<button class="btn-ic" data-a="rmcollab" data-u="${esc(c.name)}">✕</button></div>`).join('') || '<p class="small muted pad-s">아직 초대한 사람이 없어요.</p>'}</div>`;
  if (sub === 'branches') body = `<h3>Branch protection rules</h3><p class="small muted">중요한 브랜치(main)를 보호해요. 예: 누구도 main에 바로 push 못 하고, 반드시 PR + 리뷰를 거치게 할 수 있어요.</p>
    ${Object.entries(r.protect).map(([b, p]) => `<div class="li">🔒 <b>${esc(b)}</b> <span class="small muted grow">${p.pr ? `Require PR · ${p.approvals} approval(s)` : ''}${p.checks ? ' · Require status checks' : ''}</span><button class="btn btn-sm" data-a="rmprotect" data-b="${esc(b)}" ${t('bp-del')}>Delete</button></div>`).join('')}
    ${V.ui.bpForm ? `<div class="card"><label class="lbl">Branch name pattern *</label><input class="inp mono" id="bp-pattern" value="${esc(r.def)}" ${t('bp-pattern')}>
      <label class="cb"><input type="checkbox" id="bp-pr" checked ${t('bp-pr')}> <b>Require a pull request before merging</b><small class="muted">이 브랜치에 바로 커밋/push 할 수 없고 PR로만 합칠 수 있어요.</small></label>
      <label class="cb sub">Required approvals <select id="bp-appr" class="inp sm"><option>0</option><option selected>1</option><option>2</option></select></label>
      <label class="cb"><input type="checkbox" id="bp-checks"> <b>Require status checks to pass</b><small class="muted">Actions 테스트가 통과해야 머지 가능 (연습장에선 표시만)</small></label>
      <div class="row-end"><button class="btn btn-primary btn-sm" data-a="saveprotect" ${t('bp-save')}>Create</button></div></div>` : `<button class="btn btn-sm" data-a="bpform" ${t('add-rule')}>Add branch protection rule</button>`}`;
  if (sub === 'secrets') body = `<h3>🔐 Actions secrets</h3><p class="small muted">비밀번호·API 키·토큰은 코드에 쓰지 말고 여기에 저장해요. 워크플로에서 <code>\${{ secrets.이름 }}</code> 으로 꺼내 쓰고, 저장한 값은 <b>다시 볼 수 없어요</b>(안전!).</p>
    <div class="card"><div class="row-between"><b>Repository secrets</b><button class="btn btn-primary btn-sm" data-a="secretform" ${t('new-secret')}>New repository secret</button></div>
    ${V.ui.secretForm ? `<div class="pad-s"><label class="lbl">Name *</label><input class="inp mono" id="sc-name" placeholder="MY_TOKEN" ${t('sc-name')}><label class="lbl">Secret *</label><textarea class="inp mono" id="sc-val" rows="2" ${t('sc-val')}></textarea><div class="row-end"><button class="btn btn-primary btn-sm" data-a="addsecret" ${t('add-secret')}>Add secret</button></div></div>` : ''}
    ${(r.secrets || []).map(s => `<div class="li">🔒 <code>${esc(s.name)}</code><span class="small muted grow">Updated ${ago(s.t)}</span><span class="mono muted">••••••••</span></div>`).join('') || '<p class="small muted pad-s">This repository has no secrets.</p>'}</div>`;
  if (sub === 'pages') {
    const p = r.pages;
    body = `<h3>🌐 GitHub Pages</h3><p class="small muted">GitHub Pages = 저장소의 HTML 파일을 <b>무료로 웹사이트로</b> 만들어 주는 기능이에요. <code>index.html</code>이 첫 화면이 돼요.</p>
     ${p?.status === 'built' ? `<div class="flash ok row-between"><span>🎉 Your site is live at <b>${esc(G.pagesUrl(r))}</b></span><button class="btn btn-sm" data-a="visitsite" ${t('visit-site')}>Visit site ↗</button></div>` : p ? '<div class="flash warn">⏳ 사이트를 만드는 중이에요… (Actions 탭에서 진행 상황을 볼 수 있어요)</div>' : ''}
     <div class="card"><h4>Build and deployment</h4><label class="lbl">Source</label><select class="inp" id="pg-src"><option>Deploy from a branch</option><option disabled>GitHub Actions</option></select>
     <label class="lbl">Branch</label><div class="row gap"><select class="inp" id="pg-br" ${t('pg-br')}><option value="">None</option>${Object.keys(r.branches).map(b => `<option ${p?.branch === b ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select><select class="inp" id="pg-dir"><option>/ (root)</option><option disabled>/docs</option></select><button class="btn btn-sm" data-a="savepages" ${t('pg-save')}>Save</button></div>
     ${!G.tree(r, r.def)['index.html'] ? '<p class="small warn-t">⚠️ 아직 <code>index.html</code>이 없어요. 없으면 README.md가 대신 보여요.</p>' : ''}</div>`;
  }
  return `<div class="set-grid"><aside class="set-nav">${nav.map(([k, l]) => `<button class="side-it ${sub === k ? 'sel' : ''}" data-a="setsub" data-v="${k}" ${t('set-' + k)}>${l}</button>`).join('')}</aside><div class="set-main">${body}</div></div>`;
};
V.A.setsub = el => { const { key } = cur(); V.go({ page: 'repo', key, tab: 'settings', sub: el.dataset.v }); };
V.A.feature = el => { const { r, key } = cur(); const f = el.dataset.f; r.features[f] = el.checked; if (f === 'discussions' && el.checked && !r.discs.length) r.discs.push({ n: r.num++, title: `Welcome to ${r.name} Discussions!`, body: '👋 디스커션이 열렸어요! 질문, 아이디어, 자랑을 자유롭게 나눠요.', cat: 'Announcements', author: SS().login, t: Date.now(), comments: [], answer: null }); G.emit('feature:toggle', { key, f, on: el.checked }); App.toast(`${el.checked ? '✅' : '⛔'} ${f} 기능을 ${el.checked ? '켰어요' : '껐어요'}`); V.render(); };
V.A.rename = () => {
  const { r, key } = cur(); const n = val('st-name').trim(); if (!n || n === r.name) return;
  if (!/^[\w.-]+$/.test(n) || G.repo(r.owner + '/' + n)) { App.toast('⚠️ 쓸 수 없는 이름이에요.', 'warn'); return; }
  const nk = r.owner + '/' + n; delete SS().repos[key]; r.name = n; SS().repos[nk] = r;
  Object.values(SS().repos).forEach(x => { if (x.forkOf === key) x.forkOf = nk; x.pulls.forEach(p => { if (p.hrepo === key) p.hrepo = nk; }); });
  App.toast('✏️ 저장소 이름을 바꿨어요. 예전 주소로 들어와도 GitHub가 새 주소로 안내해 줘요.'); G.emit('repo:rename', { from: key, to: nk });
  V.go({ page: 'repo', key: nk, tab: 'settings' }, { replace: true });
};
V.A.togglevis = () => { const { r } = cur(); App.confirm(`정말 ${r.priv ? 'Public(공개)' : 'Private(비공개)'}으로 바꿀까요?`, () => { r.priv = !r.priv; G.emit('repo:visibility', { priv: r.priv }); V.render(); }); };
V.A.delrepo = () => {
  const { r, key } = cur();
  App.modal(`<h3 class="err">Delete ${esc(key)}</h3><div class="flash err small">⚠️ 이 작업은 되돌릴 수 없어요! 모든 파일, 이슈, PR이 영원히 사라져요.</div><p>계속하려면 <b>${esc(key)}</b> 를 정확히 입력하세요.</p><input class="inp mono" id="del-confirm" data-live2="1"><div class="row-end"><button class="btn" data-a="modal-close">Cancel</button><button class="btn btn-danger" data-a="dodelrepo">Delete this repository</button></div>`);
};
V.A.dodelrepo = () => { const { key } = cur(); if (val('del-confirm') !== key) { App.toast('⚠️ 저장소 이름이 정확하지 않아요.', 'warn'); return; } delete SS().repos[key]; Object.values(SS().local.home).forEach(d => { if (d.git && d.git.remotes.origin && G.urlKey(d.git.remotes.origin) === key) {} }); App.closeModal(); App.toast('🗑 저장소를 삭제했어요.'); G.emit('repo:delete', { key }); V.go({ page: 'home' }, { replace: true }); };
V.A.addpeople = () => { V.ui.addPeople = !V.ui.addPeople; V.render(); };
V.A.invite = el => { const { r, key } = cur(); const u = el.dataset.u; if (r.collab.some(c => c.name === u)) return; r.collab.push({ name: u, status: 'pending' }); V.ui.addPeople = false; App.toast(`✉️ ${u}님에게 초대장을 보냈어요!`); G.emit('collab:add', { key, name: u }); G.botTick(); V.render(); };
V.A.rmcollab = el => { const { r } = cur(); r.collab = r.collab.filter(c => c.name !== el.dataset.u); V.render(); };
V.A.bpform = () => { V.ui.bpForm = true; V.render(); };
V.A.saveprotect = () => { const { r, key } = cur(); const b = val('bp-pattern').trim(); if (!b) return; r.protect[b] = { pr: chk('bp-pr'), approvals: +val('bp-appr'), checks: chk('bp-checks') }; V.ui.bpForm = false; App.toast(`🔒 ${b} 브랜치를 보호하기 시작했어요!`); G.emit('protect:add', { key, br: b, pr: chk('bp-pr'), approvals: +val('bp-appr') }); V.render(); };
V.A.rmprotect = el => { const { r, key } = cur(); delete r.protect[el.dataset.b]; App.toast('🔓 보호 규칙을 삭제했어요.'); G.emit('protect:remove', { key, br: el.dataset.b }); V.render(); };
V.A.secretform = () => { V.ui.secretForm = true; V.render(); };
V.A.addsecret = () => { const { r, key } = cur(); const n = val('sc-name').trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_'); if (!n || !val('sc-val')) { App.toast('⚠️ 이름과 값을 모두 적어 주세요.', 'warn'); return; } r.secrets = r.secrets || []; r.secrets = r.secrets.filter(s => s.name !== n); r.secrets.push({ name: n, t: Date.now() }); V.ui.secretForm = false; App.toast(`🔐 ${n} 을(를) 안전하게 저장했어요. 값은 다시 볼 수 없어요.`); G.emit('secret:add', { key, name: n }); V.render(); };
V.A.savepages = () => { const { r, key } = cur(); const b = val('pg-br'); if (!b) { r.pages = null; V.render(); return; } r.pages = { branch: b, status: 'building' }; G.pagesBuild(key); App.toast('🌐 GitHub Pages 배포를 시작했어요!'); G.emit('pages:enable', { key, br: b }); V.render(); };
V.A.visitsite = () => { const { r, key } = cur(); G.emit('pages:visit', { key }); V.go({ page: 'site', key }); };

/* ---------- Insights ---------- */
V.insightsTab = r => {
  const tip = r.branches[r.def]; const cs = tip ? [...G.anc(tip)].map(G.c) : [];
  const by = {}; cs.forEach(c => (by[c.a] = (by[c.a] || 0) + 1)); const max = Math.max(1, ...Object.values(by));
  return `<h3>📈 Insights · Contributors</h3><p class="small muted">누가 얼마나 기여했는지 보여 줘요. (${esc(r.def)} 브랜치 기준)</p><div class="card">${Object.entries(by).sort((a, b) => b[1] - a[1]).map(([a, n]) => `<div class="contrib-row">${av(a, 24)} <b>${esc(a)}</b><div class="bar"><span style="width:${(n / max) * 100}%"></span></div><span class="small">${n} commits</span></div>`).join('') || '<p class="muted">아직 커밋이 없어요.</p>'}</div>
  <div class="card"><b>Pulse</b><p class="small">${r.pulls.filter(p => p.state === 'merged').length} merged PRs · ${r.pulls.filter(p => p.state === 'open').length} open PRs · ${r.issues.filter(i => i.state === 'closed').length} closed issues · ${r.issues.filter(i => i.state === 'open').length} open issues</p></div>`;
};

/* ---------- Releases ---------- */
V.releases = r => `<div class="row-between"><h3>🏷 Releases</h3><span><button class="btn btn-sm" data-a="sub" data-sub="tags">Tags</button> ${r.owner === SS().login ? `<button class="btn btn-primary btn-sm" data-a="newrelease" ${t('draft-release')}>Draft a new release</button>` : ''}</span></div><p class="small muted">Release = "버전 1.0 완성!" 처럼 특정 시점을 공식 버전으로 발표하는 기능이에요. 태그(이름표) + 설명 + 다운로드 파일로 구성돼요.</p>
  ${r.releases.map((x, i) => `<div class="card release"><div class="row-between"><h3>${esc(x.title)}</h3>${i === 0 && !x.pre ? '<span class="pill green">Latest</span>' : x.pre ? '<span class="pill">Pre-release</span>' : ''}</div><div class="small muted">🏷 <code>${esc(x.tag)}</code> · ${av(x.by, 16)} ${esc(x.by)} released this ${ago(x.t)}</div>${V.md(x.notes || '')}<div class="assets"><b class="small">Assets</b><div class="small">📦 Source code (zip)</div><div class="small">📦 Source code (tar.gz)</div></div></div>`).join('') || '<div class="blank"><div class="big">🏷</div><h3>There aren\'t any releases here</h3></div>'}`;
V.releaseNew = r => {
  const tags = Object.keys(r.tags);
  return `<h3>Draft a new release</h3><div class="card"><div class="row gap wrap"><label>🏷 Choose a tag <input class="inp mono" id="rl-tag" list="rl-tags" placeholder="v1.0.0" ${t('rl-tag')}><datalist id="rl-tags">${tags.map(x => `<option>${esc(x)}</option>`).join('')}</datalist></label>
   <label>Target <select class="inp" id="rl-target">${Object.keys(r.branches).map(b => `<option>${esc(b)}</option>`).join('')}</select></label></div>
   <p class="small muted">💡 버전 이름은 보통 <b>v주.부.수</b> 형식(Semantic Versioning)을 써요. 큰 변화 v2.0.0, 기능 추가 v1.1.0, 버그 수정 v1.0.1</p>
   <label class="lbl">Release title</label><input class="inp" id="rl-title" placeholder="예: 첫 번째 정식 버전 🎉" ${t('rl-title')}>
   <div class="row-between"><label class="lbl">Describe this release</label><button class="btn btn-sm" data-a="gennotes" ${t('gen-notes')}>✨ Generate release notes</button></div><textarea class="inp" id="rl-notes" rows="8" ${t('rl-notes')}></textarea>
   <label class="cb"><input type="checkbox" id="rl-pre"> Set as a pre-release <small class="muted">(아직 완성 전인 시험판)</small></label>
   <div class="row-end"><button class="btn" data-a="sub" data-sub="releases">Cancel</button><button class="btn btn-primary" data-a="publishrel" ${t('publish-release')}>Publish release</button></div></div>`;
};
V.tagsPage = r => `<h3>🏷 Tags</h3><p class="small muted">태그 = 특정 커밋에 붙이는 이름표예요 (예: v1.0.0). 터미널에서 <code>git tag v1.0.0</code> → <code>git push origin v1.0.0</code> 으로도 만들 수 있어요.</p><div class="list">${Object.entries(r.tags).map(([n, id]) => `<div class="li">🏷 <b>${esc(n)}</b> <code class="muted">${id.slice(0, 7)}</code> <span class="small muted grow">${esc(G.c(id)?.m || '')}</span></div>`).join('') || '<p class="pad muted">아직 태그가 없어요.</p>'}</div>`;
V.A.newrelease = () => { const { key } = cur(); V.go({ page: 'repo', key, tab: 'code', sub: 'release-new' }); };
V.A.gennotes = () => {
  const { r } = cur(); const tip = r.branches[val('rl-target') || r.def]; const prev = r.releases[0] ? r.tags[r.releases[0].tag] : null;
  const cs = G.ahead(prev, tip).reverse(); const prs = r.pulls.filter(p => p.state === 'merged' && (!r.releases[0] || p.merged.t > r.releases[0].t));
  $('rl-notes').value = `## What's Changed\n${prs.map(p => `* ${p.title} by @${p.author} in #${p.n}`).join('\n') || cs.slice(0, 10).map(c => `* ${c.m} (${c.id.slice(0, 7)})`).join('\n')}\n\n**Full Changelog**: ${r.releases[0] ? r.releases[0].tag + '...' : 'commits/'}${val('rl-tag') || 'v1.0.0'}\n`;
  App.toast('✨ 커밋과 PR을 모아 릴리스 노트를 자동으로 만들었어요!');
};
V.A.publishrel = () => {
  const { r, key } = cur(); const tag = val('rl-tag').trim(); if (!tag) { App.toast('⚠️ 태그를 정해 주세요 (예: v1.0.0)', 'warn'); return; }
  if (!/^[\w.-]+$/.test(tag)) { App.toast('⚠️ 태그 이름이 올바르지 않아요.', 'warn'); return; }
  if (r.releases.some(x => x.tag === tag)) { App.toast('⚠️ 이 태그로 만든 릴리스가 이미 있어요.', 'warn'); return; }
  if (!r.tags[tag]) r.tags[tag] = r.branches[val('rl-target') || r.def];
  const rel = { tag, title: val('rl-title').trim() || tag, notes: val('rl-notes'), pre: chk('rl-pre'), by: SS().login, t: Date.now() };
  r.releases.unshift(rel); G.bump(); App.toast(`🚀 ${rel.title} 릴리스를 발표했어요!`); G.emit('release:create', { key, tag, notes: rel.notes });
  V.go({ page: 'repo', key, tab: 'code', sub: 'releases' }, { replace: true });
};

/* ---------- 프로필 ---------- */
V.grass = () => {
  const S = SS(); const days = []; const end = new Date(); end.setHours(0, 0, 0, 0); const start = new Date(end); start.setDate(start.getDate() - 364 - end.getDay());
  let total = 0; for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) { const k = G.today(d.getTime()); const n = S.contrib[k] || 0; total += n; days.push({ k, n }); }
  const lv = n => (n === 0 ? 0 : n < 3 ? 1 : n < 6 ? 2 : n < 10 ? 3 : 4);
  const weeks = []; for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return `<div class="grass-wrap"><div class="small"><b>${total}</b> contributions in the last year</div><div class="grass">${weeks.map(w => `<div class="gw">${w.map(d => `<i class="g${lv(d.n)}" title="${d.k}: ${d.n} contributions"></i>`).join('')}</div>`).join('')}</div><div class="small muted row-end">Less <i class="g0"></i><i class="g1"></i><i class="g2"></i><i class="g3"></i><i class="g4"></i> More</div><p class="small muted">🌱 커밋·PR·이슈를 만들 때마다 오늘 칸이 초록색으로 진해져요. 이걸 "잔디 심기"라고 불러요!</p></div>`;
};
V.profile = () => {
  const S = SS(), v = S.view, user = v.user || S.login;
  if (user !== S.login) {
    const repos = Object.values(S.repos).filter(r => r.owner === user);
    return `<div class="prof"><aside>${av(user, 200)}<h2>${esc(user)}</h2><p class="muted">${user === 'octo-academy' ? '🏫 오픈소스 학습 단체 (연습용 가상 조직)' : '🙂 연습용 가상 사용자'}</p></aside><main><h3>Repositories</h3>${repos.map(r => `<div class="card"><a href="#" data-a="gorepo" data-k="${esc(G.key(r))}"><b>${esc(r.name)}</b></a> <span class="pill sm">Public</span><p class="small muted">${esc(r.desc)}</p><span class="small">⭐ ${r.stars}</span></div>`).join('')}</main></div>`;
  }
  const pr = S.repos[S.login + '/' + S.login]; const readme = pr ? G.tree(pr, pr.def)['README.md'] : null;
  const repos = Object.values(S.repos).filter(r => r.owner === S.login);
  const tab = v.ptab || 'overview';
  const badges = App.badgeList();
  return `<div class="prof"><aside>${av(S.login, 200)}<h2>${esc(S.name)}</h2><div class="muted">${esc(S.login)}</div>
    ${V.ui.editBio ? `<textarea class="inp" id="bio-in" rows="2">${esc(S.bio)}</textarea><button class="btn btn-sm" data-a="savebio">Save</button>` : `<p>${esc(S.bio) || '<span class="muted small">자기소개가 없어요</span>'}</p><button class="btn btn-sm full" data-a="editbio">Edit profile</button>`}
    <p class="small muted">👥 ${Object.keys(S.starred).length} stars · ${repos.length} repositories</p>
    <h4>Achievements</h4><div class="ach">${badges.filter(b => b.got).map(b => `<span class="ach-b" title="${esc(b.name)}">${b.icon}</span>`).join('') || '<span class="small muted">미션을 깨면 배지가 생겨요!</span>'}</div></aside>
   <main><div class="tabs"><button class="tab ${tab === 'overview' ? 'sel' : ''}" data-a="ptab" data-v="overview">📖 Overview</button><button class="tab ${tab === 'repos' ? 'sel' : ''}" data-a="ptab" data-v="repos">${ICON.repo} Repositories <span class="cnt">${repos.length}</span></button><button class="tab ${tab === 'stars' ? 'sel' : ''}" data-a="ptab" data-v="stars">⭐ Stars <span class="cnt">${Object.keys(S.starred).length}</span></button></div>
   ${tab === 'repos' ? repos.map(r => `<div class="card"><a href="#" data-a="gorepo" data-k="${esc(G.key(r))}"><b>${esc(r.name)}</b></a> <span class="pill sm">${r.priv ? 'Private' : 'Public'}</span>${r.forkOf ? `<div class="small muted">Forked from ${esc(r.forkOf)}</div>` : ''}<p class="small muted">${esc(r.desc)}</p></div>`).join('') || '<p class="muted pad">아직 저장소가 없어요.</p>'
     : tab === 'stars' ? Object.keys(S.starred).map(k => `<div class="card">⭐ <a href="#" data-a="gorepo" data-k="${esc(k)}"><b>${esc(k)}</b></a></div>`).join('') || '<p class="muted pad">별을 누른 저장소가 없어요.</p>'
     : `${readme ? `<div class="card prof-readme"><div class="small muted">${esc(S.login)} / README.md</div>${V.md(readme, { tree: G.tree(pr, pr.def) })}</div>` : `<div class="card dashed small">✨ <b>${esc(S.login)}/${esc(S.login)}</b> 이라는 이름의 저장소를 만들고 README.md를 쓰면 여기에 나만의 자기소개가 나타나요!</div>`}
     <h4>Popular repositories</h4><div class="pin-grid">${repos.slice(0, 6).map(r => `<div class="card"><a href="#" data-a="gorepo" data-k="${esc(G.key(r))}"><b>${esc(r.name)}</b></a> <span class="pill sm">${r.priv ? 'Private' : 'Public'}</span><p class="small muted">${esc(r.desc)}</p></div>`).join('') || '<p class="muted small">저장소가 없어요</p>'}</div>${V.grass()}`}</main></div>`;
};
V.A.ptab = el => { V.go({ ...SS().view, ptab: el.dataset.v }); };
V.A.editbio = () => { V.ui.editBio = true; V.render(); };
V.A.savebio = () => { SS().bio = val('bio-in'); V.ui.editBio = false; V.render(); };

/* ---------- Explore / 알림 ---------- */
V.explore = () => {
  const S = SS(); const list = Object.values(S.repos).filter(r => !r.priv && r.owner !== S.login).sort((a, b) => b.stars - a.stars);
  return `<div class="narrow"><h2>🧭 Explore</h2><p class="muted">전 세계 사람들의 공개 저장소를 둘러보고, 마음에 들면 ⭐ Star, 기여하고 싶으면 🍴 Fork 해요.</p><h4>🔥 Trending repositories</h4>
   ${list.map(r => `<div class="card ex-card"><div class="row-between"><div>${av(r.owner, 20)} <a href="#" data-a="gorepo" data-k="${esc(G.key(r))}" ${t('ex-' + G.key(r))}>${esc(r.owner)} / <b>${esc(r.name)}</b></a></div><button class="btn btn-sm ${S.starred[G.key(r)] ? 'on star' : ''}" data-a="starkey" data-k="${esc(G.key(r))}">${S.starred[G.key(r)] ? '⭐ Starred' : '☆ Star'}</button></div><p class="small">${esc(r.desc)}</p><span class="small muted">⭐ ${r.stars.toLocaleString()} · 🍴 ${r.forks}</span></div>`).join('')}</div>`;
};
V.notifications = () => { const S = SS(); (S.inbox || []).forEach(n => (n.read = true)); return `<div class="narrow"><h2>🔔 Notifications</h2>${(S.inbox || []).map(n => `<div class="li">${esc(n.s)} <span class="small muted">${ago(n.t)}</span></div>`).join('') || '<p class="muted">All caught up! 🎉</p>'}</div>`; };

/* ---------- Gist ---------- */
V.gistNew = () => `<div class="narrow"><h2>📎 Instantly share code, notes, and snippets.</h2><p class="muted small">Gist = 짧은 코드나 메모를 저장소 없이 빠르게 공유하는 기능이에요. 각 Gist도 사실 작은 Git 저장소예요!</p>
  <input class="inp" id="gs-desc" placeholder="Gist description..." ${t('gs-desc')}><div class="card"><input class="inp mono" id="gs-name" placeholder="Filename including extension... (예: memo.md)" ${t('gs-name')}><textarea class="inp code-area" id="gs-content" rows="10" ${t('gs-content')} placeholder="내용을 입력하세요"></textarea></div>
  <div class="row-end"><button class="btn" data-a="creategist" data-pub="0" ${t('gist-secret')}>Create secret gist</button><button class="btn btn-primary" data-a="creategist" data-pub="1" ${t('gist-public')}>Create public gist</button></div><p class="small muted">🔒 secret gist = 검색에 안 나오지만 주소를 아는 사람은 볼 수 있어요.</p></div>`;
V.gists = () => { const S = SS(); return `<div class="narrow"><div class="row-between"><h2>📎 ${esc(S.login)}'s gists</h2><button class="btn btn-primary btn-sm" data-a="gistnew">＋ New gist</button></div>${S.gists.map(g => `<div class="card"><a href="#" data-a="opengist" data-id="${g.id}"><b>${esc(Object.keys(g.files)[0])}</b></a> ${g.pub ? '' : '<span class="pill sm">Secret</span>'}<p class="small muted">${esc(g.desc)} · ${ago(g.t)}</p></div>`).join('') || '<p class="muted">아직 Gist가 없어요.</p>'}</div>`; };
V.gistView = () => { const S = SS(); const g = S.gists.find(x => x.id === S.view.id); if (!g) return V.notFound(); const [n, c] = Object.entries(g.files)[0]; return `<div class="narrow"><h2>${av(S.login, 24)} ${esc(S.login)} / <b>${esc(n)}</b> ${g.pub ? '' : '<span class="pill sm">Secret</span>'}</h2><p class="muted">${esc(g.desc)}</p><div class="row gap small"><span class="pill">Revisions 1</span><span class="pill">⭐ 0</span><input class="inp mono sm" readonly value="https://gist.github.com/${esc(S.login)}/${g.id}"></div><div class="card"><div class="small muted">📄 ${esc(n)}</div>${/\.md$/.test(n) ? V.md(c) : `<pre class="code-blk">${esc(c)}</pre>`}</div></div>`; };
V.A.creategist = el => {
  const S = SS(); const name = val('gs-name').trim(), c = val('gs-content');
  if (!name || !c.trim()) { App.toast('⚠️ 파일 이름과 내용을 모두 적어 주세요.', 'warn'); return; }
  if (G.SECRET_RE.test(c)) { V.secretBlocked(name); return; }
  const g = { id: G.hex().slice(0, 20), desc: val('gs-desc'), files: { [name]: c }, pub: el.dataset.pub === '1', t: Date.now() };
  S.gists.unshift(g); G.bump(); App.toast('📎 Gist를 만들었어요!'); G.emit('gist:create', { id: g.id, pub: g.pub });
  V.go({ page: 'gist', id: g.id }, { replace: true });
};
V.A.opengist = el => V.go({ page: 'gist', id: el.dataset.id });

/* ---------- Pages 사이트 ---------- */
V.site = () => {
  const r = G.repo(SS().view.key);
  if (!r || !r.pages || r.pages.status !== 'built') return `<div class="site404"><div class="big404">404</div><h2>There isn't a GitHub Pages site here.</h2><p class="muted">배포가 아직 끝나지 않았거나 Pages가 꺼져 있어요.</p><button class="btn" data-a="back">← 돌아가기</button></div>`;
  const tree = G.tree(r, r.pages.branch);
  let html = tree['index.html'];
  if (html) html = html.replace(/(src|href)=["']([^"':#]+\.(png|jpe?g|gif|svg|css))["']/gi, (m, a, p) => { const v = tree[p.replace(/^\.\//, '')]; if (v === undefined) return m; if (/\.css$/i.test(p)) return m; return `${a}="${v}"`; }).replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi, (m, p) => tree[p] !== undefined ? `<style>${tree[p]}</style>` : m);
  else html = `<!doctype html><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.6}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px}</style>${V.md(tree['README.md'] || '# ' + r.name)}`;
  return `<div class="site-wrap"><div class="site-note small">🌐 <b>${esc(G.pagesUrl(r))}</b> — 전 세계 누구나 이 주소로 들어올 수 있는 진짜 웹사이트예요! (연습장 미리보기) <button class="btn btn-sm" data-a="back">← GitHub로 돌아가기</button></div><iframe class="site-frame" sandbox="allow-scripts" srcdoc="${esc(html)}"></iframe></div>`;
};

/* ---------- Codespaces ---------- */
V.codespace = () => {
  const cs = V.ui.cs; if (!cs) return '';
  if (cs.boot) return `<div class="cs-over"><div class="cs-boot"><div class="spinner"></div><h3>Setting up your codespace</h3><p class="small">☁️ 클라우드 컴퓨터를 켜고, ${esc(cs.key)} 저장소를 clone 하는 중…</p></div></div>`;
  const tree = cs.files; const f = cs.file || Object.keys(tree).find(p => /README/i.test(p)) || Object.keys(tree)[0];
  const r = G.repo(cs.key); const base = G.tree(r, cs.br); const changed = G.dtree(base, tree);
  return `<div class="cs-over"><div class="cs"><div class="cs-top"><span>🖥️ <b>codespace</b> · ${esc(cs.key)} <span class="pill sm">${ICON.branch} ${esc(cs.br)}</span></span><button class="btn btn-sm" data-a="csclose" ${t('cs-close')}>✕ Stop &amp; close</button></div>
   <div class="cs-body"><div class="cs-exp"><div class="cs-h">EXPLORER</div>${Object.keys(tree).sort().map(p => `<button class="${p === f ? 'sel' : ''}" data-a="csfile" data-p="${esc(p)}">${changed.some(d => d.p === p) ? '<span class="cs-m">M</span>' : ''}📄 ${esc(p)}</button>`).join('')}
    <div class="cs-h mt">SOURCE CONTROL ${changed.length ? `<span class="cnt">${changed.length}</span>` : ''}</div><input class="inp sm" id="cs-msg" placeholder="Message (커밋 메시지)" ${t('cs-msg')}><button class="btn btn-primary btn-sm full" data-a="cscommit" ${t('cs-commit')}>✓ Commit &amp; Push</button><p class="tiny muted">바뀐 파일 앞에 M 표시가 붙어요.</p></div>
   <div class="cs-ed"><div class="cs-tab">📄 ${esc(f)}</div>${G.isBin(tree[f]) ? '<p class="pad">이미지 파일</p>' : `<textarea id="cs-area" class="cs-area" spellcheck="false" data-a2="csedit" data-p="${esc(f)}" ${t('cs-area')}>${esc(tree[f] || '')}</textarea>`}
    <div class="cs-term"><div class="cs-h">TERMINAL</div><code>@${esc(SS().login)} ➜ /workspaces/${esc(r.name)} (${esc(cs.br)}) $ </code><span class="small muted">— 코드스페이스에는 진짜 리눅스 터미널이 있어요 (연습장에서는 아래쪽 터미널을 써요)</span></div></div></div></div></div>`;
};
V.A.cscreate = () => {
  const { r, key, v } = cur(); const br = v.br && r.branches[v.br] ? v.br : r.def;
  V.ui.cs = { key, br, boot: true, files: { ...G.tree(r, br) }, file: null }; V.ui.menu = null; V.render();
  setTimeout(() => { if (V.ui.cs) { V.ui.cs.boot = false; G.emit('codespace:open', { key }); V.render(); } }, 1600);
};
V.A.csfile = el => { V.ui.cs.file = el.dataset.p; V.render(); };
V.A.csclose = () => { V.ui.cs = null; V.render(); };
V.A.cscommit = () => {
  const cs = V.ui.cs; const r = G.repo(cs.key); const ch = {}; G.dtree(G.tree(r, cs.br), cs.files).forEach(d => (ch[d.p] = d.b === undefined ? null : d.b));
  if (!Object.keys(ch).length) { App.toast('✏️ 먼저 파일 내용을 고쳐 주세요.', 'warn'); return; }
  const msg = val('cs-msg').trim(); if (!msg) { App.toast('⚠️ 커밋 메시지를 적어 주세요.', 'warn'); $('cs-msg')?.focus(); return; }
  const res = G.commitTo(cs.key, cs.br, ch, msg); if (!res.ok) { if (res.secret) V.secretBlocked(res.secret); else if (res.protected) App.toast('🔒 보호된 브랜치예요.', 'warn'); return; }
  App.toast('☁️ 코드스페이스에서 커밋하고 push 했어요!'); G.emit('codespace:commit', { key: cs.key }); G.emit('commit', { key: cs.key, br: cs.br, id: res.id, via: 'codespace', msg });
  cs.files = { ...G.tree(r, cs.br) }; $('cs-msg').value = ''; V.render();
};

/* ===================================================
   공통 액션 (views.js 화면용)
   =================================================== */
const A = V.A;
A.home = () => V.go({ page: 'home' });
A.back = () => V.back();
A.explore = () => { G.emit('explore', {}); V.go({ page: 'explore' }); };
A.gists = () => V.go({ page: 'gists' });
A.gistnew = () => V.go({ page: 'gist-new' });
A.newrepo = () => V.go({ page: 'new' });
A.profile = () => V.go({ page: 'profile' });
A.profilerepos = () => V.go({ page: 'profile', ptab: 'repos' });
A.stars = () => V.go({ page: 'profile', ptab: 'stars' });
A.notifs = () => V.go({ page: 'notifications' });
A.importinfo = () => App.modal('<h3>📥 Import repository</h3><p>다른 서비스(GitLab, Bitbucket 등)의 저장소를 GitHub로 옮겨 오는 기능이에요. 연습장에서는 소개만 할게요!</p><div class="row-end"><button class="btn" data-a="modal-close">닫기</button></div>');
A.zipinfo = () => { App.toast('📦 ZIP 다운로드는 Git 기록 없이 파일만 받아요. 기록까지 받으려면 git clone!'); V.ui.menu = null; V.render(); };
A.goowner = el => V.go({ page: 'profile', user: el.dataset.u });
A.gorepo = el => V.goRepo(el.dataset.k);
A.menu = el => { const m = el.dataset.m; V.ui.menu = V.ui.menu === m ? null : m; if (m === 'br' && V.ui.menu) G.emit('ui:branchmenu', {}); V.render(); if (m === 'br' && V.ui.menu) setTimeout(() => $('br-filter')?.focus(), 0); };
A.tab = el => { const { key } = cur(); G.emit('tab', { tab: el.dataset.tab }); V.go({ page: 'repo', key, tab: el.dataset.tab }); };
A.sub = el => { const { key, v } = cur(); V.go({ page: 'repo', key, tab: v.tab === 'issues' || v.tab === 'actions' ? v.tab : 'code', sub: el.dataset.sub, br: v.br }); };
A.setbr = el => { const { key, v } = cur(); const br = el.dataset.br; const r = G.repo(key); G.emit('branch:switch', { key, br }); V.go({ page: 'repo', key, tab: 'code', sub: v.sub === 'commits' ? 'commits' : 'tree', br: br === r.def ? undefined : br }); };
A.mkbr = el => { const { key, v, r } = cur(); const br = el.dataset.br; const from = v.br && r.branches[v.br] ? v.br : r.def; if (!G.branchNew(key, br, from)) return; App.toast(`🌿 ${br} 브랜치를 만들었어요!`); G.emit('branch:create', { key, br, from }); V.go({ page: 'repo', key, tab: 'code', br }); };
A.delbr = el => { const { key } = cur(); const b = el.dataset.br; G.branchDel(key, b); App.toast(`🗑 ${b} 브랜치를 지웠어요.`); G.emit('branch:delete', { key, br: b }); V.render(); };
A.cmpbanner = el => { const { key, r } = cur(); V.go({ page: 'repo', key, tab: 'code', sub: 'compare', base: r.def, head: el.dataset.br }); V.ui.cmpForm = true; G.emit('nav:compare', { key }); V.render(); };
A.cmpform = () => { V.ui.cmpForm = true; V.render(); };
A.newpr = () => { const { key, r } = cur(); V.go({ page: 'repo', key, tab: 'code', sub: 'compare', base: r.def }); };
A.contribute = () => { const { r } = cur(); const up = G.repo(r.forkOf); V.go({ page: 'repo', key: r.forkOf, tab: 'code', sub: 'compare', base: up.def, head: r.def, hrepo: G.key(r) }); V.ui.cmpForm = true; V.render(); };
A.syncfork = () => { const { key } = cur(); if (G.forkSync(key)) { App.toast('🔄 원본 저장소의 최신 내용을 가져왔어요 (Sync fork)!'); G.emit('fork:sync', { key }); } else App.toast('⚠️ 충돌 때문에 자동으로 합칠 수 없어요.', 'warn'); V.render(); };
A.fork = () => {
  const { r, key } = cur(); const S = SS();
  if (r.owner === S.login) { App.toast('🙂 내 저장소는 Fork할 필요 없어요! Fork는 남의 저장소를 내 계정으로 복사할 때 써요.', 'warn'); return; }
  const exists = S.repos[S.login + '/' + r.name];
  if (exists && exists.forkOf === key) { V.goRepo(G.key(exists)); return; }
  if (exists) { App.toast(`⚠️ 내 계정에 이미 ${r.name} 저장소가 있어요.`, 'warn'); return; }
  App.modal(`<h3>🍴 Create a new fork</h3><p class="small muted">Fork = 남의 저장소를 <b>내 계정으로 통째로 복사</b>하는 거예요. 내 복사본에서는 마음대로 고칠 수 있고, Pull Request로 원본에 제안할 수 있어요.</p><label class="lbl">Owner / Repository name</label><div class="row"><span class="owner-chip">${av(S.login, 18)} ${esc(S.login)}</span> / <input class="inp" value="${esc(r.name)}" readonly></div><label class="cb"><input type="checkbox" checked disabled> Copy the <b>${esc(r.def)}</b> branch only</label><div class="row-end"><button class="btn" data-a="modal-close">Cancel</button><button class="btn btn-primary" data-a="dofork" ${t('create-fork')}>Create fork</button></div>`);
};
A.dofork = () => { const { key } = cur(); const f = G.fork(key); App.closeModal(); G.bump(); App.toast(`🍴 ${G.key(f)} 로 Fork 했어요!`); G.emit('fork', { key: G.key(f), from: key }); V.goRepo(G.key(f)); };
A.star = () => { const { key, r } = cur(); const S = SS(); if (S.starred[key]) { delete S.starred[key]; r.stars--; } else { S.starred[key] = Date.now(); r.stars++; App.toast('⭐ 별을 눌렀어요! 나중에 프로필의 Stars에서 다시 찾을 수 있어요.'); G.emit('star', { key }); } V.render(); };
A.starkey = el => { const k = el.dataset.k; const S = SS(); const r = G.repo(k); if (S.starred[k]) { delete S.starred[k]; r.stars--; } else { S.starred[k] = Date.now(); r.stars++; G.emit('star', { key: k }); App.toast('⭐ Starred!'); } V.render(); };
A.watch = () => { const { key, r } = cur(); const S = SS(); if (S.watching[key]) { delete S.watching[key]; r.watchers--; } else { S.watching[key] = Date.now(); r.watchers++; App.toast('👁 Watch 시작! 이 저장소의 새 소식(이슈·PR 등)을 알림으로 받아요.'); G.emit('watch', { key }); } V.render(); };
A.newfile = () => { const { key, v } = cur(); V.ui.draftFor = null; V.go({ page: 'repo', key, tab: 'code', sub: 'new', br: v.br }); };
A.uploadpage = () => { const { key, v } = cur(); V.ui.uploads = []; V.go({ page: 'repo', key, tab: 'code', sub: 'upload', br: v.br }); };
A.opencommit = el => { const { key } = cur(); G.emit('commit:view', { key, id: el.dataset.id }); V.go({ page: 'repo', key, tab: 'code', sub: 'commit', id: el.dataset.id }); };
A.opendir = el => { const { key, v } = cur(); V.go({ page: 'repo', key, tab: 'code', sub: 'tree', path: el.dataset.p || '', br: v.br }); };
A.openfile = el => { const { key, v } = cur(); V.ui.blobCode = false; G.emit('file:view', { key, path: el.dataset.p }); V.go({ page: 'repo', key, tab: 'code', sub: 'blob', path: el.dataset.p, br: v.br }); };
A.editpath = el => { const { key, v } = cur(); V.ui.draftFor = null; V.go({ page: 'repo', key, tab: 'code', sub: 'edit', path: el.dataset.p, br: v.br }); };
A.editfile = () => { const { key, v } = cur(); V.ui.draftFor = null; V.go({ page: 'repo', key, tab: 'code', sub: 'edit', path: v.path, br: v.br }); };
A.addreadme = () => { const { key, r, v } = cur(); V.ui.preset = { path: 'README.md', content: `# ${r.name}\n\n` }; V.ui.draftFor = null; V.go({ page: 'repo', key, tab: 'code', sub: 'new', br: v.br }); };
A.filehistory = () => { const { key, v } = cur(); V.go({ page: 'repo', key, tab: 'code', sub: 'commits', path: v.path, br: v.br }); };
A.blobmode = el => { V.ui.blobCode = el.dataset.v === '1'; V.render(); };
A.clonetab = el => { V.ui.cloneTab = el.dataset.v; V.render(); };
A.copyclone = () => { const u = val('clone-url'); App.copy(u); App.toast('📋 주소를 복사했어요! 터미널에서 git clone 뒤에 붙여 넣으세요.'); G.emit('clone:copy', { url: u }); };
A.copytext = el => { App.copy(el.dataset.v); App.toast('📋 복사했어요!'); };
A.delfile = () => {
  const { r, v } = cur(); const br = r.branches[v.br] ? v.br : r.def;
  App.modal(`<h3>🗑 Delete ${esc(v.path)}</h3><p class="small muted">파일을 지우는 것도 하나의 "변경"이라 커밋으로 기록돼요. 나중에 기록에서 되살릴 수 있어요.</p><label class="lbl">Commit message</label><input class="inp" id="dl-msg" value="Delete ${esc(v.path)}" ${t('dl-msg')}><div class="row-end"><button class="btn" data-a="modal-close">Cancel</button><button class="btn btn-danger" data-a="dodelfile" ${t('dl-commit')}>Commit changes</button></div>`);
};
A.dodelfile = () => { const { r, v, key } = cur(); const br = r.branches[v.br] ? v.br : r.def; const res = G.commitTo(key, br, { [v.path]: null }, val('dl-msg') || 'Delete ' + v.path); App.closeModal(); if (!res.ok) { App.toast('🔒 보호된 브랜치에서는 바로 지울 수 없어요.', 'warn'); return; } App.toast('🗑 파일을 지우고 커밋했어요.'); G.emit('commit', { key, br, id: res.id, via: 'delete', path: v.path, deleted: true }); V.go({ page: 'repo', key, tab: 'code', br: v.br }, { replace: true }); };
A.edtab = el => { if ($('ed-content')) V.ui.draft = $('ed-content').value; if ($('ed-path')) V.ui.draftPath = $('ed-path').value; V.ui.edTab = el.dataset.v; if (el.dataset.v === 'preview') G.emit('preview', {}); V.render(); };
A.goitem = el => { const { key, r } = cur(); const n = +el.dataset.n; const isPr = r.pulls.some(p => p.n === n); V.ui.cmDraft = ''; if (!isPr && !r.issues.some(i => i.n === n) && r.discs.some(d => d.n === n)) return V.go({ page: 'repo', key, tab: 'discussions', sub: 'view', n }); V.go({ page: 'repo', key, tab: isPr ? 'pulls' : 'issues', sub: 'view', n }); };
A.prfilter = el => { V.ui.prFilter = el.dataset.v; V.render(); };
A.isfilter = el => { V.ui.isFilter = el.dataset.v; G.emit('issues:filter', { state: el.dataset.v }); V.render(); };
A.prtab = el => { const { v } = cur(); G.emit('pr:tab', { tab: el.dataset.v }); V.ui.review = false; V.go({ ...v, prtab: el.dataset.v }, { replace: true }); };
const curItem = () => { const { r, v, key } = cur(); return { r, key, v, it: r.issues.find(i => i.n === v.n) || r.pulls.find(p => p.n === v.n) }; };
A.react = el => {
  const { it, key } = curItem(); const id = el.dataset.id, e = el.dataset.e;
  const re = id === 'body' ? it.reactions : (it.comments[+id.slice(1)].reactions = it.comments[+id.slice(1)].reactions || {});
  const mk = id + e; it.myReacts = it.myReacts || {};
  if (it.myReacts[mk]) { re[e]--; delete it.myReacts[mk]; } else { re[e] = (re[e] || 0) + 1; it.myReacts[mk] = 1; G.emit('react', { key, n: it.n, e }); }
  V.ui.menu = null; V.render();
};
A.addcomment = () => {
  const { it, key, r } = curItem(); const b = ($('cm-body') ? $('cm-body').value : V.ui.cmDraft || '').trim();
  if (!b) { App.toast('⚠️ 코멘트 내용을 적어 주세요.', 'warn'); return; }
  it.comments.push({ a: SS().login, body: b, t: Date.now(), reactions: {} }); V.ui.cmDraft = ''; V.ui.cmTab = 'w'; G.bump();
  G.emit(it.kind === 'pr' ? 'pr:comment' : 'issue:comment', { key, n: it.n, body: b });
  if (/@dain-friend/.test(b)) setTimeout(() => { it.comments.push({ a: 'dain-friend', body: `@${SS().login} 불렀어요? 👋 멘션(@)을 하면 저한테 알림이 와요!`, t: Date.now(), reactions: {} }); G.onChange('bot'); }, 1800);
  if ($('cm-body')) $('cm-body').value = ''; V.render();
};
A.cmtab = el => { if ($('cm-body')) V.ui.cmDraft = $('cm-body').value; V.ui.cmTab = el.dataset.v; V.render(); };
A.closeitem = () => {
  const { it, key, r } = curItem(); const b = $('cm-body')?.value.trim(); if (b) A.addcomment();
  it.state = 'closed'; it.tl.push({ t: Date.now(), type: 'closed', by: SS().login });
  G.emit(it.kind === 'pr' ? 'pr:close' : 'issue:closed', { key, n: it.n, via: 'manual' }); App.toast(it.kind === 'pr' ? 'PR을 닫았어요.' : '✓ 이슈를 닫았어요!'); V.render();
};
A.reopenitem = () => { const { it } = curItem(); it.state = 'open'; it.tl.push({ t: Date.now(), type: 'reopened', by: SS().login }); V.render(); };
A.prreopen = A.reopenitem;
A.assignme = () => { const { it, key } = curItem(); const u = SS().login; if (!it.assignees.includes(u)) { it.assignees.push(u); it.tl.push({ t: Date.now(), type: 'assigned', by: u, self: true }); G.emit('issue:assign', { key, n: it.n }); App.toast('👤 이 일의 담당자가 되었어요!'); } V.render(); };
A.toglabel = el => { const { it, key } = curItem(); const l = el.dataset.l; if (it.labels.includes(l)) it.labels = it.labels.filter(x => x !== l); else { it.labels.push(l); it.tl.push({ t: Date.now(), type: 'labeled', by: SS().login, label: l }); G.emit('issue:label', { key, n: it.n, label: l }); } V.render(); };
A.setms = el => { const { it, key } = curItem(); it.milestone = it.milestone === el.dataset.v ? null : el.dataset.v; if (it.milestone) { it.tl.push({ t: Date.now(), type: 'ms', by: SS().login, ms: it.milestone }); G.emit('issue:milestone', { key, n: it.n }); } V.ui.menu = null; V.render(); };
A.task = el => {
  const { it, r } = curItem(); const idx = +el.dataset.i; let k = -1;
  it.body = it.body.replace(/^(\s*[-*+]\s+)\[([ xX])\]/gm, (m, p, c) => { k++; return k === idx ? `${p}[${c === ' ' ? 'x' : ' '}]` : m; });
  G.emit('task:toggle', { n: it.n }); V.render();
};
A.newissue = () => { const { key } = cur(); V.ui.isDraft = ''; V.ui.isTab = 'w'; V.go({ page: 'repo', key, tab: 'issues', sub: 'new' }); };
A.istab = el => { if ($('is-body')) V.ui.isDraft = $('is-body').value; V.ui.isTab = el.dataset.v; V.render(); };
A.createissue = () => {
  const { key } = cur(); const title = val('is-title').trim(); const body = $('is-body') ? $('is-body').value : V.ui.isDraft || '';
  if (!title) { App.toast('⚠️ 이슈 제목을 적어 주세요.', 'warn'); return; }
  const it = G.issueNew(key, { title, body }); V.ui.isDraft = '';
  App.toast(`🐞 이슈 #${it.n}을(를) 만들었어요!`); G.feed(`${SS().login} opened issue ${key}#${it.n}`);
  G.emit('issue:create', { key, n: it.n, body, title });
  V.go({ page: 'repo', key, tab: 'issues', sub: 'view', n: it.n }, { replace: true });
};
A.labelform = () => { V.ui.labelForm = true; V.render(); };
A.createlabel = () => { const { r, key } = cur(); const n = val('lb-name').trim(); if (!n || r.labels.some(l => l.name === n)) { App.toast('⚠️ 라벨 이름을 확인해 주세요.', 'warn'); return; } r.labels.push({ name: n, color: val('lb-color').slice(1), desc: val('lb-desc') }); V.ui.labelForm = false; App.toast(`🏷 "${n}" 라벨을 만들었어요!`); G.emit('label:create', { key, name: n }); V.render(); };
A.msform = () => { V.ui.msForm = true; V.render(); };
A.createms = () => { const { r, key } = cur(); const n = val('ms-title').trim(); if (!n || r.milestones.some(m => m.title === n)) { App.toast('⚠️ 마일스톤 제목을 확인해 주세요.', 'warn'); return; } r.milestones.push({ title: n, due: val('ms-due'), desc: val('ms-desc') }); V.ui.msForm = false; App.toast(`🎯 "${n}" 마일스톤을 만들었어요!`); G.emit('milestone:create', { key, title: n }); V.render(); };
A.reqreview = el => { const { it, key } = curItem(); const u = el.dataset.u; if (!it.reviewers.includes(u)) { it.reviewers.push(u); it.tl.push({ t: Date.now(), type: 'reviewreq', by: SS().login, who: u }); App.toast(`👀 ${u}님에게 리뷰를 요청했어요. 잠시 기다려 보세요…`); G.emit('pr:reviewreq', { key, n: it.n, u }); G.botTick(); } V.ui.menu = null; V.render(); };
A.reviewtoggle = () => { V.ui.review = !V.ui.review; V.render(); };
A.submitreview = () => {
  const { it, key } = curItem(); const b = val('rv-body').trim(); const st = chk('rv-a') ? 'approved' : chk('rv-x') ? 'changes' : 'commented';
  if (st === 'commented' && !b) { App.toast('⚠️ 코멘트를 적어 주세요.', 'warn'); return; }
  it.reviews.push({ by: SS().login, state: st, body: b, t: Date.now() }); V.ui.review = false; G.emit('pr:review', { key, n: it.n, state: st }); App.toast('📝 리뷰를 제출했어요!'); V.render();
};
A.linecomment = el => {
  App.modal(`<h3>💬 ${esc(el.dataset.f)} · ${el.dataset.l}번째 줄에 코멘트</h3><textarea class="inp" id="lc-body" rows="3" placeholder="예: 여기 오타가 있어요! / 이 부분 정말 좋네요 👍" ${t('lc-body')}></textarea><div class="row-end"><button class="btn" data-a="modal-close">Cancel</button><button class="btn btn-primary" data-a="addlinecomment" data-f="${esc(el.dataset.f)}" data-l="${el.dataset.l}" ${t('lc-add')}>Add single comment</button></div>`);
};
A.addlinecomment = el => { const { it, key } = curItem(); const b = val('lc-body').trim(); if (!b) return; it.lineComments.push({ a: SS().login, file: el.dataset.f, line: +el.dataset.l, body: b, t: Date.now() }); it.comments.push({ a: SS().login, body: `💬 \`${el.dataset.f}\` ${el.dataset.l}번째 줄: ${b}`, t: Date.now(), reactions: {} }); App.closeModal(); G.emit('pr:linecomment', { key, n: it.n }); App.toast('💬 줄 코멘트를 남겼어요!'); V.render(); };
A.mergeclick = () => { V.ui.confirmMerge = true; V.render(); };
A.cancelmerge = () => { V.ui.confirmMerge = false; V.render(); };
A.setmethod = el => { V.ui.mergeMethod = el.dataset.v; V.ui.menu = null; V.render(); };
A.domerge = () => {
  const { it, key } = curItem(); const m = V.ui.mergeMethod || 'merge'; const res = G.prMerge(key, it, m);
  V.ui.confirmMerge = false;
  if (!res.ok) { App.toast('⚠️ 머지할 수 없어요. 충돌이나 리뷰 조건을 확인하세요.', 'warn'); V.render(); return; }
  App.toast(`🟣 PR #${it.n}을(를) 머지했어요! (${{ merge: 'merge commit', squash: 'squash', rebase: 'rebase' }[m]})`);
  G.emit('pr:merge', { key, n: it.n, method: m, by: SS().login, author: it.author }); V.render();
};
A.prdelbr = () => { const { it, key } = curItem(); G.branchDel(key, it.head); it.tl.push({ t: Date.now(), type: 'branchdel', by: SS().login, br: it.head }); App.toast(`🗑 ${it.head} 브랜치를 지웠어요. 할 일을 다 한 브랜치는 정리해요!`); G.emit('branch:delete', { key, br: it.head, viaPr: true }); V.render(); };
A.resolve = () => { const { key, v } = cur(); V.ui.resolve = null; G.emit('resolve:open', {}); V.go({ page: 'repo', key, tab: 'pulls', sub: 'resolve', n: v.n }); };
A.rsfile = el => { V.ui.resolve.files[V.ui.resolve.cur] = val('rs-content'); V.ui.resolve.cur = el.dataset.p; V.render(); };
A.markresolved = () => { const R = V.ui.resolve; const c = val('rs-content'); R.files[R.cur] = c; if (G.hasMarkers(c)) { App.toast('⚠️ 아직 <<<<<<< ======= >>>>>>> 표시가 남아 있어요! 모두 지워 주세요.', 'warn'); return; } R.done[R.cur] = true; const nx = Object.keys(R.files).find(p => !R.done[p]); if (nx) R.cur = nx; App.toast('✅ 이 파일의 충돌을 해결했어요!'); V.render(); };
A.commitresolve = () => { const { r, key, v } = cur(); const pr = r.pulls.find(p => p.n === v.n); const R = V.ui.resolve; G.prResolve(key, pr, R.files); V.ui.resolve = null; App.toast('⚔️ 충돌 해결 커밋 완료! 이제 머지할 수 있어요.'); G.emit('conflict:resolved', { key, n: pr.n }); V.go({ page: 'repo', key, tab: 'pulls', sub: 'view', n: pr.n }, { replace: true }); };
A.visitsite = A.visitsite || V.A.visitsite;

/* 입력 실시간 처리 (data-a2) */
V.A2 = {
  draft: el => { V.ui.draft = el.value; },
  draftpath: el => { V.ui.draftPath = el.value; },
  cmdraft: el => { V.ui.cmDraft = el.value; },
  isdraft: el => { V.ui.isDraft = el.value; },
  rsdraft: el => { if (V.ui.resolve) V.ui.resolve.files[V.ui.resolve.cur] = el.value; },
  csedit: el => { V.ui.cs.files[el.dataset.p] = el.value; clearTimeout(V._csT); V._csT = setTimeout(() => { const a = document.activeElement === el; if (a) { const s = el.selectionStart; V.render(); const n = $('cs-area'); if (n) { n.focus(); n.setSelectionRange(s, s); } } }, 700); },
  cmpsel: () => { const { key, v } = cur(); V.go({ ...v, base: val('cmp-base'), head: val('cmp-head') }, { replace: true, keepUi: true }); },
};
})();
