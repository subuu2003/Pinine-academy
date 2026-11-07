from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from notice_board.models import Notice

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds sample academy notices for Pinine Academy Phase 7 testing'

    def handle(self, *args, **kwargs):
        admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            admin_user = User.objects.filter(role='ADMIN').first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@pinene.com',
                password='adminpassword',
                role='ADMIN'
            )

        now = timezone.now()

        notices_data = [
            {
                'title': 'Annual Science & Math Olympiad 2026 Registration Open',
                'category': Notice.CATEGORY_EXAMINATION,
                'short_description': 'Registrations are now live for Class 9 to 12 students. Win cash awards, merit certificates and book grants.',
                'content': (
                    'Pinine Academy is thrilled to announce the 2026 Annual Science and Mathematics Olympiad.\n\n'
                    'Eligibility:\n'
                    '• Class 9 & 10 (Junior Division: General Science & Aptitude)\n'
                    '• Class 11 & 12 (Senior Division: Advanced Physics, Chemistry, and Mathematics)\n\n'
                    'Important Dates:\n'
                    '• Registration Deadline: 15th of next month\n'
                    '• Preliminary Online Screening: 22nd of next month\n'
                    '• Final Round: At Pinine Academy Main Campus\n\n'
                    'How to apply: Visit the Examinations portal on your student dashboard or contact your academic mentor.'
                ),
                'status': Notice.STATUS_PUBLISHED,
                'is_published': True,
                'publish_date': now - timedelta(days=2),
                'expiry_date': now + timedelta(days=45),
            },
            {
                'title': 'CRITICAL ALERT: Pre-Board & Mock Test Server Maintenance Window',
                'category': Notice.CATEGORY_IMPORTANT,
                'short_description': 'Scheduled platform maintenance this Sunday from 02:00 AM to 05:00 AM IST. Online test sessions will pause.',
                'content': (
                    'Notice to all students and faculty:\n\n'
                    'Our primary examination servers will undergo scheduled infrastructure upgrades this Sunday between 02:00 AM and 05:00 AM IST.\n\n'
                    'Impact:\n'
                    '• Test portal will be temporarily in maintenance mode.\n'
                    '• Ongoing mock test saves will be safely cached.\n'
                    '• Normal portal operations will resume promptly at 05:00 AM IST.\n\n'
                    'Please schedule your practice mock tests accordingly.'
                ),
                'status': Notice.STATUS_PUBLISHED,
                'is_published': True,
                'publish_date': now - timedelta(days=1),
                'expiry_date': now + timedelta(days=7),
            },
            {
                'title': 'JEE Advanced 2026 Intensive Classroom & Weekend Batch Admissions',
                'category': Notice.CATEGORY_ADMISSION,
                'short_description': 'Limited seats available for Class 11 & 12 JEE Advanced target batches with one-on-one problem solving sessions.',
                'content': (
                    'Admissions are officially announced for the 2026 JEE Advanced Crash & Revision batches.\n\n'
                    'Batch Highlights:\n'
                    '• Rigorous multi-concept problem solving with senior mentors\n'
                    '• Weekly diagnostic CBT exams mimicking actual NTA/IIT patterns\n'
                    '• Comprehensive physical textbooks shipped directly to enrolled students\n\n'
                    'Scholarship test will be administered online this coming Saturday.'
                ),
                'status': Notice.STATUS_PUBLISHED,
                'is_published': True,
                'publish_date': now - timedelta(days=3),
                'expiry_date': now + timedelta(days=60),
            },
            {
                'title': 'Official Results Announced: Diagnostic Mechanics Mock Exam 1',
                'category': Notice.CATEGORY_RESULT,
                'short_description': 'Scorecards, rank analysis, and video solution discussions are now accessible under your Academic Dashboard.',
                'content': (
                    'The academic council has reviewed and published results for the Class 11 Mechanics Diagnostic Assessment.\n\n'
                    'Overall statistics:\n'
                    '• Total Candidates Appeared: 1,420\n'
                    '• Highest Score: 98.5%\n'
                    '• Batch Average: 68.2%\n\n'
                    'Students can review their step-by-step performance report, speed-versus-accuracy metrics, and chapterwise weakness breakdowns.'
                ),
                'status': Notice.STATUS_PUBLISHED,
                'is_published': True,
                'publish_date': now - timedelta(days=4),
                'expiry_date': now + timedelta(days=30),
            },
            {
                'title': 'Pinine Academy Library & Digital Resource Center Extended Hours',
                'category': Notice.CATEGORY_GENERAL,
                'short_description': 'Digital reference repository and study rooms will remain accessible till 10:00 PM throughout the exam term.',
                'content': (
                    'To assist students preparing for upcoming midterms and competitive examinations, Pinine Academy is extending reading room and digital library support.\n\n'
                    'Online textbook queries can also be dispatched to mentors between 8:00 AM and 10:00 PM.'
                ),
                'status': Notice.STATUS_PUBLISHED,
                'is_published': True,
                'publish_date': now - timedelta(days=5),
                'expiry_date': now + timedelta(days=90),
            },
            # Draft notice - MUST NOT show on student/public boards
            {
                'title': 'INTERNAL DRAFT: Revised Fee Structure for Academic Year 2027',
                'category': Notice.CATEGORY_OTHER,
                'short_description': 'Confidential proposal under administrative review.',
                'content': 'This draft proposal is strictly internal for board members and administrators.',
                'status': Notice.STATUS_DRAFT,
                'is_published': False,
                'publish_date': now - timedelta(days=1),
                'expiry_date': None,
            },
            # Scheduled future notice - MUST NOT show on student/public boards until future date
            {
                'title': 'National Talent Search Scholarship 2027 Portal Opening',
                'category': Notice.CATEGORY_ADMISSION,
                'short_description': 'Opens next month.',
                'content': 'Details on national talent search exams.',
                'status': Notice.STATUS_PUBLISHED,
                'is_published': True,
                'publish_date': now + timedelta(days=15),
                'expiry_date': now + timedelta(days=75),
            },
            # Expired notice - MUST NOT show on student/public boards
            {
                'title': 'Early Bird Textbook Discount Coupon Expired',
                'category': Notice.CATEGORY_IMPORTANT,
                'short_description': 'This coupon expired last month.',
                'content': 'Expired coupon circular.',
                'status': Notice.STATUS_PUBLISHED,
                'is_published': True,
                'publish_date': now - timedelta(days=60),
                'expiry_date': now - timedelta(days=5),
            },
        ]

        count = 0
        for item in notices_data:
            notice, created = Notice.objects.update_or_create(
                title=item['title'],
                defaults={
                    'category': item['category'],
                    'short_description': item['short_description'],
                    'content': item['content'],
                    'status': item['status'],
                    'is_published': item['is_published'],
                    'publish_date': item['publish_date'],
                    'expiry_date': item['expiry_date'],
                    'created_by': admin_user,
                    'is_deleted': False
                }
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {count} notices.'))
