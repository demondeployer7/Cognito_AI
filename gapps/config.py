import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Google API credentials
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:8000/auth/callback')
    
    # Model configuration
    MODEL_NAME = os.getenv('MODEL_NAME', 'ayushadarsh7/gemma3n_2b_empath_geeta')
    MAX_SEQ_LENGTH = int(os.getenv('MAX_SEQ_LENGTH', '4096'))
    MAX_NEW_TOKENS = int(os.getenv('MAX_NEW_TOKENS', '1024'))
    
    # File paths
    CREDENTIALS_FILE = os.getenv('CREDENTIALS_FILE', 'credentials.json')
    #TOKEN_FILE = os.getenv('TOKEN_FILE', 'token.json')
    EMAIL_MARKDOWN_DIR = os.getenv('EMAIL_MARKDOWN_DIR', 'emails')
    
    # API scopes
    GMAIL_SCOPES = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify'
    ]
    
    CALENDAR_SCOPES = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
    ]
    
    # Server configuration
    HOST = os.getenv('HOST', 'localhost')
    PORT = int(os.getenv('PORT', '8000')) 
