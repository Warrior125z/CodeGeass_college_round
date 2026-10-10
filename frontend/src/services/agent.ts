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
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
};

export type AgentResponse = {
  success: boolean;
  message: string;
  conversationId?: string;
  action?: AgentAction;
  workflow?: AgentWorkflowStep[];
  data?: unknown;
};

const NEXUS_API_URL = 'http://127.0.0.1:8000';

export async function sendAgentMessage(
  payload: AgentRequest
): Promise<AgentResponse> {
  const response = await fetch(`${NEXUS_API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: payload.message,
      history: payload.history ?? [],
    }),
  });

  if (!response.ok) {
    let errorMessage = `Nexus API request failed (${response.status})`;

    try {
      const errorData = await response.json();

      if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      }
    } catch {
      // Keep the default error message if the response isn't JSON.
    }

    throw new Error(errorMessage);
  }

  const data: { reply: string } = await response.json();

  return {
    success: true,
    message: data.reply,
    conversationId: payload.conversationId,
  };
}

export async function getAgentHistory(
  conversationId: string
): Promise<AgentResponse[]> {
  const result = await api.get<{ messages: AgentResponse[] }>(
    `/api/agent/history/${encodeURIComponent(conversationId)}`
  );

  return result.messages;
}