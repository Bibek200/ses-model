import React, { useState, useEffect } from 'react';
import { ordersApi, inventoryApi, customersApi } from '../api/crmApi';

interface Order {
  _id: string;
  orderNumber: string;
  customer: { _id: string; name: string; company?: string };
  items: { product: string; name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
}

interface Product { _id: string; name: string; sku: string; price: number; stockQuantity: number; }
interface Customer { _id: string; name: string; company?: string; }

const statusColors: Record<string, string> = {
  pending: '#fbbf24', confirmed: '#60a5fa', processing: '#a78bfa',
  shipped: '#818cf8', delivered: '#34d399', cancelled: '#f87171',
};

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState<{ product: string; name: string; quantity: number; price: number }[]>([]);
  const [notes, setNotes] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    const res = await ordersApi.getAll();
    if (res.success && res.data) setOrders(res.data.orders || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const openCreateModal = async () => {
    // Prefetch products and customers for the form
    const [pRes, cRes] = await Promise.all([inventoryApi.getAll(), customersApi.getAll()]);
    if (pRes.success && pRes.data) setProducts(pRes.data.products || []);
    if (cRes.success && cRes.data) setCustomers(cRes.data.customers || []);
    setOrderItems([]);
    setSelectedCustomer('');
    setNotes('');
    setShowModal(true);
  };

  const addItem = () => {
    setOrderItems([...orderItems, { product: '', name: '', quantity: 1, price: 0 }]);
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const updated = [...orderItems];
    if (field === 'product') {
      const p = products.find(pr => pr._id === value);
      updated[idx] = { ...updated[idx], product: value, name: p?.name || '', price: p?.price || 0 };
    } else {
      (updated[idx] as any)[field] = value;
    }
    setOrderItems(updated);
  };

  const removeItem = (idx: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  const totalAmount = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || orderItems.length === 0) return;
    setSaving(true);

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const res = await ordersApi.create({
      orderNumber,
      customer: selectedCustomer,
      items: orderItems,
      totalAmount,
      notes,
    });

    if (res.success) {
      setShowModal(false);
      fetchOrders();
    }
    setSaving(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    await ordersApi.updateStatus(id, status);
    fetchOrders();
  };

  return (
    <div className="ord-page">
      <div className="ord-header">
        <div>
          <h1 className="ord-title">Orders</h1>
          <p className="ord-subtitle">Track transactions and order fulfillment</p>
        </div>
        <button className="ord-add-btn" onClick={openCreateModal}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Order
        </button>
      </div>

      {/* Stats */}
      <div className="ord-stats">
        <div className="ord-stat-card">
          <span className="ord-stat-label">Total Orders</span>
          <span className="ord-stat-value">{orders.length}</span>
        </div>
        <div className="ord-stat-card">
          <span className="ord-stat-label">Revenue</span>
          <span className="ord-stat-value">₹{orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}</span>
        </div>
        <div className="ord-stat-card">
          <span className="ord-stat-label">Pending</span>
          <span className="ord-stat-value">{orders.filter(o => o.status === 'pending').length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="ord-table-wrap">
        {loading ? (
          <div className="ord-loading"><div className="ord-spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="ord-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /></svg>
            <p>No orders yet. Create your first order.</p>
          </div>
        ) : (
          <table className="ord-table">
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td><code className="ord-num">{o.orderNumber}</code></td>
                  <td>
                    <div className="ord-cust">
                      <span className="ord-cust-name">{o.customer?.name || 'Unknown'}</span>
                      {o.customer?.company && <span className="ord-cust-comp">{o.customer.company}</span>}
                    </div>
                  </td>
                  <td><span className="ord-items-count">{o.items?.length || 0} items</span></td>
                  <td className="ord-total">₹{o.totalAmount.toLocaleString()}</td>
                  <td>
                    <select
                      className="ord-status-select"
                      value={o.status}
                      onChange={e => handleStatusChange(o._id, e.target.value)}
                      style={{ color: statusColors[o.status] || '#94a3b8' }}
                    >
                      {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s =>
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      )}
                    </select>
                  </td>
                  <td>
                    <span className={`pay-badge pay--${o.paymentStatus}`}>{o.paymentStatus}</span>
                  </td>
                  <td className="ord-date">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card modal-card--lg" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Create New Order</h2>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="modal-field">
                <label>Customer *</label>
                <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} required>
                  <option value="">Select a customer...</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
                </select>
              </div>

              <div className="modal-field">
                <label>Order Items</label>
                {orderItems.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <select value={item.product} onChange={e => updateItem(idx, 'product', e.target.value)} required>
                      <option value="">Select product...</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku}) — ₹{p.price}</option>)}
                    </select>
                    <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} min="1" style={{ width: '80px' }} placeholder="Qty" />
                    <span className="item-subtotal">₹{(item.price * item.quantity).toLocaleString()}</span>
                    <button type="button" className="item-remove" onClick={() => removeItem(idx)}>×</button>
                  </div>
                ))}
                <button type="button" className="add-item-btn" onClick={addItem}>+ Add Item</button>
              </div>

              <div className="modal-field">
                <label>Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions..." rows={2} />
              </div>

              <div className="order-total-bar">
                <span>Total Amount</span>
                <span className="order-total-val">₹{totalAmount.toLocaleString()}</span>
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="modal-submit" disabled={saving || orderItems.length === 0}>
                  {saving ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .ord-page { animation: fadeUp .4s ease-out; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .ord-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .ord-title { font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .ord-subtitle { font-size: 14px; color: #94a3b8; margin: 4px 0 0; }
        .ord-add-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 12px; color: white; font-weight: 600; font-size: 14px; cursor: pointer; transition: all .2s; }
        .ord-add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99,102,241,.35); }

        .ord-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .ord-stat-card { background: rgba(15,23,42,.5); border: 1px solid rgba(255,255,255,.05); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .ord-stat-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; }
        .ord-stat-value { font-size: 28px; font-weight: 800; color: #f1f5f9; }

        .ord-table-wrap { background: rgba(15,23,42,.5); border: 1px solid rgba(255,255,255,.05); border-radius: 16px; overflow: hidden; }
        .ord-table { width: 100%; border-collapse: collapse; }
        .ord-table th { padding: 14px 16px; text-align: left; background: rgba(255,255,255,.02); color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid rgba(255,255,255,.05); }
        .ord-table td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.03); color: #e2e8f0; font-size: 14px; }

        .ord-num { font-size: 12px; padding: 3px 8px; background: rgba(255,255,255,.04); border-radius: 6px; color: #a5b4fc; font-weight: 600; }
        .ord-cust { display: flex; flex-direction: column; }
        .ord-cust-name { font-weight: 600; }
        .ord-cust-comp { font-size: 12px; color: #64748b; }
        .ord-items-count { font-size: 13px; color: #94a3b8; }
        .ord-total { font-weight: 700; color: #34d399; }
        .ord-date { font-size: 13px; color: #64748b; }

        .ord-status-select { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 4px 8px; font-size: 12px; font-weight: 600; text-transform: capitalize; cursor: pointer; outline: none; appearance: auto; }
        .ord-status-select option { background: #0f172a; color: #e2e8f0; }

        .pay-badge { padding: 3px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .pay--paid { background: rgba(16,185,129,.1); color: #34d399; }
        .pay--unpaid { background: rgba(239,68,68,.1); color: #f87171; }
        .pay--partially_paid { background: rgba(245,158,11,.1); color: #fbbf24; }

        /* Modal shared */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; animation: fadeIn .2s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-card { background: #0f172a; border: 1px solid rgba(255,255,255,.08); border-radius: 20px; padding: 32px; width: 560px; max-width: 95vw; max-height: 90vh; overflow-y: auto; animation: modalIn .3s ease-out; }
        .modal-card--lg { width: 640px; }
        @keyframes modalIn { from { opacity: 0; transform: scale(.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-title { font-size: 20px; font-weight: 700; color: #f1f5f9; margin: 0 0 24px; }
        .modal-form { display: flex; flex-direction: column; gap: 16px; }
        .modal-field { display: flex; flex-direction: column; gap: 6px; }
        .modal-field label { font-size: 13px; font-weight: 500; color: #94a3b8; }
        .modal-field input, .modal-field textarea, .modal-field select { padding: 10px 14px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; color: #f1f5f9; font-size: 14px; font-family: inherit; outline: none; transition: .2s; resize: vertical; }
        .modal-field input:focus, .modal-field textarea:focus, .modal-field select:focus { border-color: rgba(99,102,241,.5); box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
        .modal-field select option { background: #0f172a; color: #e2e8f0; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
        .modal-cancel { padding: 10px 20px; background: transparent; border: 1px solid rgba(255,255,255,.1); border-radius: 10px; color: #94a3b8; font-weight: 500; cursor: pointer; transition: .2s; }
        .modal-cancel:hover { background: rgba(255,255,255,.05); }
        .modal-submit { padding: 10px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer; transition: .2s; }
        .modal-submit:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(99,102,241,.3); }
        .modal-submit:disabled { opacity: .6; cursor: not-allowed; }

        .order-item-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .order-item-row select { flex: 1; }
        .order-item-row input { text-align: center; }
        .item-subtotal { font-size: 13px; font-weight: 600; color: #34d399; min-width: 80px; text-align: right; }
        .item-remove { background: none; border: none; color: #f87171; font-size: 18px; cursor: pointer; padding: 4px 8px; }
        .add-item-btn { align-self: flex-start; background: rgba(99,102,241,.1); border: 1px dashed rgba(99,102,241,.3); border-radius: 8px; color: #818cf8; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; transition: .2s; }
        .add-item-btn:hover { background: rgba(99,102,241,.2); }
        .order-total-bar { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: rgba(99,102,241,.08); border: 1px solid rgba(99,102,241,.15); border-radius: 12px; font-weight: 600; color: #e2e8f0; }
        .order-total-val { font-size: 22px; font-weight: 800; color: #a5b4fc; }

        .ord-loading { padding: 60px; display: flex; justify-content: center; }
        .ord-spinner { width: 30px; height: 30px; border: 3px solid rgba(99,102,241,.2); border-top-color: #6366f1; border-radius: 50%; animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ord-empty { padding: 60px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: #64748b; font-size: 14px; }
      `}</style>
    </div>
  );
};

export default OrdersPage;
