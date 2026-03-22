import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface FlashMessage {
  type: 'success' | 'error';
  text: string;
}

export function useFlashMessage() {
  const location = useLocation();
  const messageFromState = (location.state as { message?: string } | null)?.message;

  const [message, setMessage] = useState<FlashMessage | null>(
    messageFromState ? { type: 'success', text: messageFromState } : null
  );

  useEffect(() => {
    if (messageFromState) {
      window.history.replaceState({}, '');
    }
  }, [messageFromState]);

  return { message, setMessage };
}
