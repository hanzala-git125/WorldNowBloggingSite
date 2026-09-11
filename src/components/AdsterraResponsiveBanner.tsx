'use client';

import { useEffect, useState } from 'react';
import AdsterraBanner320 from './AdsterraBanner320';
import AdsterraBanner728 from './AdsterraBanner728';

export default function AdsterraResponsiveBanner() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  return (
    <div className="my-8 flex min-h-[50px] w-full justify-center overflow-hidden px-0 sm:min-h-[90px]">
      {isMobile === true ? <AdsterraBanner320 /> : null}
      {isMobile === false ? <AdsterraBanner728 /> : null}
    </div>
  );
}