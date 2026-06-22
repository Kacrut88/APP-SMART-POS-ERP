import React, { useState } from "react";
import { Package, Search, Plus, Edit3, ArrowRight, Settings2, Save, Wifi } from "lucide-react";
import { Product } from "../types";

interface StockCatalogProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onUpdateCatalog: (productId: number, payload: Partial<Product>) => void;
  onAddNewProduct: (payload: Omit<Product, "id">) => void;
}

export default function StockCatalog({
  products,
  onAddToCart,
  onUpdateCatalog,
  onAddNewProduct
}: StockCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New product form states
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newStock, setNewStock] = useState(50);

  // Filter products by search term
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (p: Product) => {
    setEditingProduct({ ...p });
    setShowAddForm(false);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onUpdateCatalog(editingProduct.id, {
      name: editingProduct.name,
      price: editingProduct.price,
      stockIn: editingProduct.stockIn,
      stockOut: editingProduct.stockOut
    });
    setEditingProduct(null);
  };

  const handleAddNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    onAddNewProduct({
      name: newName,
      price: newPrice,
      stockIn: newStock,
      stockOut: 0
    });
    // Reset state
    setNewName("");
    setNewPrice(0);
    setNewStock(50);
    setShowAddForm(false);
  };

  return (
    <div className="bg-[#0F1322] border-2 border-slate-800/80 rounded-3xl p-6 relative transition-all duration-300 hover:border-slate-700/90 neon-cyan-glow group h-full flex flex-col justify-between">
      {/* Visual reference label to the physical spreadsheet */}
      <div className="absolute top-3 right-5 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity">
        <span className="text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded">
          Spreadsheet Master Stok: Baris 10-25
        </span>
      </div>

      <div>
        {/* Panel Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#00F0FF]/15 rounded-xl border border-[#00F0FF]/25">
              <Package className="w-5.5 h-5.5 text-[#00F0FF]" />
            </div>
            <div>
              <h2 className="text-md font-bold tracking-tight text-white uppercase flex items-center gap-1.5">
                Katalog &amp; Master Stok 
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">ERP Stock Automation Control</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingProduct(null);
            }}
            className="text-xs bg-slate-900 border border-slate-800 hover:border-[#00F0FF]/40 text-slate-300 hover:text-[#00F0FF] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Product Baru
          </button>
        </div>

        {/* Search input bar */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#080B13] border border-slate-850 focus:border-[#00F0FF] focus:outline-none rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-200"
          />
        </div>

        {/* Catalog grid scroll container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto mb-4 pr-1">
          {filteredProducts.map(p => {
            const currentStock = p.stockIn - p.stockOut;
            const isLowStock = currentStock < 10;
            return (
              <div 
                key={p.id}
                className="bg-[#080C14] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3.5 relative flex flex-col justify-between group/card transition-all"
              >
                <div>
                  <div className="flex justify-between items-start gap-1 pb-1">
                    <span className="text-[9px] font-mono text-cyan-500 bg-cyan-950/40 px-1.5 py-0.5 rounded">
                      Row {10 + p.id}
                    </span>
                    
                    {/* Stock level indicators */}
                    <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded leading-none ${
                      isLowStock 
                        ? 'bg-red-950 text-red-400 border border-red-500/15 animate-pulse' 
                        : 'bg-emerald-950 text-emerald-400'
                    }`}>
                      Stok: {currentStock} sisa
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white tracking-wide mt-1.5 line-clamp-1">{p.name}</h3>
                  <div className="text-[11px] font-mono font-bold text-[#00FF87] mt-1">
                    Rp {p.price.toLocaleString("id-ID")}
                  </div>

                  {/* Stock detail ledger breakdown */}
                  <div className="grid grid-cols-2 gap-1.5 mt-2 bg-slate-900/40 p-1.5 rounded-lg text-[9px] font-mono text-slate-400">
                    <div>Masuk: <span className="text-slate-200 font-semibold">{p.stockIn}</span></div>
                    <div>Keluar: <span className="text-amber-400 font-semibold">{p.stockOut}</span></div>
                  </div>
                </div>

                <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-slate-900">
                  {/* Edit catalog button */}
                  <button
                    onClick={() => startEdit(p)}
                    className="p-1 px-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition"
                    title="Edit detail harga & stok masuk"
                  >
                    <Edit3 className="w-3" /> Edit
                  </button>

                  {/* Add item to cashier invoice */}
                  <button
                    onClick={() => onAddToCart(p)}
                    disabled={currentStock <= 0}
                    className={`flex-1 p-1 px-2 text-[10px] font-bold tracking-wider rounded-lg cursor-pointer flex items-center justify-center gap-1 transition ${
                      currentStock <= 0 
                        ? 'bg-slate-950 border border-slate-900 text-slate-600 cursor-not-allowed'
                        : 'bg-[#00FF87]/10 hover:bg-[#00FF87]/25 text-[#00FF87] border border-[#00FF87]/30'
                    }`}
                  >
                    + BELI <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor & Add Forms (Bento context expansion) */}
      <div className="mt-auto border-t border-slate-800 pt-4">
        {editingProduct && (
          <form onSubmit={saveEdit} className="bg-slate-950 text-xs border border-cyan-500/25 p-4 rounded-xl relative">
            <span className="absolute -top-2 left-3 bg-[#0F1322] border border-cyan-500/20 text-[#00F0FF] text-[8px] px-1.5 py-0.5 rounded font-mono font-bold">
              EDIT PRODUK &amp; STOK SPREADSHEET (ID: {editingProduct.id})
            </span>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <div className="col-span-2">
                <label className="text-[9px] text-slate-500 font-bold block mb-0.5">NAMA BARANG</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-slate-920 border border-slate-800 text-white p-1 rounded font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-0.5">HARGA SATUAN (Rp)</label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  className="w-full bg-slate-930 border border-slate-800 text-white p-1 rounded font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-0.5">TOTAL STOK MASUK</label>
                <input
                  type="number"
                  value={editingProduct.stockIn}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stockIn: Number(e.target.value) })}
                  className="w-full bg-slate-930 border border-slate-800 text-white p-1 rounded font-mono"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-3">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-2 py-1 text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-[#00FF87] hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Simpan Update
              </button>
            </div>
          </form>
        )}

        {showAddForm && (
          <form onSubmit={handleAddNewProductSubmit} className="bg-slate-950 text-xs border border-indigo-500/25 p-4 rounded-xl relative">
            <span className="absolute -top-2 left-3 bg-[#0F1322] border border-indigo-500/20 text-[#00F0FF] text-[8px] px-1.5 py-0.5 rounded font-mono font-bold">
              TAMBAH BARANG BARU KE BARIS {10 + products.length}
            </span>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <div className="col-span-2">
                <label className="text-[9px] text-slate-500 font-bold block mb-0.5">NAMA BARANG</label>
                <input
                  type="text"
                  placeholder="Misal: Indomie Rendang Spesial"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-920 border border-slate-800 text-white p-1 rounded font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-0.5">HARGA JUAL (Rp)</label>
                <input
                  type="number"
                  placeholder="15000"
                  value={newPrice || ""}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full bg-slate-930 border border-slate-800 text-white p-1 rounded font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 font-bold block mb-0.5">STOK AWAL MASUK</label>
                <input
                  type="number"
                  placeholder="100"
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full bg-slate-930 border border-slate-800 text-white p-1 rounded font-mono"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-2 py-1 text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-[#00F0FF] hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1 rounded flex items-center gap-1 cursor-pointer"
              >
                Tambahkan
              </button>
            </div>
          </form>
        )}

        {/* Instruction footer */}
        {!editingProduct && !showAddForm && (
          <div className="flex items-center gap-2 text-[10px] text-slate-550 border border-slate-900 p-2.5 rounded-2xl bg-slate-950/20">
            <span className="text-[#00FF87]">✓</span>
            <span>Ubah stok masuk kapan pun; sisa stok dihitung otomatis: dan terekam di baris master spreadsheet.</span>
          </div>
        )}
      </div>
    </div>
  );
}
