type IconProps = { className?: string; size?: number };

const S = ({ className, size = 24, children, filled = false }: IconProps & { children: React.ReactNode; filled?: boolean }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke={filled ? "none" : "currentColor"}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

export const Phone = (p: IconProps) => (
  <S {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></S>
);

export const WhatsApp = (p: IconProps) => (
  <S {...p} filled><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.5 0-2.97-.4-4.26-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.23-.17-.48-.29z" /></S>
);

export const Mail = (p: IconProps) => (
  <S {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></S>
);

export const Pin = (p: IconProps) => (
  <S {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" /></S>
);

export const Cart = (p: IconProps) => (
  <S {...p}><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.4 12.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L22 7H6" /></S>
);

export const Search = (p: IconProps) => (
  <S {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></S>
);

export const ArrowRight = (p: IconProps) => (
  <S {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></S>
);

export const Check = (p: IconProps) => (<S {...p}><path d="m4 12 5 5L20 6" /></S>);

export const Menu = (p: IconProps) => (<S {...p}><path d="M4 7h16M4 12h16M4 17h16" /></S>);

export const Laptop = (p: IconProps) => (
  <S {...p}><rect x="4" y="4" width="16" height="11" rx="1.5" /><path d="M2 19h20l-1.5-2H3.5z" /></S>
);

export const Wifi = (p: IconProps) => (
  <S {...p}><path d="M2 8.5a16 16 0 0 1 20 0" /><path d="M5.5 12a11 11 0 0 1 13 0" /><path d="M9 15.5a6 6 0 0 1 6 0" /><circle cx="12" cy="19" r="1" /></S>
);

export const Camera = (p: IconProps) => (
  <S {...p}><path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><circle cx="12" cy="12.5" r="3.5" /></S>
);

export const Wrench = (p: IconProps) => (
  <S {...p}><path d="M14.7 6.3a4.5 4.5 0 0 0 6 6l-9.4 9.4a2.8 2.8 0 0 1-4-4z" /><path d="M14.7 6.3 17 4a4.5 4.5 0 0 1 3 3l-2.3 2.3" /></S>
);

export const Code = (p: IconProps) => (<S {...p}><path d="m8 7-5 5 5 5M16 7l5 5-5 5" /></S>);

export const Graduation = (p: IconProps) => (
  <S {...p}><path d="M2 9.5 12 5l10 4.5-10 4.5z" /><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" /><path d="M22 9.5V15" /></S>
);

export const Shield = (p: IconProps) => (
  <S {...p}><path d="M12 3 4.5 6v6c0 4.5 3.2 7.6 7.5 9 4.3-1.4 7.5-4.5 7.5-9V6z" /><path d="m8.5 12 2.5 2.5 4.5-4.5" /></S>
);

export const Chat = (p: IconProps) => (
  <S {...p}><path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z" /><path d="M8 11h8M8 14h5" /></S>
);

export const Clock = (p: IconProps) => (<S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></S>);

export const Chevron = (p: IconProps) => (<S {...p}><path d="m6 9 6 6 6-6" /></S>);

export const Store = (p: IconProps) => (
  <S {...p}><path d="M3 9 5 4h14l2 5" /><path d="M4 9v11h16V9" /><path d="M9 20v-6h6v6" /><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></S>
);
