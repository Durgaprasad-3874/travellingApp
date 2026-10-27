// A small stroke icon set on a 24x24 grid. All icons inherit `currentColor`.
const make = (children, defaults = {}) =>
  function Icon({ size = 20, className = '', ...rest }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        focusable="false"
        {...defaults}
        {...rest}
      >
        {children}
      </svg>
    );
  };

export const IconSearch = make(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.2-4.2" />
  </>,
);
export const IconClock = make(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </>,
);
export const IconUsers = make(
  <>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3 19c.6-3.2 3-5 6-5s5.400 1.800 6 5" />
    <path d="M16 5.600a3 3 0 0 1 0 5.800M18 14.300c1.600.6 2.700 2.200 3 4.700" />
  </>,
);
export const IconGauge = make(
  <>
    <path d="M4.500 18a8.500 8.500 0 1 1 15 0" />
    <path d="M12 13.500L16 9" />
    <circle cx="12" cy="14" r="1.200" fill="currentColor" stroke="none" />
  </>,
);
export const IconCalendar = make(
  <>
    <rect x="4" y="5.500" width="16" height="14.500" rx="2.500" />
    <path d="M4 10h16M8.500 3.500v4M15.500 3.500v4" />
  </>,
);
export const IconPin = make(
  <>
    <path d="M12 21s6.500-5.600 6.500-11A6.500 6.500 0 0 0 5.500 10c0 5.400 6.500 11 6.500 11z" />
    <circle cx="12" cy="10" r="2.300" />
  </>,
);
export const IconStar = make(
  <path
    d="M12 3l2.700 5.600 6.100.8-4.500 4.300 1.100 6.100L12 16.800 6.600 19.800l1.100-6.100L3.200 9.400l6.100-.8L12 3z"
    fill="currentColor"
    stroke="none"
  />,
);
export const IconCheck = make(<path d="M5 12.500l4.500 4.500L19 7.500" />, { strokeWidth: 2 });
export const IconX = make(<path d="M6 6l12 12M18 6L6 18" />, { strokeWidth: 2 });
export const IconPlus = make(<path d="M12 5v14M5 12h14" />, { strokeWidth: 2 });
export const IconMinus = make(<path d="M5 12h14" />, { strokeWidth: 2 });
export const IconMenu = make(<path d="M4 7h16M4 12h16M4 17h16" />, { strokeWidth: 2 });
export const IconChevronDown = make(<path d="M6 9l6 6 6-6" />, { strokeWidth: 2 });
export const IconChevronRight = make(<path d="M9 6l6 6-6 6" />, { strokeWidth: 2 });
export const IconSliders = make(
  <>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2.200" />
    <circle cx="9" cy="17" r="2.200" />
  </>,
);
export const IconAlert = make(
  <>
    <circle cx="12" cy="12" r="8.500" />
    <path d="M12 7.500v5.500M12 16.200v.1" />
  </>,
);
export const IconTicket = make(
  <>
    <path d="M4 8.500A1.500 1.500 0 0 1 5.500 7h13A1.500 1.500 0 0 1 20 8.500V10a2 2 0 0 0 0 4v1.500a1.500 1.500 0 0 1-1.500 1.500h-13A1.500 1.500 0 0 1 4 15.500V14a2 2 0 0 0 0-4V8.500z" />
    <path d="M14 7v10" strokeDasharray="2 2.500" />
  </>,
);
export const IconBag = make(
  <>
    <path d="M5 8h14l-1 12H6L5 8z" />
    <path d="M9 8V6.500a3 3 0 0 1 6 0V8" />
  </>,
);
