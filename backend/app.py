from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import uuid
from werkzeug.utils import secure_filename
import logging
from datetime import datetime, timedelta
import threading
import time

from services.llm_service import LLMService
from services.pptx_analyzer import PPTXAnalyzer
from services.pptx_generator import PPTXGenerator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
UPLOAD_FOLDER = tempfile.mkdtemp()
ALLOWED_EXTENSIONS = {'pptx', 'potx'}

# Store for temporary session data (in production, use Redis or similar)
session_store = {}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def cleanup_old_sessions():
    """Clean up session data older than 1 hour"""
    while True:
        try:
            current_time = datetime.now()
            expired_sessions = [
                session_id for session_id, data in session_store.items()
                if current_time - data.get('created', current_time) > timedelta(hours=1)
            ]
            
            for session_id in expired_sessions:
                if session_id in session_store:
                    # Clean up any temporary files
                    session_data = session_store[session_id]
                    if 'template_path' in session_data and os.path.exists(session_data['template_path']):
                        os.remove(session_data['template_path'])
                    del session_store[session_id]
                    
            time.sleep(300)  # Run every 5 minutes
        except Exception as e:
            logger.error(f"Error in cleanup: {e}")
            time.sleep(300)

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_old_sessions, daemon=True)
cleanup_thread.start()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route('/api/analyze-text', methods=['POST'])
def analyze_text():
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400
            
        text = data['text']
        guidance = data.get('guidance', '')
        provider = data.get('provider', 'openai')
        api_key = data.get('apiKey', '')
        
        if not api_key:
            return jsonify({"error": "API key is required"}), 400
            
        if len(text) > 50000:  # 50k character limit
            return jsonify({"error": "Text too long. Maximum 50,000 characters."}), 400
        
        # Initialize LLM service
        llm_service = LLMService(provider, api_key)
        
        # Analyze text and generate slide structure
        slide_data = llm_service.analyze_text_for_slides(text, guidance)
        
        # Generate session ID for tracking
        session_id = str(uuid.uuid4())
        session_store[session_id] = {
            'created': datetime.now(),
            'slide_data': slide_data,
            'text': text,
            'guidance': guidance
        }
        
        return jsonify({
            "session_id": session_id,
            "slides": slide_data,
            "slide_count": len(slide_data)
        })
        
    except Exception as e:
        logger.error(f"Error in analyze_text: {e}")
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@app.route('/api/analyze-template', methods=['POST'])
def analyze_template():
    try:
        if 'template' not in request.files:
            return jsonify({"error": "No template file provided"}), 400
            
        file = request.files['template']
        session_id = request.form.get('session_id')
        
        if not session_id or session_id not in session_store:
            return jsonify({"error": "Invalid session"}), 400
            
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type. Only .pptx and .potx files are allowed"}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, f"{session_id}_{filename}")
        file.save(filepath)
        
        # Analyze template
        analyzer = PPTXAnalyzer()
        template_data = analyzer.analyze_template(filepath)
        
        # Store template data and path in session
        session_store[session_id].update({
            'template_data': template_data,
            'template_path': filepath
        })
        
        return jsonify({
            "template_analyzed": True,
            "layouts_found": len(template_data.get('layouts', [])),
            "images_found": len(template_data.get('images', [])),
            "theme_colors": len(template_data.get('colors', []))
        })
        
    except Exception as e:
        logger.error(f"Error in analyze_template: {e}")
        return jsonify({"error": f"Template analysis failed: {str(e)}"}), 500

@app.route('/api/generate-presentation', methods=['POST'])
def generate_presentation():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        options = data.get('options', {})
        
        if not session_id or session_id not in session_store:
            return jsonify({"error": "Invalid session"}), 400
            
        session_data = session_store[session_id]
        
        if 'template_data' not in session_data:
            return jsonify({"error": "Template not analyzed"}), 400
            
        # Generate presentation
        generator = PPTXGenerator()
        output_path = generator.generate_presentation(
            slides=session_data['slide_data'],
            template_data=session_data['template_data'],
            template_path=session_data['template_path'],
            options=options
        )
        
        # Return the generated file
        return send_file(
            output_path,
            as_attachment=True,
            download_name=f"generated_presentation_{session_id[:8]}.pptx",
            mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation'
        )
        
    except Exception as e:
        logger.error(f"Error in generate_presentation: {e}")
        return jsonify({"error": f"Generation failed: {str(e)}"}), 500

@app.route('/api/generate-speaker-notes', methods=['POST'])
def generate_speaker_notes():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        provider = data.get('provider', 'openai')
        api_key = data.get('apiKey', '')
        
        if not session_id or session_id not in session_store:
            return jsonify({"error": "Invalid session"}), 400
            
        session_data = session_store[session_id]
        
        # Generate speaker notes using LLM
        llm_service = LLMService(provider, api_key)
        slides_with_notes = llm_service.generate_speaker_notes(
            session_data['slide_data'], 
            session_data.get('guidance', '')
        )
        
        # Update session data
        session_store[session_id]['slide_data'] = slides_with_notes
        
        return jsonify({
            "notes_generated": True,
            "slides": slides_with_notes
        })
        
    except Exception as e:
        logger.error(f"Error in generate_speaker_notes: {e}")
        return jsonify({"error": f"Speaker notes generation failed: {str(e)}"}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large. Maximum size is 50MB."}), 413

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error occurred."}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)