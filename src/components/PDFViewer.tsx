import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Loader2, X, AlertCircle } from 'lucide-react';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File | null;
  onClear: () => void;
  onUploadSuccess: (response: any) => void;
}

interface UploadResponse {
  id: number;
  filename: string;
  title: string;
  upload_date: string;
  chunks_count: number; 
  page_count: number;
  document_id: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, onClear, onUploadSuccess }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<UploadResponse | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes

  useEffect(() => {
    const checkScreenSize = () => {
      const small = window.innerWidth < 768;
      setIsSmallScreen(small);
      // Adjust scale based on screen size
      setScale(small ? 0.8 : 1.0);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (file) {
      validateAndProcessFile();
    } else {
      setNumPages(null);
      setPageNumber(1);
      setError(null);
      setUploadSuccess(null);
    }
  }, [file]);

  const validateAndProcessFile = () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    
    // Check if file is PDF
    if (!file.type.includes('pdf')) {
      setError('Please upload a valid PDF file.');
      setIsLoading(false);
      return;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`);
      setIsLoading(false);
      return;
    }
    
    uploadFile();
  };

  const uploadFile = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
      
      const data: UploadResponse = await response.json();
      setUploadSuccess(data);
      onUploadSuccess(data); 
      console.log('File uploaded successfully:', data);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages || 1));
  };

  if (error) {
    return (
      <div className="flex flex-col h-full border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Error</h3>
          </div>
          <button 
            onClick={onClear}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-grow flex items-center justify-center p-4 bg-gray-50">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={onClear}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try another file
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="flex flex-col h-full border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-200">
          <h3 className="font-medium text-blue-700">Uploading Document</h3>
          <button 
            onClick={onClear}
            className="text-gray-400 hover:text-gray-500"
            disabled={isUploading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-grow flex items-center justify-center p-4 bg-gray-50">
          <div className="text-center">
            <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Uploading and processing your document...</p>
            <p className="text-gray-500 text-sm mt-2">This may take a moment depending on file size</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
        <div className="truncate">
          <h3 className="font-medium text-gray-700 truncate">
            {file?.name || 'Document Viewer'}
          </h3>
          {uploadSuccess && (
            <p className="text-xs text-green-600 truncate">
              Document ID: {uploadSuccess.document_id}
            </p>
          )}
        </div>
        <button 
          onClick={onClear}
          className="flex-shrink-0 text-gray-400 hover:text-gray-500 ml-2"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-grow overflow-auto flex justify-center bg-gray-100 p-2 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        )}
        {file && (
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(error) => {
              console.error('Error loading PDF:', error);
              setError('Failed to load PDF. The file might be corrupted or password protected.');
            }}
            loading={<div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>}
            className="max-w-full"
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={true}
              renderAnnotationLayer={true}
              scale={scale}
              className="shadow-lg"
              width={isSmallScreen ? window.innerWidth - 40 : undefined}
            />
          </Document>
        )}
      </div>
      
      {numPages !== null && (
        <div className="flex items-center justify-between bg-white p-2 border-t">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className={`inline-flex items-center px-2 py-1 border border-gray-300 text-sm font-medium rounded-md ${
              pageNumber <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          
          <p className="text-sm text-gray-700">
            {pageNumber} / {numPages}
          </p>
          
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className={`inline-flex items-center px-2 py-1 border border-gray-300 text-sm font-medium rounded-md ${
              pageNumber >= (numPages || 1)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;