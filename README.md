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

---

## Setup Guide

### 1. 프로젝트 클론

```bash
git clone https://github.com/YOUR_USERNAME/ExamBoard.git
cd ExamBoard
npm install
```

### 2. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com) 접속
2. **프로젝트 추가** 클릭
3. 프로젝트 이름 입력 후 생성

### 3. Firebase 웹 앱 등록

1. 프로젝트 개요 > **웹 앱 추가** (</> 아이콘)
2. 앱 닉네임 입력 후 등록
3. Firebase 구성 값 복사 (나중에 사용)

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};
```

### 4. Firestore Database 생성

1. 좌측 메뉴 **Firestore Database** 클릭
2. **데이터베이스 만들기** 클릭
3. 위치 선택 (asia-northeast3 - 서울 권장)
4. **테스트 모드**로 시작 (나중에 보안 규칙 설정)

### 5. Authentication 설정

1. 좌측 메뉴 **Authentication** 클릭
2. **시작하기** 클릭
3. **Sign-in method** 탭에서:
   - **Google** 활성화 → 프로젝트 지원 이메일 선택 → 저장
   - **익명** 활성화 → 저장

### 6. 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일에 Firebase 구성 값 입력:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 7. Firestore 보안 규칙 설정

Firebase Console > Firestore Database > **Rules** 탭에서 아래 규칙 적용:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null &&
             request.auth.token.email != null &&
             exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }

    function isAuthenticated() {
      return request.auth != null;
    }

    match /exams/{document=**} {
      allow read: if true;
      allow write: if isAuthenticated();
    }

    match /announcements/{document=**} {
      allow read: if true;
      allow write: if isAuthenticated();
    }

    match /presets/{document=**} {
      allow read: if true;
      allow write: if isAuthenticated();
    }

    match /admins/{email} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                       request.auth.token.email != null &&
                       request.auth.token.email == email;
      allow update, delete: if isAdmin();
    }

    match /app/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

**Publish** 클릭하여 저장

### 8. 로컬 실행

```bash
npm run dev
```

http://localhost:3000 접속

---

## Vercel 배포

### 1. Vercel에 프로젝트 연결

1. [Vercel](https://vercel.com) 로그인
2. **Add New Project** → GitHub 저장소 선택
3. **Import**

### 2. 환경변수 설정

Vercel 프로젝트 > **Settings** > **Environment Variables**에서 추가:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | your_api_key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | your_project.firebaseapp.com |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | your_project_id |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | your_project.appspot.com |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | your_sender_id |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | your_app_id |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | your_measurement_id |

### 3. 승인된 도메인 추가

Firebase Console > Authentication > **Settings** > **승인된 도메인**에서:
- `your-app.vercel.app` 추가

### 4. 배포

Vercel에서 **Deploy** 또는 GitHub push 시 자동 배포

---

## 사용 방법

### 첫 실행

1. `/admin` 페이지 접속
2. **Google 계정으로 로그인** (첫 로그인 시 자동으로 관리자 등록)
3. 설정 버튼(⚙️)에서 **관리자 비밀번호** 설정

### 관리자 인증

| 방식 | 설명 | 권한 |
|------|------|------|
| Google 로그인 | 관리자로 등록된 계정만 | 모든 기능 |
| 비밀번호 | 간편 접속용 | 시험/공지 관리만 |

### 시험 설정

1. `/admin` 접속 후 인증
2. 시험명, 과목, 시간 설정
3. **저장** 클릭
4. 메인 화면(`/`)에서 실시간 반영

### 프리셋

자주 사용하는 시험 설정을 저장:
1. 시험 정보 입력
2. 프리셋 이름 입력 후 **현재 설정 저장**
3. 다음에 프리셋 클릭하면 자동 입력

---

## Pages

| 경로 | 설명 |
|------|------|
| `/` | 메인 화면 (시계, 타이머, 공지사항) |
| `/admin` | 관리자 페이지 (시험 설정, 공지사항 관리) |

## Firestore Structure

```
exams/current          - 현재 시험 정보
announcements/{id}     - 공지사항
presets/{id}           - 프리셋
admins/{email}         - 관리자 목록
app/settings           - 앱 설정 (관리자 비밀번호)
```

---

## License

MIT
