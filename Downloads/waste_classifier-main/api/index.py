import os
import sys
from pathlib import Path

# Add the parent directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Setup Django before importing anything else
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wasteclassifier.settings')

import django
django.setup()

from django.core.wsgi import get_wsgi_application

# Get the WSGI application
app = get_wsgi_application()

# Vercel handler
async def handler(request):
    """Handle incoming requests from Vercel"""
    return app(request)
