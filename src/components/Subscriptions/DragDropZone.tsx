import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileImage, FileText, Camera, Sparkles, X, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useImageAnalysis } from '../../hooks/useImageAnalysis';

interface DragDropZoneProps {
  onDataExtracted: (data: any) => void;
  isVisible: boolean;
  onClose: () => void;
}

const DragDropZone: React.FC<DragDropZoneProps> = ({ onDataExtracted, isVisible, onClose }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { analyzeImage, loading, error } = useImageAnalysis();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const processFile = async (file: File) => {
    // Validate file type
    const validTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain'
    ];

    if (!validTypes.includes(file.type)) {
      alert('Please upload an image file (JPG, PNG, GIF, WebP) or document (PDF, TXT)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    
    // Create preview for image files
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    // Analyze the file
    const data = await analyzeImage(file);
    if (data) {
      setExtractedData(data);
    }
  };

  const handleUseData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      resetState();
      onClose();
    }
  };

  const handleReset = () => {
    resetState();
  };

  const resetState = () => {
    setUploadedFile(null);
    setExtractedData(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clean up preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Subscription Import</h2>
              <p className="text-sm text-gray-600">Drop images or documents to auto-fill subscription details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!uploadedFile ? (
            /* Upload Zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                isDragOver
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50/50'
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center">
                  <Upload className="w-8 h-8 text-purple-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Drop your subscription files here
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Upload screenshots, invoices, or documents containing subscription information
                  </p>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <FileImage className="w-4 h-4" />
                    <span>Images</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Documents</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Camera className="w-4 h-4" />
                    <span>Screenshots</span>
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Choose Files
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.txt"
                  className="hidden"
                />

                <p className="text-xs text-gray-400">
                  Supports JPG, PNG, GIF, WebP, PDF, TXT • Max 10MB
                </p>
              </div>
            </div>
          ) : (
            /* Analysis Results */
            <div className="space-y-6">
              {/* File Info with Preview */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-start space-x-4">
                  {previewUrl ? (
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{uploadedFile.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type}
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleReset}
                        className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Change</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                    <div>
                      <h4 className="font-medium text-blue-900">Analyzing your file...</h4>
                      <p className="text-sm text-blue-700">
                        Extracting subscription information
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">Analysis Failed</h4>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted Data */}
              {extractedData && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">Information Extracted</h4>
                      <p className="text-sm text-green-700">
                        Review the extracted data below and make any necessary adjustments
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extractedData.name && (
                      <div className="bg-white rounded-lg p-3">
                        <label className="text-xs font-medium text-gray-600">Service Name</label>
                        <p className="font-medium text-gray-900">{extractedData.name}</p>
                      </div>
                    )}
                    
                    {extractedData.cost && (
                      <div className="bg-white rounded-lg p-3">
                        <label className="text-xs font-medium text-gray-600">Cost</label>
                        <p className="font-medium text-gray-900">
                          {extractedData.currency === 'USD' ? '$' : 
                           extractedData.currency === 'EUR' ? '€' : 
                           extractedData.currency === 'GBP' ? '£' : 
                           extractedData.currency || '$'}{extractedData.cost}
                        </p>
                      </div>
                    )}
                    
                    {extractedData.billingCycle && (
                      <div className="bg-white rounded-lg p-3">
                        <label className="text-xs font-medium text-gray-600">Billing Cycle</label>
                        <p className="font-medium text-gray-900 capitalize">
                          {extractedData.billingCycle}
                        </p>
                      </div>
                    )}
                    
                    {extractedData.nextBilling && (
                      <div className="bg-white rounded-lg p-3">
                        <label className="text-xs font-medium text-gray-600">Next Billing</label>
                        <p className="font-medium text-gray-900">
                          {new Date(extractedData.nextBilling).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    {extractedData.category && (
                      <div className="bg-white rounded-lg p-3">
                        <label className="text-xs font-medium text-gray-600">Category</label>
                        <p className="font-medium text-gray-900">{extractedData.category}</p>
                      </div>
                    )}
                    
                    {extractedData.description && (
                      <div className="bg-white rounded-lg p-3 md:col-span-2">
                        <label className="text-xs font-medium text-gray-600">Description</label>
                        <p className="font-medium text-gray-900">{extractedData.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Try Another File
                </button>
                
                {extractedData && (
                  <button
                    onClick={handleUseData}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Use This Data
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DragDropZone;