import type { ContentItem } from "../types";

type ContentCardProps = {
  item: ContentItem;
  onSelect: (item: ContentItem) => void;
};

const ContentCard = ({ item, onSelect }: ContentCardProps) => {
  return (
    <article className="content-card" aria-labelledby={`${item.id}-title`}>
      <div className="card-image-wrapper">
        <img src={item.image} alt={item.title} loading="lazy" />
      </div>
      <div className="card-body">
        <h3 id={`${item.id}-title`}>{item.title}</h3>
        <p>{item.summary}</p>
        <button type="button" onClick={() => onSelect(item)}>
          Ver sobre
        </button>
      </div>
    </article>
  );
};

export default ContentCard;
