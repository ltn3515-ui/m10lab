# M10 WORK PROOF v0.4 — Mobile Field Test

현장에서 스마트폰으로 직접 촬영 → 체크리스트 → 손가락 서명 → 고객용 보고서 → 공유까지 검증하기 위한 버전입니다.

## v0.4 핵심 변경

- 상태 표시를 `FIREBASE DB + LOCAL PHOTO · v0.4`로 정리
- Firebase Storage 실패를 세션 동안 기억해 이후 사진은 즉시 로컬 폴백
- 모바일에서 **카메라 촬영**과 **앨범 선택** 버튼 분리
- 후면 카메라 촬영 입력(`capture=environment`)
- 모바일 하단 주요 버튼 sticky 처리 + safe-area 대응
- 서명 영역 모바일 터치 높이 확대
- 온라인/오프라인 상태 표시
- 고객 공유 버튼 모바일 최적화
- PWA manifest 추가: 배포 후 브라우저의 홈 화면 추가 기능 사용 가능
- Vercel 배포용 `vercel.json` 포함

## 로컬 실행

```bash
npm install
npm run dev
```

기존 v0.3.1의 `.env`를 이 폴더로 복사하세요.

## 스마트폰 LAN 테스트

PC와 휴대폰을 같은 Wi-Fi에 연결한 후 Vite 터미널에 표시되는 `Network` 주소로 접속합니다. Windows 방화벽에서 Node/Vite의 개인 네트워크 접근 허용이 필요할 수 있습니다.

일부 모바일 브라우저 기능은 HTTP LAN 주소에서 제한될 수 있으므로 **최종 현장 검증은 Vercel HTTPS 배포를 권장**합니다.

## Vercel 배포

1. GitHub 저장소에 이 폴더 업로드
2. Vercel에서 저장소 Import
3. Framework Preset: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Firebase 환경변수를 Vercel Project Settings > Environment Variables에 동일하게 등록
7. Deploy

필수 환경변수:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 현장 테스트 체크리스트

1. 스마트폰으로 신규 현장 생성
2. 작업 전 사진을 **카메라로 직접 촬영**
3. 체크리스트 완료
4. 작업 후 사진 촬영
5. 고객이 손가락으로 직접 서명
6. 작업요약 확인/수정
7. 최종 보고서 BEFORE/AFTER 확인
8. `완료 저장 + 고객 공유` 실행
9. Firestore에서 작업 상태가 `완료`로 바뀌는지 확인

## 현재 의도된 제약

Firebase Storage가 비활성화되어 있으면 사진은 기기 메모리의 Data URL로만 유지됩니다. **새로고침 후 사진 지속 보관은 보장하지 않습니다.** Firestore에는 사진이 아닌 작업정보/체크리스트/서명/요약이 저장됩니다.

실제 업체 유료 테스트 전에 사진 영구 저장소를 선택해야 합니다.
