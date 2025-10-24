import os
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from functools import wraps

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ["DATABASE_URL"]
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
db = SQLAlchemy(app)

# Admin credentials (in production, hash passwords and store in DB)
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# Models
class Profile(db.Model):
    __tablename__ = 'profile'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    role = db.Column(db.Text, nullable=False)
    about_text = db.Column(db.Text)
    projects_completed = db.Column(db.Integer)
    technologies_learned = db.Column(db.Integer)
    learning_mindset = db.Column(db.Integer)

class Skill(db.Model):
    __tablename__ = 'skills'
    id = db.Column(db.Integer, primary_key=True)
    icon = db.Column(db.Text, nullable=False)
    title = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)

# Update a single skill by ID
@app.route('/update-skill/<int:skill_id>', methods=['POST'])
def update_skill(skill_id):
    data = request.json
    skill = Skill.query.get(skill_id)
    if not skill:
        return jsonify({'error': 'Skill not found'}), 404
    skill.icon = data.get('icon', skill.icon)
    skill.title = data.get('title', skill.title)
    skill.description = data.get('description', skill.description)
    db.session.commit()
    return jsonify({'success': True, 'skill': skill.as_dict()})
class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    tech_tags = db.Column(db.ARRAY(db.Text))
    modal_content = db.Column(db.Text)
    github_link = db.Column(db.Text)
    image = db.Column(db.Text)  # stores filename or URL
# Import cloud storage functionality - Cloudinary
from werkzeug.utils import secure_filename
from cloudinary_storage import upload_file_to_cloudinary

# Keep local folder option as fallback
UPLOAD_FOLDER = 'project_images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload-project-image', methods=['POST'])
def upload_project_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        try:
            # Upload to Cloudinary
            public_id, cloudinary_url = upload_file_to_cloudinary(file)
            
            if public_id and cloudinary_url:
                # Successfully uploaded to Cloudinary
                # Store the public_id for future reference (deletion, transformations, etc.)
                return jsonify({
                    'success': True, 
                    'filename': public_id, 
                    'url': cloudinary_url,
                    'storage': 'cloudinary'
                })
            else:
                # Fall back to local storage if Cloudinary upload fails
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                return jsonify({
                    'success': True, 
                    'filename': filename, 
                    'url': f'/project_images/{filename}',
                    'storage': 'local'
                })
        except Exception as e:
            # If any error occurs, fall back to local storage
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return jsonify({
                'success': True, 
                'filename': filename, 
                'url': f'/project_images/{filename}',
                'storage': 'local'
            })
            
    return jsonify({'error': 'Invalid file type'}), 400

# Serve project images (only needed for local fallback)
@app.route('/project_images/<path:filename>')
def serve_project_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

class Education(db.Model):
    __tablename__ = 'education'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text, nullable=False)
    details = db.Column(db.Text)
    grade = db.Column(db.Text)

class SocialLink(db.Model):
    __tablename__ = 'social_links'
    id = db.Column(db.Integer, primary_key=True)
    platform = db.Column(db.Text, nullable=False)
    url = db.Column(db.Text, nullable=False)
    icon = db.Column(db.Text)

class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)
    email = db.Column(db.Text)
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

# Admin authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function


# Serve index.html at root
@app.route('/')
def serve_root():
    return send_from_directory('.', 'index.html')

# Serve any HTML or static file in the project root
@app.route('/<path:filename>')
def serve_static_files(filename):
    # Only allow serving files that exist in the root directory
    if os.path.isfile(filename):
        return send_from_directory('.', filename)
    return send_from_directory('.', '404.html'), 404

# Custom 404 error handler for any other routes
@app.errorhandler(404)
def page_not_found(e):
    return send_from_directory('.', '404.html'), 404

# Admin login endpoint
@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        session['logged_in'] = True
        session['username'] = username
        return jsonify({"success": True, "message": "Login successful"})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

# Admin logout endpoint
@app.route('/admin/logout', methods=['POST'])
def admin_logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out"})

# Check if user is logged in
@app.route('/admin/check-auth', methods=['GET'])
def check_auth():
    return jsonify({"logged_in": session.get('logged_in', False)})

# Serve images statically (for profile, projects, etc.)
@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory('image', filename)


# Get all data
@app.route('/get-all', methods=['GET'])
def get_all():
    profile = Profile.query.first()
    skills = Skill.query.all()
    projects = Project.query.all()
    education = Education.query.all()
    social_links = SocialLink.query.all()
    return jsonify({
        "profile": profile.as_dict() if profile else {},
        "skills": [s.as_dict() for s in skills],
        "projects": [p.as_dict() for p in projects],
        "education": [e.as_dict() for e in education],
        "social_links": [l.as_dict() for l in social_links]
    })


# Profile endpoints
@app.route('/get-profile', methods=['GET'])
def get_profile():
    profile = Profile.query.first()
    return jsonify(profile.as_dict() if profile else {})

@app.route('/update-profile', methods=['POST'])
def update_profile():
    new_data = request.json
    if not new_data:
        return jsonify({"error": "No data provided"}), 400
    profile = Profile.query.first()
    if profile:
        profile.name = new_data.get('name', profile.name)
        profile.role = new_data.get('role', profile.role)
        profile.about_text = new_data.get('about_text', profile.about_text)
        stats = new_data.get('stats', {})
        profile.projects_completed = stats.get('projects_completed', profile.projects_completed)
        profile.technologies_learned = stats.get('technologies_learned', profile.technologies_learned)
        profile.learning_mindset = stats.get('learning_mindset', profile.learning_mindset)
        db.session.commit()
        return jsonify({"success": True, "profile": profile.as_dict()})
    return jsonify({"error": "Profile not found"}), 404


# Skills endpoints
@app.route('/get-skills', methods=['GET'])
def get_skills():
    skills = Skill.query.all()
    return jsonify([s.as_dict() for s in skills])

@app.route('/update-skills', methods=['POST'])
def update_skills():
    new_skills = request.json
    if not isinstance(new_skills, list):
        return jsonify({"error": "Skills must be a list"}), 400
    Skill.query.delete()
    for skill in new_skills:
        db.session.add(Skill(icon=skill['icon'], title=skill['title'], description=skill['description']))
    db.session.commit()
    return jsonify({"success": True, "skills": new_skills})


# Projects endpoints
@app.route('/get-projects', methods=['GET'])
def get_projects():
    projects = Project.query.all()
    return jsonify([p.as_dict() for p in projects])

@app.route('/update-projects', methods=['POST'])
def update_projects():
    new_projects = request.json
    if not isinstance(new_projects, list):
        return jsonify({"error": "Projects must be a list"}), 400
    Project.query.delete()
    for project in new_projects:
        db.session.add(Project(
            title=project['title'],
            description=project['description'],
            tech_tags=project.get('tech_tags'),
            modal_content=project.get('modal_content'),
            github_link=project.get('github_link'),
            image=project.get('image')  # Save the image filename
        ))
    db.session.commit()
    return jsonify({"success": True, "projects": new_projects})


# Education endpoints
@app.route('/get-education', methods=['GET'])
def get_education():
    education = Education.query.all()
    return jsonify([e.as_dict() for e in education])

@app.route('/update-education', methods=['POST'])
def update_education():
    new_education = request.json
    if not isinstance(new_education, list):
        return jsonify({"error": "Education must be a list"}), 400
    Education.query.delete()
    for edu in new_education:
        db.session.add(Education(title=edu['title'], details=edu.get('details'), grade=edu['grade']))
    db.session.commit()
    return jsonify({"success": True, "education": new_education})


# Social links endpoints
@app.route('/get-social-links', methods=['GET'])
def get_social_links():
    social_links = SocialLink.query.all()
    return jsonify([l.as_dict() for l in social_links])

@app.route('/update-social-links', methods=['POST'])
def update_social_links():
    new_links = request.json
    if not isinstance(new_links, list):
        return jsonify({"error": "Social links must be a list"}), 400
    SocialLink.query.delete()
    for link in new_links:
        db.session.add(SocialLink(platform=link['platform'], url=link['url'], icon=link['icon']))
    db.session.commit()
    return jsonify({"success": True, "social_links": new_links})


# Contact form endpoint (replaces Formspree)
@app.route('/contact', methods=['POST'])
def contact():
    form_data = request.json
    if not form_data:
        return jsonify({"error": "No form data provided"}), 400
    db.session.add(ContactMessage(
        name=form_data.get('name'),
        email=form_data.get('email'),
        message=form_data.get('message')
    ))
    db.session.commit()
    return jsonify({"success": True, "message": "Message sent successfully!"})

def model_as_dict(self):
    return {c.name: getattr(self, c.name) for c in self.__table__.columns}

for cls in [Profile, Skill, Project, Education, SocialLink, ContactMessage]:
    cls.as_dict = model_as_dict

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=port)
