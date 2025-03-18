from flask import Flask, jsonify,  request ,send_file ,send_from_directory
from flask_cors import CORS
from .models import db, Question, Job, Candidate 
from .config import SQLALCHEMY_DATABASE_URI
from datetime import datetime
from flask_session import Session
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import pdfx
import re
import json
from geotext import GeoText
import nltk
import os
from PyPDF2 import PdfFileReader
import spacy
import fitz  
from difflib import SequenceMatcher
from flask_mail import Mail, Message
from flask_migrate import Migrate

app = Flask(__name__)
app.config['EXTRACTED_DATA'] = 'extracted_data'
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'your_secret_key'  # Add a secret key for session management
# Configure Flask-Mail to use Gmail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'playful.rh@gmail.com'
app.config['MAIL_PASSWORD'] = 'test2001.'  # Use an app-specific password
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
mail = Mail(app)
migrate = Migrate(app, db)

db.init_app(app)
CORS(app , resources={r"/*": {"origins": "http://localhost:3000"}})
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

#THE EMAIL PART
@app.route('/schedule-interview', methods=['POST'])
def schedule_interview():
    data = request.json
    job_id = data['jobId']
    candidate_email = data['candidateEmail']
    candidate_name = data['candidateName'] 
    # Fetch job details based on job_id (you need to implement this part)
    job = get_job_details(job_id)  # Implement this function to get job details
# Define the interview date and time
    interview_time = "10:00 AM"

    # Compose the email
    subject = 'Interview Scheduled for Job Opportunity'
    body = f"""
    Dear {candidate_name},

    We are pleased to inform you that we would like to schedule an interview for the position of {job['title']} at {job['company']}.
    Here are the details of the job opportunity:
    
    Job Title: {job['title']}
    Company: {job['company']}
    Location: {job['location']}

    The interview is scheduled for next Monday at {interview_time}. Please let us know if this time works for you.

    Best regards,
    KT
    """

    msg = Message(subject, sender='playful.hr@gmail.com', recipients=[candidate_email])
    msg.body = body

    try:
        mail.send(msg)
        return jsonify({'message': 'Interview scheduled successfully!'}), 200
    except Exception as e:
        print('Error sending email:', e)
        return jsonify({'message': 'Failed to schedule interview.'}), 500

def get_job_details(job_id):
    # Implement this function to fetch job details based on job_id
    # For example, query the database and return the job details
    return {
        'title': 'Sample Job Title',
        'company': 'Sample Company',
        'location': 'Sample Location'
    }
@app.route('/candidate-data', methods=['GET'])
def get_candidate_data():
    with open(os.path.join(EXTRACTED_DATA_PATH, 'data.json')) as f:
        candidate_data = json.load(f)
    return jsonify({'email': candidate_data.get('email', '')})

# Route to serve extracted data
EXTRACTED_DATA_PATH = 'C:/Users/info/Desktop/nlp_recruitment_app/backend/app/extracted_data'

@app.route('/serve-data', methods=['GET'])
def serve_data():
    try:
        return send_from_directory(EXTRACTED_DATA_PATH, 'data.json', mimetype='application/json')
    except Exception as e:
        print(f"Error fetching JSON file: {e}")
        return jsonify({'error': 'Error fetching extracted data'}), 500
    
#AUTOMATIC MATCHING 
def match_candidate_to_jobs(candidate_data, jobs):
    matched_jobs = []
    candidate_skills = set(skill.lower() for skill in candidate_data['skills'])
    print("Candidate Skills:", candidate_skills)

    # Convert SKILL_KEYWORDS to lowercase for case-insensitive comparison
    skill_keywords = set(skill.lower() for skill in SKILL_KEYWORDS)

    for job in jobs:
        # Normalize job requirements by replacing newlines and commas with a space
        normalized_requirements = job.requirements.lower().replace('\n', ' ').replace(',', ' ')
        # Further normalization to handle multiple spaces
        normalized_requirements = ' '.join(normalized_requirements.split())
        
        # Find skill keywords in job requirements
        job_requirements = set(req for req in skill_keywords if req in normalized_requirements)
        print("Job Requirements:", job_requirements)

        intersection = candidate_skills & job_requirements
        print("Intersection:", intersection)

        if job_requirements:  # Ensure no division by zero
            skill_match = len(intersection) / len(job_requirements) * 100
        else:
            skill_match = 0
        print(f"Skill Match for Job {job.id}: {skill_match}%")

        if skill_match >= 50:
            matched_jobs.append({
                'job_id': job.id,
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'skill_match_percentage': skill_match
            })

    return matched_jobs
@app.route('/match-jobs', methods=['GET'])
def match_jobs():
    with open(os.path.join(EXTRACTED_DATA_PATH, 'data.json')) as f:
        candidate_data = json.load(f)
    jobs = Job.query.all()
    matched_jobs = match_candidate_to_jobs(candidate_data, jobs)
    return jsonify(matched_jobs)

#extraction part
LANGUAGE_KEYWORDS = ['English','FRANCAIS','ARABE','ANGLAIS', 'French', 'Spanish', 'German', 'Italian', 'Arabic', 'arabe','Japanese','Arabe','Tamazigh', 'Français', 'Russian', 'Dutch', 'Swedish', 'Francais', 'Anglais','Turkish', 'Korean', 'espagnol', 'allemagne']
SKILL_KEYWORDS= ["Python","Effective Communication","Java", "C++", "JavaScript", "Ruby", "C#", "PHP", "SQL", "Cpp", 
    "Swift", "Kotlin", "Dart", "TypeScript", "Objective-C", "Scala", "Perl", "Rust", "VSCode",
    "Haskell","Teamwork" ,"Lisp", "MATLAB", "React", "Angular", "Vue.js", "Django", "Flask", 
    "TensorFlow", "PyTorch", "OpenCV", "Scikit-learn", "Pandas", "NumPy", "Matplotlib","JS",
    "NestJS", "Rails", "Laravel", "Databases", "MySQL", "PostgreSQL", "MongoDB", "ElectronJs",
    "Oracle","PL/SQL","Jira","Trello","UML","MERISE", "SQL Server", "Redis", "Cassandra", "Elasticsearch", "Neo4j", "MariaDB", 
    "SQLite","Windows","Linux","Unix","Firebase", "Cloud Platforms", "AWS ","Amazon Web Services", "Azure", 
    "Google", "GCP (Google Cloud Platform)", "NextJs", "DigitalOcean", "Linode", "User Flows",
    "IBM Cloud", "Oracle Cloud Infrastructure", "DevOps", "Docker", "Kubernetes", "Process Flows",
    "Ansible", "Jenkins", "CI/CD pipelines", "Terraform", "Chef", "Puppet", "Git","Visual Design","SVN", "Maven", "Gradle", "Data mining", "Machine learning", "Statistical analysis", 
    "Data visualization","UI/UX","Storyboards", "Natural language processing", "NLP", "Computer vision", 
    "Deep learning", "Time series analysis", "Predictive analytics", "Software Development", 
    "Software design", "Testing", "Debugging", "Version control (Git, SVN)", 
    "Agile methodologies (Scrum, Kanban)", "Software architecture", "Github", 
    "Other Technical Skills", "Cybersecurity", "Network engineering", "System administration", 
    "Embedded systems", "Mobile app development (iOS, Android)", "Gitlab", 
    "Web development", "Full-stack development", "Front-end development", 
    "Back-end development", "DevOps", "Data engineering", "Cloud computing", 
    "Big data", "Artificial intelligence", "Internet of Things (IoT)", "Blockchain"]
SCHOOL_KEYWORDS = ['lycée','EMSI','ISFO','EST','Mohammadia School of Engineering','National Institute of Posts and Telecommunications',
    'EMSI,','EHTP','ENSA','ENSAM','ENSET','bts','National Institute of Applied Sciences','National school of Applied Sciences','Higher School of Technology Casablanca','FSSM','FST','Higher School of Engineers Marrakech','Higher Institute of Engineering Tangier','Higher Institute of Textile and Clothing Trades','National School of Computer Science and Systems Analysis',
    'Cadi Ayyad University ',' Faculty ','faculté',
    'Higher Normal School of Technical Education','Higher Institute of Technology Rabat','Higher Institute of Technology Agadir',
    '1337','Moroccan school of engineering sciences'
    'National Institute for Research in Computer Science and Automation',
    'Higher School of Engineers Casablanca','Institute for Training Engineers in Renewable Energies',]
def get_school_name(input_text):
    text_split = [i.strip() for i in input_text.split('\n')]
    school_names = []
    for phrase in text_split:
        # Check if any keyword from SCHOOL_KEYWORDS is in the phrase
        p_key = set(phrase.lower().split(' ')) & set(school.lower() for school in SCHOOL_KEYWORDS)
        if len(p_key) > 0:
            school_names.append(phrase)
    return school_names

def get_languages(input_text):
    text_split = [i.strip() for i in input_text.split('\n')]
    languages = []
    for phrase in text_split:
        p_key = set(phrase.split(' ')) & set(LANGUAGE_KEYWORDS)
        if len(p_key) > 0:
            languages.append(phrase)
    return languages

def get_skills(input_text):
    skills_found = []
    for skill in SKILL_KEYWORDS:
        if skill.lower() in input_text.lower():
            skills_found.append(skill)
    return list(set(skills_found))

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    if os.path.exists(pdf_path) is False:
        return ""
    pdf = pdfx.PDFx(pdf_path)
    text = pdf.get_text()
    return text

def extract_name(text):
    name_pattern = re.compile(r'\b[A-Z][A-Z\s]+\b')
    matches = name_pattern.findall(text)
    for name in matches:
        if len(name.split()) == 2:
            return name  # Return the first valid match
    return None 

def get_skills_from_section(text):
    skill_section_pattern = re.compile(r'\bSkills\b|Technical\sSkills\b|Key\sSkills\b', re.IGNORECASE)
    skill_start_index = None
    skill_end_index = None
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if skill_section_pattern.search(line):
            skill_start_index = i + 1  # Start after the heading
            break
    if skill_start_index is not None:
        skills = []
        for line in lines[skill_start_index:]:
            if re.match(r'\b[A-Za-z]+(?:\s[A-Za-z]+)*\b', line):  # Simple pattern for skills
                skills.extend([skill.strip() for skill in line.split(',')])
            else:
                break  # Stop if text seems unrelated
        return list(set(skills))  # Remove duplicates
    return []

# Function to extract location (contains city names)
def load_moroccan_cities(filename='cities.json'):
    with open(filename, 'r', encoding='utf-8') as file:
        cities = json.load(file)
    return set(cities)
moroccan_cities = load_moroccan_cities()

def extract_location(text):
    geo = GeoText(text)
    cities = geo.cities
    # Filter out Moroccan cities
    moroccan_found = [city for city in cities if city in moroccan_cities]
    res = {'city': moroccan_found[0] if moroccan_found else None}
    return res

# Function to extract phone numbers
def extract_moroccan_phone_number(text):
   phone_pattern = re.compile(r'\+212[\s\-]*\d{2,3}[\s\-]*\d{2,3}[\s\-]*\d{2,3}[\s\-]*\d{2,3}')
   phone_numbers = phone_pattern.findall(text)
   return phone_numbers

# Function to extract email
def extract_email(text):
    email = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    return email.group() if email else ''
def extract_links(text):
    url_pattern = re.compile(
        r'\b(?:https?://)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:/[^/\s]+)+\b',
        re.IGNORECASE
    )
    email_pattern = re.compile(
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        re.IGNORECASE
    )
    
    urls = url_pattern.findall(text)
    emails = email_pattern.findall(text)
    
    filtered_urls = [url for url in urls if not any(email in url for email in emails)]
    return filtered_urls
    
def save_to_json(data, filename='data.json'):
    with open(filename, 'w') as file:
        json.dump(data, file, indent=4)

# Endpoint to handle  upload and analysis
@app.route('/analyze-cv', methods=['POST'])
def analyze_cv():
    if 'cv' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['cv']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file_path = os.path.join('extracted_data', file.filename)
    
    try:
        file.save(file_path)
        print(f"File saved to: {file_path}")  # Debug statement
    except Exception as e:
        print(f"Error saving file: {e}")  # Print exception details
        return jsonify({'error': 'Error saving file'}), 500

    try:
        text = extract_text_from_pdf(file_path)
        location = extract_location(text)
        phone = extract_moroccan_phone_number(text)
        email = extract_email(text)
        links = extract_links(text)
        schools = get_school_name(text)
        languages = get_languages(text)
        skills_from_list = get_skills(text)
        skills_from_section = get_skills_from_section(text)
        all_skills = list(set(skills_from_list + skills_from_section))
        full_name = extract_name(text)

        data = {
            'location': location,
            'phone': phone,
            'email': email,
            'links': links,
            'schools': schools,
            'languages': languages,
            'skills': all_skills,
            'full name': full_name
        }

        json_filename = os.path.join('extracted_data', 'data.json')
        try:
            save_to_json(data, filename=json_filename)
            print(f"Data saved to JSON file: {json_filename}")  # Debug statement
        except Exception as e:
            print(f"Error saving data to JSON file: {e}")  # Print exception details
            return jsonify({'error': 'Error saving data to JSON file'}), 500

        return jsonify(data)
    except Exception as e:
        print(f"Error processing file: {e}")  # Print exception details
        return jsonify({'error': 'Error processing file'}), 500



#login 
@app.route('/candidate/login', methods=['POST'])
def login():
    data = request.json
    print(f"Request Data: {data}")  # Log incoming data
    candidate = Candidate.query.filter_by(email=data['email']).first()
    if candidate:
        print(f"Candidate Found: {candidate.email}")  # Log found candidate
        if bcrypt.check_password_hash(candidate.password_hash, data['password']):
            access_token = create_access_token(identity={'email': candidate.email})
            return jsonify({'token': access_token}), 200
        else:
            print("Password does not match")  # Log password mismatch
    else:
        print("Candidate not found")  # Log if candidate not found
    return jsonify({'message': 'Invalid credentials'}), 401


# Endpoint to get all jobs
@app.route('/jobs', methods=['GET'])
def get_jobs():
    jobs = Job.query.all()
    job_list = [{
        'id': job.id,
        'title': job.title,
        'company': job.company,
        'location': job.location,
        'jobtype': job.jobtype,
        'salaryRange': job.salaryRange,
        'description': job.description,
        'requirements': job.requirements,
        'contact': job.contact,
        'createdAt': job.date_created.isoformat()  # Include createdAt field
    } for job in jobs]
    return jsonify(job_list)


@app.route('/jobs/<int:id>', methods=['GET'])
def get_job(id):
    job = Job.query.get(id)
    if job:
        return jsonify({
            'id': job.id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'jobtype': job.jobtype,
            'salaryRange': job.salaryRange,
            'description': job.description,
            'requirements': job.requirements,
            'contact': job.contact
        }), 200
    return jsonify({'message': 'Job not found!'}), 404

@app.route('/jobs/<int:id>', methods=['DELETE'])
def delete_job(id):
    job = Job.query.get(id)
    if job:
        db.session.delete(job)
        db.session.commit()
        return jsonify({'message': 'Job deleted successfully!'}), 200
    else:
        return jsonify({'message': 'Job not found!'}), 404


@app.route('/add-job', methods=['POST'])
def add_job():
    data = request.json
    new_job = Job(
        title=data['title'],
        jobtype=data['jobtype'],
        description=data['description'],
        requirements=data['requirements'],  # Store as multi-line string
        location=data['location'],
        company=data['company'],
        salaryRange=data.get('salaryRange', ''),  # Optional
        contact=data.get('contact', '')  # Optional
    )
    db.session.add(new_job)
    db.session.commit()
    return jsonify({'message': 'Job added successfully!'}), 201


@app.route('/jobs/<int:id>', methods=['PUT'])
def update_job(id):
    job = Job.query.get(id)
    if job:
        data = request.get_json()
        job.title = data.get('title', job.title)
        job.company = data.get('company', job.company)
        job.location = data.get('location', job.location)
        job.jobtype = data.get('jobtype', job.jobtype)
        job.salaryRange = data.get('salaryRange', job.salaryRange)
        job.description = data.get('description', job.description)
        job.requirements = data.get('requirements', job.requirements)
        job.contact = data.get('contact', job.contact)
        db.session.commit()
        return jsonify({'message': 'Job updated successfully!'}), 200
    return jsonify({'message': 'Job not found!'}), 404


if __name__ == '__main__':
    app.run(debug=True)
