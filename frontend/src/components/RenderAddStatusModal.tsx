import React from 'react';
import AddStatusModal from './AddStatusModal';

interface RenderAddStatusModalProps {
  show: boolean;
  onClose: () => void;
  token: string;
  onAdded?: () => void;
}

const RenderAddStatusModal: React.FC<RenderAddStatusModalProps> = (props) => {
  if (!props.show) return null;
  return <AddStatusModal {...props} />;
};

export default RenderAddStatusModal; 