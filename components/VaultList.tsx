
import React from 'react';
import { VaultItem } from '../types';

interface VaultListProps {
  items: VaultItem[];
  onSelect: (item: VaultItem) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const VaultList: React.FC<VaultListProps> = ({ items, onSelect, onDelete, onBack }) => {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors text-[#5f6368]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h2 className="text-2xl font-medium text-[#202124]">Local Vault</h2>
        </div>
        <p className="text-xs text-[#70757a] font-medium bg-white px-4 py-1.5 rounded-full border border-[#dadce0]">Privately stored on this device</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white p-20 rounded-xl border border-[#dadce0] text-center card">
          <div className="w-20 h-20 bg-[#f8f9fa] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C4.89 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#4285F4" fillOpacity="0.3"/>
              <path d="M14 2V8H20L14 2Z" fill="#FBBC05" fillOpacity="0.3"/>
              <path d="M16 12H8V14H16V12Z" fill="#EA4335" fillOpacity="0.3"/>
              <path d="M16 16H8V18H16V16Z" fill="#34A853" fillOpacity="0.3"/>
            </svg>
          </div>
          <p className="text-[#5f6368] text-xl font-medium">Your vault is empty</p>
          <p className="text-[#70757a] text-sm mt-2 mb-8">Upload a document to see its AI explanation here.</p>
          <button onClick={onBack} className="btn-primary px-8 py-2.5 rounded-md font-medium text-sm">Explain First Doc</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-[#dadce0] rounded-xl hover:shadow-md transition-all flex flex-col group overflow-hidden card">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div className="cursor-pointer flex-grow" onClick={() => onSelect(item)}>
                    <h3 className="font-medium text-[#202124] text-lg truncate pr-4">{item.fileName}</h3>
                    <p className="text-[10px] text-[#70757a] uppercase font-bold mt-1 tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 text-[#dadce0] hover:text-[#d93025] transition-colors rounded-full hover:bg-red-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <div className="cursor-pointer space-y-4" onClick={() => onSelect(item)}>
                  <p className="text-sm text-[#5f6368] line-clamp-2 italic border-l-2 border-[#1a73e8]/20 pl-3 leading-relaxed">"{item.analysis.summary}"</p>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.analysis.docType === 'report' ? 'bg-[#e8f0fe] text-[#1a73e8]' : 
                      item.analysis.docType === 'prescription' ? 'bg-[#e6f4ea] text-[#1e8e3e]' : 'bg-[#f1f3f4] text-[#5f6368]'
                    }`}>{item.analysis.docType}</span>
                    {item.isSample && <span className="px-2.5 py-1 bg-[#fff7e0] text-[#ea8600] rounded text-[10px] font-bold uppercase">Sample</span>}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onSelect(item)}
                className="w-full py-4 bg-[#f8f9fa] border-t border-[#dadce0] text-sm font-medium text-[#3c4043] hover:bg-white hover:text-[#1a73e8] transition-all"
              >
                Open Analysis
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VaultList;
