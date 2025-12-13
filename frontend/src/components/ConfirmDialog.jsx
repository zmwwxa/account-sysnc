import React from 'react';

function ConfirmDialog({ show, title, message, sourceRole, targetRoles, onConfirm, onCancel }) {
  if (!show) return null;

  const roleDisplay = (role) =>
    `${role.account} - ${role.region} - ${role.server} - ${role.role}`;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn-close" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body">
          <div className="confirm-message">{message}</div>

          {sourceRole && (
            <div className="role-info-section">
              <h3>源角色</h3>
              <div className="role-info-box source-role">
                {roleDisplay(sourceRole)}
              </div>
            </div>
          )}

          {targetRoles && targetRoles.length > 0 && (
            <div className="role-info-section">
              <h3>目标角色 ({targetRoles.length}个)</h3>
              <div className="role-info-list">
                {targetRoles.map((role, index) => (
                  <div key={role.path} className="role-info-box target-role">
                    {index + 1}. {roleDisplay(role)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>
            取消
          </button>
          <button className="btn-primary" onClick={onConfirm}>
            确认复制
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
