import { useState, useEffect, useCallback } from "react";
import { fetchEventById, updateEvent } from "../services/api";

const useEventData = (eventId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [eventName, setEventName] = useState("");
  const [items, setItems] = useState([]);
  const [people, setPeople] = useState([]);
  const [tax, setTax] = useState("");
  const [tip, setTip] = useState("");
  const [taxSplitEqually, setTaxSplitEqually] = useState(false);
  const [tipSplitEqually, setTipSplitEqually] = useState(false);
  const [billImage, setBillImage] = useState(null);
  const [billParsed, setBillParsed] = useState(false);

  const fetchData = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      const response = await fetchEventById(eventId);
      const { event, items, people } = response;

      setEventData(event);
      setEventName(event.name);
      setItems(items);
      setPeople(people);
      setTax(event.tax);
      setTip(event.tip);
      setTaxSplitEqually(event.taxSplitEqually || false);
      setTipSplitEqually(event.tipSplitEqually || false);
      setBillImage(event.billImage);
      setBillParsed(event.billParsed || false);
      setError(null);
    } catch (err) {
      console.error("Error fetching event data:", err);
      setError("Failed to load event. It may not exist or has been deleted.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Fetch event data when component mounts or when eventId changes
  useEffect(() => {
    if (eventId) {
      fetchData();
    }
  }, [eventId, fetchData]);

  // Handle socket update
  const handleEventUpdate = useCallback((data) => {
    const { event, items, people } = data;

    // Update local state with received data
    if (event) setEventData(event);
    if (event?.name) setEventName(event.name);
    if (event?.tax !== undefined) setTax(event.tax);
    if (event?.tip !== undefined) setTip(event.tip);
    if (event?.taxSplitEqually !== undefined) setTaxSplitEqually(event.taxSplitEqually);
    if (event?.tipSplitEqually !== undefined) setTipSplitEqually(event.tipSplitEqually);
    if (event?.billImage !== undefined) setBillImage(event.billImage);
    if (event?.billParsed !== undefined) setBillParsed(event.billParsed);
    if (items) setItems(items);
    if (people) setPeople(people);
  }, []);

  // Update tax and tip
  const updateTaxAndTip = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      await updateEvent(eventId, {
        tax: parseFloat(tax) || 0,
        tip: parseFloat(tip) || 0,
        taxSplitEqually,
        tipSplitEqually,
      });
      // Socket update will refresh the data
    } catch (err) {
      console.error("Error updating tax and tip:", err);
      setError("Failed to update tax and tip. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [eventId, tax, tip, taxSplitEqually, tipSplitEqually]);

  // Auto-save tax and tip when they change
  useEffect(() => {
    if (eventId && (tax !== "" || tip !== "" || taxSplitEqually !== undefined || tipSplitEqually !== undefined)) {
      const timerId = setTimeout(() => {
        updateTaxAndTip();
      }, 1000);

      return () => clearTimeout(timerId);
    }
  }, [eventId, tax, tip, taxSplitEqually, tipSplitEqually, updateTaxAndTip]);

  return {
    loading,
    error,
    eventData,
    eventName,
    items,
    people,
    tax,
    tip,
    taxSplitEqually,
    tipSplitEqually,
    billImage,
    billParsed,
    setEventName,
    setTax,
    setTip,
    setTaxSplitEqually,
    setTipSplitEqually,
    setItems,
    setPeople,
    setBillParsed,
    fetchData,
    handleEventUpdate,
  };
};

export default useEventData;
