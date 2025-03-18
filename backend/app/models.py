# models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

def get_casablanca_time():
    return datetime.now(timezone(timedelta(hours=1)))

db = SQLAlchemy()

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200), nullable=False)
    skill_category = db.Column(db.String(100), nullable=False)
    difficulty_level = db.Column(db.Integer, nullable=False)
    choice_a = db.Column(db.String(100), nullable=False)
    choice_b = db.Column(db.String(100), nullable=False)
    choice_c = db.Column(db.String(100), nullable=False)
    correct_answer = db.Column(db.String(1), nullable=False)  # Assuming 'A', 'B', or 'C'

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    jobtype = db.Column(db.String(50), nullable=False)
    salaryRange = db.Column(db.String(50), nullable=True)  
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text, nullable=False)
    contact = db.Column(db.String(100), nullable=True)
    date_created = db.Column(db.DateTime, default=get_casablanca_time)

class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password_hash = db.Column(db.String(128), nullable=False)  # Storing hashed passwords
    uploaded_cv = db.Column(db.Text, nullable=True)
    skills = db.Column(db.Text, nullable=True)  # Can use JSON if needed
    experience = db.Column(db.Text, nullable=True)
    education = db.Column(db.Text, nullable=True)
    profile_strength = db.Column(db.Text, nullable=True)
    profile_gaps = db.Column(db.Text, nullable=True)
    date_created = db.Column(db.DateTime, default=get_casablanca_time)

     # Method to set password
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    # Method to check password
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class CandidateResponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    response = db.Column(db.String(1), nullable=False)  # Assuming 'A', 'B', or 'C'
    is_correct = db.Column(db.Boolean, nullable=True)
    response_time = db.Column(db.DateTime, default=get_casablanca_time)

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate.id'), nullable=False)
    feedback_text = db.Column(db.Text, nullable=False)
    date_generated = db.Column(db.DateTime, default=get_casablanca_time)

class SkillCategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)

# Create relationships (not strictly necessary but useful for ORM queries)
Candidate.responses = db.relationship('CandidateResponse', backref='candidate', lazy=True)
Question.responses = db.relationship('CandidateResponse', backref='question', lazy=True)
Candidate.feedbacks = db.relationship('Feedback', backref='candidate', lazy=True)

