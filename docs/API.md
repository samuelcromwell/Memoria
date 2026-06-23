# API Documentation

Base URL: `http://localhost:4000`

All authenticated routes use the `memoria.sid` HTTP-only session cookie. Frontend requests must include credentials.

## Authentication

### `GET /api/auth/oauth/google`

Starts the Google OAuth flow.

### `POST /api/auth/oauth/google`

Redirects to the Google OAuth flow. This is included to match the sample endpoint list.

### `GET /api/auth/oauth/google/callback`

OAuth callback endpoint registered in Google Cloud Console.

### `POST /api/auth/setup-password`

Sets or replaces the local password for the authenticated OAuth user.

Request:

```json
{
  "password": "password123",
  "confirmPassword": "password123"
}
```

### `POST /api/auth/login`

Logs in with local credentials after password setup.

Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### `POST /api/auth/logout`

Destroys the current session.

### `GET /api/auth/me`

Returns the current authenticated user.

## File Management

### `POST /api/files/upload`

Uploads one file using `multipart/form-data`.

Fields:

- `file`: binary file
- `description`: optional string
- `tags`: optional comma-separated string or JSON string array

### `GET /api/files`

Returns the authenticated user's uploaded files.

### `GET /api/files/:id`

Returns one file metadata record if it belongs to the authenticated user.

### `GET /api/files/:id/download`

Downloads the stored file if it belongs to the authenticated user.

### `PUT /api/files/:id`

Updates file metadata.

Request:

```json
{
  "description": "Updated description",
  "tags": ["finance", "contracts"]
}
```

### `DELETE /api/files/:id`

Deletes the database record and stored file.

## Dashboard

### `GET /api/dashboard/stats`

Returns:

```json
{
  "totalFiles": 4,
  "totalStorageBytes": 1048576,
  "totalStorageFormatted": "1 MB",
  "mostUsedTags": [{ "name": "finance", "count": 3 }],
  "fileTypes": [{ "name": "application/pdf", "count": 2 }],
  "recentUploads": []
}
```

### `GET /api/dashboard/tags`

Returns all tag counts for the authenticated user.

### `GET /api/dashboard/recent`

Returns the 10 most recent uploads.
