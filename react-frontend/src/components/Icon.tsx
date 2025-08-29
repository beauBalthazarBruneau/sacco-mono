import React from 'react'

interface IconProps {
  name: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

const Icon: React.FC<IconProps> = ({ name, size = 20, className, style }) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    style
  }

  switch (name) {
    case 'alert-circle':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      )
    case 'mail':
      return (
        <svg {...commonProps}>
          <path d="m4 4 16 0 0 16-16 0z"></path>
          <polyline points="4,4 12,12 20,4"></polyline>
        </svg>
      )
    case 'key':
      return (
        <svg {...commonProps}>
          <circle cx="7" cy="17" r="3"></circle>
          <path d="m10 14 3.5-3.5a6 6 0 0 0-4-10.5c-4.4 0-8 3.6-8 8a6 6 0 0 0 10.5 4l3.5-3.5"></path>
        </svg>
      )
    case 'arrow-left':
      return (
        <svg {...commonProps}>
          <path d="m12 19-7-7 7-7"></path>
          <path d="M19 12H5"></path>
        </svg>
      )
    case 'check':
      return (
        <svg {...commonProps}>
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      )
    case 'x':
      return (
        <svg {...commonProps}>
          <path d="m18 6-12 12"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      )
    case 'search':
      return (
        <svg {...commonProps}>
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      )
    case 'dashboard':
      return (
        <svg {...commonProps}>
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      )
    case 'credit-card':
      return (
        <svg {...commonProps}>
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      )
    case 'star':
      return (
        <svg {...commonProps}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
        </svg>
      )
    default:
      // Default fallback icon (circle)
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      )
  }
}

export default Icon
