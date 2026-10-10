
import { useState } from 'react';
import { ArrowUp, Bot, UserRound, Sparkles, LoaderCircle } from 'lucide-react';
import '../styles/ChatPanel.css';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type ChatPanelProps = {
  messages?: ChatMessage[];
  onSend?: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
};

function ChatPanel({
  messages = [],
  onSend,
  isLoading = false,
  placeholder = 'Ask Nexus AI anything...',
}: ChatPanelProps) {
  const [input, setInput] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    if (!message || isLoading || !onSend) return;

    onSend(message);
    setInput('');
  }

  return (
    <section
      className="nexus-chat-panel"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--cursor-x', `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty('--cursor-y', `${event.clientY - rect.top}px`);
      }}
    >
      <div className="chat-panel-header">
        <div className="chat-panel-agent-icon">
          <Sparkles size={18} />
        </div>

        <div className="chat-panel-agent-info">
          <h3>Nexus AI</h3>
          <p>
            <span className="chat-panel-status-dot" />
            Business assistant
          </p>
        </div>
      </div>

      <div className="chat-panel-messages" aria-live="polite">
        {messages.length === 0 ? (
          <div className="chat-panel-empty">
            <div className="chat-panel-empty-icon">
              <Bot size={27} />
            </div>

            <h4>How can I help you?</h4>

            <p>
              Describe a business task, and we can work through
              it together.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`chat-panel-message chat-panel-message-${message.role}`}
            >
              <div className="chat-panel-message-avatar">
                {message.role === 'assistant' ? (
                  <Sparkles size={15} />
                ) : (
                  <UserRound size={15} />
                )}
              </div>

              <div className="chat-panel-message-content">
                <span>
                  {message.role === 'assistant' ? 'Nexus AI' : 'You'}
                </span>

                <p>{message.content}</p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="chat-panel-progress">
            <div className="chat-panel-robot">
              <video autoPlay muted loop playsInline aria-hidden="true">
                <source src="/videos/nexus-robot.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="chat-panel-loading">
              <LoaderCircle size={16} className="chat-panel-spinner" />
              <span>Your work is in progress. Stay with me.</span>
            </div>
          </div>
        )}
      </div>

      <form className="chat-panel-composer" onSubmit={handleSubmit}>
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
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={placeholder}
          rows={2}
          aria-label="Message Nexus AI"
          disabled={isLoading}
        />

        <div className="chat-panel-composer-footer">
          <span>Enter to send · Shift + Enter for a new line</span>

          <button
            type="submit"
            disabled={!input.trim() || isLoading || !onSend}
            aria-label="Send message"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </form>
    </section>
  );
}

export default ChatPanel;
