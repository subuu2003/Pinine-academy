import apiClient from "./client.js";

export const testimonialApi = {
  // Get all approved testimonials
  getTestimonials: async () => {
    try {
      const response = await apiClient.get("/testimonials?approved=true");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      throw error;
    }
  },

  // Create new testimonial
  createTestimonial: async (data) => {
    try {
      const response = await apiClient.post("/testimonials", {
        name: data.name,
        message: data.message,
        achievement: data.achievement,
        rating: data.rating || 5,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error creating testimonial:", error);
      throw error;
    }
  },

  // Approve testimonial (admin only)
  approveTestimonial: async (id) => {
    try {
      const response = await apiClient.put(`/testimonials/${id}/approve`);
      return response.data.data;
    } catch (error) {
      console.error("Error approving testimonial:", error);
      throw error;
    }
  },

  // Delete testimonial (admin only)
  deleteTestimonial: async (id) => {
    try {
      await apiClient.delete(`/testimonials/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      throw error;
    }
  },
};
