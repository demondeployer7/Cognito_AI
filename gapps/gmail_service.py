import os
import base64
import email
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from typing import List, Dict, Any
from config import Config
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

class GmailService:
    def __init__(self, scopes=None, token_file="token_gmail.json", credentials_file="credentials.json"):
        if scopes is None:
            scopes = Config.GMAIL_SCOPES
        self.creds = None
        if os.path.exists(token_file):
            self.creds = Credentials.from_authorized_user_file(token_file, scopes)
            print("here found")

        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
                print("creds refresed")
            else:
                flow = InstalledAppFlow.from_client_secrets_file(credentials_file, scopes)
                self.creds = flow.run_local_server(port=0)
            with open(token_file, "w") as token:
                token.write(self.creds.to_json())
        self.service = build("gmail", "v1", credentials=self.creds)
        
    def get_emails(self, max_results: int = 10, query: str = None) -> List[Dict[str, Any]]:
        """Get emails from Gmail"""
        try:
            # Build query
            gmail_query = query or "in:inbox"
            
            # Get messages
            results = self.service.users().messages().list(
                userId='me', 
                q=gmail_query, 
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            emails = []
            
            for message in messages:
                msg = self.service.users().messages().get(
                    userId='me', 
                    id=message['id'], 
                    format='full'
                ).execute()
                
                headers = msg['payload']['headers']
                subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
                sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
                date = next((h['value'] for h in headers if h['name'] == 'Date'), 'Unknown')
                
                # Get email body
                body = self._get_email_body(msg['payload'])
                
                emails.append({
                    'id': message['id'],
                    'subject': subject,
                    'sender': sender,
                    'date': date,
                    'body': body,
                    'snippet': msg.get('snippet', '')
                })
            
            return emails
            
        except Exception as e:
            print(f"Error fetching emails: {e}")
            return []
    
    def _get_email_body(self, payload: Dict[str, Any]) -> str:
        """Extract email body from payload"""
        if 'body' in payload and payload['body'].get('data'):
            return base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8')
        
        if 'parts' in payload:
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain':
                    if 'data' in part['body']:
                        return base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
        
        return "No readable content"
    
    def send_email(self, to: str, subject: str, body: str) -> bool:
        """Send an email"""
        try:
            message = MIMEText(body)
            message['to'] = to
            message['subject'] = subject
            
            raw = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            
            self.service.users().messages().send(
                userId='me', 
                body={'raw': raw}
            ).execute()
            
            return True
            
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    def save_emails_to_markdown(self, emails: List[Dict[str, Any]], filename: str = None) -> str:
        """Save emails to a markdown file"""
        if not os.path.exists(Config.EMAIL_MARKDOWN_DIR):
            os.makedirs(Config.EMAIL_MARKDOWN_DIR)
        
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"emails_{timestamp}.md"
        
        filepath = os.path.join(Config.EMAIL_MARKDOWN_DIR, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write("# Email Archive\n\n")
            f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            for i, email_data in enumerate(emails, 1):
                f.write(f"## Email {i}\n\n")
                f.write(f"**Subject:** {email_data['subject']}\n\n")
                f.write(f"**From:** {email_data['sender']}\n\n")
                f.write(f"**Date:** {email_data['date']}\n\n")
                f.write(f"**Snippet:** {email_data['snippet']}\n\n")
                f.write("**Body:**\n\n")
                f.write(f"{email_data['body']}\n\n")
                f.write("---\n\n")
        
        return filepath 
