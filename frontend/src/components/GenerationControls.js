import React from 'react';
import { Settings, Image, MessageSquare, Palette } from 'lucide-react';

const GenerationControls = ({ options, onOptionsChange, disabled }) => {
  const handleToggle = (key) => {
    onOptionsChange({ [key]: !options[key] });
  };

  const handleSelectChange = (key, value) => {
    onOptionsChange({ [key]: value });
  };

  const toneOptions = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-appropriate' },
    { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
    { value: 'technical', label: 'Technical', description: 'Detailed and precise' },
    { value: 'creative', label: 'Creative', description: 'Engaging and dynamic' },
    { value: 'academic', label: 'Academic', description: 'Scholarly and research-focused' },
    { value: 'sales', label: 'Sales', description: 'Persuasive and compelling' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-4">
        <Settings className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Generation Options</h3>
      </div>

      <div className="space-y-6">
        {/* Presentation Tone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Palette className="w-4 h-4 inline mr-1" />
            Presentation Tone
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {toneOptions.map((tone) => (
              <button
                key={tone.value}
                onClick={() => handleSelectChange('presentationTone', tone.value)}
                disabled={disabled}
                className={`p-3 text-left border-2 rounded-lg transition-all duration-200 ${
                  options.presentationTone === tone.value
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="font-medium text-sm">{tone.label}</div>
                <div className="text-xs mt-1 opacity-75">{tone.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-4">
          {/* Include Images */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Image className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <div className="font-medium text-gray-800">Include Template Images</div>
                <div className="text-sm text-gray-600">Reuse images from your template in generated slides</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeImages}
                onChange={() => handleToggle('includeImages')}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
            </label>
          </div>

          {/* Generate Speaker Notes */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <div className="font-medium text-gray-800">Generate Speaker Notes</div>
                <div className="text-sm text-gray-600">AI-generated notes for each slide (uses additional API calls)</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={options.generateNotes}
                onChange={() => handleToggle('generateNotes')}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
            </label>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-800 mb-3">Advanced Options</h4>
          
          <div className="space-y-3">
            {/* Slide Count Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Slide Count
              </label>
              <select
                value={options.preferredSlideCount || 'auto'}
                onChange={(e) => handleSelectChange('preferredSlideCount', e.target.value)}
                disabled={disabled}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="auto">Auto (AI decides)</option>
                <option value="concise">Concise (5-8 slides)</option>
                <option value="standard">Standard (8-12 slides)</option>
                <option value="detailed">Detailed (12-20 slides)</option>
              </select>
            </div>

            {/* Content Density */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Density
              </label>
              <select
                value={options.contentDensity || 'balanced'}
                onChange={(e) => handleSelectChange('contentDensity', e.target.value)}
                disabled={disabled}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="minimal">Minimal (3-4 points per slide)</option>
                <option value="balanced">Balanced (5-6 points per slide)</option>
                <option value="detailed">Detailed (7-8 points per slide)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cost Estimation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Estimated Generation Cost</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div className="flex justify-between">
              <span>Text analysis:</span>
              <span>~$0.01 - $0.05</span>
            </div>
            {options.generateNotes && (
              <div className="flex justify-between">
                <span>Speaker notes:</span>
                <span>~$0.02 - $0.08</span>
              </div>
            )}
            <div className="border-t border-blue-300 pt-1 mt-2 flex justify-between font-medium">
              <span>Total estimated:</span>
              <span>
                {options.generateNotes ? '~$0.03 - $0.13' : '~$0.01 - $0.05'}
              </span>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Actual costs depend on your LLM provider and content complexity.
          </p>
        </div>

        {/* Preview Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Generation Summary</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>• Tone: <span className="font-medium">{toneOptions.find(t => t.value === options.presentationTone)?.label}</span></div>
            <div>• Images: <span className="font-medium">{options.includeImages ? 'Included' : 'Not included'}</span></div>
            <div>• Speaker Notes: <span className="font-medium">{options.generateNotes ? 'Yes' : 'No'}</span></div>
            <div>• Slide Count: <span className="font-medium">{options.preferredSlideCount || 'Auto'}</span></div>
            <div>• Content Density: <span className="font-medium">{options.contentDensity || 'Balanced'}</span></div>
          </div>
        </div>

        {/* Ready Indicator */}
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Ready to generate presentation
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationControls;