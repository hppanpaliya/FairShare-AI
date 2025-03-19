import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import BillSplitter from "./BillSplitter";
import ToastProvider from "./components/ToastProvider";
import TitleBar from "./components/TitleBar";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <TitleBar />
          <div className="flex-grow">
            <div className="container mx-auto py-6">
              <Routes>
                <Route path="/" element={<BillSplitter />} />
                <Route path="/event/:eventId" element={<BillSplitter />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
