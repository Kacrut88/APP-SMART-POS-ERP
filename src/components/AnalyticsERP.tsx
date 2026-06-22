import React, { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, AlertTriangle, Layers, Grid2x2, HelpCircle } from "lucide-react";
import { Product, Transaction } from "../types";

interface AnalyticsERPProps {
  products: Product[];
  transactions: Transaction[];
}

export default function AnalyticsERP({ products, transactions }: AnalyticsERPProps) {
  const [activeTab, setActiveTab] = useState<"performance" | "cellMap">("performance");

  // Sum all debits for total revenue
  const totalRevenue = transactions.reduce((sum, t) => sum + t.debit, 0);
  
  // Calculate average transaction ticket
  const avgTicket = transactions.length > 0 ? Math.round(totalRevenue / transactions.length) : 0;

  // Count items below critical stock of 15
  const lowStockProductsCount = products.filter(p => (p.stockIn - p.stockOut) < 15).length;

  // Generate dynamic coordinate path for the glowing SVG chart
  // We'll map the transaction history to clean points
  // Pad with safe fallback entries if transaction count is low
  const chartData = transactions.slice(0, 7).reverse();
  const maxVal = chartData.length > 0 ? Math.max(...chartData.map(t => t.debit)) : 100000;
  const paddingFactor = maxVal * 0.15;
  const graphMax = maxVal + paddingFactor;

  // Render responsive coordinates inside a 500x120 viewBox
  const points = chartData.map((t, idx) => {
    if (chartData.length <= 1) return { x: 250, y: 60 };
    const x = 30 + (idx / (chartData.length - 1)) * 440;
    // inverted y-coordinates (0 is top, 120 is bottom)
    const y = 100 - (t.debit / graphMax) * 80;
    return { x, y, label: t.id, val: t.debit };
  });

  const linePath = points.length > 1 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : "";

  const areaPath = points.length > 1
    ? `${linePath} L ${points[points.length - 1].x} 110 L ${points[0].x} 110 Z`
    : "";

  return (
    <div className="bg-[#0F1322] border-2 border-slate-800/80 rounded-3xl p-6 relative transition-all duration-300 hover:border-slate-700/90 neon-cyan-glow group">
      {/* Background neon accent glows */}
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#BD00FF]/5 rounded-full blur-3xl"></div>

      {/* Tabs Control */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#BD00FF]/15 rounded-xl border border-[#BD00FF]/25">
            <BarChart3 className="w-5.5 h-5.5 text-[#BD00FF]" />
          </div>
          <div>
            <h2 className="text-md font-bold tracking-tight text-white uppercase">ERP Telemetry &amp; Insights</h2>
            <p className="text-[11px] text-slate-400 font-mono">Business Intelligence Monitor</p>
          </div>
        </div>

        <div className="flex gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-900">
          <button
            onClick={() => setActiveTab("performance")}
            className={`px-3 py-1 text-xs font-semibold tracking-wide rounded-lg cursor-pointer transition-all ${
              activeTab === "performance"
                ? "bg-slate-900 text-[#00F0FF] shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sektor Keuangan
          </button>
          <button
            onClick={() => setActiveTab("cellMap")}
            className={`px-3 py-1 text-xs font-semibold tracking-wide rounded-lg cursor-pointer transition-all ${
              activeTab === "cellMap"
                ? "bg-slate-900 text-[#00FF87] shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Peta Sel Google Sheet
          </button>
        </div>
      </div>

      {activeTab === "performance" ? (
        <div className="space-y-6">
          {/* Top level counts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Omzet Box */}
            <div className="p-4 bg-[#080B13] border border-slate-800/80 rounded-2xl relative overflow-hidden group/tile">
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#00FF87] rounded-full animate-pulse"></div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">TOTAL PENDAPATAN (OMZET)</span>
              <span className="text-lg font-bold font-mono text-[#00FF87] block tracking-tight">
                Rp {totalRevenue.toLocaleString("id-ID")}
              </span>
              <div className="text-[9px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                <span className="text-[#00FF87] font-semibold flex items-center gap-0.5"><TrendingUp className="w-3" /> +15.4%</span> vs periode kemarin
              </div>
            </div>

            {/* Average Ticket Box */}
            <div className="p-4 bg-[#080B13] border border-slate-800/80 rounded-2xl relative overflow-hidden group/tile">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">RATA-RATA NOTA BELANJA</span>
              <span className="text-lg font-bold font-mono text-cyan-400 block tracking-tight">
                Rp {avgTicket.toLocaleString("id-ID")}
              </span>
              <p className="text-[9px] text-slate-400 mt-1">
                Akumulasi perbandingan dari total <span className="text-slate-350 font-semibold">{transactions.length} transaksi</span>
              </p>
            </div>

            {/* Critical Stock Box */}
            <div className="p-4 bg-[#080B13] border border-slate-800/80 rounded-2xl relative overflow-hidden group/tile">
              {lowStockProductsCount > 0 && (
                <div className="absolute top-2 right-2 p-1 bg-red-950/40 rounded border border-red-500/20 text-red-500 animate-bounce">
                  <AlertTriangle className="w-3 h-3" />
                </div>
              )}
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">PRODUK STOK DEKAT KRITIS</span>
              <span className={`text-lg font-bold font-mono block tracking-tight ${lowStockProductsCount > 0 ? "text-amber-400" : "text-[#00FF87]"}`}>
                {lowStockProductsCount} item
              </span>
              <p className="text-[9px] text-slate-400 mt-1 font-mono">
                {lowStockProductsCount > 0 ? "Sisa stok di bawah batas minimal 15 pcs!" : "Seluruh persediaan stok aman melimpah!"}
              </p>
            </div>
          </div>

          {/* Interactive Custom Line Area Graph */}
          <div className="bg-[#080B13] border border-slate-850 rounded-2xl p-4.5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-200 tracking-wide uppercase">KURVA TRANSAKSI SEBELUMNYA</h3>
                <p className="text-[10px] text-slate-500 font-mono">Hourly Kas Masuk Telemetry Graph</p>
              </div>
              <div className="flex gap-2 items-center text-[10px] text-slate-400 font-mono">
                <span className="w-2.5 h-2.5 bg-[#00FF87] rounded-sm block"></span>
                <span>Aliran Debit</span>
              </div>
            </div>

            {chartData.length < 2 ? (
              <div className="py-12 text-center text-xs text-slate-500 font-mono">
                Sedang mengumpulkan titik data ... Simpan minimal 2 transaksi untuk menggambar kurva kas.
              </div>
            ) : (
              <div className="relative">
                {/* SVG glowing canvas */}
                <svg className="w-full h-32 overflow-visible bg-transparent font-mono" viewBox="0 0 500 120" preserveAspectRatio="none">
                  {/* Subtle Grid Lines */}
                  <line x1="30" y1="10" x2="470" y2="10" stroke="#121624" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="30" y1="60" x2="470" y2="60" stroke="#121624" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="30" y1="100" x2="470" y2="100" stroke="#121624" />

                  {/* Gradient Fill */}
                  <defs>
                    <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00FF87" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#00FF87" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Shaded Area */}
                  <path d={areaPath} fill="url(#neonGradient)" />

                  {/* Drawing Glowing Path Line */}
                  <path d={linePath} fill="none" stroke="#00FF87" strokeWidth="2.5" className="neon-green-glow" />

                  {/* Tooltip Data Dots & labels */}
                  {points.map((p, i) => (
                    <g key={i} className="group/dot">
                      <circle cx={p.x} cy={p.y} r="4" fill="#080B13" stroke="#00F0FF" strokeWidth="2" className="cursor-pointer" />
                      <circle cx={p.x} cy={p.y} r="8" fill="#00FF87" opacity="0" className="hover:opacity-30 transition-opacity cursor-pointer" />
                      
                      {/* Price Label above dots */}
                      <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#00FF87" fontSize="9" fontWeight="bold">
                        {p.val > 1000 ? `${Math.round(p.val / 1000)}k` : p.val}
                      </text>

                      {/* Trx tag below */}
                      <text x={p.x} y="115" textAnchor="middle" fill="#5F6D82" fontSize="7.5" fontWeight="semibold">
                        {p.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Cell Mapper: This simulates exactly how cells inside the real Google Sheet correspond to React UI action */
        <div className="space-y-4">
          <div className="bg-[#080B13] border border-slate-850 rounded-2xl p-4.5 relative">
            <h3 className="text-xs font-bold text-slate-200 tracking-wide uppercase mb-1">Visualisasi Blueprint Tabel Google Sheet</h3>
            <p className="text-[10px] text-slate-550 font-mono mb-4">Sumbu Alokasi Memori Sel Excel</p>

            {/* Matrix Simulation Grid resembling an spreadsheet */}
            <div className="border border-slate-900 rounded-xl overflow-hidden font-mono text-[10px]">
              {/* Spreadsheet headers */}
              <div className="grid grid-cols-10 bg-slate-950 border-b border-slate-900 text-slate-500 font-bold p-1 text-center">
                <div className="bg-slate-900 text-[8px] rounded flex items-center justify-center">GRID</div>
                <div>A</div>
                <div>B</div>
                <div>C</div>
                <div>D</div>
                <div>E</div>
                <div>F</div>
                <div>G</div>
                <div>H</div>
                <div className="text-left pl-2">Keterangan / Fungsi Pemrograman GAS</div>
              </div>

              {/* Range: Baris 10-25 (Master Stok) */}
              <div className="grid grid-cols-10 bg-indigo-950/20 border-b border-indigo-950/40 p-1 text-center items-center text-slate-350 hover:bg-indigo-950/30 transition-all">
                <div className="bg-[#04060C] text-[8px] text-indigo-400 p-0.5 rounded font-bold">10 - 25</div>
                <div className="text-slate-500">ID</div>
                <div className="text-indigo-400 font-bold">Nama</div>
                <div className="text-slate-500">Harga</div>
                <div className="text-slate-500">Masuk</div>
                <div className="text-indigo-400 font-bold bg-indigo-500/10 rounded">Keluar</div>
                <div className="text-slate-500">Sisa</div>
                <div className="text-slate-600">-</div>
                <div className="text-slate-600">-</div>
                <div className="col-span-1 text-left pl-2 text-[9px] text-[#00F0FF] font-bold">Master Stok (Nama Barang, Kurangi Stok Keluar Kolom E)</div>
              </div>

              {/* Range: Baris 44-54 (Jurnal Transaksi) */}
              <div className="grid grid-cols-10 bg-emerald-950/20 border-b border-emerald-950/40 p-1 text-center items-center text-slate-350 hover:bg-emerald-950/30 transition-all">
                <div className="bg-[#04060C] text-[8px] text-emerald-400 p-0.5 rounded font-bold">44 - 54</div>
                <div className="text-emerald-400 font-bold">TRXID</div>
                <div className="text-slate-500">Tgl</div>
                <div className="text-slate-500">Tipe</div>
                <div className="text-slate-500">Item</div>
                <div className="text-slate-500">Metode</div>
                <div className="text-emerald-400 font-bold bg-[#00FF87]/10 rounded">Debit</div>
                <div className="text-slate-600">Kredit</div>
                <div className="text-[#00F0FF] font-medium">NotaID</div>
                <div className="col-span-1 text-left pl-2 text-[9px] text-[#00FF87] font-bold">Jurnal mutasi kas masuk (+Debit hasil jual kasir)</div>
              </div>

              {/* Cell B78 (No Invoice) */}
              <div className="grid grid-cols-10 bg-[#0B1527] border-b border-cyan-950/40 p-1 text-center items-center text-slate-350 hover:bg-slate-900 transition-all">
                <div className="bg-[#04060C] text-[8px] text-[#00F0FF] p-0.5 rounded font-bold">78</div>
                <span className="text-slate-600">-</span>
                <span className="text-[#00F0FF] font-bold bg-[#00F0FF]/10 rounded">INV-ID</span>
                <span className="text-slate-600">-</span>
                <span className="text-slate-600">-</span>
                <span className="text-slate-600">-</span>
                <span className="text-slate-600">-</span>
                <span className="text-slate-600">-</span>
                <span className="text-slate-600">-</span>
                <div className="col-span-1 text-left pl-2 text-[9px] text-[#00F0FF] font-bold">Sel input Nomor Invoice / No Nota Belanja</div>
              </div>

              {/* Cell B80 (Metode Pembayaran) */}
              <div className="grid grid-cols-10 bg-[#0B1527] border-b border-cyan-950/40 p-1 text-center items-center text-slate-350 hover:bg-slate-900 transition-all">
                <div className="bg-[#04060C] text-[8px] text-[#00F0FF] p-0.5 rounded font-bold">80</div>
                <span className="text-slate-600">-</span>
                <span className="text-white font-bold bg-[#CD00FF]/15 rounded">METODE</span>
                <span className="text-slate-600">-</span>
                <span className="text-slate-600">-</span>
                <span className="text-slate-600">-</span>
                <span className="text-slate-600">-</span>
                <span className="text-slate-600">-</span>
                <span className="text-slate-600">-</span>
                <div className="col-span-1 text-left pl-2 text-[9px] text-slate-300 font-bold">Sel input metode pembayaran (QRIS / Tunai / Debit)</div>
              </div>

              {/* Range A83-C85 (Nota Belanja Kasir) */}
              <div className="grid grid-cols-10 bg-amber-950/15 p-1 text-center items-center text-slate-350 hover:bg-amber-950/20 transition-all">
                <div className="bg-[#04060C] text-[8px] text-amber-500 p-0.5 rounded font-bold">83 - 85</div>
                <div className="text-amber-400 font-bold">Barang</div>
                <div className="text-amber-400 font-bold">Qty</div>
                <div className="text-amber-400 font-bold">Harga</div>
                <span className="text-slate-600">-</span>
                <span className="text-slate-600">-</span>
                <span className="text-slate-600">-</span>
                <span className="text-slate-600">-</span>
                <span className="text-slate-600">-</span>
                <div className="col-span-1 text-left pl-2 text-[9px] text-amber-400 font-bold">Isian item belanja pembeli (Maksimal 3 item simultan)</div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#0C1222] rounded-xl border border-dashed border-[#00F0FF]/25 flex items-center gap-3">
            <span className="text-xl">💡</span>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              <strong>Database Bebas Biaya (Google Sheets):</strong> Saat tombol <strong>"SELESAIKAN &amp; SIMPAN"</strong> ditekan di POS, server Express memformat data and mengirimkan POST ke Web App Apps Script, memotong sisa stok di Baris 10-25 secara instan dan memasukkannya sebagai baris mutasi kas baru di Baris 44-54.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
