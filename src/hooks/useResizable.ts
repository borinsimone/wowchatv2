import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface UseResizableProps {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
}

export const useResizable = ({
  initialWidth,
  minWidth,
  maxWidth,
}: UseResizableProps) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;
    },
    [width]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + deltaX;

      // Clamp width between min and max values
      const clampedWidth = Math.min(
        Math.max(newWidth, minWidth),
        maxWidth
      );
      setWidth(clampedWidth);
    },
    [isResizing, minWidth, maxWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener(
        "mousemove",
        handleMouseMove
      );
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener(
          "mousemove",
          handleMouseMove
        );
        document.removeEventListener(
          "mouseup",
          handleMouseUp
        );
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return {
    width,
    isResizing,
    handleMouseDown,
  };
};
