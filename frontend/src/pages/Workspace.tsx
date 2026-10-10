
import { useState } from 'react';
import {
  ArrowUp,
  Bot,
  Globe,
  Users,
  CalendarDays,
  BarChart3,
  Sparkles,
  Plus,
  Command,
  LoaderCircle,
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import '../styles/Workspace.css';

const suggestions = [
  {
    icon: Globe,
    title: 'Build a website',
    description: 'Create a landing page for my business.',
    prompt:
      'Create a modern landing page for my business with a hero section, features, pricing, and a contact form.',
  },
  {
    icon: Users,
    title: 'Manage my leads',
    description: 'Organize leads in my CRM.',
    prompt:
      'Help me set up my CRM and create a workflow for managing new business leads.',
  },
  {
    icon: CalendarDays,
    title: 'Plan a webinar',
    description: 'Prepare my next online event.',
    prompt:
      'Help me plan a webinar, including its title, description, schedule, and registration workflow.',
  },
  {
    icon: BarChart3,
    title: 'View business insights',
    description: 'Understand my business performance.',
    prompt:
      'Show me which business metrics I should track and create a simple analytics plan.',
  },
];

type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
};

function Workspace() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  function handleSend(messageText?: string) {
    const text = (messageText ?? input).trim();

    if (!text || isThinking) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput('');
    setIsThinking(true);

    // Temporary response until the real AI API is connected.
    window.setTimeout(() => {
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content:
          'Your instruction has been received. Once the Nexus AI backend is connected, I will analyze your request, select the appropriate business tools, and show the workflow results here.',
      };

      setMessages((previous) => [...previous, assistantMessage]);
      setIsThinking(false);
    }, 700);
  }

  return (
    <div className="workspace-layout">
      <Sidebar />

      <main className="workspace-main">
        <Topbar title="AI Workspace" />

        <section className="workspace-content">
          <div className="workspace-heading">
            <div className="workspace-heading-icon">
              <Sparkles size={19} />
            </div>

            <div>
              <span className="workspace-eyebrow">
                YOUR BUSINESS, SIMPLIFIED
              </span>
              <h2>What can we build today?</h2>
              <p>
                Describe what you need. Nexus AI helps turn your ideas
                into organized business workflows.
              </p>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="workspace-empty-state">
              <div className="workspace-orb">
                <div className="workspace-orb-inner">
                  <Bot size={34} />
                </div>
              </div>

              <h3>Your ideas start here.</h3>
              <p>
                Ask Nexus AI to help with your website, leads,
                webinars, or business insights.
              </p>

              <div className="workspace-suggestions">
                {suggestions.map((suggestion) => {
                  const Icon = suggestion.icon;

                  return (
                    <button
                      className="workspace-suggestion-card"
                      type="button"
                      key={suggestion.title}
                      onClick={() => handleSend(suggestion.prompt)}
                    >
                      <span className="suggestion-icon">
                        <Icon size={18} />
                      </span>

                      <span className="suggestion-copy">
                        <strong>{suggestion.title}</strong>
                        <span>{suggestion.description}</span>
                      </span>

                      <ArrowUp
                        className="suggestion-arrow"
                        size={16}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="workspace-conversation">
              {messages.map((message) => (
                <article
                  className={`workspace-message workspace-message-${message.role}`}
                  key={message.id}
                >
                  <div className="workspace-message-avatar">
                    {message.role === 'assistant' ? (
                      <Sparkles size={16} />
                    ) : (
                      <Users size={16} />
                    )}
                  </div>

                  <div className="workspace-message-body">
                    <span className="workspace-message-author">
                      {message.role === 'assistant'
                        ? 'Nexus AI'
                        : 'You'}
                    </span>
                    <p>{message.content}</p>
                  </div>
                </article>
              ))}

              {isThinking && (
                <div className="workspace-thinking">
                  <LoaderCircle size={17} className="workspace-spinner" />
                  <span>Nexus AI is thinking...</span>
                </div>
              )}
            </div>
          )}

          <div className="workspace-composer-area">
            <form
              className="workspace-composer"
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
            >
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Tell Nexus AI what you want to accomplish..."
                rows={2}
                aria-label="Message Nexus AI"
              />

              <div className="workspace-composer-footer">
                <div className="workspace-composer-hint">
                  <Command size={13} />
                  <span>Business assistant</span>
                  <span className="composer-hint-divider">·</span>
                  <span>Enter to send</span>
                </div>

                <button
                  type="submit"
                  className="workspace-send-button"
                  disabled={!input.trim() || isThinking}
                  aria-label="Send message"
                >
                  <ArrowUp size={19} />
                </button>
              </div>
            </form>

            <p className="workspace-disclaimer">
              Nexus AI can make mistakes. Review important business
              actions before applying them.
            </p>
          </div>

          <button
            className="workspace-new-chat"
            type="button"
            onClick={() => {
              setMessages([]);
              setInput('');
              setIsThinking(false);
            }}
          >
            <Plus size={15} />
            New conversation
          </button>
        </section>
      </main>
    </div>
  );
}

export default Workspace;
