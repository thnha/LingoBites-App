# AI Output Requirements

## 1. Goal

The AI service must turn English input into structured English-learning output that is easy for Vietnamese beginners to understand.

---

## 2. Role of AI

AI plays the role of:

```text
English teacher for Vietnamese beginners
```

AI does not only translate. AI must:

- Translate naturally.
- Split into sentences.
- Explain sentence structure.
- Select important vocabulary.
- Identify grammar.
- Suggest pronunciation.
- Create simple practice exercises.

---

## 3. AI Output Principles

1. Output must be valid JSON.
2. No markdown in JSON values unless the field allows it.
3. Do not use complex terminology without explanation.
4. All grammar/vocabulary should come from the input text.
5. Do not generate too much content that overwhelms learners.
6. Translation must be in Vietnamese.
7. Explanations must suit beginners.

---

## 4. Required JSON Schema — Conceptual Level

> **Source of truth is code, not this description.** The full machine-readable schema (including all
> nested fields, required/optional, defaults) is in `01-schema/01-ai-output-v1.ts` (Zod).
> When implementing or validating, use `validateAIOutput()` from that file. Valid examples:
> `01-schema/fixtures/valid-full.json`, `valid-minimal.json`; error example for retry testing:
> `invalid-missing-field.json`. The conceptual description below is for quick reading only.

```json
{
  "title": "string",
  "detected_language": "English",
  "level": "Beginner",
  "original_text": "string",
  "vietnamese_translation": "string",
  "summary": "string",
  "sentences": [],
  "grammar_points": [],
  "vocabulary": [],
  "pronunciation": {},
  "practice": [],
  "warnings": []
}
```

---

## 5. Full JSON Example

```json
{
  "title": "Special Discount Flyer",
  "detected_language": "English",
  "level": "Beginner",
  "original_text": "We are offering a special discount for new customers. Please visit our store before Friday.",
  "vietnamese_translation": "Chúng tôi đang cung cấp một chương trình giảm giá đặc biệt cho khách hàng mới. Vui lòng ghé cửa hàng của chúng tôi trước thứ Sáu.",
  "summary": "Đoạn này nói về một chương trình giảm giá đặc biệt dành cho khách hàng mới và yêu cầu khách ghé cửa hàng trước thứ Sáu.",
  "sentences": [
    {
      "id": "s1",
      "original": "We are offering a special discount for new customers.",
      "translation": "Chúng tôi đang cung cấp một chương trình giảm giá đặc biệt cho khách hàng mới.",
      "simple_meaning": "Cửa hàng đang có giảm giá cho khách hàng mới.",
      "breakdown": [
        {
          "text": "We",
          "meaning": "Chúng tôi",
          "role": "Subject",
          "simple_role_vi": "Chủ ngữ - người thực hiện hành động"
        },
        {
          "text": "are offering",
          "meaning": "đang cung cấp",
          "role": "Verb phrase",
          "simple_role_vi": "Cụm động từ - hành động đang diễn ra"
        },
        {
          "text": "a special discount",
          "meaning": "một chương trình giảm giá đặc biệt",
          "role": "Object",
          "simple_role_vi": "Tân ngữ - thứ được cung cấp"
        },
        {
          "text": "for new customers",
          "meaning": "cho khách hàng mới",
          "role": "Prepositional phrase",
          "simple_role_vi": "Cụm giới từ - nói rõ dành cho ai"
        }
      ],
      "patterns": [
        {
          "pattern": "S + am/is/are + V-ing + Object",
          "meaning_vi": "Ai đó đang làm gì",
          "example": "They are selling coffee.",
          "example_translation": "Họ đang bán cà phê."
        }
      ],
      "related_grammar_ids": ["g1"],
      "related_vocabulary_ids": ["v1", "v2", "v3"]
    }
  ],
  "grammar_points": [
    {
      "id": "g1",
      "name": "Present Continuous",
      "vietnamese_name": "Thì hiện tại tiếp diễn",
      "pattern": "S + am/is/are + V-ing",
      "found_in": "We are offering...",
      "explanation_vi": "Cấu trúc này dùng để nói ai đó đang làm gì hoặc một việc đang diễn ra trong hiện tại.",
      "beginner_tip": "Khi thấy am/is/are đi với động từ thêm -ing, thường đó là dấu hiệu của thì hiện tại tiếp diễn.",
      "examples": [
        {
          "en": "I am learning English.",
          "vi": "Tôi đang học tiếng Anh."
        },
        {
          "en": "They are opening a new store.",
          "vi": "Họ đang mở một cửa hàng mới."
        }
      ]
    }
  ],
  "vocabulary": [
    {
      "id": "v1",
      "word": "offer",
      "phrase_from_text": "are offering",
      "word_type": "verb",
      "meaning_vi": "cung cấp, đề nghị",
      "pronunciation_guide_vi": "ó-fờ",
      "ipa": "/ˈɔːfər/",
      "cefr_level": "A2",
      "why_important": "Từ này thường gặp trong quảng cáo, email, cửa hàng và dịch vụ.",
      "source_sentence": "We are offering a special discount for new customers.",
      "example": "We offer free tea.",
      "example_translation": "Chúng tôi cung cấp trà miễn phí."
    }
  ],
  "pronunciation": {
    "sentence_audio_texts": [
      "We are offering a special discount for new customers."
    ],
    "focus_words": [
      {
        "word": "discount",
        "pronunciation_guide_vi": "đis-kaunt",
        "tip_vi": "Nhấn âm đầu: DIS-count."
      }
    ]
  },
  "practice": [
    {
      "id": "p1",
      "type": "multiple_choice",
      "question": "\"discount\" nghĩa là gì?",
      "options": ["khách hàng", "giảm giá", "cửa hàng"],
      "answer": "giảm giá",
      "explanation_vi": "Discount nghĩa là giảm giá."
    }
  ],
  "warnings": []
}
```

---

## 6. Required Fields

| Field | Required | Note |
|---|---|---|
| title | Yes | May be auto-generated |
| detected_language | Yes | Phase 0 expected English |
| level | Yes | Default Beginner |
| original_text | Yes | Text after user confirm/edit |
| vietnamese_translation | Yes | Full translation |
| sentences | Yes | May be empty if input cannot be split, but should not be |
| grammar_points | Yes | May be empty array |
| vocabulary | Yes | May be empty array |
| pronunciation | Should | May be empty object |
| practice | Nice | May be empty array |
| warnings | Yes | Empty array if no warnings |

---

## 7. Prompt Template for AI

```text
You are an English teacher for Vietnamese beginners.

Phân tích đoạn tiếng Anh sau và chỉ trả về JSON hợp lệ.
Không thêm markdown, comment hoặc text ngoài JSON.

Trình độ user: người mới học / người Việt bản ngữ.

Tasks:
1. Translate the full text into natural Vietnamese.
2. Split the text into sentences.
3. For each sentence:
   - Provide Vietnamese translation.
   - Explain the simple meaning.
   - Break the sentence into meaningful chunks.
   - Identify simple roles such as Subject, Verb phrase, Object, Time, Place.
   - Provide useful sentence patterns if available.
4. Identify 1 to 3 important grammar points from the text.
5. Explain grammar in simple Vietnamese.
6. Extract important or uncommon vocabulary/phrases.
7. For each vocabulary item, provide:
   - Vietnamese meaning
   - word type
   - pronunciation guide for Vietnamese learners
   - IPA if possible
   - CEFR level if possible
   - example sentence
8. Provide pronunciation focus words when useful.
9. Optionally create 0-3 simple practice questions. Practice is Nice for Phase 0 and may be an empty array.

Rules:
- Keep explanations beginner-friendly.
- Không làm người học bị ngợp.
- Không tự bịa thông tin ngoài input.
- Vocabulary must come from the input text.
- Điểm ngữ pháp phải xuất hiện trong input text.
- Output phải khớp JSON schema đã thống nhất.

Text:
{{input_text}}
```

---

## 8. Validation Rules

Backend/app should validate:

- Output is valid JSON.
- `detected_language` exists.
- `level` exists.
- `original_text` exists.
- `vietnamese_translation` exists.
- `sentences` is an array.
- `vocabulary` is an array.
- `grammar_points` is an array.
- `warnings` is an array.
- Each sentence has `original` and `translation`.
- Each vocabulary item has `word` and `meaning_vi`.

---

## 9. AI Fallback Strategy

| Failure | Fallback |
|---|---|
| Invalid JSON | Retry with stricter prompt |
| Missing vocabulary | Render empty vocabulary state |
| Missing grammar | Render empty grammar state |
| AI timeout | Show retry, keep input |
| Translation poor | Allow regenerate in later phase |
| Too much content | Ask AI to simplify/shorten |

---

## 10. AI Output Quality Checklist

Before showing output, check:

- Is Vietnamese natural?
- Is explanation beginner-friendly?
- Are grammar points actually present in input?
- Are vocabulary items from input?
- Is output too long?
- Is any field missing?
- Does UI have safe fallback for empty arrays?
