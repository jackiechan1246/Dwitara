import { useState } from 'react';
import { Truck, CreditCard, X } from 'lucide-react';
import './DummyFeatures.css';

const DummyFeatures = () => {
  const [modalState, setModalState] = useState(null);

  const openTrack = () => setModalState('track');
  const openPayment = () => setModalState('payment');
  const closeModal = () => setModalState(null);

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
                <p>Enter your tracking details below to see the current status of your shipment.</p>
                <input type="text" className="dummy-input" placeholder="Order ID or Tracking Number" />
                <button className="btn-primary full-width" onClick={() => alert("Tracking feature is currently in dummy mode.")}>
                  Track Order
                </button>
                <div className="dummy-status">
                  <div className="status-step active">Order Placed</div>
                  <div className="status-step">Processing</div>
                  <div className="status-step">Shipped</div>
                  <div className="status-step">Delivered</div>
                </div>
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
