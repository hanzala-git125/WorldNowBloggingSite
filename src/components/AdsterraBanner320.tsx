import Script from 'next/script';

export default function AdsterraBanner320() {
  return (
    <div className="flex h-[50px] w-full max-w-[320px] items-center justify-center overflow-hidden">
      <Script id="adsterra-banner-320-config" strategy="afterInteractive">
        {`atOptions = {
  'key' : 'c44da66b6c8431ba7cac57026cbd6843',
  'format' : 'iframe',
  'height' : 50,
  'width' : 320,
  'params' : {}
};`}
      </Script>
      <Script
        id="adsterra-banner-320"
        src="https://www.highrevenueformat.com/c44da66b6c8431ba7cac57026cbd6843/invoke.js"
        strategy="afterInteractive"
      />
    </div>
  );
}