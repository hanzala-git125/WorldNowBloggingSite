'use client';

import { useId } from 'react';
import Script from 'next/script';

export default function AdsterraBanner728() {
  const instanceId = useId().replace(/:/g, '');

  return (
    <div className="flex h-[90px] w-full max-w-[728px] items-center justify-center overflow-hidden">
      <Script id={`adsterra-banner-728-config-${instanceId}`} strategy="afterInteractive">
        {`atOptions = {
  'key' : '87cbf539edf5373f2152dceeb2ef4843',
  'format' : 'iframe',
  'height' : 90,
  'width' : 728,
  'params' : {}
};`}
      </Script>
      <Script
        id={`adsterra-banner-728-${instanceId}`}
        src="https://www.highrevenueformat.com/87cbf539edf5373f2152dceeb2ef4843/invoke.js"
        strategy="afterInteractive"
      />
    </div>
  );
}