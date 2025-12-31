
import React from 'react';

interface HeaderProps {
  setView: (view: 'upload' | 'result' | 'vault') => void;
  currentView: string;
}

const Header: React.FC<HeaderProps> = ({ setView, currentView }) => {
  return (
    <header className="bg-white border-b border-[#dadce0] sticky top-0 z-40 px-4 md:px-8">
      <div className="container mx-auto h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
          onClick={() => setView('upload')}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
            <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.89 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#4285F4"/>
              <path d="M14 2V8H20L14 2Z" fill="#FBBC05"/>
              <path d="M16 12H8V14H16V12Z" fill="#EA4335"/>
              <path d="M16 16H8V18H16V16Z" fill="#34A853"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-medium text-[#3c4043] tracking-tight group-hover:text-[#1a73e8] transition-colors">DocAssist</h1>
          </div>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={() => setView('upload')}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${currentView === 'upload' ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'text-[#5f6368] hover:bg-[#f1f3f4]'}`}
          >
            Explain Doc
          </button>
          <button 
            onClick={() => setView('vault')}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${currentView === 'vault' ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'text-[#5f6368] hover:bg-[#f1f3f4]'}`}
          >
            Vault
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
