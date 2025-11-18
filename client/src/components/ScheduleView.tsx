import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { FormEvent } from "react";

type UserRole = "admin" | "student";

export type ScheduleViewProps = {
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
};

type ScheduleEvent = {
  id: string;
  title: string;
  dateTime: string;
};

const BASE_DATE = new Date("2025-10-30T00:00:00");

const INITIAL_EVENTS: ScheduleEvent[] = [
  {
    id: "evt-mentor-1",
    title: "Mentoria de Onboarding",
    dateTime: "2025-10-30T19:00:00",
  },
  {
    id: "evt-lab-1",
    title: "Laboratório de Inovação - Aula 1",
    dateTime: "2025-11-04T18:30:00",
  },
  {
    id: "evt-lab-2",
    title: "Laboratório de Inovação - Aula 2",
    dateTime: "2025-11-11T18:30:00",
  },
  {
    id: "evt-leadership",
    title: "Workshop Liderança Híbrida",
    dateTime: "2025-12-02T17:00:00",
  },
];

const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const formatMonthLabel = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

const normalizeMonthStart = (date: Date) => {
  const normalized = new Date(date);
  normalized.setDate(1);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const BASE_MONTH_START = normalizeMonthStart(BASE_DATE);
const TOAST_DURATION = 3500;

const generateId = () => `evt-${Math.random().toString(36).slice(2, 11)}`;

const ScheduleView = ({ userRole, onRoleChange }: ScheduleViewProps) => {
  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    const filtered = INITIAL_EVENTS.filter(
      (event) => new Date(event.dateTime) >= BASE_DATE,
    );

    return filtered.sort(
      (a, b) =>
        new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );
  });

  const [currentMonth, setCurrentMonth] = useState<Date>(BASE_MONTH_START);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [formError, setFormError] = useState("");

  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [confirmEvent, setConfirmEvent] = useState<ScheduleEvent | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => new Date(event.dateTime) >= BASE_DATE),
    [events],
  );

  const monthEvents = useMemo(() => {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();

    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.dateTime);
      return (
        eventDate.getMonth() === month && eventDate.getFullYear() === year
      );
    });
  }, [filteredEvents, currentMonth]);

  const upcomingEvents = useMemo(
    () =>
      filteredEvents.filter(
        (event) => new Date(event.dateTime) >= new Date(),
      ),
    [filteredEvents],
  );

  const canGoToPreviousMonth =
    currentMonth.getFullYear() > BASE_MONTH_START.getFullYear() ||
    (currentMonth.getFullYear() === BASE_MONTH_START.getFullYear() &&
      currentMonth.getMonth() > BASE_MONTH_START.getMonth());

  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const updated = new Date(prev);
      updated.setMonth(
        direction === "prev" ? prev.getMonth() - 1 : prev.getMonth() + 1,
      );
      updated.setDate(1);

      if (direction === "prev" && !canGoToPreviousMonth) {
        return prev;
      }

      if (
        updated.getFullYear() < BASE_MONTH_START.getFullYear() ||
        (updated.getFullYear() === BASE_MONTH_START.getFullYear() &&
          updated.getMonth() < BASE_MONTH_START.getMonth())
      ) {
        return BASE_MONTH_START;
      }

      return updated;
    });
  };

  type CalendarCell =
    | {
        date: Date;
        isBeforeBase: boolean;
        events: ScheduleEvent[];
      }
    | null;

  const calendarMatrix = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

    const cells: CalendarCell[] = [];

    let currentDay = 1;

    for (let cellIndex = 0; cellIndex < totalCells; cellIndex += 1) {
      if (cellIndex < firstDayIndex || currentDay > daysInMonth) {
        cells.push(null);
        continue;
      }

      const cellDate = new Date(year, month, currentDay);
      const isBeforeBase = cellDate < BASE_DATE;
      const eventsForDay = monthEvents.filter((event) => {
        const eventDate = new Date(event.dateTime);
        return eventDate.getDate() === currentDay;
      });

      cells.push({
        date: cellDate,
        isBeforeBase,
        events: eventsForDay,
      });

      currentDay += 1;
    }

    const weeks: CalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    return weeks;
  }, [currentMonth, monthEvents]);

  const handleCreateEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!newEventTitle || !newEventDate || !newEventTime) {
      setFormError("Preencha título, data e horário da aula.");
      return;
    }

    const composedDate = new Date(`${newEventDate}T${newEventTime}`);

    if (Number.isNaN(composedDate.getTime())) {
      setFormError("Data ou horário inválido.");
      return;
    }

    if (composedDate < BASE_DATE) {
      setFormError("Escolha uma data igual ou posterior a 30/10/2025.");
      return;
    }

    const newEvent: ScheduleEvent = {
      id: generateId(),
      title: newEventTitle,
      dateTime: composedDate.toISOString(),
    };

    setEvents((prev) =>
      [...prev, newEvent].sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      ),
    );

    setNewEventTitle("");
    setNewEventDate("");
    setNewEventTime("");
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
  };

  const handleRoleToggle = (role: UserRole) => {
    if (role !== userRole) {
      onRoleChange(role);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setIsToastVisible(false);
      toastTimeoutRef.current = null;
    }, TOAST_DURATION);
  };

  const openEventModal = (eventItem: ScheduleEvent) => {
    setSelectedEvent(eventItem);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  const openConfirmModal = (eventItem: ScheduleEvent) => {
    setConfirmEvent(eventItem);
  };

  const closeConfirmModal = () => {
    setConfirmEvent(null);
  };

  const handleOverlayClick = (
    overlayEvent: ReactMouseEvent<HTMLDivElement>,
    onClose: () => void,
  ) => {
    if (overlayEvent.target === overlayEvent.currentTarget) {
      onClose();
    }
  };

  const confirmDeletion = (eventItem: ScheduleEvent) => {
    handleDeleteEvent(eventItem.id);
    showToast("Aula removida com sucesso.");
    setConfirmEvent(null);
    setSelectedEvent(null);
  };

  return (
    <div className="schedule-view">
      {isToastVisible && (
        <div className="schedule-toast-container" role="status" aria-live="polite">
          <div className="schedule-toast">
            <span aria-hidden="true">✓</span>
            <p>{toastMessage}</p>
          </div>
        </div>
      )}
      <section className="plans-hero" aria-labelledby="schedule-heading">
        <div className="plans-hero-overlay">
          <h2 id="schedule-heading">Cronograma</h2>
        </div>
      </section>
      <div className="schedule-header">
        <div className="schedule-role-toggle" role="radiogroup">
          <button
            type="button"
            className={`role-toggle ${userRole === "student" ? "is-active" : ""}`}
            role="radio"
            aria-checked={userRole === "student"}
            onClick={() => handleRoleToggle("student")}
          >
            Aluna
          </button>
          <button
            type="button"
            className={`role-toggle ${userRole === "admin" ? "is-active" : ""}`}
            role="radio"
            aria-checked={userRole === "admin"}
            onClick={() => handleRoleToggle("admin")}
          >
            Administrador
          </button>
        </div>
        <div className="schedule-controls">
          <button
            type="button"
            className="schedule-nav"
            onClick={() => handleMonthChange("prev")}
            disabled={!canGoToPreviousMonth}
          >
            &lt; Mês anterior
          </button>
          <span className="schedule-month" aria-live="polite">
            {formatMonthLabel(currentMonth)}
          </span>
          <button
            type="button"
            className="schedule-nav"
            onClick={() => handleMonthChange("next")}
          >
            Próximo mês &gt;
          </button>
        </div>
      </div>
      <div className="schedule-content">
        <div className="schedule-calendar-wrapper">
          <table className="schedule-calendar" aria-label="Calendário de aulas">
            <thead>
              <tr>
                {WEEKDAY_LABELS.map((weekday) => (
                  <th key={weekday} scope="col">
                    {weekday}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarMatrix.map((week, weekIndex) => (
                <tr key={`week-${weekIndex}`}>
                  {week.map((cell, cellIndex) => {
                    if (!cell) {
                      return (
                        <td key={`empty-${weekIndex}-${cellIndex}`} aria-hidden="true" />
                      );
                    }

                    const { date, events: cellEvents, isBeforeBase } = cell;
                    const dayNumber = date.getDate();

                    return (
                      <td
                        key={date.toISOString()}
                        className={`schedule-day${isBeforeBase ? " is-disabled" : ""}${
                          cellEvents.length > 0 ? " has-event" : ""
                        }`}
                      >
                        <span className="schedule-day-number">{dayNumber}</span>
                        {cellEvents.length > 0 && (
                          <ul className="schedule-day-events">
                            {cellEvents.map((eventItem) => {
                              const timeLabel = new Date(
                                eventItem.dateTime,
                              ).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              });

                              return (
                                <li key={eventItem.id}>
                                  <span className="event-time">{timeLabel}</span>
                                  <span className="event-title">
                                    {eventItem.title}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <footer className="schedule-calendar-footer">
            <p>
              Os horários são apresentados no fuso horário de Brasília. Novas aulas
              aparecem automaticamente após serem adicionadas.
            </p>
          </footer>
        </div>
        <aside className="schedule-sidebar">
          {userRole === "admin" ? (
            <div className="schedule-admin-panel">
              <h3>Adicionar aula online</h3>
              <p>Cadastre novas sessões a partir de 30/10/2025.</p>
              <form className="schedule-form" onSubmit={handleCreateEvent}>
                <label>
                  Título da aula
                  <input
                    type="text"
                    value={newEventTitle}
                    onChange={(event) => setNewEventTitle(event.target.value)}
                    placeholder="Ex.: Mentoria Estratégica"
                    required
                  />
                </label>
                <label>
                  Data
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(event) => setNewEventDate(event.target.value)}
                    min="2025-10-30"
                    required
                  />
                </label>
                <label>
                  Horário
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(event) => setNewEventTime(event.target.value)}
                    required
                  />
                </label>
                {formError && <p className="schedule-form-error">{formError}</p>}
                <button type="submit" className="schedule-submit">
                  Salvar aula
                </button>
              </form>
              {filteredEvents.length > 0 && (
                <div className="schedule-admin-list">
                  <h4>Aulas cadastradas</h4>
                  <ul>
                    {filteredEvents.map((eventItem) => {
                      const eventDate = new Date(eventItem.dateTime);
                      const dateLabel = eventDate.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      });
                      const timeLabel = eventDate.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <li key={eventItem.id}>
                          <button
                            type="button"
                            className="admin-event"
                            onClick={() => openEventModal(eventItem)}
                          >
                            <div className="admin-event-info">
                              <strong>{eventItem.title}</strong>
                              <span>
                                {dateLabel} às {timeLabel}
                              </span>
                            </div>
                            <span className="admin-event-action">Gerenciar</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="schedule-student-panel">
              <h3>Próximas aulas online</h3>
              {upcomingEvents.length === 0 ? (
                <p>Nenhuma aula futura cadastrada ainda.</p>
              ) : (
                <ul className="schedule-upcoming-list">
                  {upcomingEvents.map((eventItem) => {
                    const eventDate = new Date(eventItem.dateTime);
                    const dayLabel = eventDate.toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                    });
                    const timeLabel = eventDate.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <li key={eventItem.id}>
                        <h4>{eventItem.title}</h4>
                        <p>{dayLabel}</p>
                        <span>{timeLabel}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </aside>
      </div>
      {selectedEvent && (
        <div
          className="schedule-modal-overlay"
          role="dialog"
          aria-labelledby="manage-event-title"
          aria-modal="true"
          onClick={(event) => handleOverlayClick(event, closeEventModal)}
        >
          <div className="schedule-modal">
            <button
              type="button"
              className="schedule-modal-close"
              aria-label="Fechar modal"
              onClick={closeEventModal}
            >
              &times;
            </button>
            <h4 id="manage-event-title">{selectedEvent.title}</h4>
            <p>
              Data:{" "}
              {new Date(selectedEvent.dateTime).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
            <p>
              Horário:{" "}
              {new Date(selectedEvent.dateTime).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <div className="schedule-modal-actions">
              <button
                type="button"
                className="schedule-modal-delete"
                onClick={() => openConfirmModal(selectedEvent)}
              >
                Excluir aula
              </button>
              <button
                type="button"
                className="schedule-modal-secondary"
                onClick={closeEventModal}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmEvent && (
        <div
          className="schedule-modal-overlay"
          role="alertdialog"
          aria-labelledby="confirm-delete-title"
          aria-modal="true"
          onClick={(event) => handleOverlayClick(event, closeConfirmModal)}
        >
          <div className="schedule-modal">
            <h4 id="confirm-delete-title">Confirmar exclusão</h4>
            <p>
              Tem certeza que deseja remover a aula{" "}
              <strong>{confirmEvent.title}</strong>?
            </p>
            <div className="schedule-modal-actions">
              <button
                type="button"
                className="schedule-modal-secondary"
                onClick={closeConfirmModal}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="schedule-modal-delete"
                onClick={() => confirmDeletion(confirmEvent)}
              >
                Sim, remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
