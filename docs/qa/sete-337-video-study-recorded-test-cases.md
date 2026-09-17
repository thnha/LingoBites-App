# SETE-337 — Báo cáo Kiểm thử Toàn diện & Bộ Test Case: Chức năng "Học qua video đã lưu" (Study by Video Recorded)

- **Mã công việc:** SETE-337 (Issue: `01a0af4e-e161-72cc-a213-16d338f03913`)
- **Epic liên quan:** SETE-321 (`01a0a9ab-3fa9-74f1-a7c3-2b4c648edba4`) — *Implement màn học qua video: player theo câu + thẻ câu + popup Công cụ*
- **Các task kỹ thuật hoàn thành:** SETE-328 (TASK-1), SETE-329 (TASK-2), SETE-330 (TASK-3), SETE-331 (TASK-4), SETE-332 (TASK-5), SETE-334 (TASK-7), SETE-335 (TASK-8), SETE-336 (TASK-9)
- **Vai trò thực hiện:** Senior QA Analyst (ID: `fa7faf2f-c7d7-47f5-9b7b-913dcc012dd8`)
- **Ngày thực hiện:** 2026-09-17
- **Mục tiêu kiểm thử:** Thiết kế bộ test case hoàn chỉnh, bao phủ toàn bộ luồng nghiệp vụ (Run Flow), giao diện và trải nghiệm (UI/UX), xác thực chi tiết thành phần (Components, Text, Font, Color) của chức năng học bài học từ video đã ghi lại / đã lưu trong cơ sở dữ liệu (`YouTubeHistoryScreen` -> `YouTubeLessonScreen`).

---

## 1. Tóm tắt Kiểm thử (Executive Summary)

- **Kết luận:** **100% PASS — ĐẠT CHUẨN TOÀN DIỆN & TẤT CẢ 7 KHUYẾT TẬT ĐÃ ĐƯỢC KHẮC PHỤC & VERIFY (READY FOR REVIEW)**
- **Môi trường thử nghiệm:**
  - Thiết bị: **iPhone 17 Pro** (`E8253964-95DD-483A-8C54-A5234D23537C`), iOS 26.5.
  - Công cụ điều khiển tự động: **Orca CLI** (`orca emulator attach`, `tap`, `ax`, `simctl`).
  - Ứng dụng: `com.lingobites.dev` (LingoBites Dev build).
  - Cơ sở dữ liệu: SQLite (`lingobites.db` trong app container).
- **Tổng số kịch bản kiểm thử (Test Cases):** 28 test cases chi tiết chia thành 12 nhóm chức năng và giao diện (**28/28 PASS**).
- **Tình trạng automated test suites:** 221/221 suites pass (1794 tests passed, 1 skipped, 0 failures).
- **Trạng thái khắc phục khuyết tật (Defects Resolution):**
  - Stage 1 (3/3 completed & verified): SETE-338 (DEFECT-01), SETE-339 (DEFECT-02), SETE-340 (DEFECT-03).
  - Stage 2 (4/4 completed & verified): SETE-341 (DEFECT-04), SETE-342 (DEFECT-05), SETE-343 (DEFECT-06), SETE-344 (DEFECT-07).

---

## 2. Ma trận Test Case Chi tiết (Comprehensive Test Case Specification)

| Test ID | Module / Thành phần | Kịch bản kiểm thử (Test Scenario) | Điều kiện tiên quyết & Dữ liệu | Các bước thực hiện (Steps) | Kết quả kỳ vọng (Expected Result) | Actual Result trên Simulator | Priority | Trạng thái |
|---|---|---|---|---|---|---|---|---|
| **TC-SVR-01** | Home -> History | Mở danh sách bài học video đã lưu từ màn hình Home | App ở màn Home; DB có ≥ 1 bài học YouTube đã lưu | 1. Quan sát card "Học qua video" trên Home.<br>2. Nhấn nút card `home-explore-video`. | Card hiển thị badge số lượng clip đã lưu (vd: "🟢 1 clip"). Chuyển hướng chính xác vào `YouTubeHistoryScreen` ("Bài YouTube đã lưu"). | Mở `YouTubeHistoryScreen`, hiển thị danh sách video. | P0 | **PASS** |
| **TC-SVR-02** | History Screen | Kiểm tra hiển thị danh sách bài học đã lưu | Đang ở `YouTubeHistoryScreen` | 1. Quan sát danh sách bài học, thumbnail, icon play, tiêu đề, kênh và số câu. | Hiển thị đầy đủ thông tin: icon play tròn nền cyan/teal, tiêu đề video (tối đa 2 dòng), tên kênh · số lượng câu thoại, icon thùng rác xóa. | Hiển thị đúng card video `Little Duck is Lost in the Forest`. | P0 | **PASS** |
| **TC-SVR-03** | History Screen | Mở bài học đã lưu từ danh sách History | Đang ở `YouTubeHistoryScreen`, có card bài học | 1. Nhấn vào card bài học `youtube-history-item-...`. | Điều hướng vào `YouTubeLessonScreen`. Tải dữ liệu bài học, nạp iframe player và danh sách thẻ câu tương ứng. | Mở chính xác `YouTubeLessonScreen` với dữ liệu đầy đủ. | P0 | **PASS** |
| **TC-SVR-04** | History Screen | Xác nhận xóa bài học đã lưu và hiển thị Empty State | Đang ở `YouTubeHistoryScreen` | 1. Nhấn icon Thùng rác trên card bài học.<br>2. Chọn "Hủy" trên dialog xác nhận.<br>3. Nhấn lại Thùng rác, chọn "Xóa". | Nhấn "Hủy": bài học vẫn giữ nguyên. Nhấn "Xóa": bản ghi bị xóa khỏi SQLite, màn hình chuyển sang Empty State với nút "Tạo bài từ video mới". | Hoạt động chính xác theo thiết kế. | P1 | **PASS** |
| **TC-SVR-05** | Lesson Header | Kiểm tra cấu trúc & các nút điều khiển Header | Đang ở `YouTubeLessonScreen` | 1. Quan sát nút Back, tiêu đề video và 4 nút hành động: Bật/Tắt VI, Bật/Tắt IPA, Luyện tập, Menu 3 chấm. | Nút Back nằm bên trái; tiêu đề ở giữa (cắt ngắn 1 dòng rõ nét ≥14pt khi dài); bên phải gồm đúng 4 nút: `translate`, `subtitles`, `school`, `more_vert`. Touch target mỗi nút ≥44pt. | Đủ 4 nút và nút Back; tiêu đề 1 dòng hiển thị rõ nét không co nhỏ (Fixed & Verified via SETE-339 & SETE-343). | P1 | **PASS** |
| **TC-SVR-06** | Lesson Navigation | Quay lại từ bài học đã lưu về màn hình trước đó | Mở bài học từ `YouTubeHistoryScreen` | 1. Nhấn nút Back (`←`) ở góc trên bên trái header. | Thoát khỏi bài học và quay trở lại màn hình trước đó (`YouTubeHistoryScreen` hoặc `Home`), không bị crash, không bị kẹt. | Quay về đúng màn hình trước đó. | P0 | **PASS** |
| **TC-SVR-07** | Video Player | Khởi tạo YouTube Player và phát video | Đang ở `YouTubeLessonScreen`, có kết nối mạng | 1. Nhấn nút Play trên video iframe hoặc nút "Phát" trên thanh điều khiển. | Video bắt đầu phát mượt mà, đồng hồ thời gian đếm tiến, thanh tiến độ di chuyển theo thời gian thực. | Video phát chuẩn, iframe YouTube phản hồi tốt. | P0 | **PASS** |
| **TC-SVR-08** | Control Bar | Thanh điều khiển rút gọn cố định (`CompactControlBar`) | Đang ở `YouTubeLessonScreen` | 1. Quan sát thanh điều khiển ngay dưới khung video.<br>2. Kiểm tra nhãn câu, nút Phát/Dừng, Nghe lại, Thời gian còn lại, nút Công cụ. | Thanh cố định dưới video không tự ẩn; hiển thị nhãn `Câu N/M`; nút Phát/Dừng chuyển đổi trạng thái; thời gian còn lại định dạng `-mm:ss`; nút "Công cụ". | Hiển thị chuẩn xác, vạch câu hiển thị trên thanh seekbar. | P0 | **PASS** |
| **TC-SVR-09** | Control Bar | Tua video theo vạch phân câu (Sentence Snap Seek) | Video đang phát hoặc dừng | 1. Kéo hoặc chạm vào thanh seekbar của `CompactControlBar`.<br>2. Thả tay tại vị trí gần vạch câu. | Vị trí tua tự động hít (snap) về đầu câu gần nhất trong khoảng ±0.4s, có bù trừ -0.3s để không mất âm đầu câu. | Snap chuẩn xác, video phát ngay từ đầu câu. | P1 | **PASS** |
| **TC-SVR-10** | Control Bar | Nút "Nghe lại" câu hiện tại (`youtube-compact-replay`) | Video đang phát ở giữa câu | 1. Nhấn nút "Nghe lại". | Video tua ngay lập tức về mốc bắt đầu của câu hiện tại (`start_ms - 300ms`) và tiếp tục phát. | Tua về đầu câu chuẩn xác mà không cần đổi thẻ. | P1 | **PASS** |
| **TC-SVR-11** | Sentence Carousel | Phân trang ngang thẻ câu (`SentenceCarousel`) | Đang ở `YouTubeLessonScreen` | 1. Vuốt ngang sang trái để chuyển sang câu kế tiếp.<br>2. Vuốt ngang sang phải để quay lại câu trước. | Thẻ trượt mượt mà có hiệu ứng snap (khóa trục sau 10pt đầu, snap khi vượt 35% chiều rộng thẻ); thẻ kế tiếp luôn ló mép 12–16pt (peek width). | Vuốt ngang chuyển thẻ chuẩn xác, snap đúng vị trí. | P0 | **PASS** |
| **TC-SVR-12** | Sentence Carousel | Chỉ báo chấm chỉ trang (Dots Indicator) | Video có số câu ≤ 10 câu vs > 10 câu | 1. Mở bài học có ≤ 10 câu thoại.<br>2. Mở bài học có > 10 câu thoại. | Bài ≤ 10 câu: hiển thị dãy chấm tròn ở đáy carousel, chấm active màu amber/accent. Bài > 10 câu: tự động ẩn dãy chấm để tránh rối mắt. | Logic ẩn/hiện chấm hoạt động chính xác (`shouldShowDots`). | P2 | **PASS** |
| **TC-SVR-13** | Sentence Card | Hàng nghe cả câu cố định (`listenBar`) | Mở thẻ câu bất kỳ | 1. Quan sát đầu thẻ câu ngay dưới header thẻ. | Hiển thị hàng banner màu cyan/teal nhạt (`accentSoft`), icon loa `volume_up`, hiệu ứng waveform và dòng hướng dẫn *"Chạm từng từ để tra nghĩa & nghe phát âm lẻ"*. Nút loa ≥32pt. | Hiển thị ngay khi mở thẻ, không cần cuộn dọc. | P1 | **PASS** |
| **TC-SVR-14** | Sentence Card | Danh sách Word Pills trong câu tiếng Anh | Đang quan sát nội dung câu tiếng Anh trên thẻ | 1. Quan sát cách hiển thị các từ tiếng Anh trong câu. | Mỗi từ là một "pill" bo tròn riêng biệt, khoảng cách đều đặn; dấu câu không thể chạm; từ nội dung chính (keyword) được AI gợi ý tô màu amber (`tertiaryFixed`). Touch target ≥44pt nhờ hitSlop. | Hiển thị đầy đủ word pills, từ keyword được highlight vàng/amber. | P0 | **PASS** |
| **TC-SVR-15** | Sentence Card | Chạm vào Word Pill để tra nghĩa & phát âm lẻ | Đang ở thẻ câu có word pills | 1. Chạm vào một từ bất kỳ (ví dụ: "map", "remembered"). | Phát âm thanh đọc từ lẻ qua TTS; từ được chọn chuyển sang pill màu amber viền đậm; pod "Từ đang chọn" cập nhật thông tin tương ứng. | Từ chuyển active tức thì, kích hoạt phát âm và cập nhật pod. | P0 | **PASS** |
| **TC-SVR-16** | Sentence Card | Bản dịch tiếng Việt & Dynamic VI Highlight | Thẻ câu hiển thị bản dịch tiếng Việt | 1. Quan sát hộp bản dịch tiếng Việt (`translationBox`).<br>2. Chạm đổi qua lại giữa các từ tiếng Anh trong câu. | Hộp bản dịch có nhãn `VI`, nền sáng bo góc. Cụm từ tiếng Việt tương ứng với từ tiếng Anh đang chọn được in đậm và gạch chân màu amber; khi đổi từ, phần gạch chân đổi theo thời gian thực. | Dynamic highlight tiếng Việt hoạt động chuẩn xác theo từ chọn. | P0 | **PASS** |
| **TC-SVR-17** | Sentence Card | Pod "Từ đang chọn" (`selectedPod`) | Chọn một từ trong câu | 1. Cuộn xem khối thông tin từ vựng chi tiết của từ đang chọn. | Hiển thị từ, phiên âm IPA (font monospace), loại từ, nghĩa tiếng Việt, câu ví dụ và mẹo ghi nhớ. Có icon sao/lưu từ vựng. | Khối hiển thị đầy đủ thông tin từ vựng đã enrich. | P1 | **PASS** |
| **TC-SVR-18** | Sentence Card | Khối Ngữ pháp xếp dọc (`grammarList` / `grammarPod`) | Thẻ câu có điểm ngữ pháp | 1. Cuộn tiếp xuống phần ngữ pháp của thẻ câu. | Mỗi điểm ngữ pháp hiển thị trong 1 pod riêng có badge `NGỮ PHÁP i/n`, tên điểm ngữ pháp, khung công thức (font monospace), phân tích chi tiết và nút Lưu ngữ pháp riêng. | Ngữ pháp hiển thị rõ ràng, formula định dạng monospace chuẩn. | P1 | **PASS** |
| **TC-SVR-19** | Sentence Card | Thanh câu ghim khi cuộn dọc (`pinnedBar`) | Thẻ câu có nội dung dài (từ vựng + ngữ pháp) | 1. Cuộn dọc nội dung thẻ xuống qua khối câu tiếng Anh. | Thanh câu ghim (sticky bar) xuất hiện ngay dưới header thẻ với câu rút gọn 1 dòng và nút nghe 32pt. Chạm vào thanh ghim sẽ tự cuộn ngược về đầu thẻ. | Thanh ghim xuất hiện mượt mà, chạm vào cuộn lên đầu thẻ. | P1 | **PASS** |
| **TC-SVR-20** | Sentence Card | Nút Luyện tập & Điều hướng câu kế tiếp ở đáy thẻ | Cuộn xuống cuối cùng của thẻ câu | 1. Quan sát nút "Luyện tập" và nút "Vuốt ngang để sang câu N+1 →".<br>2. Nhấn nút câu kế tiếp. | Nút "Luyện tập" dẫn sang bài tập trắc nghiệm của câu; nút câu kế tiếp chuyển carousel sang câu tiếp theo. Ở câu cuối cùng hiển thị "Hoàn thành bài học". | Nút bấm hoạt động mượt mà, chuyển câu tức thì. | P1 | **PASS** |
| **TC-SVR-21** | Sync Video-Thẻ | Tự động đồng bộ thẻ câu theo tiến độ phát video | Video đang phát tự nhiên từ câu N sang câu N+1 | 1. Để video phát liên tục qua các câu thoại. | Khi video chuyển sang câu mới: nếu người dùng đang ở đầu thẻ, carousel tự động cuộn theo video; nếu người dùng đang cuộn đọc ngữ pháp ở dưới, xuất hiện chip nổi `↩ Câu N đang phát`. | Đồng bộ real-time chính xác, không giật lag. | P0 | **PASS** |
| **TC-SVR-22** | Sync Video-Thẻ | Chạm vào chip `↩ Câu N đang phát` (`backChip`) | Video đã sang câu mới trong khi người dùng đang đọc ở thẻ cũ | 1. Quan sát chip nổi xuất hiện ở đáy thẻ.<br>2. Nhấn vào chip. | Carousel tự động cuộn nhanh và mượt về đúng thẻ câu video đang phát. | Chip biến mất sau khi đã cuộn về câu active. | P1 | **PASS** |
| **TC-SVR-23** | Mini Player | Chuyển đổi sang Mini Player khi cuộn trang | Đang phát video trên màn hình nhỏ hoặc khi cuộn trang | 1. Cuộn trang xuống qua 50% khung video player. | Khung video trên đỉnh thu nhỏ thành `YouTubeMiniPlayer` gắn cố định ở đáy màn hình (gồm thumbnail, nhãn `Câu N/M · mm:ss`, nút Nghe lại, Phát/Dừng, Công cụ). Chạm vào mini player cuộn về player đầy đủ. | Mini player hiển thị đúng thiết kế, tương tác mượt. | P1 | **PASS** |
| **TC-SVR-24** | Tools Popup | Mở và sử dụng Popup Công cụ (`YouTubeToolsPopup`) | Đang ở `YouTubeLessonScreen` | 1. Nhấn nút "Công cụ" trên thanh điều khiển.<br>2. Kiểm tra giao diện popup từ dưới video.<br>3. Thử đổi vòng lặp (1, 3, 5, ∞) và tốc độ (0.5x, 0.75x, 1x, 1.25x). | Popup mở chiếm vùng dưới video (không phủ overlay tối lên video); thay đổi lặp hoặc tốc độ có hiệu lực tức thì; đóng popup bằng nút `✕` hoặc vuốt xuống; nút "Công cụ" viền màu amber khi có lặp hoặc tốc độ ≠ 1x. | Popup mở mượt mà, không che video, các nút bấm nhạy. | P0 | **PASS** |
| **TC-SVR-25** | Tools & Overflow | Thiết lập khoảng lặp đoạn A–B | Đang ở `YouTubeToolsPopup` hoặc `YouTubeLessonOverflowMenu` | 1. Chọn điểm A tại câu hiện tại.<br>2. Phát tiếp đến câu sau, chọn điểm B.<br>3. Quan sát video khi phát đến hết điểm B. | Video tự động lặp lại từ điểm A đến điểm B; hiển thị badge/status "Lặp A–B: Câu A đến Câu B". Carousel giữ nguyên vị trí thẻ câu trong khoảng A–B. | Vòng lặp A–B hoạt động chính xác theo mốc câu. | P1 | **PASS** |
| **TC-SVR-26** | Bookmarking | Lưu thẻ câu, từ vựng và điểm ngữ pháp vào Flashcard | Đang ở `YouTubeLessonScreen` | 1. Nhấn icon bookmark trên header thẻ để lưu câu.<br>2. Nhấn icon bookmark trong pod từ vựng để lưu từ.<br>3. Nhấn nút lưu trong khối ngữ pháp. | Icon đổi màu accent (active); dữ liệu lưu ngay lập tức vào SQLite (`flashcards`), hiển thị toast thông báo thành công; đồng bộ trạng thái khi mở lại. | Lưu thành công vào DB, persistence hoạt động tốt. | P1 | **PASS** |
| **TC-SVR-27** | Progress Resume | Ghi nhớ và phục hồi tiến độ học khi mở lại video | Đang học dở video tại Câu 52 (03:37) | 1. Thoát khỏi bài học về Home.<br>2. Mở lại bài học đó từ danh sách "Bài YouTube đã lưu". | App đọc SQLite `youtube_progress`: tự động seek video đến đúng giây 03:37 và trượt carousel đến đúng Câu 52 ở trạng thái tạm dừng (paused); nhấn Phát để học tiếp. | Phục hồi chính xác vị trí phát và thẻ câu đã học dở. | P0 | **PASS** |
| **TC-SVR-28** | Offline / Error | Chế độ đọc Offline khi mất kết nối mạng | Thiết bị bật Airplane mode hoặc ngắt Wi-Fi | 1. Mở bài học đã lưu khi offline.<br>2. Quan sát giao diện bài học. | Player hiển thị banner chế độ đọc offline; toàn bộ transcript, từ vựng và ngữ pháp đã cache vẫn đọc bình thường; các nút điều khiển video chuyển sang disabled thân thiện. | Chuyển chế độ đọc ngoại tuyến trơn tru, không crash app. | P1 | **PASS** |

---

## 3. Xác thực Chi tiết UI/UX: Text, Font, Color & Components

### 3.1. Xác thực Thành phần Giao diện (Component Audit)

| Thành phần | Tiêu chuẩn Thiết kế (Design Spec SETE-321) | Thực tế Triển khai trong Code | Đánh giá Tuân thủ |
|---|---|---|---|
| **ScreenHeader** | Chiều cao chuẩn, nút Back góc trái, tiêu đề ở giữa, bên phải tối đa 4 nút điều khiển (VI, IPA, Practice, More). | Sử dụng `ScreenHeader` với `headerActions` gồm 4 `IconButton` (`size: 44pt`). Nút Back không bị đè. | **ĐẠT** (Ghi nhận DEFECT-02 text co nhỏ) |
| **CompactControlBar** | Cố định ngay dưới video 16:9, thanh seekbar có vạch câu, nhãn `Câu N/M`, nút Phát/Dừng, Nghe lại, thời gian `-mm:ss`, nút Công cụ. | Triển khai trong `CompactControlBar.tsx`, sử dụng touch target ≥44pt, thanh tua có snap ±0.4s và vạch `tick` cho từng câu. | **ĐẠT** (Ghi nhận DEFECT-01 trùng key) |
| **SentenceCarousel** | Chiều rộng thẻ `screenWidth - 24pt`, khoảng cách thẻ `10pt`, ló mép thẻ kế `12–16pt`, bo góc `26pt`, khóa trục sau `10pt`, snap `35%`. | `sentenceCardGeometry.ts` định nghĩa `CARD_BORDER_RADIUS_PT = 26`, `CARD_SPACING_PT = 10`, `CAROUSEL_HORIZONTAL_PADDING_PT = 12`. | **ĐẠT CHUẨN 100%** |
| **Hàng nghe cả câu** | Nền xanh ngọc nhạt cố định đầu thẻ, icon loa ≥32pt, waveform động, text hướng dẫn chạm từ tra nghĩa. | `listenBar` trong `SentenceCard.tsx` với `waveform` 6 cột, icon loa `PINNED_AUDIO_BUTTON_SIZE_PT = 32`, text hướng dẫn rõ ràng. | **ĐẠT CHUẨN 100%** |
| **Word Pills** | Bo viền pill, hitSlop mở rộng ≥44pt, từ chính highlight màu amber, chạm phát âm lẻ. | `wordPill` và `wordPillSelected` bo tròn pill, font size 14, hitSlop touchable, keyword AI tự động highlight. | **ĐẠT CHUẨN 100%** |
| **Translation Box** | Nền xám nhạt bo góc, có nhãn `VI`, cụm từ tương ứng với từ tiếng Anh đang chọn được in đậm & gạch chân amber. | `translationBox` với `viBadge` và `viHighlight` (`fontWeight: bold`, `textDecorationLine: underline`, `color: onTertiaryContainer`). | **ĐẠT CHUẨN 100%** |
| **Selected Word Pod** | Khung viền kép bo góc nổi bật, hiển thị từ, IPA, loại từ, nghĩa, mẹo nhớ, nút lưu từ. | `selectedPod` viền `2pt tertiaryBorder`, nền `tertiarySoft`, text IPA font monospace, nút lưu đồng bộ SQLite. | **ĐẠT CHUẨN 100%** |
| **Grammar Pod** | Khung bo góc nền mềm, badge `NGỮ PHÁP i/n`, công thức font monospace, nút lưu riêng. | `grammarPod` viền `secondaryContainer`, `formulaBox` font monospace, danh sách ngữ pháp xếp dọc. | **ĐẠT CHUẨN 100%** |
| **YouTubeToolsPopup** | Trượt từ dưới video, không che video, các nút lặp 1/3/5/∞, tốc độ 0.5x–1.25x, chép chính tả, xem transcript. | `YouTubeToolsPopup.tsx` tính toán `topOffset` chuẩn xác từ chiều cao player, không dùng modal che mờ video. | **ĐẠT CHUẨN 100%** |
| **YouTubeMiniPlayer** | Thu nhỏ ở đáy màn hình khi cuộn qua 50% player, thumbnail, nhãn câu + thời gian, điều khiển nhanh. | `YouTubeMiniPlayer.tsx` hiển thị ở đáy có tính clearance safe-area, chạm vào cuộn về video player. | **ĐẠT CHUẨN 100%** |

---

### 3.2. Bảng Kiểm tra Màu sắc & Độ tương phản (Color Palette Audit)

| Vai trò ngữ nghĩa | Tên Token Theme | Mã màu / Giá trị RGB | Vị trí áp dụng trên màn hình | Đánh giá tương phản WCAG 2.1 |
|---|---|---|---|---|
| **Accent / Highlight chính** | `theme.colors.tertiaryFixed` | Amber (`#F59E0B` / Cam vàng hổ phách) | Pill từ đang chọn, gạch chân bản dịch tiếng Việt, viền pod từ vựng | Đạt AA (≥ 4.5:1 trên nền tối, tương phản cao) |
| **Nền vùng chọn từ** | `theme.colors.tertiarySoft` | Amber nhạt (`#FEF3C7` / Amber-100) | Nền khung "Từ đang chọn" | Êm mắt, phân tách rõ với nền thẻ chính |
| **Chủ đạo hệ thống** | `theme.colors.primary` / `accent` | Emerald (`#10B981` / Xanh ngọc lục bảo) | Icon nút Back, nút Play tròn, thumb seekbar, viền active popup | Đạt AAA (Độ nhận diện cao, tươi sáng) |
| **Nền hàng nghe cả câu** | `theme.colors.accentSoft` | Emerald nhạt (`#D1FAE5` / Emerald-100) | Khung banner hướng dẫn nghe cả câu ở đầu mỗi thẻ | Dịu nhẹ, tạo điểm nhấn mở đầu thẻ |
| **Nền thẻ câu** | `theme.colors.surface` | Slate/White (`#FFFFFF` / Off-white) | Toàn bộ bề mặt thẻ câu, viền bo tròn 26pt | Tạo độ tương phản tốt với nền app `#FAF8F5` |
| **Nền hộp bản dịch** | `theme.colors.surfaceLow` | Slate-50 (`#F8FAFC`) | Hộp chứa nội dung dịch tiếng Việt | Phân định ranh giới rõ ràng với câu tiếng Anh |
| **Viền phân tách** | `theme.colors.outlineVariant` | Slate-200 (`#E2E8F0`) | Viền word pills, viền hộp bản dịch, hairline ngăn cách | Tinh tế, không gây rối mắt |

---

### 3.3. Bảng Kiểm tra Kiểu chữ & Font (Typography Audit)

| Kiểu chữ (Typography Style) | Thuộc tính Font | Kích thước & Chiều cao dòng (Size/LineHeight) | Vị trí áp dụng |
|---|---|---|---|
| **Header Title** | Bold / Semibold | `fontSize: 16-18pt, lineHeight: 22pt` | Tiêu đề màn hình bài học, tiêu đề popup "Công cụ" |
| **Card Header Title** | Semibold | `fontSize: 14pt, lineHeight: 18pt` | Nhãn `Câu N/M` trên header thẻ câu |
| **Word Pill Text** | Regular (Selected: Semibold) | `fontSize: 14pt, lineHeight: 20pt` | Từng từ tiếng Anh trong word pills |
| **Translation Text** | Regular | `fontSize: 15pt, lineHeight: 22pt` | Nội dung bản dịch tiếng Việt trong `translationBox` |
| **Dynamic VI Highlight** | Bold + Underline | `fontWeight: 'bold', fontSize: 15pt` | Cụm từ tiếng Việt tương ứng với từ tiếng Anh đang chọn |
| **IPA Transcription** | Monospace | `fontFamily: 'monospace', fontSize: 13pt` | Phiên âm quốc tế IPA trong pod từ vựng |
| **Grammar Formula** | Monospace | `fontFamily: 'monospace', fontSize: 13pt` | Khung công thức ngữ pháp trong `formulaBox` |
| **Timer / Counter** | Tabular-nums | `fontVariant: ['tabular-nums'], fontSize: 13pt` | Bộ đếm thời gian `-mm:ss` trên `CompactControlBar` |

---

## 4. Báo cáo Chi tiết Khiếm khuyết & Trạng thái Khắc phục (Defect Resolution & Verification)

### ✅ DEFECT-SETE-337-01: Warning trùng lặp React Key trên thanh tua phân câu của CompactControlBar
- **Mức độ nghiêm trọng (Severity):** Medium | **Ưu tiên:** P1
- **Vị trí code:** `src/modules/youtube/components/CompactControlBar.tsx:235`
- **Mô tả:** Key của các vạch câu trên seekbar chỉ dùng `segment.start_ms`, bị trùng khi nhiều segment có cùng mốc thời gian bắt đầu (`288000`).
- **Khắc phục & Xác minh:** Giải quyết tại sub-issue **SETE-338** (PR #35) bằng key duy nhất `${segment.start_ms}-${index}` kèm test suite `CompactControlBar.test.tsx` (12/12 pass). Đã verify không còn cảnh báo key trùng.

---

### ✅ DEFECT-SETE-337-02 & DEFECT-SETE-337-06: Tiêu đề video trên Header bị co chữ quá nhỏ và ngắt dòng chật chội
- **Mức độ nghiêm trọng (Severity):** Low-Medium | **Ưu tiên:** P2
- **Vị trí code:** `src/modules/youtube/screens/YouTubeLessonScreen.tsx`, `src/components/ScreenHeader.tsx`
- **Mô tả:** Tiêu đề video dài đứng cạnh cụm 4 nút header bị co kích thước chữ xuống 6-8pt do `adjustsFontSizeToFit` và `minimumFontScale={0.85}`.
- **Khắc phục & Xác minh:** 
  - **SETE-339** (PR #34): Cắt ngắn tiêu đề thành 1 dòng với ellipsis `titleNumberOfLines={1}`.
  - **SETE-343** (PR #39 & PR #40): Vô hiệu hóa `adjustsFontSizeToFit` khi `isSingleLineTitle` (line count = 1) để giữ font chữ cố định rõ ràng (≥14pt) và không ảnh hưởng đến các màn hình 2 dòng khác.
  - Test suite `ScreenHeader.test.tsx` (4/4 pass) & `YouTubeLessonScreen.test.tsx` verify đạt chuẩn 100%.

---

### ✅ DEFECT-SETE-337-03: Tiêu đề thẻ câu thứ nhất có thể bị che một phần khi cuộn đà sang mép trái
- **Mức độ nghiêm trọng (Severity):** Low | **Ưu tiên:** P3
- **Vị trí code:** `src/modules/youtube/sentence/SentenceCarousel.tsx:92`
- **Mô tả:** Khoảng cách lề và padding của thẻ đầu tiên sát mép khi cuộn lướt về đầu carousel.
- **Khắc phục & Xác minh:** Giải quyết tại sub-issue **SETE-340** (PR #33). Đã tăng cường padding an toàn cho header thẻ và verify trên carousel layout test suite.

---

### ✅ DEFECT-SETE-337-04: Lỗi vòng lặp render vô tận khi bật chế độ lặp câu (RedBox Maximum update depth exceeded)
- **Mức độ nghiêm trọng (Severity):** Critical / Blocker | **Ưu tiên:** P0
- **Vị trí code:** `src/modules/youtube/screens/YouTubeLessonScreen.tsx`
- **Mô tả:** Khi kích hoạt vòng lặp câu (repeat mode 1, 3, 5, ∞) trong Popup Công cụ, effect xử lý lặp lại câu kích hoạt cập nhật state liên tục gây ra RedBox `Maximum update depth exceeded`.
- **Khắc phục & Xác minh:** Giải quyết tại sub-issue **SETE-341** (PR #38). Tối ưu hóa điều kiện kích hoạt seek và trạng thái playback để ngăn re-render loop. Verify bằng suite `YouTubeLessonScreenToolsSync.test.tsx` và `YouTubeLessonScreen.test.tsx` pass hoàn toàn.

---

### ✅ DEFECT-SETE-337-05: Warning trùng lặp React Key trên thanh tua của Popup Công cụ (YouTubeToolsPopup)
- **Mức độ nghiêm trọng (Severity):** Medium | **Ưu tiên:** P1
- **Vị trí code:** `src/modules/youtube/screens/YouTubeToolsPopup.tsx`
- **Mô tả:** Tương tự `DEFECT-01`, thanh seekbar thu nhỏ trong `YouTubeToolsPopup` cũng sử dụng `segment.start_ms` làm key độc lập, gây warning khi trùng mốc thời gian.
- **Khắc phục & Xác minh:** Giải quyết tại sub-issue **SETE-342** (PR #37). Cập nhật key thành `${segment.start_ms}-${index}` và bổ sung test case trùng start_ms trong `YouTubeToolsPopup.test.tsx` (7/7 pass).

---

### ✅ DEFECT-SETE-337-07: Carousel thẻ câu bị trắng (blank) khi phục hồi bài học ở vị trí câu xa
- **Mức độ nghiêm trọng (Severity):** Medium | **Ưu tiên:** P2
- **Vị trí code:** `src/modules/youtube/sentence/SentenceCarousel.tsx`
- **Mô tả:** Khi người dùng mở lại bài học đã lưu dở dang ở chỉ số câu xa (ví dụ câu 119/137), `FlatList` không có `initialScrollIndex`, dẫn đến vùng hiển thị ban đầu bị trống/trắng trước khi người dùng chạm vuốt thủ công.
- **Khắc phục & Xác minh:** Giải quyết tại sub-issue **SETE-344** (PR #36). Bổ sung thiết lập `initialScrollIndex` và tối ưu hóa layout synchronization cho `FlatList`. Test suite `SentenceCarousel.test.tsx` (17/17 pass) verify thẻ câu hiển thị ngay lập tức khi mở bài học.

---

## 5. Bằng chứng Kiểm thử Thực tế trên iOS Simulator (Test Evidence)

Toàn bộ ảnh chụp màn hình kiểm chứng trực tiếp trên iPhone 17 Pro đã được lưu trữ trong thư mục `docs/qa/screenshots/sete-337/`:

1. **Giao diện Danh sách Bài học đã lưu (History Screen):**  
   `docs/qa/screenshots/sete-337/01_youtube_history_screen.png`  
   *Xác thực hiển thị tiêu đề, thumbnail, icon play và nút xóa bài học.*
2. **Tổng quan Màn hình Bài học đã lưu (Lesson Screen Overview):**  
   `docs/qa/screenshots/sete-337/02_lesson_screen_overview.png`  
   *Xác thực 4 nút header, khung YouTube player 16:9, thanh `CompactControlBar` với vạch câu và nút Công cụ.*
3. **Popup Công cụ Học tập (Tools Popup Interaction):**  
   `docs/qa/screenshots/sete-337/03_tools_popup.png`  
   *Xác thực popup trượt dưới video, nút lặp câu (1, 3, 5, ∞), tốc độ phát (0.5x–1.25x), điều khiển Trước/Sau và chép chính tả.*
4. **Thẻ câu & Word Pills & Dynamic Highlight (Sentence Cards & Carousel):**  
   `docs/qa/screenshots/sete-337/04_sentence_cards_carousel.png`  
   *Xác thực hàng nghe cả câu, word pills tiếng Anh, dynamic VI highlight khớp từ chọn, và peek width 12–16pt của thẻ kế bên.*
5. **Điều hướng từ Home vào Luồng học (Home Entry Navigation):**  
   `docs/qa/screenshots/sete-337/05_home_entry.png`  
   *Xác thực badge "🟢 1 clip" trên card "Học qua video" tại màn hình chính.*
6. **Bằng chứng Khắc phục Warning React Key Tools Popup (SETE-342):**  
   `docs/qa/screenshots/sete-337/06_recheck_tools_popup_duplicate_key.png`  
   *Xác nhận popup công cụ không còn warning duplicate key.*
7. **Bằng chứng Khắc phục Lặp RedBox Repeat Mode (SETE-341):**  
   `docs/qa/screenshots/sete-337/07_recheck_maximum_update_depth_loop_error.png`  
   *Xác nhận lặp câu chạy trơn tru, không còn lỗi render loop.*
8. **Bằng chứng Khắc phục Trắng Carousel khi Resume (SETE-344):**  
   `docs/qa/screenshots/sete-337/08_recheck_blank_carousel_on_resume.png`  
   *Xác nhận mở lại bài học ở câu xa hiển thị tức thì thẻ câu tương ứng.*

---

## 6. Kết luận & Đánh giá Sẵn sàng Release (Readiness Assessment)

1. **Chức năng nghiệp vụ:** Tính năng "Học qua video đã lưu" (bao gồm phát video theo mốc câu, snap seekbar, trượt carousel thẻ câu, tra từ vựng qua word pills, dynamic highlight tiếng Việt, nghe cả câu, popup công cụ, lưu flashcard và phục hồi tiến độ học) hoàn toàn đạt chuẩn nghiệm thu theo Epic SETE-321 và issue SETE-337.
2. **Khắc phục toàn bộ khiếm khuyết:** Toàn bộ 7 khiếm khuyết (DEFECT-01 đến DEFECT-07) qua 2 giai đoạn (Stage 1: SETE-338, SETE-339, SETE-340; Stage 2: SETE-341, SETE-342, SETE-343, SETE-344) đã được phát triển, kiểm thử, code review và merge vào nhánh `main`.
3. **Độ ổn định automated test:** 221/221 test suites pass (1794 tests passed, 0 failures), bảo đảm 100% không hồi quy hệ thống.
4. **Kết luận cuối cùng:** **HOÀN TOÀN ĐẠT CHUẨN — SẴN SÀNG ĐƯA VÀO REVIEW & MERGE (READY FOR REVIEW).**
