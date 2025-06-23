# ChatConnect API

FastAPI backend for the ChatConnect chat application.

## Setup

1. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Copy environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Update the `.env` file with your configuration.

4. Run the server:
\`\`\`bash
python main.py
\`\`\`

The API will be available at `http://localhost:3001`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:3001/docs`
- ReDoc: `http://localhost:3001/redoc`

## Features

- ✅ User authentication with JWT
- ✅ Real-time messaging with WebSocket
- ✅ File upload support
- ✅ AI integration (OpenAI)
- ✅ User status management
- ✅ Private messaging
- ✅ Moderation tools
- ✅ Rate limiting
- ✅ Settings management
- ✅ CORS support

## Database

The application uses SQLite by default. For production, update the `DATABASE_URL` in `.env` to use PostgreSQL or MySQL.

## WebSocket

WebSocket endpoint: `ws://localhost:3001/ws?token=<jwt_token>`

## File Uploads

Files are stored in the `uploads/` directory. In production, consider using cloud storage (AWS S3, etc.).

## AI Integration

Set your OpenAI API key in the `.env` file to enable AI features. Without it, the app will use mock responses.
