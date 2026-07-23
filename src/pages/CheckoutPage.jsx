import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase';
import ReactPixel from '../lib/metaPixel';
import './CheckoutPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cartItems, cartTotal, absoluteSavings, promoDiscount, loginDiscount, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    pincode: ''
  });

  // Calculate expected delivery date (7-10 days from now)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 10);
  const minDateStr = minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const maxDateStr = maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dateStr = `${minDateStr} - ${maxDateStr}`;

  useEffect(() => {
    // If cart is empty, send back to home
    if (cartItems.length === 0 && !isSuccess) {
      navigate('/');
    }
  }, [cartItems, navigate, isSuccess]);

  // InitiateCheckout event
  useEffect(() => {
    if (cartTotal > 0 && !isSuccess) {
      const finalTotal = cartTotal - promoDiscount - loginDiscount - (paymentMethod === 'razorpay' ? Math.floor((cartTotal - promoDiscount - loginDiscount) * 0.05) : 0);
      ReactPixel.track("InitiateCheckout", {
        value: finalTotal, // Using final calculated total including discounts
        currency: "INR"
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return (
      <div className="checkout-container section-padding" style={{ justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '3rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>Login Required</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>You need an account to place an order. Please log in or sign up to continue.</p>
          <button className="btn-primary w-100" onClick={() => navigate('/')}>Return to Home & Login</button>
        </div>
      </div>
    );
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Calculate discounts
  const onlineDiscount = paymentMethod === 'razorpay' ? Math.floor((cartTotal - promoDiscount - loginDiscount) * 0.05) : 0;
  const finalTotal = cartTotal - promoDiscount - loginDiscount - onlineDiscount;

  const saveOrderToDB = async (paymentStatus, razorpayPaymentId = null) => {
    const orderData = {
      user_email: formData.email,
      total_amount: finalTotal,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      razorpay_payment_id: razorpayPaymentId,
      shipping_address: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode
      },
      cart_items: cartItems.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        size: i.selectedSize,
        color: i.selectedColor
      }))
    };

    const generatedShipmozoId = `DWI-${Date.now()}`;
    const { error } = await supabase.from('orders').insert([orderData]);
    if (error) {
      console.error("Error saving order: ", error);
      alert("There was an issue securely saving your order. Please contact support.");
    } else {
      setIsSuccess(true);
      
      // Track Purchase event with rich details
      ReactPixel.track("Purchase", {
        value: finalTotal,
        currency: "INR",
        contents: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity
        })),
        content_type: "product",
        num_items: cartItems.length
      });

      const orderDetailsPayload = {
        customer: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone
        },
        items: cartItems.map(i => ({
          id: i.id,
          name: i.name,
          size: i.selectedSize,
          quantity: i.quantity,
          price: i.price
        })),
        total: finalTotal,
        paymentMethod,
        paymentId: razorpayPaymentId,
        address: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
      };

      // 1. Send email notification (fire-and-forget, don't block success)
      fetch(`${API_URL}/api/notify-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderDetails: orderDetailsPayload })
      }).catch(emailErr => console.warn("Email notification failed (non-critical):", emailErr));

      // 2. Push to Shipmozo Logistics (fire-and-forget)
      fetch(`${API_URL}/api/push-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDetails: orderDetailsPayload,
          orderId: generatedShipmozoId
        })
      }).catch(shipmozoErr => console.warn("Shipmozo push failed (non-critical):", shipmozoErr));
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    if (paymentMethod === 'cod') {
      await saveOrderToDB('pending');
      setIsProcessing(false);
      return;
    }

    if (paymentMethod === 'razorpay') {
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      try {
        // STEP 1: Create Order on Backend
        const orderRes = await fetch(`${API_URL}/api/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: finalTotal * 100 })
        });

        if (!orderRes.ok) throw new Error('Failed to create order on backend');
        const orderData = await orderRes.json();

        // STEP 2: Open Razorpay Modal
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: finalTotal * 100, // paise
          currency: 'INR',
          name: 'Dwitara India',
          description: 'Payment for your order',
          order_id: orderData.id, // The secure order ID generated by backend
          handler: async function (response) {
            try {
              // STEP 3: Verify Signature on Backend
              const verifyRes = await fetch(`${API_URL}/api/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });

              const verifyData = await verifyRes.json();

              if (verifyData.success) {
                console.log("Payment Verified Successfully ID:", response.razorpay_payment_id);
                // Now safely save to our database
                await saveOrderToDB('paid', response.razorpay_payment_id);
              } else {
                alert("Payment signature verification failed. Please contact support.");
              }
            } catch (err) {
              console.error("Verification error:", err);
              alert("Error verifying secure payment.");
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            contact: formData.phone
          },
          theme: { color: '#1C1B1A' },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            }
          }
        };

        const paymentObj = new window.Razorpay(options);
        paymentObj.open();

        paymentObj.on('payment.failed', function (response) {
          alert(`Payment failed: ${response.error.description}`);
          setIsProcessing(false);
        });

      } catch (err) {
        console.error("Error during Razorpay flow:", err);
        alert("Could not initialize payment gateway.");
        setIsProcessing(false);
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="checkout-success-view">
        <CheckCircle2 size={80} color="#10b981" />
        <h2>Order Confirmed!</h2>
        <p>Thank you for shopping with Dwitara. Your order will arrive by {dateStr}.</p>
        <button className="btn-primary mt-4" onClick={() => navigate('/')}>Return to Store</button>
      </div>
    );
  }

  return (
    <div className="checkout-container section-padding">
      <div className="checkout-main">
        <div className="checkout-steps">

          {/* STEP 1: CONTACT */}
          <div className={`checkout-step ${step >= 1 ? 'active' : ''}`}>
            <h3 className="step-title">1. Contact Information</h3>
            {step === 1 ? (
              <div className="step-content">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="checkout-input"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number (+91)"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="checkout-input"
                />
                <button
                  className="btn-primary mt-2"
                  onClick={() => setStep(2)}
                  disabled={!formData.email || !formData.phone}
                >
                  Continue to Shipping
                </button>
              </div>
            ) : (
              <div className="step-summary" onClick={() => setStep(1)}>
                <p>{formData.email} • {formData.phone}</p>
                <span>Edit</span>
              </div>
            )}
          </div>

          {/* STEP 2: SHIPPING */}
          <div className={`checkout-step ${step >= 2 ? 'active' : ''} ${step < 2 ? 'disabled' : ''}`}>
            <h3 className="step-title">2. Shipping Address</h3>
            {step === 2 ? (
              <div className="step-content">
                <div className="input-row">
                  <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="checkout-input" />
                  <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="checkout-input" />
                </div>
                <input type="text" name="address" placeholder="Address, Building, Apartment" value={formData.address} onChange={handleInputChange} className="checkout-input" />
                <div className="input-row">
                  <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className="checkout-input" list="indian-cities" />
                  <datalist id="indian-cities">
                    <option value="Mumbai" />
                    <option value="Delhi" />
                    <option value="Bengaluru" />
                    <option value="Hyderabad" />
                    <option value="Ahmedabad" />
                    <option value="Chennai" />
                    <option value="Kolkata" />
                    <option value="Surat" />
                    <option value="Pune" />
                    <option value="Jaipur" />
                    <option value="Lucknow" />
                    <option value="Kanpur" />
                    <option value="Nagpur" />
                    <option value="Indore" />
                    <option value="Thane" />
                    <option value="Bhopal" />
                    <option value="Visakhapatnam" />
                    <option value="Pimpri-Chinchwad" />
                    <option value="Patna" />
                    <option value="Vadodara" />
                  </datalist>
                  <input type="text" name="pincode" placeholder="PIN Code" value={formData.pincode} onChange={handleInputChange} className="checkout-input" />
                </div>
                <button
                  className="btn-primary mt-2"
                  onClick={() => setStep(3)}
                  disabled={!formData.firstName || !formData.address || !formData.city || !formData.pincode}
                >
                  Continue to Delivery options
                </button>
              </div>
            ) : step > 2 ? (
              <div className="step-summary" onClick={() => setStep(2)}>
                <p>{formData.address}, {formData.city} {formData.pincode}</p>
                <span>Edit</span>
              </div>
            ) : null}
          </div>

          {/* STEP 3: DELIVERY OPTIONS */}
          <div className={`checkout-step ${step >= 3 ? 'active' : ''} ${step < 3 ? 'disabled' : ''}`}>
            <h3 className="step-title">3. Delivery Options</h3>
            {step === 3 ? (
              <div className="step-content">
                <div className="delivery-method-card selected">
                  <div className="delivery-info">
                    <strong>Standard Delivery</strong>
                    <span className="delivery-date">Expected by {dateStr}</span>
                  </div>
                  <span className="delivery-price">Free</span>
                </div>
                <button className="btn-primary mt-4" onClick={() => setStep(4)}>Continue to Payment</button>
              </div>
            ) : step > 3 ? (
              <div className="step-summary" onClick={() => setStep(3)}>
                <p>Standard Delivery (Free) • Exp. {dateStr}</p>
                <span>Edit</span>
              </div>
            ) : null}
          </div>

          {/* STEP 4: PAYMENT */}
          <div className={`checkout-step ${step >= 4 ? 'active' : ''} ${step < 4 ? 'disabled' : ''}`}>
            <h3 className="step-title">4. Payment</h3>
            {step === 4 && (
              <div className="step-content">
                <div className="payment-options">
                  <label className={`payment-label ${paymentMethod === 'razorpay' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-label-content">
                      <strong>Pay Online (Razorpay)</strong>
                      <span>Cards, UPI, Netbanking, Wallets</span>
                    </div>
                  </label>

                  <label className={`payment-label ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-label-content">
                      <strong>Cash on Delivery (COD)</strong>
                      <span>Pay when you receive the order</span>
                    </div>
                  </label>
                </div>

                <div className="payment-actions">
                  <button
                    className="btn-primary w-100 mt-2"
                    onClick={handlePayment}
                    disabled={!paymentMethod}
                  >
                    {paymentMethod === 'razorpay' ? 'Proceed to Razorpay' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="checkout-summary-sidebar">
        <h3>Order Summary</h3>
        <div className="checkout-items">
          {cartItems.map((item, idx) => (
            <div key={idx} className="checkout-item-compact">
              <div className="ci-img">
                <img src={item.images?.primary} alt={item.name} />
                <span className="ci-qty">{item.quantity}</span>
              </div>
              <div className="ci-details">
                <p className="ci-name">{item.name}</p>
                <p className="ci-variant">Size: {item.selectedSize}</p>
              </div>
              <div className="ci-price">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
        <div className="checkout-totals">
          <div className="tot-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="tot-row discount-row" style={{ color: '#10b981' }}>
            <span>Login Discount (5%)</span>
            <span>- ₹{loginDiscount.toLocaleString('en-IN')}</span>
          </div>

          {promoDiscount > 0 && (
            <div className="tot-row discount-row" style={{ color: '#10b981' }}>
              <span>Co-ord Promo (50% off Tee)</span>
              <span>- ₹{promoDiscount.toLocaleString('en-IN')}</span>
            </div>
          )}

          {paymentMethod === 'razorpay' && (
            <div className="tot-row discount-row" style={{ color: '#10b981' }}>
              <span>Online Payment (5%)</span>
              <span>- ₹{onlineDiscount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="tot-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="tot-row grand-total">
            <span>Total</span>
            <span>₹{finalTotal.toLocaleString('en-IN')}</span>
          </div>

          {(absoluteSavings > 0 || promoDiscount > 0 || loginDiscount > 0 || onlineDiscount > 0) && (
            <div className="tot-row savings-total" style={{ color: '#10b981', fontWeight: 'bold', marginTop: '1rem', borderTop: '2px solid #e2e8f0', paddingTop: '1rem' }}>
              <span>Total Savings Today</span>
              <span>₹{(absoluteSavings + promoDiscount + loginDiscount + onlineDiscount).toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
