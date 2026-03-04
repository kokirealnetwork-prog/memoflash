import React, { useCallback, useRef, useState } from 'react';

interface LongPressOptions {
  shouldPreventDefault?: boolean;
  delay?: number;
}

export const useLongPress = (
  onLongPress: () => void,
  onCancel: () => void,
  { shouldPreventDefault = true, delay = 300 }: LongPressOptions = {}
) => {
  const [isPressing, setIsPressing] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetRef = useRef<EventTarget | null>(null);

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (shouldPreventDefault && event.target) {
        targetRef.current = event.target;
      }
      
      setIsPressing(true);
      
      timeout.current = setTimeout(() => {
        onLongPress();
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (_event: React.MouseEvent | React.TouchEvent, shouldTriggerCancel = true) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      setIsPressing(false);
      if (shouldTriggerCancel) {
        onCancel();
      }
    },
    [onCancel]
  );

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
    isPressing // Expose state if needed for visual feedback
  };
};