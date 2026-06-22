import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory mock DB to serve as a high-fidelity local fallback and state manager.
// This matches standard Google Sheets data structures mapped in the formula
// Row 10-25: Master Stok
// Row 44-54: Jurnal Transaksi (Logs)
let products = [
  { id: 1, name: "Kopi Susu Gula Aren", stockIn: 100, stockOut: 12, price: 18000 },
  { id: 2, name: "Teh Tarik Legit", stockIn: 80, stockOut: 8, price: 12000 },
  { id: 3, name: "Roti Bakar Cokelat Keju", stockIn: 50, stockOut: 15, price: 15000 },
  { id: 4, name: "Indomie Nyemek Pedas", stockIn: 120, stockOut: 45, price: 14000 },
  { id: 5, name: "Dimsum Siumay Ayam", stockIn: 60, stockOut: 20, price: 18000 },
  { id: 6, name: "Kentang Goreng Krispi", stockIn: 70, stockOut: 14, price: 13000 },
  { id: 7, name: "Croissant Original", stockIn: 40, stockOut: 5, price: 22000 },
  { id: 8, name: "Spaghetti Carbonara", stockIn: 30, stockOut: 6, price: 25000 }
];

let transactions = [
  { id: "TRX-4821", date: new Date(Date.now() - 3 * 3600000).toISOString(), type: "Penjualan", desc: "Indomie Nyemek Pedas (3x), Teh Tarik Legit (2x)", payment: "QRIS", debit: 66000, credit: 0, invoice: "INV-43781" },
  { id: "TRX-8319", date: new Date(Date.now() - 2 * 3600000).toISOString(), type: "Penjualan", desc: "Kopi Susu Gula Aren (2x), Croissant Original (1x)", payment: "Tunai", debit: 58000, credit: 0, invoice: "INV-92144" },
  { id: "TRX-1024", date: new Date(Date.now() - 30 * 60000).toISOString(), type: "Penjualan", desc: "Dimsum Siumay Ayam (4x), Roti Bakar Cokelat Keju (1x)", payment: "Tunai", debit: 87000, credit: 0, invoice: "INV-55263" }
];

// Target App Script Google Sheet URL
const GOOGLE_SHEET_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw4hq-LP5QcTag-HqJxjYDDgKxl-2meZF89juhC1zG5CjEhooVgf5TWK10_9C2DZm3g/exec";

// 1. API: Get Data (Master Stok & Jurnal Transaksi)
app.get("/api/data", (req, res) => {
  res.json({
    status: "success",
    products,
    transactions,
    config: {
      appsScriptUrl: GOOGLE_SHEET_APPS_SCRIPT_URL
    }
  });
});

// 2. API: Reset Nota (Triggers Reset on App Script and Local state clear)
app.post("/api/reset", async (req, res) => {
  const newInvoiceId = "INV-" + Math.floor(10000 + Math.random() * 90000);
  
  try {
    // Attempt webhook or POST call to trigger spreadsheet operation
    const externalResponse = await fetch(GOOGLE_SHEET_APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resetNota", invoiceId: newInvoiceId }),
      signal: AbortSignal.timeout(5000) // 5 seconds timeout to stay robust
    }).then(r => r.json()).catch(() => null);

    res.json({
      status: "success",
      invoiceId: newInvoiceId,
      syncedWithSheet: !!externalResponse,
      sheetResponse: externalResponse
    });
  } catch (err) {
    res.json({
      status: "success",
      invoiceId: newInvoiceId,
      syncedWithSheet: false,
      error: "Google Apps Script unreachable, running robustly in local-first database mode"
    });
  }
});

// 3. API: Save Transaction (Simpan Transaksi)
app.post("/api/transaction", async (req, res) => {
  const { invoiceId, paymentMethod, items } = req.body;

  if (!invoiceId || !items || !items.length) {
    return res.status(400).json({ status: "error", message: "Nomor Nota / Item belanjaan tidak boleh kosong." });
  }

  // Calculate transaction total and descriptions
  let totalTrx = 0;
  const descParts: string[] = [];
  
  // Deduct local stocks & calculate totals
  items.forEach((cartItem: { name: string, qty: number, price: number }) => {
    totalTrx += cartItem.qty * cartItem.price;
    descParts.push(`${cartItem.name} (${cartItem.qty}x)`);

    // Subtract stock in local memory
    const product = products.find(p => p.name.toLowerCase() === cartItem.name.toLowerCase());
    if (product) {
      product.stockOut += cartItem.qty;
    }
  });

  const trxId = "TRX-" + Math.floor(1000 + Math.random() * 9000);
  const newTrx = {
    id: trxId,
    date: new Date().toISOString(),
    type: "Penjualan",
    desc: descParts.join(", "),
    payment: paymentMethod || "Tunai",
    debit: totalTrx,
    credit: 0,
    invoice: invoiceId
  };

  // Prepend to transaction journal (limit to keeping records up to 50 for bento display)
  transactions.unshift(newTrx);
  if (transactions.length > 50) {
    transactions = transactions.slice(0, 50);
  }

  // Attempt sending to Google Apps Script Web App
  let synced = false;
  let sheetResponse = null;

  try {
    const payload = {
      action: "simpanTransaksi",
      noNota: invoiceId,
      metodeBayar: paymentMethod,
      items: items.map((i: any) => ({
        nama: i.name,
        qty: i.qty,
        harga: i.price
      })),
      total: totalTrx,
      idTrx: trxId
    };

    const scriptRes = await fetch(GOOGLE_SHEET_APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000)
    });

    if (scriptRes.ok) {
      synced = true;
      sheetResponse = await scriptRes.json().catch(() => ({ status: "OK - Redirect Followed" }));
    }
  } catch (err) {
    console.error("Google Apps Script sync failed, transaction saved securely locally:", err);
  }

  res.json({
    status: "success",
    transaction: newTrx,
    syncedWithSheet: synced,
    localProducts: products,
    sheetResponse: sheetResponse
  });
});

// 4. API: Update Stock Master (Add / Edit Stocks)
app.post("/api/stock/update", (req, res) => {
  const { productId, name, price, stockIn, stockOut } = req.body;
  const product = products.find(p => p.id === productId);
  if (product) {
    if (name) product.name = name;
    if (price !== undefined) product.price = Number(price);
    if (stockIn !== undefined) product.stockIn = Number(stockIn);
    if (stockOut !== undefined) product.stockOut = Number(stockOut);
    res.json({ status: "success", products });
  } else {
    // Add new product
    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      name: name || "Produk Baru",
      stockIn: Number(stockIn) || 50,
      stockOut: Number(stockOut) || 0,
      price: Number(price) || 10000
    };
    products.push(newProduct);
    res.json({ status: "success", products });
  }
});

// Configure Vite middleware or production static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
