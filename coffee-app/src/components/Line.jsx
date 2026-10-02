// 细线图标（颜色跟随 currentColor）

const Icon = ({ children, className = 'icon' }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IconSearch = () => (
  <Icon>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 L21 21" />
  </Icon>
);

export const IconPlus = () => (
  <Icon>
    <path d="M12 5 V19 M5 12 H19" />
  </Icon>
);

export const IconClose = () => (
  <Icon>
    <path d="M6 6 L18 18 M18 6 L6 18" />
  </Icon>
);

export const IconCamera = () => (
  <Icon>
    <path d="M3 8 H7 L9 5 H15 L17 8 H21 V19 H3 Z" />
    <circle cx="12" cy="13" r="3.6" />
  </Icon>
);

export const IconGrid = () => (
  <Icon>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </Icon>
);

export const IconGlobe = () => (
  <Icon>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12 H20.5 M12 3.5 C9 7 9 17 12 20.5 M12 3.5 C15 7 15 17 12 20.5" />
  </Icon>
);

export const IconGear = () => (
  <Icon>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3 V5.5 M12 18.5 V21 M3 12 H5.5 M18.5 12 H21 M5.6 5.6 L7.4 7.4 M16.6 16.6 L18.4 18.4 M5.6 18.4 L7.4 16.6 M16.6 7.4 L18.4 5.6" />
  </Icon>
);

export const IconEdit = () => (
  <Icon>
    <path d="M4 20 L4.8 16.2 L16 5 L19 8 L7.8 19.2 Z M14 7 L17 10" />
  </Icon>
);

export const IconTrash = () => (
  <Icon>
    <path d="M4 7 H20 M9 7 V4.5 H15 V7 M6.5 7 L7.5 20 H16.5 L17.5 7" />
  </Icon>
);

export const IconDrip = () => (
  <Icon>
    <path d="M4 7 H20 M5 7 L10 15 H14 L19 7" />
    <path d="M8.5 17.5 H15.5" />
    <path d="M12 19 C11 20.4 11.2 21.5 12 21.5 C12.8 21.5 13 20.4 12 19 Z" fill="currentColor" />
  </Icon>
);

export const IconCup = () => (
  <Icon>
    <path d="M5 9 H17 C17 15 15 19 11 19 C7 19 5 15 5 9 Z" />
    <path d="M16.6 11 C20 11 20 15.5 16 15.5" />
    <path d="M9 6 C8.4 5 9.6 4 9 3 M13 6 C12.4 5 13.6 4 13 3" />
  </Icon>
);
