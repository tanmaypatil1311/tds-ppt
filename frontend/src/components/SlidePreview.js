import React, { useState } from 'react';
import { Eye, ChevronLeft, ChevronRight, FileText, MessageSquare } from 'lucide-react';

const SlidePreview = ({ slides, templateAnalyzed }) => {
  const [selectedSlide, setSelectedSlide] = useState(0);

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[selectedSlide];

  const getSlideTypeColor = (type) => {
    switch (type) {
      case 'title': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'section': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'conclusion': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const navigateSlide = (direction) => {
    if (direction === 'next' && selectedSlide < slides.length - 1) {
      setSelectedSlide(selectedSlide + 1);
    } else if (direction === 'prev' && selectedSlide > 0) {
      setSelectedSlide(selectedSlide - 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Eye className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Slide Preview</h3>
        </div>
        
        {templateAnalyzed && (
          <div className="flex items-center text-green-600 text-sm">
            <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
            Template Ready
          </div>
        )}
      </div>

      {/* Slide Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateSlide('prev')}
          disabled={selectedSlide === 0}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="text-sm text-gray-600">
          Slide {selectedSlide + 1} of {slides.length}
        </div>
        
        <button
          onClick={() => navigateSlide('next')}
          disabled={selectedSlide === slides.length - 1}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Current Slide Preview */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-64">
        {/* Slide Type Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSlideTypeColor(currentSlide.slide_type)}`}>
            {currentSlide.slide_type.charAt(0).toUpperCase() + currentSlide.slide_type.slice(1)}
          </span>
          
          {currentSlide.notes && (
            <div className="flex items-center text-blue-600 text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              Has Notes
            </div>
          )}
        </div>

        {/* Slide Title */}
        <h4 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
          {currentSlide.title}
        </h4>

        {/* Slide Content */}
        {currentSlide.content && currentSlide.content.length > 0 ? (
          <div className="space-y-2">
            {currentSlide.content.map((item, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-gray-700 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">No content bullets for this slide</p>
        )}

        {/* Speaker Notes Preview */}
        {currentSlide.notes && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center mb-2">
              <MessageSquare className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-sm font-medium text-blue-800">Speaker Notes</span>
            </div>
            <p className="text-sm text-blue-700">{currentSlide.notes}</p>
          </div>
        )}
      </div>

      {/* Slide List */}
      <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
        <h4 className="text-sm font-medium text-gray-700 mb-2">All Slides:</h4>
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => setSelectedSlide(index)}
            className={`w-full text-left p-2 rounded-lg transition-colors text-sm ${
              selectedSlide === index
                ? 'bg-blue-100 border border-blue-300'
                : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium truncate">
                {index + 1}. {slide.title}
              </span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${getSlideTypeColor(slide.slide_type)}`}>
                {slide.slide_type}
              </span>
            </div>
            {slide.content && slide.content.length > 0 && (
              <p className="text-gray-600 text-xs mt-1 truncate">
                {slide.content.length} point{slide.content.length !== 1 ? 's' : ''}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-lg text-blue-600">{slides.length}</div>
            <div className="text-gray-600">Total Slides</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-green-600">
              {slides.filter(s => s.notes).length}
            </div>
            <div className="text-gray-600">With Notes</div>
          </div>
        </div>
      </div>

      {/* Style Status */}
      <div className="mt-4">
        <div className={`p-3 rounded-lg text-sm ${
          templateAnalyzed 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
        }`}>
          {templateAnalyzed 
            ? '✅ Template styling will be applied to these slides'
            : '⏳ Upload a template to apply custom styling'
          }
        </div>
      </div>
    </div>
  );
};

export default SlidePreview;