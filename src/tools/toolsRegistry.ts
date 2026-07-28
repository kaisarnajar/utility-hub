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
import { YoutubeDownloaderTool } from './youtube-downloader/YoutubeDownloader';
import { TwitterDownloaderTool } from './twitter-downloader/TwitterDownloader';
import { InstagramDownloaderTool } from './instagram-downloader/InstagramDownloader';

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
    name: 'YouTube Video & Shorts Downloader',
    description: 'Extract YouTube videos, Shorts, MP3 audio, and download high-resolution cover thumbnails.',
    category: 'downloaders',
    icon: Youtube,
    status: 'ready',
    component: YoutubeDownloaderTool,
  },
  {
    id: 'twitter-downloader',
    name: 'Twitter / X Media Downloader',
    description: 'Save Twitter / X videos, GIFs, clips, and HD post photos directly to your device.',
    category: 'downloaders',
    icon: Twitter,
    status: 'ready',
    component: TwitterDownloaderTool,
  },
  {
    id: 'instagram-downloader',
    name: 'Instagram Reel & Media Downloader',
    description: 'Parse and download Instagram Reels, video posts, and photos in original resolution.',
    category: 'downloaders',
    icon: Instagram,
    status: 'ready',
    component: InstagramDownloaderTool,
  }
];
