import React from 'react';
import AddCategoryModal from './AddCategoryModal';

interface RenderAddCategoryModalProps {
  show: boolean;
  onClose: () => void;
  token: string;
  onAdded?: () => void;
}

const RenderAddCategoryModal: React.FC<RenderAddCategoryModalProps> = (props) => {
  if (!props.show) return null;
  return <AddCategoryModal {...props} />;
};

export default RenderAddCategoryModal; 