import re
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List
from unsloth import FastModel
from transformers import TextStreamer
import torch
import gc
from config import Config
from gmail_service import GmailService
from calendar_service import CalendarService
from datetime import datetime

today_date = datetime.today().date()
date_str = today_date.isoformat()  # '2025-07-31'

class AIAssistant:
    def __init__(self):
        # Initialize the Gemma3n model
        self.model, self.tokenizer = FastModel.from_pretrained(
            model_name=Config.MODEL_NAME,
            dtype=None,
            max_seq_length=Config.MAX_SEQ_LENGTH,
            load_in_4bit=True,
            full_finetuning=False,
        )
        
        # Initialize services
        self.gmail_service = GmailService()
        self.calendar_service = CalendarService()
        
        # Set up torch configuration
        torch._dynamo.config.cache_size_limit = 1024
       

        
    def process_user_query(self, user_query: str) -> str:
        """Process user query and return appropriate response"""
        try:
            # Analyze the query to determine the action
            action = self._analyze_query(user_query)
            
            if action['type'] == 'calendar':
                return self._handle_calendar_action(action, user_query)
            elif action['type'] == 'email':
                return self._handle_email_action(action, user_query)
            elif action['type'] == 'telegram':
                return self._handle_telegram_action(action, user_query)
            elif action['type'] == 'general':
                return self._handle_general_query(user_query)
            elif action['type'] == 'geeta':
                return self._handle_geeta_action(action, user_query)
            elif action['type'] == 'bible':
                return self._handle_bible_action(action, user_query)
            else:
                return "I'm not sure how to help with that. Please try rephrasing your request."
                
        except Exception as e:
            return f"Sorry, I encountered an error: {str(e)}"
    
    def _analyze_query(self, query: str) -> Dict[str, Any]:
        # """Analyze user query to determine the intended action using LLM"""
        # prompt = f"""
        # Analyze this user query and determine the intended action: "{query}"
        
        # Return a JSON object with:
        # - type: "calendar", "email", or "general"
        # - action: specific action to perform
        # - confidence: confidence level (0-1)
        
        # For calendar actions:
        # - "create" - schedule, book, create, add event/meeting/appointment
        # - "get_today" - today's schedule, today's events, what's on today
        # - "get_yesterday" - yesterday's events, past events
        # - "delete" - delete, remove, cancel event
        # - "update" - modify, change, edit event
        
        # For email actions:
        # - "send" - send email, write email, compose, mail to
        # - "get_emails" - check inbox, read emails, show messages, get mail
        # - "search" - search emails, find emails, look for
        
        # For general:
        # - "chat" - general conversation, questions, help
        
        # Examples:
        # "Schedule a meeting tomorrow at 3pm" → {{"type": "calendar", "action": "create", "confidence": 0.9}}
        # "What's on my calendar today?" → {{"type": "calendar", "action": "get_today", "confidence": 0.9}}
        # "Send an email to john@example.com" → {{"type": "email", "action": "send", "confidence": 0.9}}
        # "Check my inbox" → {{"type": "email", "action": "get_emails", "confidence": 0.9}}
        # "How are you?" → {{"type": "general", "action": "chat", "confidence": 0.8}}
        # """
        
        # response = self._generate_response(prompt)
        
        # try:
        #     # Try to extract JSON from response
        #     json_match = re.search(r'\{.*\}', response, re.DOTALL)
        #     if json_match:
        #         result = json.loads(json_match.group())
        #         # Ensure required fields exist
        #         if 'type' in result and 'action' in result:
        #             return result
        # except:
        #     pass
        
        # Fallback to keyword-based analysis if LLM fails
        return self._fallback_analyze_query(query)
    
    def _fallback_analyze_query(self, query: str) -> Dict[str, Any]:
        """Fallback keyword-based query analysis"""
        query_lower = query.lower()
        
        # Calendar actions with more comprehensive keywords
        calendar_create_keywords = ['schedule meeting', 'create meeting','add an event']
        calendar_today_keywords = ['today events','today\'s events','what\'s on today','today\'s schedule']
        calendar_yesterday_keywords = ['yesterday events','yesterday\'s events','what\'s on yesterday','yesterday\'s schedule']
        calendar_delete_keywords = ['delete event', 'remove event', 'cancel event']
        
        # Email actions with more comprehensive keywords
        email_send_keywords = ['send a mail', 'write an email', 'compose an email', 'mail to', 'email to']
        email_get_keywords = ['inbox', 'check mail','get me my 5 recent mails', 'read email', 'get emails', 'show messages', 'view inbox', 'check inbox', 'my emails']
        email_search_keywords = ['search emails', 'find emails', 'look for emails', 'filter emails', 'query emails']
        
        # Telegram actions with more comprehensive keywords
        telegram_send_keywords = ['telegram', 'telegram message','tele','chat','chat with']
        
        # Gita actions with comprehensive keywords
        geeta_keywords = ['gita', 'bhagavad gita', 'bhagwad gita','geeta', 'bhagwad geeta','geeta guidance']
        
        # Bible actions with comprehensive keywords
        bible_keywords = ['bible', 'christian guidance', 'biblical wisdom', 'gospel', 'jesus']
        # Check calendar actions
        if any(word in query_lower for word in calendar_create_keywords):
            return {'type': 'calendar', 'action': 'create', 'confidence': 0.8}
        elif any(word in query_lower for word in calendar_today_keywords):
            return {'type': 'calendar', 'action': 'get_today', 'confidence': 0.8}
        elif any(word in query_lower for word in calendar_yesterday_keywords):
            return {'type': 'calendar', 'action': 'get_yesterday', 'confidence': 0.8}
        elif any(word in query_lower for word in calendar_delete_keywords):
            return {'type': 'calendar', 'action': 'delete', 'confidence': 0.8}
        
        # Check email actions
        elif any(word in query_lower for word in email_send_keywords):
            return {'type': 'email', 'action': 'send', 'confidence': 0.7}
        elif any(word in query_lower for word in email_get_keywords):
            return {'type': 'email', 'action': 'get_emails', 'confidence': 0.8}
        elif any(word in query_lower for word in email_search_keywords):
            return {'type': 'email', 'action': 'search', 'confidence': 0.7}
        
        # Check telegram actions
        elif any(word in query_lower for word in telegram_send_keywords):
            return {'type': 'telegram', 'action': 'read_chats', 'confidence': 0.8}
        
        # Check Gita actions
        elif any(word in query_lower for word in geeta_keywords):
            return {'type': 'geeta', 'action': 'guidance', 'confidence': 0.8}
        
        # Check Bible actions
        elif any(word in query_lower for word in bible_keywords):
            return {'type': 'bible', 'action': 'guidance', 'confidence': 0.8}
        

        # General query
        else:
            return {'type': 'general', 'action': 'chat', 'confidence': 0.6}
    
    def _handle_calendar_action(self, action: Dict[str, Any], query: str) -> str:
        """Handle calendar-related actions"""
        if action['action'] == 'get_today':
            events = self.calendar_service.get_today_events()
            return self.calendar_service.format_events_for_display(events)
        
        elif action['action'] == 'get_yesterday':
            events = self.calendar_service.get_yesterday_events()
            return self.calendar_service.format_events_for_display(events)
        
        elif action['action'] == 'create':
            # Extract event details using AI
            event_details = self._extract_event_details(query)
            if event_details:
                try:
                    event = self.calendar_service.create_event(
                        summary=event_details['summary'],
                        start_time=event_details['start_time'],
                        end_time=event_details['end_time'],
                        description=event_details.get('description', ''),
                        location=event_details.get('location', ''),
                        attendees=event_details.get('attendees', [])
                    )
                    return f"✅ Event created successfully: {event_details['summary']}"
                except Exception as e:
                    return f"❌ Failed to create event: {str(e)}"
            else:
                return "❌ Could not extract event details from your request."
        
        elif action['action'] == 'delete':
            # This would need more sophisticated event identification
            return "❌ Event deletion requires specific event identification. Please provide more details."
        
        return "❌ Unknown calendar action."
    def _extract_telegram_details(self, query: str) -> str:
        """Extract person's name from user query for telegram chat analysis"""
        # Hardcoded logic: return the last word of the query as the name
        words = query.strip().split()
        if words:
            return words[-1].lower()
        return ""
    
    def _handle_telegram_query(self, chat_data: str, person_name: str) -> str:
        """Handle telegram chat analysis and generate advice"""
        prompt = f"""
        Based on  the chat of {person_name} with me (Akshit) tell  me  what should he do
        Chat data: {chat_data}
        I am akshit, remember that, give me advice
        Please provide:
        Specific advice on how I should respond  
        Be empathetic and supportive in your response.
        """
        
        return self._generate_response(prompt)
    
    def _handle_telegram_action(self, action: Dict[str, Any], query: str) -> str:
        """Handle telegram-related actions"""
        if action['action'] == 'read_chats':
            # Extract person's name from query
            person_name = self._extract_telegram_details(query)
            
            if not person_name:
                return "❌ Could not identify the person's name from your request. Please specify who you want to analyze (e.g., 'analyze telegram chat with nisha')."
            
            try:
                # Import and run the tele_parser function
                from tele_parser import preprocess_chat
                
                # Run the preprocess_chat function
                preprocess_chat(folder_path="telegram", name=person_name, length=20)
                
                # Read the preprocessed chat data
                preprocessed_file = f"telegram/preprocessed_{person_name}.txt"
                try:
                    with open(preprocessed_file, 'r', encoding='utf-8') as f:
                        chat_data = f.read().strip()
                    
                    if not chat_data:
                        return f"❌ No chat data found for {person_name}. Please check if the telegram chat file exists."
                    
                    # Generate advice using the chat data
                    advice = self._handle_telegram_query(chat_data, person_name)
                    return f"📱 **Telegram Chat Analysis for {person_name}**\n\n{advice}"
                    
                except FileNotFoundError:
                    return f"❌ Could not find preprocessed chat data for {person_name}. Please check if the telegram chat file exists."
                    
            except ImportError:
                return "❌ Could not import tele_parser module. Please ensure tele_parser.py is available."
            except Exception as e:
                return f"❌ Error processing telegram chat: {str(e)}"
        
        return "❌ Unknown telegram action. Try: 'analyze telegram chat with [person_name]'."
    
    def _handle_email_action(self, action: Dict[str, Any], query: str) -> str:
        """Handle email-related actions"""
        if action['action'] == 'get_emails':
            emails = self.gmail_service.get_emails(max_results=5)
            if emails:
                # Save to markdown
                filepath = self.gmail_service.save_emails_to_markdown(emails)
                return f"📧 Retrieved {len(emails)} emails and saved to {filepath}\n\nRecent emails:\n" + \
                       "\n".join([f"• {email['subject']} (from {email['sender']})" for email in emails[:3]])
            else:
                return "📧 No emails found in inbox."
        
        elif action['action'] == 'send':
            # Extract email details using AI
            email_details = self._extract_email_details(query)
            if email_details:
                success = self.gmail_service.send_email(
                    to=email_details['to'],
                    subject=email_details['subject'],
                    body=email_details['body']
                )
                if success:
                    return f"✅ Email sent successfully to {email_details['to']}\nSubject: {email_details['subject']}"
                else:
                    return "❌ Failed to send email. Please check your credentials and try again."
            else:
                return "❌ Could not extract email details from your request. Please provide recipient, subject, and message."
        
        elif action['action'] == 'search':
            # Extract search query from user input
            search_query = self._extract_search_query(query)
            if search_query:
                emails = self.gmail_service.get_emails(max_results=10, query=search_query)
                if emails:
                    filepath = self.gmail_service.save_emails_to_markdown(emails, f"search_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md")
                    return f"🔍 Found {len(emails)} emails matching '{search_query}' and saved to {filepath}\n\n" + \
                           "\n".join([f"• {email['subject']} (from {email['sender']})" for email in emails[:5]])
                else:
                    return f"🔍 No emails found matching '{search_query}'"
            else:
                return "❌ Please specify what you want to search for in your emails."
        
        return "❌ Unknown email action. Try: 'send email', 'check inbox', or 'search emails'."
    
    def _extract_search_query(self, query: str) -> str:
        """Extract search query from user input"""
        prompt = f"""
        Extract a Gmail search query from this user input: "{query}"
        
        Return only the search query that can be used with Gmail's search syntax.
        Examples:
        - "find emails from john" → "from:john"
        - "search for important emails" → "is:important"
        - "look for emails about meeting" → "meeting"
        - "find unread emails" → "is:unread"
        - "search emails from yesterday" → "after:2024/01/01"
        
        If no clear search terms, return an empty string.
        """
        
        response = self._generate_response(prompt)
        return response.strip()
    
    def _handle_general_query(self, query: str) -> str:
        """Handle general queries using the AI model"""
        return self._generate_response(query)
    
    def _handle_geeta_action(self, action: Dict[str, Any], query: str) -> str:
        """Handle Gita-related actions"""
        if action['action'] == 'guidance':
            try:
                # Create the Gita guidance prompt similar to bhagwad_geeta.py
                prompt = f"""You are a wise and compassionate guide who answers life questions using the teachings of the Bhagavad Gita.

The user will share a personal or emotional concern. Respond with empathy, clarity, and quotes or summaries from the Gita that can help the user reflect and find peace.

User's message:
\"\"\"{query}\"\"\"

Your response (include relevant verses, chapter numbers if possible, and practical reflection):
"""
                
                # Generate guidance using the model
                guidance = self._generate_response(prompt)
                return f"📖Bhagavad Gita Guidance\n\n{guidance}"
                
            except Exception as e:
                return f"❌ Error generating Gita guidance: {str(e)}"
        
        return "❌ Unknown Gita action. Try asking for spiritual guidance or life advice."
    
    def _handle_bible_action(self, action: Dict[str, Any], query: str) -> str:
        """Handle Bible-related actions"""
        if action['action'] == 'guidance':
            try:
                # Create the Bible guidance prompt similar to bhagwad_geeta.py
                prompt = f"""You are a wise and compassionate guide who answers life questions using the teachings of the Bible.

The user will share a personal or emotional concern. Respond with empathy, clarity, and quotes or summaries from the Bible that can help the user reflect and find peace.

User's message:
\"\"\"{query}\"\"\"

Your response (include relevant verses, chapter numbers if possible, and practical reflection):
"""
                
                # Generate guidance using the model
                guidance = self._generate_response(prompt)
                return f"Bible Guidance\n\n{guidance}"
                
            except Exception as e:
                return f"❌ Error generating Bible guidance: {str(e)}"
        
        return "❌ Unknown Bible action. Try asking for spiritual guidance or life advice."
    
    def _extract_event_details(self, query: str) -> Dict[str, Any]:
        """Extract event details from user query using AI"""
        prompt = f"""
        Extract event details from this query: "{query}"
        consider current date as "{date_str}", based on this date, figure out date tommorow  and day after tomorrow and later as well.
        convert the time to iso format as well. For example if user says "tommorow at 10 am" then return the date as tommorow and time as 10 am.
        finally give the time in ISO format YYYY-MM-DDTHH:MM:SSZ. set the endtime in the required format as well.


        Return a JSON object with:
        - summary: event title
        - start_time: datetime in ISO format
        - end_time: datetime in ISO format  
        - description: event description (optional)
        - location: event location (optional)
        - attendees: list of email addresses (optional)
        
        If any information is missing, use reasonable defaults.
        """
        
        response = self._generate_response(prompt)
        
        try:
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                details = json.loads(json_match.group())
                
                # Convert string dates to datetime objects
                if 'start_time' in details and isinstance(details['start_time'], str):
                    details['start_time'] = datetime.fromisoformat(details['start_time'].replace('Z', '+00:00'))
                if 'end_time' in details and isinstance(details['end_time'], str):
                    details['end_time'] = datetime.fromisoformat(details['end_time'].replace('Z', '+00:00'))
                
                return details
        except:
            pass
        
        # Fallback: create a simple event
        return {
            'summary': 'New Event',
            'start_time': datetime.now() + timedelta(hours=1),
            'end_time': datetime.now() + timedelta(hours=2),
            'description': 'Event created from user request',
            'location': '',
            'attendees': []
        }
    
    def _extract_email_details(self, query: str) -> Dict[str, Any]:
        """Extract email details from user query using AI"""
        prompt = f"""
        Extract email details from this query: "{query}"
        
        Return a JSON object with:
        - to: recipient email address
        - subject: email subject
        - body: email body content
        
        If any information is missing, use reasonable defaults.
        """
        
        response = self._generate_response(prompt)
        
        try:
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
        
        # Fallback: create a simple email
        return {
            'to': 'vvakshit11318@gmail.com',
            'subject': 'New Email',
            'body': 'Email content from user request'
        }
    
    def _generate_response(self, prompt: str) -> str:
        """Generate response using the Gemma3n model"""
        try:
            messages = [{
                "role": "user",
                "content": [{"type": "text", "text": prompt}]
            }]
            
            inputs = self.tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=True,
                tokenize=True,
                return_dict=True,
                return_tensors="pt",
            ).to("cuda")
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=Config.MAX_NEW_TOKENS,
                    temperature=0.7,
                    top_p=0.95,
                    top_k=64,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            # Extract only the newly generated tokens (exclude the input prompt)
            input_length = inputs['input_ids'].shape[1]
            generated_tokens = outputs[0][input_length:]
            response = self.tokenizer.decode(generated_tokens, skip_special_tokens=True)
            
            # Clean up
            del inputs, outputs
            torch.cuda.empty_cache()
            gc.collect()
            
            return response
            
        except Exception as e:
            return f"Error generating response: {str(e)}" 
