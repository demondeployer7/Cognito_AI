//
// 1. RUN YOUR PYTHON BACKEND
//
// Before you can use this endpoint, you need to have your Python AI assistant 
// running as a web server. We recommend using a framework like Flask or FastAPI.
// 
// Make sure it accepts POST requests on an endpoint (e.g., http://127.0.0.1:5000/get_response)
// and expects a JSON body like: { "message": "user's message", "mode": "general" }
//
// Example using Flask (ai_assistant.py):
//
// from flask import Flask, request, jsonify
//
// app = Flask(__name__)
//
// @app.route('/get_response', methods=['POST'])
// def get_response():
//     data = request.json
//     user_message = data.get('message')
//     mode = data.get('mode')
//
//     # --- YOUR AI LOGIC GOES HERE ---
//     # Example: 
//     ai_response = f"This is your AI's response to '{user_message}' in '{mode}' mode."
//     # --- END OF YOUR AI LOGIC ---
//
//     return jsonify({'response': ai_response})
//
// if __name__ == '__main__':
//     app.run(port=5000, debug=True)
//

import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/lib/api-config';

// 2. CONFIGURE THE PYTHON BACKEND URL
// This URL is now configured via environment variables
const PYTHON_API_ENDPOINT = apiConfig.endpoints.chat;

export async function POST(req: NextRequest) {
  try {
    const { message, mode } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 3. FORWARD THE REQUEST
    // This sends the user's message to your Python backend.
    const pythonResponse = await fetch(PYTHON_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, mode }),
    });

    if (!pythonResponse.ok) {
      const errorBody = await pythonResponse.text();
      console.error("Error from Python backend:", errorBody);
      throw new Error(`Python API responded with status: ${pythonResponse.status}`);
    }

    const data = await pythonResponse.json();

    // 4. RETURN THE RESPONSE
    // The response from your Python script is sent back to the chat UI.
    return NextResponse.json({ response: data.response });

  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ error: 'Failed to get response from AI assistant', details: error.message }, { status: 500 });
  }
}
