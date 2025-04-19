// app/loading.tsx
import Image from "next/image";

export default function Loading() {
  return (
    <div
      className="
        fixed inset-0
        flex items-center justify-center
        bg-black/80 backdrop-blur-sm
        dark:bg-slate-950/80
        z-50
      "
    >
      <Image
        src="/maxxit.gif" 
        alt="Loading..."
        width={120} 
        height={120}
        unoptimized // ← preserves the animation
        priority // ← loads it ASAP
      />
    </div>
  );
}
