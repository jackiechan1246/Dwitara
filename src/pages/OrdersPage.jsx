import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { Package, Truck, ArrowLeft } from 'lucide-react';
import './OrdersPage.css';

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (!user) return null;

  return (
    <div className="section-padding orders-container">
      <div className="orders-header">
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h2>My Order History</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem', width: '30px', height: '30px', border: '3px solid #ccc', borderTopColor: '#333', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p>Loading your orders...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders">
          <Package size={60} color="var(--color-text-secondary)" style={{ marginBottom: '1rem' }} />
          <h3>No orders yet</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>Looks like you haven't made any purchases with us yet.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Start Shopping</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-meta-group">
                  <div className="order-meta-item">
                    <span className="order-meta-label">Order Placed</span>
                    <span className="order-meta-value">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="order-meta-item">
                    <span className="order-meta-label">Total Amount</span>
                    <span className="order-meta-value">₹{order.total_amount?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="order-meta-item">
                    <span className="order-meta-label">Order #</span>
                    <span className="order-meta-value" style={{ fontFamily: 'monospace' }}>{order.id?.substring(0, 8).toUpperCase()}</span>
                  </div>
                </div>

                <div className="order-total">
                  <div className={`order-status status-${order.payment_status?.toLowerCase() || 'pending'}`}>
                    {order.payment_status || 'Pending'}
                  </div>
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-items-list">
                  {order.cart_items && order.cart_items.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <div className="order-item-info">
                        <div style={{ width: '40px', height: '50px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={20} color="#ccc" />
                        </div>
                        <div>
                          <p className="order-item-name">{item.name}</p>
                          <p className="order-item-variant">Size: {item.size || 'N/A'} {item.color ? `| Color: ${item.color}` : ''}</p>
                        </div>
                      </div>
                      <div className="order-item-price-qty">
                        <p>₹{item.price}</p>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.shipping_address && (
                  <div className="order-shipping-addr">
                    <h4><Truck size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Shipping To</h4>
                    <p>
                      {order.shipping_address.firstName} {order.shipping_address.lastName}<br />
                      {order.shipping_address.address}<br />
                      {order.shipping_address.city}, {order.shipping_address.pincode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
