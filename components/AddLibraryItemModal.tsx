import React, { useState, useRef } from 'react';
import { X, Link as LinkIcon, Upload, Brain, Briefcase, Book, MessageCircle, Loader2 } from 'lucide-react';
import { CustomLibraryItem } from '../types';

interface AddLibraryItemModalProps {
  onClose: () => void;
  onAdd: (item: Omit<CustomLibraryItem, 'id' | 'createdAt'>) => void;
  darkMode?: boolean;
}

const AddLibraryItemModal: React.FC<AddLibraryItemModalProps> = ({ onClose, onAdd, darkMode }) => {
  const [itemType, setItemType] = useState<'url' | 'file'>('url');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<'Brain' | 'Briefcase' | 'Book' | 'MessageCircle'>('Book');
  const [selectedFile, setSelectedFile] = useState<{ data: string; name: string; type: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cardClass = darkMode ? 'bg-[#2D2D2D] text-white' : 'bg-white text-black';
  const inputClass = darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-black';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setSelectedFile({
          data: base64,
          name: file.name,
          type: file.type
        });
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;
    if (itemType === 'url' && !url.trim()) return;
    if (itemType === 'file' && !selectedFile) return;

    onAdd({
      title: title.trim(),
      description: description.trim(),
      type: itemType,
      url: itemType === 'url' ? url.trim() : undefined,
      fileData: itemType === 'file' ? selectedFile?.data : undefined,
      fileName: itemType === 'file' ? selectedFile?.name : undefined,
      mimeType: itemType === 'file' ? selectedFile?.type : undefined,
      icon: selectedIcon
    });

    onClose();
  };

  const iconOptions = [
    { id: 'Brain' as const, Icon: Brain, label: 'Psychology' },
    { id: 'Briefcase' as const, Icon: Briefcase, label: 'Work' },
    { id: 'Book' as const, Icon: Book, label: 'Education' },
    { id: 'MessageCircle' as const, Icon: MessageCircle, label: 'Communication' }
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/60 p-4 animate-in fade-in duration-300">
      <div className={`w-full max-w-md rounded-t-[2.5rem] p-8 space-y-6 shadow-2xl ${cardClass} animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center">
          <h2 className="font-lexend font-bold text-2xl">Add Resource</h2>
          <button onClick={onClose} className="p-2 opacity-40 hover:opacity-100 transition-opacity">
            <X size={24} />
          </button>
        </div>

        {/* Type Selection */}
        <div className="flex gap-2 p-1 bg-black/5 rounded-2xl">
          <button
            onClick={() => setItemType('url')}
            className={`flex-1 py-3 rounded-xl font-lexend font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              itemType === 'url' ? 'bg-[#5B4A8F] text-white shadow-sm' : 'opacity-40'
            }`}
          >
            <LinkIcon size={16} /> URL
          </button>
          <button
            onClick={() => setItemType('file')}
            className={`flex-1 py-3 rounded-xl font-lexend font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              itemType === 'file' ? 'bg-[#5B4A8F] text-white shadow-sm' : 'opacity-40'
            }`}
          >
            <Upload size={16} /> File
          </button>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="font-lexend font-bold text-sm uppercase opacity-60">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Communication Tips Guide"
            className={`w-full h-14 px-4 rounded-xl border-2 focus:border-[#5B4A8F] outline-none ${inputClass}`}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="font-lexend font-bold text-sm uppercase opacity-60">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of what this resource contains..."
            className={`w-full h-24 px-4 py-3 rounded-xl border-2 focus:border-[#5B4A8F] outline-none resize-none ${inputClass}`}
          />
        </div>

        {/* URL or File Upload */}
        {itemType === 'url' ? (
          <div className="space-y-2">
            <label className="font-lexend font-bold text-sm uppercase opacity-60">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/resource"
              className={`w-full h-14 px-4 rounded-xl border-2 focus:border-[#5B4A8F] outline-none ${inputClass}`}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="font-lexend font-bold text-sm uppercase opacity-60">Upload File</label>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className={`w-full h-14 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all ${
                selectedFile
                  ? 'border-green-500 bg-green-500/10'
                  : `border-slate-300 hover:border-[#5B4A8F] ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`
              } ${isProcessing ? 'opacity-50' : ''}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span className="font-lexend font-bold text-sm">Processing...</span>
                </>
              ) : selectedFile ? (
                <>
                  <Upload size={20} className="text-green-500" />
                  <span className="font-lexend font-bold text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                </>
              ) : (
                <>
                  <Upload size={20} />
                  <span className="font-lexend font-bold text-sm">Choose File (PDF, Image, Text)</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              className="hidden"
            />
            {selectedFile && (
              <button
                onClick={() => setSelectedFile(null)}
                className="text-xs text-red-500 hover:underline"
              >
                Remove file
              </button>
            )}
          </div>
        )}

        {/* Icon Selection */}
        <div className="space-y-2">
          <label className="font-lexend font-bold text-sm uppercase opacity-60">Category Icon</label>
          <div className="grid grid-cols-4 gap-2">
            {iconOptions.map(({ id, Icon, label }) => (
              <button
                key={id}
                onClick={() => setSelectedIcon(id)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  selectedIcon === id
                    ? 'bg-[#5B4A8F] text-white border-[#5B4A8F]'
                    : `${cardClass} border-transparent opacity-60 hover:opacity-100`
                }`}
              >
                <Icon size={24} />
                <span className="text-[10px] font-bold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={
            !title.trim() ||
            !description.trim() ||
            (itemType === 'url' && !url.trim()) ||
            (itemType === 'file' && !selectedFile) ||
            isProcessing
          }
          className={`w-full h-16 rounded-2xl font-lexend font-bold text-lg shadow-lg transition-all ${
            !title.trim() ||
            !description.trim() ||
            (itemType === 'url' && !url.trim()) ||
            (itemType === 'file' && !selectedFile) ||
            isProcessing
              ? 'bg-slate-300 text-slate-500'
              : 'bg-[#5B4A8F] text-white active:scale-95'
          }`}
        >
          Add to Library
        </button>
      </div>
    </div>
  );
};

export default AddLibraryItemModal;
