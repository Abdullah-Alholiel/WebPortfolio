/**
 * Centralized icon mapping system for react-icons
 * Supports all major icon libraries: FontAwesome, CSS.gg, Bootstrap, Heroicons, etc.
 */

import React from 'react';
// Import commonly used icons directly
import { 
  FaAward, FaBrain, FaCloud, FaCode, FaDatabase, FaTruck, FaSitemap,
  FaGraduationCap, FaBriefcase, FaUser, FaProjectDiagram, FaRocket,
  FaLightbulb, FaBalanceScale, FaGithubSquare, FaLinkedin
} from 'react-icons/fa';
import { CgWorkAlt } from 'react-icons/cg';
import { BsLinkedin, BsGithub, BsArrowRight } from 'react-icons/bs';
import { HiDownload } from 'react-icons/hi';
import { MdWork, MdSchool } from 'react-icons/md';
import { RiComputerLine, RiCodeSSlashLine } from 'react-icons/ri';

// Import icon libraries dynamically
import * as FaIcons from 'react-icons/fa';
import * as CgIcons from 'react-icons/cg';
import * as BsIcons from 'react-icons/bs';
import * as HiIcons from 'react-icons/hi';
import * as AiIcons from 'react-icons/ai';
import * as MdIcons from 'react-icons/md';
import * as FiIcons from 'react-icons/fi';
import * as IoIcons from 'react-icons/io';
import * as Io5Icons from 'react-icons/io5';
import * as RiIcons from 'react-icons/ri';
import * as SiIcons from 'react-icons/si';
import * as TbIcons from 'react-icons/tb';
import * as BiIcons from 'react-icons/bi';
import * as GrIcons from 'react-icons/gr';
import * as ImIcons from 'react-icons/im';
import * as VscIcons from 'react-icons/vsc';
import * as WiIcons from 'react-icons/wi';

// Type for React icon components
export type IconComponent = React.ComponentType<{ className?: string }>;

// Comprehensive icon map - dynamically maps icon names to components
const createIconMap = (): Record<string, IconComponent> => {
  const iconMap: Record<string, IconComponent> = {};

  // Helper to add icons from a library
  const addIcons = (icons: Record<string, IconComponent>, prefix: string) => {
    Object.keys(icons).forEach((key) => {
      if (key.endsWith('Icon')) {
        const name = key.replace('Icon', '');
        iconMap[`${prefix}${name}`] = icons[key];
      } else {
        iconMap[`${prefix}${key}`] = icons[key];
      }
    });
  };

  // Add icons from all libraries
  addIcons(FaIcons as Record<string, IconComponent>, 'Fa');
  addIcons(CgIcons as Record<string, IconComponent>, 'Cg');
  addIcons(BsIcons as Record<string, IconComponent>, 'Bs');
  addIcons(HiIcons as Record<string, IconComponent>, 'Hi');
  addIcons(AiIcons as Record<string, IconComponent>, 'Ai');
  addIcons(MdIcons as Record<string, IconComponent>, 'Md');
  addIcons(FiIcons as Record<string, IconComponent>, 'Fi');
  addIcons(IoIcons as Record<string, IconComponent>, 'Io');
  addIcons(Io5Icons as Record<string, IconComponent>, 'Io5');
  addIcons(RiIcons as Record<string, IconComponent>, 'Ri');
  addIcons(SiIcons as Record<string, IconComponent>, 'Si');
  addIcons(TbIcons as Record<string, IconComponent>, 'Tb');
  addIcons(BiIcons as Record<string, IconComponent>, 'Bi');
  addIcons(GrIcons as Record<string, IconComponent>, 'Gr');
  addIcons(ImIcons as Record<string, IconComponent>, 'Im');
  addIcons(VscIcons as Record<string, IconComponent>, 'Vsc');
  addIcons(WiIcons as Record<string, IconComponent>, 'Wi');

  return iconMap;
};

// Create the icon map once
const iconMap = createIconMap();

/**
 * Get an icon component by name
 * @param iconName - Icon name (e.g., "FaBrain", "CgWorkAlt", "BsLinkedin")
 * @param fallback - Fallback icon component if not found
 * @returns React icon component
 */
export function getIcon(
  iconName: string | undefined | null,
  fallback?: IconComponent
): IconComponent {
  if (!iconName || typeof iconName !== 'string') {
    return fallback || FaAward;
  }

  // Try exact match first
  if (iconMap[iconName]) {
    return iconMap[iconName];
  }

  // Try with common prefixes if exact match fails
  const prefixes = ['Fa', 'Cg', 'Bs', 'Hi', 'Ai', 'Md', 'Fi', 'Io', 'Io5', 'Ri', 'Si', 'Tb', 'Bi', 'Gr', 'Im', 'Vsc', 'Wi'];
  for (const prefix of prefixes) {
    const prefixedName = `${prefix}${iconName}`;
    if (iconMap[prefixedName]) {
      return iconMap[prefixedName];
    }
  }

  // Return fallback if not found
  return fallback || FaAward;
}

/**
 * Get icon component for experiences
 */
export function getExperienceIcon(iconName: string | undefined | null): IconComponent {
  return getIcon(iconName, FaAward);
}

/**
 * Get icon component for achievements
 */
export function getAchievementIcon(iconName: string | undefined | null): IconComponent {
  return getIcon(iconName, FaAward);
}

/**
 * Get all available icon names (for admin panel dropdown)
 * Returns a list of icon names grouped by library
 */
export function getAvailableIcons(): {
  category: string;
  icons: string[];
}[] {
  const categories: Record<string, string[]> = {
    'Font Awesome': [],
    'CSS.gg': [],
    'Bootstrap': [],
    'Heroicons': [],
    'Ant Design': [],
    'Material Design': [],
    'Feather': [],
    'Ionicons': [],
    'Ionicons 5': [],
    'Remix Icon': [],
    'Simple Icons': [],
    'Tabler': [],
    'Boxicons': [],
    'Grommet': [],
    'IcoMoon': [],
    'VS Code': [],
    'Weather Icons': [],
  };

  Object.keys(iconMap).forEach((iconName) => {
    if (iconName.startsWith('Fa')) {
      categories['Font Awesome'].push(iconName);
    } else if (iconName.startsWith('Cg')) {
      categories['CSS.gg'].push(iconName);
    } else if (iconName.startsWith('Bs')) {
      categories['Bootstrap'].push(iconName);
    } else if (iconName.startsWith('Hi')) {
      categories['Heroicons'].push(iconName);
    } else if (iconName.startsWith('Ai')) {
      categories['Ant Design'].push(iconName);
    } else if (iconName.startsWith('Md')) {
      categories['Material Design'].push(iconName);
    } else if (iconName.startsWith('Fi')) {
      categories['Feather'].push(iconName);
    } else if (iconName.startsWith('Io5')) {
      categories['Ionicons 5'].push(iconName);
    } else if (iconName.startsWith('Io')) {
      categories['Ionicons'].push(iconName);
    } else if (iconName.startsWith('Ri')) {
      categories['Remix Icon'].push(iconName);
    } else if (iconName.startsWith('Si')) {
      categories['Simple Icons'].push(iconName);
    } else if (iconName.startsWith('Tb')) {
      categories['Tabler'].push(iconName);
    } else if (iconName.startsWith('Bi')) {
      categories['Boxicons'].push(iconName);
    } else if (iconName.startsWith('Gr')) {
      categories['Grommet'].push(iconName);
    } else if (iconName.startsWith('Im')) {
      categories['IcoMoon'].push(iconName);
    } else if (iconName.startsWith('Vsc')) {
      categories['VS Code'].push(iconName);
    } else if (iconName.startsWith('Wi')) {
      categories['Weather Icons'].push(iconName);
    }
  });

  // Filter out empty categories and sort icons
  return Object.entries(categories)
    .filter(([_, icons]) => icons.length > 0)
    .map(([category, icons]) => ({
      category,
      icons: icons.sort(),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * Get popular/recommended icons for quick selection
 */
export function getPopularIcons(): string[] {
  return [
    'FaBrain',
    'FaCloud',
    'FaCode',
    'FaDatabase',
    'FaTruck',
    'FaSitemap',
    'FaAward',
    'FaGraduationCap',
    'FaBriefcase',
    'FaUser',
    'FaProjectDiagram',
    'FaRocket',
    'FaLightbulb',
    'FaBalanceScale',
    'CgWorkAlt',
    'BsLinkedin',
    'BsGithub',
    'HiDownload',
    'MdWork',
    'MdSchool',
    'RiComputerLine',
    'RiCodeSSlashLine',
  ];
}

/**
 * Get professional/work-related icons for experiences
 * Returns a curated list of icons relevant to jobs, careers, and professional work
 */
export function getProfessionalIcons(): string[] {
  // Curated list of professional/work-related icon names
  const professionalKeywords = [
    // Work & Career
    'Work', 'Briefcase', 'Suitcase', 'Office', 'Business', 'Career', 'Job',
    // Technology & Development
    'Code', 'Computer', 'Laptop', 'Server', 'Cloud', 'Database', 'Network', 'Terminal',
    'CodeSlash', 'CodeBranch', 'CodeCommit', 'CodeMerge', 'CodePullRequest',
    'Devices', 'Desktop', 'Mobile', 'Tablet', 'Hardware',
    // AI & Data
    'Brain', 'Robot', 'Chip', 'Microchip', 'Data', 'Analytics', 'Chart', 'Graph',
    'BarChart', 'LineChart', 'PieChart', 'Trending', 'Insights',
    // Engineering & Systems
    'Cog', 'Gear', 'Settings', 'Tools', 'Wrench', 'Screwdriver', 'Hammer',
    'Blueprint', 'Architecture', 'Infrastructure', 'System', 'Server',
    // Strategy & Consulting
    'Lightbulb', 'Bulb', 'Idea', 'Strategy', 'Target', 'Goal', 'Flag', 'Trophy',
    'Award', 'Medal', 'Star', 'Rocket', 'Launch', 'Growth', 'Trending',
    // Management & Organization
    'Sitemap', 'Diagram', 'Project', 'Task', 'Checklist', 'List', 'Board',
    'Kanban', 'Timeline', 'Calendar', 'Schedule', 'Clock', 'Time',
    // Communication & Collaboration
    'Users', 'Team', 'Group', 'Meeting', 'Presentation', 'Screen', 'Share',
    'Message', 'Chat', 'Mail', 'Email', 'Phone', 'Video',
    // E-commerce & Business
    'Shopping', 'Cart', 'Store', 'Shop', 'Truck', 'Delivery', 'Package',
    'Box', 'Bag', 'CreditCard', 'Money', 'Dollar', 'Euro', 'Pound',
    // Design & Creative
    'Palette', 'Brush', 'Paint', 'Design', 'Image', 'Photo', 'Camera',
    'Video', 'Film', 'Edit', 'Pen', 'Pencil',
    // Security & Quality
    'Shield', 'Lock', 'Key', 'Security', 'Check', 'Verified', 'Badge',
    'Certificate', 'Diploma', 'Graduation', 'School', 'University',
    // Cloud & DevOps
    'Cloud', 'CloudUpload', 'CloudDownload', 'CloudSync', 'Deploy',
    'Container', 'Docker', 'Kubernetes', 'Git', 'GitBranch', 'GitCommit',
    // Consulting & Strategy
    'Consulting', 'Advice', 'Support', 'Help', 'Question', 'Solution',
    'Puzzle', 'Pieces', 'Connect', 'Link', 'Chain',
  ];

  const professionalIcons: string[] = [];
  const iconNameLowerMap = new Map<string, string>(); // Map lowercase to original

  // Build a map of all icon names (lowercase -> original)
  Object.keys(iconMap).forEach(iconName => {
    const nameWithoutPrefix = iconName.replace(/^(Fa|Cg|Bs|Hi|Ai|Md|Fi|Io|Io5|Ri|Si|Tb|Bi|Gr|Im|Vsc|Wi)/, '');
    iconNameLowerMap.set(nameWithoutPrefix.toLowerCase(), iconName);
  });

  // Match professional keywords to icon names
  professionalKeywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    
    // Direct match
    if (iconNameLowerMap.has(keywordLower)) {
      const iconName = iconNameLowerMap.get(keywordLower)!;
      if (!professionalIcons.includes(iconName)) {
        professionalIcons.push(iconName);
      }
    }

    // Partial match (icon name contains keyword)
    iconNameLowerMap.forEach((iconName, nameLower) => {
      if (nameLower.includes(keywordLower) && !professionalIcons.includes(iconName)) {
        professionalIcons.push(iconName);
      }
    });
  });

  // Add some specific popular professional icons that might not match keywords
  const additionalProfessionalIcons = [
    'FaBriefcase', 'FaSuitcase', 'FaLaptop', 'FaDesktop', 'FaServer',
    'FaDatabase', 'FaCloud', 'FaCode', 'FaBrain', 'FaRocket',
    'FaAward', 'FaTrophy', 'FaStar', 'FaChartLine', 'FaChartBar',
    'FaProjectDiagram', 'FaSitemap', 'FaUsers', 'FaUserTie',
    'FaHandshake', 'FaBullseye', 'FaTarget', 'FaFlag', 'FaGavel',
    'FaBalanceScale', 'FaGraduationCap', 'FaCertificate', 'FaShield',
    'FaLock', 'FaKey', 'FaCog', 'FaTools', 'FaWrench',
    'FaShoppingCart', 'FaStore', 'FaTruck', 'FaBox', 'FaCreditCard',
    'FaPalette', 'FaPaintBrush', 'FaImage', 'FaCamera', 'FaVideo',
    'FaEnvelope', 'FaPhone', 'FaComments', 'FaShare', 'FaHandshake',
    'CgWorkAlt', 'CgBriefcase', 'CgLaptop', 'CgServer', 'CgCode',
    'CgCodeSlash', 'CgDatabase', 'CgCloud', 'CgChart', 'CgUser',
    'CgUsers', 'CgScreen', 'CgEdit', 'CgDesign', 'CgToolbox',
    'MdWork', 'MdBusiness', 'MdComputer', 'MdLaptop', 'MdPhone',
    'MdEmail', 'MdSettings', 'MdBuild', 'MdCode', 'MdCloud',
    'MdTrendingUp', 'MdBarChart', 'MdPieChart', 'MdAssessment',
    'MdGroup', 'MdPeople', 'MdPerson', 'MdSchool', 'MdBusinessCenter',
    'HiOfficeBuilding', 'HiBriefcase', 'HiCode', 'HiChip', 'HiCloud',
    'HiChart', 'HiTrendingUp', 'HiUsers', 'HiUserGroup', 'HiLightBulb',
    'RiBriefcaseLine', 'RiBriefcaseFill', 'RiComputerLine', 'RiCodeSSlashLine',
    'RiCloudLine', 'RiDatabaseLine', 'RiBarChartLine', 'RiLineChartLine',
    'RiTeamLine', 'RiUserLine', 'RiSettingsLine', 'RiToolsLine',
    'RiShoppingCartLine', 'RiStoreLine', 'RiMailLine', 'RiPhoneLine',
    'BsBriefcase', 'BsLaptop', 'BsPhone', 'BsEnvelope', 'BsPeople',
    'BsGraphUp', 'BsBarChart', 'BsPieChart', 'BsGear', 'BsTools',
    'FiBriefcase', 'FiLaptop', 'FiCode', 'FiDatabase', 'FiCloud',
    'FiTrendingUp', 'FiUsers', 'FiUser', 'FiSettings', 'FiTool',
    'TbBriefcase', 'TbLaptop', 'TbCode', 'TbDatabase', 'TbCloud',
    'TbChart', 'TbUsers', 'TbUser', 'TbSettings', 'TbTools',
    'BiBriefcase', 'BiLaptop', 'BiCode', 'BiData', 'BiCloud',
    'BiBarChart', 'BiLineChart', 'BiPieChart', 'BiTrendingUp',
    'BiUser', 'BiGroup', 'BiCog', 'BiTool',
  ];

  additionalProfessionalIcons.forEach(iconName => {
    if (iconMap[iconName] && !professionalIcons.includes(iconName)) {
      professionalIcons.push(iconName);
    }
  });

  // Sort and return
  return professionalIcons.sort();
}

/**
 * Get a simplified list of icons for admin dropdowns
 * Returns icons grouped by category with search functionality
 * @param context - Optional context to filter icons (e.g., 'experience' for professional icons only)
 */
export function getIconOptionsForSelect(context?: 'experience' | 'achievement' | 'general'): Array<{ value: string; label: string; category: string }> {
  // For experience context, only return professional icons
  if (context === 'experience') {
    const professionalIcons = getProfessionalIcons();
    return professionalIcons.map(iconName => ({
      value: iconName,
      label: iconName,
      category: 'Professional',
    }));
  }

  const popular = getPopularIcons();
  const options: Array<{ value: string; label: string; category: string }> = [];

  // Add popular icons first
  popular.forEach(iconName => {
    if (iconMap[iconName]) {
      options.push({
        value: iconName,
        label: `${iconName} (Popular)`,
        category: 'Popular',
      });
    }
  });

  // Add other icons grouped by category
  const categories: Record<string, string[]> = {
    'Font Awesome': [],
    'CSS.gg': [],
    'Bootstrap': [],
    'Heroicons': [],
    'Material Design': [],
    'Remix Icon': [],
  };

  Object.keys(iconMap).forEach((iconName) => {
    if (!popular.includes(iconName)) {
      if (iconName.startsWith('Fa')) {
        categories['Font Awesome'].push(iconName);
      } else if (iconName.startsWith('Cg')) {
        categories['CSS.gg'].push(iconName);
      } else if (iconName.startsWith('Bs')) {
        categories['Bootstrap'].push(iconName);
      } else if (iconName.startsWith('Hi')) {
        categories['Heroicons'].push(iconName);
      } else if (iconName.startsWith('Md')) {
        categories['Material Design'].push(iconName);
      } else if (iconName.startsWith('Ri')) {
        categories['Remix Icon'].push(iconName);
      }
    }
  });

  // Add categorized icons (limit to 50 per category to avoid huge dropdowns)
  Object.entries(categories).forEach(([category, icons]) => {
    icons.slice(0, 50).forEach(iconName => {
      options.push({
        value: iconName,
        label: iconName,
        category,
      });
    });
  });

  return options;
}

// Export icon map for direct access if needed
export { iconMap };

