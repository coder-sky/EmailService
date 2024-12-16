# Email Sending Service

## Overview

This project is a resilient email-sending service implemented in Node.js using Express. It supports multiple email providers, retry logic with exponential backoff, rate limiting, idempotency, and fallback mechanisms. The service is designed for high reliability and scalability, with a simple in-memory queue and logging for operational transparency.

---

## Features

### Core Features

1. **Retry Logic with Exponential Backoff**: Retries email sending with progressively increasing delays.
2. **Provider Fallback**: Automatically switches between email providers if one fails.
3. **Rate Limiting**: Limits email sends to one per recipient per second to prevent abuse.
4. **Idempotency**: Ensures duplicate email requests are not processed multiple times.
5. **Status Tracking**: Tracks and reports the status of each email attempt.

### Bonus Features

1. **Simple Queue**: In-memory queue for decoupling request handling and processing.
2. **Logging**: Logs email processing events for debugging and monitoring.

---

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/coder-sky/EmailService.git
   cd EmailService
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. Backend is running at http\://localhost:8000.

---

## API Endpoints

### `POST /send-email`

Queue an email to be sent asynchronously.

#### Request Payload:

```json
{
  "recipient": "recipient@example.com",
  "subject": "Hello",
  "body": "This is a test email."
}
```

#### Response:

- **200 OK**:
  ```json
  {
    "hashMail": "8bbcdee6bb43287cb9bba69ba7c02f6060be6aadf700cfd91a5bcb5fde62e147",
    "status": "Queued"
  }
  ```

### `GET /report-summary`

Retrieve a summary of email sending attempts.

#### Response:

- **200 OK**:
  ```json
  {
    "2c7ef6c149e81f4b953f6fd0022ec6705558097abcb743b69c08d709ac08460f": {
      "recipient": "example@example.com",
      "hashMail": "2c7ef6c149e81f4b953f6fd0022ec6705558097abcb743b69c08d709ac08460f",
      "status": "success",
      "provider": "EmailProvider1",
      "attempts": 1
    },
    "bba0858dc3dcf5d5f6c63676cbb01481caf331ebce6b940ca95e52389bb0975e": {
      "recipient": "example@example1.com",
      "hashMail": "bba0858dc3dcf5d5f6c63676cbb01481caf331ebce6b940ca95e52389bb0975e",
      "status": "success",
      "provider": "EmailProvider1",
      "attempts": 2
    },
    "8f70f30bddda7daf56bd9ff13d153953ef78fab5d0e645f9c4beedd1d9d73838": {
      "recipient": "example@example11.com",
      "hashMail": "8f70f30bddda7daf56bd9ff13d153953ef78fab5d0e645f9c4beedd1d9d73838",
      "status": "success",
      "provider": "EmailProvider1",
      "attempts": 1
    },
    "8bbcdee6bb43287cb9bba69ba7c02f6060be6aadf700cfd91a5bcb5fde62e147": {
      "recipient": "example@example111.com",
      "hashMail": "8bbcdee6bb43287cb9bba69ba7c02f6060be6aadf700cfd91a5bcb5fde62e147",
      "status": "success",
      "provider": "EmailProvider1",
      "attempts": 2
    }
  }
  ```

---

## Code Architecture

### Key Components

1. **`EmailService`**\*\* Class\*\*:
   - Handles email sending with retries, provider fallback, and rate limiting.
2. **Providers**:
   - Two mock providers (`MockProvider1`, `MockProvider2`) simulate email-sending APIs.
3. **Queue**:
   - Processes email requests asynchronously to improve efficiency.
4. **Logging**:
   - Simple hit an api report-summery.

### Retry Logic

- Retries failed email sends with exponential backoff:
  ```
  delay = 1000 * 2 ** attempt;
  ```

### Idempotency

- Each email request is hashed using its payload to generate a unique ID.
- Duplicate requests are identified and ignored.

### Rate Limiting

- Limits each recipient to one email per second to prevent abuse.

---

