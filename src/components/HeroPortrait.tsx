/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CharacterId } from '../game/types';

interface HeroPortraitProps {
  charId: CharacterId | 'vice_boss' | 'raptor' | 'enraged_raptor' | 'poacher';
  size?: number;
  className?: string;
  showBorder?: boolean;
}

export const HeroPortrait: React.FC<HeroPortraitProps> = ({
  charId,
  size = 64,
  className = '',
  showBorder = true,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-zinc-950 ${
        showBorder ? 'border-2 border-yellow-400 shadow-md' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {charId === 'mustapha' && (
        // Mustapha Cairo: Pale khaki cap, green curved visor, green emblem patch, groomed beard & mustache, safari green shirt
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
          <defs>
            <radialGradient id="musSkin" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#C98C5A" />
              <stop offset="100%" stopColor="#9C6234" />
            </radialGradient>
            <linearGradient id="musCap" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5E39E" />
              <stop offset="100%" stopColor="#D8BE76" />
            </linearGradient>
            <linearGradient id="musShirt" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4A984E" />
              <stop offset="100%" stopColor="#2E6B32" />
            </linearGradient>
          </defs>
          {/* Background aura */}
          <circle cx="50" cy="50" r="48" fill="#18181B" />
          {/* Safari Green Shirt with Broad Shoulders */}
          <path d="M14,96 Q50,72 86,96 L86,100 L14,100 Z" fill="url(#musShirt)" stroke="#163819" strokeWidth="2" />
          {/* Center Button Placket */}
          <rect x="47" y="78" width="6" height="22" fill="#2E6B32" />
          <circle cx="50" cy="84" r="1.5" fill="#1B461E" />
          <circle cx="50" cy="92" r="1.5" fill="#1B461E" />
          {/* Open V-Collar Lapels */}
          <polygon points="36,72 45,86 48,74" fill="#3D8241" stroke="#163819" strokeWidth="1" />
          <polygon points="64,72 55,86 52,74" fill="#3D8241" stroke="#163819" strokeWidth="1" />
          {/* Muscular Neck & Clavicle */}
          <path d="M41,60 L41,75 Q50,80 59,75 L59,60 Z" fill="url(#musSkin)" />
          <path d="M48,68 Q50,72 52,68" stroke="#7A4722" strokeWidth="1.5" fill="none" />
          {/* Chiseled Jaw & Head */}
          <path d="M31,38 Q50,28 69,38 L69,57 Q67,73 50,74 Q33,73 31,57 Z" fill="url(#musSkin)" stroke="#26120C" strokeWidth="1.8" />
          {/* Groomed Dark Beard framing Jawline & Chin */}
          <path d="M31,52 Q33,73 50,74 Q67,73 69,52 L69,58 Q66,76 50,77 Q34,76 31,58 Z" fill="#201813" />
          {/* Chin Goatee */}
          <ellipse cx="50" cy="70" rx="6" ry="4" fill="#201813" />
          {/* Signature Mustache connecting to beard */}
          <path d="M38,62 Q50,58 62,62 Q50,66 38,62 Z" fill="#201813" />
          {/* Nose */}
          <path d="M50,47 L47,56 L53,56" stroke="#683918" strokeWidth="2" fill="none" />
          {/* Determined Eyes */}
          <ellipse cx="42" cy="48" rx="4.5" ry="2.8" fill="#FFF" />
          <circle cx="43.5" cy="48" r="2.2" fill="#2B1A10" />
          <circle cx="44" cy="47.5" r="0.9" fill="#000" />
          <ellipse cx="58" cy="48" rx="4.5" ry="2.8" fill="#FFF" />
          <circle cx="59.5" cy="48" r="2.2" fill="#2B1A10" />
          <circle cx="60" cy="47.5" r="0.9" fill="#000" />
          {/* Eyebrows */}
          <path d="M35,44 Q42,40 47,43" stroke="#201813" strokeWidth="2.8" fill="none" />
          <path d="M53,43 Q58,40 65,44" stroke="#201813" strokeWidth="2.8" fill="none" />
          {/* Pale Khaki Baseball Cap Dome */}
          <path d="M22,35 Q50,12 78,35 Q68,43 50,41 Q32,43 22,35 Z" fill="url(#musCap)" stroke="#3B2E15" strokeWidth="2" />
          {/* Cap Crown Button */}
          <ellipse cx="50" cy="20" rx="3.5" ry="1.8" fill="#E4C876" />
          {/* Forest Green Curved Visor / Brim */}
          <path d="M19,35 Q50,28 81,35 L79,42 Q50,34 21,42 Z" fill="#265F32" stroke="#123B1A" strokeWidth="1.5" />
          {/* Circular Green Cap Emblem Patch */}
          <ellipse cx="50" cy="30" rx="5" ry="4.5" fill="#1E4F26" stroke="#0E2B14" strokeWidth="1" />
          <circle cx="50" cy="30" r="2" fill="#387E3C" />
        </svg>
      )}

      {charId === 'jack' && (
        // Jack Tenrec: Mechanic leader, rugged jaw, tan cap, olive jacket
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
          <defs>
            <radialGradient id="jackSkin" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
            <linearGradient id="jackCap" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#CA8A04" />
              <stop offset="100%" stopColor="#854D0E" />
            </linearGradient>
            <linearGradient id="jackJacket" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="100%" stopColor="#14532D" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="#18181B" />
          {/* Torso & Olive Jacket */}
          <path d="M15,95 Q50,72 85,95 L85,100 L15,100 Z" fill="url(#jackJacket)" stroke="#000" strokeWidth="2" />
          <path d="M42,80 L50,96 L58,80 Z" fill="#F8FAFC" />
          {/* Neck */}
          <rect x="42" y="62" width="16" height="18" fill="url(#jackSkin)" />
          {/* Strong Jaw Face */}
          <path d="M30,36 Q50,30 70,36 L68,60 Q50,76 32,60 Z" fill="url(#jackSkin)" stroke="#78350F" strokeWidth="2" />
          {/* Rugged Stubble & Chin Cleft */}
          <path d="M48,68 L52,68" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
          {/* Eyes with intense look */}
          <ellipse cx="42" cy="46" rx="4" ry="2.5" fill="#FFF" />
          <ellipse cx="43" cy="46" rx="2" ry="2" fill="#000" />
          <ellipse cx="58" cy="46" rx="4" ry="2.5" fill="#FFF" />
          <ellipse cx="57" cy="46" rx="2" ry="2" fill="#000" />
          {/* Eyebrows */}
          <path d="M36,41 Q43,38 48,42" stroke="#18181B" strokeWidth="3" fill="none" />
          <path d="M52,42 Q57,38 64,41" stroke="#18181B" strokeWidth="3" fill="none" />
          {/* Firm Mouth */}
          <path d="M44,60 Q50,58 56,60" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          {/* Tan Cap */}
          <path d="M20,34 Q50,12 80,34 Q70,42 50,40 Q30,42 20,34 Z" fill="url(#jackCap)" stroke="#000" strokeWidth="2.5" />
          <path d="M16,34 Q50,25 84,34 L82,39 Q50,31 18,39 Z" fill="#582C0E" stroke="#000" strokeWidth="1.5" />
          {/* Hair Tufts under cap */}
          <path d="M26,38 L22,46 L30,42 Z" fill="#18181B" />
          <path d="M74,38 L78,46 L70,42 Z" fill="#18181B" />
        </svg>
      )}

      {charId === 'hannah' && (
        // Hannah Dundee: Purple flowing hair, explorer headband, orange top
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
          <defs>
            <radialGradient id="hanSkin" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#FFF1E6" />
              <stop offset="100%" stopColor="#FED7AA" />
            </radialGradient>
            <linearGradient id="hanHair" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#581C87" />
            </linearGradient>
            <linearGradient id="hanTop" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="#18181B" />
          {/* Long Hair Back */}
          <path d="M20,30 Q10,70 25,95 Q50,100 75,95 Q90,70 80,30 Z" fill="url(#hanHair)" />
          {/* Shoulders & Orange Top */}
          <path d="M20,95 Q50,75 80,95 L80,100 L20,100 Z" fill="url(#hanTop)" stroke="#000" strokeWidth="2" />
          {/* Slender Neck & Face */}
          <rect x="44" y="60" width="12" height="18" fill="url(#hanSkin)" />
          <path d="M33,35 Q50,30 67,35 L65,58 Q50,74 35,58 Z" fill="url(#hanSkin)" stroke="#9A3412" strokeWidth="1.5" />
          {/* Eyes with stylish liner */}
          <path d="M38,45 Q44,42 49,46" stroke="#3B0764" strokeWidth="2" fill="none" />
          <ellipse cx="43" cy="47" rx="3.5" ry="2.5" fill="#38BDF8" />
          <ellipse cx="43" cy="47" rx="1.5" ry="1.5" fill="#000" />
          <path d="M51,46 Q56,42 62,45" stroke="#3B0764" strokeWidth="2" fill="none" />
          <ellipse cx="57" cy="47" rx="3.5" ry="2.5" fill="#38BDF8" />
          <ellipse cx="57" cy="47" rx="1.5" ry="1.5" fill="#000" />
          {/* Lips */}
          <path d="M44,61 Q50,64 56,61" stroke="#DC2626" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Headband */}
          <path d="M31,34 Q50,30 69,34 L69,40 Q50,36 31,40 Z" fill="#EAB308" stroke="#000" strokeWidth="1.5" />
          {/* Front Sweeping Bangs */}
          <path d="M30,34 Q45,20 68,30 Q55,45 42,42 Z" fill="url(#hanHair)" />
        </svg>
      )}

      {charId === 'mess' && (
        // Mess O'Bradovich: Colossal mountain brawler, flattop hair, brown vest
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
          <defs>
            <radialGradient id="messSkin" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
            <linearGradient id="messVest" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="#18181B" />
          {/* Huge Trapezius & Vest */}
          <path d="M10,95 Q50,65 90,95 L90,100 L10,100 Z" fill="url(#messVest)" stroke="#000" strokeWidth="2.5" />
          {/* Broad Neck */}
          <rect x="36" y="58" width="28" height="22" fill="url(#messSkin)" stroke="#78350F" strokeWidth="2" />
          {/* Massive Square Jaw */}
          <polygon points="26,38 74,38 72,70 50,78 28,70" fill="url(#messSkin)" stroke="#78350F" strokeWidth="2.5" />
          {/* Piercing Small Eyes */}
          <rect x="36" y="46" width="7" height="3" fill="#000" />
          <rect x="57" y="46" width="7" height="3" fill="#000" />
          {/* Heavy Brow */}
          <path d="M30,42 L48,43 L48,40 L30,39 Z" fill="#18181B" />
          <path d="M52,43 L70,42 L70,39 L52,40 Z" fill="#18181B" />
          {/* Broad Nose & Mouth */}
          <path d="M45,56 L50,53 L55,56 Z" fill="#92400E" />
          <path d="M38,65 L62,65" stroke="#78350F" strokeWidth="3" strokeLinecap="square" />
          {/* Iconic Tall Flattop */}
          <polygon points="24,38 24,18 76,18 76,38" fill="#18181B" stroke="#000" strokeWidth="2" />
          <line x1="24" y1="18" x2="76" y2="18" stroke="#374151" strokeWidth="3" />
        </svg>
      )}

      {charId === 'vice_boss' && (
        // Vice Terhune: Stage 1 Boss, blonde spiky hair, fur mantle, purple battle armor
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
          <defs>
            <radialGradient id="viceSkin" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
            <linearGradient id="viceArmor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#4C1D95" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="#18181B" />
          {/* Dark Fur Mantle on Shoulders */}
          <circle cx="25" cy="85" r="16" fill="#0F172A" />
          <circle cx="75" cy="85" r="16" fill="#0F172A" />
          <path d="M20,95 Q50,75 80,95 L80,100 L20,100 Z" fill="url(#viceArmor)" stroke="#000" strokeWidth="2" />
          {/* Face */}
          <path d="M32,36 Q50,30 68,36 L66,60 Q50,76 34,60 Z" fill="url(#viceSkin)" stroke="#78350F" strokeWidth="2" />
          {/* Sinister Eyes */}
          <path d="M38,46 L46,47 L44,45 Z" fill="#DC2626" />
          <path d="M54,47 L62,46 L56,45 Z" fill="#DC2626" />
          {/* Smirk */}
          <path d="M42,62 Q52,60 58,58" stroke="#78350F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Spiky Blonde Hair */}
          <polygon points="50,10 42,28 58,28" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
          <polygon points="34,16 30,32 46,30" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
          <polygon points="66,16 54,30 70,32" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
          <polygon points="22,25 20,38 34,35" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
          <polygon points="78,25 66,35 80,38" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
        </svg>
      )}

      {(charId === 'raptor' || charId === 'enraged_raptor') && (
        // Velociraptor Dinosaur with toothy jaws and predatory eye
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
          <defs>
            <linearGradient id="dinoScale" x1="0%" y1="0%" x2="100%" y2="100%">
              {charId === 'enraged_raptor' ? (
                <>
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#7F1D1D" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#84CC16" />
                  <stop offset="100%" stopColor="#3F6212" />
                </>
              )}
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="#18181B" />
          {/* Powerful Dino Snout */}
          <path
            d="M20,65 Q30,30 65,32 Q85,34 92,44 Q80,56 65,58 L45,62 Q30,70 20,65 Z"
            fill="url(#dinoScale)"
            stroke="#000"
            strokeWidth="2.5"
          />
          {/* Lower Jaw */}
          <path
            d="M48,60 Q65,58 88,52 Q78,66 60,68 L48,60 Z"
            fill="url(#dinoScale)"
            stroke="#000"
            strokeWidth="2"
          />
          {/* Razor Sharp Teeth */}
          <polygon points="62,56 64,62 66,56" fill="#FFF" />
          <polygon points="68,54 70,61 73,54" fill="#FFF" />
          <polygon points="75,52 77,59 80,52" fill="#FFF" />
          <polygon points="82,49 84,56 87,49" fill="#FFF" />
          {/* Slit Raptor Eye */}
          <circle cx="52" cy="40" r="7" fill={charId === 'enraged_raptor' ? '#FEE2E2' : '#FEF08A'} stroke="#000" strokeWidth="1.5" />
          <ellipse cx="52" cy="40" rx="2" ry="5.5" fill={charId === 'enraged_raptor' ? '#DC2626' : '#B45309'} />
          {/* Head Crest Scales */}
          <path d="M28,42 Q32,32 38,36" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M38,34 Q42,25 48,29" stroke="#000" strokeWidth="2" fill="none" />
        </svg>
      )}
    </div>
  );
};
