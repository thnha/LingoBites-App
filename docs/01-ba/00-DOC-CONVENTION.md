# Documentation Convention — `docs/01-ba/`

Quy ước đặt tên, thư mục, và vai trò từng loại tài liệu. Mục tiêu: **mở rộng P1/P2/P3 không lung tung**, không gộp spec vào hub, không revive `MASTER.md`.

---

## 1. Ba lớp tài liệu (không trộn)

| Lớp | Vai trò | Ví dụ | Ai sửa khi ship |
|---|---|---|---|
| **Canonical spec** | Source of truth — FR, API, schema, design | `01-schema/`, `03-requirements/`, `02-technical/01-technical-implementation-spec.md` | Khi đổi hành vi / contract |
| **Ship tracker** | Hub mỏng — status, gate, link | `00-ship-trackers/p0-ship-tracker.md` | Cuối mỗi session code |
| **Session scope** | Giới hạn 1 phiên AI/dev | `02-technical/milestones/M?-brief.md` | Khi milestone đổi scope |

**Cấm:** paste FR/API/wireframe vào ship tracker · gộp toàn bộ BA vào một file · load `90-archive/MASTER.md` cho coding agent.

---

## 2. Thuật ngữ (dùng nhất quán)

| Ký hiệu | Tên | Ý nghĩa | Tài liệu chính |
|---|---|---|---|
| **P0–P3** | Product Phase | Giá trị user theo giai đoạn sản phẩm | `04-product/06-roadmap-release-plan.md` |
| **M0–M5** | Milestone (P0) | Thứ tự build **MT-Core** Phase 0 | `02-technical/02-implementation-plan-m1-m5.md` |
| **MT-*** | Module Track | Nhóm code (Core, Theme, Practice, …) | `02-technical/07-modular-architecture-and-release.md` |
| **Release** | Named flag bundle | Bật module đã QA (`close-beta-1`, …) | `02-technical/release-configs/*.json` |

**P1+ không bắt buộc dùng M0–M5.** P1 có thể dùng milestone riêng (`p1-m1`, …) hoặc brief theo module track.

---

## 3. Cây thư mục chuẩn

```text
docs/01-ba/
├── 00-DOC-CONVENTION.md          ← file này
├── 00-ship-trackers/             ← hub ship (chỉ status + link)
│   ├── README.md
│   ├── p0-ship-tracker.md
│   ├── p1-ship-tracker.md        ← stub → điền khi kickoff P1
│   └── p2-ship-tracker.md        ← stub
├── DECISIONS.md                  ← log thay đổi spec (mới nhất trên cùng)
├── README.md                     ← index theo role
├── 01-schema/                    ← machine-readable (AI output, fixtures)
├── 02-technical/                 ← architecture, API, implementation plans
│   ├── milestones/               ← P0: M0-brief … M5-brief
│   │   └── p1/                   ← (tương lai) brief scope P1
│   └── release-configs/
├── 03-requirements/              ← FR, BR, US, traceability
├── 04-product/                   ← PRD, scope theo phase: *-phaseN-*
├── 05-qa/
├── 06-design/
├── 07-release/
├── 08-operations/
└── 90-archive/                   ← MASTER.md — không dùng khi code
```

---

## 4. Quy tắc đặt tên file

### 4.1 Chung

- **Chữ thường**, từ nối `-`, prefix số thứ tự trong folder (`01-`, `02-`, …).
- **Product phase trong tên file:** `p0`, `p1`, `p2` (không `PHASE0`, không `Phase0`).
- **Milestone P0:** `M0-brief.md` … `M5-brief.md` (giữ như hiện tại).

### 4.2 Theo loại

| Loại | Pattern | Ví dụ |
|---|---|---|
| Ship tracker | `00-ship-trackers/p{N}-ship-tracker.md` | `p0-ship-tracker.md` |
| PRD / scope | `04-product/{NN}-phase{N}-*.md` | `04-phase0-prd.md`, `07-phase1-prd.md` |
| Implementation plan | `02-technical/{NN}-implementation-plan-*.md` | `02-implementation-plan-m1-m5.md` (= P0) |
| Traceability | Một file, **section theo phase** | `05-traceability-matrix.md` § P0, § P1, … |
| QA plan | Một file, **section theo phase** hoặc `05-qa/p1-test-plan.md` nếu quá lớn | |
| Milestone brief (P1+) | `02-technical/milestones/p1/{id}-brief.md` | `p1/flashcards-brief.md` |

### 4.3 Không đặt ở root `docs/01-ba/`

Trừ: `README.md`, `DECISIONS.md`, `00-DOC-CONVENTION.md`.

Spec, tracker, PRD → vào folder số tương ứng.

---

## 5. Ship tracker — khi nào tạo, cập nhật gì

**Một tracker mỏng cho mỗi Product Phase (P0, P1, …).**

| Section bắt buộc | Nội dung |
|---|---|
| Milestone / module status | Bảng ✅ ◐ ☐ + link brief |
| Gap checklist | Chỉ việc còn thiếu so với exit gate |
| FR / QA gate | Link traceability + % Must done |
| Release gate | Link `07-release/*` |
| Open decisions | Provider, tooling chưa lock |
| Link nhanh | Pointer tới canonical — **không copy spec** |

**Cập nhật:** cuối session code + khi đổi milestone + trước release review.

**Index tất cả phase:** [`00-ship-trackers/README.md`](00-ship-trackers/README.md)

---

## 6. Mở rộng P1, P2, P3 — checklist kickoff

Khi bắt **Product Phase mới** (ví dụ P1 — Review & Retention, MT-Practice):

### Bước 1 — Product (canonical)

1. `04-product/07-phase1-prd.md` (số tiếp theo trong `04-product/`)
2. `04-product/08-phase1-feature-scope.md` (nếu cần)
3. Cập nhật `06-roadmap-release-plan.md` nếu scope đổi

### Bước 2 — Requirements

1. Thêm FR/US vào `03-requirements/*` **hoặc** section mới `## Phase 1` trong cùng file
2. Thêm TC vào `05-qa/01-qa-test-plan.md` § Phase 1
3. Thêm section **§ Phase 1** vào `05-traceability-matrix.md`

### Bước 3 — Technical

1. `02-technical/10-implementation-plan-p1-*.md` (plan build P1)
2. Brief scope: `02-technical/milestones/p1/*-brief.md`
3. Feature registry + release JSON nếu ship behind flag (`08-feature-registry-release-config.md`)

### Bước 4 — Ship tracker

1. Điền `00-ship-trackers/p1-ship-tracker.md` (thay stub)
2. Link từ `README.md` và `00-ship-trackers/README.md`

### Bước 5 — Governance

1. Follow `09-phase-n-workflow-and-release-governance.md`
2. Entry `DECISIONS.md` nếu đổi core loop / schema / navigation

**P1+ ship qua feature flag** — không phá P0; module xong + QA + dependency → release config riêng.

---

## 7. Conflict resolution (đã có — nhắc lại)

1. `01-schema/01-ai-output-v1.ts`
2. `02-technical/01-technical-implementation-spec.md`
3. `03-requirements/01-functional-requirements.md` + `02-business-rules.md`
4. `06-design/*`

Đổi spec: `11-spec-change-protocol.md` → canonical → fixtures/tests → code → traceability → `DECISIONS.md`.

---

## 8. AI coding agent — đọc gì

| Khi | Đọc |
|---|---|
| Mỗi session | `DECISIONS.md` → `10-ai-session-contract.md` → **một** `milestones/*-brief.md` |
| PO / tiến độ | `00-ship-trackers/p{N}-ship-tracker.md` |
| Không bao giờ | `90-archive/MASTER.md` |

---

## 9. Anti-patterns (tránh lung tung)

| ❌ Không | ✅ Thay bằng |
|---|---|
| `PHASE0-SHIP-TRACKER.md` ở root | `00-ship-trackers/p0-ship-tracker.md` |
| Gộp PRD + FR + tracker 1 file | Tracker link → canonical |
| Tạo `MASTER-v2.md` | Giữ modular + tracker |
| Milestone brief P1 trong `M6-brief.md` | `milestones/p1/…` |
| FR P1 chỉ trong tracker | Section trong traceability matrix |
| Ship P1 module không có flag | Registry + release JSON + QA matrix |
