import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f4]">
      <Loader2 className="h-10 w-10 animate-spin text-[#b5150e]" aria-label="Loading article" />
    </div>
  );
}