# User Stories & Acceptance Criteria

## 1. Epic: English content input

### US-001 — Take photo

As a beginner English learner, I want to take a photo of English text so that I can learn from real-world content.

#### Acceptance criteria

```gherkin
Given I am on the Home or Scan screen
When I tap "Chụp ảnh"
Then the app opens the camera

Given I have taken a photo
When I confirm the photo
Then the app shows the image preview or starts OCR

Given camera permission is denied
When I tap "Chụp ảnh"
Then the app shows a clear permission message
And provides a way to open settings or choose another input method
```

---

### US-002 — Upload image

As a learner, I want to upload an image from my gallery so that I can analyze screenshots, flyers, or saved images.

#### Acceptance criteria

```gherkin
Given I am on the input screen
When I tap "Upload ảnh"
Then the app opens the image picker

Given I select a valid image
When selection is completed
Then the app displays the selected image preview

Given I select an unsupported file
Then the app shows an error message
```

---

### US-003 — Paste text

As a learner, I want to paste English text manually so that I can analyze text without an image.

#### Acceptance criteria

```gherkin
Given I am on the input screen
When I choose "Paste text"
Then the app shows a text input area

Given I paste valid text
When I tap "Analyze"
Then the app sends the text for AI analysis

Given the text area is empty
When I tap "Analyze"
Then the app prevents submission and shows validation message
```

---

## 2. Epic: OCR and text review

### US-004 — Extract text from image

As a learner, I want the app to extract text from my image so that I do not need to type manually.

#### Acceptance criteria

```gherkin
Given I selected an image with clear English text
When OCR processing completes
Then the app displays extracted text

Given the image has no readable text
When OCR processing completes
Then the app shows a "no text detected" message
And allows me to retry or paste text manually
```

---

### US-005 — Edit OCR text

As a learner, I want to edit extracted text before analysis so that OCR mistakes do not affect my lesson.

#### Acceptance criteria

```gherkin
Given OCR has extracted text
When I edit the text
Then the updated text is saved in the review screen

Given I tap "Analyze"
When the app sends data to AI
Then the app uses my edited text, not the raw OCR text
```

---

## 3. Epic: AI lesson results

### US-006 — View Vietnamese translation

As a beginner, I want to see the Vietnamese translation so that I can understand the meaning quickly.

#### Acceptance criteria

```gherkin
Given AI analysis is successful
When the result screen opens
Then I see the original text
And I see the Vietnamese translation

Given the input contains multiple sentences
Then each sentence also has its own Vietnamese translation
```

---

### US-007 — Learn sentence breakdown

As a learner, I want to see how each sentence is broken down so that I understand sentence structure.

#### Acceptance criteria

```gherkin
Given AI analysis is successful
When I open "Học từng câu"
Then I see each sentence separately
And each sentence includes translation and breakdown

Given a sentence has meaningful parts
Then each part shows English text and Vietnamese meaning
```

---

### US-008 — Learn grammar points

As a learner, I want the app to show grammar points from the text so that I understand why the sentence is written that way.

#### Acceptance criteria

```gherkin
Given the input contains a clear grammar pattern
When I open the Grammar section
Then I see grammar name, Vietnamese explanation, pattern, and examples

Given the input has no important grammar point
Then the app shows a friendly empty state instead of an error
```

---

### US-009 — Learn vocabulary

As a learner, I want to see important vocabulary so that I know which words to remember.

#### Acceptance criteria

```gherkin
Given AI analysis is successful
When I open Vocabulary section
Then I see important words or phrases from the input text
And each item has Vietnamese meaning

Given a vocabulary item has pronunciation data
Then the app shows pronunciation guide or play button
```

---

### US-010 — Listen to pronunciation

As a learner, I want to hear words and sentences so that I can learn how they sound.

#### Acceptance criteria

```gherkin
Given audio is available
When I tap the play button for a sentence
Then the app plays the sentence audio

Given audio is not available
Then the app still shows a pronunciation guide when possible
```

---

## 4. Epic: Save and review lessons

### US-011 — Save lesson

As a learner, I want to save a lesson so that I can review it later.

#### Acceptance criteria

```gherkin
Given I am on the result screen
When I tap "Lưu bài học"
Then the lesson is saved
And the button state changes to saved

Given the lesson is already saved
When I tap the saved button again
Then the app should not create a duplicate lesson
```

---

### US-012 — View saved lessons

As a learner, I want to see my saved lessons so that I can continue learning.

#### Acceptance criteria

```gherkin
Given I have saved lessons
When I open the Lessons tab
Then I see a list of saved lessons

Given I tap a lesson
Then the app opens the lesson detail
And no new AI analysis is required

Given I have no saved lessons
Then I see an empty state with a CTA to scan text
```

---

## 5. Epic: Practice

### US-013 — Complete short practice

As a learner, I want to answer quick questions so that I can remember what I learned.

#### Acceptance criteria

```gherkin
Given a lesson has practice questions
When I open Quick Practice
Then I see questions based on the lesson

Given I select an answer
Then the app shows whether it is correct
And shows the correct answer or explanation
```

---

## 6. Epic: Error recovery

### US-014 — Retry AI analysis

As a user, I want to retry when AI analysis fails so that I do not need to start over.

#### Acceptance criteria

```gherkin
Given AI analysis fails
When the error message is displayed
Then I can tap Retry
And my confirmed input text is preserved
```

---

### US-015 — Handle network errors

As a user, I want a clear message when the network fails so that I know what to do.

#### Acceptance criteria

```gherkin
Given there is no internet connection
When I try to analyze text
Then the app shows a network error message
And allows me to retry after reconnecting
```
