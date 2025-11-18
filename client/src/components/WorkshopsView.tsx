﻿﻿﻿﻿﻿import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

type WorkshopsViewProps = {
  isAuthenticated: boolean;
  onLogin: (email: string) => void;
  onLogout: () => void;
};

type WorkshopLesson = {
  id: string;
  title: string;
  summary: string;
  videoId: string;
  videoTitle: string;
  presenter: string;
  durationSeconds: number;
  playlistId?: string;
};

type WorkshopTopic = {
  id: string;
  title: string;
  lessonId: string;
};

type ToastState = {
  message: string;
  variant: "success" | "error";
};

type LessonProgressMap = Record<string, number>;

type YouTubePlayerInstance = {
  destroy: () => void;
  stopVideo?: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onStateChange?: (event: { data: number }) => void;
          };
        },
      ) => YouTubePlayerInstance;
      PlayerState: {
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const formatDurationLabel = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const paddedMinutes = hours > 0 ? minutes.toString().padStart(2, "0") : minutes.toString();
  const paddedSeconds = secs.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}h ${paddedMinutes}m ${paddedSeconds}s`;
  }

  return `${paddedMinutes}m ${paddedSeconds}s`;
};

const AUTH_EMAIL = "teste@teste.com";
const AUTH_PASSWORD = "123";
const REGISTERED_USER_KEY = "workshopsRegisteredUser";

const WORKSHOP_LESSONS: WorkshopLesson[] = [
  {
    id: "lesson-1",
    title: "Aula 01 - Recrutamento e Seleção",
    summary:
      "Construa a base do processo entendendo etapas, papéis e indicadores essenciais para recrutar bem.",
    videoId: "5zuZsvK6mkA",
    videoTitle: "Curso de Recrutamento e Seleção - Aula 11: Roteiro da Entrevista",
    presenter: "Prime Cursos do Brasil",
    durationSeconds: 193,
    playlistId: "PLFKhhNd35zq8PMt964NDjvLeG3-UlVYSN",
  },
  {
    id: "lesson-2",
    title: "Aula 02 - Planejamento da Contratação",
    summary:
      "Mapeie perfis ideais, defina cronogramas e organize materiais de entrevista com foco no resultado.",
    videoId: "eaqvm7PYhhQ",
    videoTitle: "Gestão de Recursos Humanos: 6 principais atividades do RH | RH Academy",
    presenter: "RH Academy",
    durationSeconds: 1000,
  },
  {
    id: "lesson-3",
    title: "Aula 03 - Atração de Candidatos",
    summary:
      "Aprenda a divulgar vagas, apresentar cultura e criar mensagens que atraiam profissionais alinhados.",
    videoId: "In-vSx9YT5k",
    videoTitle: "Recrutamento e Seleção | Como atrair os melhores candidatos",
    presenter: "Você Recrutador",
    durationSeconds: 263,
  },
  {
    id: "lesson-4",
    title: "Aula 04 - Escolha do Candidato",
    summary:
      "Guie entrevistas, testes e comparações com critérios objetivos para tomar a melhor decisão.",
    videoId: "MBjqzpU8n54",
    videoTitle: "Quais Perguntas Fazer em uma ENTREVISTA de EMPREGO ?",
    presenter: "Aline Meireles",
    durationSeconds: 495,
  },
  {
    id: "lesson-5",
    title: "Aula 05 - Integração e Acompanhamento",
    summary:
      "Crie experiências de onboarding, acompanhamento dos primeiros dias e indicadores de sucesso.",
    videoId: "eUgd3uhCGY8",
    videoTitle: "COMO FAZER UM TREINAMENTO DE INTEGRAÇÃO NA PRÁTICA ?",
    presenter: "Aline Meireles",
    durationSeconds: 368,
  },
  {
    id: "lesson-6",
    title: "Aula 06 - Onboarding Estratégico",
    summary:
      "Conecte novas contratações aos objetivos da empresa e fortaleça a jornada de desenvolvimento contínuo.",
    videoId: "_QP8O01017c",
    videoTitle: "Onboarding - O que é e como colocar em prática | RH Academy",
    presenter: "RH Academy",
    durationSeconds: 849,
  },
];

const WORKSHOP_TOPICS: WorkshopTopic[] = [
  {
    id: "topic-1",
    title: "Recrutamento e Seleção",
    lessonId: "lesson-1",
  },
  {
    id: "topic-2",
    title: "Planejamento da Contratação",
    lessonId: "lesson-2",
  },
  {
    id: "topic-3",
    title: "Atração de Candidatos",
    lessonId: "lesson-3",
  },
  {
    id: "topic-4",
    title: "Escolha do Candidato",
    lessonId: "lesson-4",
  },
  {
    id: "topic-5",
    title: "Integração e Acompanhamento",
    lessonId: "lesson-5",
  },
  {
    id: "topic-6",
    title: "Onboarding Estratégico",
    lessonId: "lesson-6",
  },
];

const Toast = ({ message, variant }: ToastState) => (
  <div className={`workshop-toast workshop-toast--${variant}`} role="status">
    <span aria-hidden="true">✓</span>
    <p>{message}</p>
  </div>
);

const WorkshopsView = ({
  isAuthenticated,
  onLogin,
  onLogout
}: WorkshopsViewProps) => {
  const [selectedLessonId, setSelectedLessonId] = useState(WORKSHOP_LESSONS[0].id);
  const [activeTopicId, setActiveTopicId] = useState(WORKSHOP_TOPICS[0].id);
  const [loginEmail, setLoginEmail] = useState(AUTH_EMAIL);
  const [loginPassword, setLoginPassword] = useState(AUTH_PASSWORD);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isAuthOverlayOpen, setAuthOverlayOpen] = useState(!isAuthenticated);
  const [showRegister, setShowRegister] = useState(false);
  const [videoLesson, setVideoLesson] = useState<WorkshopLesson | null>(null);
  const [registeredUser, setRegisteredUser] = useState<{
    name: string;
    email: string;
    password: string;
    cpf: string;
    phone: string;
  } | null>(null);
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    cpf: "",
    phone: "",
  });
  const [lessonProgress, setLessonProgress] = useState<LessonProgressMap>({});
  const [isYouTubeReady, setYouTubeReady] = useState(false);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);

  const closeVideoModal = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    setVideoLesson(null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.YT && window.YT.Player) {
      setYouTubeReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);

    const handleReady = () => {
      setYouTubeReady(true);
    };

    window.onYouTubeIframeAPIReady = handleReady;

    return () => {
      if (window.onYouTubeIframeAPIReady === handleReady) {
        window.onYouTubeIframeAPIReady = undefined;
      }
    };
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !videoLesson ||
      !isYouTubeReady ||
      !window.YT ||
      !window.YT.Player
    ) {
      return;
    }

    const elementId = "workshop-video-player";

    const instantiatePlayer = () => {
      playerRef.current = new window.YT!.Player(elementId, {
        videoId: videoLesson.videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          ...(videoLesson.playlistId ? { list: videoLesson.playlistId } : {}),
        },
        events: {
          onStateChange: (event) => {
            if (window.YT && event.data === window.YT.PlayerState.ENDED) {
              setLessonProgress((prev) => ({
                ...prev,
                [videoLesson.id]: 100,
              }));
            }
          },
        },
      });
    };

    const timer = window.setTimeout(instantiatePlayer, 0);

    return () => {
      window.clearTimeout(timer);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoLesson, isYouTubeReady]);

  useEffect(() => {
    if (videoLesson) {
      setLessonProgress((prev) => ({
        ...prev,
        [videoLesson.id]: 0,
      }));
    }
  }, [videoLesson]);

  useEffect(() => {
    if (isAuthenticated) {
      setAuthOverlayOpen(false);
    } else {
      setAuthOverlayOpen(true);
      if (registeredUser) {
        setLoginEmail(registeredUser.email);
        setLoginPassword(registeredUser.password);
      } else {
        setLoginEmail(AUTH_EMAIL);
        setLoginPassword(AUTH_PASSWORD);
      }
      setShowRegister(false);
    }
  }, [isAuthenticated, registeredUser]);

  useEffect(() => {
    const stored = window.localStorage.getItem(REGISTERED_USER_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as typeof registerData;
        setRegisteredUser(parsed);
        setLoginEmail(parsed.email);
        setLoginPassword(parsed.password);
      } catch (err) {
        console.warn("Não foi possível carregar cadastro salvo.", err);
      }
    }
  }, []);

  useEffect(() => {
    if (toast) {
      const timeout = window.setTimeout(() => setToast(null), 3200);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [toast]);

  useEffect(() => {
    const topic = WORKSHOP_TOPICS.find((item) => item.id === activeTopicId);
    if (topic) {
      setSelectedLessonId(topic.lessonId);
    }
  }, [activeTopicId]);

  useEffect(() => {
    if (!videoLesson) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeVideoModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [videoLesson, closeVideoModal]);

  const selectedLesson = useMemo(
    () => WORKSHOP_LESSONS.find((lesson) => lesson.id === selectedLessonId),
    [selectedLessonId],
  );
  const selectedLessonProgress = selectedLesson
    ? Math.round(lessonProgress[selectedLesson.id] ?? 0)
    : 0;

  const handleLessonClick = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    const topicFromLesson = WORKSHOP_TOPICS.find((topic) => topic.lessonId === lessonId);
    if (topicFromLesson) {
      setActiveTopicId(topicFromLesson.id);
    }
  };

  const handleWatchLesson = () => {
    if (selectedLesson) {
      setLessonProgress((prev) => ({
        ...prev,
        [selectedLesson.id]: 0,
      }));
      setVideoLesson(selectedLesson);
    }
  };

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = loginEmail.trim().toLowerCase();
    const trimmedPassword = loginPassword.trim();
    const matchesDefault =
      normalizedEmail === AUTH_EMAIL && trimmedPassword === AUTH_PASSWORD;
    const matchesRegistered =
      registeredUser &&
      registeredUser.email.trim().toLowerCase() === normalizedEmail &&
      registeredUser.password === trimmedPassword;
    const isValid = matchesDefault || matchesRegistered;

    if (!isValid) {
      setToast({
        message: "Credenciais inválidas. Use teste@teste.com e senha 123 ou utilize seu cadastro.",
        variant: "error",
      });
      return;
    }

    onLogin(AUTH_EMAIL);
    setAuthOverlayOpen(false);
    setToast({
      message: "Login realizado com sucesso.",
      variant: "success",
    });
  };

  const handleRegisterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { name, email, password, cpf, phone } = registerData;

    if (!name.trim() || !email.trim() || !password.trim() || !cpf.trim() || !phone.trim()) {
      setToast({
        message: "Preencha todos os campos para concluir o cadastro.",
        variant: "error",
      });
      return;
    }

    const newUser = {
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      cpf: cpf.trim(),
      phone: phone.trim(),
    };

    window.localStorage.setItem(REGISTERED_USER_KEY, JSON.stringify(newUser));
    setRegisteredUser(newUser);
    setLoginEmail(newUser.email);
    setLoginPassword(newUser.password);
    setShowRegister(false);
    setRegisterData({
      name: "",
      email: "",
      password: "",
      cpf: "",
      phone: "",
    });
    onLogin(newUser.email);
    setToast({
      message: "Cadastro realizado com sucesso. Você já está conectado!",
      variant: "success",
    });
  };

  const handleLogoutClick = () => {
    onLogout();
    setToast({
      message: "Sessão encerrada. Faça login novamente.",
      variant: "success",
    });
  };

  return (
    <div className="workshops-view">
      {toast && <Toast message={toast.message} variant={toast.variant} />}
      <section className="plans-hero" aria-labelledby="workshops-heading">
        <div className="plans-hero-overlay">
          <h2 id="workshops-heading">Workshops</h2>
        </div>
      </section>
      <div className="workshops-layout">
        <main className="workshop-main">
          <header className="workshop-main-header">
            <div className="workshop-main-intro">
              <h3>Aulas disponíveis</h3>
              <p>
                Acompanhe as aulas gravadas e avance na trilha de contratação
                eficiente para sua empresa.
              </p>
            </div>
            <button type="button" className="workshop-logout" onClick={handleLogoutClick}>
              Sair
            </button>
          </header>

          <ul className="workshop-lesson-list">
            {WORKSHOP_LESSONS.map((lesson) => {
              const isActive = lesson.id === selectedLessonId;
              const progressValue = Math.round(lessonProgress[lesson.id] ?? 0);
              const lessonClassName = ["workshop-lesson", isActive ? "is-active" : ""]
                .filter(Boolean)
                .join(" ");
              const durationLabel = formatDurationLabel(lesson.durationSeconds);
              return (
                <li key={lesson.id} className="workshop-lesson-item">
                  <button
                    type="button"
                    className={lessonClassName}
                    onClick={() => handleLessonClick(lesson.id)}
                  >
                    <div>
                      <span className="lesson-title">{lesson.title}</span>
                      <span className="lesson-duration">{durationLabel}</span>
                    </div>
                    <span className="lesson-action" aria-hidden="true">
                      &rsaquo;
                    </span>
                  </button>
                  <div
                    className="lesson-progress"
                    aria-label={"Progresso de " + lesson.title}
                  >
                    <div className="lesson-progress-track">
                      <div
                        className="lesson-progress-bar"
                        style={{ width: progressValue + "%" }}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="lesson-progress-value">{progressValue}%</span>
                  </div>
                </li>
              );
            })}
          </ul>

          {selectedLesson && (
            <article className="workshop-lesson-details">
              <h4>{selectedLesson.title}</h4>
              <p>{selectedLesson.summary}</p>
              <p className="lesson-presenter">
                <strong>{selectedLesson.presenter}</strong> · {selectedLesson.videoTitle}
              </p>
              <p className="lesson-duration-meta">
                Duração: {formatDurationLabel(selectedLesson.durationSeconds)}
              </p>
              <div
                className="lesson-progress lesson-progress--card"
                aria-label={"Progresso de " + selectedLesson.title}
              >
                <div className="lesson-progress-track">
                  <div
                    className="lesson-progress-bar"
                    style={{ width: selectedLessonProgress + "%" }}
                    aria-hidden="true"
                  />
                </div>
                <span className="lesson-progress-value">
                  {selectedLessonProgress}%
                </span>
              </div>
              <button type="button" className="workshop-start-btn" onClick={handleWatchLesson}>
                Assistir agora
              </button>
            </article>
          )}
        </main>
        <aside className="workshop-modules">
          <h3>Materiais do Workshop</h3>
          <nav aria-label="Módulos do workshop">
            {WORKSHOP_TOPICS.map((topic) => {
              const isActive = topic.id === activeTopicId;
              return (
                <button
                  key={topic.id}
                  type="button"
                  className={`workshop-module-btn${isActive ? " is-active" : ""}`}
                  onClick={() => setActiveTopicId(topic.id)}
                >
                  {topic.title}
                </button>
              );
            })}
          </nav>
        </aside>
      </div>
      {videoLesson && (
        <div
          className="workshop-video-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={"Assistindo " + videoLesson.videoTitle}
          onClick={closeVideoModal}
        >
          <div
            className="workshop-video-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="workshop-video-close"
              aria-label="Fechar vídeo"
              onClick={closeVideoModal}
            >
              &times;
            </button>
            <h4>{videoLesson.videoTitle}</h4>
            <p className="workshop-video-presenter">
              Com {videoLesson.presenter} · {formatDurationLabel(videoLesson.durationSeconds)}
            </p>
            <div className="workshop-video-wrapper">
              <div id="workshop-video-player" className="workshop-video-frame" />
            </div>
          </div>
        </div>
      )}
      {isAuthOverlayOpen && (
        <div className="workshop-auth-overlay" role="dialog" aria-modal="true">
          <div className="workshop-auth-card">
            {showRegister ? (
              <>
                <h3>Cadastre-se</h3>
                <form className="workshop-form" onSubmit={handleRegisterSubmit}>
                  <label>
                    Nome
                    <input
                      type="text"
                      value={registerData.name}
                      onChange={(event) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(event) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label>
                    Senha
                    <input
                      type="password"
                      value={registerData.password}
                      onChange={(event) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label>
                    CPF
                    <input
                      type="text"
                      value={registerData.cpf}
                      onChange={(event) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          cpf: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label>
                    Telefone
                    <input
                      type="tel"
                      value={registerData.phone}
                      onChange={(event) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <button type="submit" className="workshop-auth-submit">
                    Cadastrar
                  </button>
                </form>
                <button
                  type="button"
                  className="workshop-auth-switch"
                  onClick={() => setShowRegister(false)}
                >
                  Já possui login? Entrar
                </button>
              </>
            ) : (
              <>
                <h3>Login</h3>
                <form className="workshop-form" onSubmit={handleLoginSubmit}>
                  <label>
                    Email
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Senha
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      required
                    />
                  </label>
                  <button type="submit" className="workshop-auth-submit">
                    Entrar
                  </button>
                </form>
                <button
                  type="button"
                  className="workshop-auth-switch"
                  onClick={() => {
                    setRegisterData({
                      name: "",
                      email: "",
                      password: "",
                      cpf: "",
                      phone: "",
                    });
                    setShowRegister(true);
                  }}
                >
                  Fazer cadastro
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopsView;
