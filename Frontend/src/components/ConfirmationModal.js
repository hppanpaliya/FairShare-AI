import React from "react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  confirmButtonColor = "red", // 'red' or 'blue'
}) => {
  if (!isOpen) return null;

  const getButtonClass = () => {
    return confirmButtonColor === "red" ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600";
  };

  // Handle click on the overlay (outside the modal content)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">
            {cancelButtonText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded ${getButtonClass()}`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
