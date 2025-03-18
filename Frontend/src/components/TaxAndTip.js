import React from "react";

const TaxAndTip = ({
  tax,
  tip,
  taxSplitEqually,
  tipSplitEqually,
  people,
  setTax,
  setTip,
  setTaxSplitEqually,
  setTipSplitEqually,
  totalBill,
  loading,
}) => {
  const toggleTaxDistribution = () => {
    setTaxSplitEqually(!taxSplitEqually);
  };

  const toggleTipDistribution = () => {
    setTipSplitEqually(!tipSplitEqually);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Tax & Tip</h2>
      <div className="space-y-4">
        {/* Tax Section */}
        <div className="p-3 bg-gray-50 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium">Tax Amount</label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{taxSplitEqually ? "Split Equally" : "Split by Share"}</span>
              <button
                onClick={toggleTaxDistribution}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  taxSplitEqually ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${
                    taxSplitEqually ? "translate-x-2.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
          <input
            type="text"
            inputMode="decimal"
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            placeholder="0.00"
            className="w-full p-2 border rounded focus:outline-none"
          />
          <div className="mt-1 text-xs text-gray-500">
            {taxSplitEqually && people.length > 0
              ? `Each person pays $${(parseFloat(tax) / people.length).toFixed(2)}`
              : "Tax is distributed proportionally based on each person's order"}
          </div>
        </div>

        {/* Tip Section */}
        <div className="p-3 bg-gray-50 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium">Tip Amount</label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{tipSplitEqually ? "Split Equally" : "Split by Share"}</span>
              <button
                onClick={toggleTipDistribution}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  tipSplitEqually ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${
                    tipSplitEqually ? "translate-x-2.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
          <input
            type="text"
            inputMode="decimal"
            value={tip}
            onChange={(e) => setTip(e.target.value)}
            placeholder="0.00"
            className="w-full p-2 border rounded focus:outline-none"
          />
          <div className="mt-1 text-xs text-gray-500">
            {tipSplitEqually && people.length > 0
              ? `Each person pays $${(parseFloat(tip) / people.length).toFixed(2)}`
              : "Tip is distributed proportionally based on each person's order"}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xl font-bold">Total: ${totalBill.toFixed(2)}</div>
      {loading && <p className="text-sm text-gray-500 mt-2">Saving changes...</p>}
    </div>
  );
};

export default TaxAndTip;
