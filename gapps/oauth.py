from google_auth import GoogleAuth
from config import Config

# Helper function to authenticate on a specific port

def authenticate_on_port(scopes, port=8080, label="", token_file=None):
    from google_auth_oauthlib.flow import InstalledAppFlow
    import os
    if not os.path.exists(Config.CREDENTIALS_FILE):
        raise FileNotFoundError(f"Credentials file '{Config.CREDENTIALS_FILE}' not found.")
    print(f"\n--- {label} Authentication (port {port}) ---")
    flow = InstalledAppFlow.from_client_secrets_file(Config.CREDENTIALS_FILE, scopes)
    # Ensure we get refresh tokens by setting access_type=offline
    flow.redirect_uri = f"http://localhost:{port}/"
    creds = flow.run_local_server(port=port, access_type='offline', prompt='consent')
    # Save token
    if token_file is None:
        token_file = f"token_{label.lower()}.json"
    with open(token_file, 'w') as token:
        token.write(creds.to_json())
    print(f"Token for {label} generated and saved to {token_file}\n")

if __name__ == "__main__":
    print("\nGoogle OAuth Authentication Script")
    print("Make sure you have 'credentials.json' in this directory.")
    print("A browser window will open for authentication.")
    print("Make sure your Google Cloud Console has these redirect URIs configured:")
    print("- http://localhost:8080/")
    print("- http://localhost:8081/")
    
    # Gmail on 8080
    authenticate_on_port(Config.GMAIL_SCOPES, port=8080, label="Gmail", token_file="token_gmail.json")
    # Calendar on 8081
    authenticate_on_port(Config.CALENDAR_SCOPES, port=8081, label="Calendar", token_file="token_calendar.json")
    print("All tokens generated!")
    print("Files created:")
    print("- token_gmail.json (for Gmail)")
    print("- token_calendar.json (for Calendar)")