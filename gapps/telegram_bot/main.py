#!/usr/bin/env python3
"""
Entry point for PyInstaller to handle imports correctly.
Launches CLI by default, with options for all chats extraction.
"""
import argparse
import asyncio
import os
import sys
from pathlib import Path

# Add the src directory to the Python path
src_dir = Path(__file__).parent / "src"
sys.path.insert(0, str(src_dir))


def get_local_config_path():
    """Get config file path from the same directory as main.py."""
    return Path(__file__).parent / "config.yml"


def is_gui_mode():
    """Determine if we should run in GUI mode."""
    # Only run GUI if explicitly requested
    return len(sys.argv) > 1 and sys.argv[1] == "gui"


def parse_main_args():
    """Parse main.py specific arguments."""
    parser = argparse.ArgumentParser(
        description="Telegram Chat Downloader",
        add_help=False  # We'll handle help separately
    )
    
    parser.add_argument("command", nargs="?", 
                       help="Command to run: 'gui' for GUI mode, 'all' to download all chats, or chat identifier")
    
    parser.add_argument("--config", "-c",
                       default=None,
                       help="Path to config file (default: config.yml in script directory)")
    
    parser.add_argument("--all-chats", action="store_true",
                       help="Download all available chats and messages")
    
    # Parse known args to avoid conflicts with CLI args
    args, remaining = parser.parse_known_args()
    
    # Put remaining args back into sys.argv for CLI processing
    sys.argv = [sys.argv[0]] + remaining
    
    return args


def main():
    # Parse our main arguments first
    main_args = parse_main_args()
    
    # Set default config to local directory if not specified
    config_path = main_args.config or str(get_local_config_path())
    
    # Handle special commands
    if main_args.command == "gui" or is_gui_mode():
        try:
            from telegram_download_chat.gui.main import main as gui_main
            from telegram_download_chat.core import TelegramChatDownloader
            from telegram_download_chat.paths import get_app_dir
            
            downloader = TelegramChatDownloader(config_path=config_path)
            output_dir = downloader.config.get("settings", {}).get(
                "save_path", get_app_dir() / "downloads"
            )
            gui_main(output_dir=output_dir)
        except ImportError as e:
            print(f"Error: {e}")
            print("GUI dependencies not found. Falling back to CLI mode.")
            from telegram_download_chat.cli import main as cli_main
            # Add config to CLI args
            if "--config" not in sys.argv and "-c" not in sys.argv:
                sys.argv.extend(["--config", config_path])
            return cli_main()
    elif main_args.command == "all" or main_args.all_chats:
        # Use the existing CLI infrastructure but modify sys.argv to use "all" as chat
        sys.argv = [sys.argv[0], "all", "--config", config_path] + sys.argv[1:]
        # Remove our custom arguments that CLI doesn't understand
        sys.argv = [arg for arg in sys.argv if arg != "--all-chats"]
        from telegram_download_chat.cli import main as cli_main
        return cli_main()
    else:
        # Default CLI mode
        from telegram_download_chat.cli import main as cli_main
        # Add config to CLI args if not already present
        if "--config" not in sys.argv and "-c" not in sys.argv:
            sys.argv.extend(["--config", config_path])
        # If we have a command, use it as the chat identifier
        if main_args.command and main_args.command not in ["gui", "all"]:
            sys.argv.insert(1, main_args.command)
        return cli_main()


if __name__ == "__main__":
    sys.exit(main())
