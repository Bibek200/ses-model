import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../api/crmApi';

interface Product {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  price: number;
  stockQuantity: number;
  lowStockAlert: number;
  isActive: boolean;
  createdAt: string;
}

const InventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', description: '', category: '', price: '', stockQuantity: '', lowStockAlert: '5' });
  const [saving, setSaving] = useState(false);
  const [stockModal, setStockModal] = useState<{ product: Product; quantity: string } | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await inventoryApi.getAll();
    if (res.success && res.data) setProducts(res.data.products || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await inventoryApi.create({
      name: form.name,
      sku: form.sku,
      description: form.description,
      category: form.category,
      price: parseFloat(form.price) || 0,
      stockQuantity: parseInt(form.stockQuantity) || 0,
      lowStockAlert: parseInt(form.lowStockAlert) || 5,
    });
    if (res.success) {
      setShowModal(false);
      setForm({ name: '', sku: '', description: '', category: '', price: '', stockQuantity: '', lowStockAlert: '5' });
      fetchProducts();
    }
    setSaving(false);
  };

  const handleUpdateStock = async () => {
    if (!stockModal) return;
    setSaving(true);
    const res = await inventoryApi.updateStock(stockModal.product._id, parseInt(stockModal.quantity) || 0);
    if (res.success) {
      setStockModal(null);
      fetchProducts();
    }
    setSaving(false);
  };

  const totalValue = products.reduce((sum, p) => sum + p.price * p.stockQuantity, 0);
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.lowStockAlert);

  return (
    <div className="inv-page">
      {/* Header */}
      <div className="inv-header">
        <div>
          <h1 className="inv-title">Inventory</h1>
          <p className="inv-subtitle">Manage products, SKUs, and stock levels</p>
        </div>
        <button className="inv-add-btn" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="inv-stats">
        <div className="inv-stat-card">
          <span className="inv-stat-label">Total Products</span>
          <span className="inv-stat-value">{products.length}</span>
        </div>
        <div className="inv-stat-card">
          <span className="inv-stat-label">Total Stock Value</span>
          <span className="inv-stat-value">₹{totalValue.toLocaleString()}</span>
        </div>
        <div className="inv-stat-card inv-stat-card--alert">
          <span className="inv-stat-label">Low Stock Alerts</span>
          <span className="inv-stat-value">{lowStockProducts.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="inv-table-wrap">
        {loading ? (
          <div className="inv-loading"><div className="inv-spinner" /></div>
        ) : products.length === 0 ? (
          <div className="inv-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
            <p>No products yet. Click "Add Product" to get started.</p>
          </div>
        ) : (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} className={p.stockQuantity <= p.lowStockAlert ? 'row--low' : ''}>
                  <td>
                    <div className="p-name-wrap">
                      <span className="p-name">{p.name}</span>
                      {p.description && <span className="p-desc">{p.description.substring(0, 40)}</span>}
                    </div>
                  </td>
                  <td><code className="p-sku">{p.sku}</code></td>
                  <td>{p.category || '—'}</td>
                  <td className="p-price">₹{p.price.toLocaleString()}</td>
                  <td>
                    <span className={`p-stock ${p.stockQuantity <= p.lowStockAlert ? 'stock--low' : 'stock--ok'}`}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td>
                    <span className={`p-badge ${p.stockQuantity > 0 ? 'badge--in' : 'badge--out'}`}>
                      {p.stockQuantity > 0 ? 'In Stock' : 'Out'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="p-action-btn"
                      title="Update Stock"
                      onClick={() => setStockModal({ product: p, quantity: String(p.stockQuantity) })}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Add New Product</h2>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="modal-row">
                <div className="modal-field">
                  <label>Product Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Premium Widget" />
                </div>
                <div className="modal-field">
                  <label>SKU *</label>
                  <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required placeholder="e.g. WDG-001" />
                </div>
              </div>
              <div className="modal-field">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description..." rows={2} />
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Category</label>
                  <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Electronics" />
                </div>
                <div className="modal-field">
                  <label>Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min="0" placeholder="0" />
                </div>
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Stock Quantity</label>
                  <input type="number" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })} min="0" placeholder="0" />
                </div>
                <div className="modal-field">
                  <label>Low Stock Alert</label>
                  <input type="number" value={form.lowStockAlert} onChange={e => setForm({ ...form, lowStockAlert: e.target.value })} min="0" placeholder="5" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="modal-submit" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {stockModal && (
        <div className="modal-overlay" onClick={() => setStockModal(null)}>
          <div className="modal-card modal-card--sm" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Update Stock — {stockModal.product.name}</h2>
            <div className="modal-form">
              <div className="modal-field">
                <label>New Stock Quantity</label>
                <input
                  type="number"
                  value={stockModal.quantity}
                  onChange={e => setStockModal({ ...stockModal, quantity: e.target.value })}
                  min="0"
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button className="modal-cancel" onClick={() => setStockModal(null)}>Cancel</button>
                <button className="modal-submit" onClick={handleUpdateStock} disabled={saving}>
                  {saving ? 'Saving...' : 'Update Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .inv-page { animation: fadeUp .4s ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .inv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .inv-title { font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .inv-subtitle { font-size: 14px; color: #94a3b8; margin: 4px 0 0; }
        .inv-add-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 12px; color: white; font-weight: 600; font-size: 14px; cursor: pointer; transition: all .2s; }
        .inv-add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99,102,241,.35); }

        .inv-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .inv-stat-card { background: rgba(15,23,42,.5); border: 1px solid rgba(255,255,255,.05); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .inv-stat-card--alert { border-color: rgba(239,68,68,.15); }
        .inv-stat-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; }
        .inv-stat-value { font-size: 28px; font-weight: 800; color: #f1f5f9; }

        .inv-table-wrap { background: rgba(15,23,42,.5); border: 1px solid rgba(255,255,255,.05); border-radius: 16px; overflow: hidden; }
        .inv-table { width: 100%; border-collapse: collapse; }
        .inv-table th { padding: 14px 16px; text-align: left; background: rgba(255,255,255,.02); color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid rgba(255,255,255,.05); }
        .inv-table td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.03); color: #e2e8f0; font-size: 14px; }
        .row--low { background: rgba(239,68,68,.03); }

        .p-name-wrap { display: flex; flex-direction: column; }
        .p-name { font-weight: 600; }
        .p-desc { font-size: 12px; color: #64748b; margin-top: 2px; }
        .p-sku { font-size: 12px; padding: 2px 6px; background: rgba(255,255,255,.04); border-radius: 4px; color: #94a3b8; }
        .p-price { font-weight: 600; color: #34d399; }
        .p-stock { font-weight: 700; font-size: 15px; }
        .stock--ok { color: #34d399; }
        .stock--low { color: #f87171; }
        .p-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .badge--in { background: rgba(16,185,129,.1); color: #34d399; }
        .badge--out { background: rgba(239,68,68,.1); color: #f87171; }

        .p-action-btn { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 8px; color: #94a3b8; padding: 6px; cursor: pointer; transition: .2s; display: flex; }
        .p-action-btn:hover { background: rgba(99,102,241,.15); color: #818cf8; border-color: rgba(99,102,241,.3); }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; animation: fadeIn .2s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-card { background: #0f172a; border: 1px solid rgba(255,255,255,.08); border-radius: 20px; padding: 32px; width: 560px; max-width: 95vw; max-height: 90vh; overflow-y: auto; animation: modalIn .3s ease-out; }
        .modal-card--sm { width: 380px; }
        @keyframes modalIn { from { opacity: 0; transform: scale(.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-title { font-size: 20px; font-weight: 700; color: #f1f5f9; margin: 0 0 24px; }
        .modal-form { display: flex; flex-direction: column; gap: 16px; }
        .modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .modal-field { display: flex; flex-direction: column; gap: 6px; }
        .modal-field label { font-size: 13px; font-weight: 500; color: #94a3b8; }
        .modal-field input, .modal-field textarea, .modal-field select { padding: 10px 14px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; color: #f1f5f9; font-size: 14px; font-family: inherit; outline: none; transition: .2s; resize: vertical; }
        .modal-field input:focus, .modal-field textarea:focus, .modal-field select:focus { border-color: rgba(99,102,241,.5); box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
        .modal-field input::placeholder, .modal-field textarea::placeholder { color: rgba(148,163,184,.4); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
        .modal-cancel { padding: 10px 20px; background: transparent; border: 1px solid rgba(255,255,255,.1); border-radius: 10px; color: #94a3b8; font-weight: 500; cursor: pointer; transition: .2s; }
        .modal-cancel:hover { background: rgba(255,255,255,.05); }
        .modal-submit { padding: 10px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; transition: .2s; }
        .modal-submit:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(99,102,241,.3); }
        .modal-submit:disabled { opacity: .6; cursor: not-allowed; }

        .inv-loading { padding: 60px; display: flex; justify-content: center; }
        .inv-spinner { width: 30px; height: 30px; border: 3px solid rgba(99,102,241,.2); border-top-color: #6366f1; border-radius: 50%; animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .inv-empty { padding: 60px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: #64748b; font-size: 14px; }
      `}</style>
    </div>
  );
};

export default InventoryPage;
