import os
import sys
import django
from django.conf import settings
from django.core.wsgi import get_wsgi_application
from django.http import HttpResponse

# Add the project directory to the path
project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wasteclassifier.settings')
django.setup()

# Get WSGI application
application = get_wsgi_application()

# Vercel handler
def handler(request):
    return application(request)
