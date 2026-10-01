from django.core.management.base import BaseCommand
from books.models import Book


class Command(BaseCommand):
    help = 'Seed initial academic books into the catalog'

    def handle(self, *args, **options):
        initial_books = [
            {
                "title": "Mastering Physics Class 11",
                "subject": "Physics",
                "category": "Class 11",
                "price": 599.00,
                "author": "PINENE ACADEMY ACADEMIC COUNCIL",
                "description": "A comprehensive guide designed for Class 11 CBSE and competitive foundations. Includes deep conceptual analysis, kinematics, laws of motion, gravitation, thermodynamics, and over 1,200 graded practice exercises with detailed explanations.",
                "image_url": "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&h=800&fit=crop",
                "is_bestseller": True,
            },
            {
                "title": "Chemistry Essentials Class 12",
                "subject": "Chemistry",
                "category": "Class 12",
                "price": 649.00,
                "author": "PINENE ACADEMY ACADEMIC COUNCIL",
                "description": "Complete organic mechanisms, coordination chemistry, and chemical kinetics. Formulated to ensure total syllabus coverage for board exam distinction and competitive exams.",
                "image_url": "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=600&h=800&fit=crop",
                "is_bestseller": True,
            },
            {
                "title": "Mathematics Explorer Class 10",
                "subject": "Mathematics",
                "category": "Class 10",
                "price": 549.00,
                "author": "PINENE ACADEMY ACADEMIC COUNCIL",
                "description": "Step-by-step proofs, trigonometry, surface areas, and quadratic equations. Features board exam solved papers from the last 10 years.",
                "image_url": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=800&fit=crop",
                "is_bestseller": False,
            },
            {
                "title": "Ace Biology Class 11",
                "subject": "Biology",
                "category": "Class 11",
                "price": 579.00,
                "author": "PINENE ACADEMY ACADEMIC COUNCIL",
                "description": "Cell structure, human physiology, plant morphology, and genetics with high-resolution anatomical diagrams and mnemonic charts.",
                "image_url": "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=800&fit=crop",
                "is_bestseller": True,
            },
            {
                "title": "JEE Advanced Mathematics",
                "subject": "Mathematics",
                "category": "JEE Prep",
                "price": 899.00,
                "author": "PINENE ACADEMY ACADEMIC COUNCIL",
                "description": "Advanced calculus, vectors, 3D geometry, complex numbers, and probability. Contains multiple-choice, numerical-value, and matrix-match problems curated for IIT JEE Advanced.",
                "image_url": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=800&fit=crop",
                "is_bestseller": True,
            },
            {
                "title": "JEE Mechanics & Waves Physics",
                "subject": "Physics",
                "category": "JEE Prep",
                "price": 899.00,
                "author": "PINENE ACADEMY ACADEMIC COUNCIL",
                "description": "Advanced mechanics, rotational motion, wave optics, and oscillations with past 15-year chapterwise solved problems.",
                "image_url": "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=600&h=800&fit=crop",
                "is_bestseller": False,
            },
            {
                "title": "Class 9 Integrated Science Foundation",
                "subject": "Physics",
                "category": "Class 9",
                "price": 449.00,
                "author": "PINENE ACADEMY ACADEMIC COUNCIL",
                "description": "Foundational concepts for class 9 students stepping into physics, chemistry, and biology with experiential exercises and diagrams.",
                "image_url": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=800&fit=crop",
                "is_bestseller": False,
            },
            {
                "title": "JEE Organic Reaction Mechanisms",
                "subject": "Chemistry",
                "category": "JEE Prep",
                "price": 799.00,
                "author": "PINENE ACADEMY ACADEMIC COUNCIL",
                "description": "Stepwise mechanistic pathways, stereochemistry, named reactions, and synthetic transformations for competitive aspirants.",
                "image_url": "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&h=800&fit=crop",
                "is_bestseller": True,
            },
        ]

        created_count = 0
        for b_data in initial_books:
            obj, created = Book.objects.get_or_create(
                title=b_data["title"],
                defaults=b_data
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded {created_count} new books (Total books in catalog: {Book.objects.count()})"
        ))
