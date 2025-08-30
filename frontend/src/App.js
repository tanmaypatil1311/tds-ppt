import React, { useState } from 'react';
import TextInput from './components/TextInput';
import TemplateUpload from './components/TemplateUpload';
import APIKeyInput from './components/APIKeyInput';
import SlidePreview from './components/SlidePreview';
import GenerationControls from './components/GenerationControls';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import SuccessMessage from './components/SuccessMessage';
import Header from './components/Header';
import Footer from './components/Footer';
import { generatePresentation } from './utils/api';
import './App.css';

function App() {
  const [state, setState] = useState({
    // Input data
    inputText: '',
    guidance: '',
    apiKey: '',
    provider: 'openai',
    templateFile: null,
    
    // Generation state
    sessionId: null,
    slides: [],
    templateAnalyzed: false,
    
    // UI state
    currentStep: 1,
    isLoading: false,
    loadingMessage: '',
    error: null,
    success: null,
    
    // Options
    options: {
      includeImages: true,
      generateNotes: false,
      presentationTone: 'professional'
    }
  });

  const updateState = (updates) => {
    setState(prevState => ({ ...prevState, ...updates }));
  };

  const handleStepChange = (step) => {
    updateState({ currentStep: step, error: null });
  };

  const handleTextAnalysis = async () => {
    if (!state.inputText.trim() || !state.apiKey.trim()) {
      updateState({ error: 'Please provide both text content and API key.' });
      return;
    }

    updateState({ isLoading: true, loadingMessage: 'Analyzing your text...', error: null });

    try {
      const result = await generatePresentation.analyzeText({
        text: state.inputText,
        guidance: state.guidance,
        provider: state.provider,
        apiKey: state.apiKey
      });

      updateState({
        sessionId: result.session_id,
        slides: result.slides,
        isLoading: false,
        loadingMessage: '',
        success: `Successfully analyzed text into ${result.slide_count} slides!`,
        currentStep: 2
      });

      // Auto-clear success message
      setTimeout(() => updateState({ success: null }), 3000);

    } catch (error) {
      updateState({
        isLoading: false,
        loadingMessage: '',
        error: error.message || 'Failed to analyze text. Please check your API key and try again.'
      });
    }
  };

  const handleTemplateUpload = async (file) => {
    if (!state.sessionId) {
      updateState({ error: 'Please analyze your text first.' });
      return;
    }

    updateState({ 
      isLoading: true, 
      loadingMessage: 'Analyzing template...', 
      error: null,
      templateFile: file 
    });

    try {
      const result = await generatePresentation.analyzeTemplate(file, state.sessionId);
      
      updateState({
        templateAnalyzed: true,
        isLoading: false,
        loadingMessage: '',
        success: `Template analyzed! Found ${result.layouts_found} layouts and ${result.images_found} images.`,
        currentStep: 3
      });

      // Auto-clear success message
      setTimeout(() => updateState({ success: null }), 3000);

    } catch (error) {
      updateState({
        isLoading: false,
        loadingMessage: '',
        error: error.message || 'Failed to analyze template. Please check the file format.'
      });
    }
  };

//   const handleGeneration = async () => {
//     if (!state.sessionId || !state.templateAnalyzed) {
//       updateState({ error: 'Please complete all previous steps first.' });
//       return;
//     }

//     updateState({ 
//       isLoading: true, 
//       loadingMessage: 'Generating your presentation...', 
//       error: null 
//     });

//     try {
//       // Generate speaker notes if requested
//       if (state.options.generateNotes) {
//         updateState({ loadingMessage: 'Adding speaker notes...' });
        
//         await generatePresentation.generateSpeakerNotes({
//           session_id: state.sessionId,
//           provider: state.provider,
//           apiKey: state.apiKey
//         });
//       }

//       // Generate final presentation
//       updateState({ loadingMessage: 'Creating presentation file...' });
      
//       const blob = await generatePresentation.generatePresentation({
//         session_id: state.sessionId,
//         options: state.options
//       });

//       // Trigger download
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `generated-presentation-${Date.now()}.pptx`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);

//       updateState({
//         isLoading: false,
//         loadingMessage: '',
//         success: 'Presentation generated successfully! Download should start automatically.',
//         currentStep: 4
//       });

//       // Auto-clear success message
//       setTimeout(() => updateState({ success: null }), 5000);

//     } catch (error) {
//       updateState({
//         isLoading: false,
//         loadingMessage: '',
//         error: error.message || 'Failed to generate presentation. Please try again.'
//       });
//     }
//   };

   const handleGeneration = async () => {
      if (!state.sessionId || !state.templateAnalyzed) {
         updateState({ error: 'Please complete all previous steps first.' });
         return;
      }

      updateState({ 
         isLoading: true, 
         loadingMessage: 'Generating your presentation...', 
         error: null 
      });

      try {
         // Generate speaker notes if requested
         if (state.options.generateNotes) {
            updateState({ loadingMessage: 'Adding speaker notes...' });
            
            await generatePresentation.generateSpeakerNotes({
            session_id: state.sessionId,
            provider: state.provider,
            apiKey: state.apiKey
            });
         }

         // Generate final presentation
         updateState({ loadingMessage: 'Creating presentation file...' });
         
         const blob = await generatePresentation.generatePresentation({
           session_id: state.sessionId,
           options: state.options,
           slides: state.slides   // <--- send actual slide data
         });

         // Trigger download
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `generated-presentation-${Date.now()}.pptx`;
         document.body.appendChild(a);
         a.click();
         window.URL.revokeObjectURL(url);
         document.body.removeChild(a);

         updateState({
            isLoading: false,
            loadingMessage: '',
            success: 'Presentation generated successfully! Download should start automatically.',
            currentStep: 4
         });

         setTimeout(() => updateState({ success: null }), 5000);

      } catch (error) {
         updateState({
            isLoading: false,
            loadingMessage: '',
            error: error.message || 'Failed to generate presentation. Please try again.'
         });
      }
      };

   
  const handleReset = () => {
    setState({
      inputText: '',
      guidance: '',
      apiKey: '',
      provider: 'openai',
      templateFile: null,
      sessionId: null,
      slides: [],
      templateAnalyzed: false,
      currentStep: 1,
      isLoading: false,
      loadingMessage: '',
      error: null,
      success: null,
      options: {
        includeImages: true,
        generateNotes: false,
        presentationTone: 'professional'
      }
    });
  };

  const isStepCompleted = (step) => {
    switch (step) {
      case 1: return state.slides.length > 0;
      case 2: return state.templateAnalyzed;
      case 3: return state.currentStep > 3;
      default: return false;
    }
  };

  const canProceedToStep = (step) => {
    switch (step) {
      case 1: return true;
      case 2: return state.slides.length > 0;
      case 3: return state.templateAnalyzed;
      case 4: return state.templateAnalyzed;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => canProceedToStep(step) && handleStepChange(step)}
                  disabled={!canProceedToStep(step)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isStepCompleted(step)
                      ? 'bg-green-500 text-white'
                      : state.currentStep === step
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : canProceedToStep(step)
                      ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isStepCompleted(step) ? '✓' : step}
                </button>
                {step < 4 && (
                  <div className={`h-1 w-24 mx-2 transition-all duration-300 ${
                    isStepCompleted(step) ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {state.currentStep === 1 && 'Step 1: Enter Your Content'}
              {state.currentStep === 2 && 'Step 2: Upload Template'}
              {state.currentStep === 3 && 'Step 3: Review & Generate'}
              {state.currentStep === 4 && 'Step 4: Download Complete'}
            </h2>
            <p className="text-gray-600">
              {state.currentStep === 1 && 'Paste your text and provide your API key to get started'}
              {state.currentStep === 2 && 'Upload a PowerPoint template to style your presentation'}
              {state.currentStep === 3 && 'Review your slides and generate the final presentation'}
              {state.currentStep === 4 && 'Your presentation is ready for download!'}
            </p>
          </div>
        </div>

        {/* Error and Success Messages */}
        {state.error && <ErrorMessage message={state.error} onClose={() => updateState({ error: null })} />}
        {state.success && <SuccessMessage message={state.success} onClose={() => updateState({ success: null })} />}

        {/* Loading Spinner */}
        {state.isLoading && <LoadingSpinner message={state.loadingMessage} />}

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {state.currentStep === 1 && (
              <div className="space-y-6">
                <TextInput
                  text={state.inputText}
                  guidance={state.guidance}
                  onTextChange={(text) => updateState({ inputText: text })}
                  onGuidanceChange={(guidance) => updateState({ guidance })}
                  disabled={state.isLoading}
                />
                
                <APIKeyInput
                  apiKey={state.apiKey}
                  provider={state.provider}
                  onApiKeyChange={(apiKey) => updateState({ apiKey })}
                  onProviderChange={(provider) => updateState({ provider })}
                  disabled={state.isLoading}
                />

                <div className="flex justify-between">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={state.isLoading}
                  >
                    Reset All
                  </button>
                  
                  <button
                    onClick={handleTextAnalysis}
                    disabled={!state.inputText.trim() || !state.apiKey.trim() || state.isLoading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                  >
                    Analyze Text
                  </button>
                </div>
              </div>
            )}

            {state.currentStep === 2 && (
              <div className="space-y-6">
                <TemplateUpload
                  onTemplateUpload={handleTemplateUpload}
                  disabled={state.isLoading}
                  templateFile={state.templateFile}
                />

                <div className="flex justify-between">
                  <button
                    onClick={() => handleStepChange(1)}
                    className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    ← Back
                  </button>
                  
                  {state.templateAnalyzed && (
                    <button
                      onClick={() => handleStepChange(3)}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                    >
                      Continue →
                    </button>
                  )}
                </div>
              </div>
            )}

            {state.currentStep === 3 && (
              <div className="space-y-6">
                <GenerationControls
                  options={state.options}
                  onOptionsChange={(options) => updateState({ options: { ...state.options, ...options } })}
                  disabled={state.isLoading}
                />

                <div className="flex justify-between">
                  <button
                    onClick={() => handleStepChange(2)}
                    className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    ← Back
                  </button>
                  
                  <button
                    onClick={handleGeneration}
                    disabled={state.isLoading}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                  >
                    Generate Presentation
                  </button>
                </div>
              </div>
            )}

            {state.currentStep === 4 && (
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Presentation Generated!</h3>
                  <p className="text-gray-600">Your presentation has been created successfully.</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleGeneration}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                  >
                    Download Again
                  </button>
                  
                  <br />
                  
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Create New Presentation
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {state.slides.length > 0 && (
              <SlidePreview 
                slides={state.slides}
                templateAnalyzed={state.templateAnalyzed}
              />
            )}

            {/* Tips Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-800 mb-3">💡 Tips</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Use clear, structured text for better slide organization</li>
                <li>• Include headers and bullet points in your content</li>
                <li>• Choose templates with good contrast and readability</li>
                <li>• Keep your API key secure and never share it</li>
              </ul>
            </div>

            {/* Stats Card */}
            {state.slides.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-800 mb-3">📊 Generation Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Slides:</span>
                    <span className="font-medium">{state.slides.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Template:</span>
                    <span className="font-medium">
                      {state.templateAnalyzed ? '✓ Analyzed' : '⏳ Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium capitalize">{state.provider}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;