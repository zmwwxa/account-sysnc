import React from 'react';

function SuccessDialog({ show, title, message, details, onClose }) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content success-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="success-icon">✓</div>
          <h2>{title}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="success-message">{message}</div>

          {details && (
            <div className="success-details">
              {details.map((detail, index) => (
                <div key={index} className="detail-item">
                  {detail}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessDialog;
