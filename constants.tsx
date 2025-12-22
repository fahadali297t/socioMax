
import React from 'react';

export const PLATFORMS = [
  { id: 'X', name: 'X (Twitter)', icon: '𝕏', envKey: 'X_CLIENT_ID' },
  { id: 'Facebook', name: 'Facebook', icon: 'f', envKey: 'FACEBOOK_CLIENT_ID' },
  { id: 'LinkedIn', name: 'LinkedIn', icon: 'in', envKey: 'LINKEDIN_CLIENT_ID' },
  { id: 'Instagram', name: 'Instagram', icon: '📸', envKey: 'INSTAGRAM_CLIENT_ID' },
];

export const INITIAL_DASHBOARD_STATS = [
  { label: 'Total Posts', value: '128', change: '+12%', color: 'text-blue-500' },
  { label: 'Avg Engagement', value: '4.8%', change: '+0.5%', color: 'text-green-500' },
  { label: 'Followers Gained', value: '1,240', change: '+18%', color: 'text-purple-500' },
  { label: 'Scheduled', value: '12', change: '-2', color: 'text-orange-500' },
];

export const MOCK_HISTORY: any[] = [
  {
    id: '1',
    caption: 'Discover the future of AI with SocialFlow! 🚀 #Tech #AI',
    imageUrl: 'https://picsum.photos/seed/post1/800/600',
    status: 'posted',
    platforms: ['X', 'LinkedIn'],
    createdAt: new Date().toISOString(),
    selected: true,
  },
  {
    id: '2',
    caption: 'Unlock peak productivity with our new automated tools. 🛠️',
    imageUrl: 'https://picsum.photos/seed/post2/800/600',
    status: 'scheduled',
    scheduledTime: '2024-12-01T10:00:00Z',
    platforms: ['Instagram'],
    createdAt: new Date().toISOString(),
    selected: true,
  }
];
