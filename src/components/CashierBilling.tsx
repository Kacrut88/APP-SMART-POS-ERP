import React, { useState, useEffect } from "react";
import { Trash2, CreditCard, Receipt, Database, Plus, Minus, CheckCircle, RefreshCcw, Wallet } from "lucide-react";
import { CartItem } from "../types";

interface CashierBillingProps {
  cart: CartItem[];
  invoiceId: string;
  onRemoveFromCart: (id: number) => void;
  onUpdateQty: (id: number, qty: number) => void;
  onSubmitCheckout: (paymentMethod: string, cashPaid: number) => void;
  onClearNota: () => void;
  isCheckoutPending: boolean;
}

export default function CashierBilling({
  cart,
  invoiceId,
  onRemoveFromCart,
  onUpdateQty,
  onSubmitCheckout,
  onClearNota,
  isCheckoutPending
}: CashierBillingProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("Tunai");
  const [cashPaid, setCashPaid] = useState<number>(0);
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);

  // Auto-calculate Subtotal
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const tax = Math.round(subtotal * 0.11); // Standard 11% PPN Indonesia
  const total = subtotal + tax;

  // Sync cash input shortcut if they press quick bills
  const handleQuickPay = (amt: number) => {
    if (amt === -1) {
      setCashPaid(total);
    } else {
      setCashPaid(amt);
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    onSubmitCheckout(paymentMethod, cashPaid);
  };

  const changeDue = cashPaid - total > 0 ? cashPaid - total : 0;

  // Reset local inputs when cart is emptied
  useEffect(() => {
    if (cart.length === 0) {
      setCashPaid(0);
    }
  }, [cart]);

  return (
    <div className="bg-[#0F1322] border-2 border-slate-800/80 rounded-3xl p-6 relative flex flex-col justify-between transition-all duration-300 hover:border-slate-700/95 neon-green-glow group">
      {/* Visual reference label pointing to physical spreadsheet rules */}
      <div className="absolute top-3 right-5 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
        <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded">
          Spreadsheet Input Row: B78-C85
        </span>
      </div>

      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#00FF87]/10 rounded-xl border border-[#00FF87]/20">
              <Receipt className="w-5.5 h-5.5 text-[#00FF87]" />
            </div>
            <div>
              <h2 className="text-md font-bold tracking-tight text-white uppercase">Nota Kasir Aktif</h2>
              <p className="text-[11px] text-slate-400 font-mono">Invoice Entry Station</p>
            </div>
          </div>

          <button
            onClick={onClearNota}
            className="text-xs bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/25 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-left"
            title="Kosongkan item & buat Invoice baru di Spreadsheet"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Reset Nota
          </button>
        </div>

        {/* Invoice ID & Payment Method Details (Sheet-Mapped B78 & B80) */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-[#080B13] border border-slate-800/60 rounded-xl relative">
            <span className="absolute -top-1.5 left-3 text-[8px] px-1 bg-[#0F1322] font-mono text-cyan-400">SEL B78 - NO INVOICE</span>
            <div className="text-xs text-slate-500 font-semibold mb-1">Nomor Nota</div>
            <div className="text-sm font-mono font-bold text-white tracking-wider flex items-center gap-1.5">
              <span className="text-xs text-[#00F0FF]">🎫</span> {invoiceId}
            </div>
          </div>

          <div className="p-3 bg-[#080B13] border border-slate-800/60 rounded-xl relative">
            <span className="absolute -top-1.5 left-3 text-[8px] px-1 bg-[#0F1322] font-mono text-cyan-400">SEL B80 - METODE</span>
            <div className="text-xs text-slate-500 font-semibold mb-1">Metode Bayar</div>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="text-xs bg-transparent text-white border-none focus:ring-0 font-bold font-mono tracking-wider w-full select-none"
            >
              <option value="Tunai" className="bg-[#080B13]">🟢 Tunai (Cash)</option>
              <option value="QRIS" className="bg-[#080B13]">📱 QRIS (Gopay/OVO/Dana)</option>
              <option value="Transfer" className="bg-[#080B13]">🏦 Transfer BANK (BCA/Mandiri)</option>
              <option value="Debit" className="bg-[#080B13]">💳 Debit / Kredit Card</option>
            </select>
          </div>
        </div>

        {/* Cart Item Slots A83:C85 (Sheet supports maximum 3 items, we can handle dynamic cart and show spreadsheet boundary box) */}
        <div className="bg-[#080C14] border border-slate-800/80 rounded-2xl p-4.5 mb-4 max-h-[220px] overflow-y-auto">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1">
              <span>🛒</span> LANSA BELANJAAN (Max 3 Items on Sheet)
            </span>
            <span className="text-[9px] font-mono text-[#00FF87]/85 bg-[#00FF87]/10 px-1 py-0.5 rounded border border-[#00FF87]/25">
              Baris A83 - C85
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="text-3xl mb-2 opacity-35 animate-bounce">☕</div>
              <p className="text-xs text-slate-500 max-w-[200px]">Keranjang masih kosong. Klik menu barang di sebelah kanan untuk menambahkan belanjaan.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item, index) => {
                const isOverSheetLimit = index >= 3;
                return (
                  <div 
                    key={item.product.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isOverSheetLimit 
                        ? 'bg-amber-950/25 border-amber-500/25' 
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-mono font-bold">A{83 + index}</span>
                        <p className="text-xs font-semibold text-white truncate">{item.product.name}</p>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400">
                        Rp {item.product.price.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Qty Adjustment */}
                      <div className="flex items-center bg-[#080B13] border border-slate-800 rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQty(item.product.id, item.qty - 1)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        >
                          <Minus className="w-3" />
                        </button>
                        <span className="text-xs font-bold font-mono text-white px-2.5 min-w-[20px] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => onUpdateQty(item.product.id, item.qty + 1)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        >
                          <Plus className="w-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveFromCart(item.product.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {cart.length > 3 && (
                <div className="p-2 rounded-lg bg-amber-900/20 border border-amber-500/30 text-[10px] text-amber-300">
                  ⚠️ <strong>Info Spreadsheet:</strong> Apps Script hanya mencatat 3 item teratas (Baris 83-85) di nota fisik, namun sistem backend POS ini akan menghitung penuh seluruh akumulasi di total kas Anda.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bill summary and checkout drawer */}
      <div className="mt-auto border-t border-slate-800/90 pt-4">
        {/* Calculation Summary */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Subtotal Belanja</span>
            <span className="font-mono">Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-medium pb-2">
            <span>PPN (11% otomatis)</span>
            <span className="font-mono">Rp {tax.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-center border-t border-dashed border-slate-800 pt-2 pb-0.5">
            <span className="text-sm font-bold text-white tracking-wide uppercase">TOTAL PEMBAYARAN</span>
            <span className="text-lg font-bold font-mono text-[#00FF87] animate-pulse">
              Rp {total.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Change Calculator for Tunai (Cash) */}
        {paymentMethod === "Tunai" && total > 0 && (
          <div className="bg-[#060D12] border border-[#00F0FF]/15 p-3 rounded-xl mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-[#00F0FF] font-mono tracking-wider flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" /> Kembalian Kalkulator
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-[9px] text-slate-500 block font-bold mb-1">TUNAI DITERIMA (Rp)</label>
                <input
                  type="number"
                  value={cashPaid || ""}
                  onChange={(e) => setCashPaid(Number(e.target.value))}
                  placeholder="Jumlah uang"
                  className="w-full bg-[#03060C] font-mono text-white text-xs border border-slate-800 rounded-lg p-1.5 focus:border-[#00F0FF] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 block font-bold mb-1">UANG KEMBALI</label>
                <div className="font-mono font-bold text-xs text-[#00FF87] p-1.5 bg-[#03060C] border border-slate-800 rounded-lg">
                  {cashPaid - total <= 0 ? "Rp 0" : `Rp ${(cashPaid - total).toLocaleString("id-ID")}`}
                </div>
              </div>
            </div>

            {/* Quick cash received shortcuts */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => handleQuickPay(-1)}
                className="bg-slate-900 hover:bg-slate-800 text-[9px] font-bold py-1 px-2 border border-slate-800 text-slate-300 rounded cursor-pointer transition-all"
              >
                Uang Pas
              </button>
              {[20000, 50000, 100000].map(amt => (
                <button
                  key={amt}
                  onClick={() => handleQuickPay(amt)}
                  className="bg-slate-900 hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/45 text-[9px] font-bold py-1 px-2 border border-slate-800 text-slate-300 rounded cursor-pointer transition-all"
                >
                  Rp {amt.toLocaleString("id-ID")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Big Glow Proceed Button or loading */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || isCheckoutPending || (paymentMethod === "Tunai" && cashPaid < total && cashPaid !== 0)}
          className={`w-full text-center font-bold tracking-widest text-xs py-3.5 rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 ${
            cart.length === 0
              ? 'bg-slate-900 border border-slate-800 text-slate-500'
              : 'bg-gradient-to-r from-[#00FF87] to-[#00F0FF] text-black hover:scale-[1.02] neon-green-glow active:scale-[0.98]'
          }`}
        >
          {isCheckoutPending ? (
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce delay-200"></span>
              OTOMASI EXCEL MENYIMPAN...
            </span>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 bg-transparent border-none text-black animate-pulse" />
              1. SELESAIKAN &amp; SIMPAN TRANSAKSI
            </>
          )}
        </button>

        {paymentMethod === "Tunai" && cashPaid < total && cashPaid > 0 && (
          <p className="text-[10px] text-center text-red-400 font-semibold mt-2">
            ⚠️ Uang tunai yang dibayarkan kurang dari total nota belanja!
          </p>
        )}
      </div>
    </div>
  );
}
