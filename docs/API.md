# API Reference

Base URL when running locally: `http://localhost:4000`  
When using Docker frontend at port 3000, the app proxies `/api` to the backend; use relative paths (e.g. `/api/polls`) from the frontend.

---

## Health Check

### GET /health

Returns service status. No authentication required.

**Response** `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2026-02-11T12:00:00.000Z"
}
```

---

## Polls

### GET /api/polls

Returns a list of recent polls, newest first (max 50). Each poll includes its options and vote counts.

**Response** `200 OK`

```json
[
  {
    "id": "clxx...",
    "question": "Best programming language?",
    "createdAt": "2026-02-11T11:00:00.000Z",
    "options": [
      { "id": "clxy...", "pollId": "clxx...", "text": "JavaScript", "voteCount": 10 },
      { "id": "clxz...", "pollId": "clxx...", "text": "Python", "voteCount": 7 }
    ]
  }
]
```

**Errors**

- `500` — Server error (e.g. database failure).

---

### GET /api/polls/:id

Returns a single poll by ID with all options and vote counts.

**Parameters**

- `id` (path) — Poll ID (cuid).

**Response** `200 OK`

```json
{
  "id": "clxx...",
  "question": "Best programming language?",
  "createdAt": "2026-02-11T11:00:00.000Z",
  "options": [
    { "id": "clxy...", "pollId": "clxx...", "text": "JavaScript", "voteCount": 10 },
    { "id": "clxz...", "pollId": "clxx...", "text": "Python", "voteCount": 7 }
  ]
}
```

**Errors**

- `404` — Poll not found. Body: `{ "error": "Poll not found" }`
- `500` — Server error.

---

### POST /api/polls

Creates a new poll. Requires a question and at least two non-empty options.

**Request body**

```json
{
  "question": "What is your favorite color?",
  "options": ["Red", "Blue", "Green"]
}
```

| Field     | Type     | Required | Description                          |
|----------|----------|----------|--------------------------------------|
| question | string   | Yes      | Poll question (trimmed, non-empty).  |
| options  | string[] | Yes      | Option labels; minimum 2, non-empty after trim. |

**Response** `201 Created`

Returns the created poll with options (voteCount 0 for each):

```json
{
  "id": "clxx...",
  "question": "What is your favorite color?",
  "createdAt": "2026-02-11T12:00:00.000Z",
  "options": [
    { "id": "clxy...", "pollId": "clxx...", "text": "Red", "voteCount": 0 },
    { "id": "clxz...", "pollId": "clxx...", "text": "Blue", "voteCount": 0 },
    { "id": "cly0...", "pollId": "clxx...", "text": "Green", "voteCount": 0 }
  ]
}
```

**Errors**

- `400` — Validation error. Body: `{ "error": "..." }`
  - `"Question is required"`
  - `"Options must be an array"`
  - `"At least 2 options are required"`
- `500` — Server error.

---

### POST /api/polls/:id/vote

Records a vote for an option. The option must belong to the poll specified by `:id`.

**Parameters**

- `id` (path) — Poll ID (cuid).

**Request body**

```json
{
  "optionId": "clxy..."
}
```

| Field    | Type   | Required | Description                    |
|----------|--------|----------|--------------------------------|
| optionId | string | Yes      | ID of the option to vote for.  |

**Response** `200 OK`

Returns the full poll with updated option vote counts:

```json
{
  "id": "clxx...",
  "question": "Best programming language?",
  "createdAt": "2026-02-11T11:00:00.000Z",
  "options": [
    { "id": "clxy...", "pollId": "clxx...", "text": "JavaScript", "voteCount": 11 },
    { "id": "clxz...", "pollId": "clxx...", "text": "Python", "voteCount": 7 }
  ]
}
```

**Errors**

- `400` — Invalid request. Body: `{ "error": "..." }`
  - `"optionId is required"`
  - `"Invalid option for this poll"`
- `500` — Server error.

---

## Error Format

All error responses are JSON:

```json
{
  "error": "Human-readable message"
}
```

HTTP status codes: `400` (bad request), `404` (not found), `500` (server error).
