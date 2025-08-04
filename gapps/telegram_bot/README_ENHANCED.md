# Telegram Chat Downloader - Enhanced Version

This is an enhanced version of the Telegram Chat Downloader with the following modifications:

## Key Changes

### 1. CLI Mode by Default
- The application now starts in CLI mode by default instead of GUI mode
- GUI mode is only activated when explicitly requested with `python main.py gui`

### 2. Download All Chats Feature
- Added ability to download all available chats and messages with a single command
- Use `python main.py all` or `python main.py --all-chats` to download everything
- Also available as `python main.py all-chats` for convenience

### 3. Local Config File
- The application now looks for `config.yml` in the same directory as `main.py` by default
- No longer uses system-specific config directories unless explicitly specified
- This makes the application more portable and easier to configure

## Usage

### Basic Usage
```bash
# Download a specific chat
python main.py @channelname
python main.py +1234567890
python main.py chat_id

# Download ALL chats (new feature)
python main.py all
python main.py --all-chats

# Start GUI mode
python main.py gui

# Use custom config file
python main.py --config /path/to/config.yml chat_id
```

### Configuration

1. Edit the `config.yml` file in the same directory as `main.py`
2. Replace `YOUR_API_ID` and `YOUR_API_HASH` with your Telegram API credentials
3. Get API credentials from https://my.telegram.org/apps

Example config.yml:
```yaml
settings:
  api_id: 1234567
  api_hash: "your_api_hash_here"
  save_path: ./downloads
  log_level: INFO
  log_file: ./app.log
presets: []
```

### Additional Options

```bash
# Download with message limit
python main.py chat_id --limit 100

# Download last 30 days
python main.py chat_id --last-days 30

# Download with date range
python main.py chat_id --from 2023-01-01 --until 2023-12-31

# Enable debug logging
python main.py chat_id --debug

# Output as JSON
python main.py chat_id --results-json
```

## Features

- **All Chats Download**: Automatically discovers and downloads all available chats
- **Local Configuration**: Uses local config file for easy setup and portability
- **CLI Default**: Command-line interface is the default mode
- **Progress Tracking**: Shows progress while downloading multiple chats
- **Error Handling**: Continues downloading other chats if one fails
- **Flexible Output**: Supports various output formats and filtering options

## File Structure

```
telegram/
├── main.py                 # Enhanced main entry point
├── config.yml             # Local configuration file
├── usage_examples.py       # Usage examples and help
├── downloads/              # Downloaded chats (created automatically)
└── src/                   # Source code
    └── telegram_download_chat/
        ├── cli/            # Command-line interface
        ├── core/           # Core functionality
        ├── gui/            # GUI components (optional)
        └── ...
```

remove lock 
❯ find ~/.local/share/telegram-download-chat -name "*.session" 2>/dev/null
/home/akshit/.local/share/telegram-download-chat/session.session
❯ rm -f ~/.local/share/telegram-download-chat/session.session


## Requirements

- Python 3.7+
- Telegram API credentials (api_id and api_hash)
- Required Python packages (install with pip install -r requirements.txt if available)

## Getting Started

1. Clone or download this enhanced version
2. Edit `config.yml` with your Telegram API credentials
3. Run `python main.py all` to download all your chats
4. Or run `python main.py @specific_channel` to download a specific chat

The downloaded files will be saved to the `downloads` directory (or the path specified in your config file).
