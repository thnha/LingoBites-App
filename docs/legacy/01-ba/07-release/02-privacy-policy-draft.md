# Privacy Policy Draft — Phase 0

## 1. Purpose

This document is a draft Privacy Policy for **LingoBites Phase 0**. Content must be reviewed by legal/privacy reviewer before public beta or store submission.

Principles:

- Clearly state the app processes images/text to create lessons.
- Do not be vague about AI/OCR providers.
- Do not overpromise.
- Do not publish final legal content without review.

---

## 2. Vietnamese draft (user-facing)

```text
Chính sách quyền riêng tư

Cập nhật lần cuối: [ngày cập nhật]

LingoBites giúp người dùng học tiếng Anh bằng cách chụp ảnh, chọn ảnh hoặc nhập văn bản tiếng Anh, sau đó tạo bài học gồm bản dịch, từ vựng, ngữ pháp và gợi ý học tập.

1. Dữ liệu chúng tôi xử lý

Khi bạn sử dụng ứng dụng, chúng tôi có thể xử lý:
- Ảnh bạn chụp hoặc chọn để trích xuất chữ bằng OCR.
- Văn bản tiếng Anh được trích xuất từ ảnh hoặc do bạn nhập/dán.
- Văn bản bạn xác nhận hoặc chỉnh sửa trước khi tạo bài học.
- Kết quả bài học được tạo bởi AI.
- Dữ liệu kỹ thuật như loại thiết bị, phiên bản ứng dụng, thời gian xử lý, trạng thái lỗi và mã lỗi.

2. Cách dữ liệu được sử dụng

Dữ liệu được sử dụng để:
- Trích xuất chữ từ ảnh.
- Tạo bài học tiếng Anh bằng AI.
- Hiển thị, lưu và mở lại bài học trên thiết bị của bạn.
- Cải thiện độ ổn định, chất lượng OCR/AI và trải nghiệm người dùng.
- Phát hiện lỗi kỹ thuật và kiểm soát chi phí dịch vụ.

3. Xử lý ảnh và văn bản

Trong Phase 0, ứng dụng không lưu ảnh gốc mặc định. Ảnh có thể được gửi tạm thời đến backend để xử lý OCR và sau đó bị xóa khỏi bộ nhớ tạm hoặc file tạm.

Văn bản đã xác nhận có thể được gửi đến backend và nhà cung cấp AI để tạo bài học. Không nên gửi nội dung quá nhạy cảm như giấy tờ cá nhân, mật khẩu, thông tin tài chính, y tế hoặc pháp lý.

4. Lưu bài học

Nếu bạn lưu bài học, dữ liệu bài học được lưu cục bộ trên thiết bị của bạn. Bạn có thể xóa bài học đã lưu hoặc xóa dữ liệu cục bộ trong ứng dụng nếu tính năng này được bật.

5. Dữ liệu analytics và log

Ứng dụng có thể ghi nhận metadata để đo chất lượng và độ ổn định, ví dụ:
- Trạng thái thành công/thất bại của OCR hoặc AI.
- Thời gian xử lý.
- Mã lỗi.
- Phiên bản ứng dụng.
- Nền tảng iOS/Android.
- Nhóm độ dài văn bản, không phải toàn bộ nội dung văn bản.

Chúng tôi không chủ động log toàn bộ ảnh, văn bản người dùng hoặc toàn bộ kết quả AI trong analytics production.

6. Nhà cung cấp dịch vụ

Ứng dụng có thể sử dụng nhà cung cấp OCR, AI, analytics, crash reporting hoặc hosting để vận hành dịch vụ. Các nhà cung cấp này chỉ được dùng để xử lý chức năng cần thiết của ứng dụng.

Trước public beta, danh sách nhà cung cấp cụ thể sẽ được cập nhật tại đây:
- OCR provider: [tên provider]
- AI provider/model: [tên provider/model]
- Analytics/crash reporting: [tên công cụ]
- Backend hosting: [tên dịch vụ]

7. API key và bảo mật

API key của nhà cung cấp OCR/AI không được lưu trong ứng dụng mobile. Các request OCR/AI đi qua backend proxy qua HTTPS.

8. Quyền của bạn

Bạn có thể:
- Không cấp quyền camera/photo và dùng nhập text thủ công nếu khả dụng.
- Xóa bài học đã lưu trên thiết bị.
- Liên hệ để hỏi về quyền riêng tư hoặc yêu cầu hỗ trợ.

9. Trẻ em và nội dung nhạy cảm

Ứng dụng hướng đến mục đích học tập. Người dùng không nên tải lên nội dung nhạy cảm hoặc thông tin cá nhân của người khác nếu không có quyền.

10. Liên hệ

Nếu bạn có câu hỏi về quyền riêng tư, liên hệ:
[support email]
```

---

## 3. Short in-app privacy note

Suggested copy for Settings or first OCR use:

```text
Ảnh hoặc văn bản bạn chọn có thể được gửi tới hệ thống OCR/AI để tạo bài học. Ứng dụng không lưu ảnh gốc mặc định và không gửi nội dung đầy đủ vào analytics. Không nên upload nội dung quá nhạy cảm.
```

---

## 4. AI disclaimer

Suggested copy:

```text
Kết quả phân tích được tạo bởi AI và có thể chưa chính xác hoàn toàn. Hãy dùng như công cụ hỗ trợ học tập, không phải nguồn đánh giá tiếng Anh chính thức.
```

---

## 5. Store data safety checklist

Before store submission, confirm:

| Data category | Processed? | Notes |
|---|---|---|
| User-provided photos | Yes | Sent temporarily for OCR; original images not stored by default |
| User-provided text | Yes | Sent to AI to create lesson |
| Saved lessons | Yes | Local-first on device in Phase 0 |
| Analytics metadata | Yes | Does not contain raw text/images |
| Crash logs | Possibly | Does not contain raw content |
| Account data | Not by default | Phase 0 does not require login |

---

## 6. Items to finalize before public beta

- Support email/URL.
- Specific OCR/AI providers.
- Analytics/crash reporting tool.
- Backend hosting.
- Data retention policy for backend logs.
- How users delete local data in app.
- Legal review of final version.
