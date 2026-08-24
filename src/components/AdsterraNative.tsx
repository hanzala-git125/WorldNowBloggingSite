'use client';

import { useEffect, useRef } from 'react';

const nativeContainerId = 'container-62622805a10af897b329d2150ec6183c';

const nativeScriptUrl =
  'https://pl31010354.profitableratecpmnetwork.com/62622805a10af897b329d2150ec6183c/invoke.js';

export default function AdsterraNative() {
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot || document.getElementById(nativeContainerId)) return;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = nativeScriptUrl;
    slot.appendChild(script);

    const container = document.createElement('div');
    container.id = nativeContainerId;
    container.className = 'w-full max-w-2xl';
    slot.appendChild(container);

    return () => {
      script.remove();
      container.remove();
    };
  }, []);

  return (
    <div ref={slotRef} className="my-8 flex min-h-[100px] w-full justify-center overflow-hidden">
    </div>
  );
}