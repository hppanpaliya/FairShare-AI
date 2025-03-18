import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import { uploadBillImage, getBillImageUrl, deleteBillImage } from "../services/api";

const BillImage = ({ eventId, eventName, billImage, loading, onError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

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
      }, 500);
    } catch (err) {
      console.error("Error uploading bill image:", err);
      onError && onError("Failed to upload bill image. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle viewing the bill image
  const handleViewBill = () => {
    setShowPreview(true);
  };

  // Handle deleting the bill image
  const handleDeleteBill = async () => {
    if (!window.confirm("Are you sure you want to delete this bill image?")) return;

    setIsUploading(true);
    try {
      await deleteBillImage(eventId);
      setShowPreview(false);
      setIsUploading(false);
    } catch (err) {
      console.error("Error deleting bill image:", err);
      onError && onError("Failed to delete bill image. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Bill Image</h2>

      {isUploading ? (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">{uploadProgress < 100 ? "Uploading..." : "Processing..."}</p>
        </div>
      ) : billImage ? (
        <div>
          <div className="flex justify-between mb-4">
            <button onClick={handleViewBill} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              View Bill
            </button>
            <button onClick={handleDeleteBill} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Delete
            </button>
          </div>

          {/* Image preview modal */}
          {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
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
    </div>
  );
};

export default BillImage;
