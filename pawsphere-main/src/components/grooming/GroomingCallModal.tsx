import React, { useState } from 'react';
import { X, Phone, Copy, Check, MessageCircle, Clock, MapPin, Sparkles } from 'lucide-react';
import { GroomingCenter } from '../../types/grooming';

interface GroomingCallModalProps {
  center: GroomingCenter | null;
  onClose: () => void;
}

export const GroomingCallModal: React.FC<GroomingCallModalProps> = ({
  center,
  onClose,
}) => {
  if (!center) return null;

  const [copied, setCopied] = useState(false);

  const cleanPhone = center.phone.replace(/\D/g, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(center.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Hi ${center.name}! I found your salon on PawSphere and would like to inquire about grooming appointments.`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0d172e] border border-cyan-500/30 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.25)] overflow-hidden p-6 text-center space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
          <Phone className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white">Call Grooming Studio</h3>
          <p className="text-xs text-slate-300 mt-1 font-semibold">{center.name}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{center.locality}, {center.city}</p>
        </div>

        {/* Phone display box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
            Direct Reception Line
          </span>
          <div className="text-lg font-black text-cyan-300 tracking-wide">
            {center.phone}
          </div>
          {center.alternatePhone && (
            <div className="text-xs text-slate-400">
              Alt: {center.alternatePhone}
            </div>
          )}

          <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{center.openingHours}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Direct Tel Link */}
          <a
            href={`tel:${center.phone.replace(/\s+/g, '')}`}
            className="w-full py-3 rounded-2xl font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all block"
          >
            <Phone className="w-4 h-4" />
            <span>Dial Now ({center.phone})</span>
          </a>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleCopy}
              className="py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center space-x-1.5 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copied ? 'Copied!' : 'Copy Number'}</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="py-2.5 rounded-xl font-bold text-xs bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 flex items-center justify-center space-x-1.5 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
