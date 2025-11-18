import { useEffect } from "react";
import type { ContentItem } from "../types";

type ModalProps = {
  item: ContentItem;
  onClose: () => void;
};

const Modal = ({ item, onClose }: ModalProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Fechar modal"
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>
        <img src={item.image} alt={item.title} className="modal-image" />
        <div className="modal-content">
          <h3 id="modal-title">{item.title}</h3>
          <p id="modal-description">{item.summary}</p>
          <button type="button" className="modal-action" onClick={onClose}>
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
