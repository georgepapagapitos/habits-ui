import { describe, test, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';
import { renderWithProviders } from '../../../tests/utils';

// Mock the scroll lock functions
vi.mock('../../../common/utils/scrollLock', () => ({
  lockScroll: vi.fn(),
  unlockScroll: vi.fn(),
}));

describe('Modal', () => {
  test('renders modal with children', () => {
    const onClose = vi.fn();
    
    renderWithProviders(
      <Modal onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    );
    
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  test('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    
    renderWithProviders(
      <Modal onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    );
    
    // Click the overlay
    fireEvent.click(screen.getByText('Modal Content').parentElement?.parentElement as HTMLElement);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when ESC key is pressed', () => {
    const onClose = vi.fn();
    
    renderWithProviders(
      <Modal onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    );
    
    // Press ESC key
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});