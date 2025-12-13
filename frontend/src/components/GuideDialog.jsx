import React, { useState } from 'react';
import './GuideDialog.css';

function GuideDialog({ show, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!show) return null;

  const steps = [
    {
      title: '使用本工具前的操作设置',
      content: (
        <div className="guide-step">
          <div className="step-description">
            <p style={{fontSize: '15px', lineHeight: '1.8', marginBottom: '20px'}}>
              <strong>1、</strong>分别登陆<strong>源角色</strong>（有你自己按键、技能摆放和宏等的角色）和<strong>目标角色</strong>（想要使用自己熟悉的按键、技能摆放和宏的角色），<strong>ESC 打开游戏设置，将服务器同步设置的所有选项的√去掉</strong>，如下图所示：
            </p>

            <div style={{textAlign: 'center', margin: '20px 0'}}>
              <img
                src="local-resource://game-settings.png"
                alt="游戏设置界面"
                style={{
                  width: '100%',
                  maxWidth: '620px',
                  border: '3px solid #dc3545',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
            </div>

            <p style={{fontSize: '15px', lineHeight: '1.8', marginBottom: '12px'}}>
              <strong>2、</strong>然后小退后，再退出游戏。
            </p>

            <p style={{fontSize: '15px', lineHeight: '1.8', marginBottom: '12px'}}>
              <strong>3、</strong>完成上述操作后，使用本工具进行配置复制。
            </p>

            <div className="warning-box" style={{marginTop: '20px'}}>
              <strong>⚠️ 重要提示：</strong>
              <p>必须取消所有"服务器同步设置"选项（包括技能栏设置、武学助手、聊天栏设置、任务追踪设置、界面常规设置、镜头设置、自定义界面位置、头顶血条、快捷键设置等），否则游戏会自动从服务器下载配置，导致同步失效！</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '第一步：设置游戏路径',
      content: (
        <div className="guide-step">
          <div className="step-image">📁</div>
          <div className="step-description">
            <p>将剑网三的快捷方式拖拽到指定区域即可自动识别配置文件目录。或手动选择游戏目录，选中SeasunGame文件夹即可</p>
            <div className="tip-box">
              <strong>💡 提示：</strong>
              <ul>
                <li>快捷方式通常是在桌面上</li>
                <li>工具会自动识别游戏安装路径</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '第二步：选择源角色',
      content: (
        <div className="guide-step">
          <div className="step-image">👤</div>
          <div className="step-description">
            <p>从左侧列表中选择一个<strong>源角色</strong>（配置来源）。</p>
            <div className="tip-box">
              <strong>💡 提示：</strong>
              <ul>
                <li>可以使用搜索框快速查找角色</li>
                <li>支持按账号、区服、服务器筛选</li>
                <li>源角色的配置将被复制到目标角色</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '第三步：选择目标角色',
      content: (
        <div className="guide-step">
          <div className="step-image">👥</div>
          <div className="step-description">
            <p>从右侧列表中勾选一个或多个<strong>目标角色</strong>（配置接收方）。</p>
            <div className="tip-box">
              <strong>💡 提示：</strong>
              <ul>
                <li>可以同时选择多个目标角色</li>
                <li>目标角色的配置将被源角色的配置覆盖</li>
                <li>建议启用自动备份功能</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '第四步：执行同步',
      content: (
        <div className="guide-step">
          <div className="step-image">🚀</div>
          <div className="step-description">
            <p>确认选项后，点击<strong>"开始复制"</strong>按钮执行同步。</p>
            <div className="tip-box">
              <strong>💡 提示：</strong>
              <ul>
                <li>建议勾选"自动备份"选项</li>
                <li>备份可以在"备份管理"中恢复</li>
                <li>复制完成后会显示详细的结果</li>
              </ul>
            </div>
            <div className="warning-box">
              <strong>⚠️ 注意：</strong>
              <p>同步操作会覆盖目标角色的现有配置，请谨慎操作！</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '备份与恢复',
      content: (
        <div className="guide-step">
          <div className="step-image">💾</div>
          <div className="step-description">
            <p>工具提供了完善的备份管理功能。</p>
            <div className="tip-box">
              <strong>💡 备份管理：</strong>
              <ul>
                <li>点击"备份管理"按钮查看所有备份</li>
                <li>可以随时恢复到之前的配置</li>
                <li>支持搜索和筛选备份记录</li>
                <li>每次复制前建议启用自动备份</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideGuide', 'true');
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content guide-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{steps[currentStep].title}</h2>
          <button className="btn-close" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body guide-body">
          {steps[currentStep].content}

          <div className="guide-progress">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>
        </div>

        <div className="modal-footer guide-footer">
          <label className="dont-show-checkbox">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span>不再显示</span>
          </label>

          <div className="guide-buttons">
            {currentStep > 0 && (
              <button className="btn-secondary" onClick={handlePrev}>
                上一步
              </button>
            )}
            <button className="btn-primary" onClick={handleNext}>
              {currentStep < steps.length - 1 ? '下一步' : '开始使用'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuideDialog;
