import React, { useState } from "react";

const WeeklyUpdates: React.FC = () => {
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
    <div className="weekly-updates-horizontal">
      <div className="weekly-updates-content">
        <div className="weekly-updates-info">
          <h4 className="weekly-updates-title">Cypress Weekly Updates</h4>
          <p className="weekly-updates-body">
            Get local resources and events sent to your inbox every week.
          </p>
        </div>

        <div className="weekly-updates-form-container">
          {status === "success" ? (
            <div className="weekly-updates-success">✓ You're on the list!</div>
          ) : (
            <form onSubmit={handleSubscribe} className="weekly-updates-form">
              <input
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="weekly-updates-input"
              />
              <button type="submit" className="weekly-updates-btn">
                Join
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyUpdates;
