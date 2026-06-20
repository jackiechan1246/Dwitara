import { useState, useRef, useEffect } from 'react';
import { LogOut, Package, User } from 'lucide-react';
import { auth, signOut } from '../firebase';
import './UserDropdown.css';

const UserDropdown = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    signOut(auth);
    setIsOpen(false);
  };

  if (!user) return <User size={20} />;

  const displayName = user.displayName || user.email.split('@')[0];

  return (
    <div className="user-dropdown-container" ref={dropdownRef}>
      <button 
        className="user-avatar-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User Account Menu"
      >
        <div className="user-avatar-small">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="user-dropdown-header">
            <p className="user-dropdown-name">{displayName}</p>
            <p className="user-dropdown-email">{user.email}</p>
          </div>
          <div className="user-dropdown-body">
            <button className="user-dropdown-item" onClick={() => setIsOpen(false)}>
              <Package size={16} /> My Orders
            </button>
            <div className="user-dropdown-divider"></div>
            <button className="user-dropdown-item logout-btn" onClick={handleLogout}>
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
