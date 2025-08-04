#!/usr/bin/env python3
"""
Command Line Interface for Personal Assistant
"""

import argparse
import sys
from ai_assistant import AIAssistant
from config import Config

def main():
    parser = argparse.ArgumentParser(description="Personal Assistant CLI")
    parser.add_argument("--query", "-q", help="Your query to the assistant")
    parser.add_argument("--interactive", "-i", action="store_true", help="Run in interactive mode")
    
    args = parser.parse_args()
    
    try:
        print("🤖 Initializing Personal Assistant...")
        assistant = AIAssistant()
        print("✅ Assistant ready!")
        
        if args.query:
            # Single query mode
            print(f"\n📝 Query: {args.query}")
            print("🔄 Processing...")
            response = assistant.process_user_query(args.query)
            print(f"\n🤖 Response:\n{response}")
            
        elif args.interactive:
            # Interactive mode
            print("\n🤖 Personal Assistant is ready!")
            print("💡 Type 'quit' or 'exit' to stop")
            print("💡 Type 'help' for example queries")
            print("-" * 50)
            
            while True:
                try:
                    query = input("\n💬 You: ").strip()
                    
                    if query.lower() in ['quit', 'exit', 'q']:
                        print("👋 Goodbye!")
                        break
                    
                    if query.lower() == 'help':
                        print_help()
                        continue
                    
                    if not query:
                        continue
                    
                    print("🔄 Processing...")
                    response = assistant.process_user_query(query)
                    print(f"\n🤖 Assistant: {response}")
                    
                except KeyboardInterrupt:
                    print("\n👋 Goodbye!")
                    break
                except Exception as e:
                    print(f"❌ Error: {e}")
                    
        else:
            print("❌ Please provide a query with --query or run in interactive mode with --interactive")
            print_help()
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Failed to initialize assistant: {e}")
        print("💡 Make sure you have set up your Google credentials properly")
        sys.exit(1)

def print_help():
    """Print help information"""
    print("\n📋 Example Queries:")
    print("  • 'What's my schedule for today?'")
    print("  • 'Show me yesterday's calendar events'")
    print("  • 'Schedule a meeting with John tomorrow at 2pm'")
    print("  • 'Check my inbox'")
    print("  • 'Send an email to john@example.com about the project'")
    print("  • 'What's the weather like?'")
    print("\n🔧 Commands:")
    print("  • 'help' - Show this help")
    print("  • 'quit' or 'exit' - Exit the assistant")

if __name__ == "__main__":
    main() 