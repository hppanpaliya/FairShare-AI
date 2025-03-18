import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import BillSplitter from "./BillSplitter";
import ToastProvider from "./components/ToastProvider";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <div className="container mx-auto py-8">
            <Routes>
              <Route path="/" element={<BillSplitter />} />
              <Route path="/event/:eventId" element={<BillSplitter />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
