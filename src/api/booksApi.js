import apiClient from "./client.js";

export const booksApi = {
  // Get all books with optional filters
  getBooks: async (category = null, search = null) => {
    try {
      const params = {};
      if (category) params.category = category;
      if (search) params.search = search;

      const response = await apiClient.get("/books", { params });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching books:", error);
      throw error;
    }
  },

  // Get single book by ID
  getBook: async (id) => {
    try {
      const response = await apiClient.get(`/books/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching book:", error);
      throw error;
    }
  },

  // Create new book (admin only)
  createBook: async (bookData) => {
    try {
      const response = await apiClient.post("/books", bookData);
      return response.data.data;
    } catch (error) {
      console.error("Error creating book:", error);
      throw error;
    }
  },

  // Update book (admin only)
  updateBook: async (id, bookData) => {
    try {
      const response = await apiClient.put(`/books/${id}`, bookData);
      return response.data.data;
    } catch (error) {
      console.error("Error updating book:", error);
      throw error;
    }
  },

  // Delete book (admin only)
  deleteBook: async (id) => {
    try {
      await apiClient.delete(`/books/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting book:", error);
      throw error;
    }
  },
};
