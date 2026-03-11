import Testimonial from "../models/Testimonial.js";
import mongoose from "mongoose";

const mockTestimonials = [
  {
    _id: '1',
    name: "Rahul Sharma",
    message: "The JEE books from Pinene Academy were instrumental in my success. The study material is top-notch and easy to understand.",
    achievement: "JEE Advanced 2024",
    approved: true,
    rating: 5
  },
  {
    _id: '2',
    name: "Priya Patel",
    message: "Comprehensive content and expert explanations helped me score 95% in my board exams. Highly recommended!",
    achievement: "Class 12 Topper",
    approved: true,
    rating: 5
  },
  {
    _id: '3',
    name: "Amit Kumar",
    message: "The practice problems and detailed solutions made complex topics simple. Best investment for my studies!",
    achievement: "NEET 2024",
    approved: true,
    rating: 5
  },
];

export const getTestimonials = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const { approved } = req.query;
      let data = mockTestimonials;
      if (approved === "true") {
        data = mockTestimonials.filter(t => t.approved);
      }
      return res.status(200).json({
        success: true,
        count: data.length,
        data: data,
      });
    }

    const { approved } = req.query;
    let query = {};

    if (approved === "true") {
      query.approved = true;
    }

    const testimonials = await Testimonial.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: { ...req.body, _id: Date.now().toString(), approved: false },
      });
    }

    const testimonial = await Testimonial.create(req.body);
    res.status(201).json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const approveTestimonial = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: { _id: req.params.id, approved: true },
      });
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true },
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        error: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        data: {},
      });
    }

    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        error: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
