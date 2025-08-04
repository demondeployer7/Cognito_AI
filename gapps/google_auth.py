import os
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.exceptions import RefreshError
from config import Config

class GoogleAuth:
    def __init__(self, scopes, token_file=None):
        self.scopes = scopes
        self.credentials = None
        self.token_file = token_file or Config.TOKEN_FILE  # Allow custom token file
        
    def set_token_file(self, token_file):
        """Set the token file to use for this authentication"""
        self.token_file = token_file
        
    def authenticate(self):
        """Authenticate with Google APIs using OAuth2"""
        creds = None
        
        # Check if token file exists
        if os.path.exists(self.token_file):
            try:
                creds = Credentials.from_authorized_user_file(self.token_file, self.scopes)
                print(f"Loaded credentials from {self.token_file}")
                
                # Check if refresh token exists
                if not creds.refresh_token:
                    print(f"No refresh token found in {self.token_file}, regenerating...")
                    creds = None
                    
            except Exception as e:
                print(f"Error loading credentials from {self.token_file}: {e}")
                creds = None
        
        # If no valid credentials available, let user log in
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except RefreshError:
                    print(f"Token expired, getting new credentials...")
                    self._get_new_credentials()
            else:
                print(f"Getting new credentials...")
                self._get_new_credentials()
                
        self.credentials = creds
        return creds
    
    def _get_new_credentials(self):
        """Get new credentials through OAuth2 flow"""
        if not os.path.exists(Config.CREDENTIALS_FILE):
            raise FileNotFoundError(
                f"Credentials file '{Config.CREDENTIALS_FILE}' not found. "
                "Please download it from Google Cloud Console."
            )
        
        flow = InstalledAppFlow.from_client_secrets_file(
            Config.CREDENTIALS_FILE, self.scopes
        )
        # Ensure we get refresh tokens
        creds = flow.run_local_server(port=0, access_type='offline', prompt='consent')
        
        # Save credentials for next run
        with open(self.token_file, 'w') as token:
            token.write(creds.to_json())
        
        print(f"Saved new credentials to {self.token_file}")
        return creds
    
    def get_authenticated_service(self, service_name, version='v1'):
        """Get authenticated service instance"""
        from googleapiclient.discovery import build
        
        if not self.credentials:
            self.authenticate()
        
        return build(service_name, version, credentials=self.credentials) 