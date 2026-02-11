import React, { useRef } from "react";

interface RowProps {
  title: string;
  resources: any[];
  onResourceClick: (id: string) => void; // New Prop
}

const ResourceRow: React.FC<RowProps> = ({
  title,
  resources,
  onResourceClick,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const getFallbackImageUrl = (resource: any) => {
    const seed = encodeURIComponent(
      String(resource.id ?? resource.name ?? resource.category ?? "0"),
    );

    return `https://picsum.photos/seed/${seed}/800/600`;
  };

  const getImageUrl = (resource: any) =>
    resource.imageUrl || getFallbackImageUrl(resource);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const scrollAmount = 350;
      rowRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!resources || resources.length === 0) return null;

  return (
    <div className="category-row-container">
      <div className="section-header-flex">
        <h2 className="category-title-large">{title}</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="slider-arrow" onClick={() => scroll("left")}>
            ←
          </button>
          <button className="slider-arrow" onClick={() => scroll("right")}>
            →
          </button>
        </div>
      </div>

      <div className="resources-slider-container" ref={rowRef}>
        {resources.map((res) => (
          <div
            key={res.id}
            className="resource-card"
            onClick={() => onResourceClick(res.id)}
          >
            <div className="card-image-placeholder">
              <span className="category-tag-alt">{res.category}</span>
              {getImageUrl(res) ? (
                <img src={getImageUrl(res)} alt={res.name} />
              ) : (
                <div className="image-icon-fallback">🏢</div>
              )}
            </div>

            <div className="card-details">
              <h3>{res.name}</h3>
              <p>{res.description?.substring(0, 80)}...</p>
              <div className="learn-more-link">Learn More →</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceRow;
