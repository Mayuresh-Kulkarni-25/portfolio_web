// Navigation functionality
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
  });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
  }
});

// Detect mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

// Optimize animations for mobile
const animationDuration = isMobile ? 1000 : 1500; // Shorter animations on mobile
const staggerDelay = isMobile ? 100 : 200; // Faster stagger on mobile

// CSS is already loaded via the link tag in HTML head


// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
      // Use smooth scrolling on desktop, instant on mobile for better performance
      if (isMobile) {
        target.scrollIntoView({ block: 'start' });
      } else {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});

let ticking = false;
function updateNavbar() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
  } else {
    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    navbar.style.boxShadow = 'none';
  }
  ticking = false;
}

// Navbar background on scroll (optimized for mobile)
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateNavbar);
    ticking = true;
  }
});

// Animate skill progress bars when they come into view
const observerOptions = {
  threshold: isMobile ? 0.05 : 0.1, // Lower threshold on mobile
  rootMargin: isMobile ? '0px 0px -50px 0px' : '0px 0px -100px 0px' // Smaller margin on mobile
};

// Track animation state
let hasAnimated = false;

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    console.log('Observer entry:', entry.target.className, 'isIntersecting:', entry.isIntersecting, 'intersectionRatio:', entry.intersectionRatio);
    
    if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
      if (entry.target.classList.contains('proficiency-section')) {
        console.log('Proficiency section detected, calling animateProgressBars');
        // Add a small delay to ensure the element is fully visible
        setTimeout(() => {
          animateProgressBars();
        }, 100);
      }
      
      // Add scroll animation class (only on desktop)
      if (!isMobile) {
        entry.target.classList.add('animate');
      }
    } else if (!entry.isIntersecting) {
      // When section goes out of view, reset animation state
      if (entry.target.classList.contains('proficiency-section')) {
        console.log('Proficiency section out of view, resetting animation state');
        hasAnimated = false;
        resetProgressBars();
      }
    }
  });
}, observerOptions);

// Mobile-specific optimizations
if (isMobile) {
  // Prevent zoom on form inputs
  document.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('focus', () => {
      input.style.fontSize = '16px';
    });
  });

  // Add touch feedback for buttons
  document.querySelectorAll('.btn, .skill-tag, .nav-link').forEach(element => {
    element.addEventListener('touchstart', () => {
      element.style.transform = 'scale(0.98)';
    });
    
    element.addEventListener('touchend', () => {
      element.style.transform = '';
    });
  });

  // Optimize scroll performance
  document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.nav-menu')) {
      e.preventDefault();
    }
  }, { passive: false });
}

// Observe elements for scroll animations
document.querySelectorAll('section, .skill-category, .education-item, .contact-item, .proficiency-section').forEach(el => {
  if (!isMobile) {
    el.classList.add('scroll-animate');
  }
  observer.observe(el);
});

// Reset progress bars to initial state
function resetProgressBars() {
  const progressBars = document.querySelectorAll('.skill-progress');
  
  progressBars.forEach((bar) => {
    // Remove any existing transitions to avoid animation
    bar.style.transition = 'none';
    bar.style.width = '0%';
    bar.classList.remove('animating');
    bar.style.boxShadow = 'none';
    
    // Reset percentage text (fixed selector)
    const percentage = bar.parentElement.nextElementSibling;
    if (percentage && percentage.classList.contains('skill-percentage')) {
      percentage.textContent = '0%';
    }
  });
}

// Animate progress bars
function animateProgressBars() {
  console.log('animateProgressBars function called');
  
  // Only animate if not already animated
  if (hasAnimated) {
    console.log('Animation already completed, skipping');
    return;
  }
  
  const progressBars = document.querySelectorAll('.skill-progress');
  console.log('Found progress bars:', progressBars.length);
  
  if (progressBars.length === 0) {
    console.log('No progress bars found!');
    return;
  }
  
  // Reset all bars first
  resetProgressBars();
  
  // Small delay to ensure reset is complete
  setTimeout(() => {
    progressBars.forEach((bar, index) => {
      const width = bar.getAttribute('data-width');
      const percentage = bar.parentElement.nextElementSibling; // Fixed: get the percentage element correctly
      
      console.log(`Progress bar ${index}: width=${width}%, percentage element found:`, !!percentage);
      
      if (!width) {
        console.log(`No data-width found for bar ${index}`);
        return;
      }
      
      // Stagger the animation with a delay
      setTimeout(() => {
        console.log(`Starting animation for bar ${index}`);
        // Add shimmer effect (only on desktop)
        if (!isMobile) {
          bar.classList.add('animating');
        }
        
        // Animate the progress bar
        bar.style.transition = `width ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        bar.style.width = width + '%';
        
        // Animate the percentage text
        if (percentage && percentage.classList.contains('skill-percentage')) {
          animatePercentage(percentage, 0, parseInt(width), animationDuration);
        }
        
        // Add a subtle pulse effect (only on desktop)
        if (!isMobile) {
          bar.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.3)';
          setTimeout(() => {
            bar.style.boxShadow = 'none';
          }, 200);
        }
        
        // Remove shimmer effect after animation (only on desktop)
        if (!isMobile) {
          setTimeout(() => {
            bar.classList.remove('animating');
          }, animationDuration);
        }
        
      }, index * staggerDelay); // Use mobile-optimized stagger delay
    });
    
    // Mark as animated after starting all animations
    hasAnimated = true;
  }, 100);
}

// Animate percentage text
function animatePercentage(element, start, end, duration) {
  const startTime = performance.now();
  
  function updatePercentage(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Use easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentValue = Math.round(start + (end - start) * easeOutQuart);
    
    element.textContent = currentValue + '%';
    
    if (progress < 1) {
      requestAnimationFrame(updatePercentage);
    }
  }
  
  requestAnimationFrame(updatePercentage);
}

// Contact form functionality
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Get form data
  const formData = new FormData(this);
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');
  
  // Simple validation
  if (!name || !email || !message) {
    showNotification('Please fill in all fields', 'error');
    return;
  }
  
  if (!isValidEmail(email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }
  
  // Simulate form submission
  showNotification('Thank you for your message! I will get back to you soon.', 'success');
  
  // Reset form
  this.reset();
  });
}

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;
  
  // Add styles if not already added
  if (!document.getElementById('notification-styles')) {
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
      }
      
      .notification.show {
        transform: translateX(0);
      }
      
      .notification-content {
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      
      .notification-message {
        flex: 1;
        font-weight: 500;
      }
      
      .notification-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6B7280;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .notification-success {
        border-left: 4px solid #10B981;
      }
      
      .notification-error {
        border-left: 4px solid #EF4444;
      }
      
      .notification-info {
        border-left: 4px solid #3B82F6;
      }
    `;
    document.head.appendChild(styles);
  }
  
  // Add to page
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    removeNotification(notification);
  }, 5000);
  
  // Close button functionality
  notification.querySelector('.notification-close').addEventListener('click', () => {
    removeNotification(notification);
  });
}

function removeNotification(notification) {
  notification.classList.remove('show');
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = '';
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Initialize typing animation when page loads
window.addEventListener('load', () => {
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    const originalText = heroTitle.textContent;
    typeWriter(heroTitle, originalText, 50);
  }
});

// Add hover effects to skill tags
document.querySelectorAll('.skill-tag').forEach(tag => {
  tag.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.05) rotate(2deg)';
  });
  
  tag.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1) rotate(0deg)';
  });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const heroContent = document.querySelector('.hero-content');
  
  if (heroContent) {
    const rate = scrolled * -0.5;
    heroContent.style.transform = `translateY(${rate}px)`;
  }
});

// Add click animation to buttons
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;
    
    // Add ripple animation styles if not already added
    if (!document.getElementById('ripple-styles')) {
      const styles = document.createElement('style');
      styles.id = 'ripple-styles';
      styles.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        .btn {
          position: relative;
          overflow: hidden;
        }
      `;
      document.head.appendChild(styles);
    }
    
    this.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

// Lazy loading for animations
const lazyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in-up');
      lazyObserver.unobserve(entry.target);
    }
  });
});

// Observe all sections for lazy animations
document.querySelectorAll('.skill-category, .education-item, .contact-item').forEach(el => {
  lazyObserver.observe(el);
});

console.log('Portfolio website loaded successfully! 🚀');