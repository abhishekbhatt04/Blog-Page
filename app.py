from flask import Flask, render_template, request, redirect, url_for, flash
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.utils import secure_filename
from PIL import Image
import os
import uuid

from models import db, Post, User
from config import Config
from forms import LoginForm, RegisterForm, PostForm

app = Flask(__name__)
app.config.from_object(Config)
Config.init_app(app)

# Initialize extensions
db.init_app(app)

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def save_image(image_file):
    if image_file and allowed_file(image_file.filename):
        # Generate unique filename
        file_ext = image_file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{file_ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Resize and save image
        image = Image.open(image_file)
        
        # Resize to max 1200px width while maintaining aspect ratio
        max_size = (1200, 1200)
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'P'):
            image = image.convert('RGB')
        
        # Save optimized image
        image.save(filepath, 'JPEG', quality=85, optimize=True)
        
        return filename
    return None

# Create tables and admin user
with app.app_context():
    # Drop all tables and recreate them
    db.drop_all()
    db.create_all()
    
    # Create admin user if not exists
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', email='admin@blog.com', is_admin=True)
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("✅ Database created successfully!")
        print("✅ Admin user created:")
        print("   Username: admin")
        print("   Password: admin123")

@app.route('/')
def index():
    posts = Post.query.order_by(Post.date_posted.desc()).all()
    return render_template('index.html', posts=posts)

@app.route('/post/<int:post_id>')
def post(post_id):
    post = Post.query.get_or_404(post_id)
    return render_template('post.html', post=post)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            flash(f'Welcome back, {user.username}!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('index'))
        else:
            flash('Login failed. Check username and password.', 'error')
    
    return render_template('login.html', form=form)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    form = RegisterForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Registration successful! You can now login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

@app.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    if not current_user.is_admin:
        flash('Only administrators can create posts.', 'error')
        return redirect(url_for('index'))
    
    form = PostForm()
    if form.validate_on_submit():
        # Handle image upload
        image_filename = None
        if form.image.data:
            image_filename = save_image(form.image.data)
            if not image_filename:
                flash('Invalid image file. Please try again.', 'error')
                return render_template('create.html', form=form)
        
        post = Post(
            title=form.title.data,
            content=form.content.data,
            author=form.author.data,
            image_filename=image_filename
        )
        db.session.add(post)
        db.session.commit()
        flash('Post created successfully!', 'success')
        return redirect(url_for('index'))
    
    return render_template('create.html', form=form)

@app.route('/edit/<int:post_id>', methods=['GET', 'POST'])
@login_required
def edit(post_id):
    if not current_user.is_admin:
        flash('Only administrators can edit posts.', 'error')
        return redirect(url_for('index'))
    
    post = Post.query.get_or_404(post_id)
    form = PostForm()
    
    if form.validate_on_submit():
        # Handle image upload
        if form.image.data:
            # Delete old image if exists
            post.delete_image()
            # Save new image
            image_filename = save_image(form.image.data)
            if image_filename:
                post.image_filename = image_filename
            else:
                flash('Invalid image file. Please try again.', 'error')
                return render_template('edit.html', form=form, post=post)
        
        post.title = form.title.data
        post.content = form.content.data
        post.author = form.author.data
        db.session.commit()
        flash('Post updated successfully!', 'success')
        return redirect(url_for('post', post_id=post.id))
    elif request.method == 'GET':
        form.title.data = post.title
        form.content.data = post.content
        form.author.data = post.author
    
    return render_template('edit.html', form=form, post=post)

@app.route('/delete/<int:post_id>')
@login_required
def delete(post_id):
    if not current_user.is_admin:
        flash('Only administrators can delete posts.', 'error')
        return redirect(url_for('index'))
    
    post = Post.query.get_or_404(post_id)
    # Delete associated image
    post.delete_image()
    db.session.delete(post)
    db.session.commit()
    flash('Post deleted successfully!', 'success')
    return redirect(url_for('index'))

@app.route('/remove-image/<int:post_id>')
@login_required
def remove_image(post_id):
    if not current_user.is_admin:
        flash('Only administrators can modify posts.', 'error')
        return redirect(url_for('index'))
    
    post = Post.query.get_or_404(post_id)
    post.delete_image()
    post.image_filename = None
    db.session.commit()
    flash('Image removed successfully!', 'success')
    return redirect(url_for('edit', post_id=post.id))

if __name__ == '__main__':
    app.run(debug=True)