
import React, { useState, useEffect, useCallback } from 'react';
import { AnalysisResult, VaultItem, FileData } from './types';
import { analyzeMedicalReport } from './services/geminiService';
import { SAMPLE_REPORT_TEXT, APP_DISCLAIMER } from './constants';
import FileUploader from './components/FileUploader';
import ReportDisplay from './components/ReportDisplay';
import VaultList from './components/VaultList';
import Header from './components/Header';
import Disclaimer from './components/Disclaimer';

const App: React.FC = () => {
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redactEnabled, setRedactEnabled] = useState(true);
  const [view, setView] = useState<'upload' | 'result' | 'vault'>('upload');

  useEffect(() => {
    const saved = localStorage.getItem('docassist_vault');
    if (saved) {
      try {
        setVault(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load vault", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('docassist_vault', JSON.stringify(vault));
  }, [vault]);

  const handleFileUpload = async (fileData: FileData) => {
    setLoading(true);
    setError(null);
    setCurrentAnalysis(null);

    try {
      const result = await analyzeMedicalReport(fileData, redactEnabled);
      setCurrentAnalysis(result);
      const newItem: VaultItem = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        fileName: fileData.name,
        analysis: result
      };
      setVault(prev => [newItem, ...prev]);
      setView('result');
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sampleBlob = new Blob([SAMPLE_REPORT_TEXT], { type: 'text/plain' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const fileData: FileData = {
          base64,
          mimeType: 'text/plain',
          name: 'Sample_Lab_Report.txt'
        };
        const result = await analyzeMedicalReport(fileData, false);
        setCurrentAnalysis(result);
        const newItem: VaultItem = {
          id: 'sample-' + Date.now(),
          timestamp: Date.now(),
          fileName: 'Sample_Lab_Report.txt',
          analysis: result,
          isSample: true
        };
        setVault(prev => [newItem, ...prev]);
        setView('result');
        setLoading(false);
      };
      reader.readAsDataURL(sampleBlob);
    } catch (err: any) {
      setError("Failed to load sample report.");
      setLoading(false);
    }
  }, []);

  const selectVaultItem = (item: VaultItem) => {
    setCurrentAnalysis(item.analysis);
    setView('result');
  };

  const deleteVaultItem = (id: string) => {
    setVault(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <Header setView={setView} currentView={view} />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-10 max-w-5xl">
        <Disclaimer message={APP_DISCLAIMER} />

        {error && (
          <div className="mb-6 p-4 bg-[#fce8e6] border border-[#f5c6cb] text-[#d93025] rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {view === 'upload' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-[#dadce0] overflow-hidden card">
              <div className="px-6 py-10 md:px-10 text-center">
                <h2 className="text-2xl md:text-3xl font-medium text-[#202124] mb-3">Upload Document</h2>
                <p className="text-[#5f6368] text-sm md:text-base">Let AI explain your medical findings or documents in seconds.</p>
              </div>
              <div className="px-6 md:px-10 pb-10">
                <FileUploader onUpload={handleFileUpload} isLoading={loading} />
                
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-[#f8f9fa] rounded-lg border border-[#dadce0]">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={redactEnabled}
                        onChange={(e) => setRedactEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a73e8]"></div>
                      <span className="ms-3 text-sm font-medium text-[#3c4043]">Redact Privacy Info</span>
                    </label>
                  </div>
                  <button 
                    onClick={loadSample}
                    disabled={loading}
                    className="text-[#1a73e8] hover:bg-[#e8f0fe] px-4 py-2 rounded-md font-medium text-sm transition-colors border border-transparent"
                  >
                    Try Sample Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'result' && currentAnalysis && (
          <ReportDisplay 
            analysis={currentAnalysis} 
            onBack={() => setView('upload')} 
          />
        )}

        {view === 'vault' && (
          <VaultList 
            items={vault} 
            onSelect={selectVaultItem} 
            onDelete={deleteVaultItem}
            onBack={() => setView('upload')}
          />
        )}

        {loading && (
          <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="inline-block relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1a73e8]/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-[#1a73e8] rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-medium text-[#202124] mt-6">DocAssist is thinking...</h3>
              <p className="text-[#5f6368] mt-2 text-sm">Organizing data and analyzing with Gemini</p>
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-[#dadce0] text-center text-[#5f6368] text-xs bg-white">
        &copy; {new Date().getFullYear()} DocAssist • Built with Gemini Pro • Privacy First
      </footer>
    </div>
  );
};

export default App;
