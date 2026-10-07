# 펫푸드랩 (PetFoodLab) — linkoo.co.kr

반려동물 사료·간식 성분표를 한 포맷으로 정리하고, 성분 사전·가이드·보호자 리뷰를 제공하는 사이트.
구글 애드센스 승인을 목표로 설계되었습니다 (공개 SSR 페이지, 얇은 페이지 자동 noindex, 필수 정책 페이지, 구조화 데이터, sitemap).

## 기술 스택
- Next.js 16 (App Router, 서버 렌더링, standalone 출력)
- SQLite (better-sqlite3) + Drizzle ORM — 별도 DB 서버 불필요, 파일 하나
- Tailwind CSS 4
- Docker / docker-compose

## 로컬 실행
```bash
cp .env.example .env     # ADMIN_PASSWORD, ADMIN_SESSION_SECRET 반드시 변경
npm install
npm run seed             # 샘플 데이터 (성분 20개, 제품 3개, 가이드 2개)
npm run dev              # http://localhost:3000
```
관리자: http://localhost:3000/admin (비밀번호 = .env의 ADMIN_PASSWORD)

## AWS 서버 배포 (Docker)
```bash
cp .env.example .env && nano .env        # 비밀번호·시크릿·도메인 설정
docker compose up -d --build
```
- DB 파일은 `./data/petfoodlab.db` 에 저장되며 컨테이너를 재빌드해도 유지됩니다. **이 폴더만 백업하면 됩니다.**
- 첫 실행 시 테이블은 자동 생성됩니다 (`drizzle/` 마이그레이션 자동 적용).
- 샘플 데이터를 서버에도 넣으려면 로컬에서 `npm run seed` 후 `data/` 폴더를 서버에 올리세요.
- Nginx 등 리버스 프록시로 `linkoo.co.kr → 127.0.0.1:3000` 연결하고 HTTPS(Let's Encrypt)를 붙이세요.

Nginx 예시:
```nginx
server {
  server_name linkoo.co.kr www.linkoo.co.kr;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## 운영 흐름
1. **브랜드** 등록 → **제품** 추가: 라벨 원료 원문을 쉼표 그대로 붙여넣고 보장성분 입력. 저장하면 성분 사전과 자동 매칭.
2. 사전에 없는 원료는 **미공개 성분으로 자동 생성** → 관리자 > 성분 > "미작성만" 에서 해설 작성 후 공개.
3. 성분에 동의어(aliases)를 추가했으면 "전체 제품 재매칭" 한 번.
4. **가이드** 작성 (마크다운). 목표: 1,000자 이상 25편.
5. 대시보드의 **애드센스 체크리스트**가 채워지면 신청. 승인 후 `.env`에 `NEXT_PUBLIC_ADSENSE_CLIENT`와 슬롯 ID 입력 → 재시작.

## 애드센스 관련 설계
- 제품 해설 600자 미만 / 성분 본문 600자 미만 → noindex + sitemap 제외 (자동)
- 비교 페이지, 관리자, 정책 페이지는 noindex
- Product / Article / DefinedTerm / BreadcrumbList / WebSite 구조화 데이터
- 광고 코드는 `NEXT_PUBLIC_ADSENSE_CLIENT`가 비어 있으면 전혀 출력되지 않음 (승인 전 안전)
- 리뷰는 검수(pending → approved) 후에만 노출

## 스크립트
| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build && npm start` | 프로덕션 빌드·실행 |
| `npm run seed` | 샘플 데이터 (여러 번 실행해도 중복 안 됨) |
| `npm run db:generate` | 스키마 변경 후 마이그레이션 생성 |
| `npm run typecheck` | 타입 검사 |

## 폴더 구조
```
src/app/            페이지 (products, ingredients, guides, compare, admin, 정책 페이지)
src/app/admin/      관리자 (로그인, 대시보드, CRUD) — actions.ts에 서버 액션
src/components/     UI 컴포넌트
src/db/             Drizzle 스키마·연결
src/lib/            쿼리, 원료 파서/매칭, 인증, 유틸, 사이트 설정
scripts/seed.ts     샘플 데이터
drizzle/            SQL 마이그레이션 (자동 적용)
data/               SQLite DB 파일 (git 제외)
```
