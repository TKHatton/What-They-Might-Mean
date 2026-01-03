
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Mode,
  Screen,
  AnalysisResult,
  DetailLevel,
  UserSettings,
  UserTier,
  QueuedAnalysis,
  CustomLibraryItem
} from './types';
import { COLORS, FREE_TIER_LIMIT, STRIPE_CONFIG, SUBSCRIPTION_PRODUCTS, PRIVACY_POLICY, TERMS_OF_SERVICE, LIBRARY_RESOURCES, COACH_EXAMPLES } from './constants';
import RiskMeter from './components/RiskMeter';
import Paywall from './components/Paywall';
import PaymentSheet from './components/PaymentSheet';
import Toast, { ToastType } from './components/Toast';
import AddLibraryItemModal from './components/AddLibraryItemModal';
import { analyzeMessage } from './services/geminiService';
import { sendCoachMessage } from './services/coachService';
import { ttsService } from './services/ttsService';
import {
  takePhoto,
  pickImage,
  shareContent,
  openUrl,
  copyToClipboard,
  triggerHaptic,
  isNativePlatform
} from './services/capacitorService';
import { 
  Home as HomeIcon, 
  Clock, 
  Settings as SettingsIcon, 
  ChevronLeft, 
  Camera, 
  Image as ImageIcon, 
  Mic, 
  Info,
  ChevronRight,
  Share2,
  Copy,
  CheckCircle,
  Briefcase,
  Backpack,
  Users,
  X,
  Mail,
  Lock,
  User,
  Volume2,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Zap,
  Trash2,
  Moon,
  Sun,
  Layers,
  Search,
  Star,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  MicOff,
  Square,
  WifiOff,
  BookMarked,
  BrainCircuit,
  FileText,
  Shield,
  Type as TypeIcon,
  Activity,
  ExternalLink,
  Book,
  MessageCircle,
  Brain,
  ChevronDown,
  UserCheck
} from 'lucide-react';

const MODE_EXAMPLES = {
  [Mode.WORK]: "My boss said 'circle back when you can'",
  [Mode.SCHOOL]: "My teacher said 'your participation could be more consistent'",
  [Mode.SOCIAL]: "My friend said 'it's fine if you can't come, don't worry about it'"
};

const MAX_HISTORY_ITEMS = 100;

const App: React.FC = () => {
  // Navigation & State
  const [screen, setScreen] = useState<Screen>('WELCOME');
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<{ data: string; mimeType: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState<'Summary' | 'Actions' | 'Responses'>('Summary');
  const [expandedSections, setExpandedSections] = useState<string[]>(['Expected']);
  const [legalType, setLegalType] = useState<'TOS' | 'PRIVACY'>('TOS');

  // Coaching state
  const [coachInput, setCoachInput] = useState('');
  const [coachHistory, setCoachHistory] = useState<{ role: 'user' | 'bot', text: string }[]>([]);
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  // Offline state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedAnalyses, setQueuedAnalyses] = useState<QueuedAnalysis[]>([]);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Image preview modal
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Custom library items
  const [customLibraryItems, setCustomLibraryItems] = useState<CustomLibraryItem[]>([]);
  const [showAddLibraryModal, setShowAddLibraryModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Settings
  const [settings, setSettings] = useState<UserSettings>({
    textSize: 'Medium',
    fontFamily: 'Lexend',
    voiceName: '',
    analysisDetail: DetailLevel.STANDARD,
    audioOutput: false,
    audioSpeed: 1,
    defaultMode: Mode.WORK,
    darkMode: false,
    tier: UserTier.FREE,
    analysesCount: 0
  });
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Derived: Library of rules
  const allDiscoveredRules = useMemo(() => {
    const rulesMap = new Map<string, { rule: string, source: string, mode: Mode }>();
    history.forEach(analysis => {
      analysis.hiddenRules.forEach(rule => {
        if (!rulesMap.has(rule)) {
          rulesMap.set(rule, { rule, source: analysis.originalMessage, mode: analysis.mode });
        }
      });
    });
    return Array.from(rulesMap.values());
  }, [history]);

  // Local Storage Sync
  useEffect(() => {
    const saved = localStorage.getItem('wtm_history');
    if (saved) {
      let parsed = JSON.parse(saved);
      if (parsed.length > MAX_HISTORY_ITEMS) parsed = parsed.slice(0, MAX_HISTORY_ITEMS);
      setHistory(parsed);
    }

    const savedSettings = localStorage.getItem('wtm_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsed }));
    }

    const savedQueue = localStorage.getItem('wtm_queue');
    if (savedQueue) setQueuedAnalyses(JSON.parse(savedQueue));

    const savedCustomLibrary = localStorage.getItem('wtm_custom_library');
    if (savedCustomLibrary) setCustomLibraryItems(JSON.parse(savedCustomLibrary));

    // Load available voices for TTS
    const loadVoices = () => {
      const voices = ttsService.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        // Set default voice if none selected
        if (!savedSettings || !JSON.parse(savedSettings || '{}').voiceName) {
          // Prefer English voices
          const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
          if (englishVoice) {
            setSettings(prev => ({ ...prev, voiceName: englishVoice.name }));
          }
        }
      }
    };

    // Voices might not be loaded immediately
    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wtm_history', JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('wtm_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('wtm_queue', JSON.stringify(queuedAnalyses));
  }, [queuedAnalyses]);

  useEffect(() => {
    localStorage.setItem('wtm_custom_library', JSON.stringify(customLibraryItems));
  }, [customLibraryItems]);

  // Handle Connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process Queue when online
  const processQueue = useCallback(async () => {
    if (!isOnline || queuedAnalyses.length === 0 || isAnalyzing) return;
    const nextRequest = queuedAnalyses[0];
    setIsAnalyzing(true);
    try {
      const result = await analyzeMessage(
        nextRequest.message,
        nextRequest.mode,
        nextRequest.detailLevel,
        nextRequest.image,
        nextRequest.audio
      );
      setHistory(prev => [result, ...prev]);
      setSettings(s => ({ ...s, analysesCount: s.analysesCount + 1 }));
      setQueuedAnalyses(prev => prev.slice(1));
    } catch (error) {
      console.error("Queue processing error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isOnline, queuedAnalyses, isAnalyzing]);

  useEffect(() => {
    if (isOnline && queuedAnalyses.length > 0) processQueue();
  }, [isOnline, queuedAnalyses.length, processQueue]);

  // Toast helper
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  // TTS helper - speak analysis results
  const speakAnalysis = (analysis: AnalysisResult) => {
    if (!settings.audioOutput || !ttsService.isAvailable()) return;

    const textToSpeak = `The message clarity score is ${analysis.clarityScore.score} out of 5. ${analysis.clarityScore.explanation}. Translation: ${analysis.whatWasSaid}`;
    ttsService.speak(textToSpeak, { rate: settings.audioSpeed, voice: settings.voiceName });
  };

  // Handlers
  const handleStartAnalysis = async () => {
    if (settings.tier === UserTier.FREE && settings.analysesCount >= FREE_TIER_LIMIT) {
      setScreen('PAYWALL');
      return;
    }
    if (!inputText.trim() && !selectedImage && !selectedAudio) return;
    if (!selectedMode) return;

    await triggerHaptic('medium');

    if (!isOnline) {
      const newQueued: QueuedAnalysis = {
        id: Math.random().toString(36).substr(2, 9),
        message: inputText,
        mode: selectedMode,
        detailLevel: settings.analysisDetail,
        image: selectedImage || undefined,
        audio: selectedAudio || undefined
      };
      setQueuedAnalyses(prev => [...prev, newQueued]);
      showToast('Offline - Added to queue. Will analyze when online.', 'offline');
      setScreen('HOME');
      setInputText('');
      setSelectedImage(null);
      setSelectedAudio(null);
      return;
    }

    setScreen('LOADING');
    setIsAnalyzing(true);
    try {
      const result = await analyzeMessage(inputText, selectedMode, settings.analysisDetail, selectedImage || undefined, selectedAudio || undefined);
      setCurrentAnalysis(result);
      setHistory(prev => [result, ...prev]);
      setSettings(s => ({ ...s, analysesCount: s.analysesCount + 1 }));
      setScreen('RESULTS');
      setInputText('');
      setSelectedImage(null);
      setSelectedAudio(null);

      // Speak results if audio output is enabled
      speakAnalysis(result);
      await triggerHaptic('light');
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.message || 'Could not analyze message. Please try again.';
      showToast(errorMsg, 'error');
      // Stay on INPUT screen so user can retry without losing their input
      setScreen('INPUT');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          setSelectedAudio({ data: base64, mimeType: 'audio/webm' });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access failed.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCoachSubmit = async () => {
    if (!coachInput.trim() || isCoachLoading) return;

    const userMsg = coachInput;
    setCoachInput('');
    setCoachHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsCoachLoading(true);

    await triggerHaptic('light');

    try {
      const response = await sendCoachMessage(userMsg, coachHistory);
      setCoachHistory(prev => [...prev, { role: 'bot', text: response }]);

      // Speak coach response if audio is enabled
      if (settings.audioOutput && ttsService.isAvailable()) {
        ttsService.speak(response, { rate: settings.audioSpeed, voice: settings.voiceName });
      }
    } catch (error) {
      console.error('Coach error:', error);
      showToast('Could not reach coach. Please try again.', 'error');
    } finally {
      setIsCoachLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    await triggerHaptic('light');
    const photo = await takePhoto();
    if (photo) {
      setSelectedImage(photo);
      showToast('Photo captured', 'success');
    }
  };

  const handlePickImage = async () => {
    await triggerHaptic('light');
    const image = await pickImage();
    if (image) {
      setSelectedImage(image);
      showToast('Image selected', 'success');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setSelectedImage({ data: base64, mimeType: file.type });
        showToast('Image selected', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = async () => {
    if (!currentAnalysis) return;
    await triggerHaptic('medium');
    const textToShare = `WTM Decoding:\n\nMessage: ${currentAnalysis.originalMessage}\n\nTranslation: ${currentAnalysis.whatWasSaid}`;

    const shared = await shareContent('WTM Analysis', textToShare);
    if (shared) {
      showToast('Shared successfully', 'success');
    } else {
      // Fallback to clipboard
      const copied = await copyToClipboard(textToShare);
      if (copied) {
        showToast('Copied to clipboard', 'success');
      } else {
        showToast('Could not share', 'error');
      }
    }
  };

  const handleCopyResponse = async (text: string) => {
    await triggerHaptic('light');
    const copied = await copyToClipboard(text);
    if (copied) {
      showToast('Copied to clipboard', 'success');
    } else {
      showToast('Could not copy', 'error');
    }
  };

  const handleAddLibraryItem = (item: Omit<CustomLibraryItem, 'id' | 'createdAt'>) => {
    const newItem: CustomLibraryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    setCustomLibraryItems(prev => [newItem, ...prev]);
    showToast('Resource added to library', 'success');
    triggerHaptic('medium');
  };

  const handleDeleteLibraryItem = async (id: string) => {
    if (confirm('Delete this resource from your library?')) {
      setCustomLibraryItems(prev => prev.filter(item => item.id !== id));
      showToast('Resource removed', 'success');
      await triggerHaptic('light');
    }
  };

  const handleViewLibraryItem = async (item: CustomLibraryItem) => {
    await triggerHaptic('light');
    if (item.type === 'url' && item.url) {
      await openUrl(item.url);
    } else if (item.type === 'file' && item.fileData) {
      // Create a blob URL and open it
      const blob = base64ToBlob(item.fileData, item.mimeType || 'application/octet-stream');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    }
  };

  // Helper to convert base64 to blob
  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }
    return new Blob([new Uint8Array(byteArrays)], { type: mimeType });
  };

  const themeClass = settings.darkMode ? 'dark bg-[#1A1A1A] text-white' : 'bg-[#8FAD9C] text-black';
  const cardClass = settings.darkMode ? 'bg-[#2D2D2D] text-white border-white/10' : 'bg-white text-black border-slate-100';
  const headerClass = settings.darkMode ? 'bg-[#252525] border-white/10 text-white' : 'bg-[#E5E7EB] border-slate-200 text-black';

  const AppIcon = ({ size = 64 }) => (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <img
        src="./assets/images/Logo for WTM.png"
        alt="What They Meant Logo"
        className="w-full h-full object-contain drop-shadow-2xl"
      />
    </div>
  );

  const renderBottomNav = () => {
    const screens = [
      { id: 'HOME', icon: HomeIcon, label: 'Home' },
      { id: 'HISTORY', icon: Clock, label: 'History' },
      { id: 'LIBRARY', icon: BookMarked, label: 'Library' },
      { id: 'COACH', icon: BrainCircuit, label: 'Coach' },
    ];
    return (
      <nav className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 border-t flex items-center justify-around z-[100] ${headerClass}`}>
        {screens.map(s => (
          <button key={s.id} onClick={() => setScreen(s.id as Screen)} className={`flex flex-col items-center gap-1 transition-all ${screen === s.id ? 'text-[#5B4A8F]' : 'opacity-40'}`}>
            <s.icon size={22} />
            <span className="text-[10px] font-lexend font-bold uppercase">{s.label}</span>
          </button>
        ))}
      </nav>
    );
  };

  const renderHeader = (title: string, showBack = true) => (
    <header className={`p-6 flex items-center gap-4 border-b shrink-0 ${headerClass}`}>
      {showBack ? <button onClick={() => setScreen('HOME')}><ChevronLeft size={32} /></button> : <div className="flex items-center gap-2"><AppIcon size={32} /></div>}
      <div className="flex-1 text-center">
        <h1 className="font-lexend font-bold text-xl uppercase tracking-widest">{title}</h1>
        {!isOnline && <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Offline</div>}
      </div>
      <button onClick={() => setScreen('SETTINGS')} className="p-2"><SettingsIcon size={26} /></button>
    </header>
  );

  // Apply default mode on mount
  useEffect(() => {
    if (screen === 'HOME' && !selectedMode && settings.defaultMode) {
      setSelectedMode(settings.defaultMode);
    }
  }, [screen]);

  const renderHome = () => (
    <div className={`min-h-screen flex flex-col screen-enter ${themeClass}`}>
      {renderHeader("Decoder", false)}
      <main className="flex-1 p-6 space-y-8 pb-24 overflow-y-auto">
        <h2 className="font-lexend font-bold text-2xl">Select context:</h2>
        <div className="space-y-4">
          {[
            { id: Mode.WORK, icon: <Briefcase size={24} />, label: 'Work', sub: 'Professional messages & feedback' },
            { id: Mode.SCHOOL, icon: <Backpack size={24} />, label: 'School', sub: 'Assignments & academic requests' },
            { id: Mode.SOCIAL, icon: <Users size={24} />, label: 'Social', sub: 'Texts from friends & relationships' },
          ].map(m => (
            <button key={m.id} onClick={async () => { await triggerHaptic('light'); setSelectedMode(m.id as Mode); }} className={`w-full p-6 rounded-2xl border-2 text-left flex items-start gap-4 transition-all ${selectedMode === m.id ? 'bg-[#5B4A8F] text-white border-black scale-[1.02]' : `${cardClass} border-transparent shadow-sm`}`}>
              <div className={`p-3 rounded-xl ${selectedMode === m.id ? 'bg-white/20' : (settings.darkMode ? 'bg-[#3D3D3D] text-[#C4B5D9]' : 'bg-slate-100 text-[#5B4A8F]')}`}>{m.icon}</div>
              <div><p className="font-lexend font-bold text-lg">{m.label}</p><p className={`font-opendyslexic text-sm ${selectedMode === m.id ? 'opacity-80' : 'opacity-60'}`}>{m.sub}</p></div>
            </button>
          ))}
        </div>
        <button disabled={!selectedMode} onClick={() => setScreen('INPUT')} className={`w-full h-16 rounded-full font-lexend font-bold text-xl flex items-center justify-center gap-2 transition-all ${selectedMode ? 'bg-[#5B4A8F] text-white shadow-lg active:scale-95' : 'bg-slate-200 text-slate-400'}`}>
          Next Context <ChevronRight size={24} />
        </button>
      </main>
      {renderBottomNav()}
    </div>
  );

  const renderLibrary = () => (
    <div className={`min-h-screen flex flex-col screen-enter ${themeClass}`}>
      {renderHeader("Library")}
      <main className="flex-1 p-6 space-y-10 pb-24 overflow-y-auto">
        {/* Custom Library Items */}
        {customLibraryItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-lexend font-bold text-2xl">My Resources</h2>
                <p className="font-opendyslexic text-sm opacity-60">Your personal collection</p>
              </div>
              <button
                onClick={async () => {
                  await triggerHaptic('light');
                  setShowAddLibraryModal(true);
                }}
                className="w-12 h-12 rounded-full bg-[#5B4A8F] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                title="Add resource"
              >
                <span className="text-2xl font-bold">+</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {customLibraryItems.map((item) => {
                const ResourceIcon = item.icon === 'Brain' ? Brain : item.icon === 'Briefcase' ? Briefcase : item.icon === 'Book' ? Book : MessageCircle;
                return (
                  <div key={item.id} className={`p-6 rounded-2xl border-2 ${cardClass} border-transparent hover:border-[#5B4A8F] transition-all relative group`}>
                    <button
                      onClick={() => handleViewLibraryItem(item)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-[#5B4A8F]/10 text-[#5B4A8F] group-hover:bg-[#5B4A8F] group-hover:text-white transition-colors">
                          <ResourceIcon size={24} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-lexend font-bold text-lg">{item.title}</h4>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] uppercase font-bold opacity-40 bg-black/5 px-2 py-0.5 rounded">
                                {item.type === 'url' ? 'Link' : 'File'}
                              </span>
                            </div>
                          </div>
                          <p className="font-opendyslexic text-xs opacity-60 leading-relaxed">{item.description}</p>
                          {item.type === 'file' && item.fileName && (
                            <p className="text-[10px] opacity-40 font-mono">{item.fileName}</p>
                          )}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteLibraryItem(item.id)}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all"
                      title="Delete resource"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Button (shown when no custom items) */}
        {customLibraryItems.length === 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-lexend font-bold text-2xl">My Resources</h2>
                <p className="font-opendyslexic text-sm opacity-60">Add your personal resources</p>
              </div>
              <button
                onClick={async () => {
                  await triggerHaptic('light');
                  setShowAddLibraryModal(true);
                }}
                className="w-12 h-12 rounded-full bg-[#5B4A8F] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                title="Add resource"
              >
                <span className="text-2xl font-bold">+</span>
              </button>
            </div>
            <div className={`p-8 rounded-2xl border-2 border-dashed ${cardClass} border-opacity-30 text-center space-y-3`}>
              <p className="font-opendyslexic text-sm opacity-60">No custom resources yet. Tap + to add your own guides, links, or files.</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="text-center space-y-2 border-t pt-8">
            <h2 className="font-lexend font-bold text-2xl">Social Playbook</h2>
            <p className="font-opendyslexic text-sm opacity-60">Rules discovered during your decoding sessions.</p>
          </div>
          {allDiscoveredRules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-30 space-y-4">
              <BookMarked size={48} />
              <p className="font-lexend font-bold text-sm">No rules discovered yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {allDiscoveredRules.map((item, i) => (
                <div key={i} className={`p-6 rounded-2xl border-2 ${cardClass} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-[#5B4A8F]/10 px-2 py-1 rounded-full text-[#5B4A8F]">{item.mode}</span>
                  </div>
                  <p className="font-lexend font-bold text-lg leading-snug">"{item.rule}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="text-center space-y-2 border-t pt-8">
            <h2 className="font-lexend font-bold text-2xl">Discovery Resources</h2>
            <p className="font-opendyslexic text-sm opacity-60">Deepen your understanding of social dynamics.</p>
          </div>
          <div className="space-y-4">
            {LIBRARY_RESOURCES.map((res, i) => {
              const ResourceIcon = res.icon === 'Brain' ? Brain : res.icon === 'Briefcase' ? Briefcase : res.icon === 'Book' ? Book : MessageCircle;
              return (
                <button
                  key={i}
                  onClick={async () => {
                    await triggerHaptic('light');
                    await openUrl(res.link);
                  }}
                  className={`p-6 rounded-2xl border-2 block w-full text-left ${cardClass} border-transparent hover:border-[#5B4A8F] transition-all group`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[#5B4A8F]/10 text-[#5B4A8F] group-hover:bg-[#5B4A8F] group-hover:text-white transition-colors">
                      <ResourceIcon size={24} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-lexend font-bold text-lg">{res.title}</h4>
                        <ExternalLink size={16} className="opacity-40" />
                      </div>
                      <p className="font-opendyslexic text-xs opacity-60 leading-relaxed">{res.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
      {renderBottomNav()}
    </div>
  );

  const renderCoach = () => {
    const currentExamples = COACH_EXAMPLES[settings.defaultMode] || COACH_EXAMPLES.WORK;

    const handleExampleClick = async (promptText: string) => {
      setCoachInput(promptText);
      await triggerHaptic('light');

      // Auto-send the example prompt
      const userMsg = promptText;
      setCoachInput('');
      setCoachHistory(prev => [...prev, { role: 'user', text: userMsg }]);
      setIsCoachLoading(true);

      try {
        const response = await sendCoachMessage(userMsg, coachHistory);
        setCoachHistory(prev => [...prev, { role: 'bot', text: response }]);

        if (settings.audioOutput && ttsService.isAvailable()) {
          ttsService.speak(response, { rate: settings.audioSpeed, voice: settings.voiceName });
        }
      } catch (error) {
        showToast('Could not reach coach. Please try again.', 'error');
      } finally {
        setIsCoachLoading(false);
      }
    };

    return (
      <div className={`min-h-screen flex flex-col screen-enter ${themeClass}`}>
        {/* Header with Clear Button */}
        <header className={`flex justify-between items-center p-6 pb-4 ${headerClass}`}>
          <button onClick={() => setScreen('HOME')} className="opacity-40 hover:opacity-100 transition-opacity">
            <ChevronLeft size={28} />
          </button>
          <h2 className="font-lexend font-bold text-xl">🧠 Coach</h2>
          <button
            onClick={async () => {
              await triggerHaptic('medium');
              setCoachHistory([]);
              setCoachInput('');
              showToast('Chat cleared', 'info');
            }}
            className="opacity-40 hover:opacity-100 transition-opacity"
          >
            <Trash2 size={20} />
          </button>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden pb-20">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {/* Welcome Card - Empty State */}
            {coachHistory.length === 0 && (
              <div className={`rounded-3xl p-8 space-y-4 ${cardClass} shadow-sm border-2 border-[#5B4A8F]/20`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#5B4A8F]/10 flex items-center justify-center">
                    <BrainCircuit size={24} className="text-[#5B4A8F]" />
                  </div>
                  <h3 className="font-lexend font-bold text-xl">Your Social Skills Coach</h3>
                </div>
                <p className="text-sm opacity-70 leading-relaxed">
                  I'm here to help you navigate social situations with confidence. Ask me about:
                </p>
                <ul className="text-sm opacity-70 space-y-2 pl-4">
                  <li>• How to respond to messages</li>
                  <li>• What someone might mean by something they said</li>
                  <li>• How to handle awkward situations</li>
                  <li>• Practice for upcoming conversations</li>
                  <li>• Understanding social expectations</li>
                </ul>
              </div>
            )}

            {/* Example Prompts */}
            {coachHistory.length === 0 && (
              <div className="space-y-3">
                <h4 className="font-lexend font-bold text-sm uppercase opacity-60 px-2">
                  📚 Try asking me:
                </h4>
                <div className="space-y-2">
                  {currentExamples.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExampleClick(example.prompt)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all active:scale-98 ${cardClass} border-transparent hover:border-[#5B4A8F]/30 shadow-sm`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">{example.icon}</span>
                        <div className="flex-1">
                          <p className="font-lexend text-sm">{example.prompt}</p>
                          <span className="text-[10px] opacity-40 uppercase tracking-wide">
                            {example.category}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat History */}
            {coachHistory.map((chat, i) => (
              <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom duration-300`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  chat.role === 'user'
                    ? 'bg-[#5B4A8F] text-white rounded-br-sm'
                    : `${cardClass} rounded-bl-sm shadow-sm border-2 border-transparent`
                }`}>
                  {chat.text}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isCoachLoading && (
              <div className="flex justify-start animate-in slide-in-from-bottom duration-300">
                <div className={`max-w-[85%] p-4 rounded-2xl rounded-bl-sm ${cardClass} shadow-sm`}>
                  <div className="flex items-center gap-2 text-sm opacity-60">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Coach is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area - Fixed Bottom */}
          <div className={`p-4 border-t ${headerClass}`}>
            <div className={`relative flex items-center gap-2 rounded-2xl border-2 p-2 ${cardClass}`}>
              <input
                value={coachInput}
                onChange={(e) => setCoachInput(e.target.value)}
                placeholder={coachHistory.length === 0 ? "Tap an example above, or ask me anything..." : "Ask a follow-up question..."}
                className="flex-1 bg-transparent outline-none px-4 py-2"
                onKeyPress={(e) => e.key === 'Enter' && !isCoachLoading && coachInput.trim() && handleCoachSubmit()}
                disabled={isCoachLoading}
              />
              <button
                onClick={handleCoachSubmit}
                disabled={isCoachLoading || !coachInput.trim()}
                className="bg-[#5B4A8F] text-white p-3 rounded-xl active:scale-90 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isCoachLoading ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} />}
              </button>
            </div>
          </div>
        </main>
        {renderBottomNav()}
      </div>
    );
  };

  const renderWelcome = () => (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-8 screen-enter ${themeClass}`}>
      <AppIcon size={120} />
      <div className="space-y-4">
        <h1 className="font-lexend font-bold text-4xl uppercase tracking-tighter">What They Meant</h1>
        <p className="font-opendyslexic text-lg opacity-70">Deciphering the unspoken. Built for neurodivergent minds.</p>
      </div>
      <button 
        onClick={() => setScreen('HOME')}
        className="w-full h-16 bg-[#5B4A8F] text-white rounded-full font-lexend font-bold text-xl shadow-lg active:scale-95 transition-all"
      >
        Get Started
      </button>
    </div>
  );

  const renderHistory = () => (
    <div className={`min-h-screen flex flex-col screen-enter ${themeClass}`}>
      {renderHeader("History")}
      <main className="flex-1 p-6 space-y-4 pb-24 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 space-y-4">
            <Clock size={64} />
            <p className="font-lexend font-bold">No history yet.</p>
          </div>
        ) : (
          history.map((item) => (
            <button 
              key={item.id} 
              onClick={() => { setCurrentAnalysis(item); setScreen('RESULTS'); }}
              className={`w-full p-6 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all ${cardClass} border-transparent shadow-sm`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[#5B4A8F]/10 px-2 py-1 rounded-full text-[#5B4A8F]">{item.mode}</span>
                <span className="text-[10px] opacity-40">{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
              <p className="font-lexend font-bold text-sm line-clamp-2">"{item.originalMessage}"</p>
            </button>
          ))
        )}
      </main>
      {renderBottomNav()}
    </div>
  );

  const renderInput = () => (
    <div className={`min-h-screen flex flex-col screen-enter ${themeClass}`}>
      {renderHeader(selectedMode || "Input")}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto pb-12">
        <div className="space-y-2">
          <label className="font-lexend font-bold text-sm uppercase opacity-60">Message to decode</label>
          <div className={`relative rounded-2xl border-2 p-4 ${cardClass}`}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={selectedMode ? MODE_EXAMPLES[selectedMode] : "Paste message here..."}
              className="w-full h-32 bg-transparent outline-none font-opendyslexic resize-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              {isNativePlatform() ? (
                <>
                  <button onClick={handlePickImage} className="p-2 opacity-60 hover:opacity-100 transition-opacity" title="Choose from gallery"><ImageIcon size={20} /></button>
                  <button onClick={handleTakePhoto} className="p-2 opacity-60 hover:opacity-100 transition-opacity" title="Take photo"><Camera size={20} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 opacity-60 hover:opacity-100 transition-opacity"><ImageIcon size={20} /></button>
                  <button onClick={() => cameraInputRef.current?.click()} className="p-2 opacity-60 hover:opacity-100 transition-opacity"><Camera size={20} /></button>
                </>
              )}
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
        </div>

        {selectedImage && (
          <div className="relative inline-block">
            <img
              src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`}
              className="h-32 w-32 object-cover rounded-xl cursor-pointer shadow-md"
              alt="Preview"
              onClick={() => setImagePreviewUrl(`data:${selectedImage.mimeType};base64,${selectedImage.data}`)}
            />
            <button onClick={async () => { await triggerHaptic('light'); setSelectedImage(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg"><X size={16} /></button>
          </div>
        )}

        <div className="space-y-4">
          <label className="font-lexend font-bold text-sm uppercase opacity-60">Or record audio</label>
          <button 
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-lexend font-bold transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-[#D4A5A5] text-black'}`}
          >
            {isRecording ? <Square size={20} /> : <Mic size={20} />}
            {isRecording ? 'Release to stop' : (selectedAudio ? 'Audio recorded' : 'Hold to record')}
          </button>
          {selectedAudio && (
             <div className="flex items-center justify-between p-3 rounded-xl bg-[#D4A5A5]/20">
               <span className="font-opendyslexic text-xs">Audio ready for analysis</span>
               <button onClick={() => setSelectedAudio(null)} className="text-red-500"><Trash2 size={16} /></button>
             </div>
          )}
        </div>

        <button
          onClick={handleStartAnalysis}
          disabled={(!inputText.trim() && !selectedImage && !selectedAudio) || isAnalyzing}
          className={`w-full h-16 rounded-full font-lexend font-bold text-xl flex items-center justify-center gap-2 transition-all ${(!inputText.trim() && !selectedImage && !selectedAudio) || isAnalyzing ? 'bg-slate-200 text-slate-400' : 'bg-[#5B4A8F] text-white shadow-lg active:scale-95'}`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Analyzing...
            </>
          ) : (
            <>
              Decode This <Zap size={20} />
            </>
          )}
        </button>
      </main>
    </div>
  );

  const renderLoading = () => (
    <div className={`min-h-screen flex flex-col items-center justify-center p-12 text-center space-y-12 screen-enter ${themeClass}`}>
      <div className="relative">
        <div className="w-32 h-32 rounded-full border-4 border-[#5B4A8F]/20 border-t-[#5B4A8F] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
           <AppIcon size={48} />
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="font-lexend font-bold text-2xl animate-pulse">Analyzing Nuance...</h2>
        <p className="font-opendyslexic text-base opacity-60 leading-relaxed">
          Decoding hidden social patterns...
        </p>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!currentAnalysis) return null;

    const toggleSection = (id: string) => {
      setExpandedSections(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    };

    const AccordionItem = ({ id, label, icon: Icon, children }: { id: string, label: string, icon: any, children: React.ReactNode }) => {
      const isOpen = expandedSections.includes(id);
      return (
        <div className={`rounded-2xl border-2 transition-all ${cardClass} ${isOpen ? 'border-[#5B4A8F]' : 'border-transparent'}`}>
          <button onClick={() => toggleSection(id)} className="w-full p-4 flex justify-between items-center text-left">
            <div className="flex items-center gap-3">
              <Icon size={18} className="text-[#5B4A8F]" />
              <span className="font-lexend font-bold text-xs uppercase tracking-widest">{label}</span>
            </div>
            <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {isOpen && <div className="px-4 pb-4 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">{children}</div>}
        </div>
      );
    };

    return (
      <div className={`min-h-screen flex flex-col screen-enter ${themeClass}`}>
        <header className={`p-6 flex items-center gap-4 border-b shrink-0 ${headerClass}`}>
          <button onClick={() => setScreen('HOME')}><ChevronLeft size={32} /></button>
          <div className="flex-1 text-center">
            <h1 className="font-lexend font-bold text-xl uppercase tracking-widest">Translation</h1>
          </div>
          <button onClick={handleShare} className="p-2"><Share2 size={24} /></button>
        </header>

        <main className="flex-1 overflow-y-auto pb-24">
          <div className="p-6 space-y-6">
            
            {/* 1. Tabs First as requested */}
            <div className="flex bg-black/5 p-1 rounded-2xl">
              {['Summary', 'Actions', 'Responses'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-3 rounded-xl font-lexend font-bold text-sm transition-all ${activeTab === tab ? 'bg-white text-black shadow-sm' : 'opacity-40'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Summary' && (
              <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
                <RiskMeter score={currentAnalysis.clarityScore} darkMode={settings.darkMode} />
                <div className={`p-6 rounded-2xl border-2 ${cardClass}`}>
                  <h3 className="font-lexend font-bold text-xs uppercase opacity-50 mb-4 tracking-widest">Literal Translation</h3>
                  <p className="font-opendyslexic text-lg leading-relaxed">"{currentAnalysis.whatWasSaid}"</p>
                </div>
                <section className="space-y-3">
                  <h4 className="font-lexend font-bold text-xs uppercase opacity-50 tracking-widest flex items-center gap-2"><Layers size={14} /> Social Hidden Rules</h4>
                  <div className="space-y-2">
                    {currentAnalysis.hiddenRules.map((rule, i) => (
                      <div key={i} className={`p-4 rounded-xl border-l-4 border-[#5B4A8F] ${cardClass} shadow-sm`}>
                        <p className="font-opendyslexic text-sm">{rule}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'Actions' && (
              <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
                {/* Critical Next Steps at Top */}
                <section className="space-y-3">
                  <h4 className="font-lexend font-bold text-xs uppercase opacity-50 tracking-widest flex items-center gap-2"><CheckCircle size={14} /> Critical Next Steps</h4>
                  <div className="space-y-2">
                    {currentAnalysis.whatIsExpected.map((act, i) => (
                      <div key={i} className={`p-4 rounded-xl border-l-4 border-green-400 ${cardClass} shadow-sm`}>
                        <p className="font-opendyslexic text-sm">{act}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="h-px bg-black/5 w-full my-2" />

                {/* Accordions BELOW Actions as requested */}
                <AccordionItem id="nuance" label="Context Nuance" icon={Info}>
                   <p className="font-opendyslexic text-sm opacity-80 leading-relaxed">
                     In this {currentAnalysis.mode.toLowerCase()} context, messages are often cushioned to avoid direct friction. The sender likely assumes you are familiar with the {currentAnalysis.mode.toLowerCase()} dynamic.
                   </p>
                </AccordionItem>

                <AccordionItem id="optional" label="Optional Tasks" icon={HelpCircle}>
                  {currentAnalysis.whatIsOptional.length > 0 ? (
                    currentAnalysis.whatIsOptional.map((item, i) => (
                      <div key={i} className="flex gap-2 items-start text-sm font-opendyslexic opacity-70">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                        <p>{item}</p>
                      </div>
                    ))
                  ) : <p className="text-xs opacity-50 italic">Nothing optional detected.</p>}
                </AccordionItem>

                <AccordionItem id="risks" label="Risk Analysis" icon={AlertTriangle}>
                  {currentAnalysis.whatCarriesRisk.map((risk, i) => (
                    <div key={i} className="flex gap-2 items-start text-sm font-opendyslexic text-red-400">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                      <p>{risk}</p>
                    </div>
                  ))}
                </AccordionItem>

                <AccordionItem id="not-needed" label="What's NOT required" icon={ShieldCheck}>
                   {currentAnalysis.whatIsNotAskingFor.map((item, i) => (
                     <div key={i} className="flex gap-2 items-start text-xs font-opendyslexic opacity-50 italic">
                        <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                        <p>"{item}"</p>
                     </div>
                   ))}
                </AccordionItem>
              </div>
            )}

            {activeTab === 'Responses' && (
              <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
                {currentAnalysis.responses.map((resp, i) => (
                  <div key={i} className={`p-6 rounded-3xl border-2 space-y-4 ${cardClass}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-lexend font-bold text-xs uppercase bg-[#5B4A8F]/10 px-2 py-1 rounded-md text-[#5B4A8F]">{resp.type}</span>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(dot => (
                          <div key={dot} className={`w-2 h-2 rounded-full ${dot <= resp.riskLevel ? 'bg-red-400' : 'bg-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-black/5 rounded-2xl relative">
                      <p className="font-opendyslexic text-sm pr-8">{resp.wording}</p>
                      <button
                        onClick={() => handleCopyResponse(resp.wording)}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-white/80 hover:bg-white shadow-sm active:scale-95 transition-all"
                        title="Copy response"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="font-lexend font-bold text-[10px] uppercase opacity-40">Social Impact</p>
                      <p className="font-opendyslexic text-xs opacity-70 italic">"{resp.socialImpact}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        {renderBottomNav()}
      </div>
    );
  };

  const renderLegal = () => (
    <div className={`min-h-screen flex flex-col screen-enter ${themeClass}`}>
      <header className={`p-6 flex items-center gap-4 border-b shrink-0 ${headerClass}`}>
        <button onClick={() => setScreen('SETTINGS')}><ChevronLeft size={32} /></button>
        <div className="flex-1 text-center"><h1 className="font-lexend font-bold text-xl uppercase tracking-widest">{legalType === 'TOS' ? 'Terms' : 'Privacy'}</h1></div>
        <div className="w-8" />
      </header>
      <main className="flex-1 p-8 overflow-y-auto font-opendyslexic text-sm leading-relaxed whitespace-pre-wrap">
        {legalType === 'TOS' ? TERMS_OF_SERVICE : PRIVACY_POLICY}
      </main>
    </div>
  );

  const renderSettings = () => {
    // Helper to render button style based on dark mode selection
    const getBtnStyle = (isSelected: boolean) => {
      if (isSelected) return 'bg-[#5B4A8F] text-white border-[#5B4A8F] shadow-md';
      // High contrast unselected state for dark mode: Black text on Light background as requested
      if (settings.darkMode) return 'bg-[#F1F5F9] text-black border-transparent';
      return 'bg-white text-black border-slate-200';
    };

    return (
      <div className={`min-h-screen flex flex-col h-screen max-h-screen screen-enter ${themeClass} !bg-slate-50 dark:!bg-[#121212]`}>
        <header className={`p-6 flex items-center gap-4 border-b shrink-0 ${headerClass}`}>
          <button onClick={() => setScreen('HOME')}><ChevronLeft size={32} /></button>
          <div className="flex-1 text-center"><h1 className="font-lexend font-bold text-xl uppercase tracking-widest">Settings</h1></div>
          <div className="w-8" />
        </header>
        <main className="flex-1 p-6 space-y-10 overflow-y-auto pb-32">
          
          <section className="space-y-4">
            <h3 className="font-lexend font-bold text-lg px-2 flex items-center gap-2"><ShieldCheck size={20} className="text-[#5B4A8F]" /> Account & Plan</h3>
            <div className={`rounded-3xl p-6 space-y-6 ${cardClass} shadow-sm border-none`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-lexend font-bold text-sm">Active Tier</p>
                  <p className="font-opendyslexic text-xs opacity-60">WTM {settings.tier}</p>
                </div>
                <button 
                  onClick={() => setScreen('PAYWALL')}
                  className="bg-[#5B4A8F] text-white px-4 py-2 rounded-xl font-lexend font-bold text-xs active:scale-95 transition-all shadow-sm"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-lexend font-bold text-lg px-2 flex items-center gap-2"><TypeIcon size={20} className="text-[#5B4A8F]" /> Visual Settings</h3>
            <div className={`rounded-3xl p-6 space-y-8 ${cardClass} shadow-sm border-none`}>
              <div className="flex justify-between items-center">
                <p className="font-lexend font-bold text-sm flex items-center gap-3">
                  {settings.darkMode ? <Moon size={18} /> : <Sun size={18} />} Dark Mode
                </p>
                <button onClick={() => setSettings(s => ({ ...s, darkMode: !s.darkMode }))} className={`w-14 h-8 rounded-full relative transition-colors ${settings.darkMode ? 'bg-[#5B4A8F]' : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.darkMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="font-lexend font-bold text-sm">Text Scaling</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Small', 'Medium', 'Large', 'ExtraLarge'].map(size => (
                    <button 
                      key={size} 
                      onClick={() => setSettings(s => ({ ...s, textSize: size as any }))} 
                      className={`p-3 rounded-xl border-2 font-lexend text-xs transition-all ${getBtnStyle(settings.textSize === size)}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-lexend font-bold text-sm">Font</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Lexend', label: 'Lexend' },
                    { id: 'OpenDyslexic', label: 'OpenDyslexic' },
                    { id: 'Comic', label: 'Comic Neue' },
                    { id: 'Sans', label: 'System Sans' },
                  ].map(f => (
                    <button 
                      key={f.id} 
                      onClick={() => setSettings(s => ({ ...s, fontFamily: f.id as any }))} 
                      className={`p-3 rounded-xl border-2 text-xs transition-all ${getBtnStyle(settings.fontFamily === f.id)} ${f.id === 'OpenDyslexic' ? 'font-opendyslexic' : f.id === 'Comic' ? 'font-comic' : ''}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-lexend font-bold text-lg px-2 flex items-center gap-2"><Volume2 size={20} className="text-[#5B4A8F]" /> Audio Settings</h3>
            <div className={`rounded-3xl p-6 space-y-8 ${cardClass} shadow-sm border-none`}>
              <div className="flex justify-between items-center">
                <p className="font-lexend font-bold text-sm">Voice Synthesis</p>
                <button onClick={() => setSettings(s => ({ ...s, audioOutput: !s.audioOutput }))} className={`w-14 h-8 rounded-full relative transition-colors ${settings.audioOutput ? 'bg-[#5B4A8F]' : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.audioOutput ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="font-lexend font-bold text-sm">Voice</p>
                  <button
                    onClick={async () => {
                      await triggerHaptic('light');
                      if (ttsService.isAvailable()) {
                        const testText = "Hello! This is how I sound. I can help you understand what people really mean.";
                        ttsService.speak(testText, { rate: settings.audioSpeed, voice: settings.voiceName });
                        showToast('Playing voice sample', 'info');
                      } else {
                        showToast('Text-to-Speech not available', 'error');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#5B4A8F]/10 text-[#5B4A8F] text-xs font-bold hover:bg-[#5B4A8F]/20 transition-all active:scale-95"
                  >
                    Test Voice
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {availableVoices.length === 0 ? (
                    <div className="text-xs opacity-50 text-center py-4">
                      Loading voices...
                    </div>
                  ) : (
                    availableVoices.slice(0, 10).map(voice => (
                      <button
                        key={voice.name}
                        onClick={async () => {
                          await triggerHaptic('light');
                          setSettings(s => ({ ...s, voiceName: voice.name }));
                        }}
                        className={`p-3 rounded-xl border-2 font-lexend text-xs transition-all text-left ${getBtnStyle(settings.voiceName === voice.name)}`}
                      >
                        <div className="font-bold">{voice.name}</div>
                        <div className="text-[10px] opacity-60">{voice.lang}</div>
                      </button>
                    ))
                  )}
                </div>
                <p className="text-[10px] opacity-50 italic">Note: Voice names are for reference. Actual voice depends on your device's available voices.</p>
              </div>

              <div className="space-y-3">
                <p className="font-lexend font-bold text-sm">Output Speed</p>
                <div className="grid grid-cols-4 gap-2">
                  {[0.75, 1.0, 1.25, 1.5].map(speed => (
                    <button 
                      key={speed} 
                      onClick={() => setSettings(s => ({ ...s, audioSpeed: speed }))} 
                      className={`p-3 rounded-xl border-2 font-lexend text-xs transition-all ${getBtnStyle(settings.audioSpeed === speed)}`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-lexend font-bold text-lg px-2 flex items-center gap-2"><HelpCircle size={20} className="text-[#5B4A8F]" /> Information</h3>
            <div className={`rounded-3xl p-6 space-y-3 ${cardClass} shadow-sm border-none`}>
              <button 
                onClick={() => { setLegalType('TOS'); setScreen('LEGAL'); }} 
                className="w-full flex justify-between items-center py-3 opacity-70 hover:opacity-100 transition-opacity"
              >
                <span className="font-lexend font-bold text-sm flex items-center gap-3"><FileText size={18} /> Terms of Service</span>
                <ChevronRight size={18} />
              </button>
              <div className="h-px bg-black/5 w-full" />
              <button 
                onClick={() => { setLegalType('PRIVACY'); setScreen('LEGAL'); }} 
                className="w-full flex justify-between items-center py-3 opacity-70 hover:opacity-100 transition-opacity"
              >
                <span className="font-lexend font-bold text-sm flex items-center gap-3"><Shield size={18} /> Privacy Policy</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </section>

          <section className="pt-4 pb-12">
            <button 
              onClick={() => { if(window.confirm("Clear all decoding history? This cannot be undone.")) setHistory([]); }}
              className="w-full h-14 text-red-500 font-lexend font-bold flex items-center justify-center gap-3 border border-red-100 rounded-2xl bg-white shadow-sm active:bg-red-50 transition-colors"
            >
              <Trash2 size={20} /> Clear Local Data
            </button>
          </section>
        </main>
      </div>
    );
  };

  return (
    <div className={`max-w-md mx-auto min-h-screen overflow-hidden transition-all duration-300 select-none relative ${themeClass} app-font-${settings.fontFamily} text-size-${settings.textSize}`}>
      {screen === 'WELCOME' && renderWelcome()}
      {screen === 'HOME' && renderHome()}
      {screen === 'LIBRARY' && renderLibrary()}
      {screen === 'COACH' && renderCoach()}
      {screen === 'HISTORY' && renderHistory()}
      {screen === 'SETTINGS' && renderSettings()}
      {screen === 'LEGAL' && renderLegal()}
      {screen === 'INPUT' && renderInput()}
      {screen === 'LOADING' && renderLoading()}
      {screen === 'RESULTS' && renderResults()}
      {screen === 'PAYWALL' && <Paywall onClose={() => setScreen('HOME')} onSubscribe={() => {}} darkMode={settings.darkMode} />}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          darkMode={settings.darkMode}
        />
      )}

      {/* Image Preview Modal */}
      {imagePreviewUrl && (
        <div
          className="fixed inset-0 z-[400] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setImagePreviewUrl(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img src={imagePreviewUrl} alt="Full preview" className="max-w-full max-h-[90vh] object-contain rounded-xl" />
            <button
              onClick={() => setImagePreviewUrl(null)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Add Library Item Modal */}
      {showAddLibraryModal && (
        <AddLibraryItemModal
          onClose={() => setShowAddLibraryModal(false)}
          onAdd={handleAddLibraryItem}
          darkMode={settings.darkMode}
        />
      )}
    </div>
  );
};

export default App;
