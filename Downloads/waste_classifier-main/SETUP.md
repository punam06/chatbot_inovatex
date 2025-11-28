# Waste Classifier - Setup Guide

## Prerequisites
- Python 3.8+
- pip (Python package manager)
- Git

## Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/punam06/waste_classifier
cd waste_classifier
```

### 2. Create Virtual Environment
```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Google API Key
# GOOGLE_API_KEY=your_actual_api_key_here
```

**To get a Google API Key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and paste it in your `.env` file

### 5. Run the Development Server
```bash
python manage.py runserver
```

The app will be available at `http://127.0.0.1:8000/`

## Vercel Deployment

### 1. Add Environment Variables to Vercel
1. Go to your [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - Name: `GOOGLE_API_KEY`
   - Value: Your Google API key
5. Click Save

### 2. Add Vercel Configuration (Optional)
Create a `vercel.json` file in your project root if you need custom configuration:
```json
{
  "buildCommand": "pip install -r requirements.txt",
  "env": {
    "GOOGLE_API_KEY": "@google_api_key"
  }
}
```

## Troubleshooting

### "GOOGLE_API_KEY environment variable not set" Error
- Make sure your `.env` file exists in the project root
- Verify the API key is correctly set
- Restart the development server after updating `.env`

### Import Errors
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again
- Check Python version: `python --version`

### Static Files Not Loading
```bash
python manage.py collectstatic
```

## Project Structure
```
waste_classifier/
├── wasteclassifier/          # Main Django app
│   ├── static/              # CSS, JS, Images
│   ├── templates/           # HTML templates
│   ├── settings.py          # Django settings
│   ├── urls.py              # URL configuration
│   ├── views.py             # View functions
│   └── wsgi.py              # WSGI configuration
├── manage.py                # Django management script
├── requirements.txt         # Python dependencies
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore file
└── README.md                # Project documentation
```
