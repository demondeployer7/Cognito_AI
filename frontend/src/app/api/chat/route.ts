/**
 * Next.js API Route - Chat Endpoint
 * 
 * This endpoint receives chat messages from the frontend and forwards them
 * to the Python AI assistant running on Flask server (run.py).
 * 
 * The Python server expects: { "message": "user's message" }
 * The Python server returns: { "response": "AI response", "timestamp": "...", "status": "success" }
 * 
 * To start the system:
 * 1. Install Flask dependencies: pip install -r flask_requirements.txt
 * 2. Start Python server: python run.py
 * 3. Start Next.js: npm run dev
 */

import { NextRequest, NextResponse } from 'next/server';

// Configuration - matches the run.py Flask server
const PYTHON_API_ENDPOINT = 'http://127.0.0.1:5000/get_response';
const REQUEST_TIMEOUT = 30000; // 30 seconds

interface ChatRequest {
  message: string;
  mode?: 'general' | 'spiritual';
}

interface PythonResponse {
  response: string;
  timestamp: string;
  status: 'success' | 'error';
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 Chat API endpoint called');

    const body: ChatRequest = await req.json();
    const { message, mode } = body;

    if (!message || message.trim() === '') {
      console.log('❌ No message provided');
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log(`📤 Sending message to Python backend: ${message.substring(0, 100)}...`);
    console.log(`🎯 Mode: ${mode || 'not specified'}`);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      // Forward request to Python Flask server (run.py)
      // Note: run.py only expects { message }, mode is handled internally by the AI assistant
      const pythonResponse = await fetch(PYTHON_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }), // Only send message, as expected by run.py
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!pythonResponse.ok) {
        const errorText = await pythonResponse.text();
        console.error(`❌ Python backend error (${pythonResponse.status}):`, errorText);

        return NextResponse.json({
          error: `Backend server error: ${pythonResponse.status}`,
          details: errorText
        }, { status: 502 });
      }

      const pythonData: PythonResponse = await pythonResponse.json();

      // Handle error response from Python backend
      if (pythonData.status === 'error') {
        console.error('❌ Python backend returned error:', pythonData.error);
        return NextResponse.json({
          error: pythonData.error || 'Unknown backend error'
        }, { status: 500 });
      }

      console.log(`✅ Received response from Python backend: ${pythonData.response.substring(0, 100)}...`);

      // Return response in format expected by frontend
      return NextResponse.json({
        response: pythonData.response,
        timestamp: pythonData.timestamp
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        console.log('⏰ Request timeout - Python backend took too long to respond');
        return NextResponse.json({
          error: 'Request timeout - AI assistant is taking too long to respond'
        }, { status: 408 });
      }

      // Connection errors
      if (fetchError.code === 'ECONNREFUSED' || fetchError.message.includes('fetch')) {
        console.log('🔌 Connection refused - Python backend is not running');
        return NextResponse.json({
          error: 'AI assistant backend is not available. Please ensure the Python server is running.',
          hint: 'Run: python run.py'
        }, { status: 503 });
      }

      throw fetchError;
    }

  } catch (error: any) {
    console.error('💥 Unexpected error in chat API:', error);

    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Handle GET requests for health checking and information
export async function GET() {
  try {
    // Check if Python backend is running
    const healthResponse = await fetch('http://127.0.0.1:5000/health', {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const healthData = await healthResponse.json();

    return NextResponse.json({
      message: 'Chat API is ready',
      backend_status: 'connected',
      backend_health: healthData,
      instructions: {
        usage: 'Send POST requests with { "message": "your message here" }',
        python_server: 'Ensure Python server is running: python run.py',
        endpoint: PYTHON_API_ENDPOINT
      }
    });

  } catch (error) {
    return NextResponse.json({
      message: 'Chat API is ready, but backend is not available',
      backend_status: 'disconnected',
      error: 'Python backend not available',
      instructions: {
        setup: [
          '1. Install dependencies: pip install -r flask_requirements.txt',
          '2. Start Python server: python run.py',
          '3. Verify server at: http://127.0.0.1:5000/health'
        ]
      }
    });
  }
}

/*
 * SETUP INSTRUCTIONS FOR FULL INTEGRATION:
 * 
 * 1. Install Python Flask dependencies:
 *    pip install -r flask_requirements.txt
 * 
 * 2. Start the Python Flask server:
 *    python run.py
 * 
 * 3. Verify the Python server is running:
 *    curl http://127.0.0.1:5000/health
 * 
 * 4. Start the Next.js development server:
 *    npm run dev
 * 
 * 5. Test the integration:
 *    Open http://localhost:3000 and start chatting!
 * 
 * The chat messages will flow:
 * Frontend → Next.js API (/api/chat) → Python Flask (run.py) → AI Assistant → Response back
 * 
 * TROUBLESHOOTING:
 * 
 * - "AI assistant backend is not available":
 *   → Make sure run.py is running: python run.py
 * 
 * - "Request timeout":
 *   → AI model is taking too long to load/respond
 *   → Check ai_server.log for details
 * 
 * - Import errors in Python:
 *   → Install dependencies: pip install -r flask_requirements.txt
 *   → Check that gapps/ai_assistant.py exists
 * 
 * - CORS errors:
 *   → Flask-CORS is properly configured in run.py
 *   → Ensure both servers are running on specified ports
 */
