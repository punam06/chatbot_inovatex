import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wasteclassifier.settings')

import django
django.setup()

from django.core.wsgi import get_wsgi_application
app = get_wsgi_application()
