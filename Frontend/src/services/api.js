import axios from "axios";

// Updated API URLs
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000/api";
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

export { SOCKET_URL }; // Export for socket connection

// Create event and return the event ID
export const createEvent = async (eventName) => {
  const response = await axios.post(`${API_BASE_URL}/events`, { name: eventName });
  return response.data;
};

// Fetch event data by ID
export const fetchEventById = async (eventId) => {
  const response = await axios.get(`${API_BASE_URL}/events/${eventId}`);
  return response.data;
};

// Update event details (tax, tip, etc.)
export const updateEvent = async (eventId, updates) => {
  const response = await axios.put(`${API_BASE_URL}/events/${eventId}`, updates);
  return response.data;
};

// Add person to event
export const addPerson = async (eventId, name) => {
  const response = await axios.post(`${API_BASE_URL}/events/${eventId}/people`, { name });
  return response.data;
};

// Delete person from event
export const deletePerson = async (personId) => {
  const response = await axios.delete(`${API_BASE_URL}/people/${personId}`);
  return response.data;
};

// Add item to event
export const addItem = async (eventId, item) => {
  const response = await axios.post(`${API_BASE_URL}/events/${eventId}/items`, item);
  return response.data;
};

// Delete item from event
export const deleteItem = async (itemId) => {
  const response = await axios.delete(`${API_BASE_URL}/items/${itemId}`);
  return response.data;
};

// Update item claims
export const updateItemClaims = async (itemId, personId, quantity) => {
  const response = await axios.put(`${API_BASE_URL}/items/${itemId}/claims`, {
    personId,
    quantity,
  });
  return response.data;
};

// Upload bill image
export const uploadBillImage = async (eventId, file) => {
  const formData = new FormData();
  formData.append("billImage", file);

  const response = await axios.post(`${API_BASE_URL}/uploads/${eventId}/bill`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Parse bill image with OpenAI
export const parseBillImage = async (eventId) => {
  const response = await axios.post(`${API_BASE_URL}/uploads/${eventId}/parse-bill`);
  return response.data;
};

// Get bill image URL
export const getBillImageUrl = (eventId) => {
  return `${API_BASE_URL}/uploads/${eventId}/bill`;
};

// Delete bill image
export const deleteBillImage = async (eventId) => {
  const response = await axios.delete(`${API_BASE_URL}/uploads/${eventId}/bill`);
  return response.data;
};
