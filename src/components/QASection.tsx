import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Bot, Loader2, HelpCircle } from 'lucide-react';

interface QASectionProps {
  questions: Array<{ question: string; answer: string }>;
  isAsking: boolean;
  documentId: string | null;
  onAskQuestion: (question: string) => void;
}

const QASection: React.FC<QASectionProps> = ({ 
  questions, 
  isAsking, 
  documentId, 
  onAskQuestion 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // suggested questions
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "What is the main topic of this document?",
    "Can you summarize this document?",
    "What are the key points in this document?",
    "Who is the author of this document?",
    "When was this document created?",
    "What are the conclusions in this document?",
    "What evidence is presented in this document?",
    "Are there any tables or figures in this document?",
    "What methodology was used in this document?",
    "What are the limitations mentioned in this document?"
  ]);
  const [showAllSuggestions, setShowAllSuggestions] = useState<boolean>(false);
  

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
 
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [questions]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuestion.trim() && documentId) {
      onAskQuestion(currentQuestion);
      setCurrentQuestion('');
    }
  };
  
  const handleSuggestedQuestionClick = (question: string) => {
    setCurrentQuestion(question);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto mb-4 px-2 py-2" style={{ maxHeight: isSmallScreen ? 'calc(100vh - 240px)' : 'calc(100vh - 280px)' }}>
        {questions.length === 0 ? (
          documentId ? (
            <div className="space-y-4">
              <div className="flex items-center mb-2">
                <HelpCircle className="h-5 w-5 mr-2 text-indigo-600" />
                <h3 className="text-sm font-medium text-gray-700">Suggested Questions</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {(showAllSuggestions ? suggestedQuestions : suggestedQuestions.slice(0, 3)).map((question, index) => (
                  <button 
                    key={index}
                    onClick={() => handleSuggestedQuestionClick(question)}
                    className="text-left px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-md text-sm text-indigo-700 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
              
              {!showAllSuggestions && suggestedQuestions.length > 3 && (
                <button 
                  onClick={() => setShowAllSuggestions(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Show more suggestions
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageSquare className="h-12 w-12 mb-4" />
              <p className="text-center">Upload a PDF and start asking questions!</p>
            </div>
          )
        ) : (
          <div className="space-y-6">
            {questions.map((qa, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2">
                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="ml-3 bg-indigo-50 rounded-lg px-4 py-3 text-sm">
                    <p className="font-medium text-indigo-900">{qa.question}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                    <Bot className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-3 bg-gray-50 rounded-lg px-4 py-3 text-sm">
                    <p className="text-gray-800">{qa.answer}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-auto sticky bottom-0 bg-white pt-2">
        <div className="flex items-center">
          <input
            type="text"
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            placeholder={documentId ? "Ask a question about the PDF..." : "Upload a PDF first"}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={!documentId || isAsking}
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            disabled={!documentId || !currentQuestion.trim() || isAsking}
          >
            {isAsking ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <span className="flex items-center">
                Send
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QASection;