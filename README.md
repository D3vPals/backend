# **DevPals**  
 **DevPals 🧑‍🤝‍🧑 : 개발자들의 친구(Pals)라는 의미로 친근한 협업 분위기 전달**<br>
> 주요 서비스 : 초보자도 두려움 없이 원하는 사이드 프로젝트를 쉽게, 함께 할 수 있도록 도와주는 서비스<br>

## 백엔드 소개
 | [김현희](https://github.com/Kim-Hyunhee) | [김난영](https://github.com/Algoruu) |
| -- | -- |
| <img src="https://avatars.githubusercontent.com/u/96518301?v=4" width="120" />  | <img src="https://avatars.githubusercontent.com/u/126838925?v=4" width="120" />  |
| <p align="center">BE</p> | <p align="center">BE</p> |

## 목차
1. [실행 환경](#실행-환경)  
   1-1. [환경 변수](#환경-변수)  
   1-2. [프로젝트 실행하기](#프로젝트-실행하기)  
2. [기술 스택](#기술-스택)  
3. [폴더 구조](#폴더-구조)  
4. [ERD](#erd)  
5. [트러블슈팅](#트러블슈팅)  
6. [기능 구현](#기능-구현)
7. [API 명세서와 Swagger 문서](#api-명세서와-swagger-문서)
8. [백엔드 자료](#백엔드-자료)

<br>

## 실행 환경
### 환경 변수
- 아래 항목들이 `.env` 파일에 반드시 존재해야 합니다:
  - `DATABASE_URL`: AWS RDS(MySQL)를 통한 데이터베이스 연결 주소

  - `PORT`: 서버가 실행될 로컬호스트 포트 번호

  - `EMAIL_USER`: 이메일을 발송할 Gmail 계정

  - `EMAIL_PASS`: 이메일 발송을 위한 Gmail 앱 비밀번호 (*일반 비밀번호 X, Gmail에서 생성한 앱 비밀번호 사용해야 함*)

  - `JWT_ACCESS_SECRET`: JWT 액세스 토큰 시크릿 키

  - `JWT_REFRESH_SECRET`: JWT 리프레시 토큰 시크릿 키

  - `AWS_REGION`: AWS 지역 설정

  - `AWS_ACCESS_KEY_ID`: AWS 액세스 키 ID

  - `AWS_SECRET_ACCESS_KEY`: AWS 시크릿 액세스 키

  - `AWS_S3_BUCKET_NAME`: S3 버킷 이름

<br>

---

### 프로젝트 실행하기

<details>
<summary><strong>✨프로젝트 실행하기 과정 보기✨</strong></summary>
<div markdown="1">

### 1️⃣ 프로젝트 클론
```bash
$ git clone https://github.com/D3vPals/backend.git
```

### 2️⃣ 의존성 설치
```bash
$ npm install
```

### 3️⃣ 환경 변수 설정 (.env 파일 생성)
```bash
$ touch .env
$ nano .env  # 또는 vim .env
```
⚠️ [.env](#환경-변수) 파일이 없으면 서버가 정상적으로 실행되지 않습니다.<br>

### 4️⃣ 데이터베이스 연결 (AWS RDS)
AWS RDS에서 MySQL 데이터베이스를 새로 생성한 후, .env 파일의 DATABASE_URL 값을 올바르게 설정하세요.<br>

**Prisma와 데이터베이스 동기화**
```bash
$ npx prisma db push
```
✅ 이 명령어는 Prisma와 MySQL을 동기화하며, 기존 마이그레이션 파일 없이도 작동합니다.<br>

### 5️⃣ 서버 실행 (개발 모드)
```bash
$ npm run start:dev
```

### 6️⃣ 서버 실행 (프로덕션 모드)
```bash
$ npm run build
$ npm run start:prod
```

### 7️⃣ 🔥 배포 서버 실행 방법

- **[📄 🔥 AWS EC2 (Amazon Linux 2023)에서 NestJS 배포하기](https://flint-waitress-888.notion.site/AWS-EC2-Amazon-Linux-2023-NestJS-18f050b5f48180ea94feca1c6c2966fa)**
  - 여기 과정에서 CI/CD가 잘 안먹힌다면 바로 밑의 글로 넘어가면 됩니다!

- **[📄 EC2, PM2, 그리고 GitHub Actions를 연결하여 자동 배포를 설정](https://flint-waitress-888.notion.site/EC2-PM2-GitHub-Actions-183050b5f48181968d16f8a0f96ef635)**
  - Amazon Linux 2023 기반 EC2에 알맞는 CI/CD 과정이 자세하게 나와있습니다.

- **[📄 EC2, PM2, CloudWatch Logs 설정 및 연동: 전체 과정 순서대로 정리](https://flint-waitress-888.notion.site/EC2-PM2-CloudWatch-Logs-183050b5f48181f1baebf6f6d2fd1e5a)**
  - 기존의 AWS CloudWatch에서는 어떤 엔드포인트에서 에러가 났는지 확인할 수 없어서 로그를 추가하는 과정입니다.

- **[📄 에러 로그 EC2와 CloudWatch에서 연결(미들웨어 연결 오류 해결)](https://flint-waitress-888.notion.site/EC2-CloudWatch-183050b5f4818108a02dfb5c00319e06)**
  - AWS CloudWatch Logs를 연결하려다가 미들웨어 연결 오류로 실패한 걸 해결했습니다.

</div>
</details>

<br>

## 기술 스택
### 백엔드
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) ![Swagger](https://img.shields.io/badge/-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=white)

### AWS
![AWS](https://img.shields.io/badge/AWS-232F3E.svg?style=for-the-badge&logo=amazonwebservices&logoColor=white) ![AWS RDS](https://img.shields.io/badge/AWS%20RDS-527FFF.svg?style=for-the-badge&logo=amazonrds&logoColor=white) ![AWS S3](https://img.shields.io/badge/AWS%20S3-569A31.svg?style=for-the-badge&logo=amazons3&logoColor=white)

### CI/CD
![AWS EC2](https://img.shields.io/badge/AWS%20EC2-FF9900.svg?style=for-the-badge&logo=amazonec2&logoColor=white) ![PM2](https://img.shields.io/badge/pm2-2B037A.svg?style=for-the-badge&logo=pm2&logoColor=white) ![Nginx](https://img.shields.io/badge/nginx-009639.svg?style=for-the-badge&logo=nginx&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF.svg?style=for-the-badge&logo=githubactions&logoColor=white)

<br>

## 폴더 구조

<details>
<summary><strong>✨폴더 구조✨</strong></summary>
<div markdown="1">
 
```bash
backend/
├── prisma/
│   ├── schema.prisma           # Prisma ORM을 위한 데이터베이스 스키마 정의
├── src/
│   ├── constants/              # 프로젝트 전반에서 사용하는 상수 관리
│   │   └── pagination.ts       # 페이지네이션 관련 상수 정의
│   │
│   ├── decorators/             # 커스텀 데코레이터 정의
│   │   ├── auth.decorator.ts   # 특정 엔드포인트를 인증 없이 접근할 수 있도록 설정하는 데코레이터 (ex: @Public())
│   │   ├── curretUser.decorator.ts # 현재 사용자 정보를 가져오는 데코레이터 (ex: @CurrentUser())
│   │
│   ├── middlewares/            # 전역 및 특정 모듈에서 사용할 미들웨어 (prod branch 전용)
│   │   └── logging.middleware.ts #  nginx 로그 파일 미들웨어 (prod branch 전용)
│   │
│   ├── modules/                # 주요 비즈니스 로직 모듈
│   │   ├── applicant/          # 지원자 관리 관련 기능
│   │   │   ├── dto/            
│   │   │   │   ├── create-applicant.dto.ts # 지원자 생성 요청 DTO
│   │   │   │   ├── modify-applicant-status.dto.ts # 지원자 상태 변경 DTO
│   │   │   │   ├── send-email.dto.ts # 지원자 관련 이메일 전송 DTO
│   │   │   ├── applicant.controller.ts # 지원자 관련 API 컨트롤러
│   │   │   ├── applicant.module.ts    # 지원자 모듈 정의
│   │   │   ├── applicant.service.ts   # 지원자 관련 서비스 로직
│   │   │
│   │   ├── auth/               # 인증 및 사용자 인증 관리
│   │   │   ├── dto/
│   │   │   │   ├── jwt-payload.dto.ts # JWT 페이로드 DTO
│   │   │   │   ├── login.dto.ts # 로그인 요청 DTO
│   │   │   │   ├── reset-password.dto.ts # 비밀번호 재설정 DTO
│   │   │   │   ├── signup.dto.ts # 회원가입 요청 DTO
│   │   │   ├── guard/
│   │   │   │   ├── jwt-auth.guard.ts # JWT 인증 가드
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts # JWT 인증 전략
│   │   │   ├── auth.controller.ts  # 인증 관련 API 컨트롤러
│   │   │   ├── auth.module.ts      # 인증 모듈 정의
│   │   │   ├── auth.service.ts     # 인증 관련 서비스 로직
│   │   │
│   │   ├── authenticode/           # 인증 코드 관련 기능 (이메일 인증 등)
│   │   │   ├── dto/
│   │   │   │   ├── send-email-code.dto.ts # 이메일 인증 코드 전송 DTO
│   │   │   │   ├── verify-email-code.dto.ts # 이메일 인증 코드 검증 DTO
│   │   │   ├── authenticode.controller.ts # 인증 코드 API 컨트롤러
│   │   │   ├── authenticode.module.ts # 인증 코드 모듈 정의
│   │   │   ├── authenticode.service.ts # 인증 코드 관련 서비스 로직
│   │   │
│   │   ├── email/                # 이메일 관련 기능
│   │   │   ├── dto/
│   │   │   │   ├── email.dto.ts   # 이메일 요청 DTO
│   │   │   ├── templates/
│   │   │   │   ├── authenticode.html # 이메일 인증 코드 템플릿
│   │   │   │   ├── notification.html # 프로젝트 지원 결과 알림 이메일 템플릿
│   │   │   ├── email.module.ts    # 이메일 모듈 정의
│   │   │   ├── email.service.ts   # 이메일 전송 서비스 로직
│   │   │
│   │   ├── method/                # 진행 방식 관련 기능
│   │   │   ├── method.controller.ts # 진행 방식 관련 API 컨트롤러
│   │   │   ├── method.module.ts    # 진행 방식 모듈 정의
│   │   │   ├── method.service.ts   # 진행 방식 관련 서비스 로직
│   │   │
│   │   ├── notification/           # 알림 관련 기능
│   │   │   ├── notification.controller.ts # 알림 API 컨트롤러
│   │   │   ├── notification.module.ts    # 알림 모듈 정의
│   │   │   ├── notification.service.ts   # 알림 관련 서비스 로직
│   │   │
│   │   ├── position-tag/           # 포지션 태그 관련 기능
│   │   │   ├── position-tag.controller.ts # 포지션 태그 API 컨트롤러
│   │   │   ├── position-tag.module.ts    # 포지션 태그 모듈 정의
│   │   │   ├── position-tag.service.ts   # 포지션 태그 관련 서비스 로직
│   │   │
│   │   ├── prisma/                # 데이터베이스 설정 및 연동
│   │   │   ├── prisma.module.ts    # Prisma 모듈 정의
│   │   │   ├── prisma.service.ts   # Prisma 관련 서비스 로직
│   │   │
│   │   ├── project/               # 프로젝트 관련 기능
│   │   │   ├── dto/
│   │   │   │   ├── create-project.dto.ts # 프로젝트 생성 DTO
│   │   │   │   ├── get-project.dto.ts # 프로젝트 조회 DTO
│   │   │   │   ├── modify-project.dto.ts # 프로젝트 수정 DTO
│   │   │   ├── project.controller.ts # 프로젝트 API 컨트롤러
│   │   │   ├── project.module.ts    # 프로젝트 모듈 정의
│   │   │   ├── project.service.ts   # 프로젝트 관련 서비스 로직
│   │   │
│   │   ├── skill-tag/              # 기술 태그 관련 기능
│   │   │   ├── skill-tag.controller.ts # 기술 태그 API 컨트롤러
│   │   │   ├── skill-tag.module.ts    # 기술 태그 모듈 정의
│   │   │   ├── skill-tag.service.ts   # 기술 태그 관련 서비스 로직
│   │   │
│   │   ├── upload/                 # 파일 업로드 기능
│   │   │   ├── upload.controller.ts # 파일 업로드 API 컨트롤러
│   │   │   ├── upload.module.ts    # 파일 업로드 모듈 정의
│   │   │   ├── upload.service.ts   # 파일 업로드 관련 서비스 로직
│   │   │
│   │   ├── user/                   # 사용자 정보 관리
│   │   │   ├── dto/
│   │   │   │   ├── application-status.dto.ts # 지원 상태 관련 DTO
│   │   │   │   ├── check-nickname.dto.ts # 닉네임 중복 확인 DTO
│   │   │   │   ├── my-info-response.dto.ts # 내 정보 응답 DTO
│   │   │   │   ├── project-response.dto.ts # 프로젝트 응답 DTO
│   │   │   │   ├── update-user.dto.ts # 사용자 정보 수정 DTO
│   │   │   │   ├── user-projects-response.dto.ts # 사용자 프로젝트 응답 DTO
│   │   │   ├── user.controller.ts # 사용자 API 컨트롤러
│   │   │   ├── user.module.ts    # 사용자 모듈 정의
│   │   │   ├── user.service.ts   # 사용자 관련 서비스 로직
│   │   │
│   ├── app.controller.ts          # 메인 애플리케이션 컨트롤러
│   ├── app.module.ts              # 애플리케이션 메인 모듈
│   ├── app.service.ts             # 애플리케이션 서비스 로직
│   ├── main.ts                    # 서버 엔트리포인트 (NestJS 앱 실행)

```
</div>
</details>

<br>

## **ERD**

<details>
<summary><strong>✨ERD 이미지 보기✨</strong></summary>
<div markdown="1">

![ERD 이미지](https://github.com/user-attachments/assets/84700780-5339-4266-bd0e-c63715a222dc)

</div>
</details>

<br>

## 트러블슈팅
- **[📄 트러블슈팅 : 에러 로그 EC2와 CloudWatch에서 연결(미들웨어 연결 오류 해결)](https://flint-waitress-888.notion.site/EC2-CloudWatch-18f050b5f48180c381f4eb30911ab064)** 

- **[📄 트러블슈팅 : CORS 오류 해결](https://flint-waitress-888.notion.site/CORS-18f050b5f48180c68c7ded3f3ed744d3)** 

- **[📄 트러블슈팅 : NGINX 파일 업로드 제한 설정 수정](https://flint-waitress-888.notion.site/NGINX-183050b5f481818db380f35f7242dd72)**


## 기능 구현 목록
### **1️⃣ 회원가입 & 인증 (Auth - C)**
- **회원가입** - 이메일과 비밀번호를 통해 회원 가입  
- **로그인** - 로그인 성공 시 JWT 액세스/리프레시 토큰 발급  
- **비밀번호 재설정** - 이메일 인증 후 비밀번호 변경  
- **로그아웃** - 토큰을 만료시켜 로그아웃 처리  
- **JWT 토큰 갱신** - 리프레시 토큰을 사용해 새로운 액세스 토큰 발급  
<br>

### **2️⃣ 프로젝트 관리 (Project - CRU)**
- **프로젝트 CRU** - 프로젝트 생성, 조회, 수정, 완료 처리  
- **내가 등록한 공고 목록 조회** - 현재 로그인한 사용자가 등록한 프로젝트 목록 반환  
- **공고 진행 상태 개수 조회** - 모집 중, 마감된 프로젝트 개수 조회  
<br>


### **3️⃣ 지원자 관리 (Applicant - CRU)**
- **지원자 CRU** - 프로젝트 지원, 지원자 목록 조회, 지원 상태 변경  
<br>


### **4️⃣ 유저 관리 (User - CRU)**
- **유저 CRU** - 회원 정보 조회, 수정, 닉네임 변경, 프로필 이미지 변경  
<br>


### **5️⃣ 이메일 인증 코드 관리 (C)**
- **이메일 인증 코드 발송** - 이메일로 인증 코드 전송  
- **이메일 인증 코드 확인** - 입력된 인증 코드 검증  
<br>


### **6️⃣ 태그 및 기타 기능 (R)**
- **포지션 태그 조회** - 프로젝트에서 사용할 포지션 태그 목록 조회  
- **기술 태그 조회** - 사용 가능한 기술 태그 목록 조회  
- **진행 방식 목록 조회** - 프로젝트 진행 방식 목록 조회  
<br>

## **API 명세서와 Swagger 문서**
API 명세서(Notion Database로 작성)와 Swagger를 통해 API 목록을 확인할 수 있습니다.<br>
아래 링크를 클릭하여 API 명세서와 Swagger 문서로 이동하세요.<br>

**[📄 API 명세서 보러 가기](https://github.com/user-attachments/assets/e0c14d00-a6ef-4141-bfe6-38fdf9b22343)**

**[📄 Swagger 문서 보러 가기](https://github.com/user-attachments/assets/a7087b49-384b-4896-9176-de02bb619486)**


## 백엔드 자료

<details>
<summary><strong>✨백엔드 자료 보기✨</strong></summary>
<div markdown="1">


- **[📄 마감일이 되면 isDone: true로 자동으로 업데이트 되도록 구현](https://flint-waitress-888.notion.site/isDone-true-183050b5f48181378e09cd6115819c7f)**

- **[📄 🔥 AWS EC2 (Amazon Linux 2023)에서 NestJS 배포하기](https://flint-waitress-888.notion.site/AWS-EC2-Amazon-Linux-2023-NestJS-18f050b5f48180ea94feca1c6c2966fa)**

- **[📄 EC2, PM2, 그리고 GitHub Actions를 연결하여 자동 배포를 설정](https://flint-waitress-888.notion.site/EC2-PM2-GitHub-Actions-183050b5f48181968d16f8a0f96ef635)**

- **[📄 EC2, PM2, CloudWatch Logs 설정 및 연동: 전체 과정 순서대로 정리](https://flint-waitress-888.notion.site/EC2-PM2-CloudWatch-Logs-183050b5f48181f1baebf6f6d2fd1e5a)**

- **[📄 에러 로그 EC2와 CloudWatch에서 연결(미들웨어 연결 오류 해결)](https://flint-waitress-888.notion.site/EC2-CloudWatch-183050b5f4818108a02dfb5c00319e06)**

- **[📄 EC2와 PM2 설명](https://flint-waitress-888.notion.site/EC2-PM2-183050b5f481812583f1da92da810d0e)**

- **[📄 테스트 코드](https://flint-waitress-888.notion.site/183050b5f481810fa582fcb4c15817e1)**

- **[📄 NGINX 파일 업로드 제한 설정 수정](https://flint-waitress-888.notion.site/NGINX-183050b5f481818db380f35f7242dd72)**

</div>
</details>

<br>

---
[👆 맨 위로 올라가기](#devpals)