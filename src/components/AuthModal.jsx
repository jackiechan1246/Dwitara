import { useState } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { X, Eye, EyeOff } from 'lucide-react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('Female');

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setError('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setBirthdate('');
    setMobile('');
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err) {
      setError('Failed to sign in with Google.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (activeTab === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else {
        // Register validations
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }

        // Create the user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update user's display name using first name + last name
        if (firstName || lastName) {
          await updateProfile(userCredential.user, {
            displayName: `${firstName} ${lastName}`.trim()
          });
        }
        
        // Note: For Birthdate, Mobile, and Gender, you would typically save these 
        // to a Firestore database right here using the userCredential.user.uid.
        // Since we only have Auth configured right now, we capture them in the UI 
        // to match your intended design.
        
        onClose();
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already registered. Please login.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>

        <h2 className="auth-title">Register with Dwitara</h2>

        {/* Tab Navigation */}
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('login')}
          >
            LOGIN
          </button>
          <button 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('register')}
          >
            REGISTER
          </button>
        </div>

        {/* Form Container (Grey Background) */}
        <div className="auth-form-container">
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            
            {activeTab === 'register' && (
              <div className="auth-row-inputs">
                <input 
                  type="text" 
                  placeholder="First Name" 
                  className="auth-input-field"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                />
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  className="auth-input-field"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                />
              </div>
            )}

            <input 
              type="email" 
              placeholder="Email ID *" 
              className="auth-input-field"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <div className="auth-password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder={activeTab === 'register' ? "Choose New Password *" : "Password *"} 
                className="auth-input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {activeTab === 'register' && (
              <>
                <div className="auth-password-wrapper">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Confirm Password *" 
                    className="auth-input-field"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="auth-birthdate-wrapper">
                  <input 
                    type="date" 
                    className={`auth-input-field ${!birthdate ? 'empty-date' : ''}`}
                    value={birthdate}
                    onChange={e => setBirthdate(e.target.value)}
                    required
                  />
                  {!birthdate && <span className="date-placeholder">Please enter your birthdate *</span>}
                  <p className="auth-hint">(Avail 10% Birthday discount as a member)</p>
                </div>

                <div className="auth-mobile-wrapper">
                  <span className="mobile-prefix">+91</span>
                  <input 
                    type="tel" 
                    placeholder="Mobile Number(For order status update) *" 
                    className="auth-input-field auth-input-mobile"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-gender-wrapper">
                  <span className="gender-label">Gender</span>
                  <label className="gender-radio">
                    <input 
                      type="radio" 
                      value="Female" 
                      checked={gender === 'Female'} 
                      onChange={e => setGender(e.target.value)} 
                    />
                    <span className="radio-custom"></span> Female
                  </label>
                  <label className="gender-radio">
                    <input 
                      type="radio" 
                      value="Male" 
                      checked={gender === 'Male'} 
                      onChange={e => setGender(e.target.value)} 
                    />
                    <span className="radio-custom"></span> Male
                  </label>
                  <label className="gender-radio">
                    <input 
                      type="radio" 
                      value="Other" 
                      checked={gender === 'Other'} 
                      onChange={e => setGender(e.target.value)} 
                    />
                    <span className="radio-custom"></span> Other
                  </label>
                </div>
              </>
            )}

            <button type="submit" className="auth-submit-btn">
              {activeTab === 'login' ? 'LOGIN' : 'REGISTER'}
            </button>
            
            <div className="auth-divider">
              <span>Or log in with</span>
            </div>
            
            <button type="button" className="auth-google-btn" onClick={handleGoogleSignIn}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
