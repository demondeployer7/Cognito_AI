#!/usr/bin/env python3
"""
Flask Web Server - Bridge between Next.js Frontend and AI Assistant

This script creates a Flask web server that acts as a bridge between your Next.js 
frontend and the AI assistant located in the gapps folder. It handles HTTP requests 
from the frontend and processes them using your AI assistant.

Usage:
    python run.py

The server will start on http://127.0.0.1:5000 by default.
Make sure your Next.js frontend is configured to send requests to this endpoint.
"""

import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime
import traceback

# Add the gapps directory to the Python path so we can import ai_assistant
#sys.path.append(os.path.join(os.path.dirname(__file__), 'gapps'))

try:
    from ai_assistant import AIAssistant
except ImportError as e:
    print(f"Error importing AIAssistant: {e}")
    print("Make sure the gapps folder contains ai_assistant.py and all required dependencies are installed.")
    sys.exit(1)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes to allow requests from Next.js frontend

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai_server.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Global variable to store the AI assistant instance
ai_assistant = None

def initialize_ai_assistant():
    """Initialize the AI assistant with error handling"""
    global ai_assistant
    try:
        logger.info("Initializing AI Assistant...")
        ai_assistant = AIAssistant()
        logger.info("AI Assistant initialized successfully!")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize AI Assistant: {e}")
        logger.error(traceback.format_exc())
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify the server is running"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'ai_assistant_ready': ai_assistant is not None
    })

@app.route('/get_response', methods=['POST'])
def get_response():
    """
    Main endpoint that receives chat messages from the Next.js frontend
    and returns responses from the AI assistant.
    
    Expected JSON payload:
    {
        "message": "User's message here"
    }
    
    Returns:
    {
        "response": "AI assistant's response",
        "timestamp": "2024-01-01T12:00:00",
        "status": "success"
    }
    """
    try:
        # Check if AI assistant is initialized
        if ai_assistant is None:
            logger.error("AI Assistant not initialized")
            return jsonify({
                'error': 'AI Assistant not initialized',
                'status': 'error'
            }), 500
        
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No JSON data provided',
                'status': 'error'
            }), 400
        
        # Extract message from request
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({
                'error': 'No message provided',
                'status': 'error'
            }), 400
        
        logger.info(f"Processing message: {user_message[:100]}...")  # Log first 100 chars
        
        # Process the message using AI assistant
        ai_response = ai_assistant.process_user_query(user_message)
        
        logger.info(f"Generated response: {ai_response[:100]}...")  # Log first 100 chars
        
        # Return the response
        return jsonify({
            'response': ai_response,
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
        })
        
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        logger.error(traceback.format_exc())
        
        return jsonify({
            'error': f'Internal server error: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    """
    Alternative endpoint that matches the Next.js frontend expectations.
    This provides the same functionality as /get_response but with different naming.
    """
    return get_response()

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found',
        'status': 'error',
        'available_endpoints': ['/health', '/get_response', '/chat']
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({
        'error': 'Internal server error',
        'status': 'error'
    }), 500

def main():
    """Main function to start the Flask server"""
    print("=" * 60)
    print("🚀 AI Assistant Web Server")
    print("=" * 60)
    print(f"📁 Working directory: {os.getcwd()}")
    print(f"🐍 Python path includes: gapps/")
    print("=" * 60)
    
    # Initialize AI assistant
    print("🤖 Initializing AI Assistant...")
    if not initialize_ai_assistant():
        print("❌ Failed to initialize AI Assistant. Exiting.")
        sys.exit(1)
    
    print("✅ AI Assistant ready!")
    print("=" * 60)
    print("🌐 Starting Flask server...")
    print("📡 Server will be available at: http://127.0.0.1:5000")
    print("🔗 Health check: http://127.0.0.1:5000/health")
    print("💬 Chat endpoint: http://127.0.0.1:5000/get_response")
    print("=" * 60)
    print("📝 Logs will be saved to: ai_server.log")
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        # Start the Flask development server
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=False,  # Set to True for development debugging
            threaded=True  # Enable threading for better performance
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
        logger.error(f"Server startup error: {e}")

if __name__ == '__main__':
    main()
