document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize custom cursor
    const cursor = document.querySelector('.cursor');
    const links = document.querySelectorAll('a, button');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    links.forEach(link => {
        link.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        link.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });

    // 2. Initialize Lenis for Smooth Scrolling
    const lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 3. Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal-up');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); 
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 4. Subtle Parallax for Project Images
    const projectImages = document.querySelectorAll('.project-image');
    
    lenis.on('scroll', (e) => {
        projectImages.forEach(img => {
            const wrapper = img.parentElement;
            const rect = wrapper.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            if (rect.top < windowHeight && rect.bottom > 0) {
                const centerOffset = (windowHeight / 2) - (rect.top + rect.height / 2);
                const yPos = centerOffset * -0.05; 
                img.style.transform = `translateY(${yPos}px) scale(1.02)`; 
            }
        });
    });

    // 5. Contact Form Handling & Animated Success UI
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const contactToast = document.getElementById('contact-toast');

    if (contactForm && submitBtn && contactToast) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page reload

            // 1. Loading State
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.classList.add('loading');

            // 2. Simulate API Request (EmailJS delay)
            setTimeout(() => {
                // 3. Success State Resets
                submitBtn.innerText = originalBtnText;
                submitBtn.classList.remove('loading');
                contactForm.reset();

                // 4. Reveal Toast Notification
                contactToast.classList.add('show-toast');

                // 5. Hide Toast Automatically (3s delay + 0.6s anim transition)
                setTimeout(() => {
                    contactToast.classList.remove('show-toast');
                }, 3000);

            }, 1200); // Simulated network delay
        });
    }
});
