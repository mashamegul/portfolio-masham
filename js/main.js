// Utility function to debounce scroll events
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Module for handling mobile menu interactions
const mobileMenuHandler = (() => {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const topNavbar = document.querySelector('.top-navbar');
    const body = document.body;

    const init = () => {
        if (mobileMenuToggle && topNavbar) {
            mobileMenuToggle.addEventListener('click', toggleMenu);
            topNavbar.querySelectorAll('nav a').forEach(link => {
                link.addEventListener('click', closeMenuOnNavLinkClick);
            });
        }
    };

    const toggleMenu = () => {
        topNavbar.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        body.classList.toggle('menu-open');
    };

    const closeMenu = () => {
        topNavbar.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        body.classList.remove('menu-open');
    };

    const closeMenuOnNavLinkClick = (e) => {
        // Close menu if it's a link to another page or an anchor on the current page
        if (e.target.href.includes('.html') || e.target.hash) {
            closeMenu();
        }
    };

    return {
        init,
        closeMenu
    };
})();

// Module for handling navigation and active links
const navigationHandler = (() => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    const init = () => {
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavLinkClick);
        });
        window.addEventListener('load', setInitialActiveLinks);
        window.addEventListener('scroll', debounce(updateActiveSidebarLinks, 50));
        window.addEventListener('resize', debounce(updateActiveSidebarLinks, 50));
    };

    const handleNavLinkClick = (e) => {
        const linkHref = e.currentTarget.getAttribute('href');

        if (linkHref.startsWith('#')) {
            e.preventDefault();
            const targetId = linkHref.substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const topOffset = document.querySelector('.top-navbar')?.offsetHeight || 0;
                const scrollBuffer = 20;
                const elementPosition = targetSection.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - topOffset - scrollBuffer,
                    behavior: 'smooth'
                });
            }

            if (window.innerWidth <= 768) {
                mobileMenuHandler.closeMenu();
            }
        }
    };

    const updateActiveSidebarLinks = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const topNavbarHeight = document.querySelector('.top-navbar')?.offsetHeight || 0;

        document.querySelectorAll('.nav-menu .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelectorAll('.nav-menu .sub-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelectorAll('.sub-nav-menu').forEach(subMenu => {
            subMenu.style.display = 'none';
        });

        if (window.innerWidth <= 768) {
            const mainPageLinkForCurrentPage = document.querySelector(`.nav-menu a[href="${currentPage}"]`);
            if (mainPageLinkForCurrentPage) {
                mainPageLinkForCurrentPage.classList.add('active');
            }
        } else {
            let currentSectionId = '';
            let bestMatchRatio = 0;
            let bestMatchId = '';

            const sections = document.querySelectorAll('.main-content .section'); // Get all sections

            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const sectionHeight = rect.height;

                // Calculate visible portion of the section
                const visibleTop = Math.max(0, rect.top);
                const visibleBottom = Math.min(window.innerHeight, rect.bottom);
                const visibleHeight = visibleBottom - visibleTop;

                const visibilityRatio = sectionHeight > 0 ? visibleHeight / sectionHeight : 0;

                // Check if the section's top is past the activation offset
                // OR if a significant portion of it is visible

                if (rect.top <= activationOffset && rect.bottom > activationOffset) {
                    // This section is "intersecting" the activation line
                    // priori this, but can also use visibility ratio as a tie-breaker
                    if (visibilityRatio > bestMatchRatio) {
                        bestMatchRatio = visibilityRatio;
                        bestMatchId = section.getAttribute('id');
                    }
                } else if (rect.top > activationOffset && rect.top < window.innerHeight && visibilityRatio > 0.5) {
                    // If the section hasn't reached the activation offset yet,
                    // but it's significantly visible in the viewport, consider it if no better match
                    if (visibilityRatio > bestMatchRatio) {
                        bestMatchRatio = visibilityRatio;
                        bestMatchId = section.getAttribute('id');
                    }
                }
            });

            if (bestMatchId) {
                currentSectionId = bestMatchId;
            } else {
                // Fallback: If no section crosses the activationOffset, check the section closest to the top of the viewport
                // safety net for edge cases or very short pages
                let closestTop = Infinity;
                sections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top < closestTop && rect.bottom > 0) { // Section is at least partially visible
                        closestTop = rect.top;
                        currentSectionId = section.getAttribute('id');
                    }
                });
            }

            const mainPageLinkForCurrentPage = document.querySelector(`.nav-menu a[href="${currentPage}"]`);
            if (mainPageLinkForCurrentPage) {
                mainPageLinkForCurrentPage.classList.add('active');
            }


            if (currentSectionId) {
                const activeSidebarLink = document.querySelector(`.nav-menu a[href="#${currentSectionId}"]`);
                if (activeSidebarLink) {
                    activeSidebarLink.classList.add('active');

                    const parentNavLink = activeSidebarLink.closest('.sub-nav-menu')?.previousElementSibling;
                    if (parentNavLink && parentNavLink.classList.contains('nav-link')) {
                        const isInternalAnchorParent = parentNavLink.getAttribute('href').startsWith('#');
                        const parentLinkPage = parentNavLink.getAttribute('href').split('/').pop();
                        const isCurrentPageParent = (parentLinkPage === currentPage || (currentPage === 'index.html' && parentLinkPage === ''));

                        if (isInternalAnchorParent || isCurrentPageParent) {
                            parentNavLink.classList.add('active');
                            const subMenu = parentNavLink.nextElementSibling;
                            if (subMenu && subMenu.classList.contains('sub-nav-menu')) {
                                // Only display if it's the current page or an internal anchor
                                subMenu.style.display = 'block';
                            }
                        }
                    }
                }
            }
        }
    };

    const setInitialActiveLinks = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        document.querySelectorAll('.top-navbar nav a').forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            if (linkPage === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        updateActiveSidebarLinks();

    };

    return {
        init
    };
})();

// Module for image lightbox modal
const imageModalHandler = (() => {
    const imageModal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const captionText = document.getElementById("caption");
    const imageModalCloseBtn = imageModal ? imageModal.querySelector(".close-button") : null;
    const body = document.body;

    const init = () => {
        if (imageModal && modalImg && captionText && imageModalCloseBtn) {
            // Use event delegation for images to handle dynamically added content
            document.addEventListener('click', handleImageClick);
            imageModalCloseBtn.addEventListener('click', closeModal);
            imageModal.addEventListener('click', handleOutsideClick);
            document.addEventListener('keydown', handleEscapeKey);
        }
    };

    const handleImageClick = (e) => {
        const img = e.target.closest('img[data-full-src]');
        if (img) {
            imageModal.style.display = "flex";
            imageModal.classList.add('active');
            modalImg.src = img.getAttribute('data-full-src');
            captionText.innerHTML = img.getAttribute('data-caption') || img.alt;
            modalImg.style.animation = 'modalZoomIn 0.6s forwards';
            body.classList.add('modal-open');
        }
    };

    const closeModal = () => {
        imageModal.classList.remove('active');
        modalImg.style.animation = 'modalZoomOut 0.6s forwards';
        setTimeout(() => {
            imageModal.style.display = "none";
            modalImg.style.animation = '';
            body.classList.remove('modal-open');
        }, 600);
    };

    const handleOutsideClick = (e) => {
        if (e.target === imageModal) {
            closeModal();
        }
    };

    const handleEscapeKey = (e) => {
        if (e.key === "Escape" && imageModal.classList.contains('active')) {
            closeModal();
        }
    };

    return {
        init,
        openModal: handleImageClick // Expose openModal for project detail modal, now uses the delegated handler
    };
})();

// Module for project detail modal
const projectDetailModalHandler = (() => {
    const projectDetailModal = document.getElementById('projectDetailModal');
    const projectModalTitle = document.getElementById('projectModalTitle');
    const projectModalDescription = document.getElementById('projectModalDescription');
    const projectModalTech = document.getElementById('projectModalTech');
    const projectModalGithubLink = document.getElementById('projectModalGithubLink');
    const projectModalImages = document.getElementById('projectModalImages');
    const projectDetailModalCloseBtn = projectDetailModal ? projectDetailModal.querySelector('.close-button') : null;
    const body = document.body;

    const init = () => {
        if (projectDetailModal && projectModalTitle && projectModalDescription && projectModalTech && projectModalGithubLink && projectModalImages && projectDetailModalCloseBtn) {
            document.querySelectorAll('.project-card').forEach(card => {
                card.addEventListener('click', openProjectModal);
            });
            projectDetailModalCloseBtn.addEventListener('click', closeProjectModal);
            projectDetailModal.addEventListener('click', handleOutsideClick);
            document.addEventListener('keydown', handleEscapeKey);
        }
    };

    const openProjectModal = (e) => {
        if (e.target.tagName === 'A' || e.target.closest('a')) {
            return;
        }

        const card = e.currentTarget;
        projectModalTitle.textContent = card.querySelector('h3').textContent;
        projectModalDescription.textContent = card.dataset.fullDescription;

        projectModalTech.innerHTML = '';
        card.querySelectorAll('.tech-pill').forEach(pill => {
            const newPill = document.createElement('span');
            newPill.classList.add('tech-pill');
            newPill.textContent = pill.textContent;
            projectModalTech.appendChild(newPill);
        });

        const githubLink = card.dataset.githubLink;
        if (githubLink) {
            projectModalGithubLink.href = githubLink;
            projectModalGithubLink.style.display = 'flex';
        } else {
            projectModalGithubLink.style.display = 'none';
        }

        projectModalImages.innerHTML = '';
        const images = card.dataset.images ? card.dataset.images.split(',') : [];
        if (images.length > 0) {
            images.forEach(src => {
                const img = document.createElement('img');
                img.src = src.trim();
                img.alt = projectModalTitle.textContent + " image";
                img.classList.add('project-modal-image');
                // Pass the image element directly to imageModalHandler.openModal
                img.addEventListener('click', (event) => imageModalHandler.openModal({ currentTarget: img }));
                projectModalImages.appendChild(img);
            });
            projectModalImages.style.display = 'grid';
        } else {
            projectModalImages.style.display = 'none';
        }

        projectDetailModal.style.display = 'flex';
        projectDetailModal.classList.add('active');
        body.classList.add('modal-open');
    };

    const closeProjectModal = () => {
        projectDetailModal.classList.remove('active');
        setTimeout(() => {
            projectDetailModal.style.display = 'none';
            body.classList.remove('modal-open');
        }, 300);
    };

    const handleOutsideClick = (e) => {
        if (e.target === projectDetailModal) {
            closeProjectModal();
        }
    };

    const handleEscapeKey = (e) => {
        if (e.key === "Escape" && projectDetailModal.classList.contains('active')) {
            closeProjectModal();
        }
    };

    return {
        init
    };
})();

// Module for Intersection Observer animations
const animationObserver = (() => {
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                if (entry.target.classList.contains('slide-in-left') || entry.target.classList.contains('slide-in-right')) {
                    entry.target.style.transform = 'translateX(0)';
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const init = () => {
        document.querySelectorAll('.timeline-item').forEach(item => {
            observer.observe(item);
        });
        document.querySelectorAll('.gallery-container .gallery-item').forEach(item => {
            observer.observe(item);
        });
    };

    return {
        init
    };
})();

// Module for horizontal auto-scrolling galleries
const horizontalGalleryHandler = (() => {
    function initAutoScrollGallery(galleryElement, scrollSpeed = 0.5, pauseOnHover = true) {
        if (!galleryElement) return;

        let animationFrameId;
        let currentScroll = 0;
        let isPaused = false;
        let userInteracting = false; // New flag to detect manual interaction

        // Duplicate content for seamless loop
        const galleryContent = galleryElement.innerHTML;
        galleryElement.innerHTML += galleryContent;

        const animateScroll = () => {
            // Only auto-scroll if not paused AND not user interacting
            if (!isPaused && !userInteracting) { //
                currentScroll += scrollSpeed;
                if (currentScroll >= galleryElement.scrollWidth / 2) {
                    currentScroll = 0;
                }
                galleryElement.scrollLeft = currentScroll;
            }
            animationFrameId = requestAnimationFrame(animateScroll);
        };

        const startScrolling = () => {
            if (!animationFrameId) {
                animateScroll();
            }
        };

        // Pause on hover for desktop (existing)
        if (pauseOnHover) {
            galleryElement.addEventListener('mouseenter', () => {
                isPaused = true;
            });
            galleryElement.addEventListener('mouseleave', () => {
                isPaused = false;
            });
        }

        // New: Event listeners for touch interaction to pause auto-scroll
        galleryElement.addEventListener('touchstart', () => {
            userInteracting = true; // User started touching
            isPaused = true; // Also pause on touch to be safe
        });

        galleryElement.addEventListener('touchend', () => {
            // Give a small delay before resuming auto-scroll to allow for natural lift-off
            setTimeout(() => {
                userInteracting = false; // User stopped touching
                isPaused = false;
            }, 300); // Adjust delay as needed
        });

        // Add a 'scroll' event listener to the gallery itself to detect manual scrolling
        galleryElement.addEventListener('scroll', () => {
            // If the user manually scrolls, reset the auto-scroll position to match
            // This helps prevent jumps if the user scrolls and then auto-scroll resumes
            currentScroll = galleryElement.scrollLeft;
        });


        startScrolling();
    }

    const init = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPage === 'creative.html') {
            document.querySelectorAll('.horizontal-gallery').forEach(gallery => {
                initAutoScrollGallery(gallery, 0.5);
            });
        }
    };

    return {
        init
    };
})();

// Module for ripple effect on buttons
const rippleEffect = (() => {
    const init = () => {
        document.querySelectorAll('.contact-button, .nav-link').forEach(button => {
            button.addEventListener('click', addRippleEffect);
        });
    };

    const addRippleEffect = function(e) {
        if (this.tagName === 'A' && this.href && !this.href.includes('#')) {
            return;
        }

        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    };

    return {
        init
    };
})();

// Module for typing effect on profile name
const typingEffect = (() => {
    const init = () => {
        const profileName = document.querySelector('#index-page .profile-name');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (profileName && (currentPage === '' || currentPage === 'index.html')) {
            const fullText = profileName.textContent;
            profileName.style.width = profileName.offsetWidth + 'px';
            profileName.textContent = '';

            let index = 0;
            const typeText = () => {
                if (index < fullText.length) {
                    profileName.textContent += fullText.charAt(index);
                    index++;
                    setTimeout(typeText, 100);
                }
            };
            setTimeout(typeText, 500);
        }
    };

    return {
        init
    };
})();


// Initialize all modules when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    mobileMenuHandler.init();
    navigationHandler.init();
    imageModalHandler.init();
    projectDetailModalHandler.init();
    animationObserver.init();
    horizontalGalleryHandler.init();
    rippleEffect.init();
    typingEffect.init();
});
