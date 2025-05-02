import React from 'react';
import { formatCurrency } from '../utils/format';

interface SubtotalRowProps {
  subtotal: number;
  accountName: string;
  fontColor?: string;
  rowKey: string;
}

const SubtotalRow: React.FC<SubtotalRowProps> = ({ subtotal, accountName, fontColor, rowKey }) => (
  <tr key={rowKey} style={{ fontWeight: 'bold', background: '#f3f4f6', color: fontColor }}>
    <td colSpan={6} style={{ textAlign: 'right' }}>{`Subtotal ${accountName}`}</td>
    <td style={{ textAlign: 'right' }}>{formatCurrency(subtotal)}</td>
  </tr>
);

export default SubtotalRow; 