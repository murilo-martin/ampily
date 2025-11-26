import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

type PlanOption = {
  id: string;
  label: string;
  price: string;
  image: string;
};

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: "cash",
    label: "À VISTA",
    price: "R$2000,00",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "installments-8x",
    label: "8x",
    price: "R$250,00",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "installments-12x",
    label: "12x",
    price: "R$167,00",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80",
  },
];

const PLAN_BENEFITS: Array<{ title: string; points: string[] }> = [
  {
    title: "Fundamentos do Recrutamento e Seleção",
    points: [
      "O que é recrutamento e seleção e por que são importantes.",
      "Diferença entre recrutamento (atrair) e seleção (escolher).",
      "Erros comuns e impactos de contratações malfeitas.",
      "Benefícios de ter um processo estruturado, mesmo que simples.",
    ],
  },
  {
    title: "Planejamento da Contratação",
    points: [
      "Identificação da necessidade de um novo funcionário.",
      "Análise e descrição do cargo (funções, perfil e competências desejadas).",
      "Definição do tipo de contratação e do cronograma do processo.",
      "Preparação dos materiais: modelo de vaga, roteiro de entrevista, ficha de avaliação.",
    ],
  },
  {
    title: "Recrutamento: Como Atrair os Candidatos Certos",
    points: [
      "Tipos de recrutamento: interno e externo.",
      "Onde e como divulgar as vagas (redes sociais, indicações, grupos locais).",
      "Como escrever uma vaga atrativa e clara.",
      "Dicas para comunicar a cultura e os valores da empresa.",
    ],
  },
  {
    title: "Seleção: Escolhendo o Candidato Ideal",
    points: [
      "Triagem de currículos e contatos iniciais.",
      "Entrevistas eficazes (como se preparar, perguntas certas, o que observar).",
      "Testes simples e dinâmicas práticas para avaliar o perfil.",
      "Tomada de decisão e comparação entre candidatos.",
      "Cuidados éticos e legais (evitar discriminação, proteger dados).",
    ],
  },
  {
    title: "Integração e Acompanhamento",
    points: [
      "Boas práticas de integração (onboarding).",
      "Apresentação da equipe, da cultura e das rotinas.",
      "Acompanhamento dos primeiros dias de trabalho.",
      "Indicadores simples de sucesso (adaptação, desempenho, rotatividade).",
      "Como melhorar o processo a cada nova contratação.",
    ],
  },
];

const WHATSAPP_NUMBER = "5519992297835";
const TOAST_DURATION = 4000;

const openWhatsappChat = (message: string) => {
  if (typeof window === "undefined") {
    return;
  }

  const encodedMessage = encodeURIComponent(message);
  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`,
    "_blank",
  );
};

const PlansView = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);
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

  const handleSelectPlan = (plan: PlanOption) => {
    setSelectedPlan(plan);
  };

  const closeModal = () => {
    setSelectedPlan(null);
  };

  const handleOverlayClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeModal();
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

  const handleConfirmPurchase = () => {
    if (!selectedPlan) {
      return;
    }

    const plan = selectedPlan;
    const confirmationMessage = `Compra do plano ${plan.label} confirmada!`;
    showToast(confirmationMessage);

    openWhatsappChat(
      `Olá! Confirmei a compra do plano ${plan.label} por ${plan.price}. Podemos seguir com os próximos passos?`,
    );

    closeModal();
  };

  return (
    <div className="plans-view">
      {isToastVisible && (
        <div className="plan-toast-container" role="status" aria-live="polite">
          <div className="plan-toast">
            <span className="plan-toast-icon" aria-hidden="true">
              &#10003;
            </span>
            <p>{toastMessage}</p>
          </div>
        </div>
      )}
      <section className="plans-hero" aria-labelledby="plans-heading">
        <div className="plans-hero-overlay">
          <h2 id="plans-heading">Planos</h2>
        </div>
      </section>
      <section className="plans-grid" aria-label="Opções de planos">
        {PLAN_OPTIONS.map((plan) => (
          <article
            key={plan.id}
            className="plan-card"
          >
            <div className="plan-card-image">
              <img src={plan.image} alt={`Plano ${plan.label}`} loading="lazy" />
            </div>
            <div className="plan-card-body">
              <h3>{plan.label}</h3>
              <p>{plan.price}</p>
              <button
                type="button"
                className="plan-card-action"
                onClick={() => handleSelectPlan(plan)}
              >
                Comprar
              </button>
            </div>
          </article>
        ))}
      </section>
      <section className="plan-benefits" aria-labelledby="plan-benefits-heading">
        <header className="plan-benefits-header">
          <h3 id="plan-benefits-heading">Benefícios do Plano</h3>
          <p>Domine cada etapa para contratar e integrar talentos com segurança.</p>
        </header>
        <ol className="plan-benefits-list">
          {PLAN_BENEFITS.map((benefit) => (
            <li key={benefit.title} className="plan-benefit-item">
              <h4>{benefit.title}</h4>
              <ul>
                {benefit.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
      {selectedPlan && (
        <div
          className="plan-confirm-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-confirm-title"
          onClick={handleOverlayClick}
        >
          <div className="plan-confirm-modal">
            <h4 id="plan-confirm-title">Confirmar compra</h4>
            <p>
              Você está prestes a adquirir o plano{" "}
              <strong>{selectedPlan.label}</strong> por{" "}
              <strong>{selectedPlan.price}</strong>.
            </p>
            <p>Deseja continuar?</p>
            <div className="plan-confirm-actions">
              <button
                type="button"
                className="plan-confirm-button is-secondary"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="plan-confirm-button is-primary"
                onClick={handleConfirmPurchase}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansView;
