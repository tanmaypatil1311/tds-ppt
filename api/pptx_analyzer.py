import sys
sys.path.append('backend/services')
from pptx_analyzer import analyze_pptx  # Adjust to your actual function name

def handler(request):
    result = analyze_pptx(request)
    return {
        "statusCode": 200,
        "body": result
    }
