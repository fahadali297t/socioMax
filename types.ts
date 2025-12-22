
export type PostStatus = 'draft' | 'scheduled' | 'posted';

export interface BusinessProfile {
  name: string;
  description: string;
  niche: string;
  keywords: string[];
  websiteUrl?: string;
  contactInfo?: string;
  brandColors?: string;
}

export interface GeneratedPost {
  id: string;
  caption: string;
  imageUrl: string;
  status: PostStatus;
  scheduledTime?: string;
  platforms: string[];
  createdAt: string;
  businessInfo?: Partial<BusinessProfile>;
}

export interface Connection {
  id: string;
  platform: 'X' | 'Facebook' | 'LinkedIn' | 'Instagram';
  username: string;
  connected: boolean;
  icon: string;
}

export interface HistoryItem extends GeneratedPost {
  selected: boolean;
}
