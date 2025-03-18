import React, { useState } from "react";
import { addItem, deleteItem, updateItem } from "../services/api";
import EditItemModal from "./EditItemModal";

const ItemsList = ({ eventId, items, loading, onError }) => {
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    unitPrice: "",
    totalPrice: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Handle unit price and total price calculations
  const handleItemChange = (field, value) => {
    const updatedItem = { ...newItem, [field]: value };

    if (field === "quantity") {
      if (updatedItem.unitPrice) {
        const qty = parseFloat(value) || 0;
        const unitPrice = parseFloat(updatedItem.unitPrice) || 0;
        updatedItem.totalPrice = (qty * unitPrice).toFixed(2);
      } else if (updatedItem.totalPrice) {
        const qty = parseFloat(value) || 0;
        if (qty > 0) {
          const totalPrice = parseFloat(updatedItem.totalPrice) || 0;
          updatedItem.unitPrice = (totalPrice / qty).toFixed(2);
        }
      }
    } else if (field === "unitPrice") {
      if (updatedItem.quantity) {
        const qty = parseFloat(updatedItem.quantity) || 0;
        const unitPrice = parseFloat(value) || 0;
        updatedItem.totalPrice = (qty * unitPrice).toFixed(2);
      }
    } else if (field === "totalPrice") {
      if (updatedItem.quantity) {
        const qty = parseFloat(updatedItem.quantity) || 0;
        if (qty > 0) {
          const totalPrice = parseFloat(value) || 0;
          updatedItem.unitPrice = (totalPrice / qty).toFixed(2);
        }
      }
    }

    setNewItem(updatedItem);
  };

  // Add new item to the bill
  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;

    // Default quantity to 1 if not provided
    const quantity = parseFloat(newItem.quantity) || 1;
    let unitPrice = parseFloat(newItem.unitPrice) || 0;
    let totalPrice = parseFloat(newItem.totalPrice) || 0;

    // Ensure we have both unit and total price
    if (!unitPrice && totalPrice) {
      unitPrice = totalPrice / quantity;
    } else if (unitPrice && !totalPrice) {
      totalPrice = unitPrice * quantity;
    } else if (!unitPrice && !totalPrice) {
      // Both missing, can't proceed
      alert("Please enter either unit price or total price");
      return;
    }

    setIsSubmitting(true);
    try {
      await addItem(eventId, {
        name: newItem.name,
        quantity,
        unitPrice,
        totalPrice,
      });

      // Reset the form (the socket update will refresh the list)
      setNewItem({ name: "", quantity: "", unitPrice: "", totalPrice: "" });
    } catch (err) {
      console.error("Error adding item:", err);
      onError && onError("Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    setIsSubmitting(true);
    try {
      await deleteItem(itemId);
      // The socket update will refresh the list
    } catch (err) {
      console.error("Error deleting item:", err);
      onError && onError("Failed to delete item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle item selection for multi-delete
  const toggleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // Delete multiple selected items
  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} selected items?`)) return;
    
    setIsSubmitting(true);
    try {
      // Delete items one by one
      for (const itemId of selectedItems) {
        await deleteItem(itemId);
      }
      // Clear selection after successful deletion
      setSelectedItems([]);
    } catch (err) {
      console.error("Error deleting selected items:", err);
      onError && onError("Failed to delete some items. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal for an item
  const openEditModal = (item) => {
    setEditingItem({
      _id: item._id,
      name: item.name,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toFixed(2),
      totalPrice: item.totalPrice.toFixed(2)
    });
    setShowEditModal(true);
  };

  // Handle changes in the edit modal
  const handleEditChange = (field, value) => {
    const updatedItem = { ...editingItem, [field]: value };
    
    if (field === "quantity") {
      if (updatedItem.unitPrice) {
        const qty = parseFloat(value) || 0;
        const unitPrice = parseFloat(updatedItem.unitPrice) || 0;
        updatedItem.totalPrice = (qty * unitPrice).toFixed(2);
      } else if (updatedItem.totalPrice) {
        const qty = parseFloat(value) || 0;
        if (qty > 0) {
          const totalPrice = parseFloat(updatedItem.totalPrice) || 0;
          updatedItem.unitPrice = (totalPrice / qty).toFixed(2);
        }
      }
    } else if (field === "unitPrice") {
      if (updatedItem.quantity) {
        const qty = parseFloat(updatedItem.quantity) || 0;
        const unitPrice = parseFloat(value) || 0;
        updatedItem.totalPrice = (qty * unitPrice).toFixed(2);
      }
    } else if (field === "totalPrice") {
      if (updatedItem.quantity) {
        const qty = parseFloat(updatedItem.quantity) || 0;
        if (qty > 0) {
          const totalPrice = parseFloat(value) || 0;
          updatedItem.unitPrice = (totalPrice / qty).toFixed(2);
        }
      }
    }
    
    setEditingItem(updatedItem);
  };

  // Save edited item
  const handleSaveEdit = async () => {
    if (!editingItem.name.trim()) return;
    
    // Default quantity to 1 if not provided
    const quantity = parseFloat(editingItem.quantity) || 1;
    let unitPrice = parseFloat(editingItem.unitPrice) || 0;
    let totalPrice = parseFloat(editingItem.totalPrice) || 0;
    
    // Ensure we have both unit and total price
    if (!unitPrice && totalPrice) {
      unitPrice = totalPrice / quantity;
    } else if (unitPrice && !totalPrice) {
      totalPrice = unitPrice * quantity;
    } else if (!unitPrice && !totalPrice) {
      // Both missing, can't proceed
      alert("Please enter either unit price or total price");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateItem(editingItem._id, {
        name: editingItem.name,
        quantity,
        unitPrice,
        totalPrice,
      });
      
      // Close modal after successful update
      setShowEditModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Error updating item:", err);
      onError && onError("Failed to update item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get total claimed quantity for an item
  const getTotalClaimedQuantity = (item) => {
    return item.claims.reduce((sum, claim) => sum + claim.quantity, 0);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Add Items</h2>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="col-span-2">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => handleItemChange("name", e.target.value)}
            placeholder="Item name"
            className="w-full p-2 border rounded focus:outline-none"
          />
        </div>
        <div>
          <input
            type="text"
            inputMode="numeric"
            value={newItem.quantity}
            onChange={(e) => handleItemChange("quantity", e.target.value)}
            placeholder="Quantity (default: 1)"
            className="w-full p-2 border rounded focus:outline-none"
          />
        </div>
        <div>
          <input
            type="text"
            inputMode="decimal"
            value={newItem.unitPrice}
            onChange={(e) => handleItemChange("unitPrice", e.target.value)}
            placeholder="Unit price"
            className="w-full p-2 border rounded focus:outline-none"
          />
        </div>
        <div>
          <input
            type="text"
            inputMode="decimal"
            value={newItem.totalPrice}
            onChange={(e) => handleItemChange("totalPrice", e.target.value)}
            placeholder="Total price"
            className="w-full p-2 border rounded focus:outline-none"
          />
        </div>
        <div>
          <button
            onClick={handleAddItem}
            disabled={loading || isSubmitting}
            className={`w-full px-4 py-2 rounded text-white ${loading || isSubmitting ? "bg-green-300" : "bg-green-500 hover:bg-green-600"}`}
          >
            {isSubmitting ? "Adding..." : "Add Item"}
          </button>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        {selectedItems.length > 0 && (
          <div className="mb-2">
            <button 
              onClick={handleDeleteSelected}
              disabled={isSubmitting}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Delete Selected ({selectedItems.length})
            </button>
          </div>
        )}

        <div className="flex justify-between font-semibold border-b pb-1 text-sm">
          <span className="w-8"></span>
          <span className="flex-1">Item</span>
          <span className="w-1/6 text-center">Qty</span>
          <span className="w-1/6 text-right">Unit</span>
          <span className="w-1/6 text-right">Total</span>
          <span className="w-1/6 text-right">Actions</span>
        </div>
        
        {items.length === 0 ? (
          <p className="text-gray-500 py-2">No items added yet.</p>
        ) : (
          items.map((item) => (
            <div 
              key={item._id} 
              className={`flex justify-between items-center border-b pb-2 text-sm ${selectedItems.includes(item._id) ? 'bg-blue-50' : ''}`}
            >
              <span className="w-8">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item._id)}
                  onChange={() => toggleSelectItem(item._id)}
                  className="h-4 w-4"
                />
              </span>
              <span 
                className="flex-1 truncate cursor-pointer hover:text-blue-600"
                onClick={() => openEditModal(item)}
              >
                {item.name}
              </span>
              <span className="w-1/6 text-center cursor-pointer hover:text-blue-600" onClick={() => openEditModal(item)}>
                {item.quantity}
                <span className="text-xs text-gray-500 ml-1">({getTotalClaimedQuantity(item).toFixed(2)} claimed)</span>
              </span>
              <span className="w-1/6 text-right cursor-pointer hover:text-blue-600" onClick={() => openEditModal(item)}>${item.unitPrice.toFixed(2)}</span>
              <span className="w-1/6 text-right cursor-pointer hover:text-blue-600" onClick={() => openEditModal(item)}>${item.totalPrice.toFixed(2)}</span>
              <span className="w-1/6 text-right flex justify-end gap-2">
                <button onClick={() => handleDeleteItem(item._id)} className="text-red-500 hover:text-red-700 mr-2" title="Delete item">
                  Delete
                </button>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Use the separate EditItemModal component */}
      {editingItem && (
        <EditItemModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          item={editingItem}
          onItemChange={handleEditChange}
          onSave={handleSaveEdit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default ItemsList;
