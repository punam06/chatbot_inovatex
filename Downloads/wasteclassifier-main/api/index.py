import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wasteclassifier.settings')

# Setup Django
import django
from django.conf import settings

if not settings.configured:
    django.setup()

from django.core.wsgi import get_wsgi_application
from django.contrib.staticfiles.handlers import StaticFilesHandler

# Get the WSGI application
wsgi_app = get_wsgi_application()

# Use StaticFilesHandler to serve static files in production
app = StaticFilesHandler(wsgi_app)
