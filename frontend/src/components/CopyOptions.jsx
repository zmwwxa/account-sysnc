import React, { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

function CopyOptions({ sourceRole, targetRoles, onCopy, disabled }) {
  const [options, setOptions] = useState({
    autoBackup: true,
    confirmBeforeCopy: true
  });
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCopy = () => {
    if (options.confirmBeforeCopy) {
      setShowConfirm(true);
    } else {
      onCopy(options);
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onCopy(options);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="copy-options">
      <h2>选项</h2>

      <div className="options-list">
        <label className="option-item">
          <input
            type="checkbox"
            checked={options.autoBackup}
            onChange={(e) => setOptions({ ...options, autoBackup: e.target.checked })}
            disabled={disabled}
          />
          <span>复制前自动备份（保留最近5个备份）</span>
        </label>

        <label className="option-item">
          <input
            type="checkbox"
            checked={options.confirmBeforeCopy}
            onChange={(e) => setOptions({ ...options, confirmBeforeCopy: e.target.checked })}
            disabled={disabled}
          />
          <span>覆盖前二次确认</span>
        </label>
      </div>

      <button
        className="btn-primary btn-large"
        onClick={handleCopy}
        disabled={disabled}
      >
        开始复制
      </button>

      <ConfirmDialog
        show={showConfirm}
        title="确认复制操作"
        message="即将把源角色的配置文件复制到以下目标角色："
        sourceRole={sourceRole}
        targetRoles={targetRoles}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default CopyOptions;
