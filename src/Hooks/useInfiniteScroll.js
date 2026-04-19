import { useEffect, useRef } from 'react';

export const useInfiniteScroll = (callback, enabled = true) => {
  const observerTarget = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { threshold: 0.4, rootMargin: '120px' }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
    };
  }, [callback, enabled]);

  return observerTarget;
};