import openai
import anthropic
import google.generativeai as genai
import json
import re
import time
import logging
from typing import List, Dict, Any
import requests

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self, provider: str, api_key: str):
        self.provider = provider.lower()
        self.api_key = api_key
        self._setup_client()

    def _setup_client(self):
        """Initialize the appropriate LLM client"""
        try:
            if self.provider == 'openai':
                openai.api_key = self.api_key
                self.client = openai
            elif self.provider == 'anthropic':
                self.client = anthropic.Anthropic(api_key=self.api_key)
            elif self.provider == 'gemini':
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel('gemini-pro')
            else:
                raise ValueError(f"Unsupported provider: {self.provider}")
        except Exception as e:
            logger.error(f"Failed to setup LLM client: {e}")
            raise

    def analyze_text_for_slides(self, text: str, guidance: str = "") -> List[Dict]:
        """Analyze text and break it down into slides"""

        prompt = self._create_analysis_prompt(text, guidance)

        try:
            response = self._make_llm_call(prompt)
            slides = self._parse_slide_response(response)

            # Validate and clean slides
            slides = self._validate_slides(slides)

            return slides

        except Exception as e:
            logger.error(f"Error analyzing text: {e}")
            # Fallback to simple text splitting
            return self._fallback_text_analysis(text)

    def _create_analysis_prompt(self, text: str, guidance: str) -> str:
        """Create the prompt for text analysis"""

        base_prompt = f"""
        Analyze the following text and break it down into a PowerPoint presentation structure.
        
        Text to analyze:
        {text[:5000]}...  # Truncate very long texts for the prompt
        
        {"Guidance: " + guidance if guidance else ""}
        
        Please return a JSON array where each object represents a slide with this structure:
        {{
            "slide_number": 1,
            "slide_type": "title" | "content" | "section" | "conclusion",
            "title": "Slide title",
            "content": ["Bullet point 1", "Bullet point 2", ...],
            "notes": "Optional speaker notes"
        }}
        
        Guidelines:
        - Create 5-15 slides depending on content length
        - Use clear, concise titles
        - Break content into logical bullet points
        - Include a title slide and conclusion slide
        - Vary slide types for better flow
        - Keep bullet points under 15 words each
        
        Return ONLY the JSON array, no additional text.
        """

        return base_prompt

    def _make_llm_call(self, prompt: str, max_retries: int = 3) -> str:
        """Make API call to the LLM with retry logic"""

        for attempt in range(max_retries):
            try:
                if self.provider == 'openai':
                    response = self.client.ChatCompletion.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": "You are a presentation expert. Always respond with valid JSON only."},
                            {"role": "user", "content": prompt}
                        ],
                        max_tokens=2000,
                        temperature=0.7
                    )
                    return response.choices[0].message.content

                elif self.provider == 'anthropic':
                    response = self.client.messages.create(
                        model="claude-3-sonnet-20240229",
                        max_tokens=2000,
                        temperature=0.7,
                        messages=[
                            {"role": "user", "content": prompt}
                        ]
                    )
                    return response.content[0].text

                elif self.provider == 'gemini':
                    response = self.client.generate_content(prompt)
                    return response.text

            except Exception as e:
                logger.warning(f"LLM call attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    raise

    def _parse_slide_response(self, response: str) -> List[Dict]:
        """Parse the LLM response into slide data"""
        try:
            # Extract JSON from response (sometimes LLMs add extra text)
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                slides = json.loads(json_str)
            else:
                # Try to parse the whole response as JSON
                slides = json.loads(response)

            return slides

        except json.JSONDecodeError:
            logger.error(
                f"Failed to parse LLM response as JSON: {response[:200]}...")
            raise ValueError("Invalid JSON response from LLM")

    def _validate_slides(self, slides: List[Dict]) -> List[Dict]:
        """Validate and clean slide data"""
        validated_slides = []

        for i, slide in enumerate(slides):
            try:
                validated_slide = {
                    "slide_number": slide.get("slide_number", i + 1),
                    "slide_type": slide.get("slide_type", "content"),
                    "title": slide.get("title", f"Slide {i + 1}"),
                    "content": slide.get("content", []),
                    "notes": slide.get("notes", "")
                }

                # Ensure content is a list
                if isinstance(validated_slide["content"], str):
                    validated_slide["content"] = [validated_slide["content"]]
                elif not isinstance(validated_slide["content"], list):
                    validated_slide["content"] = []

                # Limit bullet points
                validated_slide["content"] = validated_slide["content"][:8]

                # Clean up text
                validated_slide["title"] = str(validated_slide["title"])[:100]
                validated_slide["content"] = [
                    str(item)[:200] for item in validated_slide["content"]]

                validated_slides.append(validated_slide)

            except Exception as e:
                logger.warning(f"Error validating slide {i}: {e}")
                continue

        # Ensure we have at least one slide
        if not validated_slides:
            return self._create_default_slide()

        return validated_slides

    def _fallback_text_analysis(self, text: str) -> List[Dict]:
        """Simple fallback when LLM fails"""
        logger.info("Using fallback text analysis")

        # Split text into paragraphs
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]

        slides = []

        # Title slide
        first_line = text.split('\n')[0][:100]
        slides.append({
            "slide_number": 1,
            "slide_type": "title",
            "title": first_line or "Presentation",
            "content": [],
            "notes": ""
        })

        # Content slides
        slides_per_paragraph = max(
            1, len(paragraphs) // 8)  # Aim for ~8 slides max

        for i, paragraph in enumerate(paragraphs[::slides_per_paragraph]):
            sentences = [s.strip()
                         for s in paragraph.split('.') if s.strip()][:5]

            slides.append({
                "slide_number": len(slides) + 1,
                "slide_type": "content",
                "title": f"Key Point {i + 1}",
                "content": sentences,
                "notes": paragraph[:200] + "..."
            })

        return slides

    def _create_default_slide(self) -> List[Dict]:
        """Create a default slide when everything fails"""
        return [{
            "slide_number": 1,
            "slide_type": "title",
            "title": "Generated Presentation",
            "content": ["Content could not be processed automatically"],
            "notes": "Please review and edit this presentation manually."
        }]

    def generate_speaker_notes(self, slides: List[Dict], guidance: str = "") -> List[Dict]:
        """Generate speaker notes for each slide"""

        for slide in slides:
            if slide.get('notes'):
                continue  # Skip if notes already exist

            try:
                notes_prompt = f"""
                Generate speaker notes for this slide:
                Title: {slide['title']}
                Content: {slide['content']}
                
                {"Context: " + guidance if guidance else ""}
                
                Provide 2-3 sentences of speaker notes that expand on the slide content.
                Make it natural and conversational. Return only the notes text.
                """

                notes = self._make_llm_call(notes_prompt)
                slide['notes'] = notes.strip()

            except Exception as e:
                logger.warning(
                    f"Failed to generate notes for slide {slide['slide_number']}: {e}")
                slide['notes'] = f"Notes for: {slide['title']}"

        return slides

    def suggest_presentation_improvements(self, slides: List[Dict]) -> Dict[str, Any]:
        """Suggest improvements to the presentation structure"""

        try:
            improvement_prompt = f"""
            Analyze this presentation structure and suggest improvements:
            
            {json.dumps(slides, indent=2)}
            
            Provide suggestions for:
            1. Better slide organization
            2. Content improvements
            3. Missing slides that should be added
            4. Slides that could be merged or split
            
            Return as JSON with keys: organization, content, additions, modifications
            """

            response = self._make_llm_call(improvement_prompt)
            return json.loads(response)

        except Exception as e:
            logger.error(f"Failed to generate improvements: {e}")
            return {
                "organization": "Review slide flow and logical progression",
                "content": "Ensure bullet points are concise and impactful",
                "additions": "Consider adding agenda and next steps slides",
                "modifications": "Review titles for clarity and engagement"
            }
