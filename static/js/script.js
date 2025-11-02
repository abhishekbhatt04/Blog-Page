// Blog application JavaScript with enhanced features
document.addEventListener('DOMContentLoaded', function() {
    console.log('BlogSphere loaded successfully!');
    
    // Initialize all features
    initAutoResizeTextareas();
    initDeleteConfirmations();
    initFlashMessages();
    initFormValidation();
    initLoadingStates();
    initCharacterCounter();
    initImageUploadPreview();
    initAnimations();
    initPasswordToggle();
    initSmoothScrolling();
    initKeyboardShortcuts();
});

// Auto-resize textareas
function initAutoResizeTextareas() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        // Set initial height
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
        
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });
}

// Enhanced delete confirmation
function initDeleteConfirmations() {
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const postTitle = this.closest('.post-card')?.querySelector('.post-title')?.textContent || 
                            this.closest('.single-post')?.querySelector('h1')?.textContent ||
                            'this post';
            
            if (!confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
                e.preventDefault();
            }
        });
    });
}

// Flash message auto-hide with animation
function initFlashMessages() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: auto;
            color: inherit;
        `;
        closeBtn.addEventListener('click', () => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 500);
        });
        
        alert.style.display = 'flex';
        alert.appendChild(closeBtn);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 500);
            }
        }, 5000);
    });
}

// Form validation enhancement
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const inputs = this.querySelectorAll('input[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    showFieldError(input, 'This field is required');
                } else {
                    clearFieldError(input);
                }
            });
            
            // Validate file size
            const fileInputs = this.querySelectorAll('input[type="file"]');
            fileInputs.forEach(input => {
                if (input.files.length > 0) {
                    const file = input.files[0];
                    const maxSize = 16 * 1024 * 1024; // 16MB
                    
                    if (file.size > maxSize) {
                        isValid = false;
                        showFieldError(input, 'File size must be less than 16MB');
                    } else {
                        clearFieldError(input);
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showNotification('Please fix the errors in the form.', 'error');
            }
        });
    });
}

function showFieldError(input, message) {
    clearFieldError(input);
    input.style.borderColor = '#ef4444';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        font-weight: 500;
    `;
    
    input.parentNode.appendChild(errorDiv);
}

function clearFieldError(input) {
    input.style.borderColor = '';
    const existingError = input.parentNode.querySelector('.error');
    if (existingError) {
        existingError.remove();
    }
}

// Loading states for buttons
function initLoadingStates() {
    const submitButtons = document.querySelectorAll('button[type="submit"]');
    submitButtons.forEach(button => {
        button.addEventListener('click', function() {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            this.disabled = true;
            
            // Revert after 5 seconds if still on page (form submission failed)
            setTimeout(() => {
                if (this.disabled) {
                    this.innerHTML = originalText;
                    this.disabled = false;
                    showNotification('Submission timed out. Please try again.', 'error');
                }
            }, 5000);
        });
    });
}

// Character counter for textareas
function initCharacterCounter() {
    const contentTextarea = document.getElementById('content');
    if (contentTextarea) {
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.style.cssText = `
            text-align: right;
            margin-top: 0.5rem;
            color: #6b7280;
            font-size: 0.875rem;
            font-weight: 500;
        `;
        
        contentTextarea.parentNode.appendChild(counter);
        
        function updateCounter() {
            const length = contentTextarea.value.length;
            const wordCount = contentTextarea.value.trim() ? contentTextarea.value.trim().split(/\s+/).length : 0;
            
            counter.innerHTML = `
                <span style="color: ${getColorForLength(length)}">
                    ${length} characters
                </span>
                <span style="margin-left: 1rem; color: #9ca3af">
                    ${wordCount} words
                </span>
            `;
        }
        
        function getColorForLength(length) {
            if (length < 50) return '#ef4444';
            if (length < 100) return '#f59e0b';
            return '#10b981';
        }
        
        contentTextarea.addEventListener('input', updateCounter);
        updateCounter(); // Initial count
    }
}

// Image upload preview
function initImageUploadPreview() {
    const fileInputs = document.querySelectorAll('.file-upload-input');
    
    fileInputs.forEach(input => {
        const display = input.nextElementSibling;
        const preview = display.querySelector('.file-upload-preview');
        
        input.addEventListener('change', function(e) {
            const file = this.files[0];
            if (file) {
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    showNotification('Please select a valid image file (JPG, PNG, GIF, WebP).', 'error');
                    this.value = '';
                    return;
                }
                
                // Validate file size
                const maxSize = 16 * 1024 * 1024; // 16MB
                if (file.size > maxSize) {
                    showNotification('File size must be less than 16MB.', 'error');
                    this.value = '';
                    return;
                }
                
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Remove existing preview if any
                    const existingImg = preview.querySelector('img');
                    if (existingImg) {
                        existingImg.remove();
                    }
                    
                    // Create new image preview
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.cssText = `
                        width: 100%;
                        max-height: 200px;
                        object-fit: cover;
                        border-radius: 8px;
                        margin-bottom: 1rem;
                    `;
                    
                    // Update text
                    const text = preview.querySelector('span');
                    const small = preview.querySelector('small');
                    if (text) text.textContent = file.name;
                    if (small) small.textContent = `Size: ${(file.size / 1024 / 1024).toFixed(2)}MB | Type: ${file.type.split('/')[1].toUpperCase()}`;
                    
                    preview.prepend(img);
                    preview.classList.add('has-image');
                    
                    showNotification('Image selected successfully!', 'success');
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        // Drag and drop support
        display.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--primary-color)';
            this.style.background = 'rgba(102, 126, 234, 0.1)';
        });
        
        display.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--border-color)';
            this.style.background = 'var(--bg-light)';
        });
        
        display.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--border-color)';
            this.style.background = 'var(--bg-light)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                input.files = files;
                input.dispatchEvent(new Event('change'));
            }
        });
    });
}

// Animations
function initAnimations() {
    // Add fade-in animation to posts
    const posts = document.querySelectorAll('.post-card');
    posts.forEach((post, index) => {
        post.style.opacity = '0';
        post.style.transform = 'translateY(30px)';
        post.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            post.style.opacity = '1';
            post.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.post-card, .feature-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Password visibility toggle
function initPasswordToggle() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        toggleBtn.style.cssText = `
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            font-size: 1rem;
            z-index: 3;
        `;
        
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        wrapper.appendChild(toggleBtn);
        
        toggleBtn.addEventListener('click', function() {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    });
}

// Smooth scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl + N for new post (when not in input field)
        if (e.ctrlKey && e.key === 'n' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            e.preventDefault();
            const newPostBtn = document.querySelector('a[href*="create"]');
            if (newPostBtn) newPostBtn.click();
        }
        
        // Escape key to go back
        if (e.key === 'Escape') {
            if (document.referrer && !window.location.href.includes('/create')) {
                window.history.back();
            }
        }
        
        // Ctrl + / for help
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            showNotification('Keyboard shortcuts: Ctrl+N (New Post), Escape (Go Back)', 'info');
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
        <span style="flex: 1; text-align: left;">${message}</span>
        <button style="background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-left: 1rem; color: inherit;">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Add close functionality
    const closeBtn = notification.querySelector('button');
    closeBtn.addEventListener('click', () => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }
    }, 5000);
}

// Add CSS for animations
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .fa-spinner {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize animation styles
addAnimationStyles();

// Image optimization helper
function optimizeImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(function(blob) {
                    resolve(blob);
                }, 'image/jpeg', quality);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Utility function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
initLazyLoading();

// Enhanced error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    showNotification('An error occurred. Please check the console for details.', 'error');
});

// Performance monitoring
window.addEventListener('load', function() {
    // Log performance metrics
    if (window.performance) {
        const perfData = window.performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
        
        if (loadTime > 3000) {
            console.warn('Page load time is slow. Consider optimizing images and assets.');
        }
    }
});

// Export functions for global access (if needed)
window.BlogApp = {
    showNotification,
    optimizeImage,
    formatFileSize
};
