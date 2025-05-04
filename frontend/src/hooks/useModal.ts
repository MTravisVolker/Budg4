import { useState, useCallback } from 'react';

export default function useModal(initial: boolean = false): [boolean, () => void, () => void] {
  const [show, setShow] = useState(initial);
  const open = useCallback(() => setShow(true), []);
  const close = useCallback(() => setShow(false), []);
  return [show, open, close];
} 