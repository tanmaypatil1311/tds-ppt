import React from 'react';
import { Heart, Coffee } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>and</span>
            <Coffee className="w-4 h-4 text-amber-600" />
            <span>by the open source community</span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <a href="#privacy" className="hover:text-gray-700 transition-colors">
              Privacy
            </a>
            <a href="#terms" className="hover:text-gray-700 transition-colors">
              Terms
            </a>
            <a href="#support" className="hover:text-gray-700 transition-colors">
              Support
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>© 2024 Auto-Presentation Generator. Released under MIT License.</p>
          <p className="mt-1">
            Your API keys are never stored. All processing happens securely in your browser session.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;