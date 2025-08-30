import React, { useState } from 'react';
import { Key, Eye, EyeOff, ExternalLink, AlertCircle } from 'lucide-react';

const APIKeyInput = ({ apiKey, provider, onApiKeyChange, onProviderChange, disabled }) => {
  const [showKey, setShowKey] = useState(false);

  const providers = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT models (GPT-3.5, GPT-4)',
      getKeyUrl: 'https://platform.openai.com/api-keys',
      example: 'sk-...',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude models',
      getKeyUrl: 'https://console.anthropic.com/',
      example: 'sk-ant-...',
      color: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Gemini Pro models',
      getKeyUrl: 'https://makersuite.google.com/app/apikey',
      example: 'AIza...',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    }
  ];

  const selectedProvider = providers.find(p => p.id === provider);

  const validateApiKey = (key, providerId) => {
    if (!key) return { valid: false, message: 'API key is required' };
    
    const validations = {
      openai: /^sk-[a-zA-Z0-9]{32,}$/,
      anthropic: /^sk-ant-[a-zA-Z0-9\-_]{32,}$/,
      gemini: /^AIza[a-zA-Z0-9\-_]{35}$/
    };

    const pattern = validations[providerId];
    if (pattern && !pattern.test(key)) {
      return { 
        valid: false, 
        message: `Invalid ${providers.find(p => p.id === providerId)?.name} API key format` 
      };
    }

    return { valid: true, message: '' };
  };

  const keyValidation = validateApiKey(apiKey, provider);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-4">
        <Key className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">API Configuration</h3>
      </div>

      {/* Provider Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose your LLM provider *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => onProviderChange(p.id)}
              disabled={disabled}
              className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                provider === p.id
                  ? `${p.color} border-current`
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-sm mt-1 opacity-75">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* API Key Input */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
            {selectedProvider?.name} API Key *
          </label>
          <a
            href={selectedProvider?.getKeyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            Get API Key
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>

        <div className="relative">
          <input
            id="api-key"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            disabled={disabled}
            placeholder={`Enter your ${selectedProvider?.name} API key (${selectedProvider?.example})`}
            className={`w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed ${
              apiKey && !keyValidation.valid
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Validation Message */}
        {apiKey && !keyValidation.valid && (
          <div className="mt-2 flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            {keyValidation.message}
          </div>
        )}

        {/* Valid Key Indicator */}
        {apiKey && keyValidation.valid && (
          <div className="mt-2 flex items-center text-green-600 text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            API key format is valid
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 mb-1">Security Notice</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• Your API key is processed securely and never stored on our servers</p>
              <p>• Keys are only used for your current session and discarded afterward</p>
              <p>• Make sure you trust this application before entering sensitive credentials</p>
              <p>• You can revoke or regenerate your API key at any time from the provider's dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Pricing Info */}
      {selectedProvider && (
        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium mb-1">Estimated costs for typical presentation generation:</p>
          <ul className="space-y-1 ml-4">
            {provider === 'openai' && (
              <>
                <li>• Text analysis: ~$0.01-0.05 per presentation</li>
                <li>• Speaker notes: ~$0.02-0.08 per presentation</li>
              </>
            )}
            {provider === 'anthropic' && (
              <>
                <li>• Text analysis: ~$0.03-0.15 per presentation</li>
                <li>• Speaker notes: ~$0.05-0.20 per presentation</li>
              </>
            )}
            {provider === 'gemini' && (
              <>
                <li>• Text analysis: ~$0.005-0.02 per presentation</li>
                <li>• Speaker notes: ~$0.01-0.04 per presentation</li>
              </>
            )}
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            Actual costs may vary based on content length and complexity. Check your provider's pricing for exact rates.
          </p>
        </div>
      )}
    </div>
  );
};

export default APIKeyInput;