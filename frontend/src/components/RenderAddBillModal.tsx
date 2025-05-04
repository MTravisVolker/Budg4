import React from 'react';
import AddBillModal from './AddBillModal';

interface RenderAddBillModalProps {
  show: boolean;
  onClose: () => void;
  token: string;
  accounts: { id: number; name: string; font_color: string }[];
  categories: { id: number; name: string }[];
  recurrences: { id: number; name: string }[];
  onAdded?: () => void;
  onAddAccount?: () => void;
  onAddCategory?: () => void;
  onAddRecurrence?: () => void;
}

const RenderAddBillModal: React.FC<RenderAddBillModalProps> = (props) => {
  if (!props.show) return null;
  return <AddBillModal {...props} />;
};

export default RenderAddBillModal; 