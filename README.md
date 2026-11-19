# 🐿️ 깃토리의 GitHub 연습장

**가상 GitHub 화면과 터미널에서 미션을 하나씩 따라 하며 GitHub의 거의 모든 기능을 직접 체험하는 인터랙티브 학습 사이트**예요.
진짜 GitHub처럼 생겼지만 브라우저 안에서만 돌아가는 시뮬레이터라서, 마음껏 눌러 보고 실수해도 괜찮아요.

👉 **사이트 열기:** https://yalli2.github.io/github_practice/

## 무엇을 배우나요? (9개 장 · 33개 미션)

| 장 | 미션 |
|---|---|
| 0. 시작하기 | Git과 GitHub의 차이, 연습장 사용법, 프로필 |
| 1. 저장소와 커밋 | 저장소 만들기 · 새 파일과 커밋 · 수정/업로드/삭제 · README 마크다운 |
| 2. 브랜치와 Pull Request | 브랜치 · PR 열기와 줄 단위 코드 리뷰 · 리뷰 요청과 머지(merge/squash/rebase) · 머지 충돌 해결 |
| 3. 이슈와 프로젝트 관리 | 이슈 · 라벨/담당자/반응/체크리스트 · `Fixes #번호`로 자동 닫기 · 마일스톤 · Projects 칸반 보드 |
| 4. 협업과 오픈소스 | Explore · Star · Watch · Fork → PR로 오픈소스 기여 → Sync fork · 공동작업자 초대 · 브랜치 보호 규칙 |
| 5. 터미널로 Git 다루기 | `git config` · `clone` · `status/add/commit/push` · `fetch/pull` · `switch/merge/log` · 터미널 충돌 해결 · `restore/stash` · `.gitignore` · `init → remote add → push -u` |
| 6. 릴리스 · 배포 · 자동화 | 태그와 릴리스(자동 릴리스 노트) · GitHub Pages 배포 · GitHub Actions 워크플로(성공/실패 체험) |
| 7. 더 많은 기능 | Wiki · Discussions(답변 채택) · Push Protection · Secrets · Dependabot · SECURITY.md · Gist · 프로필 README · Codespaces |
| 8. 졸업 | 졸업 시험 10문제 + 인쇄 가능한 수료증 |

## 이런 점이 재미있어요

- 🎯 **단계별 미션 카드**: 해야 할 일을 하면 자동으로 다음 단계로 넘어가요.
- 👀 **위치 보기 / 💡 힌트**: 눌러야 할 버튼이 반짝여요.
- ↘ **입력칸에 넣기 / ⌨ 터미널에 입력**: 예시를 버튼 하나로 넣을 수 있어요.
- 🤖 **살아 있는 가상 친구들**: 리뷰어가 PR을 승인하고, 오픈소스 메인테이너가 PR을 머지하고, 친구가 커밋을 push 해요.
- 🌱 **XP · 레벨 · 배지 18종 · 잔디 심기 · 수료증**
- 💾 진행 상황은 브라우저(localStorage)에 자동 저장돼요.

## 구조

```
index.html
css/style.css
js/engine.js     # 가상 Git/GitHub 엔진 (커밋 그래프, 3-way 병합, PR, Actions, Pages, Dependabot…)
js/terminal.js   # 가상 터미널과 로컬 Git 명령어
js/views.js      # 가상 GitHub 화면 (코드, 커밋, 브랜치, PR, 이슈)
js/views2.js     # 가상 GitHub 화면 (Actions, Projects, Wiki, Discussions, Security, Settings, 프로필, Gist, Codespaces)
js/missions.js   # 미션·퀴즈 정의
js/app.js        # 미션 진행, 가이드 카드, 배지, 수료증
```

빌드 과정 없이 정적 파일만으로 동작해요. GitHub Pages에서 `main` 브랜치 / `(root)`로 배포하면 돼요.

> 이 사이트는 GitHub 화면을 단순화해 흉내 낸 **교육용 시뮬레이터**이며 GitHub, Inc.와 관련이 없어요. 실제 GitHub 계정에는 아무 영향도 주지 않아요.

© 다인에듀 · 후안샘
