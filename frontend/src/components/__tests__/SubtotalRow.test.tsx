import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SubtotalRow from '../SubtotalRow';

describe('SubtotalRow', () => {
  it('renders positive subtotal with correct formatting and color', () => {
    render(
      <table><tbody>
        <SubtotalRow subtotal={1234.56} accountName="Checking" fontColor="#000000" rowKey="subtotal-1" />
      </tbody></table>
    );
    expect(screen.getByText('Subtotal Checking')).toBeInTheDocument();
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    const subtotalCell = screen.getByText('$1,234.56');
    expect(subtotalCell).not.toHaveStyle({ color: 'red' });
    const row = subtotalCell.closest('tr');
    expect(row).toHaveStyle({ color: '#000000', background: '#f3f4f6', fontWeight: 'bold' });
  });

  it('renders negative subtotal with red color and correct formatting', () => {
    render(
      <table><tbody>
        <SubtotalRow subtotal={-100.5} accountName="Savings" fontColor="#333333" rowKey="subtotal-2" />
      </tbody></table>
    );
    expect(screen.getByText('Subtotal Savings')).toBeInTheDocument();
    expect(screen.getByText('-$100.50')).toBeInTheDocument();
    const subtotalCell = screen.getByText('-$100.50');
    expect(subtotalCell).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    const row = subtotalCell.closest('tr');
    expect(row).toHaveStyle({ color: '#333333', background: '#ffeaea', fontWeight: 'bold' });
  });

  it('renders with no fontColor provided', () => {
    render(
      <table><tbody>
        <SubtotalRow subtotal={500} accountName="NoColor" rowKey="subtotal-3" />
      </tbody></table>
    );
    expect(screen.getByText('Subtotal NoColor')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    const row = screen.getByText('$500.00').closest('tr');
    expect(row).toHaveStyle({ background: '#f3f4f6', fontWeight: 'bold' });
  });

  it('renders with zero subtotal', () => {
    render(
      <table><tbody>
        <SubtotalRow subtotal={0} accountName="Zero" fontColor="#111111" rowKey="subtotal-4" />
      </tbody></table>
    );
    expect(screen.getByText('Subtotal Zero')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
    const row = screen.getByText('$0.00').closest('tr');
    expect(row).toHaveStyle({ color: '#111111', background: '#f3f4f6', fontWeight: 'bold' });
  });

  it('renders with very large numbers', () => {
    render(
      <table><tbody>
        <SubtotalRow subtotal={1234567.89} accountName="Large" fontColor="#222222" rowKey="subtotal-5" />
      </tbody></table>
    );
    expect(screen.getByText('Subtotal Large')).toBeInTheDocument();
    expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
    const row = screen.getByText('$1,234,567.89').closest('tr');
    expect(row).toHaveStyle({ color: '#222222', background: '#f3f4f6', fontWeight: 'bold' });
  });

  it('renders with very small negative numbers', () => {
    render(
      <table><tbody>
        <SubtotalRow subtotal={-0.01} accountName="Small" fontColor="#444444" rowKey="subtotal-6" />
      </tbody></table>
    );
    expect(screen.getByText('Subtotal Small')).toBeInTheDocument();
    expect(screen.getByText('-$0.01')).toBeInTheDocument();
    const subtotalCell = screen.getByText('-$0.01');
    expect(subtotalCell).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    const row = subtotalCell.closest('tr');
    expect(row).toHaveStyle({ color: '#444444', background: '#ffeaea', fontWeight: 'bold' });
  });

  it('renders with account name containing special characters', () => {
    render(
      <table><tbody>
        <SubtotalRow subtotal={100} accountName="Account & Co. (123)" fontColor="#555555" rowKey="subtotal-7" />
      </tbody></table>
    );
    expect(screen.getByText('Subtotal Account & Co. (123)')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    const row = screen.getByText('$100.00').closest('tr');
    expect(row).toHaveStyle({ color: '#555555', background: '#f3f4f6', fontWeight: 'bold' });
  });
}); 