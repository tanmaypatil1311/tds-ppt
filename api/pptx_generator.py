import sys
sys.path.append('backend/services')
from pptx_generator import generate_pptx  # Adjust to your actual function name

def handler(request):
    result = generate_pptx(request)
    return {
        "statusCode": 200,
        "body": result
    }
