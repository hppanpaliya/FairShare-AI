import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import { uploadBillImage, getBillImageUrl, deleteBillImage, parseBillImage } from "../services/api";
import ConfirmationModal from "./ConfirmationModal";
import { useToast } from "./ToastProvider";

const BillImage = ({ eventId, eventName, billImage, billParsed, loading, onError, onParsingSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    action: null,
  });
  const { addToast } = useToast();

  // Handle file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      // Compress image before uploading
      setUploadProgress(10);
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        onProgress: (p) => setUploadProgress(10 + Math.round(p * 80)),
      };
      const compressedFile = await imageCompression(file, options);
      setUploadProgress(90);
      // Upload compressed image
      await uploadBillImage(eventId, compressedFile);
      setUploadProgress(100);
      // Wait a moment to show complete progress
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        addToast("Bill image uploaded successfully", "success");
      }, 500);
    } catch (err) {
      console.error("Error uploading bill image:", err);
      onError && onError("Failed to upload bill image. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle parsing the bill with OpenAI
  const handleParseBill = async () => {
    if (!billImage) return;
    setIsParsing(true);
    try {
      const result = await parseBillImage(eventId);
      setIsParsing(false);

      if (result.itemsExtracted > 0) {
        onParsingSuccess && onParsingSuccess(result.itemsExtracted);
      } else {
        onError && onError("No items were detected in the bill. Please try with a clearer image or add items manually.");
      }
    } catch (err) {
      console.error("Error parsing bill:", err);
      onError && onError("Failed to parse bill. Please try again or add items manually.");
      setIsParsing(false);
    }
  };

  // Handle viewing the bill image
  const handleViewBill = () => {
    setShowPreview(true);
  };

  // Handle deleting the bill image - show confirmation modal
  const handleDeleteBill = () => {
    setConfirmModal({
      show: true,
      title: "Delete Bill Image",
      message: "Are you sure you want to delete this bill image?",
      action: performDeleteBill,
    });
  };

  // Perform the actual deletion after confirmation
  const performDeleteBill = async () => {
    setIsUploading(true);
    try {
      await deleteBillImage(eventId);
      setShowPreview(false);
      setIsUploading(false);
      addToast("Bill image deleted successfully", "success");
    } catch (err) {
      console.error("Error deleting bill image:", err);
      onError && onError("Failed to delete bill image. Please try again.");
      setIsUploading(false);
    }
  };

  // Handle clicking outside the modal to close it
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowPreview(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Bill Image</h2>

      {isUploading ? (
        <div className="mb-4 overflow-hidden">
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${Math.min(uploadProgress, 100)}%` }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">{uploadProgress < 100 ? "Uploading..." : "Processing..."}</p>
        </div>
      ) : billImage ? (
        <div>
          <div className="flex flex-wrap justify-between gap-2 mb-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={handleViewBill} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                View Bill
              </button>
              <button
                onClick={handleParseBill}
                className={`px-4 py-2 ${
                  isParsing || billParsed ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                } text-white rounded`}
                disabled={isParsing || loading || billParsed}
                title={billParsed ? "This bill has already been parsed" : ""}
              >
                {isParsing ? "Parsing..." : billParsed ? "Already Parsed" : "Parse with AI"}
              </button>
            </div>
            <button onClick={handleDeleteBill} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Delete
            </button>
          </div>

          {isParsing && (
            <div className="mt-2 mb-4">
              <p className="text-sm text-gray-600">Processing bill with AI... This may take a few seconds.</p>
            </div>
          )}

          {billParsed && !isParsing && (
            <div className="mt-2 mb-4">
              <p className="text-sm text-gray-600">This bill has already been parsed. Delete the image to parse a new one.</p>
            </div>
          )}

          {/* Image preview modal */}
          {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={handleOverlayClick}>
              <div className="bg-white rounded-lg max-w-3xl w-full max-h-full overflow-auto">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{eventName} - Bill</h3>
                  <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">
                    Close
                  </button>
                </div>
                <div className="p-4">
                  <img
                    src={getBillImageUrl(eventId)}
                    alt="Bill"
                    className="w-full h-auto"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                      onError && onError("Failed to load bill image.");
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">Upload a photo of your bill to keep track of expenses</p>
          <label className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">
            Upload Bill
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={loading || isUploading} />
          </label>
        </div>
      )}

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

export default BillImage;
