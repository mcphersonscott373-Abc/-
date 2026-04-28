/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import * as bip39 from 'bip39';
import { Buffer } from 'buffer';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  RefreshCw, 
  Copy, 
  Check, 
  Terminal, 
  Cpu, 
  Lock,
  ExternalLink,
  ChevronRight,
  Fingerprint
} from 'lucide-react';

// Polyfill Buffer for bip39
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}

interface MnemonicItem {
  id: string;
  phrase: string;
  timestamp: string;
}

export default function App() {
  const [mnemonics, setMnemonics] = useState<MnemonicItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [language, setLanguage] = useState<'english' | 'chinese_simplified'>('english');

  const generateBatch = useCallback(() => {
    setIsGenerating(true);
    
    // Artificial delay for "technical feel"
    setTimeout(() => {
      const newBatch: MnemonicItem[] = Array.from({ length: 24 }).map((_, i) => ({
        id: Math.random().toString(36).substring(2, 9),
        phrase: bip39.generateMnemonic(256, undefined, bip39.wordlists[language]), // 256 bits entropy = 24 words
        timestamp: new Date().toLocaleTimeString(),
      }));
      
      setMnemonics(newBatch);
      setIsGenerating(false);
    }, 1500);
  }, [language]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const copyAll = () => {
    const text = mnemonics.map(m => `Phrase ${mnemonics.indexOf(m) + 1}:\n${m.phrase}`).join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  useEffect(() => {
    // Initial generation on launch
    generateBatch();
  }, [generateBatch]);

  return (
    <div className="min-h-screen p-4 md:p-12 flex flex-col items-center justify-start gap-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="w-full flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-zinc-300 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#151619] rounded-lg flex items-center justify-center text-white shadow-lg">
            <Cpu size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase italic">Mnemonic Forge</h1>
            <div className="flex items-center gap-2">
              <span className="status-label">BIP-39 Standard</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase">System Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex bg-[#E6E6E6] border border-zinc-400 rounded-md p-0.5 overflow-hidden shadow-inner h-[34px]">
            <button
              onClick={() => setLanguage('english')}
              className={`px-3 py-1 text-xs font-bold uppercase rounded transition-all ${language === 'english' ? 'bg-[#151619] text-white shadow' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('chinese_simplified')}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${language === 'chinese_simplified' ? 'bg-[#151619] text-white shadow' : 'text-zinc-500 hover:text-zinc-800'}`}
            >
              中文
            </button>
          </div>
          <button 
            onClick={copyAll}
            disabled={mnemonics.length === 0}
            className="group flex items-center gap-2 px-4 py-2 border border-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-800 transition-all rounded-md text-xs font-bold uppercase"
          >
            {copiedAll ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copiedAll ? 'Copied All' : 'Copy Batch'}
          </button>
          <button 
            disabled={isGenerating}
            onClick={generateBatch}
            className="flex items-center gap-2 px-6 py-2 bg-[#151619] text-white hover:bg-zinc-800 transition-all rounded-md text-xs font-bold uppercase shadow-xl"
          >
            <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'Forging...' : 'Forge New Batch (24)'}
          </button>
        </div>
      </header>

      {/* Main Grid Section */}
      <main className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        <AnimatePresence mode="popLayout">
          {isGenerating ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full h-96 flex flex-col items-center justify-center gap-4 text-zinc-400"
            >
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-zinc-300 opacity-20" />
                <Lock size={48} className="relative z-10 text-zinc-700" />
              </div>
              <div className="flex flex-col items-center">
                <span className="status-label animate-pulse">Initializing entropy source...</span>
                <span className="text-[10px] opacity-50 mt-1 uppercase tracking-tighter">Sampling 256 bits of CSPRNG noise</span>
              </div>
            </motion.div>
          ) : (
            mnemonics.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="hardware-card flex flex-col gap-4 relative overflow-hidden group"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-zinc-700 transition-all group-hover:bg-emerald-500" />
                
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-[10px] font-bold">#{String(index + 1).padStart(2, '0')}</span>
                    <div className="px-1.5 py-0.5 rounded-sm bg-zinc-800 border border-zinc-700 text-[9px] text-[#8E9299] font-mono leading-none">
                      ID: {item.id}
                    </div>
                    <span className="text-[10px] text-zinc-600 font-mono">{item.timestamp}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(item.phrase, item.id)}
                    className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white"
                    title="Copy to clipboard"
                  >
                    {copiedId === item.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {item.phrase.split(' ').map((word, wordIdx) => (
                    <div key={wordIdx} className="mnemonic-word group/word flex items-center justify-between overflow-hidden">
                      <span className="text-[9px] text-zinc-600 mr-1 select-none font-bold">{(wordIdx + 1)}</span>
                      <span className="truncate flex-1 text-center group-hover/word:text-white transition-colors">{word}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Shield size={10} className="text-emerald-500/50" />
                    <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">Valid Checksum</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-10 group-hover:opacity-40 transition-opacity">
                    <Fingerprint size={10} />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Status Bar */}
      <footer className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-zinc-200 px-6 py-2 flex justify-between items-center z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group cursor-help">
            <Terminal size={12} className="text-zinc-400 group-hover:text-zinc-900 transition-colors" />
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight group-hover:text-zinc-900">System Console</span>
            <div className="absolute bottom-full left-6 mb-2 p-3 bg-[#151619] text-white rounded-lg shadow-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all text-[10px] w-64 border border-zinc-800">
              <p className="mb-2 text-emerald-400"># BIP-39 Specification</p>
              <p className="opacity-70 leading-relaxed">Generated using 256 bits of cryptographically secure entropy. The resulting 24-word phrase includes an 8-bit checksum for integrity verification. Compatible with all standard wallets (Ledger, Trezor, MetaMask, etc.)</p>
            </div>
          </div>
          <div className="hidden md:flex gap-4">
            <span className="text-[9px] text-zinc-400 uppercase tracking-tighter hover:text-zinc-900 cursor-help transition-colors border-l border-zinc-200 pl-4">Entropy: 256bit</span>
            <span className="text-[9px] text-zinc-400 uppercase tracking-tighter hover:text-zinc-900 cursor-help transition-colors border-l border-zinc-200 pl-4">PBKDF2 Iterations: 2048</span>
            <span className="text-[9px] text-zinc-400 uppercase tracking-tighter hover:text-zinc-900 cursor-help transition-colors border-l border-zinc-200 pl-4">HMAC-SHA512</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Security: High</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-1 h-3 bg-emerald-500 rounded-sm opacity-30" />
            ))}
          </div>
          <Lock size={12} className="text-zinc-300 ml-2" />
        </div>
      </footer>

      {/* Background Grid Pattern */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }} 
      />
    </div>
  );
}
