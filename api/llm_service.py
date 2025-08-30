import sys
sys.path.append('backend/services')
from llm_service import main_function  # Adjust to your actual function name

def handler(request):
    # Vercel passes request as a dict
    # You may need to parse request['body'] or request['queryStringParameters']
    result = main_function(request)
    return {
        "statusCode": 200,
        "body": result
    }
