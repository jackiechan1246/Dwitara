import { useState } from 'react';
import { Truck, CreditCard, X } from 'lucide-react';
import './DummyFeatures.css';

const DummyFeatures = () => {
  const [modalState, setModalState] = useState(null);
  const [awb, setAwb] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackResult, setTrackResult] = useState(null);

  const openTrack = () => setModalState('track');
  const openPayment = () => setModalState('payment');
  const closeModal = () => {
    setModalState(null);
    setTrackResult(null);
    setAwb('');
  };

  const handleTrack = async () => {
    if (!awb.trim()) return;
    setIsLoading(true);
    setTrackResult(null);
    try {
      const res = await fetch(`http://localhost:5000/api/track-order/${awb}`);
      const data = await res.json();
      if (data.success && data.tracking) {
        setTrackResult(data.tracking);
      } else {
        setTrackResult(data.error || 'Could not find tracking info for this AWB.');
      }
    } catch (err) {
      setTrackResult('Error connecting to tracking service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="floating-actions">
        <button className="floating-btn" onClick={openTrack} title="Track Order">
          <Truck size={20} />
        </button>
        <button className="floating-btn" onClick={openPayment} title="Simulate Payment">
          <CreditCard size={20} />
        </button>
      </div>

      {modalState && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <X size={24} />
            </button>
            
            {modalState === 'track' && (
              <div className="modal-body">
                <h3>Track Your Order</h3>
                <p>Enter your AWB / Tracking Number below to see the live status of your shipment.</p>
                <input 
                  type="text" 
                  className="dummy-input" 
                  placeholder="AWB Number (e.g. GGN9000181640)" 
                  value={awb}
                  onChange={(e) => setAwb(e.target.value)}
                />
                <button 
                  className="btn-primary full-width" 
                  onClick={handleTrack}
                  disabled={isLoading}
                >
                  {isLoading ? 'Tracking...' : 'Track Order'}
                </button>
                
                {trackResult && typeof trackResult === 'object' && (
                  <div className="track-result-box" style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px', textAlign: 'left', fontSize: '0.9rem' }}>
                    <p style={{ margin: '0 0 0.5rem' }}><strong>Order:</strong> {trackResult.order_id}</p>
                    <p style={{ margin: '0 0 0.5rem' }}><strong>Courier:</strong> {trackResult.courier}</p>
                    <p style={{ margin: '0 0 0.5rem' }}><strong>Status:</strong> <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{trackResult.current_status}</span></p>
                    <p style={{ margin: '0' }}><strong>Expected:</strong> {trackResult.expected_delivery_date || 'Pending update'}</p>
                  </div>
                )}
                
                {trackResult && typeof trackResult === 'string' && (
                  <p style={{ color: 'red', marginTop: '1rem', fontSize: '0.9rem' }}>{trackResult}</p>
                )}
              </div>
            )}

            {modalState === 'payment' && (
              <div className="modal-body">
                <h3>Secure Payment</h3>
                <p>Complete your purchase using our secure payment gateway (₹ INR).</p>
                
                <div className="dummy-card-form">
                  <input type="text" className="dummy-input" placeholder="Cardholder Name" />
                  <input type="text" className="dummy-input" placeholder="Card Number" />
                  <div className="input-row">
                    <input type="text" className="dummy-input" placeholder="MM/YY" />
                    <input type="text" className="dummy-input" placeholder="CVC" />
                  </div>
                </div>
                
                <button className="btn-primary full-width" onClick={() => alert("Payment feature is currently in dummy mode.")}>
                  Pay Now ₹3,498
                </button>
                <p className="secure-badge">🔒 Bank-level encryption setup</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DummyFeatures;
