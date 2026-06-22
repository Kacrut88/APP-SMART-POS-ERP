import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Database, 
  Layers, 
  Tv, 
  HelpCircle, 
  Terminal, 
  Info, 
  Sparkles, 
  Wifi, 
  CircleAlert, 
  CheckCircle,
  TrendingUp,
  Cpu,
  BadgeAlert
} from "lucide-react";

// Import types
import { Product, Transaction, CartItem } from "./types";

// Import components
import HeaderRadar from "./components/HeaderRadar";
import CashierBilling from "./components/CashierBilling";
import StockCatalog from "./components/StockCatalog";
import TransactionLedger from "./components/TransactionLedger";
import AnalyticsERP from "./components/AnalyticsERP";

export default function App() {
  // Database states
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [appsScriptUrl, setAppsScriptUrl] = useState("https://script.google.com/macros/s/AKfycbw4hq-LP5QcTag-HqJxjYDDgKxl-2meZF89juhC1zG5CjEhooVgf5TWK10_9C2DZm3g/exec");
  
  // App UX operational states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [invoiceId, setInvoiceId] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCheckoutPending, setIsCheckoutPending] = useState(false);
  const [latency, setLatency] = useState(25);
  const [lastSyncStatus, setLastSyncStatus] = useState<"connected" | "fallback" | null>(null);

  // Custom Glassmorphic Toast controller (Avoids window.alert violating iFrame guidelines!)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type, visible: true });
    // Auto collapse after 5 seconds
    setTimeout(() => {
      setToast(prev => prev ? { ...prev, visible: false } : null);
    }, 4500);
  };

  // 1. Core Loader - fetch data from Express server-side database
  const loadDatabase = async () => {
    setIsSyncing(true);
    const startTime = Date.now();
    try {
      const res = await fetch("/api/data");
      if (!res.ok) throw new Error("HTTP connection error to POS background driver");
      const data = await res.json();
      
      setProducts(data.products || []);
      setTransactions(data.transactions || []);
      if (data.config && data.config.appsScriptUrl) {
        setAppsScriptUrl(data.config.appsScriptUrl);
      }
      
      // Calculate real latency trace
      const computedLatency = Date.now() - startTime;
      setLatency(computedLatency < 10 ? 12 : computedLatency);
      setLastSyncStatus("connected");
      triggerToast("Sinkronisasi database Google Sheets berhasil dimuat!", "success");
    } catch (err) {
      console.warn("Express endpoint failed, loaded full local high-level fallback engine", err);
      setLastSyncStatus("fallback");
      setLatency(0);
      triggerToast("Kabel koneksi Google Sheets sibuk. Menjalankan POS dalam mode offline-first lokal.", "info");
      
      // Generate standard fallback states locally if server endpoint drops
      if (products.length === 0) {
        setProducts([
          { id: 1, name: "Kopi Susu Gula Aren", stockIn: 100, stockOut: 12, price: 18000 },
          { id: 2, name: "Teh Tarik Legit", stockIn: 80, stockOut: 8, price: 12000 },
          { id: 3, name: "Roti Bakar Cokelat Keju", stockIn: 50, stockOut: 15, price: 15000 },
          { id: 4, name: "Indomie Nyemek Pedas", stockIn: 120, stockOut: 45, price: 14000 },
          { id: 5, name: "Dimsum Siumay Ayam", stockIn: 60, stockOut: 20, price: 18000 },
          { id: 6, name: "Kentang Goreng Krispi", stockIn: 70, stockOut: 14, price: 13000 }
        ]);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Generate original invoice number INV-xxxxx on bootstrap
  const generateNewInvoice = async () => {
    setIsCheckoutPending(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      const data = await res.json();
      setInvoiceId(data.invoiceId);
      setCart([]);
    } catch (err) {
      // Offline fallback generator
      const randomInvoice = "INV-" + Math.floor(10000 + Math.random() * 90000);
      setInvoiceId(randomInvoice);
      setCart([]);
    } finally {
      setIsCheckoutPending(false);
    }
  };

  useEffect(() => {
    loadDatabase();
    generateNewInvoice();
  }, []);

  // 2. POS Interaction: Add Item to Active Cashier Note
  const handleAddToCart = (product: Product) => {
    const currentStock = product.stockIn - product.stockOut;
    if (currentStock <= 0) {
      triggerToast(`Stok ${product.name} telah habis! Selesaikan stok masuk di ERP terlebih dahulu.`, "error");
      return;
    }

    const existingCartIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingCartIndex > -1) {
      const currentQtyInCart = cart[existingCartIndex].qty;
      if (currentQtyInCart >= currentStock) {
        triggerToast(`Pesanan melebihi sisa stok di database master untuk ${product.name}!`, "error");
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingCartIndex].qty += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product, qty: 1 }]);
    }
    triggerToast(`Ditambahkan ke nota: ${product.name}`, "success");
  };

  // 3. POS Interaction: Modify Quantity
  const handleUpdateQty = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQty > (product.stockIn - product.stockOut)) {
      triggerToast(`Kuantitas melebihi batas stok tersedia untuk ${product.name}.`, "error");
      return;
    }

    const updatedCart = cart.map(item => {
      if (item.product.id === productId) {
        return { ...item, qty: newQty };
      }
      return item;
    });
    setCart(updatedCart);
  };

  // 4. POS Interaction: Delete Item from active Cart
  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
    triggerToast("Item dihapus dari keranjang.", "info");
  };

  // 5. Checkout Transaction Dispatcher (Simpan Transaksi)
  const handleCheckoutSubmit = async (paymentMethod: string, cashPaid: number) => {
    if (cart.length === 0) return;
    setIsCheckoutPending(true);

    const itemsPayload = cart.map(item => ({
      name: item.product.name,
      qty: item.qty,
      price: item.product.price
    }));

    try {
      const res = await fetch("/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoiceId,
          paymentMethod: paymentMethod,
          items: itemsPayload
        })
      });

      if (!res.ok) throw new Error("Gagal menyimpan transaksi");
      const data = await res.json();

      // Update state dynamically with response values
      if (data.transaction) {
        setTransactions(prev => [data.transaction, ...prev]);
      }
      if (data.localProducts) {
        setProducts(data.localProducts);
      }

      const syncStatusText = data.syncedWithSheet 
        ? "✨ Transaksi sukses disimpan &amp; sinkronisasi ke Google Sheets OK!" 
        : "✨ Transaksi disimpan di komputer lokal. Koneksi Google Sheets ditunda.";
      
      triggerToast(syncStatusText, "success");
      
      // Auto trigger resetting nota & generating a new Invoice card
      setTimeout(() => {
        generateNewInvoice();
      }, 1500);

    } catch (err) {
      console.error("Local checkout fallback execution triggered:", err);
      // Fallback local transaction logger
      const totalTrx = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0) * 1.11; // including tax
      const descStr = cart.map(i => `${i.product.name} (${i.qty}x)`).join(", ");
      
      const fallbackTrxId = "TRX-" + Math.floor(1000 + Math.random() * 9000);
      const fallbackTrx: Transaction = {
        id: fallbackTrxId,
        date: new Date().toISOString(),
        type: "Penjualan",
        desc: descStr,
        payment: paymentMethod || "Tunai",
        debit: Math.round(totalTrx),
        credit: 0,
        invoice: invoiceId
      };

      // Subtract stocks locally
      const updatedProducts = products.map(p => {
        const cartItem = cart.find(ci => ci.product.id === p.id);
        if (cartItem) {
          return { ...p, stockOut: p.stockOut + cartItem.qty };
        }
        return p;
      });

      setProducts(updatedProducts);
      setTransactions(prev => [fallbackTrx, ...prev]);
      triggerToast("✨ Transaksi Berhasil disimpan secara Lokal!", "success");
      
      setTimeout(() => {
        setCart([]);
        const nextInvoice = "INV-" + Math.floor(10000 + Math.random() * 90000);
        setInvoiceId(nextInvoice);
        setIsCheckoutPending(false);
      }, 1200);
    }
  };

  // 6. Manual Stock addition and catalogue updates
  const handleUpdateProductInCatalog = async (productId: number, payload: Partial<Product>) => {
    try {
      const res = await fetch("/api/stock/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...payload })
      });
      if (!res.ok) throw new Error("Gagal mengupdate stok");
      const data = await res.json();
      setProducts(data.products);
      triggerToast(`Katalog barang #${productId} berhasil disesuaikan!`, "success");
    } catch (err) {
      // Offline Local adjustments
      const updatedProducts = products.map(p => {
        if (p.id === productId) {
          return { ...p, ...payload };
        }
        return p;
      });
      setProducts(updatedProducts);
      triggerToast("Katalog barang disesuaikan secara lokal.", "success");
    }
  };

  const handleAddNewProductToCatalog = async (payload: Omit<Product, "id">) => {
    try {
      const res = await fetch("/api/stock/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Gagal menambah produk");
      const data = await res.json();
      setProducts(data.products);
      triggerToast(`Produk '${payload.name}' ditambahkan ke baris ${10 + data.products.length}!`, "success");
    } catch (err) {
      // Offline local addition
      const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
      const newProduct = { id: newId, ...payload };
      setProducts([...products, newProduct]);
      triggerToast(`Produk '${payload.name}' ditambahkan secara lokal.`, "success");
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-[#DFE5F2] pt-6 pb-20 px-4 md:px-8 font-sans selection:bg-[#00FF87]/30 selection:text-white">
      {/* Absolute Ambient Background Lights */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#00F0FF]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-[#BD00FF]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Modern Top Meta Header Dashboard Grid */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0F1322]/40 border border-slate-850 p-5 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl drop-shadow-[0_0_8px_#00FF87] animate-pulse">🚀</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#00F0FF] uppercase tracking-widest font-bold">UMKM Indonesia Merdeka</span>
              </div>
              <h1 className="text-xl font-black text-white tracking-widest uppercase">SMART POS &amp; ERP SPREADSHEET</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            {/* Connection Node Indicator badge */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border ${
              lastSyncStatus === "connected" 
                ? "bg-slate-900 border-[#00FF87]/30 text-[#00FF87]" 
                : "bg-slate-950 border-amber-500/20 text-amber-500"
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                lastSyncStatus === "connected" ? "bg-[#00FF87] animate-pulse" : "bg-amber-500"
              }`}></span>
              <span>
                {lastSyncStatus === "connected" 
                  ? `GAS API: STABLE (${latency}ms)` 
                  : "LOCAL SECURE DISCONNECTED FALLBACK"}
              </span>
            </div>

            {/* Current Timestamp */}
            <div className="px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
              📆 {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* BENTO GRID AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Card Slot 1: Header/Radar (Spans 4/12 width or col-span-4) */}
          <div className="lg:col-span-4 flex flex-col justify-stretch">
            <HeaderRadar 
              appsScriptUrl={appsScriptUrl}
              isSynced={lastSyncStatus === "connected"}
              isSyncing={isSyncing}
              onTestSync={loadDatabase}
              latency={latency}
            />
          </div>

          {/* Card Slot 2: Cashier POS Note (Spans 8/12 width or col-span-8) */}
          <div className="lg:col-span-8">
            <CashierBilling 
              cart={cart}
              invoiceId={invoiceId}
              onClearNota={generateNewInvoice}
              onRemoveFromCart={handleRemoveFromCart}
              onUpdateQty={handleUpdateQty}
              onSubmitCheckout={handleCheckoutSubmit}
              isCheckoutPending={isCheckoutPending}
            />
          </div>

          {/* Card Slot 3: Catalogue & Master Stock (col-span-6) */}
          <div className="lg:col-span-6">
            <StockCatalog 
              products={products}
              onAddToCart={handleAddToCart}
              onUpdateCatalog={handleUpdateProductInCatalog}
              onAddNewProduct={handleAddNewProductToCatalog}
            />
          </div>

          {/* Card Slot 4: Transactions Ledger Log (col-span-6) */}
          <div className="lg:col-span-6 col-span-1">
            <TransactionLedger 
              transactions={transactions}
            />
          </div>

          {/* Card Slot 5: ERP Telemetry Analytics Insights (col-span-12 FULL width footer grid) */}
          <div className="lg:col-span-12">
            <AnalyticsERP 
              products={products}
              transactions={transactions}
            />
          </div>

        </div>

        {/* Helpful Tips Section */}
        <div className="bg-[#080B13] border border-slate-850 p-6 rounded-3xl mt-6 flex flex-col md:flex-row gap-5 items-start">
          <div className="p-3 bg-[#00FF87]/10 rounded-2xl border border-[#00FF87]/20 mt-1">
            <Cpu className="w-6 h-6 text-[#00FF87]" />
          </div>
          <div>
            <h4 className="text-md font-bold text-white tracking-wide uppercase mb-1">Panduan Arsitektur Cloud Google Apps Script</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              App ini dirancang khusus untuk memenuhi arsitektur modern developer yang menginginkan database gratisan berskala tinggi tanpa kuota server yang memberatkan. Database bersandar di satu lembar Google Sheet yang sama, tersusun rapi menggunakan formula instan.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="font-bold text-[#00F0FF] block mb-1">💡 Cara Deploy Google Apps Script:</span>
                Buka Google Sheets &gt; Klik Menu <strong>Ekstensi</strong> &gt; Pilih <strong>Apps Script</strong> &gt; Tempel kode JavaScript bawaan dari user &gt; Klik Deploy sebagai Web App &gt; Setel akses user ke "Anyone".
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="font-bold text-[#00FF87] block mb-1">📶 Keandalan Jaringan (Robust Connection):</span>
                Sistem Express proxy kami memiliki penanganan pemutus sirkuit (circuited timeout fallback). Jika Google API lambat merespons, server secara otomatis mencatat pembukuan lokal terlebih dahulu tanpa menjeda antrian kasir merchant UMKM Anda.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CUSTOM GLASSMORPHIC TOAST ALERTS DRAW (Conforms to iframe constraints beautifully!) */}
      <AnimatePresence>
        {toast && toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 p-4.5 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3.5 max-w-sm bg-[#0E1322]/90 border-slate-800/90 text-left"
          >
            {toast.type === "success" && (
              <div className="p-1.5 bg-[#00FF87]/10 border border-[#00FF87]/20 rounded-xl text-[#00FF87]">
                <CheckCircle className="w-5 h-5 bg-transparent border-none" />
              </div>
            )}
            {toast.type === "error" && (
              <div className="p-1.5 bg-red-950/40 border border-red-500/25 rounded-xl text-red-400">
                <CircleAlert className="w-5 h-5 bg-transparent border-none" />
              </div>
            )}
            {toast.type === "info" && (
              <div className="p-1.5 bg-[#00F0FF]/10 border border-[#00F0FF]/25 rounded-xl text-[#00F0FF]">
                <Info className="w-5 h-5 bg-transparent border-none" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-white uppercase tracking-wide">Pemberitahuan POS &amp; ERP</h5>
              <p className="text-[11px] text-slate-300 leading-snug font-medium mt-0.5">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
