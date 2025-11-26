import type { SidebarLink } from "../types";

type SidebarProps = {
  links: SidebarLink[];
  activeLinkId: string | null;
  onSelect: (linkId: string) => void;
};

const Sidebar = ({ links, activeLinkId, onSelect }: SidebarProps) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-badge" aria-label="Ampily">
          <img
            src="/A.png"
            alt="Letra A estilizada da Ampily"
            className="brand-badge-logo"
            loading="lazy"
          />
          <span className="brand-badge-text">MPILY</span>
        </span>
      </div>
      <nav className="sidebar-nav" aria-label="Seções principais">
        {links.map((link) => {
          const isActive = link.id === activeLinkId;

          return (
            <button
              key={link.id}
              type="button"
              className={`sidebar-link${isActive ? " is-active" : ""}`}
              aria-pressed={isActive}
              onClick={() => onSelect(link.id)}
            >
              {link.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

