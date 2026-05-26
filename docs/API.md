# API Reference

**Base URL:** `http://localhost:3000/api`

All protected endpoints require an `Authorization: Bearer <token>` header.

**Error response shape** (all endpoints):

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/items"
}
```

---

## System

### `GET /api`

Health check / welcome message.

- **Auth:** No
- **Response `200`:**
  ```
  Hello World!
  ```

---

### `GET /api/health`

Health probe endpoint.

- **Auth:** No
- **Response `200`:**
  ```json
  { "status": "ok" }
  ```

---

## Auth

### `POST /api/auth/register`

Create a new user account and receive a JWT.

- **Auth:** No

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "mypassword",
  "name": "Alice"
}
```

| Field      | Type   | Required | Constraints       |
|------------|--------|----------|-------------------|
| `email`    | string | ✅        | Valid email format |
| `password` | string | ✅        | Minimum 8 characters |
| `name`     | string | ❌        | Display name      |

**Response `201`:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**

| Status | Condition |
|--------|-----------|
| `409 Conflict` | Email already registered |
| `400 Bad Request` | Validation failure (e.g. password too short) |

---

### `POST /api/auth/login`

Authenticate with email and password.

- **Auth:** No

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "mypassword"
}
```

**Response `200`:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**

| Status | Condition |
|--------|-----------|
| `401 Unauthorized` | Invalid email or password |

---

### `GET /api/auth/profile`

Return the authenticated user's profile. Excludes `passwordHash`.

- **Auth:** Yes (Bearer token)

**Response `200`:**

```json
{
  "id": "clxyz123abc",
  "email": "user@example.com",
  "name": "Alice",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

**Errors:**

| Status | Condition |
|--------|-----------|
| `401 Unauthorized` | Missing or invalid token |

---

## Items

All items endpoints require authentication.

### `GET /api/items`

Return all items.

- **Auth:** Yes

**Response `200`:**

```json
[
  {
    "id": "clxyz456def",
    "title": "My first item",
    "description": "A short description",
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-10T08:00:00.000Z"
  }
]
```

---

### `GET /api/items/:id`

Return a single item by ID.

- **Auth:** Yes

**Path parameters:**

| Param | Type   | Description |
|-------|--------|-------------|
| `id`  | string | Item ID (Prisma cuid) |

**Response `200`:** Single item object (same shape as list item above).

**Errors:**

| Status | Condition |
|--------|-----------|
| `404 Not Found` | Item does not exist |

---

### `POST /api/items`

Create a new item.

- **Auth:** Yes

**Request body:**

```json
{
  "title": "My new item",
  "description": "Optional description"
}
```

| Field         | Type   | Required | Constraints |
|---------------|--------|----------|-------------|
| `title`       | string | ✅        | Non-empty   |
| `description` | string | ❌        | —           |

**Response `201`:** Full item object.

**Errors:**

| Status | Condition |
|--------|-----------|
| `400 Bad Request` | Validation failure (e.g. missing `title`) |

---

### `PATCH /api/items/:id`

Update an existing item. Only provided fields are changed.

- **Auth:** Yes

**Path parameters:**

| Param | Type   | Description |
|-------|--------|-------------|
| `id`  | string | Item ID |

**Request body:** (all fields optional)

```json
{
  "title": "Updated title",
  "description": "Updated description"
}
```

**Response `200`:** Full updated item object.

**Errors:**

| Status | Condition |
|--------|-----------|
| `404 Not Found` | Item does not exist |
| `400 Bad Request` | Validation failure |

---

### `DELETE /api/items/:id`

Delete an item.

- **Auth:** Yes

**Path parameters:**

| Param | Type   | Description |
|-------|--------|-------------|
| `id`  | string | Item ID |

**Response `200`:** The deleted item object.

**Errors:**

| Status | Condition |
|--------|-----------|
| `404 Not Found` | Item does not exist |
