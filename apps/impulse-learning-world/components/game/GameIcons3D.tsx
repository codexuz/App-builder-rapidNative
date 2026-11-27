import React from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Stop,
} from 'react-native-svg';

export interface Icon3DProps {
  size?: number;
}

/**
 * Faceted 3D emerald-gold lightning bolt for XP rewards.
 */
export function XpBolt3D({ size = 34 }: Icon3DProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="xpBody" x1="0.15" y1="0" x2="0.85" y2="1">
          <Stop offset="0%" stopColor="#6EE7B7" />
          <Stop offset="45%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#047857" />
        </LinearGradient>
        <LinearGradient id="xpBevel" x1="0" y1="0" x2="0.8" y2="0.9">
          <Stop offset="0%" stopColor="#FEF08A" />
          <Stop offset="45%" stopColor="#34D399" />
          <Stop offset="100%" stopColor="#059669" />
        </LinearGradient>
        <LinearGradient id="xpShine" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
        </LinearGradient>
      </Defs>
      {/* Soft ground shadow */}
      <Ellipse cx="32" cy="59" rx="14" ry="3.5" fill="#065F46" opacity="0.22" />
      {/* 3D extruded back depth */}
      <Path
        d="M38 6 L15 35 H31 L25 58 L51 27 H35 Z"
        fill="#065F46"
        transform="translate(2.2, 2.5)"
        stroke="#065F46"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Main sculpted bolt body */}
      <Path
        d="M37 5 L14 34 H30 L24 57 L50 26 H34 Z"
        fill="url(#xpBody)"
        stroke="#047857"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Inner faceted bevel */}
      <Path
        d="M35.5 9.5 L18.5 31.5 H32.2 L27.8 50.5 L45.5 28.5 H32 Z"
        fill="url(#xpBevel)"
      />
      {/* Top glossy candy highlight */}
      <Path
        d="M34.5 11.5 L20.5 29.5 H26.5 L35.5 16 Z"
        fill="url(#xpShine)"
      />
    </Svg>
  );
}

/**
 * Gleaming 3D gold expedition coin with embossed star & metallic rim.
 */
export function Coin3D({ size = 34 }: Icon3DProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="coinRim" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#FDE047" />
          <Stop offset="50%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#B45309" />
        </LinearGradient>
        <RadialGradient id="coinFace" cx="35%" cy="30%" r="72%">
          <Stop offset="0%" stopColor="#FEF9C3" />
          <Stop offset="40%" stopColor="#FACC15" />
          <Stop offset="100%" stopColor="#D97706" />
        </RadialGradient>
        <LinearGradient id="coinStar" x1="0" y1="0" x2="0.8" y2="1">
          <Stop offset="0%" stopColor="#FFFBEB" />
          <Stop offset="100%" stopColor="#F59E0B" />
        </LinearGradient>
      </Defs>
      {/* Soft shadow */}
      <Ellipse cx="32" cy="58.5" rx="18" ry="3.8" fill="#92400E" opacity="0.22" />
      {/* 3D thickness edge */}
      <Circle cx="33.5" cy="34.5" r="24" fill="#B45309" />
      {/* Outer beveled rim */}
      <Circle cx="31.5" cy="31.5" r="24" fill="url(#coinRim)" stroke="#D97706" strokeWidth="1.6" />
      {/* Recessed coin face */}
      <Circle cx="31.5" cy="31.5" r="18.8" fill="url(#coinFace)" stroke="#B45309" strokeWidth="1.2" />
      {/* Embossed 3D star */}
      <Polygon
        points="31.5,18 35.1,26.1 44,27 37.3,32.9 39.2,41.6 31.5,37.1 23.8,41.6 25.7,32.9 19,27 27.9,26.1"
        fill="#B45309"
        opacity="0.38"
        transform="translate(1, 1.5)"
      />
      <Polygon
        points="31.5,18 35.1,26.1 44,27 37.3,32.9 39.2,41.6 31.5,37.1 23.8,41.6 25.7,32.9 19,27 27.9,26.1"
        fill="url(#coinStar)"
      />
      {/* Diagonal specular shine */}
      <Path
        d="M17 20 C21 13, 30 11, 36 12 C28 15, 22 20, 18 27 Z"
        fill="#FFFFFF"
        opacity="0.6"
      />
    </Svg>
  );
}

/**
 * Multi-faceted 3D sparkling crystal gem for Gem rewards.
 */
export function Gem3D({ size = 34 }: Icon3DProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="gemTop" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#E0F2FE" />
          <Stop offset="55%" stopColor="#38BDF8" />
          <Stop offset="100%" stopColor="#0284C7" />
        </LinearGradient>
        <LinearGradient id="gemLeft" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#7DD3FC" />
          <Stop offset="100%" stopColor="#0369A1" />
        </LinearGradient>
        <LinearGradient id="gemCenter" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0%" stopColor="#BAE6FD" />
          <Stop offset="45%" stopColor="#0EA5E9" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
        <LinearGradient id="gemRight" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#0284C7" />
          <Stop offset="100%" stopColor="#1E3A8A" />
        </LinearGradient>
      </Defs>
      {/* Soft shadow */}
      <Ellipse cx="32" cy="58.5" rx="15" ry="3.5" fill="#1E3A8A" opacity="0.22" />
      {/* Crown & base faceted geometry */}
      <Polygon points="19,11 45,11 56,25 32,55 8,25" fill="#0369A1" stroke="#075985" strokeWidth="2" strokeLinejoin="round" />
      {/* Top left facet */}
      <Polygon points="19,11 32,11 23,25 8,25" fill="#BAE6FD" />
      {/* Top center table */}
      <Polygon points="24,11 40,11 41,25 23,25" fill="url(#gemTop)" />
      {/* Top right facet */}
      <Polygon points="40,11 45,11 56,25 41,25" fill="#38BDF8" />
      {/* Lower left prism */}
      <Polygon points="8,25 23,25 32,55" fill="url(#gemLeft)" />
      {/* Lower center prism */}
      <Polygon points="23,25 41,25 32,55" fill="url(#gemCenter)" />
      {/* Lower right prism */}
      <Polygon points="41,25 56,25 32,55" fill="url(#gemRight)" />
      {/* Crisp white sparkle gleam */}
      <Polygon points="25,13 36,13 34,18 24,18" fill="#FFFFFF" opacity="0.72" />
      <Circle cx="19" cy="18" r="2.2" fill="#FFFFFF" opacity="0.88" />
    </Svg>
  );
}

/**
 * Puffy 3D golden mastery star (lit or unlit) for the Victory 3-Star Arc.
 */
export function Star3D({ size = 44, filled = true }: Icon3DProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="starGold" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0%" stopColor="#FEF08A" />
          <Stop offset="48%" stopColor="#FACC15" />
          <Stop offset="100%" stopColor="#EA580C" />
        </LinearGradient>
        <LinearGradient id="starMuted" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0%" stopColor="#E2E8F0" />
          <Stop offset="100%" stopColor="#CBD5E1" />
        </LinearGradient>
      </Defs>
      {/* 3D depth rim */}
      <Path
        d="M32 6 L39.4 21.1 L56 23.5 L44 35.2 L46.8 51.8 L32 43.9 L17.2 51.8 L20 35.2 L8 23.5 L24.6 21.1 Z"
        fill={filled ? '#B45309' : '#94A3B8'}
        transform="translate(0, 3.2)"
        stroke={filled ? '#B45309' : '#94A3B8'}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Main puffy star */}
      <Path
        d="M32 6 L39.4 21.1 L56 23.5 L44 35.2 L46.8 51.8 L32 43.9 L17.2 51.8 L20 35.2 L8 23.5 L24.6 21.1 Z"
        fill={filled ? 'url(#starGold)' : 'url(#starMuted)'}
        stroke={filled ? '#D97706' : '#CBD5E1'}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Specular glossy highlight */}
      {filled ? (
        <Path
          d="M32 10.5 L27 21.5 L15 23.5 L23 27.5 L31 21 Z"
          fill="#FFFFFF"
          opacity="0.55"
        />
      ) : null}
    </Svg>
  );
}

/**
 * Glossy 3D accuracy bullseye emblem for the Victory accuracy banner.
 */
export function Target3D({ size = 26 }: Icon3DProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <RadialGradient id="targetRed" cx="35%" cy="30%" r="70%">
          <Stop offset="0%" stopColor="#FB7185" />
          <Stop offset="65%" stopColor="#E11D48" />
          <Stop offset="100%" stopColor="#9F1239" />
        </RadialGradient>
      </Defs>
      <Circle cx="33" cy="34" r="24" fill="#881337" opacity="0.28" />
      <Circle cx="32" cy="32" r="24" fill="url(#targetRed)" />
      <Circle cx="32" cy="32" r="16.5" fill="#FFFFFF" />
      <Circle cx="32" cy="32" r="10.2" fill="url(#targetRed)" />
      <Circle cx="32" cy="32" r="4.5" fill="#FDE047" />
      {/* Top gloss */}
      <Ellipse cx="24" cy="18" rx="8" ry="3.8" fill="#FFFFFF" opacity="0.45" transform="rotate(-24 24 18)" />
    </Svg>
  );
}
