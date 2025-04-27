import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import PDFViewer from './components/PDFViewer';
import QASection from './components/QASection';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Array<{ question: string; answer: string }>>([]);
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'pdf' | 'chat' | 'split'>('split');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);


  useEffect(() => {
    const calculateHeight = () => {
      const headerFooterHeight = 120;
      const viewHeight = window.innerHeight;
      setContentHeight(viewHeight - headerFooterHeight);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode(file ? 'pdf' : 'split');
      } else {
        setViewMode('split');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      setQuestions([]);
    }
  };

  const handleFileUploadSuccess = (uploadResponse: any) => {
    console.log('Upload success:', uploadResponse);
    if (uploadResponse && uploadResponse.document_id) {
      setDocumentId(uploadResponse.document_id);
    }
  };

  const clearFile = () => {
    setFile(null);
    setDocumentId(null);
    setQuestions([]);
  };

  const handleAskQuestion = async (question: string) => {
    if (!question.trim() || !documentId) return;
    
    setIsAsking(true);
    
    try {
      const newQuestions = [
        ...questions,
        {
          question: question,
          answer: "Loading answer..."
        }
      ];
      setQuestions(newQuestions);
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/qa/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: documentId,
          question: question,
          top_k: 2
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get answer');
      }
      
      const data = await response.json();
      
      setQuestions(questions => {
        const updatedQuestions = [...questions];
        updatedQuestions[updatedQuestions.length - 1].answer = data.answer;
        return updatedQuestions;
      });
      
    } catch (error) {
      console.error('Error asking question:', error);
      
      setQuestions(questions => {
        const updatedQuestions = [...questions];
        updatedQuestions[updatedQuestions.length - 1].answer = 
          "Sorry, I couldn't process your question. Please try again.";
        return updatedQuestions;
      });
    } finally {
      setIsAsking(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const toggleViewMode = () => {
    if (viewMode === 'pdf') {
      setViewMode('chat');
    } else {
      setViewMode('pdf');
    }
  };

  return (
    <div className="min-h-screen h-screen max-h-screen bg-gray-100 flex flex-col overflow-hidden">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/image.png" alt="Logo" className="h-10 w-auto" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900">planet</h1>
              <div className="flex gap-1 text-xs sm:text-sm">
                <span className="text-gray-900">formerly</span>
                <span className="font-bold text-green-700">DPhi</span>
              </div>
            </div>
          </div>
          
          <div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <button
              onClick={triggerFileInput}
              className="inline-flex items-center px-3 py-1.5 text-sm border border-transparent font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="-ml-1 mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Upload PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>
        
      <main className="flex-grow flex flex-col overflow-hidden" style={{ maxHeight: `${contentHeight}px` }}>
        {file && window.innerWidth < 768 && (
          <div className="flex bg-white p-2 shadow-sm border-b">
            <button
              onClick={() => setViewMode('pdf')}
              className={`flex-1 text-center py-2 text-sm font-medium ${
                viewMode === 'pdf' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
              }`}
            >
              PDF View
            </button>
            <button
              onClick={() => setViewMode('chat')}
              className={`flex-1 text-center py-2 text-sm font-medium ${
                viewMode === 'chat' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
              } relative`}
            >
              Chat
              {questions.length > 0 && (
                <span className="absolute top-1 right-6 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full">
                  {questions.length}
                </span>
              )}
            </button>
          </div>
        )}
        
        <div className={`flex-grow flex overflow-hidden ${window.innerWidth >= 768 ? 'flex-row' : 'flex-col'}`}>
          {(viewMode === 'pdf' || viewMode === 'split') && (
            <div className="w-full md:w-1/2 p-2 md:p-4 overflow-hidden" style={{ height: window.innerWidth < 768 ? `${contentHeight - 50}px` : '100%' }}>
              <div className="bg-white shadow rounded-lg h-full flex flex-col overflow-hidden">
                <h2 className="text-lg font-medium text-gray-900 p-4 pb-2">PDF Viewer</h2>
                
                <div className="flex-grow bg-gray-50 rounded-lg overflow-hidden">
                  {file ? (
                    <PDFViewer 
                      file={file} 
                      onClear={clearFile}
                      onUploadSuccess={handleFileUploadSuccess}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
                      <FileText className="h-12 w-12 mb-4" />
                      <p className="text-center">Upload a PDF to view it here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {(viewMode === 'chat' || viewMode === 'split') && (
            <div className="w-full md:w-1/2 p-2 md:p-4 overflow-hidden" style={{ height: window.innerWidth < 768 ? `${contentHeight - 50}px` : '100%' }}>
              <div className="bg-white shadow rounded-lg h-full flex flex-col overflow-hidden">
                <h2 className="text-lg font-medium text-gray-900 p-4 pb-2">Ask Questions</h2>
                
                <div className="flex-grow flex flex-col overflow-hidden">
                  <QASection 
                    questions={questions} 
                    isAsking={isAsking}
                    documentId={documentId}
                    onAskQuestion={handleAskQuestion}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Fullstack Internship Assignment - PDF Q&A Application
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;