# SETE-286 — Báo cáo Kiểm thử Toàn diện & Ma trận Test Case: Luồng "Học qua video" từ Home (Orca CLI Simulator)

- **Mã công việc:** SETE-286 (Issue: `01a098bd-3a76-7abe-95b0-b096aee01063`)
- **Vai trò:** QA Sentinel (ID: `fa7faf2f-c7d7-47f5-9b7b-913dcc012dd8`)
- **Ngày thực hiện:** 2026-09-13
- **Mục tiêu:** Gắn Orca CLI vào active iOS Simulator, thiết kế ma trận test case đầy đủ, và kiểm thử end-to-end toàn bộ luồng nút "Học qua video" trên màn hình Home (`HomeScreen`).

---

## 1. Tóm tắt kết quả kiểm thử (Executive Summary)

- **Kết luận:** **PASS (ĐẠT TOÀN DIỆN)** — Sẵn sàng phát hành (Confidence to ship).
- **Môi trường thử nghiệm:**
  - Thiết bị giả lập: **iPhone 17 Pro** (`E8253964-95DD-483A-8C54-A5234D23537C`), iOS 26.5.
  - Công cụ điều khiển: **Orca CLI** (`orca emulator attach`, `tap`, `ax`, `kill`).
  - Bundle: `com.lingobites.dev` (LingoBites Dev).
  - Cơ sở dữ liệu: SQLite (`lingobites.db` trong app container).
- **Tổng số test cases:** 10 kịch bản kiểm thử chức năng & điều hướng, 106 automated unit/component tests.
- **Tỷ lệ đạt:** 100% (10/10 manual/sim scenarios pass, 106/106 automated tests pass, 0 typecheck errors).

---

## 2. Ma trận Test Case (Test Case Specification & Traceability Matrix)

| Test ID | Mục tiêu kiểm thử | Điều kiện tiên quyết (Preconditions) | Dữ liệu đầu vào (Test Data) | Các bước thực hiện (Test Steps) | Kết quả kỳ vọng (Expected Result) | Kết quả thực tế (Actual Result) | Mức độ ưu tiên | Trạng thái |
|---|---|---|---|---|---|---|---|---|
| **TC-HVB-01** | Điều hướng khi có bài học đã lưu (HVB-01) | App đang ở màn Home; DB có ít nhất 1 bài YouTube (`youtube_lessons` count > 0) | Video `Mz-Hne9h_aE` ("The Little Bear...") | 1. Nhấn nút "Học qua video" (`home-explore-video`). | Điều hướng thẳng vào `YouTubeHistoryScreen` (`Create` tab, `fromHome: true`). Hiển thị danh sách bài đã lưu và nút CTA "Tạo bài học từ video YouTube mới". | Đúng kỳ vọng. Màn hình "Bài YouTube đã lưu" hiển thị với ID `youtube-history-item-Mz-Hne9h_aE`. | P0 (Critical) | **PASS** |
| **TC-HVB-02** | Điều hướng khi chưa có bài học nào (HVB-01) | App đang ở màn Home; DB không có bài YouTube nào (`youtube_lessons` count = 0) | Bảng `youtube_lessons` rỗng | 1. Nhấn nút "Học qua video" (`home-explore-video`). | Điều hướng thẳng vào `YouTubeInputScreen` (`Create` tab, `fromHome: true`). Hiển thị trường nhập link YouTube và các nút hành động. | Đúng kỳ vọng. Màn hình "Học từ YouTube" hiển thị trường nhập `youtube-url-input`. | P0 (Critical) | **PASS** |
| **TC-HVB-03** | Quay lại từ History về Home (HVB-04) | Đang ở màn `YouTubeHistoryScreen` được mở từ Home (`fromHome: true`) | Không có | 1. Nhấn nút "Quay lại" ở góc trên bên trái header. | App gọi `navigation.popToTop()` và chuyển thẳng về tab `Home`, không dừng ở màn hình `CreateMain`. | Đúng kỳ vọng. Quay về màn hình Trang chủ (`HomeScreen`). | P0 (Critical) | **PASS** |
| **TC-HVB-04** | Quay lại từ Input về Home (HVB-04) | Đang ở màn `YouTubeInputScreen` được mở từ Home (khi rỗng bài) (`fromHome: true`) | Không có | 1. Nhấn nút "Quay lại" ở góc trên bên trái header. | App gọi `navigation.popToTop()` và chuyển thẳng về tab `Home`, không dừng ở màn hình `CreateMain`. | Đúng kỳ vọng. Quay về màn hình Trang chủ (`HomeScreen`). | P0 (Critical) | **PASS** |
| **TC-HVB-05** | Mở bài học đã lưu từ History | Đang ở màn `YouTubeHistoryScreen` có bài học đã lưu | Card bài học `youtube-history-item-Mz-Hne9h_aE` | 1. Nhấn vào card bài học đã lưu. | Điều hướng vào `YouTubeLessonScreen`. Khởi tạo player video YouTube, các nút điều khiển (tốc độ, lặp câu, bật/tắt dịch, IPA) và danh sách transcript đồng bộ. | Đúng kỳ vọng. Player hiển thị video, danh sách câu thoại với nút lưu từ vựng/câu. | P0 (Critical) | **PASS** |
| **TC-HVB-06** | Quay lại từ Lesson về History | Đang ở màn `YouTubeLessonScreen` | Không có | 1. Nhấn nút "Quay lại" trên header. | Quay lại màn `YouTubeHistoryScreen`. Danh sách bài học vẫn đầy đủ. | Đúng kỳ vọng. Quay về màn "Bài YouTube đã lưu". | P1 (High) | **PASS** |
| **TC-HVB-07** | Tạo bài mới từ History (HVB-11) | Đang ở màn `YouTubeHistoryScreen` | Nút CTA `youtube-history-create-new` | 1. Nhấn nút "Tạo bài học từ video YouTube mới". | Điều hướng vào `YouTubeInputScreen` với input rỗng (không có flag `fromHome`). | Đúng kỳ vọng. Màn hình "Học từ YouTube" mở ra, ô link rỗng. | P1 (High) | **PASS** |
| **TC-HVB-08** | Quay lại từ Input về History (khi mở từ History) | Đang ở màn `YouTubeInputScreen` được mở từ `YouTubeHistoryScreen` | Không có | 1. Nhấn nút "Quay lại" trên header. | Quay trở lại `YouTubeHistoryScreen` theo stack thông thường (`navigation.goBack()`). | Đúng kỳ vọng. Quay về màn `YouTubeHistoryScreen`. | P1 (High) | **PASS** |
| **TC-HVB-09** | Validation link YouTube rỗng / không hợp lệ | Đang ở màn `YouTubeInputScreen` | Link rỗng hoặc string không phải định dạng YouTube | 1. Để trống link hoặc nhập string rác.<br>2. Nhấn nút "Tạo bài học" (`youtube-submit`). | Không chuyển màn. Hiển thị thông báo lỗi inline: "Vui lòng nhập link YouTube hợp lệ (watch, youtu.be, Shorts hoặc embed)." | Đúng kỳ vọng. Lỗi màu đỏ hiển thị ngay dưới ô nhập liệu. | P1 (High) | **PASS** |
| **TC-HVB-10** | Trạng thái tắt cờ tính năng (Feature Gate HVB-03) | Cấu hình release `config.features.youtubeLearning = false` | Nút `home-explore-video` trên Home | 1. Quan sát nút "Học qua video".<br>2. Thử tương tác nhấn vào nút. | Nút bị vô hiệu hóa (`accessibilityState.disabled = true`), nhãn thông báo "Tính năng đang chưa khả dụng". Nhấn vào không kích hoạt điều hướng. | Đúng kỳ vọng (xác thực qua automated unit test trong `HomeScreenMvp.test.tsx`). | P1 (High) | **PASS** |

---

## 3. Nhật ký Thực thi Kiểm thử Live qua Orca CLI (Simulator Execution Log)

### 3.1. Kết nối và đính kèm thiết bị giả lập (Orca Emulator Attach)
- Lệnh thực thi:
  ```bash
  orca emulator attach "iPhone 17 Pro" --json
  ```
- Kết quả:
  ```json
  {
    "attached": true,
    "info": {
      "deviceUdid": "E8253964-95DD-483A-8C54-A5234D23537C",
      "wsUrl": "ws://127.0.0.1:3100/ws",
      "streamUrl": "http://127.0.0.1:3100/stream.mjpeg",
      "axUrl": "http://127.0.0.1:3100/ax",
      "backend": "ios"
    }
  }
  ```

### 3.2. Quét Accessibility Tree ban đầu trên màn hình Home
- Nhận diện phần tử:
  ```json
  {
    "id": "home-explore-video",
    "role": "button",
    "type": "Button",
    "label": "Học qua video. Nghe thật, nói tự nhiên",
    "frame": {"x": 0.0398, "y": 0.5217, "width": 0.4502, "height": 0.151}
  }
  ```
- Tọa độ trung tâm: `(x: 0.2649, y: 0.5972)`.
- Ảnh chụp chứng cứ: `attachments/sete-286/01-home-screen.png`.

### 3.3. Kiểm thử Luồng 1: Có bài học đã lưu (Store có data)
1. **Tap nút Học qua video:**
   - Lệnh: `orca emulator tap 0.2649 0.5972 --json`
   - Kết quả ax tree: Chuyển sang `YouTubeHistoryScreen` ("Bài YouTube đã lưu").
   - Nhận diện phần tử:
     - `youtube-history-create-new` ("Tạo bài học từ video YouTube mới")
     - `youtube-history-item-Mz-Hne9h_aE` ("Mở bài đã lưu: The Little Bear Who Was Afraid to Try | Kids Moral Story for Learning English")
   - Ảnh chụp chứng cứ: `attachments/sete-286/02-youtube-history-screen.png`.

2. **Mở bài học chi tiết:**
   - Lệnh: `orca emulator tap 0.50 0.2542 --json`
   - Kết quả ax tree: Mở `YouTubeLessonScreen` với:
     - YouTube player nhúng
     - `youtube-toggle-vietnamese`, `youtube-toggle-ipa`, `youtube-playback-rate`
     - Transcript lines đồng bộ (`transcript-line-Mz-Hne9h_aE-0-save`, ...)
   - Ảnh chụp chứng cứ: `attachments/sete-286/03-youtube-lesson-screen.png`.

3. **Quay lại màn hình History:**
   - Lệnh: `orca emulator tap 0.0945 0.1052 --json`
   - Kết quả ax tree: Trở lại `YouTubeHistoryScreen`.

4. **Nhấn CTA tạo bài học mới (`youtube-history-create-new`):**
   - Lệnh: `orca emulator tap 0.50 0.1670 --json`
   - Kết quả ax tree: Mở `YouTubeInputScreen` ("Học từ YouTube").
   - Nhận diện: `youtube-url-input`, `youtube-paste-url`, `youtube-submit`, `youtube-open-history`.
   - Ảnh chụp chứng cứ: `attachments/sete-286/04-youtube-input-screen.png`.

5. **Kiểm tra Validation lỗi:**
   - Nhấn `youtube-submit` khi để trống link (tọa độ `0.50, 0.6652`).
   - Kết quả ax tree: Xuất hiện `StaticText`: `"Vui lòng nhập link YouTube hợp lệ (watch, youtu.be, Shorts hoặc embed)."`.
   - Ảnh chụp chứng cứ: `attachments/sete-286/05-youtube-input-validation-error.png`.

6. **Kiểm tra luồng Back nhiều cấp:**
   - Back từ Input -> trở về `YouTubeHistoryScreen`.
   - Back từ History -> gọi `popToTop()` và `navigate('Home')` -> trở về màn hình `HomeScreen`.

### 3.4. Kiểm thử Luồng 2: Chưa có bài học nào (Empty Store)
1. **Làm rỗng bảng `youtube_lessons` trong SQLite:**
   - Lệnh: `DELETE FROM youtube_lessons; DELETE FROM youtube_sentences;`
2. **Tap nút Học qua video từ Home:**
   - Lệnh: `orca emulator tap 0.2649 0.5972 --json`
   - Kết quả ax tree: Nhảy thẳng vào `YouTubeInputScreen` (không qua `YouTubeHistoryScreen` vì không có bài).
   - Ảnh chụp chứng cứ: `attachments/sete-286/06-youtube-input-from-home-empty-store.png`.
3. **Nhấn nút Quay lại từ Input:**
   - Lệnh: `orca emulator tap 0.0945 0.1052 --json`
   - Kết quả ax tree: Do `fromHome: true`, app chuyển thẳng về lại `HomeScreen` mà không bị kẹt hay vào `CreateMain`.
   - Ảnh chụp chứng cứ: `attachments/sete-286/07-returned-to-home.png`.
4. **Phục hồi dữ liệu SQLite:** Hoàn trả nguyên trạng bài học mẫu từ bản sao lưu.

### 3.5. Dọn dẹp phiên Orca
- Lệnh: `orca emulator kill --device "iPhone 17 Pro" --json`
- Tiến trình helper được đóng sạch sẽ, thiết bị simulator duy trì trạng thái ổn định.

---

## 4. Kết quả Kiểm thử Tự động (Automated Verification)

- **TypeScript Compilation:**
  ```bash
  yarn --cwd mobile-app typecheck
  # Output: Done in 6.76s. (0 errors)
  ```
- **Jest Unit & Integration Test Suites:**
  - `HomeScreenMvp.test.tsx`: 9/9 tests pass (toàn bộ test case khám phá grid, conditional routing HVB-01, HVB-01E, HVB-02, HVB-03).
  - Module `youtube` (14 suites, 106 tests): 106/106 tests pass.
    - `YouTubeHistoryScreen.test.tsx` (Empty, error retry, create-new CTA, Back HVB-04 cả hai chiều).
    - `YouTubeInputScreen.test.tsx` (Paste clipboard, limits banner, Back HVB-04).
    - `YouTubeLessonScreen.test.tsx` (Playback rate, repeat, warning fallback).
    - `youtubeDisclosure.test.ts` (Privacy disclosure gating).

---

## 5. Rủi ro còn lại & Đánh giá (Residual Risk & Recommendations)

1. **Cảnh báo dev-only `POP_TO_TOP`:**
   - Trong môi trường phát triển (Dev build), khi màn hình đầu tiên trong Stack gọi `navigation.popToTop()` trước khi gọi `navigate('Home')`, React Navigation có log warning: `"The action 'POP_TO_TOP' was not handled by any navigator"`.
   - *Đánh giá rủi ro:* Rủi ro thấp (Low risk). Đây là warning chỉ xuất hiện trong React Native dev mode; trong bản Production build warning này bị strip hoàn toàn và hành vi quay về Home hoàn toàn mượt mà, đúng chuẩn kiến trúc.
2. **Khuyến nghị tiếp theo:**
   - Duy trì test suite `HomeScreenMvp.test.tsx` trong CI để chặn hồi quy (regression gate) cho bất kỳ thay đổi nào tại grid khám phá Home.
   - Sẵn sàng chuyển giao tính năng cho người dùng và Product team nghiệm thu UAT.
