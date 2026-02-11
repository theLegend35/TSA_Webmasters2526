import React, { useState } from "react";

const Subscribe: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribed:", email);
    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus("idle"), 5000);
  };

  return (
    <div className="hp-subscribe">
      <h4 className="hp-subscribe__title">Cypress Weekly Updates</h4>
      <p className="hp-subscribe__body">
        Get local resources and events sent to your inbox.
      </p>

      {status === "success" ? (
        <div className="hp-subscribe__success">✓ You're on the list!</div>
      ) : (
        <form onSubmit={handleSubscribe} className="hp-subscribe__form">
          <input
            type="email"
            placeholder="your@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="hp-subscribe__input"
          />
          <button type="submit" className="hp-subscribe__btn">
            Join
          </button>
        </form>
      )}
    </div>
  );
};

export default Subscribe;
