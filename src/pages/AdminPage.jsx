import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { ShoppingBag, Package, CreditCard, MapPin, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import './AdminPage.css';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

const AdminPage = () => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthed(true);
      setError('');
      fetchOrders();
    } else {
      setError('Incorrect password');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const getStatusBadge = (status) => {
    const classes = {
      paid: 'badge-paid',
      pending: 'badge-pending',
    };
    return <span className={`status-badge ${classes[status] || 'badge-pending'}`}>{status}</span>;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Login gate
  if (!isAuthed) {
    return (
      <div className="admin-login-wrapper">
        <form className="admin-login-box" onSubmit={handleLogin}>
          <h2>Dwitara Admin</h2>
          <p>Enter the admin password to continue</p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
            autoFocus
          />
          {error && <span className="admin-error">{error}</span>}
          <button type="submit" className="btn-primary w-100">Unlock Dashboard</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Order Dashboard</h1>
        <div className="admin-header-right">
          <button className="admin-refresh-btn" onClick={fetchOrders}>Refresh</button>
          <button className="admin-logout-btn" onClick={() => setIsAuthed(false)}><LogOut size={18} /> Logout</button>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <ShoppingBag size={24} />
          <div>
            <span className="stat-number">{orders.length}</span>
            <span className="stat-label">Total Orders</span>
          </div>
        </div>
        <div className="stat-card">
          <CreditCard size={24} />
          <div>
            <span className="stat-number">₹{orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0).toLocaleString('en-IN')}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>
        <div className="stat-card">
          <Package size={24} />
          <div>
            <span className="stat-number">{orders.filter(o => o.payment_status === 'paid').length}</span>
            <span className="stat-label">Paid Orders</span>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="admin-loading">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="admin-loading">No orders yet.</p>
      ) : (
        <div className="admin-orders-list">
          {orders.map((order) => {
            const addr = order.shipping_address || {};
            const items = order.cart_items || [];
            const isExpanded = expandedOrder === order.id;

            return (
              <div key={order.id} className={`admin-order-card ${isExpanded ? 'expanded' : ''}`}>
                <div className="order-row-main" onClick={() => toggleExpand(order.id)}>
                  <div className="order-col">
                    <span className="order-label">Date</span>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                  <div className="order-col">
                    <span className="order-label">Customer</span>
                    <span>{order.user_email}</span>
                  </div>
                  <div className="order-col">
                    <span className="order-label">Total</span>
                    <span className="order-total">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="order-col">
                    <span className="order-label">Payment</span>
                    <span>{order.payment_method?.toUpperCase()}</span>
                  </div>
                  <div className="order-col">
                    <span className="order-label">Status</span>
                    {getStatusBadge(order.payment_status)}
                  </div>
                  <div className="order-expand-icon">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="order-details-panel">
                    <div className="detail-section">
                      <h4><MapPin size={16} /> Shipping Address</h4>
                      <p>
                        {addr.firstName} {addr.lastName}<br />
                        {addr.address}<br />
                        {addr.city}, {addr.pincode}<br />
                        Phone: {addr.phone}
                      </p>
                    </div>

                    <div className="detail-section">
                      <h4><ShoppingBag size={16} /> Items Ordered</h4>
                      <table className="admin-items-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Size</th>
                            <th>Qty</th>
                            <th>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.name}</td>
                              <td>{item.size || '-'}</td>
                              <td>{item.quantity}</td>
                              <td>₹{item.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {order.razorpay_payment_id && (
                      <div className="detail-section">
                        <h4><CreditCard size={16} /> Payment ID</h4>
                        <p className="payment-id-text">{order.razorpay_payment_id}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
