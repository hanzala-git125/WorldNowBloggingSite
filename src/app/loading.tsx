import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-[#faf8f4]">
      <Loader2 className="h-8 w-8 animate-spin text-[#b5150e]" aria-label="Loading" />
    </div>
  );
}