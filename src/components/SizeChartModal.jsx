import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './SizeChartModal.css';

const SizeChartModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="size-modal-overlay" onClick={onClose}>
      <div className="size-modal-content" onClick={e => e.stopPropagation()}>
        <div className="size-modal-header">
          <h3>Standard Size Guide</h3>
          <button className="close-modal-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        
        <div className="size-modal-body">
          <div className="size-table-wrapper">
            <table className="size-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest (in)</th>
                  <th>Waist (in)</th>
                  <th>Hip (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>XS</td>
                  <td>32</td>
                  <td>26</td>
                  <td>34</td>
                </tr>
                <tr>
                  <td>S</td>
                  <td>34</td>
                  <td>28</td>
                  <td>36</td>
                </tr>
                <tr>
                  <td>M</td>
                  <td>36</td>
                  <td>30</td>
                  <td>38</td>
                </tr>
                <tr>
                  <td>L</td>
                  <td>38</td>
                  <td>32</td>
                  <td>40</td>
                </tr>
                <tr>
                  <td>XL</td>
                  <td>40</td>
                  <td>34</td>
                  <td>42</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="size-how-to-measure">
            <h4>How to Measure</h4>
            <p><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</p>
            <p><strong>Waist:</strong> Measure around the narrowest part (typically where your body bends side to side), keeping the tape horizontal.</p>
            <p><strong>Hip:</strong> Measure around the fullest part of your hips, keeping the tape horizontal.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;
