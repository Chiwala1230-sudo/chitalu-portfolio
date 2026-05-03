// Portfolio JavaScript - Fully Connected to Live Backend
// Backend hosted on Deno Deploy

// ===== BACKEND CONFIGURATION =====
// Live production backend URL
const BACKEND_URL = 'https://chitalu-portfolio.chiwala1230-sudo.deno.net';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    console.log('🚀 Portfolio loaded - Backend URL:', BACKEND_URL);
    
    // ===== SKILLS DATA =====
    const skillsList = [
        "JavaScript (ES6+)", "React", "HTML5/CSS3", "MongoDB",
        "PostgreSQL", "MySQL", "C++", "Git & GitHub",
        "Full-Stack Development", "Problem Solving", "Debugging"
    ];
    
    // Render skills
    const skillsContainer = document.getElementById('skillsContainer');
    if (skillsContainer) {
        skillsContainer.innerHTML = skillsList.map(skill => 
            `<span class="skill-chip">${skill}</span>`
        ).join('');
        console.log('✅ Skills loaded:', skillsList.length);
    }
    
    // ===== PROJECTS DATA =====
    const projectsData = [
        {
            title: "📘 Grade 7 Study Game",
            status: "Live",
            description: "Interactive educational game for grade 7 students, covering math & science topics. Deployed on Netlify and Vercel.",
            tech: ["React", "CSS", "Vercel", "Netlify"],
            liveUrl: "https://grade7-game.netlify.app",
            githubUrl: "https://github.com/Chiwala1230-sudo/study-game-backend-1"
        },
        {
            title: "🎓 Uni Learning Platform",
            status: "In Progress",
            description: "Central hub for past exam questions, study notes & materials for university students.",
            tech: ["MERN", "PostgreSQL", "Tailwind"],
            liveUrl: null,
            githubUrl: "https://github.com/Chiwala1230-sudo"
        },
        {
            title: "📅 Event Management System",
            status: null,
            description: "Complete event scheduling, ticket tracking and attendee management solution for local organizers.",
            tech: ["React", "Node.js", "MongoDB", "Express"],
            liveUrl: null,
            githubUrl: "https://github.com/Chiwala1230-sudo"
        },
        {
            title: "🏦 ZRA Tax System Clone",
            status: null,
            description: "Prototype inspired by Zambia Revenue Authority features: tax calculation, filing simulation and dashboards.",
            tech: ["JavaScript", "PostgreSQL", "HTML/CSS", "Chart.js"],
            liveUrl: null,
            githubUrl: "https://github.com/Chiwala1230-sudo"
        },
        {
            title: "🌍 Multilingual Translator",
            status: null,
            description: "Web app supporting real-time translation between 10+ languages, using external API and modern UI.",
            tech: ["React", "Axios", "CSS"],
            liveUrl: null,
            githubUrl: "https://github.com/Chiwala1230-sudo"
        },
        {
            title: "⛅ Weather Web App",
            status: null,
            description: "Real-time weather dashboard with 5-day forecast, search by city, dynamic backgrounds.",
            tech: ["JavaScript", "OpenWeather API", "CSS Grid"],
            liveUrl: null,
            githubUrl: "https://github.com/Chiwala1230-sudo"
        }
    ];
    
    // Render projects
    const projectsContainer = document.getElementById('projectsContainer');
    if (projectsContainer) {
        projectsContainer.innerHTML = projectsData.map(project => {
            // Generate tech stack spans
            const techSpans = project.tech.map(tech => `<span>${tech}</span>`).join('');
            
            // Generate links HTML
            let linksHTML = '';
            if (project.liveUrl) {
                linksHTML += `<a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-external-link-alt"></i> View Live
                </a>`;
            }
            if (project.githubUrl) {
                linksHTML += `<a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-github"></i> GitHub
                </a>`;
            }
            
            // Status badge
            const statusBadge = project.status ? `<span class="project-badge">${project.status}</span>` : '';
            
            return `
                <div class="project-card">
                    <div class="project-title">
                        ${project.title} ${statusBadge}
                    </div>
                    <div class="project-desc">${project.description}</div>
                    <div class="tech-stack">${techSpans}</div>
                    <div class="project-links">${linksHTML || '<span style="color: #4a5568;">Coming soon</span>'}</div>
                </div>
            `;
        }).join('');
        console.log('✅ Projects loaded:', projectsData.length);
    }
    
    // ===== CONTACT FORM HANDLER (Connected to Live Backend) =====
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const nameInput = document.getElementById('contactName');
            const emailInput = document.getElementById('contactEmail');
            const messageInput = document.getElementById('contactMessage');
            const feedback = document.getElementById('formFeedback');
            
            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';
            
            // Client-side validation
            if (!name || name.length < 2) {
                showFeedback(feedback, '❌ Please enter your full name (minimum 2 characters)', 'error');
                nameInput?.focus();
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                showFeedback(feedback, '❌ Please enter a valid email address (e.g., name@example.com)', 'error');
                emailInput?.focus();
                return;
            }
            
            if (!message || message.length < 10) {
                showFeedback(feedback, '❌ Please enter a message (minimum 10 characters)', 'error');
                messageInput?.focus();
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                console.log('📡 Sending to backend:', BACKEND_URL);
                
                // Send data to backend
                const response = await fetch(`${BACKEND_URL}/api/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, message })
                });
                
                const data = await response.json();
                console.log('📬 Response:', data);
                
                if (response.ok && data.success) {
                    // Success!
                    showFeedback(feedback, '✓ Message sent successfully! I will get back to you soon.', 'success');
                    contactForm.reset();
                    
                    // Clear success message after 5 seconds
                    setTimeout(() => {
                        if (feedback) feedback.style.display = 'none';
                    }, 5000);
                } else {
                    // Backend returned an error
                    const errorMsg = data.error || data.message || 'Failed to send message';
                    showFeedback(feedback, `❌ ${errorMsg}`, 'error');
                }
                
            } catch (error) {
                console.error('❌ Connection error:', error);
                
                showFeedback(
                    feedback, 
                    '❌ Cannot connect to server. Please try again later.', 
                    'error'
                );
                
            } finally {
                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Helper function for feedback messages
    function showFeedback(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.style.display = 'block';
        element.style.color = type === 'success' ? '#86EFAC' : '#F97316';
        
        // Auto-hide after 4 seconds for errors
        if (type === 'error') {
            setTimeout(() => {
                if (element && element.style.display !== 'none') {
                    element.style.opacity = '0';
                    setTimeout(() => {
                        if (element) element.style.display = 'none';
                        if (element) element.style.opacity = '1';
                    }, 300);
                }
            }, 4000);
        }
    }
    
    // ===== CHECK BACKEND HEALTH ON LOAD =====
    async function checkBackendStatus() {
        try {
            console.log('🔍 Checking backend health...');
            const response = await fetch(`${BACKEND_URL}/api/health`);
            const data = await response.json();
            if (response.ok) {
                console.log('✅ Backend connected successfully:', data);
            } else {
                console.warn('⚠️ Backend responded but with error');
            }
        } catch (error) {
            console.warn('⚠️ Backend connection issue:', error.message);
        }
    }
    checkBackendStatus();
    
    // ===== MOBILE MENU TOGGLE =====
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNavLinks');
    
    if (mobileBtn && mobileNav) {
        mobileBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close mobile menu when clicking a link
        const mobileLinks = mobileNav.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                const icon = mobileBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
    
    // ===== SMOOTH SCROLLING FOR NAVIGATION =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === "#" || href === "") return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // ===== SCROLL REVEAL ANIMATIONS =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Animate elements when they come into view
    const animatedElements = document.querySelectorAll('.project-card, .hack-card, .about-text, .contact-wrapper');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    // Also animate hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        heroContent.style.transition = 'all 0.8s ease';
        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 100);
    }
    
    console.log('✅ Portfolio website loaded successfully!');
    console.log('📧 Contact form connected to:', BACKEND_URL);
});