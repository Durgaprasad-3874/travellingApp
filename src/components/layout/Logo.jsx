import { Link } from 'react-router-dom';

export default function Logo({ className = '', light = false }) {
  return (
    <Link to="/" aria-label="Mana Yatra, home" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        aria-hidden="true"
        focusable="false"
        className="transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110"
      >
        <rect width="32" height="32" rx="9" fill="#2437D9" />
        <circle cx="16" cy="14" r="6.5" fill="#FFC233" />
        <rect x="5" y="17.5" width="22" height="9.5" fill="#2437D9" />
        <path d="M5 20h22" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M9 24.5h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".55" />
      </svg>
      <span className={`font-display text-[24px] font-bold leading-none tracking-[-0.04em] ${light ? 'text-white' : 'text-ink'}`}>Mana Yatra</span>
    </Link>
  );
}
