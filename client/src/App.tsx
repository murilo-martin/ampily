import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import Hero from "./components/Hero";
import ContentGrid from "./components/ContentGrid";
import Modal from "./components/Modal";
import PlansView from "./components/PlansView";
import ScheduleView from "./components/ScheduleView";
import WorkshopsView from "./components/WorkshopsView";
import {
  FALLBACK_CONTENT_ITEMS,
  FALLBACK_SIDEBAR_LINKS,
} from "./data/fallback";
import type { SidebarLink, ContentItem } from "./types";

const WORKSHOPS_USER_KEY = "workshopsUserEmail";

const App = () => {
  const [sidebarLinks, setSidebarLinks] = useState<SidebarLink[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [userRole, setUserRole] = useState<"admin" | "student">("student");
  const [workshopsUserEmail, setWorkshopsUserEmail] = useState<string | null>(
    null,
  );
  const shouldFetchFromApi = import.meta.env.VITE_ENABLE_API === "true";

  useEffect(() => {
    const storedEmail = window.localStorage.getItem(WORKSHOPS_USER_KEY);
    if (storedEmail) {
      setWorkshopsUserEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      if (!shouldFetchFromApi) {
        if (!isActive) {
          return;
        }

        setSidebarLinks(FALLBACK_SIDEBAR_LINKS);
        setItems(FALLBACK_CONTENT_ITEMS);
        setError("");
        setLoading(false);
        return;
      }

      try {
        const [sidebarRes, contentRes] = await Promise.all([
          fetch("/api/sidebar"),
          fetch("/api/content"),
        ]);

        if (!sidebarRes.ok || !contentRes.ok) {
          throw new Error("Não foi possível carregar os dados remotos.");
        }

        const sidebarData = (await sidebarRes.json()) as {
          links: SidebarLink[];
        };
        const contentData = (await contentRes.json()) as {
          items: ContentItem[];
        };

        if (!isActive) {
          return;
        }

        setSidebarLinks(sidebarData.links);
        setItems(contentData.items);
        setError("");
      } catch (err) {
        console.warn(
          "Falha ao buscar API. Carregando dados locais de fallback.",
          err,
        );

        if (!isActive) {
          return;
        }

        setSidebarLinks(FALLBACK_SIDEBAR_LINKS);
        setItems(FALLBACK_CONTENT_ITEMS);
        setError("");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false;
    };
  }, [shouldFetchFromApi]);

  useEffect(() => {
    setSelectedItem(null);
  }, [activeSection]);

  const isPlansView = activeSection === "plans";
  const isScheduleView = activeSection === "schedule";
  const isWorkshopsView = activeSection === "workshops";
  const activeSidebarLink =
    activeSection === "overview" ? null : activeSection;

  const mainClassName = useMemo(
    () =>
      [
        "content-area",
        isPlansView ? "content-area--plans" : "",
        isScheduleView ? "content-area--schedule" : "",
        isWorkshopsView ? "content-area--workshops" : "",
      ]
        .filter(Boolean)
        .join(" "),
    [isPlansView, isScheduleView, isWorkshopsView],
  );

  const handleWorkshopsLogin = (email: string) => {
    setWorkshopsUserEmail(email);
    window.localStorage.setItem(WORKSHOPS_USER_KEY, email);
  };

  const handleWorkshopsRegister = (email: string) => {
  };

  const handleWorkshopsLogout = () => {
    setWorkshopsUserEmail(null);
    window.localStorage.removeItem(WORKSHOPS_USER_KEY);
  };

  return (
    <div className="app-shell">
      <Sidebar
        links={sidebarLinks}
        activeLinkId={activeSidebarLink}
        onSelect={(linkId) => setActiveSection(linkId)}
      />
      <main className={mainClassName} aria-live="polite">
        {isPlansView ? (
          <PlansView />
        ) : isScheduleView ? (
          <ScheduleView userRole={userRole} onRoleChange={setUserRole} />
        ) : isWorkshopsView ? (
          <WorkshopsView
            isAuthenticated={Boolean(workshopsUserEmail)}
            onLogin={handleWorkshopsLogin}
            onLogout={handleWorkshopsLogout}
          />
        ) : (
          <>
            <Hero />
            <section className="content-section">
              <header className="content-header">
                <h2>Conteúdos</h2>
                <p>
                  Explore experiências e jornadas prontas para acelerar
                  resultados nas MPE&apos;s.
                </p>
              </header>
              {loading && (
                <p className="status-message">Carregando conteúdos...</p>
              )}
              {error && <p className="status-message error">{error}</p>}
              {!loading && !error && (
                <ContentGrid items={items} onSelect={setSelectedItem} />
              )}
            </section>
            <footer className="footer-highlight">
              <div className="footer-highlight__content">
                <p>
                  Ampily sua empresa com workshops, mentorias estratégicas e
                  comunidades exclusivas.
                </p>
                <p>
                  Nossa equipe está disponível no WhatsApp para apoiar sua
                  empresa em cada etapa.
                </p>
              </div>
              <a
                className="footer-cta"
                href="https://wa.me/5519992297835"
                target="_blank"
                rel="noreferrer"
              >
                Falar no WhatsApp
              </a>
            </footer>
          </>
        )}
      </main>
      {selectedItem && (
        <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};

export default App;





