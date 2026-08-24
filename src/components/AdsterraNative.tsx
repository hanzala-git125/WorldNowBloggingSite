import Script from 'next/script';

interface AdsterraNativeProps {
  containerId?: string;
}

const nativeScriptUrl =
  'https://pl31010354.profitableratecpmnetwork.com/62622805a10af897b329d2150ec6183c/invoke.js';

export default function AdsterraNative({
  containerId = 'container-62622805a10af897b329d2150ec6183c',
}: AdsterraNativeProps) {
  return (
    <div className="my-8 flex min-h-[100px] w-full justify-center overflow-hidden">
      <Script
        id={`adsterra-native-${containerId}`}
        src={nativeScriptUrl}
        strategy="afterInteractive"
        async
        data-cfasync="false"
      />
      <div id={containerId} className="w-full max-w-2xl" />
    </div>
  );
}