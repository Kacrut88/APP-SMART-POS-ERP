import React, { useState } from "react";
import { Link2, Sparkles, RefreshCw, Layers, Database, Wifi, Check, Copy } from "lucide-react";

interface HeaderRadarProps {
  appsScriptUrl: string;
  isSynced: boolean;
  isSyncing: boolean;
  onTestSync: () => void;
  latency: number;
}

export default function HeaderRadar({
  appsScriptUrl,
  isSynced,
  isSyncing,
  onTestSync,
  latency
}: HeaderRadarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appsScriptUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0F1322] border-2 border-slate-800/80 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-slate-700/90 neon-cyan-glow group h-full">
      {/* Background neon grid ambient line */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/5 rounded-full blur-3xl group-hover:bg-[#00F0FF]/10 transition-all duration-500"></div>
      
      <div>
        {/* Title row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#00F0FF]/10 rounded-xl border border-[#00F0FF]/25">
            <Layers className="w-6 h-6 text-[#00F0FF]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SMART POS & ERP
              <span className="text-[10px] bg-gradient-to-r from-[#BD00FF] to-[#00F0FF] text-white px-2 py-0.5 rounded font-extrabold uppercase tracking-widest leading-none">
                Enterprise
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Sistem Otomasi Kasir & Stok para UMKM Indonesia</p>
          </div>
        </div>

        {/* Divider line under title */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#00F0FF]/30 via-slate-800 to-transparent my-4"></div>

        {/* Database Architecture Visual Indicator */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 bg-[#080B13] border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">FRONTEND LAYER</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-ping"></span>
              <span className="text-xs text-slate-300 font-mono font-medium">React SPA + Vite</span>
            </div>
          </div>
          <div className="p-3 bg-[#080B13] border border-slate-805 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">DATABASE DRIVER</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00FF87] rounded-full animate-pulse"></span>
              <span className="text-xs text-slate-300 font-mono font-medium">Google Apps Script</span>
            </div>
          </div>
        </div>

        {/* Radar Telemetry Box */}
        <div className="rounded-2xl p-4 bg-[#08101C] border border-slate-800/80 mb-5 relative group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute inline-flex h-3 w-3 rounded-full bg-[#00FF87] opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00FF87]"></span>
              </div>
              <span className="text-xs font-semibold text-[#00FF87] font-mono tracking-wider">SHEET LINK STABLE</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 uppercase bg-slate-900 px-2 py-0.5 rounded">
              Ping: <span className="text-[#00F0FF] font-medium">{latency}ms</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 break-all bg-[#04060B] p-2.5 rounded-lg border border-slate-900 mb-3 flex items-center justify-between gap-2 overflow-hidden">
            <span className="truncate text-slate-400 text-left w-[85%]">{appsScriptUrl}</span>
            <button 
              onClick={handleCopyLink}
              title="Copy link"
              className="p-1 hover:bg-slate-800 rounded text-[#00F0FF] hover:text-[#00FF87] transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00FF87]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Data disinkronisasikan langsung ke Google Spreadsheet baris <span className="text-[#00FFFF] font-semibold">10-25</span> (Stok) &amp; <span className="text-[#00FFFF] font-semibold">44-54</span> (Jurnal).
          </p>
        </div>
      </div>

      {/* Sync State Button and Indicator */}
      <div className="mt-2">
        <button
          onClick={onTestSync}
          disabled={isSyncing}
          className="w-full bg-[#0E1527] border border-slate-700/80 hover:border-[#00FF87]/50 hover:bg-[#00FF87]/5 text-white py-2.5 rounded-xl text-xs font-semibold tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-[#00FF87] ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Menghubungi Apps Script..." : "TES KONEKSI SPREADSHEET"}
        </button>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
          <span>GAS API v2.4.0</span>
          <span className="flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-[#00FF87]" />
            HTTPS Secure Status OK
          </span>
        </div>
      </div>
    </div>
  );
}
