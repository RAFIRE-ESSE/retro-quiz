import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// 1. Master Retro Arcade Logo Emblem (Badge style with 80s geometric banner)
export function RetroArcadeLogo({ size = 48, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      {/* Outer chunky border card */}
      <rect x="4" y="4" width="56" height="56" rx="8" fill="#D5E7B5" stroke="#934761" strokeWidth="4" />
      <rect x="8" y="8" width="48" height="48" rx="6" fill="#934761" />
      {/* Corner geometric rivets */}
      <circle cx="12" cy="12" r="2" fill="#D5E7B5" />
      <circle cx="52" cy="12" r="2" fill="#D5E7B5" />
      <circle cx="12" cy="52" r="2" fill="#D5E7B5" />
      <circle cx="52" cy="52" r="2" fill="#D5E7B5" />
      {/* Arcade Joystick Base */}
      <rect x="20" y="38" width="24" height="14" rx="3" fill="#AD5C71" stroke="#D5E7B5" strokeWidth="2.5" />
      {/* Joystick Shaft */}
      <rect x="30" y="22" width="4" height="17" fill="#D5E7B5" />
      {/* Joystick Ball Top */}
      <circle cx="32" cy="20" r="8" fill="#72BAA9" stroke="#D5E7B5" strokeWidth="2.5" />
      <circle cx="30" cy="18" r="2.5" fill="#D5E7B5" />
      {/* Arcade Action Buttons */}
      <circle cx="48" cy="33" r="3.5" fill="#72BAA9" stroke="#D5E7B5" strokeWidth="1.5" />
      <circle cx="43" cy="25" r="3" fill="#D5E7B5" stroke="#AD5C71" strokeWidth="1.5" />
      <circle cx="16" cy="32" r="2" fill="#72BAA9" />
    </svg>
  );
}

// 2. Retro Floppy Disk (3.5" Diskette)
export function RetroFloppyIcon({ size = 32, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      {/* Disk Body */}
      <rect x="3" y="3" width="26" height="26" rx="3" fill="#934761" stroke="#3b1422" strokeWidth="2" />
      {/* Cut corner */}
      <path d="M25 3L29 7" stroke="#3b1422" strokeWidth="2" strokeLinecap="round" />
      {/* Metal Shutter Slider */}
      <rect x="7" y="3" width="16" height="11" rx="1.5" fill="#72BAA9" stroke="#3b1422" strokeWidth="1.5" />
      <rect x="10" y="6" width="4" height="6" rx="1" fill="#934761" />
      {/* Paper Label Area */}
      <rect x="6" y="17" width="20" height="10" rx="1.5" fill="#D5E7B5" stroke="#3b1422" strokeWidth="1.5" />
      {/* Label handwritten lines */}
      <line x1="9" y1="21" x2="23" y2="21" stroke="#AD5C71" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="24" x2="19" y2="24" stroke="#AD5C71" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 3. Retro CRT Computer / Terminal
export function RetroTerminalIcon({ size = 32, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      {/* Monitor Chassis */}
      <rect x="3" y="4" width="26" height="19" rx="3" fill="#D5E7B5" stroke="#934761" strokeWidth="2" />
      {/* Curved CRT Screen Bezel */}
      <rect x="6" y="7" width="20" height="13" rx="2" fill="#3b1422" stroke="#934761" strokeWidth="1.5" />
      {/* Glowing Green Phosphor Cursor & Prompt */}
      <path d="M9 11L12 13.5L9 16" stroke="#72BAA9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14" y1="16" x2="19" y2="16" stroke="#72BAA9" strokeWidth="2" strokeLinecap="round" />
      {/* Monitor Stand Base */}
      <path d="M12 23L10 27H22L20 23" fill="#AD5C71" stroke="#934761" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="6" y="27" width="20" height="2" rx="1" fill="#934761" />
    </svg>
  );
}

// 4. Retro Science Atom with Orbital Electrons
export function RetroAtomIcon({ size = 32, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      {/* Nucleus Core */}
      <circle cx="16" cy="16" r="4.5" fill="#AD5C71" stroke="#934761" strokeWidth="2" />
      <circle cx="14.5" cy="14.5" r="1.5" fill="#D5E7B5" />
      {/* Orbital Ring 1 */}
      <ellipse cx="16" cy="16" rx="13" ry="5.5" stroke="#72BAA9" strokeWidth="2" transform="rotate(30 16 16)" />
      {/* Orbital Ring 2 */}
      <ellipse cx="16" cy="16" rx="13" ry="5.5" stroke="#934761" strokeWidth="2" transform="rotate(-30 16 16)" />
      {/* Electrons */}
      <circle cx="26" cy="11" r="2.5" fill="#72BAA9" stroke="#934761" strokeWidth="1.5" />
      <circle cx="6" cy="21" r="2.5" fill="#AD5C71" stroke="#934761" strokeWidth="1.5" />
    </svg>
  );
}

// 5. Retro Greek / Roman Column (World History)
export function RetroColumnIcon({ size = 32, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      {/* Capital Top */}
      <rect x="6" y="4" width="20" height="3" rx="1" fill="#934761" stroke="#3b1422" strokeWidth="1.5" />
      <path d="M4 7C4 8.5 6 9.5 8 9.5H24C26 9.5 28 8.5 28 7" stroke="#3b1422" strokeWidth="1.5" fill="#D5E7B5" />
      {/* Shaft Pillars */}
      <rect x="8" y="9.5" width="16" height="15" fill="#D5E7B5" stroke="#3b1422" strokeWidth="1.5" />
      <line x1="12" y1="10" x2="12" y2="24" stroke="#AD5C71" strokeWidth="1.5" />
      <line x1="16" y1="10" x2="16" y2="24" stroke="#AD5C71" strokeWidth="1.5" />
      <line x1="20" y1="10" x2="20" y2="24" stroke="#AD5C71" strokeWidth="1.5" />
      {/* Base Pedestal */}
      <rect x="6" y="24.5" width="20" height="3" fill="#72BAA9" stroke="#3b1422" strokeWidth="1.5" />
      <rect x="4" y="27" width="24" height="2.5" rx="1" fill="#934761" stroke="#3b1422" strokeWidth="1.5" />
    </svg>
  );
}

// 6. Retro Lightning Bolt (Time Attack / Blitz Mode)
export function RetroLightningIcon({ size = 32, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      {/* Retro 80s 3D offset shadow */}
      <path d="M19 3L7 17H16L13 29L25 15H16L19 3Z" fill="#934761" />
      {/* Main vibrant lightning face */}
      <path d="M17 1L5 15H14L11 27L23 13H14L17 1Z" fill="#72BAA9" stroke="#3b1422" strokeWidth="2" strokeLinejoin="bevel" />
      <path d="M14 4L7 14H13L11.5 23" stroke="#D5E7B5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// 7. Retro Coffee Mug (Relaxed Practice Mode)
export function RetroCoffeeIcon({ size = 32, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      {/* Steam lines */}
      <path d="M11 4C10 5.5 12 7 11 8.5" stroke="#AD5C71" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 3C15 5 17 6.5 16 8.5" stroke="#AD5C71" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21 4C20 5.5 22 7 21 8.5" stroke="#AD5C71" strokeWidth="1.8" strokeLinecap="round" />
      {/* Mug Body */}
      <path d="M6 10H23V20C23 24 19 27 14.5 27C10 27 6 24 6 20V10Z" fill="#72BAA9" stroke="#934761" strokeWidth="2" />
      {/* Mug Graphic Stripe */}
      <path d="M6 15H23V18H6V15Z" fill="#D5E7B5" />
      {/* Handle */}
      <path d="M23 12H26C28 12 29 14 29 16C29 18 28 20 26 20H22" stroke="#934761" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 8. Retro Pixel Skull (Sudden Death / Survival Mode)
export function RetroSkullIcon({ size = 32, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      {/* Skull Cranium */}
      <path d="M7 6H25V18H22V22H10V18H7V6Z" fill="#D5E7B5" stroke="#934761" strokeWidth="2" strokeLinejoin="miter" />
      {/* Pixel Eye Sockets */}
      <rect x="9" y="10" width="5" height="6" fill="#934761" />
      <rect x="18" y="10" width="5" height="6" fill="#934761" />
      {/* Nose cavity */}
      <rect x="15" y="17" width="2" height="3" fill="#934761" />
      {/* Teeth Jaw */}
      <rect x="11" y="22" width="10" height="6" fill="#D5E7B5" stroke="#934761" strokeWidth="2" />
      <line x1="14" y1="22" x2="14" y2="28" stroke="#934761" strokeWidth="2" />
      <line x1="18" y1="22" x2="18" y2="28" stroke="#934761" strokeWidth="2" />
    </svg>
  );
}

// 9. Retro Joystick Icon (Standard Arcade Mode)
export function RetroJoystickIcon({ size = 32, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      {/* Base Console */}
      <rect x="4" y="18" width="24" height="10" rx="3" fill="#AD5C71" stroke="#934761" strokeWidth="2" />
      <line x1="7" y1="24" x2="12" y2="24" stroke="#D5E7B5" strokeWidth="2" strokeLinecap="round" />
      {/* Stick Shaft */}
      <line x1="16" y1="9" x2="16" y2="18" stroke="#D5E7B5" strokeWidth="3.5" strokeLinecap="round" />
      {/* Ball Top */}
      <circle cx="16" cy="8" r="6" fill="#72BAA9" stroke="#934761" strokeWidth="2" />
      <circle cx="14.5" cy="6.5" r="1.5" fill="#D5E7B5" />
      {/* Action Buttons */}
      <circle cx="21" cy="22" r="2" fill="#72BAA9" stroke="#934761" strokeWidth="1.2" />
      <circle cx="24.5" cy="20" r="1.8" fill="#D5E7B5" stroke="#934761" strokeWidth="1.2" />
    </svg>
  );
}

// 10. Retro Trophy Medal with Ribbons (Leaderboard / High Scores)
export function RetroTrophyIcon({ size = 32, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      {/* Ribbons hanging */}
      <path d="M12 18L7 30L13 27L16 22" fill="#AD5C71" stroke="#934761" strokeWidth="1.5" />
      <path d="M20 18L25 30L19 27L16 22" fill="#72BAA9" stroke="#934761" strokeWidth="1.5" />
      {/* Cup / Medal Rosette */}
      <circle cx="16" cy="13" r="10" fill="#D5E7B5" stroke="#934761" strokeWidth="2.5" />
      <circle cx="16" cy="13" r="7.5" fill="#72BAA9" stroke="#934761" strokeWidth="1.5" />
      {/* Star emblem in center */}
      <path d="M16 7.5L17.5 11.5H21.5L18.2 13.8L19.5 17.5L16 15.2L12.5 17.5L13.8 13.8L10.5 11.5H14.5L16 7.5Z" fill="#D5E7B5" stroke="#934761" strokeWidth="1" />
    </svg>
  );
}

// 11. Retro Drafting Pencil (Quiz Creator / Builder)
export function RetroPencilIcon({ size = 32, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M23 4L28 9L11 26L5 28L7 22L23 4Z" fill="#72BAA9" stroke="#934761" strokeWidth="2" strokeLinejoin="round" />
      {/* Pencil Eraser */}
      <path d="M20 7L23 4L28 9L25 12" fill="#AD5C71" stroke="#934761" strokeWidth="2" strokeLinejoin="round" />
      {/* Ferrule metal band */}
      <line x1="18.5" y1="8.5" x2="23.5" y2="13.5" stroke="#D5E7B5" strokeWidth="2.5" />
      {/* Graphite Tip */}
      <polygon points="5,28 7,22 10,25" fill="#D5E7B5" stroke="#934761" strokeWidth="1.5" />
      <polygon points="5,28 6,25 8,27" fill="#934761" />
    </svg>
  );
}

// 12. Retro Speaker / Audio Toggle Icons
export function RetroSpeakerIcon({ size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M4 9H8L13 5V19L8 15H4V9Z" fill="#72BAA9" stroke="#934761" strokeWidth="2" strokeLinejoin="round" />
      {/* Sound waves */}
      <path d="M16 8C17.5 9.5 17.5 14.5 16 16" stroke="#934761" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 6C22 9 22 15 19 18" stroke="#AD5C71" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function RetroMuteIcon({ size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M4 9H8L13 5V19L8 15H4V9Z" fill="#AD5C71" stroke="#934761" strokeWidth="2" strokeLinejoin="round" />
      <line x1="16" y1="9" x2="21" y2="15" stroke="#934761" strokeWidth="2" strokeLinecap="round" />
      <line x1="21" y1="9" x2="16" y2="15" stroke="#934761" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 13. Retro 80s TV / CRT Monitor Icon
export function RetroCrtTvIcon({ size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      {/* Antennas */}
      <line x1="6" y1="2" x2="10" y2="7" stroke="#934761" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="18" y1="2" x2="14" y2="7" stroke="#934761" strokeWidth="1.8" strokeLinecap="round" />
      {/* TV Box */}
      <rect x="2" y="7" width="20" height="14" rx="2.5" fill="#D5E7B5" stroke="#934761" strokeWidth="2" />
      {/* Screen */}
      <rect x="4" y="9" width="12" height="10" rx="1.5" fill="#72BAA9" stroke="#934761" strokeWidth="1.5" />
      {/* Dials */}
      <circle cx="19" cy="11" r="1.5" fill="#AD5C71" />
      <circle cx="19" cy="15" r="1.5" fill="#934761" />
    </svg>
  );
}

// 14. Retro Arcade Coin Token
export function RetroCoinIcon({ size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <circle cx="12" cy="12" r="10" fill="#72BAA9" stroke="#934761" strokeWidth="2" />
      <circle cx="12" cy="12" r="7.5" fill="#D5E7B5" stroke="#AD5C71" strokeWidth="1.5" />
      <path d="M12 7L13.2 10.5H16.8L14 12.5L15 16L12 14L9 16L10 12.5L7.2 10.5H10.8L12 7Z" fill="#934761" />
    </svg>
  );
}

// 15. Retro Flame (Streak Multiplier)
export function RetroFlameIcon({ size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path d="M12 2C12 2 16 6 16 11C16 13.5 17 14.5 18 15C19 16 20 17 20 18.5C20 20.5 18.5 22 16.5 22C14 22 13 20 12 18C11 20 10 22 7.5 22C5.5 22 4 20.5 4 18.5C4 16.5 6 14.5 8 13C8 10 9 7 12 2Z" fill="#AD5C71" stroke="#934761" strokeWidth="1.8" />
      <path d="M12 10C12 10 14 13 14 16C14 17.5 13.5 18 13 18.5C12.5 19 12 20 12 20C12 20 11.5 19 11 18.5C10.5 18 10 17.5 10 16C10 13 12 10 12 10Z" fill="#D5E7B5" stroke="#934761" strokeWidth="1.2" />
    </svg>
  );
}

// 16. Retro Stopwatch (Question Timer)
export function RetroClockIcon({ size = 24, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      {/* Crown button */}
      <rect x="10.5" y="1" width="3" height="3" rx="0.5" fill="#934761" />
      {/* Body */}
      <circle cx="12" cy="13" r="9" fill="#D5E7B5" stroke="#934761" strokeWidth="2" />
      {/* Clock ticks */}
      <line x1="12" y1="6" x2="12" y2="7.5" stroke="#AD5C71" strokeWidth="1.5" />
      <line x1="12" y1="18.5" x2="12" y2="20" stroke="#AD5C71" strokeWidth="1.5" />
      <line x1="5" y1="13" x2="6.5" y2="13" stroke="#AD5C71" strokeWidth="1.5" />
      <line x1="17.5" y1="13" x2="19" y2="13" stroke="#AD5C71" strokeWidth="1.5" />
      {/* Hands */}
      <line x1="12" y1="13" x2="12" y2="8.5" stroke="#934761" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="13" x2="16" y2="13" stroke="#72BAA9" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="13" r="1.5" fill="#934761" />
    </svg>
  );
}
