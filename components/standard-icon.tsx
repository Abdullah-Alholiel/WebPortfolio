/**
 * StandardIcon Component
 * 
 * Ensures all icons follow the same style regardless of their source library.
 * This component normalizes icon rendering to maintain visual consistency.
 */

import React from 'react';
import { getIcon, IconComponent } from '@/lib/icon-utils';
import { useTheme } from '@/context/theme-context';

interface StandardIconProps {
  icon: IconComponent | string | null | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  className?: string;
  color?: string;
  // Size presets for common use cases
  variant?: 'timeline' | 'card' | 'button' | 'default';
}

// Size mapping for consistent sizing
const sizeMap = {
  xs: 'text-xs',      // 0.75rem (12px)
  sm: 'text-sm',      // 0.875rem (14px)
  md: 'text-base',    // 1rem (16px)
  lg: 'text-lg',      // 1.125rem (18px)
  xl: 'text-xl',      // 1.25rem (20px)
  '2xl': 'text-2xl',  // 1.5rem (24px)
  '3xl': 'text-3xl',  // 1.875rem (30px)
  '4xl': 'text-4xl',  // 2.25rem (36px)
  '5xl': 'text-5xl',  // 3rem (48px)
};

// Variant presets
const variantStyles = {
  timeline: {
    size: '2xl' as const,
    className: 'inline-block',
  },
  card: {
    size: '5xl' as const,
    className: 'inline-block transition-transform duration-500',
  },
  button: {
    size: 'lg' as const,
    className: 'inline-block',
  },
  default: {
    size: 'lg' as const,
    className: 'inline-block',
  },
};

export default function StandardIcon({
  icon,
  size,
  className = '',
  color,
  variant,
}: StandardIconProps) {
  const { theme } = useTheme();

  // If icon is null/undefined, return null
  if (!icon) {
    return null;
  }

  // Get icon component - handle both string names and React components
  let IconComponent: IconComponent;
  
  if (typeof icon === 'string') {
    // Get icon by name from the icon utility
    IconComponent = getIcon(icon);
  } else if (typeof icon === 'function') {
    // Direct React component function
    IconComponent = icon;
  } else if (typeof icon === 'object' && icon !== null) {
    // If it's an object (React element or serialized component), try to extract string name
    // This prevents React error #130 (Objects are not valid as a React child)
    let iconName = 'FaAward'; // default fallback
    
    const iconObj = icon as Record<string, any>;
    if ('type' in iconObj && iconObj.type) {
      const elementType = iconObj.type;
      if (typeof elementType === 'function') {
        iconName = elementType.name || 'FaAward';
      } else if (typeof elementType === 'string') {
        iconName = elementType;
      }
    }
    
    // Use the extracted name to get the icon component
    IconComponent = getIcon(iconName);
  } else {
    // Fallback: try to convert to string and get icon
    IconComponent = getIcon(String(icon));
  }

  // Determine size based on variant or explicit size prop
  const finalSize = size || (variant ? variantStyles[variant].size : 'lg');
  const sizeClass = sizeMap[finalSize];

  // Determine color - use theme-aware defaults if not specified
  let colorClass = '';
  if (color) {
    colorClass = color;
  } else {
    // Theme-aware default colors
    switch (variant) {
      case 'timeline':
        colorClass = theme === 'light' ? 'text-indigo-600' : 'text-purple-400';
        break;
      case 'card':
        colorClass = 'text-blue-500';
        break;
      case 'button':
        colorClass = theme === 'light' ? 'text-gray-700' : 'text-gray-300';
        break;
      default:
        colorClass = theme === 'light' ? 'text-gray-700' : 'text-gray-300';
    }
  }

  // Get variant-specific className
  const variantClassName = variant ? variantStyles[variant].className : '';

  // Combine all classes for the icon component itself
  const iconClassName = [
    sizeClass,
    colorClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Wrapper classes (for positioning/display)
  const wrapperClassName = variantClassName;

  // For timeline variant, render icon directly without wrapper for perfect centering
  if (variant === 'timeline') {
    return (
      <IconComponent 
        className={iconClassName}
      />
    );
  }
  
  // For other variants, use wrapper
  return (
    <span 
      className={wrapperClassName}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        lineHeight: 1,
      }}
    >
      <IconComponent className={iconClassName} />
    </span>
  );
}

