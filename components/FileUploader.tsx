
import React, { useRef, useState } from 'react';
import { FileData } from '../types';

interface FileUploaderProps {
  onUpload: (fileData: FileData) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const processFile = (file: File) => {
    if (!file) return;
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF, JPG, PNG or Text file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      onUpload({ base64, mimeType: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-xl p-8 md:p-14 transition-all duration-200 text-center flex flex-col items-center cursor-pointer ${
        dragActive ? 'border-[#1a73e8] bg-[#e8f0fe]' : 'border-[#dadce0] hover:bg-[#f8f9fa] hover:border-[#1a73e8]'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input type="file" ref={fileInputRef} onChange={handleChange} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.txt" />
      <div className="w-16 h-16 bg-[#e8f0fe] rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C4.89 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#4285F4"/>
          <path d="M14 2V8H20L14 2Z" fill="#FBBC05"/>
          <path d="M16 12H8V14H16V12Z" fill="#EA4335"/>
          <path d="M16 16H8V18H16V16Z" fill="#34A853"/>
        </svg>
      </div>
      <p className="text-[#202124] font-medium text-lg">Click or drag a file here</p>
      <p className="text-[#5f6368] text-sm mt-1">PDF, Image or Text (Max 10MB)</p>
      <div className="mt-8">
        <button className="btn-primary px-8 py-2.5 font-medium rounded-md shadow-sm transition-all">
          Browse Files
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
