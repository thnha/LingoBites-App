Đã hoàn thành các yêu cầu của ticket:

### Scope:
1. Sửa `validate-release-config.ts` để loại bỏ luật `required` và cho phép các khóa bị thiếu (được suy luận mặc định là `false` do `undefined`). Vẫn giữ lỗi nếu bật tính năng `not_implemented` hoặc khi có khóa lạ.
2. Đã gỡ 11 khóa `not_implemented` khỏi mọi file preset trong `src/release/configs/`.
3. Đã **xóa hẳn** `lingobitesMvpReviewFlow` khỏi:
   - `src/release/feature-registry.ts`
   - `src/release/feature-dependencies.ts`
   - Tất cả 8 preset config files
   - `src/app/navigation/ingestionRouteGate.ts` (xóa luôn `isIngestionRouteHiddenForMvp` và `LEGACY_INGESTION_ROUTE_NAMES`)
   - `src/app/navigation/__tests__/ingestionRouteGate.test.ts` (xóa các test liên quan)
4. Sửa các test trong `validate-release-config.test.ts` và `ingestionRouteGate.test.ts` để pass sau khi thay đổi.

### Verification:
1. **Feature map hiệu dụng:** 
   Đã dump effective features của tất cả các configs trước và sau khi thực hiện, sự thay đổi **chỉ là sự biến mất của `lingobitesMvpReviewFlow`**. Các features khác (kể cả 11 features `not_implemented` vừa được xoá) không bị thay đổi một bit nào, tất cả đều đang được suy ra là `false`.
   ```diff
   --- before-dump.json	2026-09-12 16:22:55
   +++ after-dump.json	2026-09-12 16:24:21
   @@ -8,7 +8,6 @@
        "lessonResultView": true,
        "lessonSave": true,
        "lessonHistory": true,
   -    "lingobitesMvpReviewFlow": true,
        "shortPractice": true,
        "pronunciationSupport": false,
        "themeSystem": true,
   @@ -43,7 +42,6 @@
        "lessonResultView": true,
        "lessonSave": true,
        "lessonHistory": true,
   -    "lingobitesMvpReviewFlow": false,
        "shortPractice": true,
        "pronunciationSupport": false,
        "themeSystem": true,
   @@ -78,7 +76,6 @@
        "lessonResultView": true,
        "lessonSave": true,
        "lessonHistory": true,
   -    "lingobitesMvpReviewFlow": true,
        "shortPractice": true,
        "pronunciationSupport": false,
        "themeSystem": true,
   @@ -113,7 +110,6 @@
        "lessonResultView": true,
        "lessonSave": true,
        "lessonHistory": true,
   -    "lingobitesMvpReviewFlow": false,
        "shortPractice": true,
        "pronunciationSupport": false,
        "themeSystem": true,
   @@ -148,7 +144,6 @@
        "lessonResultView": true,
        "lessonSave": true,
        "lessonHistory": true,
   -    "lingobitesMvpReviewFlow": true,
        "shortPractice": false,
        "pronunciationSupport": false,
        "themeSystem": true,
   @@ -183,7 +178,6 @@
        "lessonResultView": true,
        "lessonSave": true,
        "lessonHistory": true,
   -    "lingobitesMvpReviewFlow": false,
        "shortPractice": true,
        "pronunciationSupport": false,
        "themeSystem": true,
   @@ -218,7 +212,6 @@
        "lessonResultView": true,
        "lessonSave": true,
        "lessonHistory": true,
   -    "lingobitesMvpReviewFlow": false,
        "shortPractice": true,
        "pronunciationSupport": false,
        "themeSystem": true,
   @@ -253,7 +246,6 @@
        "lessonResultView": true,
        "lessonSave": true,
        "lessonHistory": true,
   -    "lingobitesMvpReviewFlow": false,
        "shortPractice": true,
        "pronunciationSupport": false,
        "themeSystem": true,
   ```

2. **Grep `lingobitesMvpReviewFlow` và `isIngestionRouteHiddenForMvp`**:
   Kết quả trả về không có dòng nào (`0 results found`).

3. **Check Bật `not_implemented` (e.g. `miniGame`)**:
   Validator vẫn bắt lỗi bình thường: `Cannot enable feature "miniGame" because its status is "not_implemented".`

4. **Tests Validation**:
   ```bash
   $ npx tsc --noEmit && npx jest src/release src/app/navigation
   PASS src/app/navigation/__tests__/immersiveTabRoutes.test.ts
   PASS src/release/__tests__/lessonV2-flag.test.ts
   PASS src/app/navigation/__tests__/ingestionRouteGate.test.ts
   PASS src/app/navigation/__tests__/tabBarMetrics.test.tsx
   PASS src/release/__tests__/validate-release-config.test.ts
   PASS src/app/navigation/__tests__/TabBar.test.tsx

   Test Suites: 6 passed, 6 total
   Tests:       49 passed, 49 total
   ```

Task đã hoàn thành, chuyển issue sang in_review.
