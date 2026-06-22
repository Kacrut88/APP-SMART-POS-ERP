import React, { useState } from "react";
import { FileSpreadsheet, Search, Filter, Calendar, Activity, Database, Sparkles } from "lucide-react";
import { Transaction } from "../types";

interface TransactionLedgerProps {
  transactions: Transaction[];
}

export default function TransactionLedger({ transactions }: TransactionLedgerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPayment, setFilterPayment] = useState("all");

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPayment = filterPayment === "all" || t.payment.toLowerCase() === filterPayment.toLowerCase();

    return matchesSearch && matchesPayment;
  });

  return (
    <div className="bg-[#0F1322] border-2 border-slate-800/80 rounded-3xl p-6 relative transition-all duration-300 hover:border-slate-700/90 neon-green-glow group flex flex-col justify-between">
      {/* Visual reference label to physical spreadsheet */}
      <div className="absolute top-3 right-5 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
        <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded">
          Jurnal Kas / Mutasi: Baris 44-54
        </span>
      </div>

      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#00FF87]/15 rounded-xl border border-[#00FF87]/25">
              <FileSpreadsheet className="w-5.5 h-5.5 text-[#00FF87]" />
            </div>
            <div>
              <h2 className="text-md font-bold tracking-tight text-white uppercase flex items-center gap-1.5">
                Jurnal Transaksi &amp; Kas
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">Real-time Financial Mutations</p>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari No Nota, ID, atau item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080B13] border border-slate-850 focus:border-[#00FF87] focus:outline-none rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-300"
            />
          </div>
          <div>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full bg-[#080B13] border border-slate-850 rounded-xl p-2 text-xs font-semibold focus:border-[#00FF87] focus:outline-none text-slate-300"
            >
              <option value="all">Saringan Bayar</option>
              <option value="tunai">Tunai</option>
              <option value="qris">QRIS</option>
              <option value="transfer">Transfer</option>
              <option value="debit">Debit</option>
            </select>
          </div>
        </div>

        {/* Transaction entries tabular layout */}
        <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
          {filteredTransactions.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
              <span className="text-4xl mb-2">📋</span>
              Belum ada mutasi keuangan tercatat yang cocok dengan pencarian.
            </div>
          ) : (
            filteredTransactions.map((t, index) => {
              // Calculate mapping cell number in the sheet
              // Sheet range is 44 to 54. 
              const mappedRow = 44 + (index % 11);
              return (
                <div 
                  key={t.id}
                  className="bg-[#080C14] border border-slate-850/80 hover:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all relative overflow-hidden"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-white bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg">
                        {t.id}
                      </span>
                      <span className="text-[9px] font-mono bg-cyan-950 text-[#00F0FF] border border-[#00F0FF]/25 px-1 rounded-sm">
                        BARIS {mappedRow}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {new Date(t.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                      <span className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.5 tracking-wider font-mono ${
                        t.payment === "QRIS" ? "bg-purple-950/40 text-purple-400 border border-purple-500/15" :
                        t.payment === "Tunai" ? "bg-emerald-950/40 text-[#00FF87] border border-[#00FF87]/15" :
                        "bg-cyan-950/40 text-cyan-400 border border-cyan-500/15"
                      }`}>
                        {t.payment}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed">
                      {t.desc}
                    </p>

                    <div className="mt-2 text-[10px] text-slate-505 font-mono flex items-center gap-2">
                      <span className="text-slate-500">Invoice Ref:</span>
                      <span className="text-slate-350 bg-[#0B0F19] px-1.5 py-0.5 rounded border border-slate-850">{t.invoice}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-none border-slate-900 pt-3.5 sm:pt-0">
                    <span className="text-[10px] font-bold text-slate-500 sm:hidden uppercase font-mono">Pemasukan (Debit)</span>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400 font-mono">Debit</div>
                      <div className="text-sm font-bold font-mono text-[#00FF87]">
                        +Rp {t.debit.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer statistics */}
      <div className="mt-4 pt-4 border-t border-slate-900">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-[#00FF87]" />
            Mencatat Kas Masuk / Debit Secara Otomatis
          </span>
          <span>Total Log: {transactions.length} baris</span>
        </div>
      </div>
    </div>
  );
}
