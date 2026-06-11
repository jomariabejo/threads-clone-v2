import { useCallback, useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
  url: string | null;
  onMessage?: (data: unknown) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

const MAX_RECONNECT_ATTEMPTS = 10;
const MAX_RECONNECT_DELAY = 30000;

export function useWebSocket({ url, onMessage, reconnect = true, reconnectInterval = 3000 }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(true);
  const reconnectAttemptsRef = useRef(0);

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!url) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
      shouldReconnectRef.current = true;
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = event => {
      try {
        onMessageRef.current?.(JSON.parse(event.data));
      }
      catch {
        // ignore malformed messages
      }
    };

    ws.onclose = event => {
      setIsConnected(false);
      wsRef.current = null;

      if (shouldReconnectRef.current && reconnect && event.code !== 1000) {
        reconnectAttemptsRef.current += 1;

        if (reconnectAttemptsRef.current <= MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(reconnectInterval * 2 ** (reconnectAttemptsRef.current - 1), MAX_RECONNECT_DELAY);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      }
    };

    wsRef.current = ws;
  }, [url, reconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }

    return false;
  }, []);

  useEffect(() => {
    if (url) {
      shouldReconnectRef.current = true;
      reconnectAttemptsRef.current = 0;
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]);

  return { isConnected, disconnect, reconnect: connect, send };
}
