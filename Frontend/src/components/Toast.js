import React, { useState, useEffect } from "react";

const Toast = ({
  message,
  type = "success", // 'success', 'error', 'info', 'warning'
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300); // Time for fade-out transition
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return "bg-blue-500";
      case "success":
      default:
        return "bg-green-500";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 max-w-sm w-full p-4 rounded-md text-white shadow-lg flex items-center justify-between z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${getTypeStyles()}`}
    >
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-4 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
