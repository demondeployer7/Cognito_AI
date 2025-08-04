# Cognito AI Chat Starter

This is a Next.js starter project for building a beautiful and functional AI chat application. It includes a modern UI, chat history, and a backend setup to connect to your own AI models.

## Getting Started

Follow these steps to get your development environment set up and running.

### 1. Install Dependencies

First, open your terminal, navigate to the project's root directory, and run the following command to install all the required packages listed in `package.json`:

```bash
npm install
```

### 2. Run the Development Server

Once the dependencies are installed, you can start the Next.js development server. This command will launch the application on `http://localhost:9002` by default.

```bash
npm run dev
```

Your application should now be running! You can open your browser and navigate to the local URL to see it in action.

### 3. Integrating Your Python AI Assistant

As we discussed, the application is set up to forward chat messages to a Python backend.

-   The API endpoint in this Next.js app is located at `src/app/api/chat/route.ts`.
-   This endpoint is configured to send requests to `http://127.0.0.1:5000/get_response`.
-   You will need to run your `ai_assistant.py` script as a web server (e.g., using Flask) and make sure it's listening for requests on that address.

You can find more detailed instructions and an example Flask server setup in the comments within `src/app/api/chat/route.ts`.
