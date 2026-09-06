# M3 Brief — OCR Flow

> Session contract: `../10-ai-session-contract.md` · Full plan: `../02-implementation-plan-m1-m5.md §7`

## Goal

Camera/gallery → OCR → review/edit → AI uses **`confirmed_text` only**.

## In scope

- `react-native-image-picker` (not `react-native-vision-camera`)
- Camera + gallery + image preview + replace image
- iOS `Info.plist` + Android permission strings
- `/v1/ocr` multipart upload
- OCR provider adapter
- OCR review/edit screen
- Retry OCR, no-text handling, paste fallback
- Wire: edited text → same AI path as paste (M2)

## Out of scope

- Custom native camera / live preview OCR
- Save lesson to SQLite (M4)
- Storing original images by default
- Post-P0 vision-camera migration

## Canonical reads (session)

1. `AGENTS.md`
2. This file
3. `../04-ai-ocr-integration.md`
4. `03-requirements/02-business-rules.md` — input/OCR rules
5. `06-design/01-user-flow-screen-spec.md` — OCR screens
6. `../01-technical-implementation-spec.md` — OCR API sections

## Allowed write paths

```text
src/modules/input/**
src/modules/ocr/**
ios/**
android/**
```

## Forbidden

- Sending `ocr_raw_text` to AI before user confirms
- `react-native-vision-camera`
- SQLite / lesson history
- Logging full image bytes or extracted text

## Exit tests

- Permission denied → guidance shown
- Gallery image → OCR → review screen
- Clear image → text displayed
- No text → fallback to paste
- Edited OCR text → AI request uses edited text (TC-006)
- 20 sample images internal pass (manual checklist)

## STOP triggers

- AI called before user taps confirm on review screen
- New OCR response fields not in technical-spec
- Implementing save/history in same session without user request
