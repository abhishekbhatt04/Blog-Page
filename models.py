from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
import os

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    is_admin = db.Column(db.Boolean, default=False)
    date_joined = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(100), nullable=False)
    image_filename = db.Column(db.String(255))  # Store image filename
    date_posted = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def has_image(self):
        return self.image_filename is not None
    
    def get_image_url(self):
        if self.image_filename:
            return f'/static/uploads/{self.image_filename}'
        return None
    
    def delete_image(self):
        if self.image_filename:
            image_path = os.path.join('static/uploads', self.image_filename)
            if os.path.exists(image_path):
                os.remove(image_path)
    
    def __repr__(self):
        return f"Post('{self.title}', '{self.date_posted}')"