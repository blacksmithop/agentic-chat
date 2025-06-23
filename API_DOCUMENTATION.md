# ChatConnect API Documentation

## Overview
This document outlines the REST API endpoints and WebSocket connections needed for the ChatConnect application.

## Base URL
\`\`\`
Production: https://api.chatconnect.com/v1
Development: http://localhost:3001/api
\`\`\`

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <jwt_token>
\`\`\`

---

## Authentication Endpoints

### POST /auth/login
Join the chat with a nickname and age group.

**Request Body:**
\`\`\`json
{
  "nickname": "string (min: 4, max: 20)",
  "ageGroup": "teens | young-adults | adults"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "nickname": "string",
      "ageGroup": "string",
      "avatar": "string (URL)",
      "chatColor": "string (hex)",
      "roles": ["string"],
      "previousNicknames": ["string"],
      "status": "online | idle | busy | invisible",
      "joinedAt": "string (ISO date)",
      "lastSeen": "string (ISO date)"
    },
    "token": "string (JWT)"
  }
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "success": false,
  "error": "Nickname already taken | Invalid age group | Nickname too short"
}
\`\`\`

### POST /auth/logout
**Headers:** Authorization required
**Response:**
\`\`\`json
{
  "success": true,
  "message": "Logged out successfully"
}
\`\`\`

---

## Message Endpoints

### POST /messages
Send a message to the chat.

**Headers:** Authorization required
**Request Body:**
\`\`\`json
{
  "content": "string (max: 500)",
  "type": "message | whisper",
  "targetUser": "string (required if type=whisper)"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "string",
    "nickname": "string",
    "content": "string",
    "timestamp": "string (ISO date)",
    "type": "message | whisper",
    "embedData": {
      "type": "youtube | url | gif",
      "videoId": "string (optional)",
      "url": "string (optional)",
      "title": "string (optional)"
    }
  }
}
\`\`\`

### GET /messages
Retrieve chat history.

**Headers:** Authorization required
**Query Parameters:**
- `limit`: number (default: 50, max: 100)
- `offset`: number (default: 0)
- `before`: string (ISO date, get messages before this time)

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "nickname": "string",
      "content": "string",
      "timestamp": "string (ISO date)",
      "type": "message | system | whisper",
      "embedData": "object (optional)",
      "fileData": "object (optional)"
    }
  ],
  "pagination": {
    "total": "number",
    "hasMore": "boolean"
  }
}
\`\`\`

---

## User Endpoints

### GET /users
Get list of online users.

**Headers:** Authorization required
**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "users": [
      {
        "nickname": "string",
        "avatar": "string (URL)",
        "status": "online | idle | busy | invisible",
        "roles": ["string"],
        "lastSeen": "string (ISO date)",
        "ageGroup": "string"
      }
    ]
  }
}
\`\`\`

### PUT /users/status
Update user status.

**Headers:** Authorization required
**Request Body:**
\`\`\`json
{
  "status": "online | idle | busy | invisible"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Status updated successfully"
}
\`\`\`

### GET /users/{username}/lastseen
Get last seen time for a specific user.

**Headers:** Authorization required
**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "username": "string",
    "lastSeen": "string (ISO date)",
    "isOnline": "boolean"
  }
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "success": false,
  "error": "User not found"
}
\`\`\`

### GET /users/{username}/profile
Get detailed user profile.

**Headers:** Authorization required
**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "nickname": "string",
    "ageGroup": "string",
    "avatar": "string (URL)",
    "roles": ["string"],
    "previousNicknames": ["string"],
    "joinedAt": "string (ISO date)",
    "lastSeen": "string (ISO date)",
    "status": "string",
    "chatColor": "string (hex)"
  }
}
\`\`\`

### POST /users/{username}/friend
Add user as friend.

**Headers:** Authorization required
**Response:**
\`\`\`json
{
  "success": true,
  "message": "Friend added successfully"
}
\`\`\`

### DELETE /users/{username}/friend
Remove user from friends.

**Headers:** Authorization required
**Response:**
\`\`\`json
{
  "success": true,
  "message": "Friend removed successfully"
}
\`\`\`

### POST /users/{username}/mute
Mute a user.

**Headers:** Authorization required
**Response:**
\`\`\`json
{
  "success": true,
  "message": "User muted successfully"
}
\`\`\`

### POST /users/{username}/block
Block a user.

**Headers:** Authorization required
**Response:**
\`\`\`json
{
  "success": true,
  "message": "User blocked successfully"
}
\`\`\`

---

## Moderation Endpoints

### POST /moderation/kick
Kick a user (Moderator/Admin only).

**Headers:** Authorization required
**Request Body:**
\`\`\`json
{
  "username": "string",
  "reason": "string (optional)"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "User kicked successfully"
}
\`\`\`

### POST /moderation/ban
Ban a user (Admin only).

**Headers:** Authorization required
**Request Body:**
\`\`\`json
{
  "username": "string",
  "reason": "string (optional)",
  "duration": "number (hours, optional - permanent if not provided)"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "User banned successfully"
}
\`\`\`

### POST /moderation/whitelist
Whitelist/unban a user (Admin only).

**Headers:** Authorization required
**Request Body:**
\`\`\`json
{
  "username": "string",
  "reason": "string (optional)"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "User whitelisted successfully"
}
\`\`\`

### GET /moderation/logs
Get moderation action logs (Admin/Moderator only).

**Headers:** Authorization required
**Query Parameters:**
- `limit`: number (default: 50, max: 100)
- `offset`: number (default: 0)
- `action`: string (optional: "kick" | "ban" | "whitelist" | "mute")
- `moderator`: string (optional: filter by moderator nickname)

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "action": "kick | ban | whitelist | mute",
      "targetUser": "string",
      "moderator": "string",
      "reason": "string (optional)",
      "timestamp": "string (ISO date)",
      "duration": "number (optional, for bans)"
    }
  ],
  "pagination": {
    "total": "number",
    "hasMore": "boolean"
  }
}
\`\`\`

---

## File Upload Endpoints

### POST /files/upload
Upload a file (image, video, or document).

**Headers:** 
- Authorization required
- Content-Type: multipart/form-data

**Request Body (FormData):**
- `file`: File (max 50MB for videos, 10MB for images, 25MB for other files)
- `type`: "image | video | file"

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "url": "string (CDN URL)",
    "filename": "string",
    "size": "number (bytes)",
    "type": "string (MIME type)",
    "thumbnailUrl": "string (optional, for videos/images)"
  }
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "success": false,
  "error": "File too large | Invalid file type | Upload failed"
}
\`\`\`

**File Type Restrictions:**
- **Images**: JPG, PNG, GIF, WebP (max 10MB)
- **Videos**: MP4, WebM, MOV (max 50MB)
- **Files**: Any file type (max 25MB)

---

## AI Assistant Endpoints

### POST /ai/ask
Ask a question to the AI assistant.

**Headers:** Authorization required
**Request Body:**
\`\`\`json
{
  "question": "string (max: 500)",
  "context": ["string"] // Optional: previous conversation context
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "response": "string",
    "confidence": "number (0-1)",
    "sources": ["string"] // Optional: sources used for the response
  }
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "success": false,
  "error": "AI service unavailable | Question too long | Rate limit exceeded"
}
\`\`\`

### GET /ai/conversation/{userId}
Get AI conversation history for a user.

**Headers:** Authorization required
**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "question": "string",
      "response": "string",
      "timestamp": "string (ISO date)",
      "confidence": "number"
    }
  ]
}
\`\`\`

---

## Settings Endpoints

### GET /users/settings
Get user settings.

**Headers:** Authorization required
**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "notifications": {
      "soundEnabled": "boolean",
      "desktopNotifications": "boolean",
      "mentionNotifications": "boolean",
      "privateMessageNotifications": "boolean"
    },
    "privacy": {
      "showLastSeen": "boolean",
      "allowPrivateMessages": "boolean",
      "showTypingIndicator": "boolean"
    },
    "appearance": {
      "theme": "light | dark | system",
      "fontSize": "small | medium | large",
      "compactMode": "boolean",
      "showAvatars": "boolean"
    },
    "chat": {
      "enterToSend": "boolean",
      "showTimestamps": "boolean",
      "groupMessages": "boolean",
      "autoEmbedLinks": "boolean"
    }
  }
}
\`\`\`

### PUT /users/settings
Update user settings.

**Headers:** Authorization required
**Request Body:**
\`\`\`json
{
  "notifications": {
    "soundEnabled": "boolean (optional)",
    "desktopNotifications": "boolean (optional)",
    "mentionNotifications": "boolean (optional)",
    "privateMessageNotifications": "boolean (optional)"
  },
  "privacy": {
    "showLastSeen": "boolean (optional)",
    "allowPrivateMessages": "boolean (optional)",
    "showTypingIndicator": "boolean (optional)"
  },
  "appearance": {
    "theme": "light | dark | system (optional)",
    "fontSize": "small | medium | large (optional)",
    "compactMode": "boolean (optional)",
    "showAvatars": "boolean (optional)"
  },
  "chat": {
    "enterToSend": "boolean (optional)",
    "showTimestamps": "boolean (optional)",
    "groupMessages": "boolean (optional)",
    "autoEmbedLinks": "boolean (optional)"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Settings updated successfully"
}
\`\`\`

---

## Private Chat Endpoints

### GET /private-chats
Get list of private chats for the current user.

**Headers:** Authorization required
**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "withUser": "string",
      "lastMessage": {
        "content": "string",
        "timestamp": "string (ISO date)",
        "sender": "string"
      },
      "unreadCount": "number"
    }
  ]
}
\`\`\`

### GET /private-chats/{username}/messages
Get messages from a private chat.

**Headers:** Authorization required
**Query Parameters:**
- `limit`: number (default: 50, max: 100)
- `offset`: number (default: 0)
- `before`: string (ISO date, get messages before this time)

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "sender": "string",
      "content": "string",
      "timestamp": "string (ISO date)",
      "fileData": "object (optional)",
      "embedData": "object (optional)"
    }
  ],
  "pagination": {
    "total": "number",
    "hasMore": "boolean"
  }
}
\`\`\`

### POST /private-chats/{username}/messages
Send a private message.

**Headers:** Authorization required
**Request Body:**
\`\`\`json
{
  "content": "string (max: 500)"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "string",
    "sender": "string",
    "content": "string",
    "timestamp": "string (ISO date)"
  }
}
\`\`\`

### PUT /private-chats/{username}/read
Mark private chat as read.

**Headers:** Authorization required
**Response:**
\`\`\`json
{
  "success": true,
  "message": "Chat marked as read"
}
\`\`\`

---

## WebSocket Connection

### Connection
\`\`\`
wss://api.chatconnect.com/v1/ws?token=<jwt_token>
\`\`\`

### Message Types

#### Incoming Messages (Server → Client)

**New Message:**
\`\`\`json
{
  "type": "message",
  "data": {
    "id": "string",
    "nickname": "string",
    "content": "string",
    "timestamp": "string (ISO date)",
    "messageType": "message | system | whisper",
    "embedData": "object (optional)",
    "fileData": "object (optional)"
  }
}
\`\`\`

**Private Message:**
\`\`\`json
{
  "type": "private_message",
  "data": {
    "id": "string",
    "sender": "string",
    "content": "string",
    "timestamp": "string (ISO date)",
    "embedData": "object (optional)",
    "fileData": "object (optional)"
  }
}
\`\`\`

**User Status Change:**
\`\`\`json
{
  "type": "user_status",
  "data": {
    "nickname": "string",
    "status": "online | idle | busy | invisible | offline",
    "lastSeen": "string (ISO date)"
  }
}
\`\`\`

**User Joined:**
\`\`\`json
{
  "type": "user_joined",
  "data": {
    "nickname": "string",
    "avatar": "string",
    "ageGroup": "string",
    "roles": ["string"]
  }
}
\`\`\`

**User Left:**
\`\`\`json
{
  "type": "user_left",
  "data": {
    "nickname": "string"
  }
}
\`\`\`

**Typing Indicator:**
\`\`\`json
{
  "type": "typing",
  "data": {
    "nickname": "string",
    "isTyping": "boolean",
    "chatType": "general | private",
    "targetUser": "string (optional, for private chats)"
  }
}
\`\`\`

**Moderation Action:**
\`\`\`json
{
  "type": "moderation",
  "data": {
    "action": "kick | ban | whitelist",
    "targetUser": "string",
    "moderator": "string",
    "reason": "string (optional)"
  }
}
\`\`\`

**Friend Request:**
\`\`\`json
{
  "type": "friend_request",
  "data": {
    "from": "string",
    "action": "sent | accepted | declined"
  }
}
\`\`\`

**System Notification:**
\`\`\`json
{
  "type": "notification",
  "data": {
    "title": "string",
    "message": "string",
    "type": "info | success | warning | error",
    "timestamp": "string (ISO date)"
  }
}
\`\`\`

#### Outgoing Messages (Client → Server)

**Send Message:**
\`\`\`json
{
  "type": "send_message",
  "data": {
    "content": "string",
    "messageType": "message | whisper",
    "targetUser": "string (optional)"
  }
}
\`\`\`

**Send Private Message:**
\`\`\`json
{
  "type": "send_private_message",
  "data": {
    "targetUser": "string",
    "content": "string"
  }
}
\`\`\`

**Typing Status:**
\`\`\`json
{
  "type": "typing",
  "data": {
    "isTyping": "boolean",
    "chatType": "general | private",
    "targetUser": "string (optional, for private chats)"
  }
}
\`\`\`

**Status Update:**
\`\`\`json
{
  "type": "status_update",
  "data": {
    "status": "online | idle | busy | invisible"
  }
}
\`\`\`

**Join Room:**
\`\`\`json
{
  "type": "join_room",
  "data": {
    "room": "general | private",
    "targetUser": "string (optional, for private rooms)"
  }
}
\`\`\`

**Leave Room:**
\`\`\`json
{
  "type": "leave_room",
  "data": {
    "room": "general | private",
    "targetUser": "string (optional, for private rooms)"
  }
}
\`\`\`

---

## Chat Commands

The application supports various chat commands that users can type in the message input:

### General Commands

| Command | Description | Usage | Permission |
|---------|-------------|-------|------------|
| `/help` | Show available commands | `/help` | All users |
| `/whoami` | Show your previous nicknames | `/whoami` | All users |
| `/lastseen <username>` | Check when a user was last seen | `/lastseen Alex` | All users |

### Communication Commands

| Command | Description | Usage | Permission |
|---------|-------------|-------|------------|
| `/whisper <username> <message>` | Send a private whisper in general chat | `/whisper Alex Hello there!` | All users |
| `/askai <question>` | Ask a question to the AI assistant | `/askai What is the weather like?` | All users |

### Media Commands

| Command | Description | Usage | Permission |
|---------|-------------|-------|------------|
| `/yt <youtube_url>` | Embed a YouTube video | `/yt https://youtube.com/watch?v=dQw4w9WgXcQ` | All users |
| `/link <url>` | Embed a URL with preview | `/link https://github.com/user/repo` | All users |
| `/gif <search_term>` | Send a GIF | `/gif funny cat` | All users |

### Moderation Commands (Admin/Moderator only)

| Command | Description | Usage | Permission |
|---------|-------------|-------|------------|
| `/kick <username> [reason]` | Kick a user from the chat | `/kick spammer Inappropriate behavior` | Moderator+ |
| `/ban <username> [reason]` | Ban a user permanently | `/ban troll Repeated violations` | Admin only |
| `/whitelist <username>` | Unban a user | `/whitelist username` | Admin only |

### Special Features

- **@mentions**: Type `@username` to mention another user
- **#hashtags**: Type `#topic` to add hashtags to your messages
- **Auto-detection**: URLs and YouTube links are automatically detected and embedded

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Nickname already taken |
| 413 | Payload Too Large - File size exceeded |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable - AI service down |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /messages | 30 requests | per minute |
| POST /ai/ask | 10 requests | per minute |
| POST /files/upload | 5 requests | per minute |
| POST /private-chats/*/messages | 60 requests | per minute |
| PUT /users/status | 10 requests | per minute |
| All other endpoints | 100 requests | per minute |

**Rate Limit Headers:**
\`\`\`
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1640995200
\`\`\`

---

## Toast Notifications

The application uses a comprehensive toast notification system for user feedback:

### Notification Types

| Type | Usage | Example |
|------|-------|---------|
| `success` | Successful operations | File uploaded, Status updated |
| `info` | Informational messages | User muted, New friend added |
| `warning` | Warning messages | User blocked, Rate limit warning |
| `destructive` | Error messages | Upload failed, Connection error |

### Common Notifications

**Authentication:**
- Welcome message on successful login
- Error messages for invalid credentials

**File Operations:**
- Upload progress and completion
- File size/type validation errors

**User Actions:**
- Friend requests sent/received
- Moderation actions performed

**System Events:**
- Connection status changes
- Feature availability updates

---

## Environment Variables

### Client-side (.env.local)
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
NEXT_PUBLIC_FILE_UPLOAD_MAX_SIZE=52428800
NEXT_PUBLIC_AI_ENABLED=true
\`\`\`

### Server-side
\`\`\`
DATABASE_URL=postgresql://username:password@localhost:5432/chatconnect
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# AI Service
AI_API_KEY=your-openai-api-key
AI_MODEL=gpt-4
AI_MAX_TOKENS=500

# File Storage
FILE_STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=chatconnect-files
AWS_S3_REGION=us-east-1
CDN_URL=https://cdn.chatconnect.com

# Redis (for sessions and rate limiting)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# WebSocket
WS_PORT=3002
WS_HEARTBEAT_INTERVAL=30000

# Moderation
AUTO_MODERATION_ENABLED=true
SPAM_DETECTION_ENABLED=true
PROFANITY_FILTER_ENABLED=true

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
\`\`\`

---

## Implementation Notes

### Authentication & Security
1. **JWT tokens** expire after 24 hours and include user roles
2. **Rate limiting** implemented per-user with Redis
3. **Input validation** on all endpoints with sanitization
4. **CORS** configured for allowed origins only

### Real-time Features
1. **WebSocket** for real-time messaging and status updates
2. **Heartbeat** mechanism to detect disconnections
3. **Reconnection** logic with exponential backoff
4. **Message queuing** for offline users

### File Handling
1. **CDN integration** for fast file serving (AWS S3 + CloudFront)
2. **Image optimization** with automatic resizing and compression
3. **Virus scanning** for uploaded files
4. **Temporary URLs** for secure file access

### AI Integration
1. **OpenAI API** integration with conversation context
2. **Response caching** to reduce API costs
3. **Content filtering** for inappropriate AI responses
4. **Usage tracking** and quota management

### Database Design
1. **PostgreSQL** for relational data (users, messages, settings)
2. **Redis** for sessions, rate limiting, and real-time data
3. **Database indexing** for optimal query performance
4. **Data retention** policies for message history

### Monitoring & Analytics
1. **Error tracking** with Sentry
2. **Performance monitoring** with custom metrics
3. **User analytics** for feature usage
4. **API response time** tracking

### Scalability Considerations
1. **Horizontal scaling** with load balancers
2. **Database sharding** for large user bases
3. **Message queue** system for high-volume messaging
4. **Caching strategies** for frequently accessed data

### Content Moderation
1. **Automated spam detection** using ML models
2. **Profanity filtering** with customizable word lists
3. **Image content scanning** for inappropriate material
4. **User reporting** system with admin review queue

---

## API Testing

### Example cURL Commands

**Login:**
\`\`\`bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nickname": "TestUser", "ageGroup": "young-adults"}'
\`\`\`

**Send Message:**
\`\`\`bash
curl -X POST http://localhost:3001/api/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello, world!", "type": "message"}'
\`\`\`

**Upload File:**
\`\`\`bash
curl -X POST http://localhost:3001/api/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "type=image"
\`\`\`

**Ask AI:**
\`\`\`bash
curl -X POST http://localhost:3001/api/ai/ask \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the meaning of life?"}'
\`\`\`

### Postman Collection
A complete Postman collection is available for testing all endpoints. Import the collection file `ChatConnect_API.postman_collection.json` for comprehensive API testing.
