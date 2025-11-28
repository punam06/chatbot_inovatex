import os
import sys
from pathlib import Path

# Add the parent directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wasteclassifier.settings')

import django
from django.conf import settings

# Configure Django settings if not already done
if not settings.configured:
    django.setup()

from django.core.wsgi import get_wsgi_application
from werkzeug.wrappers import Request, Response
import io
import json

# Create WSGI app
wsgi_app = get_wsgi_application()

def app(environ, start_response):
    """WSGI application"""
    try:
        return wsgi_app(environ, start_response)
    except Exception as e:
        # Return error response
        error_msg = json.dumps({"error": str(e)})
        start_response('500 Internal Server Error', [('Content-Type', 'application/json')])
        return [error_msg.encode()]
