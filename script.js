// Tab Navigation Functionality
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Tab switching function
    function switchTab(targetTab) {
        // Remove active class from all buttons and tabs
        navButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active'));
        
        // Add active class to clicked button
        const targetButton = document.querySelector(`[data-tab="${targetTab}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
        
        // Show target tab content
        const targetContent = document.getElementById(`${targetTab}-tab`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Store active tab in localStorage
        localStorage.setItem('activeTab', targetTab);
    }

    // Add click event listeners to navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Restore active tab from localStorage or default to 'home'
    const savedTab = localStorage.getItem('activeTab') || 'home';
    switchTab(savedTab);

    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Floating Navigation with Auto-Hide (Cursor.com style)
    let lastScrollY = window.scrollY;
    let scrollTimeout = null;
    const navbar = document.querySelector('.navbar');

    function updateNavbar() {
        const currentScrollY = window.scrollY;
        const scrollDifference = Math.abs(currentScrollY - lastScrollY);
        
        // Add scrolled class for enhanced blur/shadow when scrolled
        if (currentScrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide navbar when scrolling down significantly and fast
        if (currentScrollY > lastScrollY && currentScrollY > 200 && scrollDifference > 5) {
            navbar.classList.add('hidden');
        } else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
            // Show navbar when scrolling up or at top
            navbar.classList.remove('hidden');
        }
        
        lastScrollY = currentScrollY;
        
        // Clear any existing timeout
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        
        // Auto-show navbar after user stops scrolling
        scrollTimeout = setTimeout(() => {
            if (navbar.classList.contains('hidden') && window.scrollY > 200) {
                // Keep it hidden if user is deep in content and stopped scrolling
                return;
            }
            navbar.classList.remove('hidden');
        }, 1500); // Show after 1.5s of no scrolling
    }

    window.addEventListener('scroll', updateNavbar, { passive: true });

    // Show navbar on mouse movement near top of screen
    window.addEventListener('mousemove', function(e) {
        if (e.clientY < 100 && navbar.classList.contains('hidden')) {
            navbar.classList.remove('hidden');
        }
    });

    // Show navbar on focus for accessibility
    navbar.addEventListener('focusin', function() {
        navbar.classList.remove('hidden');
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.about-card, .timeline-item, .project-card, .degree-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Typing animation for hero title
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) {
        const text = "Welcome to Dan KK's world.";
        let index = 0;
        
        // Start with just the cursor
        heroTitle.innerHTML = '<span class="typing-cursor">|</span>';
        
        function typeCharacter() {
            if (index < text.length) {
                const currentText = text.substring(0, index + 1);
                heroTitle.innerHTML = currentText + '<span class="typing-cursor">|</span>';
                index++;
                setTimeout(typeCharacter, 120); // 75% slower (was 30ms, now 120ms)
            }
            // After typing is complete, cursor continues blinking
        }
        
        // Start typing after 1 second delay
        setTimeout(typeCharacter, 1000);
    }

    // Add hover effects to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click-to-copy functionality for email
    const contactButton = document.querySelector('.contact-button');
    if (contactButton && contactButton.getAttribute('href').includes('mailto:')) {
        contactButton.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.getAttribute('href').replace('mailto:', '');
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(email).then(() => {
                    showToast('Email copied to clipboard!');
                    // Also open mailto link
                    window.location.href = this.getAttribute('href');
                });
            } else {
                // Fallback for browsers without clipboard API
                window.location.href = this.getAttribute('href');
            }
        });
    }

    // Toast notification function
    function showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        const currentActiveButton = document.querySelector('.nav-button.active');
        const allButtons = Array.from(navButtons);
        const currentIndex = allButtons.indexOf(currentActiveButton);
        
        let newIndex = currentIndex;
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : allButtons.length - 1;
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            newIndex = currentIndex < allButtons.length - 1 ? currentIndex + 1 : 0;
        }
        
        if (newIndex !== currentIndex) {
            const targetTab = allButtons[newIndex].getAttribute('data-tab');
            switchTab(targetTab);
        }
    });

    // Add performance optimization for animations
    let ticking = false;
    
    function updateAnimations() {
        // Update any scroll-based animations here
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateAnimations);
            ticking = true;
        }
    });

    // Add focus management for accessibility
    navButtons.forEach(button => {
        button.addEventListener('focus', function() {
            this.style.outline = '2px solid #6366f1';
            this.style.outlineOffset = '2px';
        });
        
        button.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
});