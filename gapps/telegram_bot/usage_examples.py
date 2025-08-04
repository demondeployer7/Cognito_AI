#!/usr/bin/env python3
"""
Usage examples for the modified Telegram Chat Downloader
"""

print("""
Telegram Chat Downloader - Usage Examples
==========================================

1. CLI Mode (Default):
   python main.py <chat_id_or_username>
   python main.py @channelname
   python main.py +1234567890

2. Download ALL chats and messages:
   python main.py all
   python main.py --all-chats

3. GUI Mode:
   python main.py gui

4. Using custom config file:
   python main.py --config /path/to/config.yml <chat_id>

5. Download with message limit:
   python main.py <chat_id> --limit 100

6. Download with date filtering:
   python main.py <chat_id> --last-days 30

Configuration:
==============

The script will look for config.yml in the same directory as main.py.
Edit config.yml and replace YOUR_API_ID and YOUR_API_HASH with your Telegram API credentials.

To get API credentials:
1. Go to https://my.telegram.org/apps
2. Create a new application
3. Copy API ID and API Hash to config.yml

Config file structure:
settings:
  api_id: YOUR_API_ID
  api_hash: YOUR_API_HASH
  save_path: ./downloads
  log_level: INFO
  log_file: ./app.log
presets: []
""")
