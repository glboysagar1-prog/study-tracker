import scrapy

class GtuSyllabusItem(scrapy.Item):
    course = scrapy.Field()
    branch = scrapy.Field()
    semester = scrapy.Field()
    subject_code = scrapy.Field()
    subject_name = scrapy.Field()
    credits = scrapy.Field()
    syllabus_pdf_url = scrapy.Field()
    scraped_at = scrapy.Field()


class GtuCircularItem(scrapy.Item):
    """Item for GTU Circulars"""
    title = scrapy.Field()
    description = scrapy.Field()
    date = scrapy.Field()
    link_url = scrapy.Field()
    category = scrapy.Field()
    content_hash = scrapy.Field()
    scraped_at = scrapy.Field()


class GtuNewsItem(scrapy.Item):
    """Item for GTU News"""
    title = scrapy.Field()
    description = scrapy.Field()
    date = scrapy.Field()
    link_url = scrapy.Field()
    category = scrapy.Field()
    content_hash = scrapy.Field()
    scraped_at = scrapy.Field()


class GtuExamScheduleItem(scrapy.Item):
    """Item for GTU Exam Schedules"""
    title = scrapy.Field()
    description = scrapy.Field()
    date = scrapy.Field()
    link_url = scrapy.Field()
    category = scrapy.Field()
    content_hash = scrapy.Field()
    scraped_at = scrapy.Field()


class PreviousPaperItem(scrapy.Item):
    subject_code = scrapy.Field()
    subject_name = scrapy.Field()
    year = scrapy.Field()
    exam_type = scrapy.Field()
    paper_pdf_url = scrapy.Field()
    solution_pdf_url = scrapy.Field()


class StudyMaterialItem(scrapy.Item):
    """Enhanced study material item with source attribution"""
    subject_code = scrapy.Field()
    subject_name = scrapy.Field()
    title = scrapy.Field()
    material_type = scrapy.Field()
    description = scrapy.Field()
    content_url = scrapy.Field()
    unit = scrapy.Field()
    source_url = scrapy.Field()
    source_name = scrapy.Field()
    content_hash = scrapy.Field()


class NotesItem(scrapy.Item):
    """Item for unit-wise notes"""
    subject_code = scrapy.Field()
    subject_name = scrapy.Field()
    unit = scrapy.Field()
    title = scrapy.Field()
    description = scrapy.Field()
    file_url = scrapy.Field()  # Direct download link
    source_url = scrapy.Field()  # Original page URL
    source_name = scrapy.Field()  # 'GTUStudy', 'GTUMaterial', etc.
    content_hash = scrapy.Field()
    scraped_at = scrapy.Field()


class SyllabusContentItem(scrapy.Item):
    """Item for detailed syllabus with topics"""
    subject_code = scrapy.Field()
    subject_name = scrapy.Field()
    unit = scrapy.Field()
    unit_title = scrapy.Field()
    topic = scrapy.Field()
    content = scrapy.Field()
    source_url = scrapy.Field()
    scraped_at = scrapy.Field()


class ReferenceMaterialItem(scrapy.Item):
    """Item for reference books, PDFs, videos"""
    subject_code = scrapy.Field()
    subject_name = scrapy.Field()
    material_type = scrapy.Field()  # 'book', 'pdf', 'video', 'link'
    title = scrapy.Field()
    author = scrapy.Field()
    description = scrapy.Field()
    url = scrapy.Field()
    source_url = scrapy.Field()  # Where we found this reference
    source_name = scrapy.Field()
    isbn = scrapy.Field()  # For books
    publisher = scrapy.Field()
    year = scrapy.Field()
    scraped_at = scrapy.Field()


class ImportantQuestionItem(scrapy.Item):
    """Enhanced important question item"""
    subject_code = scrapy.Field()
    subject_name = scrapy.Field()
    unit = scrapy.Field()
    question_text = scrapy.Field()
    marks = scrapy.Field()
    difficulty = scrapy.Field()  # 'easy', 'medium', 'hard'
    frequency = scrapy.Field()  # How often it appears
    last_asked_year = scrapy.Field()
    answer_text = scrapy.Field()
    source_url = scrapy.Field()
    source_name = scrapy.Field()
    content_hash = scrapy.Field()
    scraped_at = scrapy.Field()