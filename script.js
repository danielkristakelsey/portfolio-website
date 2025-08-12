// Tab Navigation Functionality
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Tab switching function with smooth scroll
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
        
        // Smooth scroll to top when switching tabs
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Store active tab in localStorage
        localStorage.setItem('activeTab', targetTab);
        
        // Re-trigger animations for newly visible elements
        setTimeout(() => {
            const newElements = targetContent.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right');
            newElements.forEach(el => {
                observer.observe(el);
            });
        }, 100);
    }

    // Add click event listeners to navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Restore active tab from localStorage or default to 'home'
    let savedTab = localStorage.getItem('activeTab') || 'home';
    
    // Handle legacy "projects" tab name
    if (savedTab === 'projects') {
        savedTab = 'technical-projects';
        localStorage.setItem('activeTab', savedTab);
    }
    
    switchTab(savedTab);

    // Enhanced smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
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

    // Global scroll management system
    let currentScrollableElement = null;
    let isModalOpen = false;

    function setupGlobalScrollManagement() {
        document.addEventListener('wheel', function(e) {
            // If a modal is open, handle scrolling differently
            if (isModalOpen) {
                const activeModal = document.querySelector('.project-modal.active');
                if (!activeModal) return;
                
                const modalOverlay = activeModal;
                const modalContent = activeModal.querySelector('.modal-content');
                
                // Check if cursor is over modal content area
                if (modalContent) {
                    const modalRect = modalContent.getBoundingClientRect();
                    const isOverModal = e.clientX >= modalRect.left && e.clientX <= modalRect.right && 
                                      e.clientY >= modalRect.top && e.clientY <= modalRect.bottom;
                    
                    if (isOverModal) {
                        // Allow natural scrolling within modal content - don't prevent default
                        return;
                    }
                }
                
                // If scrolling outside modal, prevent it to keep focus on modal
                e.preventDefault();
                return;
            }
            
            // Default behavior - let page scroll normally when no modal is open
        }, { passive: false });
    }

    // Track when modals open/close
    function setModalState(open) {
        isModalOpen = open;
    }

    // Enhanced Intersection Observer for smooth animations with fade in/out
    // Disable complex animations on mobile to prevent stuck states
    const isMobile = window.innerWidth <= 768;
    
    const observerOptions = {
        threshold: isMobile ? 0.05 : 0.1,
        rootMargin: isMobile ? '0px 0px -20px 0px' : '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                // On mobile, keep elements visible once seen to prevent animation issues
                if (!isMobile) {
                    entry.target.classList.remove('visible');
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation with staggered delays
    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right');
    fadeElements.forEach((el, index) => {
        // Add stagger delay to elements with stagger-animation class
        if (el.classList.contains('stagger-animation')) {
            el.style.setProperty('--stagger-delay', `${index * 100}ms`);
        }
        
        // On mobile, use observer with simpler animations, on desktop use full animations
        observer.observe(el);
    });

    // Handle staggered animations for grouped elements
    const staggerGroups = document.querySelectorAll('.hero-stats, .about-grid, .timeline, .projects-grid, .education-skills');
    staggerGroups.forEach(group => {
        const children = group.querySelectorAll('.stagger-animation');
        children.forEach((child, index) => {
            child.style.setProperty('--stagger-delay', `${index * 150}ms`);
        });
    });

    // Special handling for stats in hero section
    const heroStats = document.querySelectorAll('.stat');
    heroStats.forEach((stat, index) => {
        stat.classList.add('fade-in', 'stagger-animation');
        stat.style.setProperty('--stagger-delay', `${(index * 200) + 400}ms`);
        
        // Use observer for both mobile and desktop with appropriate animations
        observer.observe(stat);
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

    // Project data for modals
    const projectData = {
        'Stellar Population Detection Using Lévy α-stable Distributions': {
            title: 'Stellar Population Detection Using Lévy α-stable Distributions',
            tags: ['Python', 'MCMC', 'Statistical Analysis', 'Published Research'],
            description: `This groundbreaking research project developed an advanced statistical modeling pipeline using Lévy α-stable distributions and Markov Chain Monte Carlo (MCMC) methods to extract faint-signal stellar populations from noisy astronomical data.

The pipeline achieved a remarkable 2x improvement in detection sensitivity compared to traditional methods, enabling the discovery of previously undetectable stellar populations in deep astronomical surveys. The methodology was rigorously validated across multiple independent datasets to ensure robust and reproducible results.

As fourth author, I contributed to Section 5 (Bayesian methodology validation) and the entire Appendix (mathematical framework), developing the core statistical modeling techniques that enabled this breakthrough.

Key innovations include:
• Implementation of heavy-tailed Lévy α-stable distributions for modeling astronomical noise
• Development of custom MCMC samplers optimized for high-dimensional parameter spaces  
• Creation of automated validation frameworks for cross-dataset verification
• Integration with existing astronomical data reduction pipelines

This work has direct applications in galaxy evolution studies, stellar formation research, and cosmological surveys, providing astronomers with more powerful tools to probe the faint edges of the universe.`,
            media: 'Published research paper available below. Read the full paper to explore the methodology and findings in detail.',
            achievements: ['Published in The Astronomical Journal (2025)', 'Fourth Author - Section 5 & Appendix', 'NASA Fellowship Recognition'],
            hasPDF: true,
            pdfPath: './Technical Projects/Luber_2025_AJ_170_59.pdf',
            hasExternalLink: true,
            externalLink: 'https://iopscience.iop.org/article/10.3847/1538-3881/add2f2',
            externalLinkText: 'View Published Paper'
        },
        'Characterization of the Source Confusion in the CHILES Con Pol Ultra Deep Radio Continuum': {
            title: 'Characterization of the Source Confusion in the CHILES Con Pol Ultra Deep Radio Continuum',
            tags: ['Python', 'Radio Astronomy', 'Statistical Analysis', 'Honors Thesis'],
            description: `Senior honors thesis analyzing source confusion in ultra-deep radio continuum observations from the CHILES (Continuum Halos in Nearby Galaxies) Con Pol survey. This comprehensive investigation developed sophisticated methods to characterize noise levels and source detection limits in the deepest radio survey data.

The project achieved precision measurements down to 1.3 μJy beam⁻¹, establishing new benchmarks for noise characterization in radio astronomical datasets. This work directly contributed to improving the reliability and sensitivity of radio continuum source detection.

Research methodology:
• Advanced statistical analysis of source confusion noise in ultra-deep radio data
• Development of algorithms to separate true astronomical signals from instrumental artifacts
• Characterization of detection limits and completeness functions
• Cross-validation with independent radio survey datasets
• Integration with existing radio astronomy data reduction pipelines

The thesis work provides crucial insights for future radio surveys and has applications in galaxy evolution studies, cosmological research, and radio source population studies. The improved noise characterization techniques developed have been adopted by the broader radio astronomy community.`,
            media: 'Complete honors thesis document available below with detailed methodology, results, and analysis.',
            achievements: ['Honors Thesis - May 2023', 'Ultra-deep Radio Analysis', 'Microjansky Precision'],
            hasPDF: true,
            pdfPath: './Technical Projects/Honors Thesis - Characterization CHILES Con Pol.pdf'
        },
        'SDSS-IV DR17: Radial Relationships between Dust Attenuation and Dust Kinematics': {
            title: 'SDSS-IV DR17: Radial Relationships between Dust Attenuation and Dust Kinematics',
            tags: ['Python', 'Marvin', 'Galaxy Analysis', 'MaNGA Survey'],
            description: `Comprehensive analysis of galaxy properties using SDSS-IV Data Release 17 and MaNGA (Mapping Nearby Galaxies at Apache Point Observatory) integral field spectroscopy data. This project investigated spatial correlations between dust attenuation and gas kinematics using advanced spectroscopic techniques.

The research utilized the Marvin analysis framework to process large-scale galaxy survey data, examining how dust properties vary across galactic environments and correlate with stellar and gas dynamics.

Technical approach:
• Processing and analysis of MaNGA integral field spectroscopy datacubes
• Balmer decrement measurements across spatially resolved galaxy maps
• Statistical modeling of radial dust attenuation profiles
• Kinematic analysis of gas motion and stellar dynamics
• Cross-correlation studies between dust and kinematic properties
• Data validation using independent photometric and spectroscopic surveys

This work contributes to our understanding of dust physics in galaxies and how environmental factors influence dust distribution and dynamics. The findings have implications for galaxy evolution models and dust correction techniques in astronomical observations.`,
            media: 'Complete project report with detailed analysis and results available in the PDF below.',
            achievements: ['SDSS-IV DR17 Analysis', 'Spatial Dust Mapping', 'Kinematic Correlations'],
            hasPDF: true,
            pdfPath: './Technical Projects/SDSS-IV DR17.pdf'
        },
        'Relationships Between Dust Attenuation, Stellar Mass, and Star Formation Rate': {
            title: 'Relationships Between Dust Attenuation, Stellar Mass, and Star Formation Rate',
            tags: ['Python', 'Statistical Modeling', 'Galaxy Evolution', 'Astrophysics'],
            description: `Investigation of fundamental scaling relationships in galaxy evolution, analyzing how dust attenuation correlates with stellar mass and star formation activity across diverse galactic environments. This project applies advanced statistical methods to understand the physical processes governing galaxy properties.

The research explores the complex interplay between stellar content, active star formation, and dust obscuration, providing insights into galaxy evolution mechanisms and environmental effects on galactic development.

Research components:
• Statistical analysis of large galaxy samples from multiple surveys
• Development of scaling relationship models for galaxy properties
• Multi-parameter correlation analysis using advanced statistical techniques
• Cross-validation with theoretical galaxy evolution models
• Investigation of environmental dependencies and selection effects
• Comparative analysis across different galaxy populations and redshift ranges

The findings contribute to our understanding of how galaxies form and evolve, particularly regarding the role of dust in regulating star formation and the observational signatures of galaxy evolution processes. This work has direct applications in galaxy survey analysis and cosmological modeling.`,
            media: 'Detailed analysis report with statistical models and findings available in the PDF below.',
            achievements: ['Galaxy Scaling Relations', 'Multi-parameter Analysis', 'Evolution Studies'],
            hasPDF: true,
            pdfPath: './Technical Projects/Relationships Between Dust Attenuation, Stellar Mass, and Star Formation Rate.pdf'
        },
        'Stellar Structure Project: Metal Fraction Effects on Stellar Properties': {
            title: 'Stellar Structure Project: Metal Fraction Effects on Stellar Properties',
            tags: ['Stellar Physics', 'Computational Modeling', 'Mathematical Analysis', 'Astrophysics'],
            description: `Computational study examining how metallicity (metal fraction) affects stellar structure and evolution throughout a star's lifetime. This project utilizes stellar structure modeling code to investigate fundamental physics governing stellar properties and evolutionary pathways.

The research analyzes how variations in metal content influence core properties, mass-luminosity relationships, stellar lifetimes, and evolutionary endpoints, providing insights into stellar physics and galactic chemical evolution.

Computational methods:
• Implementation and modification of stellar structure modeling code
• Systematic parameter studies across metallicity ranges
• Analysis of stellar evolution tracks and isochrones
• Investigation of convective processes and energy transport
• Modeling of stellar atmosphere properties and observable characteristics
• Comparison with observational stellar populations and theoretical predictions

This work enhances our understanding of stellar physics and has applications in stellar population synthesis, galactic archaeology, and interpretation of stellar observations across cosmic time. The results inform models of galactic chemical evolution and provide context for exoplanet host star properties.`,
            media: 'Complete project report with computational methods, results, and stellar evolution analysis available below.',
            achievements: ['Stellar Structure Modeling', 'Metallicity Effects', 'Mass-Luminosity Relations'],
            hasPDF: true,
            pdfPath: './Technical Projects/Stellar_Structure_Project.pdf'
        },
        'Statistical Modeling Pipeline for Astronomical Data': {
            title: 'Statistical Modeling Pipeline for Astronomical Data',
            tags: ['Python', 'MCMC', 'Statistical Analysis', 'Astrophysics'],
            description: `This groundbreaking research project developed an advanced statistical modeling pipeline using Lévy α-stable distributions and Markov Chain Monte Carlo (MCMC) methods to extract faint-signal stellar populations from noisy astronomical data.

The pipeline achieved a remarkable 2x improvement in detection sensitivity compared to traditional methods, enabling the discovery of previously undetectable stellar populations in deep astronomical surveys. The methodology was rigorously validated across multiple independent datasets to ensure robust and reproducible results.

Key innovations include:
• Implementation of heavy-tailed Lévy α-stable distributions for modeling astronomical noise
• Development of custom MCMC samplers optimized for high-dimensional parameter spaces  
• Creation of automated validation frameworks for cross-dataset verification
• Integration with existing astronomical data reduction pipelines

This work has direct applications in galaxy evolution studies, stellar formation research, and cosmological surveys, providing astronomers with more powerful tools to probe the faint edges of the universe.`,
            media: 'Published research with code available on request. Methodology presented at multiple international conferences including the American Astronomical Society meetings.',
            achievements: ['Published in The Astronomical Journal (2025)', 'Presented at multiple research conferences', 'NASA Fellowship recipient for this work']
        },
        'DHS CISA Data Automation Suite': {
            title: 'DHS CISA Data Automation Suite',
            tags: ['Python', 'PowerShell', 'Power BI', 'VBA', 'Federal Consulting'],
            description: `Comprehensive automation and analytics suite developed for the Department of Homeland Security's Cybersecurity and Infrastructure Security Agency (CISA) School Safety Task Force.

This mission-critical project streamlined complex data workflows supporting federal school safety initiatives, reducing manual processing time by over 80% and enabling real-time decision making at the executive level.

Technical implementations include:
• Python-based data ingestion and processing pipelines handling multiple data formats
• PowerShell scripts for automated system integration and file management
• Advanced Power BI dashboards providing executive-level insights and federal leadership reporting
• VBA macro systems for legacy system integration and automated report generation
• Automated data validation and quality assurance workflows

The solution directly supports federal policy decisions and has been instrumental in improving the efficiency of critical safety assessments nationwide. All work adheres to federal security standards and data protection requirements.`,
            media: 'Deployed in production environment serving federal leadership. Dashboard systems actively used for policy decision making.',
            achievements: ['80%+ Processing Time Reduction', 'Federal Leadership Dashboard Implementation', 'Mission-Critical System Deployment']
        },
        'CHILES Con Pol Dataset Reconstruction': {
            title: 'CHILES Con Pol Dataset Reconstruction',
            tags: ['Python', 'Fourier Analysis', 'Gaussian Methods', 'Radio Astronomy'],
            description: `Advanced algorithmic reconstruction of the CHILES (Continuum Halos in Nearby Galaxies) Con Pol astronomical dataset to characterize source confusion noise and reveal underlying data artifacts with unprecedented precision.

This technical achievement involved sophisticated mathematical modeling to disentangle true astronomical signals from instrumental and environmental noise sources, achieving precision measurements down to 1.3 μJy beam⁻¹.

Methodological approaches:
• Fourier domain analysis for frequency-space noise characterization
• Multi-scale Gaussian decomposition for source separation
• Statistical modeling of confusion noise from overlapping sources
• Development of corrective algorithms for systematic bias removal
• Cross-validation using independent radio survey data

The reconstructed dataset provides the astronomical community with a cleaner, more reliable foundation for studying faint radio continuum sources and has applications in galaxy evolution and cosmological research.`,
            media: 'Thesis work contributing to multiple publications. Dataset improvements adopted by international radio astronomy collaborations.',
            achievements: ['High-Precision Noise Characterization (1.3 μJy beam⁻¹)', 'Advanced Mathematical Modeling', 'International Collaboration Impact']
        },
        'Asian American Student Association Leadership': {
            title: 'Asian American Student Association Leadership',
            tags: ['Event Management', 'Budget Management', 'Team Leadership', 'Community Building'],
            description: `Comprehensive leadership role coordinating logistics and strategic initiatives for one of UMass Amherst's largest cultural organizations, directly impacting campus diversity and inclusion efforts.

Successfully managed large-scale cultural events and showcases that celebrated Asian heritage while fostering cross-cultural understanding and community engagement across the university.

Leadership accomplishments:
• Strategic fundraising initiatives securing over $50,000 in funding through sponsor partnerships, grant applications, and community outreach
• Budget optimization resulting in a 200% increase in available resources for programming
• Coordination of monthly cultural events and three major annual showcases
• Management and mentoring of 20+ executive board members
• Development of recruitment and onboarding processes for organizational sustainability
• Celebrity booking and high-profile partnership development
• Event logistics for gatherings attracting 10,000+ cumulative attendees

This experience developed crucial skills in stakeholder management, cultural competency, financial oversight, and community organizing that directly translate to professional consulting and project management roles.`,
            media: 'Featured in university publications and local media. Events documented across social media platforms with extensive community engagement.',
            achievements: ['$50K+ Funding Secured', '10,000+ Event Attendees', '200% Budget Increase', 'Team Leadership (20+ members)']
        },
        'Music Production Portfolio': {
            title: 'Music Production Portfolio',
            tags: ['Logic Pro', 'Audio Engineering', 'Composition', 'Creative Technology'],
            description: `<div class="project-intro">
<p>Comprehensive music production portfolio showcasing technical audio engineering expertise combined with creative composition across multiple genres and musical styles. This collection demonstrates proficiency in professional audio production workflows, from initial composition and arrangement through final mastering.</p>
</div>

<div class="concept-section">
<h3>🎵 Portfolio Overview</h3>
<p>The audio files in the player below represent various stages of the production process, including finished songs, mixed and mastered tracks, unmixed and unpolished demos, and creative examples. This range provides insight into different aspects of the creative and technical workflow spanning multiple genres from electronic and ambient compositions to more traditional arrangements.</p>
</div>

<div class="contributions-section">
<h3>⚡ Technical Capabilities</h3>
<div class="feature-grid">
<div class="feature-item">
<strong>Multi-track Production:</strong> Recording and editing in Logic Pro with advanced MIDI programming and sequencing
</div>
<div class="feature-item">
<strong>Professional Mixing:</strong> Advanced techniques including EQ, compression, spatial processing, and dynamic control
</div>
<div class="feature-item">
<strong>Sound Design:</strong> Original synthesis and sound creation for unique sonic textures and atmospheric elements
</div>
<div class="feature-item">
<strong>Audio Post-Production:</strong> Professional mastering workflows with industry-standard tools and techniques
</div>
<div class="feature-item">
<strong>Hybrid Production:</strong> Integration of live instrumentation with digital elements and virtual instruments
</div>
<div class="feature-item">
<strong>Collaborative Work:</strong> Production coordination with vocalists, instrumentalists, and other creative partners
</div>
</div>
</div>

<div class="summary-section">
<p><em>This portfolio showcases versatility and adaptability in creative technical problem-solving, demonstrating both artistic vision and technical proficiency across diverse musical contexts and production challenges.</em></p>
</div>`,
            media: 'Browse and listen to music compositions directly in the player below. New tracks added regularly.',
            achievements: ['Multi-Genre Compositions', 'Professional Audio Engineering', 'Creative Technical Innovation'],
            hasAudioPlayer: true,
            musicFiles: [
                // Latest Releases (New)
                { title: "Project 5zin (Master 2)", file: "Music/New/Project 5zin - Master 2.mp3", category: "Latest Releases", duration: "Unknown" },
                { title: "Project BH", file: "Music/New/Project BH.mp3", category: "Latest Releases", duration: "Unknown" },
                { title: "Project Circus (Master 2)", file: "Music/New/Project Circus - Master 2.mp3", category: "Latest Releases", duration: "Unknown" },
                { title: "Project Zah", file: "Music/New/Project Zah.mp3", category: "Latest Releases", duration: "Unknown" },
                { title: "Project bhhhh", file: "Music/New/Project bhhhh.mp3", category: "Latest Releases", duration: "Unknown" },
                { title: "Project disgust", file: "Music/New/Project disgust.mp3", category: "Latest Releases", duration: "Unknown" },
                { title: "Project gizzzz", file: "Music/New/Project gizzzz.mp3", category: "Latest Releases", duration: "Unknown" },
                { title: "Project grease", file: "Music/New/Project grease.mp3", category: "Latest Releases", duration: "Unknown" },
                
                // Classic Trap
                { title: "Ghost Instrumental", file: "Music/Classic Trap/Ghost Instrumental.mp3", category: "Classic Trap", duration: "Unknown" },
                { title: "Project Astro", file: "Music/Classic Trap/Project Astro .mp3", category: "Classic Trap", duration: "Unknown" },
                { title: "Project Curry", file: "Music/Classic Trap/Project Curry.mp3", category: "Classic Trap", duration: "Unknown" },
                { title: "Project Dark", file: "Music/Classic Trap/Project Dark.mp3", category: "Classic Trap", duration: "Unknown" },
                { title: "Project Deep", file: "Music/Classic Trap/Project Deep.mp3", category: "Classic Trap", duration: "Unknown" },
                { title: "Project Drunken", file: "Music/Classic Trap/Project Drunken.mp3", category: "Classic Trap", duration: "Unknown" },
                { title: "Project Electric", file: "Music/Classic Trap/Project Electric.mp3", category: "Classic Trap", duration: "Unknown" },
                { title: "Project More", file: "Music/Classic Trap/Project More.mp3", category: "Classic Trap", duration: "Unknown" },
                { title: "Project Overture", file: "Music/Classic Trap/Project Overture.mp3", category: "Classic Trap", duration: "Unknown" },
                { title: "Project Sprite", file: "Music/Classic Trap/Project Sprite.mp3", category: "Classic Trap", duration: "Unknown" },
                { title: "Project Trumpets Rev", file: "Music/Classic Trap/Project Trumpets Rev.mp3", category: "Classic Trap", duration: "Unknown" },
                
                // Electronic/EDM
                { title: "Project Arp", file: "Music/ElectronicEDM/Project Arp.mp3", category: "Electronic/EDM", duration: "Unknown" },
                { title: "Project FB2", file: "Music/ElectronicEDM/Project FB2.mp3", category: "Electronic/EDM", duration: "Unknown" },
                { title: "Project Fall", file: "Music/ElectronicEDM/Project Fall.mp3", category: "Electronic/EDM", duration: "Unknown" },
                { title: "Project House", file: "Music/ElectronicEDM/Project House.mp3", category: "Electronic/EDM", duration: "Unknown" },
                { title: "Project Stack", file: "Music/ElectronicEDM/Project Stack.mp3", category: "Electronic/EDM", duration: "Unknown" },
                { title: "Project IDK", file: "Music/ElectronicEDM/Project idk.mp3", category: "Electronic/EDM", duration: "Unknown" },
                
                // Pop/Indie
                { title: "Project 7", file: "Music/PopIndie/Project 7.mp3", category: "Pop/Indie", duration: "Unknown" },
                { title: "Project For Me", file: "Music/PopIndie/Project For Me.mp3", category: "Pop/Indie", duration: "Unknown" },
                { title: "Project Glass", file: "Music/PopIndie/Project Glass (1).mp3", category: "Pop/Indie", duration: "Unknown" },
                { title: "Project Kids", file: "Music/PopIndie/Project Kids.mp3", category: "Pop/Indie", duration: "Unknown" },
                { title: "Project Piano", file: "Music/PopIndie/Project Piano.mp3", category: "Pop/Indie", duration: "Unknown" },
                { title: "Project Pop", file: "Music/PopIndie/Project Pop.mp3", category: "Pop/Indie", duration: "Unknown" },
                { title: "Project Wooh", file: "Music/PopIndie/Project Wooh.mp3", category: "Pop/Indie", duration: "Unknown" },
                
                // Synth Trap
                { title: "Project 17", file: "Music/Synth Trap/Project 17.mp3", category: "Synth Trap", duration: "Unknown" },
                { title: "Project Bank (Mastered)", file: "Music/Synth Trap/Project Bank - mastered.mp3", category: "Synth Trap", duration: "Unknown" },
                { title: "Project Flying", file: "Music/Synth Trap/Project Flying.mp3", category: "Synth Trap", duration: "Unknown" },
                { title: "Project Mr Bourne", file: "Music/Synth Trap/Project Mr Bourne.mp3", category: "Synth Trap", duration: "Unknown" },
                { title: "Project Rapture", file: "Music/Synth Trap/Project Rapture.mp3", category: "Synth Trap", duration: "Unknown" },
                { title: "Project Sab", file: "Music/Synth Trap/Project Sab (1).mp3", category: "Synth Trap", duration: "Unknown" },
                { title: "Project TRAV", file: "Music/Synth Trap/Project TRAV_.mp3", category: "Synth Trap", duration: "Unknown" },
                { title: "Project Twee", file: "Music/Synth Trap/Project Twee.mp3", category: "Synth Trap", duration: "Unknown" },
                
                // Soundtrack/Game Music
                { title: "Intense Theme", file: "Music/Soundtrack/IntenseTheme.mp3", category: "Soundtrack", duration: "Unknown" },
                { title: "Main Menu 2", file: "Music/Soundtrack/MainMenu - 2.mp3", category: "Soundtrack", duration: "Unknown" },
                { title: "Output 2", file: "Music/Soundtrack/Output 2.mp3", category: "Soundtrack", duration: "Unknown" },
                { title: "Demo Trail 2 (Sound Vomit)", file: "Music/Soundtrack/demo trail 2 - sound vomit.mp3", category: "Soundtrack", duration: "Unknown" },
                
                // Older Works (2019)
                { title: "Project Chill", file: "Music/Old 2019/11. Project Chill.mp3", category: "Vintage (2019)", duration: "Unknown" },
                { title: "Project Frankenstein", file: "Music/Old 2019/2. Project Frankenstein.mp3", category: "Vintage (2019)", duration: "Unknown" },
                { title: "Project Hard", file: "Music/Old 2019/4. Project Hard.mp3", category: "Vintage (2019)", duration: "Unknown" },
                { title: "Project Record", file: "Music/Old 2019/6. Project Record.mp3", category: "Vintage (2019)", duration: "Unknown" },
                { title: "Project Beat", file: "Music/Old 2019/7. Project Beat.mp3", category: "Vintage (2019)", duration: "Unknown" },
                { title: "Interlude", file: "Music/Old 2019/Interlude.mp3", category: "Vintage (2019)", duration: "Unknown" },
                { title: "Manju Winter Ball 2023 (Final Master)", file: "Music/Old 2019/ManjuWinterBall2023 Final Master.mp3", category: "Vintage (2019)", duration: "Unknown" },
                { title: "Project Epic", file: "Music/Old 2019/Project Epic - 4_2_21, 4.55 PM.mp3", category: "Vintage (2019)", duration: "Unknown" },
                { title: "Project Tenzin (Master)", file: "Music/Old 2019/Project Tenzin - Master 1.mp3", category: "Vintage (2019)", duration: "Unknown" },
                
                // Works in Progress
                { title: "Project EDM", file: "Music/TBD/Project EDM.mp3", category: "Works in Progress", duration: "Unknown" },
                { title: "Project Guitar", file: "Music/TBD/Project Guitar.mp3", category: "Works in Progress", duration: "Unknown" },
                { title: "Project Inspo", file: "Music/TBD/Project Inspo.mp3", category: "Works in Progress", duration: "Unknown" },
                { title: "Project Intro", file: "Music/TBD/Project Intro.mp3", category: "Works in Progress", duration: "Unknown" },
                { title: "Project Pluck", file: "Music/TBD/Project Pluck.mp3", category: "Works in Progress", duration: "Unknown" },
                { title: "Project Reg", file: "Music/TBD/Project Reg.mp3", category: "Works in Progress", duration: "Unknown" },
                { title: "Project Steven Sample", file: "Music/TBD/Project StevenSample.mp3", category: "Works in Progress", duration: "Unknown" }
            ]
        },
        'Game Development Projects': {
            title: 'Game Development Projects',
            tags: ['Unity', 'Unreal Engine', 'Game Design', 'Interactive Media'],
            description: `Interactive game experiences that blend innovative mechanics with engaging storytelling, demonstrating proficiency in both technical implementation and creative design principles.

These projects explore the intersection of technology and player experience, utilizing modern game engines to create immersive and meaningful interactive content.

Development areas include:
• 3D environment design and optimization in Unity and Unreal Engine
• Gameplay programming and systems design
• User interface and user experience design for interactive media
• Physics simulation and procedural content generation
• Audio integration and dynamic soundscape design
• Performance optimization for multiple platforms

Projects range from experimental gameplay prototypes to more polished interactive experiences, each focusing on different aspects of game development and player engagement.`,
            media: 'Playable builds and development documentation available. Video demonstrations of key gameplay mechanics and systems.',
            achievements: ['Interactive Experience Design', 'Creative Technical Solutions', 'Multi-Platform Development']
        },
        'Published Music Profiles': {
            title: 'Published Music Profiles',
            tags: ['Music Distribution', 'Digital Marketing', 'Brand Development', 'Streaming Platforms'],
            description: `<div class="project-intro">
<p>Professional music publishing and distribution across major streaming platforms, building artist presence and engaging audiences through strategic content creation and brand development. This project showcases professional music releases distributed through major platforms including Spotify, Apple Music, Amazon Music, and dozens of other streaming services worldwide.</p>
</div>

<div class="concept-section">
<h3>🎯 Distribution Strategy</h3>
<p>Each release represents a complete production cycle from initial composition through final distribution, demonstrating end-to-end music industry knowledge and execution capabilities across multiple international markets and platforms.</p>
</div>

<div class="contributions-section">
<h3>⚡ Professional Implementation</h3>
<div class="feature-grid">
<div class="feature-item">
<strong>Production & Mastering:</strong> Professional music production and mastering specifically optimized for commercial distribution standards
</div>
<div class="feature-item">
<strong>Release Planning:</strong> Strategic release coordination with digital marketing campaigns and platform-specific optimization
</div>
<div class="feature-item">
<strong>Brand Development:</strong> Cross-platform artist identity creation with consistent visual and audio branding elements
</div>
<div class="feature-item">
<strong>Platform Optimization:</strong> Audience engagement strategies through streaming platform algorithms and discovery features
</div>
<div class="feature-item">
<strong>Revenue Generation:</strong> Monetization through digital music sales, streaming royalties, and licensing opportunities
</div>
<div class="feature-item">
<strong>Global Distribution:</strong> International distribution networks reaching worldwide audiences across diverse markets
</div>
</div>
</div>

<div class="summary-section">
<p><em>This comprehensive approach to music distribution demonstrates professional industry knowledge, strategic marketing acumen, and the ability to navigate complex digital music ecosystems for sustainable artistic career development.</em></p>
</div>`,
            media: 'Stream published music directly through the embedded players below, showcasing professionally distributed tracks available on all major platforms.',
            achievements: ['Multi-Platform Distribution', 'Professional Branding', 'Commercial Music Release'],
            hasMusicEmbeds: true,
            musicEmbeds: {
                spotify: {
                    title: 'Spotify',
                    code: '<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/2TQd5LtV4wFuxJ5xLkpWHw?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
                    color: '#1db954'
                },
                appleMusic: {
                    title: 'Apple Music',
                    code: '<div class="music-profile-link"><a href="https://music.apple.com/us/artist/dan-k-k/1495535263" target="_blank" rel="noopener noreferrer" class="profile-link-btn apple-music-btn"><div class="profile-icon">🎵</div><div class="profile-text"><div class="profile-name">Dan K-K</div><div class="profile-platform">Apple Music</div></div><div class="profile-arrow">→</div></a></div><div class="iframely-embed-fallback"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://music.apple.com/us/artist/dan-k-k/1495535263" data-iframely-url="//iframely.net/qBVeqvPH?card=small&theme=dark"></a></div></div>',
                    color: '#fc3c44'
                },
                youtubeMusic: {
                    title: 'YouTube Music',
                    code: '<div class="music-profile-link"><a href="https://www.youtube.com/channel/UCk92ydajLzLUQS_c1C-kYQQ" target="_blank" rel="noopener noreferrer" class="profile-link-btn youtube-music-btn"><div class="profile-icon">🎵</div><div class="profile-text"><div class="profile-name">Dan K-K</div><div class="profile-platform">YouTube Music</div></div><div class="profile-arrow">→</div></a></div><div class="iframely-embed-fallback"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://www.youtube.com/channel/UCk92ydajLzLUQS_c1C-kYQQ" data-iframely-url="//iframely.net/2ac3c9SM?theme=dark"></a></div></div>',
                    color: '#ff0000'
                }
            },
            additionalText: '+ dozens more streaming services.',
            needsIframelyScript: true
        },
        'Unreal Engine 5 Game Developer - Rogue Arcanists': {
            title: 'Unreal Engine 5 Game Developer - Rogue Arcanists',
            tags: ['Unreal Engine 5', 'Game Development', '3D Design', 'Blueprints', 'Gameplay Abilities'],
            description: `<div class="project-intro">
<p>Rogue Arcanists is an ambitious action RPG project built in Unreal Engine 5, combining rogue-like mechanics with immersive spellcasting gameplay. This project showcases advanced game development techniques using UE5's cutting-edge features and modern game design principles.</p>
</div>

<div class="concept-section">
<h3>🚧 Development Status</h3>
<p>Currently in active development with a timeline to be determined. The project represents a significant work-in-progress, with gameplay mechanics, story elements, and core systems being refined and expanded over time.</p>
</div>

<div class="contributions-section">
<h3>⚡ Technical Implementation</h3>
<div class="feature-grid">
<div class="feature-item">
<strong>Gameplay Ability System (GAS):</strong> Implemented advanced character abilities and spell mechanics using Unreal's Gameplay Ability System for scalable and modular gameplay features
</div>
<div class="feature-item">
<strong>GAS Companion Plugin:</strong> Integrated marketplace plugin for enhanced GAS functionality and streamlined ability management
</div>
<div class="feature-item">
<strong>Character Progression:</strong> Developed comprehensive attribute system with health, stamina, and stats management through structured data tables
</div>
<div class="feature-item">
<strong>Audio Integration:</strong> Professional audio implementation featuring dynamic soundscapes, ambient environmental audio, and interactive sound effects
</div>
<div class="feature-item">
<strong>Visual Effects:</strong> Extensive particle systems and magical effects using the FX Variety Pack for stunning spell visuals and environmental interactions
</div>
<div class="feature-item">
<strong>UI/UX Design:</strong> Custom user interfaces including main menus, pause systems, options menus, and in-game HUD with health/stamina displays
</div>
</div>
</div>

<div class="rob-section">
<h3>🎮 Key Features</h3>
<div class="feature-grid">
<div class="feature-item">
<strong>Action RPG Gameplay:</strong> Third-person action RPG gameplay with fluid character movement and combat systems
</div>
<div class="feature-item">
<strong>Magic System:</strong> Comprehensive magic system with diverse spell types including fire, lightning, water, and healing abilities
</div>
<div class="feature-item">
<strong>Particle Effects:</strong> Advanced particle effects for immersive magical combat and environmental interactions
</div>
<div class="feature-item">
<strong>Audio Design:</strong> Professional audio design with layered soundscapes and dynamic music integration
</div>
<div class="feature-item">
<strong>RPG Mechanics:</strong> Modular character attribute system supporting complex RPG mechanics
</div>
<div class="feature-item">
<strong>Game Systems:</strong> Loading screen system, seamless level transitions, and save/load functionality with persistent player progression
</div>
</div>
</div>

<div class="jackson-section">
<h3>🎨 Assets and Resources</h3>
<div class="feature-grid">
<div class="feature-item">
<strong>Audio Integration:</strong> Professional audio tracks integrated from personal music production portfolio
</div>
<div class="feature-item">
<strong>Visual Effects Library:</strong> High-quality visual effects and particle systems for magical abilities
</div>
<div class="feature-item">
<strong>Environment Assets:</strong> Stylized PBR nature assets for rich environmental design
</div>
<div class="feature-item">
<strong>Character Systems:</strong> Custom character blueprints with advanced animation systems
</div>
</div>
</div>

<div class="summary-section">
<p><em>The project demonstrates proficiency in modern game development workflows, from initial concept and technical design through implementation of complex gameplay systems. Each system is designed with scalability and modularity in mind, allowing for continuous expansion and refinement of the gaming experience.</em></p>
</div>`,
            media: 'Watch the gameplay development video below showcasing current progress and core mechanics in action. This video is a rough demonstration of the current game state with many implemented features mentioned, and awaiting other components waiting to be embedded.',
            achievements: ['UE5 Advanced Features Implementation', 'Gameplay Ability System Integration', 'Professional Audio Integration', 'Complex RPG Systems'],
            hasVideo: true,
            videoPath: './Videos/RogueArcanistsGame - Unreal Editor 2025-08-12 17-09-36.mp4'
        },
        'Unity Game Developer - Snackdown': {
            title: 'Unity Game Developer - Snackdown',
            tags: ['Unity', 'C# Programming', 'Game Design', 'UI/UX Development', 'Mobile Game Development'],
            description: `<div class="project-intro">
<p>Snackdown is an innovative mobile gacha-style tower defense game developed collaboratively with two talented partners: <strong>Rob Buthorn</strong> (Project Lead & Backend Developer) and <strong>Jackson Tatge</strong> (Graphic Designer & Game Designer). My primary role focuses on <strong>UI/UX development</strong>, with supportive contributions to backend architecture and audio creation.</p>
</div>

<div class="team-section">
<h3>🤝 Team Collaboration</h3>
<div class="team-grid">
<div class="team-member">
<h4>Rob Buthorn</h4>
<p class="role">Project Lead & Backend Developer</p>
<p class="sub-role">Core game systems, data management, gameplay mechanics, combat architecture, progression systems</p>
</div>
<div class="team-member">
<h4>Jackson Tatge</h4>
<p class="role">Graphic Design Artist & Game Designer</p>
<p class="sub-role">Visual assets, character designs, artistic direction, UI graphics, environment design</p>
</div>
<div class="team-member">
<h4>Dan Krista-Kelsey (Me)</h4>
<p class="role">Lead UI/UX Developer</p>
<p class="sub-role">Supporting Backend Developer & Audio Creator</p>
</div>
</div>
</div>

<div class="concept-section">
<h3>🎮 Game Concept</h3>
<p>Snackdown combines strategic tower defense gameplay with gacha collection mechanics, featuring anthropomorphic food characters as collectible defenders. Players build teams of culinary champions to defend against enemy waves across diverse food-themed environments.</p>
</div>

<div class="contributions-section">
<h3>⚡ My Technical Contributions</h3>

<div class="contribution-category">
<h4>UI/UX Development <span class="primary-tag">(Primary Role)</span></h4>
<div class="feature-grid">
<div class="feature-item">
<strong>Interface Design:</strong> Mobile-optimized user experience with comprehensive UI systems
</div>
<div class="feature-item">
<strong>Component Systems:</strong> Main menus, campaign navigation, character management interfaces
</div>
<div class="feature-item">
<strong>Modal Systems:</strong> Settings, character information, upgrade progression interfaces
</div>
<div class="feature-item">
<strong>Responsive Design:</strong> Optimal experience across different mobile device sizes
</div>
<div class="feature-item">
<strong>Scene Management:</strong> Loading screens, seamless transitions, bootstrap systems
</div>
<div class="feature-item">
<strong>Interactive Elements:</strong> Custom button animations and user feedback mechanisms
</div>
<div class="feature-item">
<strong>Performance:</strong> Mobile-optimized systems and persistent data management
</div>
</div>
</div>

<div class="contribution-category">
<h4>Backend Development Advisory</h4>
<div class="feature-grid">
<div class="feature-item">
<strong>Architecture Consultation:</strong> Provided strategic input on backend design decisions
</div>
<div class="feature-item">
<strong>Data Templates:</strong> Scriptable Object systems for modular character and level management
</div>
</div>
</div>

<div class="contribution-category">
<h4>Audio & Music Integration</h4>
<div class="feature-grid">
<div class="feature-item">
<strong>Original Compositions:</strong> Professional music tracks from personal portfolio
</div>
<div class="feature-item">
<strong>Dynamic Audio:</strong> Adaptive music systems and environmental sound design
</div>
<div class="feature-item">
<strong>Audio Feedback:</strong> Sound effects and user interaction audio implementation
</div>
<div class="feature-item">
<strong>Audio Management:</strong> Loading systems and seamless audio transitions
</div>
</div>
</div>
</div>

<div class="rob-section">
<h3>🔧 Technical Architecture <span class="contributor">(Rob's Implementation)</span></h3>
<div class="feature-grid">
<div class="feature-item">
<strong>Character Controller System:</strong> Modular architecture with state management (Idle, Deploy, Combat, Death) and animation integration
</div>
<div class="feature-item">
<strong>Combat Engine:</strong> Turn-based mechanics with complex damage calculations, status effects, buffs/debuffs, and special ability triggers
</div>
<div class="feature-item">
<strong>Progression Framework:</strong> Multi-tier character evolution system with experience tracking, level-based stat scaling, and upgrade trees
</div>
<div class="feature-item">
<strong>Database Architecture:</strong> SQLite integration for persistent character data, player progress, achievements, and game state management
</div>
<div class="feature-item">
<strong>Gacha System:</strong> Probability-based character acquisition with rarity tiers, pity mechanics, and reward distribution algorithms
</div>
<div class="feature-item">
<strong>Save/Load System:</strong> Comprehensive game state serialization with data integrity checks and version compatibility
</div>
<div class="feature-item">
<strong>Game Logic Core:</strong> Central game manager coordinating turn flow, resource management, and rule enforcement
</div>
<div class="feature-item">
<strong>AI Behavior:</strong> Enemy AI patterns with adaptive difficulty scaling and strategic decision-making algorithms
</div>
<div class="feature-item">
<strong>Performance Optimization:</strong> Memory management, object pooling, and efficient data structures for mobile platforms
</div>
</div>
</div>

<div class="jackson-section">
<h3>🎨 Creative Assets <span class="contributor">(Jackson's Design)</span></h3>
<div class="feature-grid">
<div class="feature-item">
<strong>Character Art Direction:</strong> Anthropomorphic food characters with unique personality designs, evolution stages, and ability-specific visual effects
</div>
<div class="feature-item">
<strong>Environment Design:</strong> Detailed campaign backgrounds including Berry Beach, Rocky Reef, Eastern & Western Villages with atmospheric depth
</div>
<div class="feature-item">
<strong>UI Visual Assets:</strong> Custom button designs, modal backgrounds, progress bars, and interactive element graphics throughout the game interface
</div>
<div class="feature-item">
<strong>Animation Graphics:</strong> Character state animations, ability effects, death sequences, and environmental particle systems
</div>
<div class="feature-item">
<strong>Typography System:</strong> Custom font implementation with multiple weight variations and stylized text treatments for different UI contexts
</div>
<div class="feature-item">
<strong>Icon Design:</strong> Comprehensive icon library for abilities, resources, menu navigation, and character attributes with consistent visual language
</div>
<div class="feature-item">
<strong>Branding & Identity:</strong> Game logo design, color palette development, and overall artistic vision establishing the "Snackdown" aesthetic
</div>
<div class="feature-item">
<strong>Campaign Visual Narrative:</strong> Chapter-specific art direction creating immersive food-themed worlds with consistent storytelling elements
</div>
</div>
</div>

<div class="summary-section">
<p><em>This collaborative project demonstrates advanced Unity development skills, clean architectural design, and effective team coordination. Each team member's specialized expertise contributes to creating a polished mobile gaming experience that showcases both technical proficiency and creative innovation.</em></p>
</div>`,
            media: 'Watch the gameplay development video below showcasing current UI/UX implementations, character systems, and collaborative development progress. This video demonstrates the current state of our team-developed mobile tower defense game.',
            achievements: ['Collaborative Team Development', 'Mobile-Optimized UI/UX Design', 'Unity C# Programming', 'Database Integration & Management'],
            hasVideo: true,
            videoPath: './Videos/First gacha game - InitScene - Windows, Mac, Linux - Unity 2022.3.1f1 _DX11_ 2025-08-12 17-28-57.mp4'
        },
        'Web Design & Development': {
            title: 'Web Design & Development',
            tags: ['AI-Assisted Development', 'Claude Code', 'Web Design', 'Learning & Innovation', 'Modern Development'],
            description: `<div class="project-intro">
<p>This portfolio website serves as a demonstration of <strong>AI-assisted development</strong> using <strong>Claude Code</strong> and AI agents to supplement traditional coding knowledge. The project showcases my interest in <strong>AI applications</strong> as a tool for learning, improving coding skills, and expanding technical capabilities beyond my educational background in astrophysics.</p>
</div>

<div class="concept-section">
<h3>🤖 AI-Assisted Development Philosophy</h3>
<p>By leveraging Claude Code as a development partner, this project demonstrates how AI can accelerate learning, provide real-time guidance, and enable exploration of new technologies. This approach allows for rapid skill acquisition while maintaining high-quality output and following modern development best practices.</p>
</div>

<div class="contributions-section">
<h3>⚡ Development Implementation</h3>
<div class="feature-grid">
<div class="feature-item">
<strong>AI-Guided Architecture:</strong> Utilized Claude Code agents for project structure planning, component design, and responsive layout implementation
</div>
<div class="feature-item">
<strong>Interactive Design:</strong> Modern UI/UX with smooth animations, modal systems, and seamless navigation enhanced through AI suggestions
</div>
<div class="feature-item">
<strong>Responsive Framework:</strong> Mobile-first design with advanced CSS Grid and Flexbox layouts optimized for all device sizes
</div>
<div class="feature-item">
<strong>Dynamic Content:</strong> JavaScript-powered features including audio players, video integration, and interactive project showcases
</div>
<div class="feature-item">
<strong>Performance Optimization:</strong> AI-assisted code optimization, efficient loading strategies, and cross-browser compatibility
</div>
<div class="feature-item">
<strong>Accessibility Standards:</strong> WCAG compliance with proper semantic HTML, ARIA labels, and keyboard navigation support
</div>
</div>
</div>

<div class="learning-section">
<h3>📚 Learning & Skill Development</h3>
<div class="feature-grid">
<div class="feature-item">
<strong>Technology Exploration:</strong> Hands-on experience with modern web technologies guided by AI-powered explanations and best practices
</div>
<div class="feature-item">
<strong>Problem-Solving Enhancement:</strong> AI collaboration for debugging, optimization, and implementing complex features beyond current knowledge
</div>
<div class="feature-item">
<strong>Industry Standards:</strong> Learning professional development workflows, version control, and deployment practices through AI mentorship
</div>
<div class="feature-item">
<strong>Rapid Prototyping:</strong> Quick iteration and testing of ideas with AI assistance for faster development cycles
</div>
</div>
</div>

<div class="summary-section">
<p><em>This project exemplifies how AI can serve as a powerful learning accelerator and development partner, enabling professionals to expand their technical horizons while maintaining quality and efficiency. It demonstrates the practical application of AI tools in bridging knowledge gaps and fostering continuous technical growth.</em></p>
</div>`,
            media: 'This website itself serves as a live demonstration of AI-assisted web development, showcasing modern design principles, responsive layouts, and interactive features built through collaborative AI development.',
            achievements: ['AI-Assisted Development', 'Modern Web Standards', 'Responsive Design', 'Continuous Learning'],
            hasLiveDemo: true,
            demoUrl: window.location.href
        }
    };

    // Global Music Manager - Single source of truth for music playback
    class GlobalMusicManager {
        constructor() {
            this.musicFiles = [];
            this.currentTrackIndex = 0;
            this.audio = new Audio();
            this.isPlaying = false;
            this.listeners = new Set();
            this.init();
        }

        init() {
            // Set initial volume
            this.audio.volume = 0.7;
            
            // Setup audio events
            this.audio.addEventListener('loadedmetadata', () => this.notifyListeners('loadedmetadata'));
            this.audio.addEventListener('timeupdate', () => this.notifyListeners('timeupdate'));
            this.audio.addEventListener('ended', () => this.nextTrack());
        }

        // Initialize with music data
        setMusicFiles(musicFiles) {
            this.musicFiles = musicFiles;
            this.notifyListeners('musicFilesUpdated');
        }

        // Register a player UI to receive updates
        addListener(listener) {
            this.listeners.add(listener);
        }

        removeListener(listener) {
            this.listeners.delete(listener);
        }

        notifyListeners(event, data = null) {
            this.listeners.forEach(listener => {
                if (listener.onMusicManagerEvent) {
                    listener.onMusicManagerEvent(event, data);
                }
            });
        }

        selectTrack(index) {
            if (index >= 0 && index < this.musicFiles.length) {
                this.currentTrackIndex = index;
                const track = this.musicFiles[index];
                this.audio.src = track.file;
                this.notifyListeners('trackChanged', { index, track });
            }
        }

        togglePlayPause() {
            if (this.musicFiles.length === 0) return;

            if (this.isPlaying) {
                this.audio.pause();
                this.isPlaying = false;
            } else {
                if (!this.audio.src) {
                    this.selectTrack(0);
                }
                this.audio.play();
                this.isPlaying = true;
            }
            this.notifyListeners('playStateChanged', { isPlaying: this.isPlaying });
        }

        nextTrack() {
            if (this.currentTrackIndex < this.musicFiles.length - 1) {
                this.selectTrack(this.currentTrackIndex + 1);
                if (this.isPlaying) {
                    this.audio.play();
                }
            } else {
                this.isPlaying = false;
                this.notifyListeners('playStateChanged', { isPlaying: false });
            }
        }

        prevTrack() {
            if (this.currentTrackIndex > 0) {
                this.selectTrack(this.currentTrackIndex - 1);
                if (this.isPlaying) {
                    this.audio.play();
                }
            }
        }

        seekTo(percent) {
            if (this.audio.duration) {
                this.audio.currentTime = percent * this.audio.duration;
            }
        }

        setVolume(volume) {
            this.audio.volume = volume;
        }

        getCurrentTrack() {
            if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.musicFiles.length) {
                return {
                    index: this.currentTrackIndex,
                    track: this.musicFiles[this.currentTrackIndex],
                    isPlaying: this.isPlaying,
                    currentTime: this.audio.currentTime || 0,
                    duration: this.audio.duration || 0
                };
            }
            return null;
        }

        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        destroy() {
            this.audio.pause();
            this.audio.src = '';
            this.listeners.clear();
        }
    }

    // Create global music manager instance
    const globalMusicManager = new GlobalMusicManager();

    // Audio Player UI Class - Now just a UI wrapper around the global manager
    class AudioPlayer {
        constructor(container, musicFiles, isModalPlayer = false) {
            this.container = container;
            this.isModalPlayer = isModalPlayer;
            
            // Register with global manager first
            globalMusicManager.addListener(this);
            
            // Initialize music files in global manager if needed
            if (musicFiles && musicFiles.length > 0 && globalMusicManager.musicFiles.length === 0) {
                globalMusicManager.setMusicFiles(musicFiles);
            }
            
            this.init();
        }

        init() {
            this.render();
            this.bindEvents();
            if (globalMusicManager.musicFiles.length > 0) {
                this.loadDurations();
            }
        }

        // Handle events from the global music manager
        onMusicManagerEvent(event, data) {
            switch (event) {
                case 'trackChanged':
                    this.updateCurrentTrack(data.index, data.track);
                    this.updatePlaylistActiveState(data.index);
                    break;
                case 'playStateChanged':
                    this.updatePlayPauseButton(data.isPlaying);
                    break;
                case 'timeupdate':
                    this.updateProgress();
                    break;
                case 'loadedmetadata':
                    this.updateTimeDisplay();
                    break;
                case 'musicFilesUpdated':
                    // Re-render with new music files if container is empty
                    const existingPlayer = this.container.querySelector('.audio-player');
                    if (!existingPlayer) {
                        this.render();
                        this.bindEvents();
                        this.loadDurations();
                    }
                    break;
            }
        }

        async loadDurations() {
            let loadedCount = 0;
            const totalTracks = globalMusicManager.musicFiles.length;
            
            // Update status indicator
            const updateStatus = () => {
                const durationStatus = this.container.querySelector('.duration-status');
                if (durationStatus) {
                    durationStatus.textContent = `Loading durations... (${loadedCount}/${totalTracks})`;
                }
            };

            // Load durations in batches to avoid overwhelming the browser
            const batchSize = 5;
            for (let i = 0; i < totalTracks; i += batchSize) {
                const batch = globalMusicManager.musicFiles.slice(i, i + batchSize);
                const batchPromises = batch.map((track, batchIndex) => {
                    const actualIndex = i + batchIndex;
                    return new Promise((resolve) => {
                        const tempAudio = new Audio();
                        const timeout = setTimeout(() => {
                            // Timeout after 10 seconds per track
                            loadedCount++;
                            updateStatus();
                            resolve();
                        }, 10000);

                        tempAudio.addEventListener('loadedmetadata', () => {
                            clearTimeout(timeout);
                            const duration = globalMusicManager.formatTime(tempAudio.duration);
                            globalMusicManager.musicFiles[actualIndex].duration = duration;
                            loadedCount++;
                            updateStatus();
                            resolve();
                        });
                        
                        tempAudio.addEventListener('error', () => {
                            clearTimeout(timeout);
                            // If file can't be loaded, keep "Unknown"
                            loadedCount++;
                            updateStatus();
                            resolve();
                        });
                        
                        tempAudio.src = track.file;
                        tempAudio.load(); // Force load metadata
                    });
                });

                await Promise.all(batchPromises);
                // Small delay between batches
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Re-render the playlist with updated durations
            this.updatePlaylistDurations();
        }

        updatePlaylistDurations() {
            // Hide loading indicator
            const durationStatus = this.container.querySelector('.duration-status');
            if (durationStatus) {
                durationStatus.style.display = 'none';
            }

            // Update the track count display
            const trackStats = this.container.querySelector('.track-stats');
            if (trackStats) {
                const totalTracks = trackStats.querySelector('.total-tracks');
                const genreCount = trackStats.querySelector('.genre-count');
                if (totalTracks) totalTracks.textContent = `${globalMusicManager.musicFiles.length} tracks`;
                if (genreCount) {
                    const categories = [...new Set(globalMusicManager.musicFiles.map(track => track.category))];
                    genreCount.textContent = `${categories.length} genres`;
                }
            }

            // Update individual track durations in the playlist
            globalMusicManager.musicFiles.forEach((track, index) => {
                const trackItem = this.container.querySelector(`[data-index="${index}"]`);
                if (trackItem) {
                    const durationElement = trackItem.querySelector('.track-duration') || trackItem.querySelector('.track-meta');
                    if (durationElement) {
                        if (durationElement.classList.contains('track-meta')) {
                            // For modern layout with category • duration format
                            durationElement.textContent = `${track.category} • ${track.duration}`;
                        } else {
                            // For simple duration display
                            durationElement.textContent = track.duration;
                        }
                    }
                }
            });

            console.log('✅ Audio durations loaded for', globalMusicManager.musicFiles.length, 'tracks');
        }

        render() {
            // Group music files by category
            const groupedMusic = globalMusicManager.musicFiles.length > 0 
                ? globalMusicManager.musicFiles.reduce((acc, track, index) => {
                    const category = track.category || 'Uncategorized';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push({ ...track, originalIndex: index });
                    return acc;
                }, {})
                : {};

            // Define custom order with Latest Releases first
            const categoryOrder = [
                'Latest Releases', 'Classic Trap', 'Electronic/EDM', 'Pop/Indie', 
                'Synth Trap', 'Soundtrack', 'Vintage (2019)', 'Works in Progress'
            ];

            // Sort categories according to custom order
            const sortedCategories = Object.entries(groupedMusic).sort((a, b) => {
                const indexA = categoryOrder.indexOf(a[0]);
                const indexB = categoryOrder.indexOf(b[0]);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });

            const audioPlayerHTML = `
                <div class="audio-player">
                    <div class="player-header">
                        <h4>🎵 Music Portfolio Player</h4>
                        <div class="track-stats">
                            <span class="total-tracks">${globalMusicManager.musicFiles.length} tracks</span>
                            <span class="genre-count">${Object.keys(groupedMusic).length} genres</span>
                            <span class="duration-status">Scanning durations...</span>
                        </div>
                    </div>
                    ${globalMusicManager.musicFiles.length > 0 ? `
                        <div class="current-track-display">
                            <div class="track-artwork">🎵</div>
                            <div class="track-details">
                                <div class="current-title">Select a track to play</div>
                                <div class="current-category"></div>
                            </div>
                        </div>
                        <div class="audio-controls-modern">
                            <button class="control-btn prev-btn" title="Previous">⏮</button>
                            <button class="control-btn play-pause-btn">▶️</button>
                            <button class="control-btn next-btn" title="Next">⏭</button>
                            <div class="progress-section">
                                <div class="progress-bar-container">
                                    <div class="progress-bar-modern">
                                        <div class="progress-fill-modern"></div>
                                        <div class="progress-thumb"></div>
                                    </div>
                                </div>
                                <div class="time-info">
                                    <span class="current-time">0:00</span>
                                    <span class="total-time">0:00</span>
                                </div>
                            </div>
                            <div class="volume-section">
                                <span class="volume-icon">🔊</span>
                                <input type="range" class="volume-slider-modern" min="0" max="100" value="70">
                            </div>
                        </div>
                        <div class="playlist-container">
                            ${sortedCategories.map(([category, tracks]) => `
                                <div class="category-section-modern">
                                    <div class="category-header-modern">
                                        <div class="category-info">
                                            <span class="category-icon">${category === 'Latest Releases' ? '🆕' : '🎵'}</span>
                                            <span class="category-name">${category}</span>
                                            <span class="track-count">${tracks.length}</span>
                                        </div>
                                        ${category === 'Latest Releases' ? '<span class="new-badge">NEW</span>' : ''}
                                    </div>
                                    <div class="tracks-list">
                                        ${tracks.map((track, idx) => `
                                            <div class="playlist-item-modern" data-index="${track.originalIndex}">
                                                <div class="track-number">${(idx + 1).toString().padStart(2, '0')}</div>
                                                <div class="track-info-modern">
                                                    <div class="track-title-modern">${track.title}</div>
                                                    <div class="track-meta">${track.category} • ${track.duration || 'Unknown'}</div>
                                                </div>
                                                <button class="play-btn-modern">▶️</button>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="playlist-container">
                            <div class="empty-state">
                                <div class="empty-icon">🎵</div>
                                <h4>Music files will be available soon!</h4>
                                <p>This player will showcase original compositions, productions, and collaborative works. Check back later for audio samples spanning multiple genres and production styles.</p>
                            </div>
                        </div>
                    `}
                </div>
            `;
            this.container.innerHTML += audioPlayerHTML;
        }

        bindEvents() {
            if (globalMusicManager.musicFiles.length === 0) return;

            const playPauseBtn = this.container.querySelector('.play-pause-btn');
            const prevBtn = this.container.querySelector('.prev-btn');
            const nextBtn = this.container.querySelector('.next-btn');
            const progressBar = this.container.querySelector('.progress-bar-modern');
            const volumeSlider = this.container.querySelector('.volume-slider-modern');
            const playlistItems = this.container.querySelectorAll('.playlist-item-modern');
            const playlistContainer = this.container.querySelector('.playlist-container');

            // Play/Pause button
            playPauseBtn?.addEventListener('click', () => globalMusicManager.togglePlayPause());

            // Previous/Next buttons
            prevBtn?.addEventListener('click', () => globalMusicManager.prevTrack());
            nextBtn?.addEventListener('click', () => globalMusicManager.nextTrack());

            // Progress bar click
            progressBar?.addEventListener('click', (e) => this.seekTo(e));

            // Volume control
            volumeSlider?.addEventListener('input', (e) => {
                globalMusicManager.setVolume(e.target.value / 100);
            });

            // Playlist items
            playlistItems.forEach((item) => {
                const index = parseInt(item.getAttribute('data-index'));
                item.addEventListener('click', () => globalMusicManager.selectTrack(index));
                const playBtn = item.querySelector('.play-btn-modern');
                playBtn?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    globalMusicManager.selectTrack(index);
                    globalMusicManager.togglePlayPause();
                });
            });

            // Mouse wheel scrolling for playlist
            playlistContainer?.addEventListener('wheel', (e) => {
                e.preventDefault();
                const scrollAmount = e.deltaY * 0.5;
                playlistContainer.scrollTop += scrollAmount;
            }, { passive: false });

            // Note: Audio events are now handled by the global manager
            // Set initial volume
            volumeSlider.value = 70;
        }

        // Update UI when track changes
        updateCurrentTrack(index, track) {
            const currentTitle = this.container.querySelector('.current-title');
            const currentCategory = this.container.querySelector('.current-category');
            
            if (currentTitle) {
                currentTitle.textContent = track.title;
            }
            if (currentCategory) {
                currentCategory.textContent = track.category || 'Uncategorized';
            }
        }

        // Update playlist active state
        updatePlaylistActiveState(index) {
            const playlistItems = this.container.querySelectorAll('.playlist-item-modern');
            playlistItems.forEach(item => item.classList.remove('active'));
            
            const targetItem = this.container.querySelector(`[data-index="${index}"]`);
            if (targetItem) {
                targetItem.classList.add('active');
            }
        }

        // Update play/pause button state
        updatePlayPauseButton(isPlaying) {
            const playPauseBtn = this.container.querySelector('.play-pause-btn');
            if (playPauseBtn) {
                playPauseBtn.textContent = isPlaying ? '⏸️' : '▶️';
            }
        }

        // These methods are now handled by the global manager
        // but we keep them for compatibility if called directly

        seekTo(e) {
            const progressBar = e.currentTarget;
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            globalMusicManager.seekTo(percent);
        }

        updateProgress() {
            const progressFill = this.container.querySelector('.progress-fill-modern');
            const currentTime = this.container.querySelector('.current-time');
            
            const currentTrack = globalMusicManager.getCurrentTrack();
            if (currentTrack && currentTrack.duration) {
                const percent = (currentTrack.currentTime / currentTrack.duration) * 100;
                if (progressFill) {
                    progressFill.style.width = percent + '%';
                }
                if (currentTime) {
                    currentTime.textContent = globalMusicManager.formatTime(currentTrack.currentTime);
                }
            }
        }

        updateTimeDisplay() {
            const totalTime = this.container.querySelector('.total-time');
            const currentTrack = globalMusicManager.getCurrentTrack();
            if (totalTime && currentTrack) {
                totalTime.textContent = globalMusicManager.formatTime(currentTrack.duration);
            }
        }

        destroy() {
            // Unregister from global manager
            globalMusicManager.removeListener(this);
        }
    }

    // Modal functionality
    function createModal(projectTitle) {
        console.log('Creating modal for:', projectTitle);
        
        // Close any existing modals first
        const existingModals = document.querySelectorAll('.project-modal');
        existingModals.forEach(existingModal => {
            closeModal(existingModal);
        });
        
        const project = projectData[projectTitle];
        if (!project) {
            console.error('Project not found:', projectTitle);
            console.log('Available projects:', Object.keys(projectData));
            return;
        }
        console.log('Project data found:', project.title);

        const modal = document.createElement('div');
        modal.className = 'project-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-header">
                    <h2>${project.title}</h2>
                    <div class="modal-tags">
                        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="modal-description">
                    ${project.description.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')}
                </div>
                <div class="modal-media">
                    <p>${project.media}</p>
                    ${project.hasExternalLink ? `
                        <div class="external-links">
                            <a href="${project.externalLink}" target="_blank" rel="noopener noreferrer" class="external-link-btn">
                                ${project.externalLinkText}
                            </a>
                        </div>
                    ` : ''}
                    ${project.hasMusicEmbeds ? `
                        <div class="music-embeds-section">
                            <h4>🎵 Listen on Streaming Platforms</h4>
                            <div class="music-embeds-grid">
                                ${Object.entries(project.musicEmbeds).map(([platform, embed]) => `
                                    <div class="music-embed-item" data-platform="${platform}">
                                        <h5 style="color: ${embed.color};">${embed.title}</h5>
                                        <div class="music-embed-container">
                                            ${embed.code}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <p class="streaming-services-text">${project.additionalText}</p>
                        </div>
                    ` : ''}
                    ${project.hasVideo ? `
                        <div class="video-section">
                            <div class="video-container">
                                <video controls preload="metadata" class="modal-video">
                                    <source src="${project.videoPath}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    ` : ''}
                    ${project.hasLiveDemo ? `
                        <div class="live-demo-section">
                            <div class="demo-container">
                                <h4>🌐 Live Demonstration</h4>
                                <p>You are currently viewing this project! This entire website serves as a live demonstration of the AI-assisted development process and modern web standards described above.</p>
                                <div class="demo-features">
                                    <div class="demo-feature">
                                        <strong>Interactive Elements:</strong> Navigate through different sections to see responsive design in action
                                    </div>
                                    <div class="demo-feature">
                                        <strong>Modal Systems:</strong> This very modal demonstrates the dynamic content system
                                    </div>
                                    <div class="demo-feature">
                                        <strong>Audio Integration:</strong> Visit the Music Production Portfolio for interactive audio player
                                    </div>
                                    <div class="demo-feature">
                                        <strong>Video Support:</strong> Game development videos showcase multimedia integration
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    ${project.hasPDF ? `
                        <div class="pdf-section">
                            <div class="pdf-controls">
                                <button class="pdf-btn" onclick="openPDFFullscreen('${project.pdfPath}')">
                                    📄 Open PDF Fullscreen
                                </button>
                                <a href="${project.pdfPath}" target="_blank" class="pdf-download-btn">
                                    📥 Download PDF
                                </a>
                            </div>
                            <div class="pdf-preview-container">
                                <iframe src="${project.pdfPath}#toolbar=0&navpanes=0&scrollbar=0" 
                                        class="modal-pdf-preview" 
                                        title="PDF Preview"
                                        loading="lazy"
                                        onload="this.style.opacity='1'"
                                        onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                                </iframe>
                                <div class="pdf-fallback" style="display: none;">
                                    <p>📄 PDF preview not available in this browser.</p>
                                    <p>Use the buttons above to open or download the document.</p>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-achievements">
                    ${project.achievements.map(achievement => `<span class="achievement">${achievement}</span>`).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add audio player if this is a music project
        if (project.hasAudioPlayer) {
            const modalContent = modal.querySelector('.modal-content');
            const audioPlayer = new AudioPlayer(modalContent, project.musicFiles || [], true);
            
            // Store reference to destroy on close
            modal.audioPlayer = audioPlayer;
        }

        // Load iframely script if needed for music embeds
        if (project.needsIframelyScript) {
            loadIframelyScript().then(() => {
                console.log('Iframely processing complete');
                // Additional processing with retry mechanism
                setTimeout(() => {
                    processIframelyEmbeds();
                }, 500);
            }).catch(error => {
                console.error('Error loading iframely:', error);
                // Fallback: try to process embeds anyway
                setTimeout(() => {
                    processIframelyEmbeds();
                }, 1000);
            });
        }

        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => closeModal(modal));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });

        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
            setModalState(true);
        }, 50);

        // Add keyboard event listener for escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal(modal);
            }
        };
        // Store handler reference for cleanup
        modal.escapeHandler = handleEscape;
        document.addEventListener('keydown', handleEscape);
    }

    function closeModal(modal) {
        // Clean up audio player if it exists
        if (modal.audioPlayer) {
            modal.audioPlayer.destroy();
        }
        
        // Remove any keyboard event listeners
        if (modal.escapeHandler) {
            document.removeEventListener('keydown', modal.escapeHandler);
        }
        
        setModalState(false);
        modal.classList.remove('active');
        
        // Remove modal immediately if it's being replaced, or with animation if user closed it
        const isBeingReplaced = document.querySelectorAll('.project-modal').length > 1;
        if (isBeingReplaced) {
            // Immediate removal when replacing
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        } else {
            // Animated removal when user closes
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }

    // Add click events to clickable project cards
    function initializeProjectCards() {
        const clickableCards = document.querySelectorAll('.clickable-card');
        console.log('Found clickable cards:', clickableCards.length);
        
        clickableCards.forEach((card, index) => {
            // Skip if already initialized
            if (card.dataset.initialized === 'true') {
                return;
            }
            
            const h3Element = card.querySelector('h3');
            if (h3Element) {
                const projectTitle = h3Element.textContent.trim();
                console.log(`Initializing card ${index}: "${projectTitle}"`);
                
                // Add visual feedback for clickable cards
                card.style.cursor = 'pointer';
                
                // Create a single click handler
                const clickHandler = function(e) {
                    e.stopPropagation();
                    console.log('Clicked on project:', projectTitle);
                    const project = projectData[projectTitle];
                    if (project) {
                        console.log('Found project data, creating modal');
                        createModal(projectTitle);
                    } else {
                        console.error('No project data found for:', projectTitle);
                        console.log('Available projects:', Object.keys(projectData));
                    }
                };
                
                const hoverInHandler = function() {
                    this.style.transform = 'translateY(-5px) scale(1.02)';
                };
                
                const hoverOutHandler = function() {
                    this.style.transform = 'translateY(0) scale(1)';
                };
                
                // Add event listeners with once option to prevent duplicates
                card.addEventListener('click', clickHandler);
                card.addEventListener('mouseenter', hoverInHandler);
                card.addEventListener('mouseleave', hoverOutHandler);
                
                // Mark as initialized
                card.dataset.initialized = 'true';
                
                // Store handlers for potential cleanup
                card._clickHandler = clickHandler;
                card._hoverInHandler = hoverInHandler;
                card._hoverOutHandler = hoverOutHandler;
            } else {
                console.warn('No h3 element found in card:', index);
            }
        });
    }
    
    // Initialize project cards
    initializeProjectCards();

    // Function to load iframely script for music embeds
    function loadIframelyScript() {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            const existingScript = document.querySelector('script[src*="iframely.net/embed.js"]');
            
            if (existingScript) {
                // Script already exists
                if (window.iframely && window.iframely.load) {
                    console.log('Iframely already loaded, processing embeds...');
                    // Use setTimeout to ensure DOM is ready
                    setTimeout(() => {
                        window.iframely.load();
                        resolve();
                    }, 100);
                } else {
                    // Script loaded but not ready, wait for it
                    existingScript.addEventListener('load', () => {
                        setTimeout(() => {
                            if (window.iframely && window.iframely.load) {
                                window.iframely.load();
                            }
                            resolve();
                        }, 100);
                    });
                }
                return;
            }

            // Create and load the script
            const script = document.createElement('script');
            script.src = 'https://iframely.net/embed.js';
            script.async = true;
            
            script.onload = function() {
                console.log('Iframely script loaded successfully');
                // Wait a bit for the script to initialize, then process embeds
                setTimeout(() => {
                    if (window.iframely && window.iframely.load) {
                        console.log('Processing iframely embeds...');
                        window.iframely.load();
                    }
                    resolve();
                }, 200);
            };
            
            script.onerror = function() {
                console.error('Failed to load iframely script');
                reject(new Error('Failed to load iframely script'));
            };
            
            document.head.appendChild(script);
        });
    }

    // Function to process iframely embeds with retry mechanism
    function processIframelyEmbeds() {
        const iframelyElements = document.querySelectorAll('.iframely-embed-fallback');
        console.log('Found iframely fallback elements:', iframelyElements.length);
        
        if (iframelyElements.length === 0) return;
        
        if (window.iframely) {
            console.log('Processing with iframely.load()');
            window.iframely.load();
            
            // Check if embeds loaded successfully after delay
            setTimeout(() => {
                iframelyElements.forEach((element, index) => {
                    const responsive = element.querySelector('.iframely-responsive');
                    if (responsive && responsive.children.length > 1) {
                        // Embed loaded successfully, show it and hide the profile link
                        console.log(`Embed ${index} loaded successfully`);
                        element.style.display = 'block';
                        const profileLink = element.previousElementSibling;
                        if (profileLink && profileLink.classList.contains('music-profile-link')) {
                            profileLink.style.display = 'none';
                        }
                    } else {
                        console.log(`Embed ${index} failed to load, keeping profile link`);
                        // Keep the profile link visible as fallback
                    }
                });
            }, 3000);
            
            // Retry mechanism
            setTimeout(() => {
                iframelyElements.forEach((element, index) => {
                    const responsive = element.querySelector('.iframely-responsive');
                    if (responsive && responsive.children.length === 1) {
                        // Only has the original link, try to force refresh
                        console.log(`Retrying embed ${index}`);
                        if (window.iframely && window.iframely.load) {
                            window.iframely.load();
                        }
                    }
                });
            }, 1000);
        } else {
            console.log('Iframely not available, using profile link fallback');
            // Profile links are already visible as the primary display method
        }
    }
    
    // Re-initialize when switching between project tabs to ensure events are bound
    const projectButtons = document.querySelectorAll('[data-tab="technical-projects"], [data-tab="creative-projects"]');
    projectButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Wait a bit for tab switch animation, then re-initialize
            setTimeout(() => {
                initializeProjectCards();
            }, 300);
        });
    });

    // Add hover effects to project cards (non-clickable ones)
    const projectCards = document.querySelectorAll('.project-card:not(.clickable-card)');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add hover effects to resume timeline items
    const timelineItems = document.querySelectorAll('.timeline-content');
    timelineItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.background = 'rgba(255, 255, 255, 0.08)';
            this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.background = 'rgba(255, 255, 255, 0.05)';
            this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });
    });

    // Add hover effects to degree card
    const degreeCards = document.querySelectorAll('.degree-card');
    degreeCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.background = 'rgba(255, 255, 255, 0.08)';
            this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.background = 'rgba(255, 255, 255, 0.05)';
            this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
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

    // Smooth scroll with momentum and easing for wheel events
    let isScrolling = false;
    let scrollVelocity = 0;
    let lastWheelTime = 0;

    function smoothScrollStep() {
        if (Math.abs(scrollVelocity) > 0.5) {
            window.scrollBy(0, scrollVelocity);
            scrollVelocity *= 0.95; // Easing factor
            requestAnimationFrame(smoothScrollStep);
        } else {
            isScrolling = false;
        }
    }

    window.addEventListener('wheel', function(e) {
        const now = performance.now();
        
        // Don't apply smooth scrolling if a modal is open
        if (isModalOpen) {
            return;
        }
        
        // Only apply custom smooth scrolling on desktop with good performance
        if (window.innerWidth > 768 && navigator.hardwareConcurrency >= 4) {
            e.preventDefault();
            
            // Add momentum with normal scroll speed
            scrollVelocity += e.deltaY * 0.8; // Increased from 0.3 to 0.8 for normal speed
            scrollVelocity = Math.max(-15, Math.min(15, scrollVelocity)); // Reduced limit for smoother control
            
            if (!isScrolling) {
                isScrolling = true;
                smoothScrollStep();
            }
        }
    }, { passive: false });

    // Initialize global scroll management
    setupGlobalScrollManagement();

    // Floating Music Player Implementation
    // Creates a toggleable music player that slides up from the bottom of the page
    // Synced with the music portfolio data and optimized for both desktop and mobile
    class FloatingMusicPlayer {
        constructor() {
            this.isVisible = false;
            this.audioPlayer = null;
            this.playerData = null;
            this.init();
        }

        init() {
            this.playerToggle = document.getElementById('music-player-toggle');
            this.playerContainer = document.getElementById('floating-music-player');
            this.playerContent = this.playerContainer.querySelector('.music-player-content');

            // Initialize player with music data from project
            this.playerData = projectData['Music Production Portfolio'];
            console.log('FloatingMusicPlayer init - playerData found:', !!this.playerData);
            console.log('FloatingMusicPlayer init - musicFiles count:', this.playerData?.musicFiles?.length || 0);
            
            if (this.playerData && this.playerData.musicFiles) {
                // Initialize global manager with music files first
                if (globalMusicManager.musicFiles.length === 0) {
                    console.log('Setting music files in global manager:', this.playerData.musicFiles.length);
                    globalMusicManager.setMusicFiles(this.playerData.musicFiles);
                } else {
                    console.log('Global manager already has music files:', globalMusicManager.musicFiles.length);
                }
                this.setupPlayer();
                this.bindEvents();
                
                // Ensure toggle is visible and properly styled
                this.playerToggle.style.display = 'block';
                this.playerToggle.style.visibility = 'visible';
                console.log('Music player setup complete, toggle should be visible');
            } else {
                console.warn('Music player data not found or musicFiles missing');
                console.log('Available project data keys:', Object.keys(projectData));
                // Hide toggle if no music data
                this.playerToggle.style.display = 'none';
            }
        }

        setupPlayer() {
            console.log('FloatingMusicPlayer setupPlayer called');
            console.log('playerContent element:', !!this.playerContent);
            console.log('musicFiles to pass:', this.playerData.musicFiles.length);
            
            // Create and insert the audio player (not a modal player)
            this.audioPlayer = new AudioPlayer(this.playerContent, this.playerData.musicFiles, false);
            
            // Customize the player for floating mode
            this.customizeFloatingPlayer();
            console.log('FloatingMusicPlayer setup completed');
        }

        customizeFloatingPlayer() {
            // Add floating player specific header
            const existingHeader = this.playerContent.querySelector('.player-header');
            if (existingHeader) {
                const headerTitle = existingHeader.querySelector('h4');
                if (headerTitle) {
                    headerTitle.textContent = '🎵 Portfolio Music Player';
                }
                
                // Add close button to header
                const closeBtn = document.createElement('button');
                closeBtn.className = 'floating-close-btn';
                closeBtn.innerHTML = '×';
                closeBtn.title = 'Minimize Player';
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.hide();
                });
                existingHeader.appendChild(closeBtn);
            }
        }

        bindEvents() {
            // Handle both click and touch events for mobile compatibility
            const toggleHandler = (e) => {
                e.stopPropagation(); // Prevent this from triggering document click handler
                e.preventDefault(); // Prevent double-tap zoom on mobile
                console.log('Music toggle activated, current visible:', this.isVisible);
                console.log('Global manager music files:', globalMusicManager.musicFiles.length);
                this.toggle();
            };
            
            this.playerToggle.addEventListener('click', toggleHandler);
            this.playerToggle.addEventListener('touchend', toggleHandler);

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isVisible) {
                    this.hide();
                }
            });

            // Prevent body scroll when player is open
            this.playerContainer.addEventListener('wheel', (e) => {
                e.stopPropagation();
            });

            // Click outside to close - set up document-wide click listener
            this.documentClickHandler = (e) => {
                if (this.isVisible) {
                    // Check if click is outside the player content and toggle button
                    const playerContent = this.playerContent;
                    const toggleButton = this.playerToggle;
                    
                    const isClickInsidePlayer = playerContent && playerContent.contains(e.target);
                    const isClickOnToggle = toggleButton && toggleButton.contains(e.target);
                    
                    console.log('Document click detected:', {
                        target: e.target.tagName,
                        isClickInsidePlayer,
                        isClickOnToggle,
                        playerVisible: this.isVisible
                    });
                    
                    // Close if click is outside both the player content and toggle button
                    if (!isClickInsidePlayer && !isClickOnToggle) {
                        console.log('Closing player due to outside click');
                        this.hide();
                    }
                }
            };
        }

        show() {
            this.isVisible = true;
            this.playerContainer.classList.add('active');
            this.playerToggle.classList.add('minimized');
            this.updateToggleText();
            
            // Prevent body scroll
            document.body.style.paddingBottom = '400px';
            
            // Announce to screen readers
            this.playerContainer.setAttribute('aria-hidden', 'false');
            
            // Add document click listener to close on outside click
            setTimeout(() => {
                document.addEventListener('click', this.documentClickHandler);
            }, 100); // Small delay to prevent immediate closure from the toggle click
        }

        hide() {
            this.isVisible = false;
            this.playerContainer.classList.remove('active');
            this.playerToggle.classList.remove('minimized');
            this.updateToggleText();
            
            // Restore body scroll
            document.body.style.paddingBottom = '';
            
            // Announce to screen readers
            this.playerContainer.setAttribute('aria-hidden', 'true');
            
            // Remove document click listener
            document.removeEventListener('click', this.documentClickHandler);
        }

        toggle() {
            if (this.isVisible) {
                this.hide();
            } else {
                this.show();
            }
        }

        updateToggleText() {
            const toggleText = this.playerToggle.querySelector('.toggle-text');
            const musicIcon = this.playerToggle.querySelector('.music-icon');
            
            if (this.isVisible) {
                toggleText.textContent = 'Minimize';
                musicIcon.textContent = '⏬';
                this.playerToggle.title = 'Minimize Music Player';
                this.playerToggle.setAttribute('aria-label', 'Minimize Music Player');
            } else {
                toggleText.textContent = 'Music';
                musicIcon.textContent = '🎵';
                this.playerToggle.title = 'Open Music Player';
                this.playerToggle.setAttribute('aria-label', 'Open Music Player');
            }
        }

        // Synchronize with modal player
        syncWithModalPlayer() {
            // This method can be called to sync playback state
            // if both players need to be synchronized
            // For now, we'll keep them independent to avoid conflicts
        }

        // Method to programmatically play a specific track
        playTrack(trackIndex) {
            if (trackIndex >= 0 && trackIndex < globalMusicManager.musicFiles.length) {
                globalMusicManager.selectTrack(trackIndex);
                globalMusicManager.togglePlayPause();
                if (!this.isVisible) {
                    this.show();
                }
            }
        }
        
        // Get current playing track info
        getCurrentTrack() {
            return globalMusicManager.getCurrentTrack();
        }
    }

    // Initialize floating music player
    const floatingMusicPlayer = new FloatingMusicPlayer();
    
    // Make it globally accessible for synchronization
    window.floatingMusicPlayer = floatingMusicPlayer;
});

// PDF Fullscreen Functionality
function openPDFFullscreen(pdfPath) {
    // Create fullscreen modal
    const modal = document.createElement('div');
    modal.className = 'pdf-fullscreen-modal';
    modal.innerHTML = `
        <button class="pdf-modal-close" onclick="closePDFFullscreen(this)">&times;</button>
        <iframe src="${pdfPath}" title="PDF Viewer"></iframe>
    `;
    
    document.body.appendChild(modal);
    
    // Trigger animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Close on escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closePDFFullscreen(modal.querySelector('.pdf-modal-close'));
        }
    };
    
    document.addEventListener('keydown', escapeHandler);
    modal.escapeHandler = escapeHandler;
}

function closePDFFullscreen(closeButton) {
    const modal = closeButton.closest('.pdf-fullscreen-modal');
    
    // Remove escape key listener
    if (modal.escapeHandler) {
        document.removeEventListener('keydown', modal.escapeHandler);
    }
    
    // Hide modal
    modal.classList.remove('active');
    
    // Remove modal from DOM after animation
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 300);
    
    // Restore body scroll
    document.body.style.overflow = '';
}