# ExamBoard

대학 시험용 타이머 및 공지사항 표시 시스템

## Features

- 실시간 시계 및 타이머 (대형 화면 최적화)
- 시험 정보 표시 (시험 시간, 중도퇴실 가능 시간)
- 공지사항 (안내, 주의, 문제 정정)
- 프리셋 저장/불러오기
- Firebase Firestore 실시간 동기화
- 관리자 인증 (Google 로그인 / 비밀번호)

## Tech Stack

- Next.js 16
- Tailwind CSS v4
- shadcn/ui
- Firebase (Firestore, Authentication)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Firebase Console 설정

1. [Firebase Console](https://console.firebase.google.com)에서 프로젝트 생성
2. Firestore Database 생성
3. Authentication > Sign-in method > Google 활성화

### 3. Run development server

```bash
npm run dev
```

## Pages

- `/` - 메인 화면 (시계, 타이머, 공지사항)
- `/admin` - 관리자 페이지 (시험 설정, 공지사항 관리)

## Firestore Structure

```
exams/current          - 현재 시험 정보
announcements/{id}     - 공지사항
presets/{id}           - 프리셋
admins/{email}         - 관리자 목록
app/settings           - 앱 설정 (관리자 비밀번호)
```
