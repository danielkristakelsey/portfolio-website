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
                const modalContent = document.querySelector('.project-modal.active .modal-content');
                const playlistContainer = document.querySelector('.project-modal.active .playlist-container');
                
                if (modalContent) {
                    // Check if cursor is over the playlist container
                    if (playlistContainer) {
                        const rect = playlistContainer.getBoundingClientRect();
                        const isOverPlaylist = e.clientX >= rect.left && e.clientX <= rect.right && 
                                             e.clientY >= rect.top && e.clientY <= rect.bottom;
                        
                        if (isOverPlaylist) {
                            // Let playlist handle its own scrolling (already has wheel event)
                            return;
                        }
                    }
                    
                    // Check if cursor is over modal content
                    const modalRect = modalContent.getBoundingClientRect();
                    const isOverModal = e.clientX >= modalRect.left && e.clientX <= modalRect.right && 
                                      e.clientY >= modalRect.top && e.clientY <= modalRect.bottom;
                    
                    if (isOverModal) {
                        e.preventDefault();
                        const scrollAmount = e.deltaY * 0.8;
                        modalContent.scrollTop += scrollAmount;
                        return;
                    }
                }
            }
            
            // Default behavior - let page scroll normally
        }, { passive: false });
    }

    // Track when modals open/close
    function setModalState(open) {
        isModalOpen = open;
    }

    // Enhanced Intersection Observer for smooth animations with fade in/out
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                // Fade out when scrolling away (optional - creates cool effect)
                entry.target.classList.remove('visible');
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
            description: `Comprehensive music production portfolio showcasing technical audio engineering expertise combined with creative composition across multiple genres and musical styles.

This collection demonstrates proficiency in professional audio production workflows, from initial composition and arrangement through final mastering, utilizing industry-standard tools and techniques.

**Note:** The audio files in the player below represent various stages of the production process, including finished songs, mixed and mastered tracks, unmixed and unpolished demos, and creative examples. This range provides insight into different aspects of the creative and technical workflow.

Technical capabilities include:
• Multi-track recording and editing in Logic Pro with advanced MIDI programming
• Professional mixing techniques including EQ, compression, and spatial processing
• Sound design and synthesis for original sonic textures
• Audio post-production and mastering workflows
• Integration of live instrumentation with digital elements
• Collaborative production with vocalists and instrumentalists

The portfolio spans genres from electronic and ambient compositions to more traditional arrangements, showcasing versatility and adaptability in creative technical problem-solving.`,
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
        }
    };

    // Audio Player Class
    class AudioPlayer {
        constructor(container, musicFiles) {
            this.container = container;
            this.musicFiles = musicFiles;
            this.currentTrackIndex = 0;
            this.audio = new Audio();
            this.isPlaying = false;
            this.init();
        }

        init() {
            this.render();
            this.bindEvents();
            this.loadDurations();
        }

        async loadDurations() {
            let loadedCount = 0;
            const totalTracks = this.musicFiles.length;
            
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
                const batch = this.musicFiles.slice(i, i + batchSize);
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
                            const duration = this.formatTime(tempAudio.duration);
                            this.musicFiles[actualIndex].duration = duration;
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
                if (totalTracks) totalTracks.textContent = `${this.musicFiles.length} tracks`;
                if (genreCount) {
                    const categories = [...new Set(this.musicFiles.map(track => track.category))];
                    genreCount.textContent = `${categories.length} genres`;
                }
            }

            // Update individual track durations in the playlist
            this.musicFiles.forEach((track, index) => {
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

            console.log('✅ Audio durations loaded for', this.musicFiles.length, 'tracks');
        }

        render() {
            // Group music files by category
            const groupedMusic = this.musicFiles.length > 0 
                ? this.musicFiles.reduce((acc, track, index) => {
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
                            <span class="total-tracks">${this.musicFiles.length} tracks</span>
                            <span class="genre-count">${Object.keys(groupedMusic).length} genres</span>
                            <span class="duration-status">Scanning durations...</span>
                        </div>
                    </div>
                    ${this.musicFiles.length > 0 ? `
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
            if (this.musicFiles.length === 0) return;

            const playPauseBtn = this.container.querySelector('.play-pause-btn');
            const prevBtn = this.container.querySelector('.prev-btn');
            const nextBtn = this.container.querySelector('.next-btn');
            const progressBar = this.container.querySelector('.progress-bar-modern');
            const volumeSlider = this.container.querySelector('.volume-slider-modern');
            const playlistItems = this.container.querySelectorAll('.playlist-item-modern');
            const playlistContainer = this.container.querySelector('.playlist-container');

            // Play/Pause button
            playPauseBtn?.addEventListener('click', () => this.togglePlayPause());

            // Previous/Next buttons
            prevBtn?.addEventListener('click', () => this.prevTrack());
            nextBtn?.addEventListener('click', () => this.nextTrack());

            // Progress bar click
            progressBar?.addEventListener('click', (e) => this.seekTo(e));

            // Volume control
            volumeSlider?.addEventListener('input', (e) => {
                this.audio.volume = e.target.value / 100;
            });

            // Playlist items
            playlistItems.forEach((item) => {
                const index = parseInt(item.getAttribute('data-index'));
                item.addEventListener('click', () => this.selectTrack(index));
                const playBtn = item.querySelector('.play-btn-modern');
                playBtn?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectTrack(index);
                    this.togglePlayPause();
                });
            });

            // Mouse wheel scrolling for playlist
            playlistContainer?.addEventListener('wheel', (e) => {
                e.preventDefault();
                const scrollAmount = e.deltaY * 0.5;
                playlistContainer.scrollTop += scrollAmount;
            }, { passive: false });

            // Audio events
            this.audio.addEventListener('loadedmetadata', () => this.updateTimeDisplay());
            this.audio.addEventListener('timeupdate', () => this.updateProgress());
            this.audio.addEventListener('ended', () => this.nextTrack());

            // Set initial volume
            this.audio.volume = 0.7;
        }

        selectTrack(index) {
            this.currentTrackIndex = index;
            const track = this.musicFiles[index];
            this.audio.src = track.file;
            
            // Update current track display
            const currentTitle = this.container.querySelector('.current-title');
            const currentCategory = this.container.querySelector('.current-category');
            currentTitle.textContent = track.title;
            if (currentCategory) {
                currentCategory.textContent = track.category || 'Uncategorized';
            }

            // Update playlist active state
            const playlistItems = this.container.querySelectorAll('.playlist-item-modern');
            playlistItems.forEach(item => item.classList.remove('active'));
            
            // Find and activate the correct playlist item
            const targetItem = this.container.querySelector(`[data-index="${index}"]`);
            if (targetItem) {
                targetItem.classList.add('active');
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

        togglePlayPause() {
            if (this.musicFiles.length === 0) return;

            const playPauseBtn = this.container.querySelector('.play-pause-btn');
            
            if (this.isPlaying) {
                this.audio.pause();
                playPauseBtn.textContent = '▶️';
                this.isPlaying = false;
            } else {
                if (!this.audio.src) {
                    this.selectTrack(0);
                }
                this.audio.play();
                playPauseBtn.textContent = '⏸️';
                this.isPlaying = true;
            }
        }

        seekTo(e) {
            const progressBar = e.currentTarget;
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = percent * this.audio.duration;
        }

        updateProgress() {
            const progressFill = this.container.querySelector('.progress-fill-modern');
            const currentTime = this.container.querySelector('.current-time');
            
            if (this.audio.duration) {
                const percent = (this.audio.currentTime / this.audio.duration) * 100;
                progressFill.style.width = percent + '%';
                currentTime.textContent = this.formatTime(this.audio.currentTime);
            }
        }

        updateTimeDisplay() {
            const totalTime = this.container.querySelector('.total-time');
            totalTime.textContent = this.formatTime(this.audio.duration);
        }

        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        nextTrack() {
            if (this.currentTrackIndex < this.musicFiles.length - 1) {
                this.selectTrack(this.currentTrackIndex + 1);
                this.audio.play();
            } else {
                this.isPlaying = false;
                const playPauseBtn = this.container.querySelector('.play-pause-btn');
                playPauseBtn.textContent = '▶️';
            }
        }

        destroy() {
            if (this.audio) {
                this.audio.pause();
                this.audio.src = '';
            }
        }
    }

    // Modal functionality
    function createModal(projectTitle) {
        const project = projectData[projectTitle];
        if (!project) return;

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
            const audioPlayer = new AudioPlayer(modalContent, project.musicFiles || []);
            
            // Store reference to destroy on close
            modal.audioPlayer = audioPlayer;
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
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    function closeModal(modal) {
        // Clean up audio player if it exists
        if (modal.audioPlayer) {
            modal.audioPlayer.destroy();
        }
        
        setModalState(false);
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    // Add click events to clickable project cards
    const clickableCards = document.querySelectorAll('.clickable-card');
    clickableCards.forEach(card => {
        card.addEventListener('click', function() {
            const projectTitle = this.querySelector('h3').textContent;
            createModal(projectTitle);
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
});