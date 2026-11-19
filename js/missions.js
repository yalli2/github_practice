/* =========================================================
   미션 정의
   step: { t, d, on, when, auto, target, snip, hint, concept, quiz, enter, term }
   ========================================================= */
'use strict';
const M = (window.M = {});
(() => {
const S = () => G.S();
const ME = () => S().login;
const MY = () => ME() + '/my-first-repo';
const WB = 'octo-academy/word-bank';
const R = k => G.repo(k);
const tree = k => { const r = R(k); return r ? G.tree(r, r.def) : {}; };
const code = s => `<code>${V.esc(s)}</code>`;
const L = () => S().local;

/* ---------- 준비 도우미 ---------- */
M.ensureRepo = () => {
  if (R(MY())) return R(MY());
  const r = G.repoNew({ owner: ME(), name: 'my-first-repo', desc: '나의 첫 GitHub 저장소 🌱', readme: true });
  App.toast('🐿️ 연습용 저장소 my-first-repo 를 자동으로 준비했어요.');
  return r;
};
M.ensureFile = (path, content, msg) => { const r = M.ensureRepo(); if (G.tree(r, r.def)[path] === undefined) G.commitTo(MY(), r.def, { [path]: content }, msg || 'Add ' + path, '', ME(), { force: true, skipSecret: true }); };
M.unprotect = () => { const r = R(MY()); if (r && r.protect[r.def]) { delete r.protect[r.def]; App.toast('🔓 터미널 연습을 위해 main 보호 규칙을 잠시 꺼 두었어요.'); } };
M.ensureClone = () => {
  M.ensureRepo();
  const home = L().home;
  if (!home['my-first-repo']) { const c = L().cwd; L().cwd = ''; T.print('🐿️ (깃토리가 my-first-repo 를 미리 clone 해 두었어요)', 'tip'); T.gclone([`https://github.com/${MY()}.git`]); L().cwd = c; }
  M.syncClone();
};
M.cdRepo = () => { if (L().cwd !== 'my-first-repo') { L().cwd = 'my-first-repo'; T.print('📂 (my-first-repo 폴더로 이동했어요. 프롬프트의 ~/my-first-repo 를 확인하세요)', 'tip'); } };
M.ensureConfig = () => { const c = L().cfg; if (!c.name) c.name = S().name; if (!c.email) c.email = ME() + '@users.noreply.github.com'; };
M.syncClone = () => {
  const d = L().home['my-first-repo']; const r = R(MY()); if (!d?.git || !r) return;
  const g = d.git; const remote = r.branches[r.def]; Object.entries(r.branches).forEach(([b, id]) => (g.rt['origin/' + b] = id));
  const local = g.branches[r.def];
  if (g.HEAD !== r.def || g.merging || !remote || local === remote) return;
  const clean = !G.dtree(G.treeOf(local), g.index).length && Object.keys(g.index).every(p => d.files[p] === g.index[p]);
  if (clean && (!local || G.isAnc(local, remote))) {
    g.branches[r.def] = remote; const nt = G.treeOf(remote);
    Object.keys(G.treeOf(local)).forEach(p => { if (nt[p] === undefined) delete d.files[p]; });
    Object.assign(d.files, nt); g.index = { ...nt };
    T.print('🐿️ (웹에서 바뀐 내용이 있어서 깃토리가 git pull 로 최신 상태를 맞춰 두었어요)', 'tip');
  }
};
M.openTerm = () => App.openTerm(true);
const goMy = () => ({ page: 'repo', key: MY(), tab: 'code' });

/* ---------- 챕터 ---------- */
M.chapters = [
  { id: 'c0', title: '시작하기', icon: '🚀' },
  { id: 'c1', title: '저장소와 커밋', icon: '📘' },
  { id: 'c2', title: '브랜치와 Pull Request', icon: '🌿' },
  { id: 'c3', title: '이슈와 프로젝트 관리', icon: '🐞' },
  { id: 'c4', title: '협업과 오픈소스', icon: '🤝' },
  { id: 'c5', title: '터미널로 Git 다루기', icon: '💻' },
  { id: 'c6', title: '릴리스 · 배포 · 자동화', icon: '🤖' },
  { id: 'c7', title: '더 많은 GitHub 기능', icon: '✨' },
  { id: 'c8', title: '졸업', icon: '🎓' },
];

const Q = (q, o, a, e) => ({ quiz: { q, o, a, e }, t: '퀴즈' });
const DOC = 'https://docs.github.com/ko/';

M.list = [
/* ================= 0. 시작하기 ================= */
{ id: 'welcome', ch: 'c0', icon: '👋', title: 'GitHub 세계에 오신 걸 환영해요', xp: 30, goal: 'Git과 GitHub가 무엇인지, 이 연습장은 어떻게 쓰는지 알아봐요.', real: [DOC + 'get-started', '실제 GitHub 가입은 github.com 에서 무료로 할 수 있어요. 학생이라면 GitHub Education(Student Developer Pack) 혜택도 받아 보세요!'],
  steps: [
    { concept: true, t: 'Git과 GitHub는 뭐가 달라요?', d: `<div class="duo"><div class="duo-c"><div class="big-ic">💻</div><b>Git</b><p>내 컴퓨터에서 파일의 <b>변경 기록</b>을 저장하는 프로그램이에요. 게임의 <b>세이브 포인트</b>처럼 언제든 예전 상태로 돌아갈 수 있어요.</p></div><div class="duo-arrow">⇄<small>push / pull</small></div><div class="duo-c"><div class="big-ic">☁️</div><b>GitHub</b><p>Git 기록을 <b>인터넷(클라우드)</b>에 올려 두고, 전 세계 사람들과 <b>함께 작업</b>하는 웹사이트예요. 1억 명 넘는 개발자가 써요!</p></div></div><p class="small muted">비유하자면 Git은 "일기장", GitHub는 "일기장을 올려 두고 친구들과 돌려 보는 온라인 도서관"이에요 📚</p>` },
    { concept: true, t: '이 연습장 사용법', d: `<ul class="howto"><li>🖥️ <b>위쪽 창</b>은 연습용 가상 GitHub예요. 마음껏 눌러도 진짜 GitHub에는 아무 일도 안 생겨요!</li><li>⌨️ <b>아래쪽 터미널</b>에서는 git 명령어를 직접 입력해요. (5장에서 써요)</li><li>🎯 이 카드에 나오는 <b>미션</b>을 하나씩 따라 하면 자동으로 다음 단계로 넘어가요.</li><li>💡 막히면 <b>힌트</b>, 👀 <b>위치 보기</b> 버튼을 누르세요. 눌러야 할 곳이 반짝여요!</li><li>🌱 미션을 깰 때마다 XP와 배지를 받아요. 모든 진행 상황은 이 브라우저에 자동 저장돼요.</li></ul>` },
    { t: '내 프로필 구경하기', d: () => `가상 GitHub 오른쪽 위의 <b>동그란 아바타(${V.esc(ME()[0].toUpperCase())})</b>를 누르고 <b>Your profile</b>을 클릭하세요.`, on: 'nav', when: d => d.page === 'profile' && (!d.user || d.user === ME()), target: ['[data-t=your-profile]', '[data-t=avatar]'], hint: '가상 브라우저 안 검은색 상단 바의 맨 오른쪽 동그라미예요.' },
    { concept: true, t: '프로필은 개발자의 이력서', d: '<p>프로필에는 내 저장소, 별 누른 저장소, 그리고 아래쪽에 <b>초록색 칸(잔디)</b>이 있어요. 커밋·이슈·PR을 할 때마다 그날 칸이 진해져요 🌱</p><p>많은 회사와 학교가 GitHub 프로필을 보고 "이 사람이 꾸준히 무엇을 만들어 왔는지" 확인해요. 이 연습장에서도 활동할 때마다 잔디가 심어져요!</p>' },
    Q('Git과 GitHub에 대한 설명으로 옳은 것은?', ['Git과 GitHub는 같은 회사가 만든 같은 프로그램이다', 'Git은 내 컴퓨터의 버전 관리 도구, GitHub는 Git 저장소를 올려 함께 작업하는 서비스다', 'GitHub가 없으면 Git을 쓸 수 없다', 'Git은 웹사이트이고 GitHub는 프로그램이다'], 1, 'Git은 인터넷 없이도 쓸 수 있는 버전 관리 도구이고, GitHub는 그 기록을 온라인에 올려 협업하게 해 주는 서비스예요. (GitLab, Bitbucket 같은 비슷한 서비스도 있어요)'),
  ] },

/* ================= 1. 저장소와 커밋 ================= */
{ id: 'repo-create', ch: 'c1', icon: '📘', title: '첫 저장소 만들기', xp: 40, badge: ['📘', '첫 저장소'], goal: '프로젝트를 담는 폴더, 저장소(repository)를 만들어요.', real: ['https://github.com/new', '실제 GitHub에서도 오른쪽 위 ＋ → New repository 로 똑같이 만들어요.'],
  steps: [
    { t: '새 저장소 만들기 화면 열기', d: '오른쪽 위 <b>＋ ▾</b> 버튼을 누르고 <b>New repository</b>를 클릭하세요. (대시보드 왼쪽의 초록 <b>New</b> 버튼도 돼요)', on: 'nav', when: d => d.page === 'new', auto: () => !!R(MY()), target: ['[data-t=new-repo]', '[data-t=new-repo-side]', '[data-t=plus]'], hint: '가상 GitHub 상단 바 오른쪽에 ＋ 모양 버튼이 있어요.' },
    { t: '저장소 정보 입력하고 만들기', d: `<ol><li>Repository name: ${code('my-first-repo')}</li><li>Description: 아무 소개글</li><li><b>Public</b> 선택</li><li>✅ <b>Add a README file</b> 체크!</li><li>초록색 <b>Create repository</b> 클릭</li></ol>`, snip: [{ label: '저장소 이름', code: 'my-first-repo', into: '#nr-name' }], on: 'repo:create', when: d => d.name === 'my-first-repo', auto: () => !!R(MY()), target: ['[data-t=create-repo]', '[data-t=nr-readme]', '[data-t=nr-name]'], hint: '이름을 정확히 my-first-repo 로 써야 다음 미션들과 이어져요. README 체크박스도 꼭 눌러요!' },
    { t: 'README 파일 열어 보기', d: '만들어진 저장소의 파일 목록에서 <b>README.md</b>를 클릭해 보세요.', on: 'file:view', when: d => d.path === 'README.md', target: ['[data-t="file-README.md"]'], hint: '파일 목록에 📄 README.md 가 보여요. 만약 README 없이 만들었다면 "Add a README" 버튼으로 먼저 만드세요.' },
    { concept: true, t: '저장소 화면 둘러보기', d: '<ul><li><b>&lt;&gt; Code</b>: 파일과 폴더</li><li><b>Issues</b>: 할 일·버그 게시판</li><li><b>Pull requests</b>: "내 변경을 합쳐 주세요" 요청</li><li><b>Actions</b>: 자동화 로봇</li><li><b>⭐ Star / 🍴 Fork / 👁 Watch</b>: 좋아요 / 복사해 가기 / 소식 받기</li><li><b>main ▾</b>: 지금 보고 있는 브랜치</li><li><b>🕘 Commits</b>: 저장 기록</li></ul><p class="small muted">README.md는 저장소의 "표지"예요. 저장소에 들어오면 맨 아래에 자동으로 보여요.</p>' },
  ] },
{ id: 'first-commit', go: goMy, ch: 'c1', icon: '🐣', title: '새 파일 만들고 커밋하기', xp: 50, badge: ['🐣', '첫 커밋'], goal: '파일을 만들고 "커밋"으로 저장 기록을 남겨요.', setup: () => M.ensureRepo(), real: [DOC + 'repositories/working-with-files', '커밋 메시지는 "무엇을 했는지" 동사로 시작하면 좋아요. 예: Add, Fix, Update'],
  steps: [
    { t: '새 파일 만들기', d: '저장소 <b>Code</b> 탭에서 <b>＋ Add file ▾ → Create new file</b>을 누르세요.', on: 'nav', when: d => d.sub === 'new', target: ['[data-t=create-file]', '[data-t=add-file]'], hint: '파일 목록 위, 초록 Code 버튼 왼쪽에 Add file 버튼이 있어요.' },
    { t: '파일 쓰고 커밋하기', d: `<ol><li>파일 이름: ${code('hello.txt')}</li><li>내용: 하고 싶은 말을 자유롭게!</li><li>오른쪽 위 <b>Commit changes...</b> → 메시지 확인 → <b>Commit changes</b></li></ol><p class="small muted">커밋(commit) = "지금 상태를 기록해 줘!" 하고 세이브 포인트를 만드는 거예요.</p>`, snip: [{ label: '파일 이름', code: 'hello.txt', into: '#ed-path' }, { label: '내용 예시', code: '안녕 GitHub! 👋\n오늘 처음 커밋해 봐요.', into: '#ed-content' }], on: 'commit', when: d => d.key === MY() && d.path === 'hello.txt', target: ['[data-t=cm-commit]', '[data-t=commit-btn]'], hint: '파일 이름 칸(Name your file...)에 hello.txt 를 쓰고, 아래 큰 칸에 내용을 써요.' },
    { t: '커밋 기록 보기', d: '저장소 첫 화면(Code 탭)에서 <b>🕘 N Commits</b> 링크를 눌러 기록을 확인하세요.', on: 'nav', when: d => d.sub === 'commits', target: ['[data-t=commits-link]', '[data-t=tab-code]'], hint: '파일 목록 맨 윗줄 오른쪽 끝에 있어요. 먼저 Code 탭으로 가야 할 수도 있어요.' },
    { t: '커밋 안을 들여다보기', d: '방금 만든 커밋 메시지를 클릭해서 무엇이 바뀌었는지(<b>diff</b>) 확인해 보세요.', on: 'commit:view', target: ['[data-t=commit-item]'], hint: '굵은 글씨의 커밋 메시지를 누르면 돼요.' },
    Q('커밋(commit)에 대한 설명으로 가장 알맞은 것은?', ['파일을 인터넷에 올리는 것', '파일을 삭제하는 것', '변경 내용을 메시지와 함께 하나의 기록(세이브 포인트)으로 남기는 것', '다른 사람의 저장소를 복사하는 것'], 2, '커밋은 "누가, 언제, 무엇을, 왜" 바꿨는지 기록하는 세이브 포인트예요. 나중에 언제든 그 시점으로 돌아가거나 비교할 수 있어요.'),
  ] },
{ id: 'edit-upload', go: goMy, ch: 'c1', icon: '✏️', title: '파일 수정 · 업로드 · 삭제', xp: 50, goal: '이미 있는 파일을 고치고, 내 컴퓨터 파일을 올리고, 필요 없는 파일을 지워요.', setup: () => M.ensureFile('hello.txt', '안녕 GitHub! 👋\n', 'Create hello.txt'), real: [DOC + 'repositories/working-with-files/managing-files', '실제 GitHub에서는 파일을 브라우저 창에 끌어다 놓기만 해도 업로드 화면이 열려요.'],
  steps: [
    { t: '파일 수정하기', d: `파일 목록에서 ${code('hello.txt')}를 열고 연필 <b>✏️</b> 버튼을 눌러 내용을 고친 뒤 커밋하세요.`, on: 'commit', when: d => d.key === MY() && d.via === 'web' && !d.isNew, target: ['[data-t=cm-commit]', '[data-t=commit-btn]', '[data-t=edit-file]', '[data-t="file-hello.txt"]'], hint: '파일을 열면 오른쪽 위에 ✏️ (Edit this file) 버튼이 있어요.' },
    { t: '파일 업로드하기', d: '<b>Add file ▾ → Upload files</b>에서 내 컴퓨터 파일을 고르거나, 연습용 샘플 파일(<b>＋ notes.md</b>, <b>＋ cat.svg</b> 등)을 눌러 추가한 뒤 <b>Commit changes</b>.', on: 'commit', when: d => d.key === MY() && d.via === 'upload', target: ['[data-t=up-commit]', '[data-t="sample-notes.md"]', '[data-t=upload-files]', '[data-t=add-file]'], hint: '여러 파일을 한 번에 올려도 커밋은 하나로 기록돼요.' },
    { t: '파일 삭제하기', d: '방금 올린 파일 중 하나를 열고 <b>🗑️</b> (Delete file) → <b>Commit changes</b>를 눌러 지워 보세요.', on: 'commit', when: d => d.key === MY() && d.via === 'delete', target: ['[data-t=dl-commit]', '[data-t=delete-file]'], hint: '파일을 열었을 때 ✏️ 옆에 쓰레기통 버튼이 있어요.' },
    Q('GitHub에서 파일을 삭제했어요. 다시 되살릴 수 있을까요?', ['절대 못 살린다', '삭제도 커밋으로 기록되니 예전 커밋에서 내용을 찾아 되살릴 수 있다', '휴지통에서 30일 안에만 가능하다', '관리자에게 요청해야만 가능하다'], 1, 'Git은 모든 변경을 커밋으로 기록해요. 삭제 역시 "삭제했다"는 기록일 뿐, 이전 커밋에는 파일이 그대로 남아 있어요.'),
  ] },
{ id: 'markdown', go: goMy, ch: 'c1', icon: '✍️', title: 'README를 마크다운으로 꾸미기', xp: 50, badge: ['✍️', '마크다운 작가'], goal: '#, -, ** 같은 간단한 기호로 문서를 예쁘게 꾸미는 Markdown을 배워요.', setup: () => M.ensureRepo(), real: [DOC + 'get-started/writing-on-github', 'Markdown은 README뿐 아니라 이슈, PR, 코멘트, 위키 어디서나 쓸 수 있어요.'],
  steps: [
    { t: 'README 편집하고 미리보기', d: 'Code 탭 아래 README 오른쪽 위 <b>✏️</b>를 눌러 편집 화면을 열고, <b>Preview</b> 탭을 눌러 보세요.', on: 'preview', target: ['[data-t=preview-tab]', '[data-t=edit-readme]'], hint: 'README 상자 제목줄 오른쪽 끝의 연필이에요.' },
    { t: '마크다운으로 꾸미고 커밋', d: `<b>Edit</b> 탭으로 돌아가 다음 4가지를 모두 넣고 커밋하세요:<ul><li>${code('# 제목')}</li><li>${code('- 목록')}</li><li>${code('**굵은 글씨**')}</li><li>${code('[링크](https://github.com)')}</li></ul><p class="small muted">편집기 아래 📝 마크다운 문법 도우미도 참고하세요.</p>`, snip: [{ label: 'README 예시 (통째로 넣기)', code: '# 🌱 나의 첫 저장소\n\n안녕하세요! **GitHub**를 공부하고 있어요.\n\n## 오늘 배운 것\n- 저장소 만들기\n- 커밋하기\n- 마크다운 쓰기 :tada:\n\n> 꾸준함이 최고의 재능!\n\n[GitHub 둘러보기](https://github.com)\n', into: '#ed-content' }], on: 'commit', when: d => d.key === MY() && d.path === 'README.md' && /^#\s/m.test(d.content) && /^\s*[-*]\s/m.test(d.content) && /\*\*[^*]+\*\*/.test(d.content) && /\[[^\]]+\]\([^)]+\)/.test(d.content), target: ['[data-t=cm-commit]', '[data-t=commit-btn]', '[data-t=ed-content]'], hint: '4가지가 모두 들어가야 해요. "입력칸에 넣기" 버튼으로 예시를 넣고 마음대로 바꿔도 돼요!' },
    Q('마크다운에서 글자를 굵게 만들려면?', ['<b>글자</b>만 가능', '**글자**', '#글자#', '[글자]'], 1, '**두 개의 별**로 감싸면 굵게, *하나*면 기울임, # 은 제목, - 는 목록이에요.'),
  ] },

/* ================= 2. 브랜치와 PR ================= */
{ id: 'branch', go: goMy, ch: 'c2', icon: '🌿', title: '브랜치 만들기', xp: 50, badge: ['🌿', '브랜치 탐험가'], goal: '원본(main)을 건드리지 않고 실험하는 평행 세계, 브랜치를 만들어요.', setup: () => M.ensureRepo(), real: [DOC + 'pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-branches', '브랜치 이름은 무엇을 하는지 알 수 있게! 예: feature/login, fix/typo'],
  steps: [
    { concept: true, t: '브랜치가 뭐예요?', d: `<div class="branch-diagram"><div class="lane"><span class="ln">main</span><i></i><i></i><i></i><i class="dim"></i><i class="dim"></i></div><div class="lane br"><span class="ln">feature/greeting</span><i class="sp"></i><i class="sp"></i><i></i><i></i></div></div><p>브랜치는 나뭇가지처럼 <b>갈라져 나온 작업 공간</b>이에요. 새 기능을 브랜치에서 마음껏 실험하고, 다 되면 main에 합쳐요. 실험이 망해도 main은 멀쩡해요! 🌿</p>` },
    { t: '브랜치 메뉴 열기', d: 'Code 탭에서 <b>main ▾</b> 버튼을 누르세요.', on: 'ui:branchmenu', target: ['[data-t=branch-btn]', '[data-t=tab-code]'], hint: '파일 목록 왼쪽 위에 있어요.' },
    { t: '새 브랜치 만들기', d: `검색 칸에 ${code('feature/greeting')}을 쓰고 아래 나타나는 <b>Create branch: feature/greeting from 'main'</b>을 누르세요.`, snip: [{ label: '브랜치 이름', code: 'feature/greeting', into: '#br-filter' }], on: 'branch:create', when: d => d.key === MY() && d.br === 'feature/greeting', auto: () => !!R(MY())?.branches['feature/greeting'], target: ['[data-t=create-branch]', '[data-t=br-filter]', '[data-t=branch-btn]'], hint: '이름을 다 쓰면 목록 맨 아래에 Create branch 버튼이 생겨요.' },
    { t: '브랜치에서 커밋하기', d: `지금 <b>feature/greeting</b> 브랜치에 있는지 확인하고, 새 파일 ${code('greeting.txt')}를 만들어 커밋하세요.`, snip: [{ label: '파일 이름', code: 'greeting.txt', into: '#ed-path' }, { label: '내용', code: '반가워요! 브랜치에서 쓴 인사말이에요 🌿', into: '#ed-content' }], on: 'commit', when: d => d.key === MY() && d.br === 'feature/greeting', target: ['[data-t=cm-commit]', '[data-t=commit-btn]', '[data-t=create-file]', '[data-t=add-file]'], hint: '브랜치 버튼에 feature/greeting 이 써 있는 상태에서 Add file → Create new file 하세요.' },
    { t: 'main으로 돌아가 보기', d: '브랜치 버튼을 눌러 <b>main</b>으로 바꿔 보세요. greeting.txt가 있나요? 🤔', on: 'branch:switch', when: d => d.br === 'main', target: ['[data-t=branch-btn]'], hint: '브랜치 목록에서 main 을 클릭해요.' },
    { concept: true, t: '짜잔! main은 그대로예요', d: '<p>greeting.txt는 <b>feature/greeting 브랜치에만</b> 있어요. 브랜치에서 한 일은 다른 브랜치에 영향을 주지 않아요.</p><p>그럼 브랜치의 작업을 main에 합치려면? 👉 다음 미션 <b>Pull Request</b>에서 배워요!</p>' },
  ] },
{ id: 'pull-request', go: goMy, ch: 'c2', icon: '📬', title: 'Pull Request 열기', xp: 60, goal: '"내 브랜치의 변경을 main에 합쳐 주세요!" 라고 요청하는 PR을 만들고 코드 리뷰를 해 봐요.', setup: () => { const r = M.ensureRepo(); if (!r.branches['feature/greeting']) { G.branchNew(MY(), 'feature/greeting', r.def); G.commitTo(MY(), 'feature/greeting', { 'greeting.txt': '반가워요! 브랜치에서 쓴 인사말이에요 🌿\n' }, 'Add greeting.txt', '', ME(), { force: true }); App.toast('🐿️ 연습용 feature/greeting 브랜치를 준비했어요.'); } },
  real: [DOC + 'pull-requests', 'PR은 GitHub 협업의 핵심! 회사에서도 대부분의 코드가 PR → 리뷰 → 머지 과정을 거쳐요.'],
  steps: [
    { t: '비교 화면 열기', d: '저장소 Code 탭의 노란 배너 <b>Compare &amp; pull request</b>를 누르거나, <b>Pull requests</b> 탭 → <b>New pull request</b>를 누르세요.', on: 'nav', when: d => d.sub === 'compare', auto: () => R(MY())?.pulls.some(p => p.state === 'open' && p.head === 'feature/greeting'), target: ['[data-t=compare-pr]', '[data-t=new-pr]', '[data-t=tab-pulls]'], hint: '배너가 안 보이면 Pull requests 탭으로 가요.' },
    { t: 'PR 만들기', d: `<b>base: main ← compare: feature/greeting</b> 로 고르고 <b>Create pull request</b>를 눌러 제목과 설명을 쓴 뒤 다시 <b>Create pull request</b>를 누르세요.`, snip: [{ label: '설명 예시', code: '## 무엇을 했나요?\n- 인사말 파일(greeting.txt)을 추가했어요.\n\n## 확인해 주세요\n- [ ] 인사말이 자연스러운지', into: '#pr-body' }], on: 'pr:create', when: d => d.key === MY(), auto: () => R(MY())?.pulls.some(p => p.state === 'open' && p.head === 'feature/greeting'), target: ['[data-t=create-pr]', '[data-t=open-pr-form]', '[data-t=cmp-head]'], hint: 'compare 칸에서 feature/greeting 을 골라야 비교 결과가 나와요.' },
    { t: '바뀐 파일 보기', d: 'PR 화면에서 <b>📄 Files changed</b> 탭을 눌러 보세요.', on: 'pr:tab', when: d => d.tab === 'files', target: ['[data-t=pr-files-tab]'], hint: 'PR 제목 아래 탭 4개 중 마지막이에요.' },
    { t: '코드 한 줄에 코멘트 달기', d: '초록색 줄 옆의 작은 <b>+</b> 버튼을 눌러 그 줄에 의견을 남겨 보세요. 이게 바로 <b>코드 리뷰</b>예요!', on: 'pr:linecomment', target: ['[data-t=lc-add]', '[data-t=line-plus]'], hint: '줄 번호 오른쪽의 파란 + 버튼이에요.' },
    { t: '대화(Conversation)에 코멘트 남기기', d: '<b>💬 Conversation</b> 탭으로 가서 아래 입력칸에 코멘트를 쓰고 <b>Comment</b>를 누르세요. <span class="small muted">팁: @dain-friend 라고 쓰면 친구가 대답해요!</span>', on: 'pr:comment', target: ['[data-t=comment-btn]', '[data-t=comment-box]'], hint: 'PR 화면 맨 아래에 코멘트 입력칸이 있어요.' },
  ] },
{ id: 'review-merge', go: () => { const p = R(MY())?.pulls.find(x => x.state === 'open'); return p ? { page: 'repo', key: MY(), tab: 'pulls', sub: 'view', n: p.n } : { page: 'repo', key: MY(), tab: 'pulls' }; }, ch: 'c2', icon: '🦈', title: '리뷰 받고 머지하기', xp: 60, badge: ['🦈', 'PR 상어'], goal: '친구에게 리뷰를 요청하고, 승인받은 PR을 main에 합쳐요(merge).', setup: () => { const r = M.ensureRepo(); if (!r.pulls.some(p => p.state === 'open')) { if (!r.branches['feature/greeting'] || !G.ahead(r.branches[r.def], r.branches['feature/greeting']).length) { if (!r.branches['feature/greeting']) G.branchNew(MY(), 'feature/greeting', r.def); G.commitTo(MY(), 'feature/greeting', { 'greeting.txt': '반가워요! 브랜치에서 쓴 인사말이에요 🌿\n' }, 'Add greeting.txt', '', ME(), { force: true }); } G.prNew(MY(), { title: 'Add greeting', body: '인사말 파일을 추가했어요.', base: r.def, head: 'feature/greeting' }); App.toast('🐿️ 연습용 PR을 준비했어요.'); } },
  real: [DOC + 'pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests', '실제로는 저장소에 초대된 공동작업자(collaborator)에게만 리뷰를 요청할 수 있어요.'],
  steps: [
    { t: '리뷰 요청하기', d: () => { const p = R(MY())?.pulls.find(x => x.state === 'open'); return `PR ${p ? '#' + p.n : ''} 화면 오른쪽 <b>Reviewers ⚙️</b>를 누르고 <b>dain-friend</b>를 선택하세요.`; }, on: 'pr:reviewreq', target: ['[data-t=rv-dain-friend]', '[data-t=reviewers-gear]', '[data-t^=pr-item]', '[data-t=tab-pulls]'], hint: 'Pull requests 탭 → PR 클릭 → 오른쪽 사이드바 맨 위 톱니바퀴예요.' },
    { t: '친구의 승인 기다리기 ⏳', d: '<p>dain-friend가 코드를 읽고 있어요… 잠시만 기다려 주세요!</p><p class="small muted">💡 알아 두기: 내가 만든 PR은 내가 스스로 <b>Approve(승인)</b>할 수 없어요. 다른 사람의 눈으로 한 번 더 확인하는 게 리뷰의 목적이니까요.</p>', on: 'pr:approved', auto: () => R(MY())?.pulls.some(p => p.state === 'open' && p.reviews.some(v => v.state === 'approved')), target: [] },
    { t: 'PR 머지하기', d: '승인 완료! 🎉 PR 아래쪽 초록 <b>Merge pull request</b> → <b>Confirm merge</b>를 누르세요.<br><span class="small muted">▾ 버튼으로 Squash, Rebase 방식도 고를 수 있어요.</span>', on: 'pr:merge', when: d => d.key === MY() && d.by === ME(), target: ['[data-t=confirm-merge]', '[data-t=merge-btn]'], hint: '초록 버튼이 회색이면 승인이 아직 안 된 거예요.' },
    { t: '다 쓴 브랜치 정리하기', d: '머지가 끝난 브랜치는 <b>Delete branch</b> 버튼으로 지워요. (기록은 main에 다 남아 있어요!)', on: 'branch:delete', target: ['[data-t=delete-branch]'], hint: '보라색 "successfully merged" 상자 오른쪽에 있어요.' },
    Q('여러 개의 커밋을 하나로 꾹 눌러 합쳐서 main에 넣는 머지 방식은?', ['Create a merge commit', 'Squash and merge', 'Rebase and merge', 'Fork and merge'], 1, 'Squash = 찌그러뜨리다! 자잘한 커밋 여러 개를 하나로 합쳐 main 기록을 깔끔하게 유지해요.'),
  ] },
{ id: 'conflict', go: () => ({ page: 'repo', key: MY(), tab: 'pulls' }), ch: 'c2', icon: '🧯', title: '머지 충돌 해결하기', xp: 70, badge: ['🧯', '충돌 해결사'], goal: '두 사람이 같은 줄을 다르게 고쳤을 때 생기는 충돌(conflict)을 직접 해결해요.',
  setup: () => {
    const r = M.ensureRepo(); const key = MY();
    if (r.pulls.some(p => p.head === 'update-greeting' && p.state === 'open')) return;
    if (r.branches['update-greeting']) G.branchDel(key, 'update-greeting');
    G.commitTo(key, r.def, { 'welcome.txt': '환영합니다!\n' }, 'Add welcome.txt', '', 'dain-friend', { force: true });
    G.branchNew(key, 'update-greeting', r.def);
    G.commitTo(key, 'update-greeting', { 'welcome.txt': '어서 오세요, 반가워요! 👋\n' }, 'Make welcome message friendlier', '', 'dain-friend', { force: true });
    G.commitTo(key, r.def, { 'welcome.txt': 'Welcome to my repo!\n' }, 'Translate welcome message to English', '', 'dain-friend', { force: true });
    G.prNew(key, { title: '환영 인사 바꾸기 (충돌 연습)', body: 'dain-friend가 작업한 update-greeting 브랜치예요.\n그런데 그사이 main의 welcome.txt도 바뀌었어요! 😱', base: r.def, head: 'update-greeting' });
    App.toast('🐿️ 충돌 상황을 준비했어요! Pull requests 탭을 확인하세요.');
  }, real: [DOC + 'pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts', '충돌은 실수가 아니라 협업하면 자연스럽게 생기는 일이에요. 자주 pull 하고 작은 PR을 만들면 줄일 수 있어요.'],
  steps: [
    { t: '충돌 난 PR 열기', d: () => { const p = R(MY())?.pulls.find(x => x.head === 'update-greeting'); return `<b>Pull requests</b> 탭에서 <b>#${p ? p.n : ''} 환영 인사 바꾸기</b>를 열어 보세요.`; }, on: 'nav', when: d => d.tab === 'pulls' && d.sub === 'view' && R(MY())?.pulls.find(x => x.n === d.n)?.head === 'update-greeting', target: ['[data-t^=pr-item]', '[data-t=tab-pulls]'] },
    { t: 'Resolve conflicts 누르기', d: '<b>This branch has conflicts</b> 라는 빨간 표시가 보이죠? <b>Resolve conflicts</b> 버튼을 눌러요.', on: 'resolve:open', target: ['[data-t=resolve-btn]'] },
    { t: '충돌 표시 지우고 해결하기', d: `편집기에서 남기고 싶은 문장만 두고 ${code('<<<<<<<')}, ${code('=======')}, ${code('>>>>>>>')} 표시가 있는 줄을 <b>모두 지운</b> 뒤 <b>Mark as resolved</b> → <b>Commit merge</b>를 누르세요.`, snip: [{ label: '해결 예시 (둘 다 살리기)', code: '어서 오세요, 반가워요! 👋\nWelcome to my repo!\n', into: '#rs-content' }], on: 'conflict:resolved', target: ['[data-t=commit-merge]', '[data-t=mark-resolved]', '[data-t=rs-content]'], hint: '두 문장을 다 남겨도, 하나만 남겨도 괜찮아요. 표시 3줄만 꼭 지워요!' },
    { t: '이제 머지!', d: '충돌이 사라졌어요. <b>Merge pull request → Confirm merge</b>로 마무리하세요.', on: 'pr:merge', when: d => d.key === MY(), target: ['[data-t=confirm-merge]', '[data-t=merge-btn]'] },
    { concept: true, t: '충돌을 줄이는 습관', d: '<ul><li>🔄 작업 전에 항상 최신 main을 받아요 (pull)</li><li>✂️ PR은 작게, 자주!</li><li>🗣️ 같은 파일을 고칠 땐 팀원과 미리 이야기해요</li></ul><p>충돌은 무서운 게 아니에요. Git이 "둘 중 뭘 쓸지 사람이 정해 주세요"라고 물어보는 것뿐이에요 🙂</p>' },
  ] },

/* ================= 3. 이슈와 프로젝트 ================= */
{ id: 'issues', go: goMy, ch: 'c3', icon: '🐞', title: '이슈 만들기', xp: 60, badge: ['🐞', '이슈 헌터'], goal: '할 일, 버그, 아이디어를 기록하는 Issue를 만들고 라벨·담당자·반응을 달아요.', setup: () => M.ensureRepo(), real: [DOC + 'issues', '좋은 이슈 = 무엇이 문제인지 + 어떻게 재현하는지 + 기대하는 결과'],
  steps: [
    { t: '새 이슈 화면 열기', d: '<b>Issues</b> 탭 → <b>New issue</b>를 누르세요.', on: 'nav', when: d => d.tab === 'issues' && d.sub === 'new', target: ['[data-t=new-issue]', '[data-t=tab-issues]'] },
    { t: '체크리스트가 있는 이슈 만들기', d: `제목을 쓰고, 설명에 할 일 목록 ${code('- [ ] 할 일')}을 2개 이상 넣은 뒤 <b>Create</b>를 누르세요.`, snip: [{ label: '제목', code: 'README에 자기소개 추가하기', into: '#is-title' }, { label: '설명', code: 'README가 너무 짧아요. 자기소개를 추가하면 좋겠어요!\n\n- [ ] 이름 쓰기\n- [ ] 좋아하는 것 쓰기\n- [ ] 사진 넣기', into: '#is-body' }], on: 'issue:create', when: d => /^\s*[-*]\s+\[ \]/m.test(d.body), target: ['[data-t=submit-issue]', '[data-t=is-body]'], hint: '- 와 [ ] 사이, ] 뒤에 띄어쓰기가 있어야 체크박스가 돼요.' },
    { t: '라벨 붙이기', d: '오른쪽 <b>Labels ⚙️</b>를 눌러 <b>enhancement</b>(새 기능) 같은 라벨을 골라 보세요.', on: 'issue:label', target: ['[data-t=lb-enhancement]', '[data-t=labels-gear]'] },
    { t: '내가 맡기', d: '<b>Assignees</b> 아래 <b>assign yourself</b>를 눌러 이 일의 담당자가 되어 보세요.', on: 'issue:assign', target: ['[data-t=assign-me]'] },
    { t: '이모지로 반응하기', d: '이슈 본문 아래 <b>😊＋</b>를 눌러 👍 나 🎉 반응을 남겨 보세요.', on: 'react', target: ['[data-t=react-body]'] },
    { t: '체크박스 체크하기', d: '본문의 체크박스 하나를 클릭해 보세요. 할 일을 끝내면 이렇게 표시해요 ✅', on: 'task:toggle', target: ['.cmt-b input[type=checkbox]'] },
  ] },
{ id: 'close-by-commit', go: goMy, ch: 'c3', icon: '🔗', title: '커밋으로 이슈 자동으로 닫기', xp: 50, goal: '커밋 메시지에 "Fixes #번호"를 쓰면 이슈가 자동으로 닫히는 마법을 체험해요.', setup: () => { const r = M.ensureRepo(); if (!r.issues.some(i => i.state === 'open')) { G.issueNew(MY(), { title: 'README에 자기소개 추가하기', body: '- [ ] 이름 쓰기\n- [ ] 좋아하는 것 쓰기' }); App.toast('🐿️ 연습용 이슈를 하나 만들어 두었어요.'); } },
  real: [DOC + 'issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue', 'close, closes, closed, fix, fixes, fixed, resolve, resolves, resolved 모두 쓸 수 있어요.'],
  steps: [
    { t: '"Fixes #번호"로 커밋하기', d: () => { const i = R(MY())?.issues.filter(x => x.state === 'open').sort((a, b) => b.n - a.n)[0]; const n = i ? i.n : 1; return `열려 있는 이슈 <b>#${n}</b>${i ? ` (${V.esc(i.title)})` : ''}를 해결해 봐요! <b>main</b> 브랜치에서 아무 파일(예: README.md)이나 고치고, 커밋 메시지를 ${code('Fixes #' + n)} 처럼 쓰세요.<p class="small muted">PR로 할 때는 PR 설명에 Closes #${n} 을 써도 돼요.</p>`; }, snip: [{ label: '커밋 메시지', code: () => { const i = R(MY())?.issues.filter(x => x.state === 'open').sort((a, b) => b.n - a.n)[0]; return `Add self introduction (Fixes #${i ? i.n : 1})`; }, into: '#cm-msg' }], on: 'issue:closed', when: d => d.key === MY() && /commit|PR/.test(d.via || ''), target: ['[data-t=cm-msg]', '[data-t=cm-commit]', '[data-t=commit-btn]', '[data-t=edit-readme]'], hint: 'README ✏️ → 내용 수정 → Commit changes... → 메시지 칸을 바꿔요.' },
    { t: '닫힌 이슈 확인하기', d: '<b>Issues</b> 탭에서 <b>✓ Closed</b>를 눌러 닫힌 이슈를 확인하고, 이슈를 열어 어떤 커밋이 닫았는지 보세요.', on: 'issues:filter', when: d => d.state === 'closed', target: ['[data-t=filter-closed]', '[data-t=tab-issues]'] },
    Q('PR 설명에 무엇을 쓰면, PR이 머지될 때 이슈 #7이 자동으로 닫힐까요?', ['Issue 7 done', 'Closes #7', '#7 close please', '@7 fixed'], 1, 'Closes / Fixes / Resolves + #번호 를 쓰면 기본 브랜치에 머지될 때 이슈가 자동으로 닫혀요.'),
  ] },
{ id: 'labels-ms', go: goMy, ch: 'c3', icon: '🏷', title: '라벨과 마일스톤', xp: 40, goal: '이슈를 분류하는 라벨과, 목표 날짜별로 묶는 마일스톤을 만들어요.', setup: () => { const r = M.ensureRepo(); if (!r.issues.some(i => i.state === 'open')) G.issueNew(MY(), { title: '프로필 사진 넣기', body: '' }); }, real: [DOC + 'issues/using-labels-and-milestones-to-track-work', ''],
  steps: [
    { t: '나만의 라벨 만들기', d: '<b>Issues</b> 탭 → <b>🏷 Labels</b> → <b>New label</b>에서 이름(예: 숙제)과 색을 정하고 <b>Create label</b>.', snip: [{ label: '라벨 이름', code: '숙제', into: '#lb-name' }], on: 'label:create', target: ['[data-t=create-label]', '[data-t=new-label]', '[data-t=labels-btn]', '[data-t=tab-issues]'] },
    { t: '마일스톤 만들기', d: '<b>Issues</b> 탭 → <b>🎯 Milestones</b> → <b>New milestone</b>에서 목표(예: 1학기 프로젝트)를 만드세요.', snip: [{ label: '마일스톤 이름', code: '1학기 프로젝트', into: '#ms-title' }], on: 'milestone:create', target: ['[data-t=create-ms]', '[data-t=new-ms]', '[data-t=ms-btn]', '[data-t=tab-issues]'] },
    { t: '이슈에 마일스톤 지정하기', d: '열린 이슈 하나를 열고 오른쪽 <b>Milestone ⚙️</b>에서 방금 만든 마일스톤을 고르세요. 마일스톤 화면에서 진행률이 보여요!', on: 'issue:milestone', target: ['[data-t^=setms-]', '[data-t=ms-gear]', '[data-t^=issue-item]'] },
  ] },
{ id: 'projects', go: goMy, ch: 'c3', icon: '📋', title: 'Projects 칸반 보드', xp: 60, badge: ['📋', '칸반 마스터'], goal: '이슈들을 Todo → In Progress → Done 보드로 관리해요.', setup: () => { const r = M.ensureRepo(); const open = r.issues.filter(i => i.state === 'open').length; ['발표 자료 만들기', '친구에게 저장소 소개하기'].slice(0, Math.max(0, 2 - open)).forEach(t => G.issueNew(MY(), { title: t, body: '' })); },
  real: [DOC + 'issues/planning-and-tracking-with-projects', '실제 Projects는 보드·표·로드맵 보기를 지원하고, 여러 저장소의 이슈를 한 보드에 모을 수 있어요.'],
  steps: [
    { t: '프로젝트 만들기', d: '<b>Projects</b> 탭 → <b>New project</b> → 이름을 쓰고 <b>Create project</b>.', snip: [{ label: '이름', code: '1학기 프로젝트 보드', into: '#pj-name' }], on: 'project:create', target: ['[data-t=create-project]', '[data-t=new-project]', '[data-t=tab-projects]'] },
    { t: '이슈를 보드에 추가하기', d: '<b>Todo</b> 칸 아래 <b>＋ Add item…</b>에서 이슈를 골라 <b>Add</b>를 누르세요.', on: 'project:add', target: ['[data-t=pj-add-btn]', '[data-t=pj-add]'] },
    { t: '시작했어요! → In Progress', d: '카드를 <b>In Progress</b> 칸으로 끌어다 놓거나, 카드의 <b>▶</b> 버튼을 누르세요.', on: 'project:move', when: d => d.col === 'In Progress', target: ['.pcard [data-d="1"]', '.pcard'] },
    { t: '끝났어요! → Done', d: '같은 카드를 <b>Done</b> 칸으로 옮겨 보세요. 🎉', on: 'project:move', when: d => d.col === 'Done', target: ['[data-t="col-In Progress"] [data-d="1"]', '.pcard [data-d="1"]'] },
  ] },

/* ================= 4. 협업과 오픈소스 ================= */
{ id: 'explore-star', go: () => ({ page: 'home' }), ch: 'c4', icon: '⭐', title: '둘러보기 · Star · Watch', xp: 40, goal: '다른 사람의 저장소를 구경하고 별(Star)과 알림(Watch)을 설정해요.', real: ['https://github.com/explore', 'Star는 북마크 + 응원이에요. 별이 많은 저장소는 인기 프로젝트라는 뜻!'],
  steps: [
    { t: 'Explore 열기', d: '상단 바의 <b>🧭 Explore</b>를 누르세요.', on: 'nav', when: d => d.page === 'explore', target: ['[data-t=nav-explore]'] },
    { t: '인기 저장소 들어가기', d: `${code(WB)} 저장소를 클릭하세요.`, on: 'nav', when: d => d.page === 'repo' && d.key === WB, target: [`[data-t="ex-${WB}"]`] },
    { t: '⭐ Star 누르기', d: '오른쪽 위 <b>☆ Star</b>를 눌러 응원해요!', on: 'star', when: d => d.key === WB, auto: () => !!S().starred[WB], target: ['[data-t=star]'] },
    { t: '👁 Watch 누르기', d: '<b>👁 Watch</b>를 누르면 이 저장소의 새 이슈·PR 소식을 받아요.', on: 'watch', when: d => d.key === WB, auto: () => !!S().watching[WB], target: ['[data-t=watch]'] },
  ] },
{ id: 'fork-pr', go: () => ({ page: 'repo', key: WB, tab: 'code' }), ch: 'c4', icon: '🍴', title: 'Fork 해서 오픈소스에 기여하기', xp: 80, badge: ['🍴', '오픈소스 기여자'], goal: '남의 저장소를 내 계정으로 복사(Fork)하고, 고친 내용을 PR로 보내 원본에 기여해요.', real: [DOC + 'pull-requests/collaborating-with-pull-requests/working-with-forks', '진짜 오픈소스도 똑같아요! CONTRIBUTING.md 를 먼저 읽고, good first issue 라벨부터 도전해 보세요.'],
  steps: [
    { concept: true, t: 'Fork가 왜 필요할까?', d: `<p>남의 저장소(<b>${WB}</b>)에는 내가 직접 push 할 권한이 없어요. 그래서:</p><ol><li>🍴 <b>Fork</b>: 저장소를 내 계정으로 통째로 복사</li><li>✏️ 내 복사본에서 자유롭게 수정 & 커밋</li><li>📬 원본에 <b>Pull Request</b>로 "이것 좀 넣어 주세요!" 제안</li><li>✅ 원본 관리자(메인테이너)가 확인하고 머지</li></ol>` },
    { t: 'Fork 하기', d: `${code(WB)} 저장소에서 <b>🍴 Fork</b> → <b>Create fork</b>를 누르세요.`, on: 'fork', when: d => d.from === WB, auto: () => R(ME() + '/word-bank')?.forkOf === WB, target: ['[data-t=create-fork]', '[data-t=fork]'], hint: '먼저 Explore 또는 대시보드 오른쪽에서 octo-academy/word-bank 로 들어가요.' },
    { t: '내 Fork에서 단어 추가하기', d: () => `내 저장소 <b>${V.esc(ME())}/word-bank</b>에서 ${code('words.md')}를 열고 ✏️ 편집 → 표 맨 아래에 단어를 한 줄 추가해 커밋하세요.`, snip: [{ label: '추가할 줄', code: '| dog | 개 | perro |' }], on: 'commit', when: d => d.key === ME() + '/word-bank', target: ['[data-t=cm-commit]', '[data-t=commit-btn]', '[data-t=edit-file]', '[data-t="file-words.md"]'], hint: '주소창이 github.com/' + '내아이디/word-bank 인지 확인하세요. 원본(octo-academy)이 아니라 내 Fork에서 고쳐야 해요!' },
    { t: '원본에 Pull Request 보내기', d: '내 Fork의 Code 탭에서 <b>Contribute</b> 버튼 → 제목·설명 쓰기 → <b>Create pull request</b>.', on: 'pr:create', when: d => d.key === WB, target: ['[data-t=create-pr]', '[data-t=contribute]'], hint: '"This branch is 1 commit ahead of octo-academy/word-bank" 줄 오른쪽에 있어요.' },
    { t: '메인테이너의 답을 기다리기 ⏳', d: '<p>octo-teacher님이 PR을 확인하고 있어요… 두근두근 💓</p><p class="small muted">진짜 오픈소스에서는 며칠이 걸리기도 해요. 리뷰에서 수정 요청이 오면 내 Fork에 커밋을 더 하면 PR에 자동으로 반영돼요.</p>', on: 'pr:merge', when: d => d.key === WB && d.by === 'octo-teacher', auto: () => R(WB).pulls.some(p => p.author === ME() && p.state === 'merged'), target: [] },
    { t: 'Sync fork로 최신 상태 맞추기', d: '머지되면서 원본이 내 Fork보다 앞서 나갔어요. 내 Fork로 돌아가 <b>🔄 Sync fork</b>를 눌러 최신 내용을 가져오세요.', on: 'fork:sync', target: ['[data-t=sync-fork]'], hint: () => `상단의 ${ME()} / word-bank 로 가요. "commit behind" 문구 옆에 버튼이 있어요.` },
  ] },
{ id: 'collab-protect', go: goMy, ch: 'c4', icon: '🛡️', title: '공동작업자 초대 & 브랜치 보호', xp: 80, badge: ['🛡️', '팀장님'], goal: '친구를 팀원으로 초대하고, main을 실수로부터 지키는 보호 규칙을 만들어요.', setup: () => M.ensureRepo(), real: [DOC + 'repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches', '실제 팀 프로젝트에서는 main 보호 규칙을 거의 항상 켜 둬요.'],
  steps: [
    { t: '공동작업자 초대하기', d: '<b>my-first-repo</b>의 <b>⚙️ Settings → 👥 Collaborators → Add people</b>에서 <b>dain-friend</b>를 초대하세요.', on: 'collab:add', when: d => d.key === MY(), target: ['[data-t=invite-dain-friend]', '[data-t=add-people]', '[data-t=set-access]', '[data-t=tab-settings]'] },
    { t: '초대 수락 기다리기 ⏳', d: '친구가 이메일로 초대장을 받고 수락하는 중이에요…', on: 'collab:accepted', auto: () => R(MY())?.collab.some(c => c.status === 'accepted'), target: [] },
    { t: 'main 보호 규칙 만들기', d: '<b>Settings → Branches → Add branch protection rule</b>: 패턴 <b>main</b>, ✅ <b>Require a pull request before merging</b>, 승인 1명 → <b>Create</b>.', on: 'protect:add', when: d => d.key === MY() && d.pr, target: ['[data-t=bp-save]', '[data-t=add-rule]', '[data-t=set-branches]', '[data-t=tab-settings]'] },
    { t: 'main에 바로 커밋해 보기 🙅', d: 'README를 ✏️ 편집하고 <b>Commit changes...</b>를 눌러 보세요. "main에 바로 커밋" 옵션이 막혀 있죠? <b>new branch</b> 옵션으로 커밋한 뒤 <b>Create pull request</b>까지 하세요.', on: 'pr:create', when: d => d.key === MY(), target: ['[data-t=create-pr]', '[data-t=cm-commit]', '[data-t=commit-btn]', '[data-t=edit-readme]', '[data-t=tab-code]'] },
    { t: '승인받고 머지하기', d: 'PR에서 <b>Reviewers ⚙️ → dain-friend</b>에게 리뷰를 요청하고, 승인되면 머지하세요. 승인 전에는 머지 버튼이 잠겨 있어요 🔒', on: 'pr:merge', when: d => d.key === MY(), target: ['[data-t=confirm-merge]', '[data-t=merge-btn]', '[data-t=rv-dain-friend]', '[data-t=reviewers-gear]'] },
    { t: '(연습용) 보호 규칙 끄기', d: '다음 장의 터미널 연습에서 main에 직접 push 해야 해서, <b>Settings → Branches</b>에서 방금 만든 규칙을 <b>Delete</b> 해 주세요. <span class="small muted">실제 팀 프로젝트에서는 켜 두는 게 좋아요!</span>', on: 'protect:remove', target: ['[data-t=bp-del]', '[data-t=set-branches]', '[data-t=tab-settings]'], hint: '규칙 줄 오른쪽 Delete 버튼이에요.' },
  ] },

/* ================= 5. 터미널 ================= */
{ id: 'cli-setup', ch: 'c5', icon: '⌨️', title: '터미널 첫걸음 & Git 설정', xp: 50, goal: '아래쪽 터미널에 명령어를 입력해 Git을 처음 설정해요.', setup: () => M.openTerm(), real: ['https://git-scm.com/downloads', '실제 컴퓨터에는 git-scm.com 에서 Git을 설치해요. Windows는 Git Bash, Mac은 터미널 앱을 써요.'],
  steps: [
    { concept: true, t: '터미널이 뭐예요?', d: '<p>아래쪽 까만 창이 <b>터미널</b>이에요. 마우스 대신 <b>글자 명령어</b>로 컴퓨터에게 일을 시켜요. 개발자들은 Git을 주로 터미널에서 써요!</p><p class="small">⌨️ 명령어를 입력하고 <kbd>Enter</kbd> · <kbd>↑</kbd>로 이전 명령 · <kbd>Tab</kbd>으로 자동완성 · 아래 명령어 칩의 <b>⌨ 입력</b> 버튼을 누르면 자동으로 들어가요.</p>', term: true },
    { t: 'Git 버전 확인', d: `${code('git --version')}을 입력해 Git이 설치되어 있는지 확인해요.`, snip: [{ code: 'git --version', kind: 'cmd' }], on: 'git:version', term: true },
    { t: '내 이름 알려 주기', d: '커밋할 때 기록될 이름을 설정해요. 한 번만 하면 돼요!', snip: [{ code: () => `git config --global user.name "${S().name}"`, kind: 'cmd' }], on: 'git:config', when: d => d.key === 'name', term: true },
    { t: '내 이메일 알려 주기', d: 'GitHub 계정 이메일과 같게 하면 커밋이 내 프로필 잔디에 심어져요 🌱', snip: [{ code: () => `git config --global user.email "${ME()}@users.noreply.github.com"`, kind: 'cmd' }], on: 'git:config', when: d => d.key === 'email', term: true },
    { t: '폴더 살펴보기', d: `${code('ls')}(목록 보기)와 ${code('pwd')}(현재 위치)를 입력해 보세요.`, snip: [{ code: 'ls', kind: 'cmd' }, { code: 'pwd', kind: 'cmd' }], on: 'sh:ls', term: true },
  ] },
{ id: 'clone', go: goMy, ch: 'c5', icon: '📥', title: 'clone: GitHub 저장소를 내 컴퓨터로', xp: 50, goal: 'GitHub에 있는 저장소를 내 컴퓨터로 통째로 복사해 와요.', setup: () => { M.ensureRepo(); M.openTerm(); }, real: [DOC + 'repositories/creating-and-managing-repositories/cloning-a-repository', 'Fork는 GitHub 안에서의 복사, Clone은 GitHub → 내 컴퓨터로의 복사예요.'],
  steps: [
    { t: '저장소 주소 복사하기', d: '<b>my-first-repo</b>의 초록 <b>&lt;&gt; Code ▾</b> 버튼을 누르고 HTTPS 주소 옆 📋를 눌러 복사하세요.', on: 'clone:copy', target: ['[data-t=copy-clone]', '[data-t=code-btn]'], hint: '대시보드 → my-first-repo 로 들어가면 파일 목록 위 오른쪽에 있어요.' },
    { t: 'git clone 하기', d: '터미널에 <code>git clone</code> 다음 한 칸 띄고 복사한 주소를 붙여 넣으세요. (터미널이 홈 폴더 ~ 에 있어야 해요. 아니면 먼저 <code>cd ~</code>)', snip: [{ code: () => `git clone https://github.com/${MY()}.git`, kind: 'cmd' }], on: 'git:clone', when: d => d.key === MY(), auto: () => !!L().home['my-first-repo'], term: true },
    { t: '저장소 폴더로 들어가기', d: `${code('cd my-first-repo')}로 폴더 안으로 들어가요. 프롬프트에 <b>(main)</b>이 보이면 Git 저장소 안이에요!`, snip: [{ code: 'cd my-first-repo', kind: 'cmd' }], on: 'sh:cd', when: d => d.cwd === 'my-first-repo', term: true },
    { t: '파일 확인하기', d: `${code('ls')}로 파일 목록을 보고, ${code('cat README.md')}로 내용을 읽어 보세요. GitHub에 있던 그대로죠?`, snip: [{ code: 'ls', kind: 'cmd' }, { code: 'cat README.md', kind: 'cmd' }], on: 'sh:cat', term: true },
  ] },
{ id: 'add-commit-push', ch: 'c5', icon: '💻', title: 'add → commit → push 핵심 3단계', xp: 80, badge: ['💻', '터미널 닌자'], goal: 'Git의 가장 중요한 흐름! 파일 수정 → 스테이지 → 커밋 → GitHub에 올리기.', setup: () => { M.unprotect(); M.ensureClone(); M.cdRepo(); M.openTerm(); }, real: [DOC + 'get-started/using-git/about-git', '이 4단계(수정 → add → commit → push)가 개발자의 하루 루틴이에요!'],
  steps: [
    { concept: true, t: 'Git의 3가지 공간', d: `<div class="stage-flow"><div><b>📝 작업 폴더</b><small>파일을 고치는 곳</small></div><span>git add →</span><div><b>📦 스테이지</b><small>커밋할 것 고르기</small></div><span>git commit →</span><div><b>🗄️ 로컬 저장소</b><small>내 컴퓨터 기록</small></div><span>git push →</span><div><b>☁️ GitHub</b><small>원격 저장소</small></div></div><p class="small muted">택배로 비유하면: 물건 고르기(add) → 상자 포장하고 송장 쓰기(commit) → 택배 보내기(push) 📦</p>`, term: true },
    { t: '새 파일 만들기', d: `${code('echo')} 명령으로 파일을 만들어요. (${code('edit study.txt')}로 편집기를 열어도 돼요)`, snip: [{ code: 'echo "오늘은 터미널로 Git을 배웠다" > study.txt', kind: 'cmd' }], on: 'sh:write', when: d => d.file === 'study.txt' && L().cwd === 'my-first-repo', term: true, hint: '프롬프트가 ~/my-first-repo 인지 확인하세요. 아니면 cd ~/my-first-repo' },
    { t: '상태 확인하기', d: `${code('git status')}로 Git이 지금 무엇을 보고 있는지 확인해요. 빨간 <b>Untracked files</b>에 study.txt가 보일 거예요.`, snip: [{ code: 'git status', kind: 'cmd' }], on: 'git:status', term: true },
    { t: '스테이지에 올리기 (add)', d: `${code('git add study.txt')} 후 다시 ${code('git status')} 해 보면 초록색으로 바뀌어요!`, snip: [{ code: 'git add study.txt', kind: 'cmd' }], on: 'git:add', when: d => d.files.includes('study.txt'), term: true },
    { t: '커밋하기 (commit)', d: `${code('-m')} 뒤에 커밋 메시지를 따옴표로 써요.`, snip: [{ code: 'git commit -m "Add study note"', kind: 'cmd' }], on: 'git:commit', term: true, hint: '"Author identity unknown" 오류가 나면 이전 미션의 git config 두 줄을 먼저 입력하세요.' },
    { t: 'GitHub에 올리기 (push)', d: `${code('git push')}로 내 컴퓨터의 커밋을 GitHub에 보내요! 🚀`, snip: [{ code: 'git push', kind: 'cmd' }], on: 'git:push', when: d => d.key === MY() && d.n > 0, term: true, hint: 'rejected 오류가 나면 git pull 을 먼저 하고 다시 push 하세요.' },
    { t: 'GitHub에서 확인하기', d: '위쪽 가상 GitHub에서 <b>my-first-repo</b>의 Code 탭을 열어 study.txt가 올라왔는지 확인하세요!', on: 'nav', when: d => d.page === 'repo' && d.key === MY() && (d.tab || 'code') === 'code' && !d.sub, target: ['[data-t=tab-code]'], hint: '대시보드 → my-first-repo, 또는 상단 저장소 이름 클릭' },
  ] },
{ id: 'pull', ch: 'c5', icon: '⬇️', title: 'pull: 친구의 변경 받아오기', xp: 50, goal: '다른 사람이 GitHub에 올린 커밋을 내 컴퓨터로 가져와요.', setup: () => { M.unprotect(); M.ensureClone(); M.cdRepo(); M.openTerm(); const r = R(MY()); if (G.tree(r, r.def)['friend.txt'] === undefined) { G.commitTo(MY(), r.def, { 'friend.txt': 'dain-friend가 다녀감 👋\n같이 공부해요!\n' }, 'Add friend.txt', '', 'dain-friend', { force: true }); App.toast('🔔 dain-friend님이 my-first-repo에 새 커밋을 push 했어요!'); } },
  real: [DOC + 'get-started/using-git/getting-changes-from-a-remote-repository', '작업을 시작하기 전에 항상 git pull! 충돌을 줄이는 최고의 습관이에요.'],
  steps: [
    { t: '원격 소식 가져오기 (fetch)', d: `친구가 GitHub에 커밋을 올렸대요. ${code('git fetch')}로 GitHub의 최신 기록을 확인만 해 봐요.`, snip: [{ code: 'git fetch', kind: 'cmd' }], on: 'git:fetch', term: true },
    { t: '상태 보기', d: `${code('git status')}를 입력하면 "behind ... by 1 commit" 이라고 알려 줘요. 내가 1커밋 뒤처졌다는 뜻!`, snip: [{ code: 'git status', kind: 'cmd' }], on: 'git:status', term: true },
    { t: '가져와서 합치기 (pull)', d: `${code('git pull')} = fetch + merge 를 한 번에!`, snip: [{ code: 'git pull', kind: 'cmd' }], on: 'git:pull', term: true },
    { t: '친구의 파일 읽기', d: `${code('cat friend.txt')}로 친구가 쓴 파일을 읽어 보세요.`, snip: [{ code: 'cat friend.txt', kind: 'cmd' }], on: 'sh:cat', when: d => d.file === 'friend.txt', term: true },
  ] },
{ id: 'cli-branch', ch: 'c5', icon: '🔀', title: '터미널에서 브랜치 & 머지', xp: 70, goal: 'switch, merge, log 로 터미널에서 브랜치를 다뤄요.', setup: () => { M.unprotect(); M.ensureClone(); M.cdRepo(); M.openTerm(); }, real: ['https://git-scm.com/book/ko/v2', '무료 Pro Git 책(한국어)에 브랜치가 아주 잘 설명돼 있어요.'],
  steps: [
    { t: '브랜치 만들고 이동하기', d: `${code('git switch -c experiment')} = 브랜치를 만들고(-c) 바로 이동해요.`, snip: [{ code: 'git switch -c experiment', kind: 'cmd' }], on: 'git:switch', when: d => d.br === 'experiment', term: true },
    { t: '실험 브랜치에서 커밋', d: '파일을 만들고 add, commit 해요. (명령 칩을 순서대로!)', snip: [{ code: 'echo "실험 중 🧪" > lab.txt', kind: 'cmd' }, { code: 'git add lab.txt', kind: 'cmd' }, { code: 'git commit -m "Add lab note"', kind: 'cmd' }], on: 'git:commit', when: d => d.br === 'experiment', term: true },
    { t: 'main으로 돌아가기', d: `${code('git switch main')} 후 ${code('ls')} 해 보세요. lab.txt가 없죠?`, snip: [{ code: 'git switch main', kind: 'cmd' }, { code: 'ls', kind: 'cmd' }], on: 'git:switch', when: d => d.br === 'main', term: true },
    { t: '실험 결과 합치기', d: `${code('git merge experiment')}로 experiment 브랜치를 main에 합쳐요.`, snip: [{ code: 'git merge experiment', kind: 'cmd' }], on: 'git:merge', when: d => d.ref === 'experiment' && (d.ff || d.commit || d.upToDate), term: true },
    { t: '기록 한눈에 보기', d: `${code('git log --oneline')}으로 커밋 기록을 한 줄씩 봐요. HEAD -> main 이 무슨 뜻일까요?`, snip: [{ code: 'git log --oneline', kind: 'cmd' }], on: 'git:log', when: d => d.oneline, term: true },
    { t: 'GitHub에 올리기', d: `${code('git push')} 하고 위쪽 GitHub에서 lab.txt를 확인해요!`, snip: [{ code: 'git push', kind: 'cmd' }], on: 'git:push', when: d => d.key === MY(), term: true },
  ] },
{ id: 'cli-conflict', ch: 'c5', icon: '⚔️', title: '터미널에서 충돌 해결하기', xp: 80, badge: ['⚔️', '충돌 진압 특공대'], goal: '터미널에서 merge 충돌이 났을 때 침착하게 해결해요.',
  setup: () => {
    M.unprotect(); M.ensureClone(); M.cdRepo(); M.ensureConfig(); M.openTerm();
    const d = L().home['my-first-repo'], g = d.git;
    if (g.branches.colors || g.merging) return;
    if (g.HEAD !== 'main') { T.print('🐿️ main 브랜치로 이동(git switch main)한 뒤, 왼쪽 미션 지도에서 이 미션을 다시 눌러 주세요.', 'tip'); return; }
    const head = g.branches.main; const ht = G.treeOf(head);
    const dirty = G.dtree(ht, g.index).length || Object.keys(g.index).some(p => d.files[p] !== g.index[p]);
    if (dirty) { T.print('🐿️ 커밋하지 않은 변경이 있어요. git add . → git commit -m "save" 로 먼저 저장한 뒤, 왼쪽 미션 지도에서 이 미션을 다시 눌러 주세요.', 'tip'); return; }
    const a = G.mk({ ...ht, 'favorite.txt': '내가 좋아하는 색: ???\n' }, [head], 'Add favorite.txt', S().local.cfg.name);
    const b = G.mk({ ...ht, 'favorite.txt': '내가 좋아하는 색: 파란색 💙\n' }, [a], 'Favorite color is blue', 'dain-friend');
    const c = G.mk({ ...ht, 'favorite.txt': '내가 좋아하는 색: 빨간색 ❤️\n' }, [a], 'Favorite color is red', S().local.cfg.name);
    g.branches.colors = b; g.branches.main = c; g.index = { ...G.treeOf(c) }; Object.assign(d.files, G.treeOf(c));
    T.print('🐿️ 상황 준비 완료: main에서는 "빨간색", colors 브랜치에서는 "파란색"으로 같은 줄을 고쳤어요!', 'tip');
  }, real: [DOC + 'pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line', 'VS Code 같은 편집기는 충돌 부분에 "Accept Current / Incoming / Both" 버튼을 보여 줘서 더 쉬워요.'],
  steps: [
    { t: '충돌 일으키기', d: `${code('git merge colors')}를 입력해 보세요. 💥 CONFLICT!`, snip: [{ code: 'git merge colors', kind: 'cmd' }], on: 'git:merge', when: d => d.conflict, auto: () => !!L().home['my-first-repo']?.git.merging, term: true },
    { t: '충돌 파일 들여다보기', d: `${code('cat favorite.txt')}로 충돌 표시를 확인해요.<br><small>${code('<<<<<<< HEAD')} ~ ${code('=======')}: 지금 내 브랜치(main) 내용<br>${code('=======')} ~ ${code('>>>>>>> colors')}: 합치려는 브랜치 내용</small>`, snip: [{ code: 'cat favorite.txt', kind: 'cmd' }], on: 'sh:cat', when: d => d.file === 'favorite.txt', term: true },
    { t: '편집기로 고치기', d: `${code('edit favorite.txt')}로 편집기를 열고, 원하는 내용만 남기고 표시 3줄을 모두 지운 뒤 저장하세요.`, snip: [{ code: 'edit favorite.txt', kind: 'cmd' }, { label: '예시 (둘 다 좋아!)', code: '내가 좋아하는 색: 빨간색 ❤️ 그리고 파란색 💙', into: '#te-area' }], on: 'sh:write', when: d => d.file === 'favorite.txt' && !G.hasMarkers(d.content), term: true },
    { t: '해결했다고 알리기 (add)', d: `${code('git add favorite.txt')} = "이 파일 충돌 해결했어요!"`, snip: [{ code: 'git add favorite.txt', kind: 'cmd' }], on: 'git:add', when: d => d.files.includes('favorite.txt'), term: true },
    { t: '병합 커밋 완성', d: '커밋하면 병합이 끝나요. 끝나면 git push 로 올려도 좋아요!', snip: [{ code: 'git commit -m "Merge colors: keep both"', kind: 'cmd' }], on: 'git:commit', when: d => d.merge, term: true },
  ] },
{ id: 'restore-stash', ch: 'c5', icon: '⏪', title: '되돌리기(restore) & 임시 저장(stash)', xp: 60, goal: '실수한 변경을 되돌리고, 하던 일을 잠깐 서랍에 넣어 두는 법을 배워요.', setup: () => { M.unprotect(); M.ensureClone(); M.cdRepo(); M.openTerm(); }, real: ['https://git-scm.com/docs/git-restore', '되돌린 변경은 복구할 수 없으니 restore 전에 git diff 로 꼭 확인!'],
  steps: [
    { t: '실수로 파일 망치기', d: 'README.md에 이상한 내용을 덧붙여 봐요.', snip: [{ code: 'echo "앗 실수로 쓴 이상한 글 ㅋㅋㅋ" >> README.md', kind: 'cmd' }, { code: 'git diff', kind: 'cmd' }], on: 'sh:write', when: d => d.file === 'README.md', term: true },
    { t: '되돌리기', d: `${code('git restore README.md')}로 마지막 커밋 상태로 되돌리고 ${code('cat README.md')}로 확인해요.`, snip: [{ code: 'git restore README.md', kind: 'cmd' }, { code: 'cat README.md', kind: 'cmd' }], on: 'git:restore', when: d => !d.staged, term: true },
    { t: '하던 일을 서랍에 넣기 (stash)', d: '작업 중에 급한 일이 생겼어요! 수정한 뒤 stash로 잠시 치워 둬요.', snip: [{ code: 'echo "작업 중..." >> study.txt', kind: 'cmd' }, { code: 'git stash', kind: 'cmd' }, { code: 'git status', kind: 'cmd' }], on: 'git:stash', when: d => d.push, term: true, hint: 'study.txt가 없다면 README.md 등 다른 파일을 고쳐도 돼요.' },
    { t: '서랍에서 꺼내기 (stash pop)', d: `급한 일을 끝냈다면 ${code('git stash pop')}으로 하던 일을 다시 꺼내요.`, snip: [{ code: 'git stash pop', kind: 'cmd' }], on: 'git:stash', when: d => d.pop, term: true },
    Q('git add 로 스테이지에 올린 파일을 다시 내리고(unstage) 싶을 때는?', ['git delete --stage', 'git restore --staged 파일', 'git push --undo', 'git stash drop'], 1, 'git restore --staged 는 스테이지에서만 내리고 파일 내용은 그대로 둬요. --staged 없이 쓰면 작업 내용 자체를 되돌려요.'),
  ] },
{ id: 'gitignore', ch: 'c5', icon: '🙈', title: '.gitignore로 비밀 파일 숨기기', xp: 50, goal: '비밀번호, 임시 파일처럼 올리면 안 되는 파일을 Git이 무시하게 만들어요.', setup: () => { M.unprotect(); M.ensureClone(); M.cdRepo(); M.openTerm(); }, real: ['https://github.com/github/gitignore', 'github/gitignore 저장소에 언어별 .gitignore 템플릿이 모여 있어요.'],
  steps: [
    { t: '.gitignore 만들기', d: '무시할 파일 이름을 한 줄에 하나씩 써요. 패턴(*.log)도 돼요!', snip: [{ code: 'echo "secret.txt" > .gitignore', kind: 'cmd' }, { code: 'echo "*.log" >> .gitignore', kind: 'cmd' }], on: 'sh:write', when: d => d.file === '.gitignore' && /secret\.txt/.test(d.content), term: true },
    { t: '비밀 파일 만들기', d: '비밀번호가 든 파일을 만들어요. (연습용 가짜!)', snip: [{ code: 'echo "password=1234" > secret.txt', kind: 'cmd' }], on: 'sh:write', when: d => d.file === 'secret.txt', term: true },
    { t: 'Git이 무시하는지 확인', d: `${code('git status')}를 보세요. Untracked 목록에 <b>.gitignore</b>는 있지만 <b>secret.txt</b>는 없어요! 🙈`, snip: [{ code: 'git status', kind: 'cmd' }], on: 'git:status', when: d => (d.ignored || []).includes('secret.txt'), term: true },
    { t: '.gitignore 올리기', d: '.gitignore 파일 자체는 팀원 모두를 위해 커밋해서 올려요.', snip: [{ code: 'git add .', kind: 'cmd' }, { code: 'git commit -m "Add .gitignore"', kind: 'cmd' }, { code: 'git push', kind: 'cmd' }], on: 'git:push', when: d => d.key === MY() && (d.files || []).includes('.gitignore'), term: true },
  ] },
{ id: 'init-push', ch: 'c5', icon: '🏗️', title: 'init: 내 프로젝트를 GitHub에 처음 올리기', xp: 80, goal: '내 컴퓨터에서 시작한 프로젝트를 git init 하고 새 GitHub 저장소에 연결해요.', setup: () => { M.ensureConfig(); M.openTerm(); }, real: [DOC + 'migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github', 'GitHub에서 빈 저장소를 만들면 이 명령어들을 그대로 안내해 줘요.'],
  steps: [
    { t: '폴더 만들고 들어가기', d: '홈 폴더에서 새 프로젝트 폴더를 만들어요.', snip: [{ code: 'cd ~', kind: 'cmd' }, { code: 'mkdir my-diary', kind: 'cmd' }, { code: 'cd my-diary', kind: 'cmd' }], on: 'sh:cd', when: d => d.cwd === 'my-diary', term: true },
    { t: 'Git 저장소로 만들기 (init)', d: `${code('git init')} = "이 폴더를 지금부터 Git으로 관리할게!"`, snip: [{ code: 'git init', kind: 'cmd' }], on: 'git:init', when: d => d.name === 'my-diary', auto: () => !!L().home['my-diary']?.git, term: true },
    { t: '첫 커밋 하기', d: '일기 파일을 만들고 첫 커밋을 해요.', snip: [{ code: 'echo "# 나의 코딩 일기" > README.md', kind: 'cmd' }, { code: 'git add README.md', kind: 'cmd' }, { code: 'git commit -m "first commit"', kind: 'cmd' }], on: 'git:commit', when: () => L().cwd === 'my-diary', term: true },
    { t: 'GitHub에 빈 저장소 만들기', d: `위쪽 GitHub에서 <b>＋ → New repository</b>로 ${code('my-diary')}를 만드세요. 이번엔 <b>README 체크를 하지 마세요!</b> (빈 저장소여야 해요)`, snip: [{ label: '저장소 이름', code: 'my-diary', into: '#nr-name' }], on: 'repo:create', when: d => d.name === 'my-diary', auto: () => !!R(ME() + '/my-diary'), target: ['[data-t=create-repo]', '[data-t=nr-name]', '[data-t=new-repo]', '[data-t=plus]'], hint: 'README를 체크했다면 push 전에 git pull origin main 을 한 번 해 주세요.' },
    { t: '원격 저장소 연결하기', d: '내 폴더에게 GitHub 주소를 "origin"이라는 별명으로 알려 줘요.', snip: [{ code: () => `git remote add origin https://github.com/${ME()}/my-diary.git`, kind: 'cmd' }], on: 'git:remote', when: d => d.add === 'origin', term: true },
    { t: '처음 올리기', d: `처음 push 할 때는 ${code('-u origin main')}을 붙여요. -u 덕분에 다음부턴 ${code('git push')}만 쓰면 돼요!`, snip: [{ code: 'git push -u origin main', kind: 'cmd' }], on: 'git:push', when: d => d.key === ME() + '/my-diary', term: true },
  ] },

/* ================= 6. 릴리스 · 배포 · 자동화 ================= */
{ id: 'release', go: goMy, ch: 'c6', icon: '🏷', title: '태그와 릴리스 발표하기', xp: 50, badge: ['🏷', '버전 1.0'], goal: '"v1.0.0 완성!" 처럼 특정 시점을 공식 버전으로 발표해요.', setup: () => M.ensureRepo(), real: [DOC + 'repositories/releasing-projects-on-github', '앱·게임을 배포할 때 릴리스에 설치 파일(Assets)을 첨부해요.'],
  steps: [
    { t: '릴리스 만들기 화면', d: 'Code 탭 오른쪽 <b>Releases</b> 아래 <b>Create a new release</b>를 누르세요.', on: 'nav', when: d => d.sub === 'release-new', target: ['[data-t=create-release]', '[data-t=draft-release]', '[data-t=releases-link]', '[data-t=tab-code]'] },
    { t: '릴리스 발표하기', d: `태그 ${code('v1.0.0')}, 제목을 쓰고 <b>✨ Generate release notes</b>로 노트를 자동 생성한 뒤 <b>Publish release</b>!`, snip: [{ label: '태그', code: 'v1.0.0', into: '#rl-tag' }, { label: '제목', code: '첫 번째 정식 버전 🎉', into: '#rl-title' }], on: 'release:create', target: ['[data-t=publish-release]', '[data-t=gen-notes]', '[data-t=rl-tag]'] },
    Q('버그만 고친 작은 업데이트예요. v1.2.3 다음 버전으로 가장 알맞은 것은? (Semantic Versioning)', ['v2.0.0', 'v1.3.0', 'v1.2.4', 'v1.2.3.1'], 2, '주.부.수(MAJOR.MINOR.PATCH): 큰 변화는 주 버전, 기능 추가는 부 버전, 버그 수정은 수 버전을 올려요.'),
  ] },
{ id: 'pages', go: goMy, ch: 'c6', icon: '🚀', title: 'GitHub Pages로 웹사이트 배포', xp: 80, badge: ['🚀', '웹사이트 주인'], goal: '저장소의 HTML을 전 세계 누구나 볼 수 있는 웹사이트로 무료 배포해요.', setup: () => M.ensureRepo(), real: [DOC + 'pages', '실제 주소는 https://아이디.github.io/저장소이름/ 이에요. 이 연습장도 GitHub Pages로 올라가 있어요!'],
  steps: [
    { t: 'index.html 만들기', d: `my-first-repo에 ${code('index.html')} 파일을 만들어 커밋하세요. (웹사이트의 첫 화면이 돼요)`, snip: [{ label: '파일 이름', code: 'index.html', into: '#ed-path' }, { label: 'HTML 예시', code: () => `<!DOCTYPE html>\n<html lang="ko">\n<head>\n  <meta charset="UTF-8">\n  <title>${S().name}의 홈페이지</title>\n  <style>\n    body { font-family: sans-serif; text-align: center; background: linear-gradient(135deg,#a8edea,#fed6e3); min-height: 100vh; margin: 0; padding-top: 80px; }\n    h1 { font-size: 3em; }\n    .card { background: white; display: inline-block; padding: 24px 40px; border-radius: 20px; box-shadow: 0 8px 24px #0002; }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <h1>🌱 안녕하세요!</h1>\n    <p>GitHub Pages로 만든 <b>${S().name}</b>의 첫 웹사이트예요.</p>\n    <button onclick="this.textContent='🎉 반가워요!'">눌러 보세요</button>\n  </div>\n</body>\n</html>`, into: '#ed-content' }], on: ['commit', 'git:push'], when: () => tree(MY())['index.html'] !== undefined, auto: () => tree(MY())['index.html'] !== undefined, target: ['[data-t=cm-commit]', '[data-t=commit-btn]', '[data-t=create-file]', '[data-t=add-file]'] },
    { t: 'Pages 켜기', d: '<b>Settings → 🌐 Pages</b>에서 Branch를 <b>main</b>으로 고르고 <b>Save</b>를 누르세요.', on: 'pages:enable', when: d => d.key === MY(), target: ['[data-t=pg-save]', '[data-t=pg-br]', '[data-t=set-pages]', '[data-t=tab-settings]'] },
    { t: '배포 기다리기 ⏳', d: 'GitHub가 사이트를 만들고 있어요. <b>Actions</b> 탭에 가면 "pages build and deployment" 로봇이 일하는 모습을 볼 수 있어요!', on: 'pages:built', auto: () => R(MY())?.pages?.status === 'built', target: ['[data-t=tab-actions]'] },
    { t: '내 웹사이트 방문하기', d: '<b>Settings → Pages</b>의 <b>Visit site</b> 버튼(또는 Code 탭 About의 링크)을 눌러 보세요! 🌐', on: 'pages:visit', target: ['[data-t=visit-site]', '[data-t=set-pages]', '[data-t=tab-settings]'] },
  ] },
{ id: 'actions', go: goMy, ch: 'c6', icon: '🤖', title: 'GitHub Actions 자동화 로봇', xp: 90, badge: ['🤖', '자동화 장인'], goal: 'push 할 때마다 로봇이 자동으로 일하는 워크플로를 만들고, 실패도 체험해요.', setup: () => M.ensureRepo(), real: [DOC + 'actions', 'Marketplace에 수만 개의 Action이 있어요. 테스트, 배포, 알림 보내기 등을 자동화할 수 있어요.'],
  steps: [
    { t: '워크플로 템플릿 고르기', d: '<b>Actions</b> 탭에서 <b>Simple workflow</b>(또는 Greeting)의 <b>Configure</b>를 누르세요.', on: 'wf:config', target: ['[data-t=wf-simple]', '[data-t=new-workflow]', '[data-t=tab-actions]'] },
    { t: '워크플로 파일 커밋하기', d: `${code('.github/workflows/')} 폴더에 YAML 파일이 준비됐어요. 내용을 훑어보고 <b>Commit changes</b>로 main에 커밋하세요.<p class="small muted"><b>on</b> = 언제 실행? · <b>jobs</b> = 할 일 묶음 · <b>steps</b> = 순서대로 할 일 · <b>run</b> = 실행할 명령</p>`, on: 'commit', when: d => /^\.github\/workflows\//.test(d.path || ''), target: ['[data-t=cm-commit]', '[data-t=commit-btn]'] },
    { t: '로봇이 일하는 모습 보기', d: '<b>Actions</b> 탭에서 실행 기록(run)을 클릭하고 단계별 로그를 펼쳐 보세요. 노란 ●가 초록 ✔으로 바뀌는 걸 지켜봐요!', on: 'run:view', target: ['[data-t=run-item]', '[data-t=tab-actions]'] },
    { t: '일부러 실패시켜 보기 💥', d: `워크플로 파일(${code('.github/workflows/...yml')})을 ✏️ 편집해서 마지막 줄에 ${code('exit 1')} 명령을 넣고 커밋하세요. 실패(✖)하는 걸 확인해요.`, snip: [{ label: '맨 아래에 추가할 단계', code: '      - name: 일부러 실패하기\n        run: exit 1' }], on: 'run:done', when: d => d.run.concl === 'failure' && !d.run.pages, target: ['[data-t=edit-file]', '[data-t=run-item]'], hint: 'Code 탭 → .github → workflows → 파일 → ✏️. 들여쓰기(띄어쓰기)를 위 steps와 맞춰야 해요!' },
    { t: '고쳐서 다시 성공시키기 ✔', d: `로그에서 실패 원인을 찾았나요? ${code('exit 1')} 단계를 지우고 다시 커밋해서 초록 ✔을 받아요!`, on: 'run:done', when: d => d.run.concl === 'success' && !d.run.pages, target: ['[data-t=edit-file]', '[data-t=run-item]'] },
  ] },

/* ================= 7. 더 많은 기능 ================= */
{ id: 'wiki-disc', go: goMy, ch: 'c7', icon: '📖', title: 'Wiki와 Discussions', xp: 70, goal: '긴 문서는 Wiki에, 질문과 아이디어는 Discussions 게시판에!', setup: () => M.ensureRepo(), real: [DOC + 'discussions', '큰 오픈소스 프로젝트들은 Discussions에서 사용자 질문을 받아요.'],
  steps: [
    { t: '위키 첫 페이지 만들기', d: '<b>📖 Wiki</b> 탭 → <b>Create the first page</b> → <b>Save page</b>.', on: 'wiki:create', target: ['[data-t=save-wiki]', '[data-t=create-wiki]', '[data-t=new-wiki]', '[data-t=tab-wiki]'] },
    { t: 'Discussions 켜기', d: 'Discussions는 기본으로 꺼져 있어요. <b>⚙️ Settings → General → Features</b>에서 <b>Discussions</b>를 체크하세요.', on: 'feature:toggle', when: d => d.f === 'discussions' && d.on, auto: () => R(MY())?.features.discussions, target: ['[data-t=feat-discussions]', '[data-t=set-general]', '[data-t=tab-settings]'] },
    { t: '질문 올리기', d: '<b>💬 Discussions</b> 탭 → <b>New discussion</b> → 카테고리 <b>🙏 Q&amp;A</b> → 질문 작성 → <b>Start discussion</b>.', snip: [{ label: '질문 제목', code: '브랜치는 언제 만들어야 하나요?', into: '#ds-title' }], on: 'disc:create', when: d => d.cat === 'Q&A', target: ['[data-t=start-disc]', '[data-t="cat-Q&A"]', '[data-t=new-disc]', '[data-t=tab-discussions]'] },
    { t: '답변 기다리기 ⏳', d: '친구가 답변을 쓰고 있어요…', on: 'disc:reply', auto: () => R(MY())?.discs.some(d => d.cat === 'Q&A' && d.comments.some(c => c.a === 'dain-friend')), target: [] },
    { t: '답변 채택하기', d: '도움이 된 답변에 <b>✓ Mark as answer</b>를 눌러요. 다른 사람들도 정답을 쉽게 찾을 수 있어요!', on: 'disc:answer', target: ['[data-t=mark-answer]'] },
  ] },
{ id: 'security', go: goMy, ch: 'c7', icon: '🔐', title: '보안 기능 체험', xp: 90, badge: ['🔐', '보안 지킴이'], goal: '비밀 토큰 유출 차단, 안전한 비밀 보관, 취약한 라이브러리 자동 업데이트를 경험해요.', setup: () => M.ensureRepo(), real: [DOC + 'code-security', '진짜 토큰이 유출됐다면 GitHub Settings → Developer settings 에서 즉시 폐기(revoke)하세요!'],
  steps: [
    { t: '비밀 토큰을 커밋해 보기 (일부러!)', d: () => `새 파일 ${code('config.txt')}에 아래 <b>가짜</b> 토큰을 넣고 커밋해 보세요. GitHub가 막아 줄 거예요!<br><code class="small">${G.FAKE_TOKEN}</code>`, snip: [{ label: '파일 이름', code: 'config.txt', into: '#ed-path' }, { label: '가짜 토큰', code: () => 'TOKEN=' + G.FAKE_TOKEN, into: '#ed-content' }], on: 'secret:blocked', target: ['[data-t=cm-commit]', '[data-t=commit-btn]', '[data-t=create-file]', '[data-t=add-file]'] },
    { t: '비밀은 Secrets에 보관하기', d: '<b>Settings → 🔐 Secrets and variables → New repository secret</b>에서 이름 <b>MY_TOKEN</b>으로 저장하세요. 저장한 값은 아무도(나도!) 다시 볼 수 없어요.', snip: [{ label: '이름', code: 'MY_TOKEN', into: '#sc-name' }], on: 'secret:add', target: ['[data-t=add-secret]', '[data-t=new-secret]', '[data-t=set-secrets]', '[data-t=tab-settings]'] },
    { t: '오래된 라이브러리 쓰기', d: `${code('package.json')} 파일을 만들어 커밋하세요. 일부러 <b>취약점이 있는 옛날 버전</b> lodash를 써요.`, snip: [{ label: '파일 이름', code: 'package.json', into: '#ed-path' }, { label: '내용', code: '{\n  "name": "my-first-repo",\n  "version": "1.0.0",\n  "dependencies": {\n    "lodash": "4.17.15"\n  }\n}', into: '#ed-content' }], on: 'alert:new', auto: () => R(MY())?.alerts.some(a => a.state === 'open'), target: ['[data-t=cm-commit]', '[data-t=commit-btn]', '[data-t=create-file]', '[data-t=add-file]'] },
    { t: 'Dependabot 경고 확인', d: '<b>🛡️ Security</b> 탭 → <b>View Dependabot alerts</b> → 경고를 클릭해 내용을 읽어요.', on: 'alert:view', target: ['[data-t=alert-item]', '[data-t=dep-alerts]', '[data-t=tab-security]'] },
    { t: '로봇에게 고쳐 달라고 하기', d: '<b>🤖 Create Dependabot security update</b>를 누르세요. 안전한 버전으로 올리는 PR이 자동으로 만들어져요!', on: 'dependabot:pr', target: ['[data-t=dep-create-pr]'] },
    { t: 'Dependabot PR 머지하기', d: '만들어진 PR을 열고 머지하세요. 경고가 해결돼요 ✅', on: 'pr:merge', when: d => d.author === 'dependabot[bot]', target: ['[data-t=confirm-merge]', '[data-t=merge-btn]', '[data-t=dep-pr-link]'] },
    { t: '보안 정책 만들기', d: '<b>Security</b> 탭 → Security policy <b>Start setup</b> → <b>SECURITY.md</b>를 커밋하세요.', on: 'commit', when: d => d.path === 'SECURITY.md', target: ['[data-t=cm-commit]', '[data-t=commit-btn]', '[data-t=sec-policy]', '[data-t=tab-security]'] },
  ] },
{ id: 'gist-profile', ch: 'c7', icon: '✨', title: 'Gist와 나만의 프로필 꾸미기', xp: 70, badge: ['✨', '프로필 장인'], goal: '짧은 메모를 Gist로 공유하고, 특별한 저장소로 프로필을 꾸며요.', real: ['https://gist.github.com', '프로필 README에 GitHub 통계 카드, 기술 배지 등을 넣는 것이 유행이에요.'],
  steps: [
    { t: 'Gist 만들기', d: '상단 <b>＋ ▾ → New gist</b>에서 파일 이름과 내용을 쓰고 <b>Create public gist</b>.', snip: [{ label: '파일 이름', code: 'git-cheatsheet.md', into: '#gs-name' }, { label: '내용', code: '# 나의 Git 치트시트\n- git status : 상태 보기\n- git add . : 모두 스테이지\n- git commit -m "msg" : 커밋\n- git push : 올리기\n- git pull : 받기', into: '#gs-content' }], on: 'gist:create', target: ['[data-t=gist-public]', '[data-t=new-gist]', '[data-t=plus]'] },
    { t: '특별한 저장소 만들기', d: () => `내 아이디와 똑같은 이름 ${code(ME())}으로 새 저장소를 만드세요. (Public + README 체크) ✨ 특별 메시지가 나타나요!`, snip: [{ label: '저장소 이름', code: () => ME(), into: '#nr-name' }], on: 'repo:create', when: d => d.name.toLowerCase() === ME().toLowerCase(), auto: () => !!R(ME() + '/' + ME()), target: ['[data-t=create-repo]', '[data-t=nr-name]', '[data-t=new-repo]', '[data-t=plus]'] },
    { t: '프로필 README 꾸미기', d: '그 저장소의 README.md를 ✏️ 편집해서 자기소개를 쓰고 커밋하세요.', snip: [{ label: '자기소개 예시', code: () => `# 안녕하세요, ${S().name}입니다 👋\n\n- 🌱 지금 **Git과 GitHub**를 배우고 있어요\n- 💬 좋아하는 것: 코딩, 음악, 게임\n- 🎯 올해 목표: 나만의 웹사이트 만들기\n\n> 꾸준히 잔디 심는 중 🌿\n`, into: '#ed-content' }], on: 'commit', when: d => d.key === ME() + '/' + ME() && d.path === 'README.md', target: ['[data-t=cm-commit]', '[data-t=commit-btn]', '[data-t=edit-readme]'] },
    { t: '내 프로필 확인하기', d: '아바타 → <b>Your profile</b>로 가서 꾸며진 프로필과 잔디를 감상하세요! 🌿', on: 'nav', when: d => d.page === 'profile' && (!d.user || d.user === ME()), target: ['[data-t=your-profile]', '[data-t=avatar]'] },
  ] },
{ id: 'codespaces', go: goMy, ch: 'c7', icon: '☁️', title: 'Codespaces와 더 넓은 GitHub', xp: 60, goal: '브라우저 속 코딩 환경 Codespaces를 체험하고 Copilot 등 다른 도구들을 알아봐요.', setup: () => M.ensureRepo(), real: [DOC + 'codespaces', '학생은 GitHub Education을 통해 Copilot과 Codespaces 사용 시간을 무료로 받을 수 있어요.'],
  steps: [
    { t: '코드스페이스 열기', d: '저장소 Code 탭의 <b>&lt;&gt; Code ▾</b> → <b>Codespaces</b> 탭 → <b>Create codespace on main</b>.', on: 'codespace:open', target: ['[data-t=cs-create]', '[data-t=cs-tab]', '[data-t=code-btn]'] },
    { t: '클라우드에서 고치고 커밋하기', d: '왼쪽 EXPLORER에서 파일을 골라 내용을 고치고, SOURCE CONTROL에 메시지를 쓴 뒤 <b>✓ Commit &amp; Push</b>를 누르세요.', snip: [{ label: '커밋 메시지', code: 'Edit in Codespaces', into: '#cs-msg' }], on: 'codespace:commit', target: ['[data-t=cs-commit]', '[data-t=cs-area]'] },
    { concept: true, t: 'GitHub 도구 상자 🧰', d: '<ul><li>🤖 <b>GitHub Copilot</b>: AI가 코드를 추천해 주는 짝꿍 프로그래머</li><li>🖥️ <b>GitHub Desktop</b>: 명령어 없이 버튼으로 Git을 쓰는 프로그램</li><li>⌨️ <b>GitHub CLI (gh)</b>: 터미널에서 PR·이슈를 다루는 공식 도구</li><li>📱 <b>GitHub Mobile</b>: 폰으로 알림 확인, 리뷰, 머지</li><li>🛒 <b>Marketplace</b>: Actions와 앱을 찾는 장터</li><li>💖 <b>Sponsors</b>: 좋아하는 오픈소스 개발자를 후원</li><li>🎓 <b>GitHub Education</b>: 학생·선생님 무료 혜택</li></ul>' },
    Q('설치 없이 웹 브라우저에서 바로 VS Code 같은 개발 환경을 열어 주는 GitHub 기능은?', ['GitHub Pages', 'Codespaces', 'Gist', 'Wiki'], 1, 'Codespaces는 클라우드 컴퓨터 위에 개발 환경을 만들어 줘요. Pages는 웹사이트 배포, Gist는 코드 조각 공유예요.'),
  ] },

/* ================= 8. 졸업 ================= */
{ id: 'exam', ch: 'c8', icon: '🎓', title: '졸업 시험', xp: 150, badge: ['🎓', 'GitHub 졸업생'], goal: '10문제를 풀고 수료증을 받아요!', real: ['https://skills.github.com', 'GitHub Skills에서 실제 저장소로 더 많은 무료 실습 과정을 해 볼 수 있어요.'],
  steps: [
    Q('1/10 · 다음 중 내 컴퓨터의 변경을 GitHub로 보내는 명령은?', ['git pull', 'git push', 'git clone', 'git fetch'], 1, 'push = 밀어 올리기 ⬆️, pull = 당겨 받기 ⬇️'),
    Q('2/10 · git add 를 하면 파일이 어디로 가나요?', ['GitHub', '스테이지(Staging area)', '휴지통', '다른 브랜치'], 1, 'add는 "다음 커밋에 넣을 것"을 스테이지에 올리는 단계예요.'),
    Q('3/10 · 남의 저장소를 내 GitHub 계정으로 복사하는 기능은?', ['Clone', 'Fork', 'Star', 'Branch'], 1, 'Fork는 GitHub 안에서 내 계정으로 복사, Clone은 내 컴퓨터로 복사예요.'),
    Q('4/10 · 브랜치 작업을 main에 합쳐 달라고 요청하는 것은?', ['Issue', 'Pull Request', 'Release', 'Gist'], 1, 'Pull Request = "내 변경을 당겨 가 주세요(pull)" 요청이에요.'),
    Q('5/10 · 충돌 표시 중 "합치려는 다른 브랜치 내용"의 끝을 알리는 줄은?', ['<<<<<<<', '=======', '>>>>>>>', '#######'], 2, '<<<<<<< 내 쪽 시작 · ======= 구분선 · >>>>>>> 상대 쪽 끝'),
    Q('6/10 · 비밀번호 파일을 Git이 무시하도록 하려면 어디에 적나요?', ['README.md', '.gitignore', 'LICENSE', 'SECURITY.md'], 1, '.gitignore에 적힌 파일은 git status에도 안 나오고 add도 안 돼요.'),
    Q('7/10 · push 할 때마다 자동으로 테스트를 돌려 주는 기능은?', ['GitHub Pages', 'GitHub Actions', 'Projects', 'Wiki'], 1, 'Actions는 .github/workflows의 YAML 파일대로 자동으로 일해요.'),
    Q('8/10 · 커밋 메시지에 "Fixes #12"를 쓰고 main에 올리면?', ['커밋이 실패한다', '이슈 #12가 자동으로 닫힌다', '12번째 커밋이 삭제된다', 'PR #12가 머지된다'], 1, '키워드(close/fix/resolve) + #번호 = 자동으로 이슈 닫기!'),
    Q('9/10 · GitHub에 있는 다른 사람의 새 커밋을 받아 내 작업에 합치는 명령은?', ['git push', 'git pull', 'git init', 'git stash'], 1, 'pull = fetch(가져오기) + merge(합치기)'),
    Q('10/10 · main 브랜치에 아무도 바로 push 못 하고 PR+리뷰를 거치게 하는 설정은?', ['Branch protection rule', 'Watch', 'Fork', 'Gist'], 0, 'Settings → Branches의 보호 규칙으로 중요한 브랜치를 지켜요.'),
  ] },
];

M.byId = id => M.list.find(m => m.id === id);
M.index = id => M.list.findIndex(m => m.id === id);
})();
