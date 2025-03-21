import React, { useState } from "react";
import { addPerson, deletePerson } from "../services/api";
import ConfirmationModal from "./ConfirmationModal";
import { useToast } from "../context/ToastProvider";

const PeopleList = ({ eventId, people, shares, loading, onError }) => {
  const [newPerson, setNewPerson] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    personId: null,
    title: "",
    message: "",
    action: null,
  });
  const { addToast } = useToast();

  const handleAddPerson = async () => {
    if (!newPerson.trim() || !eventId) return;
    setIsSubmitting(true);
    try {
      await addPerson(eventId, newPerson);
      // Reset input field after successful addition
      setNewPerson("");
      addToast(`${newPerson} added successfully`, "success");
    } catch (err) {
      console.error("Error adding person:", err);
      onError && onError("Failed to add person. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddPerson();
    }
  };

  const handleDeletePerson = (personId) => {
    const person = people.find((p) => p._id === personId);
    setConfirmModal({
      show: true,
      personId,
      title: "Delete Person",
      message: `Are you sure you want to delete ${person?.name}? All their claims will be removed.`,
      action: () => performDeletePerson(personId, person?.name),
    });
  };

  const performDeletePerson = async (personId, name) => {
    setIsSubmitting(true);
    try {
      await deletePerson(personId);
      // Socket update will refresh the list
      addToast(`${name || "Person"} successfully deleted`, "success");
    } catch (err) {
      console.error("Error deleting person:", err);
      onError && onError("Failed to delete person. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">People</h2>
      <div className="flex mb-2">
        <input
          type="text"
          value={newPerson}
          onChange={(e) => setNewPerson(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Person's name"
          className="flex-grow p-2 border rounded-l focus:outline-none"
        />
        <button
          onClick={handleAddPerson}
          disabled={loading || isSubmitting || !newPerson.trim()}
          className={`px-4 py-2 rounded-r text-white ${
            loading || isSubmitting || !newPerson.trim() ? "bg-purple-300" : "bg-purple-500 hover:bg-purple-600"
          }`}
        >
          {isSubmitting ? "Adding..." : "Add Person"}
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {people.length === 0 ? (
          <p className="text-gray-500 py-2">No people added yet.</p>
        ) : (
          people.map((person) => (
            <div key={person._id} className="flex justify-between items-center border-b pb-2">
              <span>{person.name}</span>
              <div className="flex items-center">
                <span className="font-semibold mr-4">${shares[person._id]?.toFixed(2) || "0.00"}</span>
                <button onClick={() => handleDeletePerson(person._id)} className="text-red-500 hover:text-red-700" title="Delete person">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ ...confirmModal, show: false })}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmButtonText="Delete"
        confirmButtonColor="red"
      />
    </div>
  );
};

export default PeopleList;
