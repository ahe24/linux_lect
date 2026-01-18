# Deploy Guide

이 가이드는 **Rocky Linux 9 (또는 유관 서버)** 환경에서 `pm2`를 사용하여 이 웹사이트를 배포하는 방법을 설명합니다.

## 1. 사전 요구사항 (Server Side)

서버에 `node`, `npm`, `pm2`, `git`이 설치되어 있어야 합니다.

```bash
# Node/NPM 설치 확인
node -v
npm -v

# PM2 설치 (없다면)
npm install -g pm2

# Git 설치 (없다면)
sudo dnf install git
```

## 2. 배포 순서

### Step 1: 저장소 클론
```bash
# 원하는 디렉토리로 이동
cd /var/www  # 또는 사용자 홈 디렉토리

# 클론
git clone https://github.com/ahe24/linux_lect.git
cd linux_lect
```

### Step 2: 의존성 설치 및 빌드
```bash
# 의존성 설치
npm install

# 프로덕션 빌드 (dist 폴더 생성됨)
npm run build
```

### Step 3: 호스트/포트 설정
`ecosystem.config.js` 파일에서 포트를 변경할 수 있습니다.
기본값은 `5173` 입니다.

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "fpga-linux-lect",
      // ...
      args: "-s dist -l 5173", // 여기를 8080 등으로 변경 가능
      // ...
    }
  ]
};
```

### Step 4:서비스 시작 (PM2)
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 3. 업데이트 (재배포)
코드가 업데이트되었을 때:
```bash
git pull origin main
npm install
npm run build
pm2 reload fpga-linux-lect
```
