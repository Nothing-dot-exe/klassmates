'use client';

import { useState, useRef } from 'react';

interface UseSwipeToReplyProps {
  onReply: () => void;
  threshold?: number;
  maxDrag?: number;
}

export function useSwipeToReply({
  onReply,
  threshold = 45,
  maxDrag = 65,
}: UseSwipeToReplyProps) {
  const [dragX, setDragX] = useState(0);
  const [isTriggered, setIsTriggered] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const hasTriggeredVibration = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
    hasTriggeredVibration.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX.current;
    const deltaY = currentY - startY.current;

    // Only recognize horizontal swipes (avoid interfering with vertical scrolling)
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaX) < 15) {
      return;
    }

    // Only allow swipe to the right
    if (deltaX > 0) {
      const damped = Math.min(deltaX * 0.55, maxDrag);
      setDragX(damped);

      if (damped >= threshold) {
        setIsTriggered(true);
        if (!hasTriggeredVibration.current) {
          try {
            window.navigator?.vibrate?.(20);
          } catch {
            // Ignore if vibration unsupported
          }
          hasTriggeredVibration.current = true;
        }
      } else {
        setIsTriggered(false);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (dragX >= threshold) {
      onReply();
    }

    setDragX(0);
    setIsTriggered(false);
  };

  return {
    dragX,
    isTriggered,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
