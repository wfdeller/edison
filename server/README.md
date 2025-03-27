# Edison Server

A modular Express application with a services-based architecture.

## Project Structure

```
src/
  ├── app.js              # Main application file
  ├── config/            # Configuration files
  │   └── database.js    # Database configuration
  └── services/          # Service modules
      ├── user/         # User service
      │   ├── user.model.js     # User model with authentication fields
      │   ├── user.service.js   # Business logic
      │   ├── user.controller.js # Request handlers
      │   └── user.routes.js    # Route definitions
      ├── settings/     # Settings service
      │   ├── settings.model.js     # Mongoose model
      │   ├── settings.service.js   # Business logic
      │   ├── settings.controller.js # Request handlers
      │   └── settings.routes.js    # Route definitions
      ├── auth/         # Authentication service
      │   ├── auth.service.js       # Authentication logic
      │   ├── auth.middleware.js    # Auth middleware
      │   ├── auth.controller.js    # Request handlers
      │   └── auth.routes.js        # Route definitions
      ├── video/        # Video service
      │   ├── video.model.js        # Video model with metadata
      │   ├── video.service.js      # Business logic
      │   ├── video.controller.js   # Request handlers
      │   └── video.routes.js       # Route definitions
      └── audit/        # Audit service
          ├── audit.model.js        # Audit log model
          ├── audit.service.js      # Audit logging logic
          ├── audit.middleware.js   # Audit middleware
          ├── audit.controller.js   # Request handlers
          └── audit.routes.js       # Route definitions
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- AWS S3 bucket for video storage

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/edison-server
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
AWS_S3_BUCKET=your-bucket-name
```

3. Start MongoDB:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### Public Endpoints
- `POST /api/auth/register` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

#### Protected Endpoints (Requires Bearer Token)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
  ```json
  {
    "name": "John Smith",
    "email": "john@example.com"
  }
  ```
- `PUT /api/auth/password` - Change password
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword"
  }
  ```

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

Example POST request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

### Settings

The settings service manages application-wide settings grouped into categories:

#### Categories
- `general`: Company name, timezone, language, date format
- `security`: Password requirements, 2FA, session timeout, login attempts
- `appearance`: Theme, colors, fonts, and UI preferences
- `authentication`: Registration, email verification, social login, allowed domains

#### Endpoints
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update all settings
- `GET /api/settings/:category` - Get settings by category
- `PUT /api/settings/:category` - Update settings by category
- `POST /api/settings/initialize` - Initialize default settings

Example update request:
```json
{
  "general": {
    "siteName": "Edison",
    "siteDescription": "Video Management System",
    "contactEmail": "support@edison.com",
    "maintenanceMode": false,
    "siteLogo": "https://example.com/logo.png"
  },
  "appearance": {
    "theme": "dark",
    "primaryColor": "#2196F3"
  }
}
```

Example category update:
```json
{
  "theme": "dark",
  "primaryColor": "#2196F3",
  "fontFamily": "Roboto",
  "fontSize": "14px"
}
```

### Videos

The video service manages video metadata and S3 storage integration.

#### Public Endpoints
- `GET /api/videos` - Get all videos with filtering and pagination
  Query parameters:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `tags`: Filter by tags (comma-separated)
  - `search`: Search in title and description
  - `location`: Filter by location (requires longitude, latitude, and optional maxDistance)
  - `createdBy`: Filter by creator
  - `sortBy`: Sort field (default: createdAt)
  - `sortOrder`: Sort order (asc/desc, default: desc)

- `GET /api/videos/popular-tags` - Get most used tags
  Query parameters:
  - `limit`: Number of tags to return (default: 10)

- `GET /api/videos/stats` - Get video statistics
  Returns:
  ```json
  {
    "totalVideos": 100,
    "totalSize": 1073741824,
    "averageDuration": 120.5,
    "totalTags": 500,
    "uniqueTags": 50
  }
  ```

#### Protected Endpoints (Requires Bearer Token)
- `POST /api/videos` - Create a new video
  ```json
  {
    "title": "My Video",
    "description": "Video description",
    "s3Key": "videos/my-video.mp4",
    "size": 1048576,
    "format": "mp4",
    "duration": 120,
    "resolution": {
      "width": 1920,
      "height": 1080
    },
    "bitrate": 5000000,
    "framerate": 30,
    "codec": "h264",
    "tags": ["nature", "outdoor"],
    "location": {
      "coordinates": [-73.935242, 40.730610]
    }
  }
  ```

- `GET /api/videos/:id` - Get video by ID
- `PUT /api/videos/:id` - Update video metadata
- `DELETE /api/videos/:id` - Delete video
- `POST /api/videos/:id/tags` - Add tags to video
  ```json
  {
    "tags": ["new-tag", "another-tag"]
  }
  ```
- `DELETE /api/videos/:id/tags` - Remove tags from video
  ```json
  {
    "tags": ["tag-to-remove"]
  }
  ```

### Audit Logs

The audit service tracks all changes to records in the system.

#### Protected Endpoints (Requires Admin Role)
- `GET /api/audit-logs` - Get all audit logs with filtering and pagination
  Query parameters:
  - `model`: Filter by model name
  - `documentId`: Filter by document ID
  - `operation`: Filter by operation type (create/update/delete)
  - `user`: Filter by user ID
  - `startDate`: Filter by start date
  - `endDate`: Filter by end date
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50)

- `GET /api/audit-logs/:model/:documentId` - Get history for a specific document
  Returns an array of all changes made to the document, including:
  - Operation type
  - Changes made
  - User who made the changes
  - Timestamp
  - IP address
  - User agent

- `GET /api/audit-logs/:model/stats` - Get statistics for a specific model
  Query parameters:
  - `startDate`: Filter by start date
  - `endDate`: Filter by end date
  Returns:
  ```json
  {
    "create": 50,
    "update": 100,
    "delete": 10
  }
  ```

## Adding New Services

To add a new service:

1. Create a new directory under `src/services/<service_name>`
2. Create the following files:
   - `<service_name>.model.js` - Mongoose model
   - `<service_name>.service.js` - Business logic
   - `<service_name>.controller.js` - Request handlers
   - `<service_name>.routes.js` - Route definitions
3. Import and use the routes in `app.js` 