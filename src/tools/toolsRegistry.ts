import React from 'react';
import {
  Timer,
  QrCode,
  KeyRound,
  FileJson,
  Binary,
  Hash,
  Youtube,
  Twitter,
  Instagram,
  LucideIcon,
} from 'lucide-react';

import { PomodoroTool } from './pomodoro/Pomodoro';
import { QRCodeTool } from './qr-code/QRCodeGen';
import { PasswordGenTool } from './password-generator/PasswordGen';
import { JsonFormatterTool } from './json-formatter/JsonFormatter';
import { Base64Tool } from './base64/Base64Tool';
import { UuidGenTool } from './uuid-generator/UuidGen';
import { ComingSoonTool } from './coming-soon/ComingSoonTool';

export type Category = 'all' | 'productivity' | 'utilities' | 'developer' | 'downloaders';

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: Category;
  icon: LucideIcon;
  status: 'ready' | 'coming_soon';
  component: React.FC<any>;
  componentProps?: any;
}

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'All Utilities' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'utilities', label: 'General Utilities' },
  { id: 'developer', label: 'Developer Tools' },
  { id: 'downloaders', label: 'Media Downloaders' },
];

export const TOOLS_REGISTRY: ToolItem[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro Focus Timer',
    description: 'Boost productivity with customizable focus sessions, break reminders, and task tracking.',
    category: 'productivity',
    icon: Timer,
    status: 'ready',
    component: PomodoroTool,
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate high-resolution QR codes for URLs, text, or Wi-Fi with custom colors and PNG export.',
    category: 'utilities',
    icon: QrCode,
    status: 'ready',
    component: QRCodeTool,
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Create cryptographically secure, customizable passwords with strength indicators and batch export.',
    category: 'utilities',
    icon: KeyRound,
    status: 'ready',
    component: PasswordGenTool,
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    description: 'Clean, format, validate, and minify JSON data with custom indentation and line highlighting.',
    category: 'developer',
    icon: FileJson,
    status: 'ready',
    component: JsonFormatterTool,
  },
  {
    id: 'base64',
    name: 'Base64 Encoder / Decoder',
    description: 'Encode and decode text and files into Base64 or URL-safe format instantly in browser.',
    category: 'developer',
    icon: Binary,
    status: 'ready',
    component: Base64Tool,
  },
  {
    id: 'uuid-generator',
    name: 'UUID / GUID Generator',
    description: 'Generate RFC4122 compliant version-4 UUIDs in bulk with uppercase and hyphen options.',
    category: 'developer',
    icon: Hash,
    status: 'ready',
    component: UuidGenTool,
  },
  {
    id: 'youtube-downloader',
    name: 'YouTube Video Downloader',
    description: 'Download YouTube videos in MP4 format or extract MP3 audio directly in browser.',
    category: 'downloaders',
    icon: Youtube,
    status: 'coming_soon',
    component: ComingSoonTool,
    componentProps: {
      toolName: 'YouTube Video Downloader',
      description: 'A fast, client-side downloader to save YouTube videos in HD quality or extract crystal clear MP3 audio streams.',
      expectedFeatures: [
        'Supports 1080p, 720p HD MP4 video streams',
        'Extract high-bitrate MP3 audio',
        'No registration or third-party ads',
        'Direct download link parsing'
      ]
    }
  },
  {
    id: 'twitter-downloader',
    name: 'Twitter / X Video Downloader',
    description: 'Save Twitter / X media posts, clips, and GIFs directly to your device.',
    category: 'downloaders',
    icon: Twitter,
    status: 'coming_soon',
    component: ComingSoonTool,
    componentProps: {
      toolName: 'Twitter / X Video Downloader',
      description: 'Easily download video posts, media clips, and animated GIFs from Twitter/X links.',
      expectedFeatures: [
        'Download MP4 videos from tweet URLs',
        'Convert X GIFs to video/image files',
        'Fast single-click download',
        'Mobile & desktop friendly'
      ]
    }
  },
  {
    id: 'instagram-downloader',
    name: 'Instagram Video Downloader',
    description: 'Download Instagram Reels, Stories, and posts without quality loss.',
    category: 'downloaders',
    icon: Instagram,
    status: 'coming_soon',
    component: ComingSoonTool,
    componentProps: {
      toolName: 'Instagram Video Downloader',
      description: 'Save Instagram Reels, video posts, and Stories anonymously and in full original resolution.',
      expectedFeatures: [
        'Download Instagram Reels & Video Posts',
        'Full HD video quality preservation',
        'No login required',
        'Instant link decoding'
      ]
    }
  }
];
