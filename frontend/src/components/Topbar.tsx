
import { Bell, Search, ChevronDown, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Topbar.css';

type TopbarProps = {
  title: string;
};

function Topbar({ title }: TopbarProps) {
  const [search, setSearch] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();

    if (!query) return;

    navigate(`/app/websites?search=${encodeURIComponent(query)}`);
  }

  return (
    <header className="nexus-topbar">
      <div className="topbar-title-area">
        <h1>{title}</h1>
        <p>Manage your business from one workspace.</p>
      </div>

      <div className="topbar-actions">
        <form className="topbar-search" onSubmit={handleSearch}>
          <Search size={17} />
          <input
            type="search"
            placeholder="Search workspace..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search workspace"
          />
          <kbd>⌘ K</kbd>
        </form>

        <button
          type="button"
          className="topbar-icon-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} />
          <span className="topbar-notification-dot" />
        </button>

        <div className="topbar-profile-container">
          <button
            type="button"
            className="topbar-profile-button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-expanded={showProfileMenu}
          >
            <span className="topbar-avatar">
              <UserRound size={18} />
            </span>

            <span className="topbar-profile-text">
              <strong>My Account</strong>
              <span>Workspace member</span>
            </span>

            <ChevronDown size={15} />
          </button>

          {showProfileMenu && (
            <div className="topbar-profile-menu">
              <button
                type="button"
                onClick={() => setShowProfileMenu(false)}
              >
                My profile
              </button>

              <button
                type="button"
                onClick={() => setShowProfileMenu(false)}
              >
                Account settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
