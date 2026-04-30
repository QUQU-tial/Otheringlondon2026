type SpacerProps = {
  /** Pixel height */
  size: number;
  className?: string;
};

export function Spacer({ size, className = "" }: SpacerProps) {
  return (
    <div className={className.trim()} style={{ height: size }} aria-hidden />
  );
}
