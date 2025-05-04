import React from 'react';
import AddRecurrenceModal from './AddRecurrenceModal';

interface RenderAddRecurrenceModalProps {
  show: boolean;
  onClose: () => void;
  token: string;
  onAdded?: () => void;
}

const RenderAddRecurrenceModal: React.FC<RenderAddRecurrenceModalProps> = (props) => {
  if (!props.show) return null;
  return <AddRecurrenceModal {...props} />;
};

export default RenderAddRecurrenceModal; 