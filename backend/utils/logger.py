"""
Logger setup with structured logging for Cloud Run/Vertex AI.
"""

import logging
import sys
import json
from datetime import datetime


def setup_logger(name: str, level: str = None) -> logging.Logger:
    """
    Setup structured logger for Cloud Run compatibility.
    
    Args:
        name: Logger name
        level: Log level (DEBUG, INFO, WARNING, ERROR)
    
    Returns:
        Configured logger
    """
    import os
    
    log_level = level or os.getenv("LOG_LEVEL", "INFO")
    
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Remove existing handlers
    logger.handlers = []
    
    # Create handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(getattr(logging, log_level.upper()))
    
    # Use JSON formatter for Cloud Run
    if os.getenv("CLOUD_RUN", "false").lower() == "true":
        formatter = CloudRunFormatter()
    else:
        formatter = ColoredFormatter()
    
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger


class CloudRunFormatter(logging.Formatter):
    """JSON formatter for Google Cloud Run structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "severity": record.levelname,
            "message": record.getMessage(),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "logger": record.name,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_entry)


class ColoredFormatter(logging.Formatter):
    """Colored formatter for local development"""
    
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m'
    }
    
    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        reset = self.COLORS['RESET']
        
        timestamp = datetime.now().strftime('%H:%M:%S')
        
        # Format: [HH:MM:SS] LEVEL: message
        formatted = f"{color}[{timestamp}] {record.levelname:8s}{reset} {record.getMessage()}"
        
        # Add exception if present
        if record.exc_info:
            formatted += "\n" + self.formatException(record.exc_info)
        
        return formatted
