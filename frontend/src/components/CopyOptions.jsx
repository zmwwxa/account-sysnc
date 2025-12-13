import React, { useState } from 'react';

function CopyOptions({ onCopy, disabled }) {
  const [options, setOptions] = useState({
    autoBackup: true,
    confirmBeforeCopy: true
  });

  const handleCopy = () => {
    if (options.confirmBeforeCopy) {
      const confirmed = window.confirm('确认开始同步吗？');
      if (!confirmed) return;
    }

    onCopy(options);
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
        开始同步
      </button>
    </div>
  );
}

export default CopyOptions;
