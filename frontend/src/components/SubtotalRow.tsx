import React from 'react';
import { formatCurrency } from '../utils/format';

interface SubtotalRowProps {
  subtotal: number;
  accountName: string;
  fontColor?: string;
  rowKey: string;
}

const SubtotalRow: React.FC<SubtotalRowProps> = ({ subtotal, accountName, fontColor, rowKey }) => (
  <tr key={rowKey} style={{ fontWeight: 'bold', background: subtotal < 0 ? '#ffeaea' : '#f3f4f6', color: fontColor }}>
    <td colSpan={7} style={{ textAlign: 'right' }}>{`Subtotal ${accountName}`}</td>
    <td style={{ textAlign: 'right', color: subtotal < 0 ? 'red' : undefined }}>{formatCurrency(subtotal)}</td>
    <td></td>
  </tr>
);

export default SubtotalRow; 