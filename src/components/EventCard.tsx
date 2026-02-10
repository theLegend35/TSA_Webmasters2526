import React from 'react';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: any;
  isArchived?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, isArchived }) => {
  const displayDate = event.isRecurring 
    ? `Every ${event.recurringDay || 'Week'}` 
    : event.date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const displayTime = event.timeText || (event.date ? event.date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  }) : '');

  return (
    <Link to={`/event/${event.id}`} className={`event-card ${isArchived ? 'archived-card' : ''}`}>
      <div className="event-card-header">
        <span className="event-date-pill">{displayDate}</span>
        {displayTime && <span className="event-time-text">{displayTime}</span>}
      </div>
      
      <div className="event-card-body">
        <h3 className="event-name-bold">{event.name}</h3>
        <p className="event-location-text">📍 {event.place}</p>
      </div>

      {event.isRecurring && (
        <div className="recurring-tag">Weekly Tradition</div>
      )}
    </Link>
  );
};

export default EventCard;