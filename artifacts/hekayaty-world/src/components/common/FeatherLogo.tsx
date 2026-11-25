import React from 'react';

interface FeatherLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
}

export function FeatherLogo({
  className = '',
  size = 'md',
  showText = true,
  animated = true,
}: FeatherLogoProps) {
  const sizeMap = {
    sm: { box: 'w-7 h-7', icon: 28, text: 'text-sm', sub: 'text-[8px]' },
    md: { box: 'w-10 h-10', icon: 40, text: 'text-lg', sub: 'text-[10px]' },
    lg: { box: 'w-14 h-14', icon: 56, text: 'text-2xl', sub: 'text-xs' },
    xl: { box: 'w-20 h-20', icon: 80, text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Official Feather Quill Emblem */}
      <div
        className={`${currentSize.box} rounded-2xl bg-gradient-to-br from-[#087C7B] via-[#119B98] to-[#C5A15B] p-[1.5px] shadow-[0_0_15px_rgba(8,124,123,0.3)] shrink-0 relative ${
          animated ? 'hover:scale-105 hover:shadow-[0_0_22px_rgba(197,161,91,0.45)]' : ''
        } transition-all duration-300`}
      >
        <div className="w-full h-full bg-[#0E131F] rounded-[14px] flex items-center justify-center overflow-hidden relative">
          <svg
            viewBox="0 0 512 512"
            className="w-[85%] h-[85%] transition-transform duration-300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="logoFeatherGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE08B" />
                <stop offset="50%" stopColor="#E1C58B" />
                <stop offset="100%" stopColor="#C5A15B" />
              </linearGradient>
              <linearGradient id="logoTealAccent" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#087C7B" />
                <stop offset="100%" stopColor="#14B8A6" />
              </linearGradient>
            </defs>

            <g transform="translate(256, 260) rotate(-45) translate(-256, -260)">
              {/* Right Vane */}
              <path
                d="M256,60 C320,100 370,180 370,290 C370,330 350,370 330,390 C340,360 335,320 320,285 C310,265 295,240 280,225 C295,200 310,165 305,140 C285,170 270,195 256,220 Z"
                fill="url(#logoFeatherGold)"
              />
              {/* Left Vane */}
              <path
                d="M256,60 C210,110 160,190 160,295 C160,340 180,380 205,400 C190,370 195,330 210,290 C225,250 240,225 256,200 C240,175 225,140 230,120 C240,140 250,170 256,190 Z"
                fill="url(#logoTealAccent)"
              />
              {/* Central Shaft */}
              <path
                d="M256,50 C256,120 255,280 254,410 L256,450 L258,410 C257,280 256,120 256,50 Z"
                fill="#FFF4D4"
              />
            </g>

            {/* Sparkle Star */}
            <g transform="translate(380, 115) scale(0.9)">
              <path
                d="M0,-24 Q0,0 24,0 Q0,0 0,24 Q0,0 -24,0 Q0,0 0,-24 Z"
                fill="#FDE08B"
              />
            </g>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col text-right">
          <span
            className={`font-cinzel ${currentSize.text} font-bold tracking-wider text-[#087C7B] dark:text-[#E1C58B] transition-colors leading-tight`}
          >
            HEKAYATY
          </span>
          <span
            className={`font-arabic ${currentSize.sub} font-bold tracking-[0.2em] text-[#604735] dark:text-[#C5A15B] -mt-0.5`}
          >
            حِـكَـايَـاتِـي
          </span>
        </div>
      )}
    </div>
  );
}
