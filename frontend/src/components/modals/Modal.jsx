import React from "react";
import "../../css/Modal.css";

const Modal = ({ children, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-card" onClick={e => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}>&times;</button>
      {children}
    </div>
  </div>
);

export default Modal;
