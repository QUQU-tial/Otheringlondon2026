export function Divider({ className = "" }: { className?: string }) {
  return (
    <hr
      className={`border-0 h-px w-full bg-[#1C1C1C]/10 ${className}`.trim()}
      aria-hidden
    />
  );
}
