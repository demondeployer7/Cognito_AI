from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from config import Config
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os

class CalendarService:
    def __init__(self, scopes=None, token_file="token_calendar.json", credentials_file="credentials.json"):
        if scopes is None:
            scopes = Config.CALENDAR_SCOPES
        self.creds = None
        if os.path.exists(token_file):
            self.creds = Credentials.from_authorized_user_file(token_file, scopes)
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(credentials_file, scopes)
                self.creds = flow.run_local_server(port=0)
            with open(token_file, "w") as token:
                token.write(self.creds.to_json())
        self.service = build("calendar", "v3", credentials=self.creds)
        
    def get_events(self, calendar_id: str = 'primary', max_results: int = 10, 
                   time_min: Optional[datetime] = None, time_max: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Get calendar events"""
        try:
            if not time_min:
                time_min = datetime.now(timezone.utc)
            if not time_max:
                time_max = time_min + timedelta(days=30)
            
            events_result = self.service.events().list(
                calendarId=calendar_id,
                timeMin=time_min.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
                timeMax=time_max.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            return events
            
        except Exception as e:
            print(f"Error fetching calendar events: {e}")
            return []
    
    def get_today_events(self, calendar_id: str = 'primary') -> List[Dict[str, Any]]:
        """Get today's events"""
        today = datetime.now(timezone.utc)
        tomorrow = today + timedelta(days=1)
        
        return self.get_events(
            calendar_id=calendar_id,
            time_min=today,
            time_max=tomorrow
        )
    
    def get_yesterday_events(self, calendar_id: str = 'primary') -> List[Dict[str, Any]]:
        """Get yesterday's events"""
        yesterday = datetime.now(timezone.utc) - timedelta(days=1)
        today = datetime.now(timezone.utc)
        
        return self.get_events(
            calendar_id=calendar_id,
            time_min=yesterday,
            time_max=today
        )
    
    def create_event(self, summary: str, start_time: datetime, end_time: datetime,
                    description: str = "", location: str = "", attendees: List[str] = None) -> Dict[str, Any]:
        """Create a new calendar event"""
        try:
            event = {
                'summary': summary,
                'description': description,
                'location': location,
                'start': {
                    'dateTime': start_time.isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': end_time.isoformat(),
                    'timeZone': 'UTC',
                },
            }
            
            if attendees:
                event['attendees'] = [{'email': email} for email in attendees]
            
            event = self.service.events().insert(
                calendarId='primary',
                body=event,
                sendUpdates='all'
            ).execute()
            
            return event
            
        except Exception as e:
            print(f"Error creating event: {e}")
            return {}
    
    def delete_event(self, event_id: str, calendar_id: str = 'primary') -> bool:
        """Delete a calendar event"""
        try:
            self.service.events().delete(
                calendarId=calendar_id,
                eventId=event_id,
                sendUpdates='all'
            ).execute()
            return True
            
        except Exception as e:
            print(f"Error deleting event: {e}")
            return False
    
    def update_event(self, event_id: str, updates: Dict[str, Any], 
                    calendar_id: str = 'primary') -> Dict[str, Any]:
        """Update a calendar event"""
        try:
            event = self.service.events().get(
                calendarId=calendar_id,
                eventId=event_id
            ).execute()
            
            # Update fields
            for key, value in updates.items():
                event[key] = value
            
            updated_event = self.service.events().update(
                calendarId=calendar_id,
                eventId=event_id,
                body=event,
                sendUpdates='all'
            ).execute()
            
            return updated_event
            
        except Exception as e:
            print(f"Error updating event: {e}")
            return {}
    
    def schedule_meeting(self, summary: str, start_time: datetime, duration_minutes: int = 60,
                        attendees: List[str] = None, description: str = "") -> Dict[str, Any]:
        """Schedule a meeting with attendees"""
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        return self.create_event(
            summary=summary,
            start_time=start_time,
            end_time=end_time,
            description=description,
            attendees=attendees
        )
    
    def format_events_for_display(self, events: List[Dict[str, Any]]) -> str:
        """Format events for display"""
        if not events:
            return "No events found."
        
        formatted = "📅 **Calendar Events:**\n\n"
        
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            
            formatted += f"**{event['summary']}**\n"
            formatted += f"📅 {start} - {end}\n"
            
            if event.get('location'):
                formatted += f"📍 {event['location']}\n"
            
            if event.get('description'):
                formatted += f"📝 {event['description']}\n"
            
            if event.get('attendees'):
                formatted += f"👥 Attendees: {', '.join([a['email'] for a in event['attendees']])}\n"
            
            formatted += "\n"
        
        return formatted 