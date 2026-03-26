interface ClaudeMascotProps {
  size?: number;
  variant?: 'default' | 'thinking' | 'happy';
  className?: string;
}

export default function ClaudeMascot({ size = 40, variant = 'default', className = '' }: ClaudeMascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Claude-inspired mascot */}
      <circle cx="60" cy="60" r="52" fill="var(--accent)" />
      <circle cx="60" cy="60" r="48" fill="var(--accent)" opacity="0.9" />

      {/* Face base */}
      <ellipse cx="60" cy="62" rx="32" ry="30" fill="white" opacity="0.95" />

      {/* Eyes */}
      {variant === 'thinking' ? (
        <>
          <ellipse cx="47" cy="55" rx="4" ry="1.5" fill="var(--accent)" />
          <ellipse cx="73" cy="55" rx="4" ry="1.5" fill="var(--accent)" />
        </>
      ) : (
        <>
          <circle cx="47" cy="55" r="4" fill="var(--accent)" />
          <circle cx="73" cy="55" r="4" fill="var(--accent)" />
          <circle cx="48.5" cy="53.5" r="1.5" fill="white" />
          <circle cx="74.5" cy="53.5" r="1.5" fill="white" />
        </>
      )}

      {/* Mouth */}
      {variant === 'happy' ? (
        <path d="M50 68 Q60 78 70 68" stroke="var(--accent)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M52 70 Q60 74 68 70" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}

      {/* Blush */}
      <circle cx="40" cy="64" r="5" fill="var(--accent)" opacity="0.15" />
      <circle cx="80" cy="64" r="5" fill="var(--accent)" opacity="0.15" />

      {/* Sparkle (thinking variant) */}
      {variant === 'thinking' && (
        <g opacity="0.6">
          <circle cx="88" cy="35" r="2" fill="var(--accent)" />
          <circle cx="94" cy="28" r="1.5" fill="var(--accent)" />
          <circle cx="82" cy="30" r="1" fill="var(--accent)" />
        </g>
      )}
    </svg>
  );
}
