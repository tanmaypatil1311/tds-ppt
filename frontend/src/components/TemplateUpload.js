import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileType, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const TemplateUpload = ({ onTemplateUpload, disabled, templateFile }) => {
  const [uploadStatus, setUploadStatus] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      setUploadStatus({
        type: 'error',
        message: `File rejected: ${rejection.errors[0]?.message || 'Invalid file type'}`
      });
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadStatus({
        type: 'uploading',
        message: 'Processing template...'
      });
      
      onTemplateUpload(file);
    }
  }, [onTemplateUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.openxmlformats-officedocument.presentationml.template': ['.potx']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled
  });

  const getDropzoneStyles = () => {
    if (disabled) return 'border-gray-200 bg-gray-50 cursor-not-allowed';
    if (isDragReject) return 'border-red-300 bg-red-50';
    if (isDragActive) return 'border-blue-500 bg-blue-50';
    if (templateFile) return 'border-green-300 bg-green-50';
    return 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50';
  };

  const getStatusIcon = () => {
    if (uploadStatus?.type === 'uploading') return <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />;
    if (uploadStatus?.type === 'error') return <XCircle className="w-6 h-6 text-red-600" />;
    if (templateFile) return <CheckCircle className="w-6 h-6 text-green-600" />;
    return <Upload className="w-8 h-8 text-gray-400" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-4">
        <FileType className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">PowerPoint Template</h3>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${getDropzoneStyles()}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          
          <div>
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop your template here...</p>
            ) : templateFile ? (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">Template uploaded successfully!</p>
                <p className="text-sm text-gray-600">{templateFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(templateFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-600 font-medium">
                  Drag & drop your PowerPoint template here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports .pptx and .potx files (max 50MB)
                </p>
              </div>
            )}
          </div>

          {uploadStatus && (
            <div className={`text-sm px-3 py-2 rounded-full ${
              uploadStatus.type === 'error' ? 'bg-red-100 text-red-700' :
              uploadStatus.type === 'uploading' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {uploadStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Template Requirements */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          Template Requirements
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h5 className="font-medium text-gray-700 mb-1">✓ Recommended:</h5>
            <ul className="space-y-1">
              <li>• Multiple slide layouts</li>
              <li>• Consistent color scheme</li>
              <li>• Professional fonts</li>
              <li>• Sample images to reuse</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-1">✓ Will extract:</h5>
            <ul className="space-y-1">
              <li>• Colors and theme</li>
              <li>• Fonts and typography</li>
              <li>• Layout structures</li>
              <li>• Background images</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sample Templates */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Need a template? Try these sources:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: 'Microsoft Templates', url: 'https://templates.office.com/en-us/presentations', description: 'Free official templates' },
            { name: 'SlidesCarnival', url: 'https://www.slidescarnival.com/', description: 'Creative free templates' },
            { name: 'SlideBazaar', url: 'https://slidebazaar.com/', description: 'Professional templates' }
          ].map((source, index) => (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left block"
            >
              <div className="font-medium text-sm text-gray-800">{source.name}</div>
              <div className="text-xs text-gray-600 mt-1">{source.description}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Upload Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Upload Tips</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Templates with multiple layouts work best</li>
          <li>• Include example slides for better style extraction</li>
          <li>• Images in the template will be reused in generated slides</li>
          <li>• Corporate templates typically produce the most professional results</li>
        </ul>
      </div>
    </div>
  );
};

export default TemplateUpload;