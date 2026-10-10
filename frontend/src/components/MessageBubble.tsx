
import { Bot, UserRound, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import '../styles/MessageBubble.css';

type MessageBubbleProps = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
};

function MessageBubble({
  role,
  content,
  timestamp,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  }

  const isAssistant = role === 'assistant';

  return (
    <article
      className={`message-bubble message-bubble-${role}`}
    >
      <div className="message-bubble-avatar">
        {isAssistant ? (
          <Bot size={17} />
        ) : (
          <UserRound size={17} />
        )}
      </div>

      <div className="message-bubble-main">
        <div className="message-bubble-heading">
          <strong>{isAssistant ? 'Nexus AI' : 'You'}</strong>

          {timestamp && (
            <time className="message-bubble-time">
              {timestamp}
            </time>
          )}
        </div>

        <div className="message-bubble-content">
          {content}
        </div>

        {isAssistant && (
          <button
            type="button"
            className="message-bubble-copy"
            onClick={handleCopy}
            aria-label={copied ? 'Copied message' : 'Copy message'}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>
    </article>
  );
}

export default MessageBubble;
