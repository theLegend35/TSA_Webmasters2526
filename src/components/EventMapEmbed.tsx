import React from "react";
import "./EventExperience.css";

interface EventMapEmbedProps {
  location?: string;
}

const EventMapEmbed: React.FC<EventMapEmbedProps> = ({ location }) => {
  if (!location) {
    return <div className="evx-map-placeholder">Location TBD</div>;
  }

  const query = encodeURIComponent(location);
  const embedSrc = `https://maps.google.com/maps?q=${query}&output=embed`;
  const linkHref = `https://maps.google.com/maps?q=${query}`;

  return (
    <div className="evx-map">
      <div className="evx-map-frame">
        <iframe
          title="Event Location"
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a
        className="evx-map-link"
        href={linkHref}
        target="_blank"
        rel="noreferrer"
      >
        Open in Maps →
      </a>
    </div>
  );
};

export default EventMapEmbed;
