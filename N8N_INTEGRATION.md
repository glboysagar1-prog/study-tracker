# N8N Webhook Integration Guide

## Overview

This document explains the N8N webhook integration in the GTU Exam Preparation application. The integration enables AI-powered automation for various features including chat, content generation, and study material processing.

## Architecture

### Integration Strategy

The N8N webhook works **alongside** the existing backend:
- **N8N handles**: Heavy/async tasks (PDF generation, scraping, analytics, AI-powered content)
- **Existing backend handles**: Instant responses, database queries, simple operations
- **Fallback mechanism**: If N8N is unavailable, the app gracefully falls back to the existing backend

### N8N Webhook URL

```
https://samalt0.app.n8n.cloud/webhook/df3ef169-ca71-46c0-a468-ec999d2e80f4/chat
```

## Request Format

All requests to N8N follow this structure:

```json
{
  "sessionId": "session_1234567890_abc123",
  "userId": "user123",
  "eventType": "user_message",
  "payload": {
    "query": "Explain data structures",
    "subjectCode": "3140705",
    ...
  },
  "previousMessages": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help?"
    }
  ]
}
```

### Event Types

| Event Type | Description | Payload Fields |
|------------|-------------|----------------|
| `user_message` | General chatbot queries | `query` |
| `subject_chat` | Subject-specific questions | `subjectCode`, `subjectName`, `query` |
| `generate_notes` | Notes generation | `subjectCode`, `unit`, `topic`, `query` |
| `start_quiz` | Quiz/mock test generation | `subjectCode`, `difficulty`, `topics`, `query` |
| `important_questions` | Important questions lookup | `subjectCode`, `subjectName`, `unit`, `query` |
| `previous_papers` | Previous papers retrieval | `subjectCode`, `subjectName`, `year`, `query` |
| `explain_topic` | Syllabus topic explanations | `subjectCode`, `topic`, `unit`, `query` |
| `scrape_materials` | Trigger material scraping | `subjectCode`, `sources`, `query` |

## Expected Response Format

N8N should return JSON with the following structure:

```json
{
  "answer_preview": "Short summary for quick display",
  "final_answer": "Detailed content or explanation",
  "pdfUrl": "https://example.com/generated.pdf",
  "next_suggestions": [
    "Take practice quiz",
    "Generate flashcards",
    "View related topics"
  ]
}
```

### Response Fields

- **answer_preview** (optional): Short summary shown immediately
- **final_answer** (optional): Detailed response content
- **pdfUrl** (optional): URL to generated PDF file
- **next_suggestions** (optional): Array of suggested follow-up actions

## Session Management

### Session ID Generation

Each user gets a unique `sessionId` stored in localStorage:
```javascript
sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
```

### Session Persistence

- Sessions persist across page refreshes
- Stored in `localStorage` with key `n8n_session_id`
- Can be reset using `n8nService.resetSession()`

### User ID (Optional)

- Currently optional, returns `null` if not authenticated
- Will be populated when user authentication is implemented
- Stored in `localStorage` with key `user_id`

## Integration Points

### 1. ChatBot Component

**File**: `/frontend/src/components/ChatBot.jsx`

**Features**:
- General AI chat interface
- N8N webhook integration with fallback
- Quick reply suggestions from `next_suggestions`
- PDF link display

**Usage**:
```javascript
import n8nService from '../services/n8nService';

const result = await n8nService.sendChatMessage(userInput, previousMessages);
```

### 2. SubjectChat Component

**File**: `/frontend/src/components/SubjectChat.jsx`

**Features**:
- Subject-specific AI tutor
- Maintains conversation context
- Formatted responses with markdown support
- PDF generation support

**Usage**:
```javascript
const result = await n8nService.sendSubjectChat(
  subjectCode,
  subjectName,
  question,
  chatHistory
);
```

### 3. Syllabus Component

**File**: `/frontend/src/components/Syllabus.jsx`

**Features**:
- AI-powered unit summaries
- Topic explanations
- PDF download support

**Usage**:
```javascript
const result = await n8nService.explainTopic(
  subjectCode,
  topicName,
  unitNumber
);
```

### 4. QuickActions Component

**File**: `/frontend/src/components/QuickActions.jsx`

**Features**:
- Reusable action buttons
- Notes generation
- Quiz creation
- Important questions
- Practice papers

**Usage**:
```jsx
<QuickActions
  subjectCode="3140705"
  subjectName="Data Structures"
  onActionComplete={(data) => console.log(data)}
/>
```

## Service Layer

### N8N Service

**File**: `/frontend/src/services/n8nService.js`

**Core Functions**:

```javascript
// General chat
sendChatMessage(message, previousMessages)

// Subject-specific chat
sendSubjectChat(subjectCode, subjectName, question, previousMessages)

// Generate notes
generateNotes(subjectCode, unit, topic)

// Generate quiz
generateQuiz(subjectCode, difficulty, topics)

// Get important questions
getImportantQuestions(subjectCode, subjectName, unit)

// Get previous papers
getPreviousPapers(subjectCode, subjectName, year)

// Explain topic
explainTopic(subjectCode, topic, unit)

// Trigger scraping
scrapeMaterials(subjectCode, sources)

// Reset session
resetSession()
```

## Environment Configuration

### .env File

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5004
VITE_N8N_WEBHOOK_URL=https://samalt0.app.n8n.cloud/webhook/df3ef169-ca71-46c0-a468-ec999d2e80f4/chat
```

### Production Configuration

For production deployment, set environment variables in Vercel:
- `VITE_N8N_WEBHOOK_URL`: Your N8N webhook URL
- `VITE_API_BASE_URL`: Your backend API URL

## Error Handling

### Fallback Mechanism

All N8N integrations include automatic fallback:

```javascript
try {
  // Try N8N first
  const result = await n8nService.sendChatMessage(input, messages);
  if (result.success) {
    // Use N8N response
  } else {
    // Fallback to existing backend
    await fallbackToBackend(input);
  }
} catch (error) {
  // Fallback on error
  await fallbackToBackend(input);
}
```

### Error Messages

User-friendly error messages are displayed when:
- N8N webhook is unavailable
- Network connection fails
- Invalid response format received

## Testing

### Manual Testing Checklist

1. **ChatBot**
   - [ ] Open chatbot and send a message
   - [ ] Verify N8N receives request
   - [ ] Check response displays correctly
   - [ ] Test quick reply suggestions
   - [ ] Test fallback when N8N is down

2. **Subject Chat**
   - [ ] Open subject-specific chat
   - [ ] Ask multiple questions
   - [ ] Verify session persistence
   - [ ] Test PDF link display
   - [ ] Verify fallback behavior

3. **Syllabus**
   - [ ] Click "Summarize with AI"
   - [ ] Verify summary generation
   - [ ] Test PDF download link
   - [ ] Check fallback mechanism

4. **Quick Actions**
   - [ ] Test all action buttons
   - [ ] Verify loading states
   - [ ] Check result display
   - [ ] Test PDF downloads

### Browser Console Testing

```javascript
// Test N8N service directly
import n8nService from './services/n8nService';

// Send test message
const result = await n8nService.sendChatMessage('Hello');
console.log(result);

// Check session ID
console.log(localStorage.getItem('n8n_session_id'));

// Reset session
n8nService.resetSession();
```

## Monitoring

### Request Logging

All N8N requests are logged to console:
```javascript
console.log('N8N webhook error:', error);
console.error('N8N error, falling back to backend:', error);
```

### Session Tracking

Monitor sessions in browser DevTools:
- **Application** → **Local Storage** → `n8n_session_id`

## Future Enhancements

1. **User Authentication**
   - Populate `userId` field when auth is implemented
   - Link sessions to user accounts

2. **Analytics**
   - Track N8N usage metrics
   - Monitor fallback frequency
   - Measure response times

3. **Caching**
   - Cache N8N responses for common queries
   - Reduce webhook calls for repeated questions

4. **Webhooks**
   - Add webhook endpoints for async N8N responses
   - Support long-running operations (PDF generation, scraping)

## Troubleshooting

### Common Issues

**Issue**: N8N webhook not responding
- **Solution**: Check network tab in DevTools, verify webhook URL is correct

**Issue**: Session not persisting
- **Solution**: Check localStorage is enabled, verify `n8n_session_id` exists

**Issue**: Fallback not working
- **Solution**: Ensure existing backend is running on port 5004

**Issue**: PDF links not working
- **Solution**: Verify N8N returns valid `pdfUrl` in response

## Support

For N8N workflow configuration and webhook setup, refer to:
- N8N Documentation: https://docs.n8n.io/
- Webhook Node: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/

## Summary

The N8N integration provides a robust, scalable automation layer for the GTU application while maintaining backward compatibility with the existing backend. The fallback mechanism ensures reliability, and the session management enables contextual conversations across the application.
