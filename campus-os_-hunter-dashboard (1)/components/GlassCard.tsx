import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'blue' | 'violet' | 'red';
  variant?: 'simple' | 'tech' | 'alert';
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowColor = 'blue',
  variant = 'simple'
}) => {
  const glowStyles = {
    blue: 'shadow-[0_0_20px_rgba(59,130,246,0.15)] border-blue-500/30',
    violet: 'shadow-[0_0_20px_rgba(139,92,246,0.15)] border-violet-500/30',
    red: 'shadow-[0_0_20px_rgba(239,68,68,0.25)] border-red-500/30',
  };

  const isAlert = variant === 'alert';
  const isTech = variant === 'tech';

  return (
    <div className={`
      relative overflow-hidden
      bg-white/40 
      backdrop-blur-xl 
      border 
      ${isAlert ? 'rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm' : 'rounded-2xl'}
      ${glowStyles[glowColor]}
      transition-all duration-300
      hover:bg-white/50
      group
      ${className}
    `}
      style={isAlert ? { clipPath: 'polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)' } : {}}
    >
      {/* Subtle sheen effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent pointer-events-none" />

      {/* Tech HUD Decorations */}
      {(isTech || isAlert) && (
        <>
          {/* Corner brackets */}
          <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${isAlert ? 'border-red-400' : 'border-blue-400'} opacity-50`} />
          <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${isAlert ? 'border-red-400' : 'border-blue-400'} opacity-50`} />
          <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${isAlert ? 'border-red-400' : 'border-blue-400'} opacity-50`} />
          {!isAlert && <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400 opacity-50" />}

          {/* Side ticks */}
          <div className="absolute top-1/2 left-0 w-1 h-3 bg-current opacity-30 -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-1 h-3 bg-current opacity-30 -translate-y-1/2" />
        </>
      )}

      {/* Alert specific decorations */}
      {isAlert && (
        <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(239,68,68,0.05)_5px,rgba(239,68,68,0.05)_10px)] pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;