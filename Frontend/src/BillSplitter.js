import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useSocketConnection from "./hooks/useSocketConnection";
import useEventData from "./hooks/useEventData";
import EventCreation from "./components/EventCreation";
import TaxAndTip from "./components/TaxAndTip";
import PeopleList from "./components/PeopleList";
import ItemsList from "./components/ItemsList";
import ItemClaims from "./components/ItemClaims";
import BillImage from "./components/BillImage";

const BillSplitter = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // Get event data from custom hook
  const {
    loading,
    error: eventError,
    eventData,
    eventName,
    items,
    people,
    tax,
    tip,
    taxSplitEqually,
    tipSplitEqually,
    billImage,
    setTax,
    setTip,
    setTaxSplitEqually,
    setTipSplitEqually,
    handleEventUpdate,
  } = useEventData(eventId);

  // Connect to socket
  const { connected } = useSocketConnection(eventId, handleEventUpdate);

  // Calculate total bill
  const calculateTotalBill = useCallback(() => {
    const itemsTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = parseFloat(tax) || 0;
    const tipAmount = parseFloat(tip) || 0;
    return itemsTotal + taxAmount + tipAmount;
  }, [items, tax, tip]);

  // Calculate each person's share
  const calculateShares = useCallback(() => {
    const taxAmount = parseFloat(tax) || 0;
    const tipAmount = parseFloat(tip) || 0;

    let personShares = {};
    people.forEach((person) => {
      personShares[person._id] = 0;
    });

    // Calculate base costs based on claimed quantities
    items.forEach((item) => {
      if (item.claims.length === 0) return;

      item.claims.forEach((claim) => {
        // Calculate proportional cost based on quantity
        const sharePrice = item.unitPrice * claim.quantity;
        personShares[claim.personId] = (personShares[claim.personId] || 0) + sharePrice;
      });
    });

    // Handle tax based on selected distribution method
    if (taxAmount > 0) {
      if (taxSplitEqually && people.length > 0) {
        // Split tax equally among all people
        const perPersonTax = taxAmount / people.length;
        Object.keys(personShares).forEach((personId) => {
          personShares[personId] += perPersonTax;
        });
      } else {
        // Split tax proportionally to what each person spent
        const totalSpent = Object.values(personShares).reduce((sum, share) => sum + share, 0);
        if (totalSpent > 0) {
          const taxRatio = taxAmount / totalSpent;
          Object.keys(personShares).forEach((personId) => {
            const baseCost = personShares[personId];
            personShares[personId] += baseCost * taxRatio;
          });
        }
      }
    }

    // Handle tip based on selected distribution method
    if (tipAmount > 0) {
      if (tipSplitEqually && people.length > 0) {
        // Split tip equally among all people
        const perPersonTip = tipAmount / people.length;
        Object.keys(personShares).forEach((personId) => {
          personShares[personId] += perPersonTip;
        });
      } else {
        // Split tip proportionally to what each person spent
        const totalSpent = Object.values(personShares).reduce((sum, share) => sum + share, 0);
        if (totalSpent > 0) {
          const tipRatio = tipAmount / totalSpent;
          Object.keys(personShares).forEach((personId) => {
            const baseCost = personShares[personId];
            personShares[personId] += baseCost * tipRatio;
          });
        }
      }
    }

    return personShares;
  }, [items, people, tax, tip, taxSplitEqually, tipSplitEqually]);

  // Get the final calculated shares
  const shares = calculateShares();
  const totalBill = calculateTotalBill();

  // Create a shareable link
  const getShareableLink = () => {
    return `${window.location.origin}/event/${eventId}`;
  };

  // Handle errors from child components
  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  if (loading && !eventData && !eventId) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if ((error || eventError) && !eventData && eventId) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl text-red-500">{error || eventError}</h2>
        <button onClick={() => navigate("/")} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Create New Event
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {!eventId ? (
        <EventCreation navigate={navigate} />
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold">{eventName}</h1>
              {connected && (
                <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Connected
                </span>
              )}
            </div>
            <div className="mb-4">
              <p className="font-semibold">Shareable Link:</p>
              <div className="flex mt-1">
                <input type="text" value={getShareableLink()} readOnly className="flex-grow p-2 border rounded-l bg-gray-50" />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getShareableLink());
                    window.alert("Link copied to clipboard!");
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Bill Image Component */}
          <BillImage eventId={eventId} eventName={eventName} billImage={billImage} loading={loading} onError={handleError} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Items and Bill Details */}
            <div className="space-y-6">
              <ItemsList eventId={eventId} items={items} loading={loading} onError={handleError} />

              <TaxAndTip
                tax={tax}
                tip={tip}
                taxSplitEqually={taxSplitEqually}
                tipSplitEqually={tipSplitEqually}
                people={people}
                setTax={setTax}
                setTip={setTip}
                setTaxSplitEqually={setTaxSplitEqually}
                setTipSplitEqually={setTipSplitEqually}
                totalBill={totalBill}
                loading={loading}
              />
            </div>

            {/* Right Column: People and Claims */}
            <div className="space-y-6">
              <PeopleList eventId={eventId} people={people} shares={shares} loading={loading} onError={handleError} />

              {items.length > 0 && people.length > 0 && <ItemClaims items={items} people={people} loading={loading} onError={handleError} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillSplitter;
