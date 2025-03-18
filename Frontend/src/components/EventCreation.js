import React, { useState } from "react";
import { createEvent } from "../services/api";

const EventCreation = ({ navigate }) => {
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateEvent = async (e) => {
    if (e) e.preventDefault();
    if (!eventName.trim()) return;

    setLoading(true);
    try {
      const response = await createEvent(eventName);
      const { eventId } = response;

      // Navigate to the event page
      navigate(`/event/${eventId}`);
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Create a Bill Splitting Event</h1>
      {error && <p className="text-red-500 mb-3">{error}</p>}
      <form onSubmit={handleCreateEvent} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Restaurant or event name"
            className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-r text-white ${loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventCreation;
