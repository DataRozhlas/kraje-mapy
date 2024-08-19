import { useCallback, useEffect, useRef } from "react";

const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const usePostMessageWithHeight = (id: string) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const postHeightMessage = useCallback(() => {
    if (containerRef.current) {
      const { height } = containerRef.current.getBoundingClientRect();
      if (window.parent) {
        window.parent.postMessage(
          {
            "cro-embed-height": {
              [id]: height,
            },
          },
          "*",
        );
      }
    }
  }, [id]);

  const onResize = useCallback(
    debounce(() => {
      postHeightMessage();
      setTimeout(() => postHeightMessage(), 300);
      setTimeout(() => postHeightMessage(), 1000);
      setTimeout(() => postHeightMessage(), 5000);
    }, 50),
    [postHeightMessage],
  );

  useEffect(() => {
    onResize();

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  return {
    containerRef,
    postHeightMessage,
  };
};
