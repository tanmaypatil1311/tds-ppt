import React, { useState } from 'react';
import { FileText, Lightbulb } from 'lucide-react';

const TextInput = ({ text, guidance, onTextChange, onGuidanceChange, disabled }) => {
  const [showGuidanceExamples, setShowGuidanceExamples] = useState(false);

  const guidanceExamples = [
    "Turn into an investor pitch deck",
    "Create a technical presentation for developers",
    "Make it suitable for executive summary",
    "Design as a training workshop presentation",
    "Convert to a sales presentation",
    "Format as an academic research presentation"
  ];

  const handleGuidanceExample = (example) => {
    onGuidanceChange(example);
    setShowGuidanceExamples(false);
  };

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = text.length;
  const estimatedSlides = Math.max(1, Math.ceil(wordCount / 150)); // Rough estimate

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-4">
        <FileText className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Your Content</h3>
      </div>

      {/* Main Text Area */}
      <div className="mb-4">
        <label htmlFor="main-text" className="block text-sm font-medium text-gray-700 mb-2">
          Paste your text, markdown, or prose here *
        </label>
        <textarea
          id="main-text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          disabled={disabled}
          placeholder="Paste your content here... This can be a report, article, notes, or any text you want to convert into a presentation. The AI will automatically break it down into slides."
          className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
          maxLength={50000}
        />
        
        {/* Character/Word Count */}
        <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
          <div>
            {wordCount} words • {characterCount.toLocaleString()} characters
          </div>
          <div className="flex items-center">
            <span className="mr-2">≈ {estimatedSlides} slides</span>
            {characterCount > 45000 && (
              <span className="text-orange-600 font-medium">
                ({(50000 - characterCount).toLocaleString()} characters remaining)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Guidance Input */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="guidance" className="block text-sm font-medium text-gray-700">
            Presentation Guidance (optional)
          </label>
          <button
            type="button"
            onClick={() => setShowGuidanceExamples(!showGuidanceExamples)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            disabled={disabled}
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            Examples
          </button>
        </div>
        
        <input
          id="guidance"
          type="text"
          value={guidance}
          onChange={(e) => onGuidanceChange(e.target.value)}
          disabled={disabled}
          placeholder="e.g., turn into an investor pitch deck, make it technical, etc."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
          maxLength={200}
        />

        {/* Guidance Examples */}
        {showGuidanceExamples && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 animate-slide-up">
            <div className="text-sm font-medium text-blue-800 mb-2">Click to use:</div>
            <div className="flex flex-wrap gap-2">
              {guidanceExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleGuidanceExample(example)}
                  disabled={disabled}
                  className="px-3 py-1 text-sm bg-white text-blue-700 border border-blue-300 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sample Content Button */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => {
            const sampleText = `# Project Alpha: Next-Generation AI Platform

## Executive Summary

Project Alpha represents our ambitious initiative to develop a cutting-edge artificial intelligence platform that will revolutionize how businesses interact with data and automate complex processes. This comprehensive solution combines machine learning, natural language processing, and advanced analytics to deliver unprecedented value to our clients.

## Market Opportunity

The global AI market is experiencing explosive growth, with projections indicating a compound annual growth rate of 37.3% through 2030. Current market size stands at $95 billion, with enterprise solutions representing the fastest-growing segment.

Key market drivers include:
- Increasing demand for automation
- Growing data volumes requiring intelligent processing
- Need for personalized customer experiences
- Pressure to reduce operational costs
- Regulatory compliance requirements

## Technical Architecture

Our platform is built on a microservices architecture that ensures scalability, reliability, and maintainability. The core components include:

### Data Processing Engine
- Real-time stream processing capabilities
- Support for structured and unstructured data
- Advanced data cleaning and normalization
- Integration with popular data sources

### Machine Learning Pipeline
- Automated model training and validation
- Support for supervised and unsupervised learning
- Model versioning and deployment automation
- Performance monitoring and alerting

### API Gateway
- RESTful and GraphQL endpoints
- Authentication and authorization
- Rate limiting and throttling
- Comprehensive logging and monitoring

## Implementation Timeline

Phase 1 (Months 1-3): Foundation
- Core infrastructure setup
- Basic data processing capabilities
- Initial ML model development
- API framework implementation

Phase 2 (Months 4-6): Enhancement
- Advanced analytics features
- User interface development
- Integration testing
- Performance optimization

Phase 3 (Months 7-9): Launch Preparation
- Security auditing
- Load testing
- Documentation completion
- Customer pilot programs

## Investment Requirements

Total funding requirement: $2.5M over 9 months

Budget allocation:
- Development team: 60% ($1.5M)
- Infrastructure and tools: 25% ($625K)
- Marketing and sales: 10% ($250K)
- Operations and overhead: 5% ($125K)

## Expected Returns

Conservative projections show break-even by month 15, with positive cash flow thereafter. Year 2 revenue projections of $8M with 40% gross margins demonstrate strong unit economics and market validation.

## Risk Mitigation

Key risks have been identified and mitigation strategies developed:
- Technical risks: Agile development with regular checkpoints
- Market risks: Continuous customer feedback and pivot capability
- Competitive risks: Focus on differentiation and first-mover advantage
- Financial risks: Staged funding approach with milestone-based releases

## Conclusion

Project Alpha represents a significant opportunity to establish market leadership in the AI platform space. With proper execution and adequate funding, this initiative will drive substantial value for stakeholders and position our company as an industry leader.`;
            onTextChange(sampleText);
            onGuidanceChange('Turn into an investor pitch deck');
          }}
          disabled={disabled}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Load Sample Content
        </button>

        <button
          type="button"
          onClick={() => {
            onTextChange('');
            onGuidanceChange('');
          }}
          disabled={disabled || (!text && !guidance)}
          className="text-gray-600 hover:text-gray-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear All
        </button>
      </div>

      {/* Content Tips */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Tips for better results:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Use headers and subheaders to structure your content</li>
          <li>• Include bullet points and numbered lists</li>
          <li>• Longer content (1000+ words) typically produces better presentations</li>
          <li>• Markdown formatting is supported and will be preserved</li>
        </ul>
      </div>
    </div>
  );
};

export default TextInput;