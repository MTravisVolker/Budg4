import React from 'react';
import AddBankAccountModal from './AddBankAccountModal';

interface RenderAddBankAccountModalProps {
  show: boolean;
  onClose: () => void;
  token: string;
  onAdded?: () => void;
}

const RenderAddBankAccountModal: React.FC<RenderAddBankAccountModalProps> = (props) => {
  if (!props.show) return null;
  return <AddBankAccountModal {...props} />;
};

export default RenderAddBankAccountModal; 