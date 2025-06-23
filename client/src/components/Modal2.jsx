import React from 'react';;

const Modal = ({ children, onClose }) => {
  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal-content">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
