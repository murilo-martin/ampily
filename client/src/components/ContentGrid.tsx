import type { ContentItem } from "../types";
import ContentCard from "./ContentCard";

type ContentGridProps = {
  items: ContentItem[];
  onSelect: (item: ContentItem) => void;
};

const ContentGrid = ({ items, onSelect }: ContentGridProps) => {
  return (
    <div className="content-grid">
      {items.map((item) => (
        <ContentCard key={item.id} item={item} onSelect={onSelect} />
      ))}
    </div>
  );
};

export default ContentGrid;
