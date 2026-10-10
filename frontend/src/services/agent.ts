
import api from './api';

export type AgentAction =
  | 'create_website'
  | 'create_lead'
  | 'create_webinar'
  | 'create_campaign'
  | 'get_analytics'
  | 'general_response';

export type WorkflowStepStatus =
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'failed';

export type AgentWorkflowStep = {
  id: string;
  label: string;
  status: WorkflowStepStatus;
  message?: string;
};

export type AgentRequest = {
  message: string;
  conversationId?: string;
};

export type AgentResponse = {
  success: boolean;
  message: string;
  conversationId?: string;
  action?: AgentAction;
  workflow?: AgentWorkflowStep[];
  data?: unknown;
};

export async function sendAgentMessage(
  payload: AgentRequest
): Promise<AgentResponse> {
  return api.post<AgentResponse>('/api/agent/chat', payload);
}

export async function getAgentHistory(
  conversationId: string
): Promise<AgentResponse[]> {
  const result = await api.get<{ messages: AgentResponse[] }>(
    `/api/agent/history/${encodeURIComponent(conversationId)}`
  );

  return result.messages;
}
