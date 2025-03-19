import React, { useState } from "react";
import { updateItemClaims } from "../services/api";
import ConfirmationModal from "./ConfirmationModal";
import { useToast } from "../context/ToastProvider";

const ItemClaims = ({ items, people, loading, onError }) => {
  // State for quantity editing
  const [editingQuantities, setEditingQuantities] = useState({});

  // State for tracking which people are selected for splitting
  const [selectedPeople, setSelectedPeople] = useState({});
  // State for confirmation modal
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    itemId: null,
    title: "",
    message: "",
    action: null,
  });
  const { addToast } = useToast();

  // Generate unique key for tracking field edits
  const getQuantityKey = (itemId, personId) => `${itemId}-${personId}`;
  const getSelectKey = (itemId, personId) => `select-${itemId}-${personId}`;

  // Set initial value for quantity field when editing begins
  const handleEditQuantity = (itemId, personId, initialValue) => {
    const key = getQuantityKey(itemId, personId);
    setEditingQuantities({
      ...editingQuantities,
      [key]: initialValue ? initialValue.toString() : "",
    });
  };

  // Update quantity as user types
  const handleQuantityChange = (itemId, personId, value) => {
    const key = getQuantityKey(itemId, personId);
    setEditingQuantities({
      ...editingQuantities,
      [key]: value,
    });
  };

  // Submit the final value when input is blurred or enter is pressed
  const handleSubmitQuantity = async (itemId, personId) => {
    const key = getQuantityKey(itemId, personId);
    const inputValue = editingQuantities[key];

    // Convert to number or default to 0
    let quantity = 0;
    if (inputValue && inputValue.trim() !== "") {
      quantity = parseFloat(inputValue);
      if (isNaN(quantity) || quantity < 0) {
        quantity = 0;
      }
    }

    try {
      await updateItemClaims(itemId, personId, quantity);

      // Clear the editing state for this field
      const newEditingQuantities = { ...editingQuantities };
      delete newEditingQuantities[key];
      setEditingQuantities(newEditingQuantities);
    } catch (err) {
      console.error("Error updating claims:", err);
      onError && onError("Failed to update item claims. Please try again.");
    }
  };

  // Handle key press for quantity input (submit on Enter)
  const handleKeyPress = (e, itemId, personId) => {
    if (e.key === "Enter") {
      handleSubmitQuantity(itemId, personId);
    }
  };

  // Request to clear all claims for an item
  const handleClearAllClaims = (itemId) => {
    const item = items.find((i) => i._id === itemId);
    setConfirmModal({
      show: true,
      itemId,
      title: "Clear All Claims",
      message: `Are you sure you want to clear all claims for ${item?.name}?`,
      action: () => performClearAllClaims(itemId),
    });
  };

  // Actually clear all claims after confirmation
  const performClearAllClaims = async (itemId) => {
    try {
      for (const person of people) {
        await updateItemClaims(itemId, person._id, 0);
      }

      // Also clear all selections for this item
      const newSelectedPeople = { ...selectedPeople };
      people.forEach((person) => {
        const key = getSelectKey(itemId, person._id);
        delete newSelectedPeople[key];
      });
      setSelectedPeople(newSelectedPeople);
      // Show success toast
      const item = items.find((i) => i._id === itemId);
      addToast(`All claims cleared for ${item?.name || "item"}`, "success");
    } catch (err) {
      console.error("Error clearing claims:", err);
      onError && onError("Failed to clear claims. Please try again.");
    }
  };

  // Toggle selection of a person for splitting
  const togglePersonSelection = (itemId, personId) => {
    const key = getSelectKey(itemId, personId);
    setSelectedPeople({
      ...selectedPeople,
      [key]: !selectedPeople[key],
    });
  };

  // Select all people for this item
  const selectAllPeople = (itemId) => {
    const newSelectedPeople = { ...selectedPeople };
    people.forEach((person) => {
      const key = getSelectKey(itemId, person._id);
      newSelectedPeople[key] = true;
    });
    setSelectedPeople(newSelectedPeople);
  };

  // Deselect all people for this item
  const deselectAllPeople = (itemId) => {
    const newSelectedPeople = { ...selectedPeople };
    people.forEach((person) => {
      const key = getSelectKey(itemId, person._id);
      delete newSelectedPeople[key];
    });
    setSelectedPeople(newSelectedPeople);
  };

  // Check if a person is selected for an item
  const isPersonSelected = (itemId, personId) => {
    const key = getSelectKey(itemId, personId);
    return !!selectedPeople[key];
  };

  // Count how many people are selected for an item
  const countSelectedPeople = (itemId) => {
    return people.filter((person) => isPersonSelected(itemId, person._id)).length;
  };

  const areAllPeopleSelected = (itemId) => {
    return people.every((person) => isPersonSelected(itemId, person._id));
  };

  // Split an item evenly among selected people
  const splitEvenly = async (itemId) => {
    // Get the item details
    const item = items.find((i) => i._id === itemId);
    if (!item) return;

    // Get the selected people for this item
    const peopleToSplit = people.filter((person) => isPersonSelected(itemId, person._id));

    // If no one is selected, show a message
    if (peopleToSplit.length === 0) {
      addToast("Please select at least one person by checking the boxes next to their names.", "error");
      return;
    }

    // Calculate share per person (equal distribution)
    const sharePerPerson = item.quantity / peopleToSplit.length;

    try {
      // First clear claims for all people
      for (const person of people) {
        const isSelected = isPersonSelected(itemId, person._id);
        // Update with share if selected, or 0 if not selected
        await updateItemClaims(itemId, person._id, isSelected ? sharePerPerson : 0);
      }
      addToast(`${item.name} split evenly among ${peopleToSplit.length} ${peopleToSplit.length === 1 ? "person" : "people"}`, "success");
    } catch (err) {
      console.error("Error splitting evenly:", err);
      onError && onError("Failed to split evenly. Please try again.");
    }
  };

  // Get total claimed quantity for an item
  const getTotalClaimedQuantity = (item) => {
    return item.claims.reduce((sum, claim) => sum + claim.quantity, 0);
  };

  // Get quantity claimed by a specific person
  const getPersonClaimedQuantity = (item, personId) => {
    const claim = item.claims.find((claim) => claim.personId === personId);
    return claim ? claim.quantity : 0;
  };

  // Format a quantity for display
  const formatQuantity = (qty) => {
    // If it's a whole number, show as integer
    if (Number.isInteger(qty)) {
      return qty.toString();
    }
    // Otherwise show decimal
    return qty.toFixed(1);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Claim Items</h2>

      {items.length > 0 && people.length > 0 ? (
        <div className="space-y-8">
          {items.map((item) => (
            <div key={item._id} className="pb-6 border-b">
              <div className="bg-gray-50 p-3 rounded-t-md border-t border-l border-r">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-lg">{item.name}</span>
                  <div className="text-sm">
                    <span className="text-gray-500 mr-2">
                      {item.quantity} × ${item.unitPrice.toFixed(2)}
                    </span>
                    <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 gap-2">
                  <div className="text-sm text-gray-500">
                    {formatQuantity(getTotalClaimedQuantity(item))} of {item.quantity} claimed
                    {getTotalClaimedQuantity(item) > item.quantity && (
                      <span className="text-red-500 ml-1">(Overclaimed by {formatQuantity(getTotalClaimedQuantity(item) - item.quantity)})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex border rounded overflow-hidden">
                      {areAllPeopleSelected(item._id) ? (
                        <button
                          onClick={() => deselectAllPeople(item._id)}
                          className="text-xs px-2 py-1 bg-gray-50 hover:bg-gray-100 border-r"
                          title="Deselect all people"
                        >
                          Deselect All
                        </button>
                      ) : (
                        <button
                          onClick={() => selectAllPeople(item._id)}
                          className="text-xs px-2 py-1 bg-gray-50 hover:bg-gray-100 border-r"
                          title="Select all people"
                        >
                          Select All
                        </button>
                      )}
                      <button
                        onClick={() => handleClearAllClaims(item._id)}
                        className="text-xs px-2 py-1 bg-gray-50 hover:bg-gray-100"
                        title="Clear all claims"
                      >
                        Clear All
                      </button>
                    </div>
                    <button
                      onClick={() => splitEvenly(item._id)}
                      disabled={countSelectedPeople(item._id) === 0}
                      className={`text-xs px-3 py-1 rounded ${
                        countSelectedPeople(item._id) === 0 ? "bg-blue-50 text-blue-300" : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                      }`}
                    >
                      Split Evenly ({countSelectedPeople(item._id)})
                    </button>
                  </div>
                </div>
              </div>
              <div className="border-l border-r border-b rounded-b-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-center p-2 w-10">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="text-left p-2">Person</th>
                      <th className="text-right p-2 w-24">Quantity</th>
                      <th className="text-right p-2 w-24">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {people.map((person, personIndex) => {
                      const personId = person._id;
                      const itemId = item._id;
                      const quantityKey = getQuantityKey(itemId, personId);
                      const claimedQty = getPersonClaimedQuantity(item, personId);
                      const cost = claimedQty * item.unitPrice;
                      const isSelected = isPersonSelected(itemId, personId);
                      // Check if this field is currently being edited
                      const isEditing = quantityKey in editingQuantities;
                      const inputValue = isEditing ? editingQuantities[quantityKey] : claimedQty > 0 ? formatQuantity(claimedQty) : "";
                      return (
                        <tr key={personId} className={personIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="p-2 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePersonSelection(itemId, personId)}
                              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-2">{person.name}</td>
                          <td className="text-right">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={inputValue}
                              onFocus={() => handleEditQuantity(itemId, personId, claimedQty)}
                              onChange={(e) => handleQuantityChange(itemId, personId, e.target.value)}
                              onBlur={() => handleSubmitQuantity(itemId, personId)}
                              onKeyPress={(e) => handleKeyPress(e, itemId, personId)}
                              placeholder="0"
                              className="w-16 p-1 text-center border rounded text-xs"
                            />
                          </td>
                          <td className="p-2 text-right">{claimedQty > 0 ? `$${cost.toFixed(2)}` : "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-100 font-medium">
                    <tr>
                      <td className="p-2" colSpan="2">
                        Total
                      </td>
                      <td className="p-2 text-right">{formatQuantity(getTotalClaimedQuantity(item))}</td>
                      <td className="p-2 text-right">${(getTotalClaimedQuantity(item) * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          {items.length === 0 ? "Add some items to the bill first." : people.length === 0 ? "Add people to claim items." : ""}
        </p>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ ...confirmModal, show: false })}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmButtonText="Confirm"
        confirmButtonColor="blue"
      />
    </div>
  );
};

export default ItemClaims;
