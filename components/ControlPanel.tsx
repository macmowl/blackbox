import React from 'react';

interface ControlPanelProps {
  shootMode: boolean;
  setShootMode: (mode: boolean) => void;
  atomCount: number;
  rayResult: string | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  shootMode,
  setShootMode,
  atomCount,
  rayResult,
}) => {
  return (
    <div>
      <button onClick={() => setShootMode(!shootMode)}>
        {shootMode ? 'Switch to Place Atoms' : 'Switch to Shoot Rays'}
      </button>
      <p>Atoms placed: {atomCount} / 5</p>
      {rayResult && <p>{rayResult}</p>}
    </div>
  );
};

export default ControlPanel;
