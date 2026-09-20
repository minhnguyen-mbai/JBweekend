import { useId } from 'react'

type Props = { className?: string; title: string; align: string }

/**
 * Original vector scenes rather than stock photography: they never break, never load
 * late, and keep every surface on the same palette. The canvas is deliberately wide
 * (1200×560) so a full-bleed hero strip crops gently instead of magnifying the art.
 */
const svgProps = {
  viewBox: '0 0 1200 560',
  xmlns: 'http://www.w3.org/2000/svg',
} as const

function KampungTable({ className, title, align }: Props) {
  const id = useId()
  return (
    <svg {...svgProps} preserveAspectRatio={align} className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4CB84" />
          <stop offset="48%" stopColor="#E89A63" />
          <stop offset="100%" stopColor="#D2694A" />
        </linearGradient>
        <linearGradient id={`${id}-glow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBE6C0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FBE6C0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1200" height="560" fill={`url(#${id}-sky)`} />
      <circle cx="884" cy="186" r="70" fill="#FBE6C0" opacity="0.92" />
      <rect y="268" width="1200" height="130" fill={`url(#${id}-glow)`} />

      {/* Lantern string across the dusk sky */}
      <path
        d="M0 214 C 260 292, 520 236, 760 246 C 940 254, 1080 224, 1200 236"
        stroke="#F6F0E5"
        strokeWidth="2.5"
        fill="none"
        opacity="0.5"
      />
      <g fill="#F6F0E5" opacity="0.9">
        <circle cx="152" cy="256" r="7.5" />
        <circle cx="340" cy="282" r="7.5" />
        <circle cx="548" cy="268" r="7.5" />
        <circle cx="760" cy="256" r="7.5" />
        <circle cx="972" cy="234" r="7.5" />
        <circle cx="1128" cy="234" r="7.5" />
      </g>

      {/* Distant roofline */}
      <path
        d="M0 346 L60 346 L84 316 L196 316 L220 346 L320 346 L352 304 L502 304 L534 346 L640 346 L664 322 L800 322 L824 346 L920 346 L954 308 L1090 308 L1122 346 L1200 346 L1200 560 L0 560 Z"
        fill="#2C5442"
        opacity="0.5"
      />

      {/* Shophouse row */}
      <g fill="#1F4232">
        <rect x="40" y="386" width="180" height="174" />
        <rect x="236" y="364" width="150" height="196" />
        <rect x="402" y="398" width="160" height="162" />
        <rect x="578" y="374" width="196" height="186" />
        <rect x="790" y="406" width="150" height="154" />
        <rect x="956" y="384" width="200" height="176" />
      </g>
      <g fill="#F6F0E5" opacity="0.72">
        <rect x="76" y="414" width="28" height="40" rx="3" />
        <rect x="132" y="414" width="28" height="40" rx="3" />
        <rect x="268" y="392" width="30" height="42" rx="3" />
        <rect x="324" y="392" width="30" height="42" rx="3" />
        <rect x="440" y="426" width="28" height="38" rx="3" />
        <rect x="614" y="402" width="30" height="42" rx="3" />
        <rect x="670" y="402" width="30" height="42" rx="3" />
        <rect x="824" y="434" width="28" height="36" rx="3" />
        <rect x="992" y="412" width="30" height="42" rx="3" />
        <rect x="1048" y="412" width="30" height="42" rx="3" />
      </g>

      {/* Market awnings along the street */}
      <path d="M0 470 H310 L286 516 H24 Z" fill="#E86F51" />
      <path d="M338 484 H668 L646 524 H360 Z" fill="#D9A441" />
      <path d="M696 466 H1090 L1066 512 H720 Z" fill="#E86F51" />
      <rect y="516" width="1200" height="44" fill="#18382B" />
    </svg>
  )
}

function PetrolheadNight({ className, title, align }: Props) {
  const id = useId()
  return (
    <svg {...svgProps} preserveAspectRatio={align} className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E1713" />
          <stop offset="60%" stopColor="#1B3A2D" />
          <stop offset="100%" stopColor="#24503D" />
        </linearGradient>
        <radialGradient id={`${id}-flood`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#F3E2B4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F3E2B4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-trail`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E86F51" stopOpacity="0" />
          <stop offset="55%" stopColor="#E86F51" />
          <stop offset="100%" stopColor="#D9A441" />
        </linearGradient>
      </defs>
      <rect width="1200" height="560" fill={`url(#${id}-sky)`} />
      <g fill="#F6F0E5" opacity="0.45">
        <circle cx="120" cy="72" r="2" />
        <circle cx="286" cy="44" r="1.6" />
        <circle cx="452" cy="92" r="1.8" />
        <circle cx="640" cy="56" r="1.6" />
        <circle cx="820" cy="96" r="2" />
        <circle cx="1004" cy="52" r="1.7" />
        <circle cx="1136" cy="84" r="1.6" />
      </g>

      {/* Floodlight towers */}
      <circle cx="242" cy="168" r="132" fill={`url(#${id}-flood)`} />
      <circle cx="958" cy="146" r="140" fill={`url(#${id}-flood)`} />
      <g fill="#0E1712">
        <rect x="236" y="168" width="10" height="250" />
        <rect x="194" y="142" width="94" height="26" rx="6" />
        <rect x="952" y="146" width="10" height="250" />
        <rect x="910" y="120" width="94" height="26" rx="6" />
      </g>

      {/* Circuit */}
      <path
        d="M-60 516 C 180 388, 420 376, 640 408 C 848 438, 1030 396, 1260 348 L1260 560 L-60 560 Z"
        fill="#2A322D"
      />
      <path
        d="M-60 516 C 180 388, 420 376, 640 408 C 848 438, 1030 396, 1260 348"
        stroke="#F6F0E5"
        strokeWidth="3"
        strokeDasharray="30 26"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M-60 560 C 240 474, 560 456, 820 474 C 1000 486, 1130 472, 1260 454"
        stroke="#1B211D"
        strokeWidth="30"
        fill="none"
        opacity="0.55"
      />

      {/* Light trails */}
      <path
        d="M70 456 C 320 386, 570 378, 830 400"
        stroke={`url(#${id}-trail)`}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M140 492 C 400 416, 660 406, 920 428"
        stroke={`url(#${id}-trail)`}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Tyre stacks */}
      <g fill="#0E1712">
        <rect x="1036" y="446" width="78" height="22" rx="11" />
        <rect x="1036" y="420" width="78" height="22" rx="11" />
        <rect x="1036" y="394" width="78" height="22" rx="11" />
      </g>
      <g fill="#E86F51">
        <rect x="1054" y="394" width="42" height="5" rx="2.5" />
        <rect x="1054" y="446" width="42" height="5" rx="2.5" />
      </g>
    </svg>
  )
}

function EndOfAsia({ className, title, align }: Props) {
  const id = useId()
  return (
    <svg {...svgProps} preserveAspectRatio={align} className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3D7F86" />
          <stop offset="44%" stopColor="#E8A45F" />
          <stop offset="74%" stopColor="#E86F51" />
          <stop offset="100%" stopColor="#C4553C" />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B75A46" />
          <stop offset="38%" stopColor="#3E6F76" />
          <stop offset="100%" stopColor="#21525A" />
        </linearGradient>
      </defs>
      <rect width="1200" height="560" fill={`url(#${id}-sky)`} />
      <circle cx="600" cy="300" r="74" fill="#FBE0B0" opacity="0.95" />
      <rect y="332" width="1200" height="228" fill={`url(#${id}-sea)`} />
      <g fill="#FBE0B0" opacity="0.5">
        <rect x="544" y="352" width="112" height="6" rx="3" />
        <rect x="518" y="376" width="164" height="6" rx="3" />
        <rect x="562" y="400" width="80" height="5" rx="2.5" />
        <rect x="486" y="426" width="228" height="5" rx="2.5" />
        <rect x="540" y="452" width="122" height="4" rx="2" />
      </g>

      {/* Mangrove treeline on the far shore */}
      <path
        d="M0 326 C 100 296, 200 306, 300 320 C 400 334, 500 302, 600 316 C 700 330, 800 300, 900 318 C 1000 336, 1100 304, 1200 320 L1200 352 L0 352 Z"
        fill="#1F4232"
        opacity="0.85"
      />

      {/* Kukup stilt village */}
      <g fill="#18382B">
        <path d="M900 322 L924 288 H992 L1016 322 Z" />
        <rect x="900" y="322" width="116" height="44" />
        <path d="M1048 334 L1070 304 H1130 L1152 334 Z" />
        <rect x="1048" y="334" width="104" height="38" />
        <rect x="884" y="358" width="292" height="10" />
        <rect x="914" y="366" width="9" height="60" />
        <rect x="990" y="366" width="9" height="60" />
        <rect x="1062" y="372" width="9" height="54" />
        <rect x="1136" y="372" width="9" height="54" />
      </g>

      {/* Boardwalk out over the water */}
      <g fill="#18382B">
        <path d="M176 560 L318 378 H376 L290 560 Z" />
        <path d="M392 560 L354 378 H412 L508 560 Z" />
        <rect x="222" y="480" width="272" height="10" />
        <rect x="250" y="440" width="208" height="9" />
        <rect x="272" y="408" width="160" height="8" />
        <rect x="288" y="386" width="120" height="7" />
      </g>

      {/* Birds */}
      <g stroke="#18382B" strokeWidth="3" fill="none" opacity="0.7" strokeLinecap="round">
        <path d="M150 186 q16-14 32 0" />
        <path d="M198 158 q18-16 36 0" />
        <path d="M262 198 q14-12 28 0" />
      </g>
    </svg>
  )
}

const scenes = {
  'kampung-table': KampungTable,
  'petrolhead-night': PetrolheadNight,
  'end-of-asia': EndOfAsia,
} as const

export type TourArtKey = keyof typeof scenes

/**
 * `focus` decides which band survives when a very wide container slices the scene:
 * "horizon" keeps the ground detail, which is what page-wide hero strips need.
 */
export function TourArt({
  image,
  title,
  className = '',
  focus = 'center',
}: {
  image: string
  title: string
  className?: string
  focus?: 'center' | 'horizon'
}) {
  const Scene = scenes[image as TourArtKey] ?? KampungTable
  const align = focus === 'horizon' ? 'xMidYMax slice' : 'xMidYMid slice'
  return <Scene className={className} title={title} align={align} />
}
