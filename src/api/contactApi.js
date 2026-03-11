import apiClient from "./client.js";

export const contactApi = {
  // Get all messages (admin only)
  getMessages: async (status = null) => {
    try {
      const params = {};
      if (status) params.status = status;

      const response = await apiClient.get("/contact", { params });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },

  // Get single message (admin only)
  getMessage: async (id) => {
    try {
      const response = await apiClient.get(`/contact/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching message:", error);
      throw error;
    }
  },

  // Submit contact form
  submitMessage: async (data) => {
    try {
      const response = await apiClient.post("/contact", {
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        message: data.message,
        subject: data.subject || "Contact Form Submission",
      });
      return response.data.data;
    } catch (error) {
      console.error("Error submitting message:", error);
      throw error;
    }
  },

  // Update message status (admin only)
  updateMessageStatus: async (id, status) => {
    try {
      const response = await apiClient.put(`/contact/${id}`, { status });
      return response.data.data;
    } catch (error) {
      console.error("Error updating message status:", error);
      throw error;
    }
  },

  // Delete message (admin only)
  deleteMessage: async (id) => {
    try {
      await apiClient.delete(`/contact/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  },
};
