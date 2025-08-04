# Personal Assistant with Gemma3n

An AI-powered personal assistant that integrates with Google Calendar and Gmail using your custom Gemma3n model from Hugging Face.

## Features

### 📅 Calendar Management
- View today's schedule
- View yesterday's events
- Schedule meetings and events
- Delete calendar events
- Schedule meetings with attendees

### 📧 Email Management
- Check inbox and read emails
- Send emails
- Save emails to markdown files
- Email archiving

### 🤖 AI Chat
- General conversation and assistance
- Natural language processing with Gemma3n
- Context-aware responses

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Google API Setup

You need to set up Google API credentials for Gmail and Calendar access:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API and Google Calendar API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Desktop application"
   - Download the credentials file
5. Rename the downloaded file to `credentials.json` and place it in the project root

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
# Google API credentials (optional if using credentials.json)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback

# Model configuration
MODEL_NAME=ayushadarsh7/gemma3n_2b_empath_geeta
MAX_SEQ_LENGTH=512
MAX_NEW_TOKENS=128

# File paths
CREDENTIALS_FILE=credentials.json
TOKEN_FILE=token.json
EMAIL_MARKDOWN_DIR=emails

# Server configuration
HOST=localhost
PORT=8000
```

## Usage

### Command Line Interface

#### Interactive Mode
```bash
python cli.py --interactive
```

#### Single Query
```bash
python cli.py --query "What's my schedule for today?"
```

### Web API

Start the FastAPI server:
```bash
python main.py
```

The server will be available at `http://localhost:8000`

#### API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /capabilities` - List assistant capabilities
- `POST /query` - Process user query

#### Example API Usage

```bash
curl -X POST "http://localhost:8000/query" \
     -H "Content-Type: application/json" \
     -d '{"query": "What is my schedule for today?"}'
```

## Example Queries

### Calendar Queries
- "What's my schedule for today?"
- "Show me yesterday's calendar events"
- "Schedule a meeting with John tomorrow at 2pm"
- "Create an event called 'Team Lunch' for Friday at 12pm"
- "Delete my 3pm meeting"

### Email Queries
- "Check my inbox"
- "Send an email to john@example.com about the project"
- "Read my latest emails"
- "Save my emails to a file"

### General Queries
- "What's the weather like?"
- "Tell me a joke"
- "Help me plan my day"

## Project Structure

```
gapps/
├── config.py              # Configuration management
├── google_auth.py         # Google OAuth2 authentication
├── gmail_service.py       # Gmail API operations
├── calendar_service.py    # Google Calendar API operations
├── ai_assistant.py        # Main AI assistant logic
├── main.py               # FastAPI web server
├── cli.py                # Command line interface
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── credentials.json      # Google API credentials (you need to add this)
├── token.json           # OAuth2 tokens (auto-generated)
└── emails/              # Email markdown files (auto-generated)
```

## Authentication Flow

1. **First Run**: The application will open a browser window for Google OAuth2 authentication
2. **Authorization**: Grant permissions for Gmail and Calendar access
3. **Token Storage**: Tokens are automatically saved to `token.json`
4. **Subsequent Runs**: Tokens are automatically refreshed as needed

## Troubleshooting

### Common Issues

1. **"Credentials file not found"**
   - Make sure `credentials.json` is in the project root
   - Download it from Google Cloud Console

2. **"Authentication failed"**
   - Delete `token.json` and re-authenticate
   - Check that your Google API credentials are correct

3. **"Model loading failed"**
   - Ensure you have sufficient GPU memory
   - Check your internet connection for model download

4. **"API quota exceeded"**
   - Google APIs have rate limits
   - Wait a few minutes and try again

### GPU Requirements

This application uses the Gemma3n model which requires:
- CUDA-compatible GPU
- At least 16GB VRAM (recommended)
- PyTorch with CUDA support

