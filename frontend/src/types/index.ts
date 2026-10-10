
export type User = {
  id: string;
  name: string;
  email: string;
  company?: string;
  createdAt?: string;
};

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'lost';

export type Lead = {
  id: string;
  name: string;
  email: string;
  company?: string;
  source?: string;
  status: LeadStatus;
  createdAt: string;
};

export type WebsiteStatus =
  | 'draft'
  | 'published'
  | 'archived';

export type WebsiteConfig = {
  id: string;
  title: string;
  description: string;
  brandName: string;
  accentColor: string;
  buttonText: string;
  status: WebsiteStatus;
  createdAt: string;
  updatedAt?: string;
};

export type WebinarStatus =
  | 'draft'
  | 'scheduled'
  | 'live'
  | 'completed'
  | 'cancelled';

export type Webinar = {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  registrationCount: number;
  status: WebinarStatus;
  createdAt: string;
};

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'sent'
  | 'cancelled';

export type Campaign = {
  id: string;
  title: string;
  subject?: string;
  content: string;
  status: CampaignStatus;
  scheduledAt?: string;
  createdAt: string;
};

export type AnalyticsMetric = {
  label: string;
  value: number;
  previousValue?: number;
  changePercentage?: number;
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  type: 'website' | 'lead' | 'webinar' | 'campaign' | 'system';
};

export type WorkflowStatus =
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'failed';

export type WorkflowStep = {
  id: string;
  label: string;
  status: WorkflowStatus;
  message?: string;
};

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  workflow?: WorkflowStep[];
};
