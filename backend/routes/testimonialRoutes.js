import express from "express";
import {
  getTestimonials,
  createTestimonial,
  approveTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialController.js";

const router = express.Router();

router.get("/", getTestimonials);
router.post("/", createTestimonial);
router.put("/:id/approve", approveTestimonial);
router.delete("/:id", deleteTestimonial);

export default router;
