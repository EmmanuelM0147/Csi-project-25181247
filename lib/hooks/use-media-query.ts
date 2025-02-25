"use client";

import { useState, useEffect } from 'react';
import { breakpoints, Breakpoint } from '../responsive-design';

export function useMediaQuery(breakpoint: Breakpoint, type: 'min' | 'max' = 'min') {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = `(${type}-width: ${breakpoints[breakpoint]}px)`;
    const mediaQuery = window.matchMedia(query);
    
    const updateMatches = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches(e.matches);
    };

    updateMatches(mediaQuery);
    mediaQuery.addListener(updateMatches);

    return () => mediaQuery.removeListener(updateMatches);
  }, [breakpoint, type]);

  return matches;
}