import React, { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import "./EventExperience.css";

interface ReservationFormProps {
  eventId: string;
  eventName: string;
  selectedSpot?: string | null;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  eventId,
  eventName,
  selectedSpot,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReservation = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("Please add your name and email.");
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, "reservations"), {
        eventId,
        eventName,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        partySize: Number(partySize),
        notes: notes.trim(),
        parkingSpot: selectedSpot || null,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setPartySize("2");
      setNotes("");
    } catch (err) {
      setError("Reservation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="evx-form" onSubmit={submitReservation}>
      {success && (
        <div className="evx-success">Reservation confirmed. See you there!</div>
      )}
      {error && <div className="evx-card-sub">{error}</div>}

      <div className="evx-row">
        <input
          className="evx-input"
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          className="evx-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="evx-row">
        <input
          className="evx-input"
          type="tel"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
        <select
          className="evx-select"
          value={partySize}
          onChange={(event) => setPartySize(event.target.value)}
        >
          {[1, 2, 3, 4, 5, 6].map((size) => (
            <option key={size} value={size}>
              Party of {size}
            </option>
          ))}
        </select>
      </div>

      <textarea
        className="evx-textarea"
        placeholder="Notes or accessibility needs"
        rows={3}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />

      <div className="evx-selected">
        Parking spot: {selectedSpot || "Select a spot in the 3D view"}
      </div>

      <button className="evx-btn" type="submit" disabled={submitting}>
        {submitting ? "Reserving..." : "Reserve My Spot"}
      </button>
    </form>
  );
};

export default ReservationForm;
