// Custom JavaScript for Your Portfolio

// Global variable to store loaded translations
let currentTranslations = {};
let currentLang = 'pl'; // Default language

// Function to get a translation by key (e.g., "nav.home")
function getTranslation(key) {
    return key.split('.').reduce((obj, i) => (obj ? obj[i] : undefined), currentTranslations);
}

// Function to apply translations to the page
async function applyTranslationsToPage() {
    if (!currentTranslations || Object.keys(currentTranslations).length === 0) {
        console.warn('Translations not loaded or empty for language:', currentLang);
        return;
    }

    document.documentElement.lang = currentLang;

    const pageTitle = getTranslation('pageTitle');
    if (pageTitle) {
        document.title = pageTitle;
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const translation = getTranslation(key);
        if (translation !== undefined) {
            el.textContent = translation;
        } else {
            console.warn(`Missing translation for key: ${key} in language: ${currentLang}`);
        }
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
        const key = el.dataset.i18nAlt;
        const translation = getTranslation(key);
        if (translation !== undefined) {
            el.alt = translation;
        } else {
            console.warn(`Missing alt translation for key: ${key} in language: ${currentLang}`);
        }
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
        const key = el.dataset.i18nAriaLabel;
        const translation = getTranslation(key);
        if (translation !== undefined) {
            el.setAttribute('aria-label', translation);
        } else {
            console.warn(`Missing aria-label translation for key: ${key} in language: ${currentLang}`);
        }
    });

    // After applying translations, re-evaluate active scroll states
    // This ensures that if a language change affects layout or content height,
    // the scroll-active states are correctly updated.
    checkAndApplyScrollActiveStates();
}

// Function to load translations and then apply them
async function loadAndApplyTranslations(lang) {
    currentLang = lang;
    localStorage.setItem('preferredLanguage', lang);

    try {
        const response = await fetch(`locales/${lang}.json?v=${new Date().getTime()}`); // Cache busting for dev
        if (!response.ok) {
            throw new Error(`Failed to load translation file: ${response.statusText} for locales/${lang}.json`);
        }
        currentTranslations = await response.json();
        await applyTranslationsToPage(); // This will also call checkAndApplyScrollActiveStates
        // Update current language flag and code in the navbar
        const currentLangFlagEl = document.getElementById('currentLangFlag');
        const currentLangCodeEl = document.getElementById('currentLangCode');

        if (currentLangFlagEl) {
            currentLangFlagEl.src = `assets/images/flags/${currentLang}.svg`;
            // Alt text for the current flag should be descriptive and ideally translatable
            const altText = getTranslation(`langSwitcher.currentSelectedLangAlt`);
            if (altText) {
                currentLangFlagEl.alt = altText;
            } else {
                currentLangFlagEl.alt = `${currentLang.toUpperCase()} flag`; // Fallback
            }
        }
        if (currentLangCodeEl) {
            currentLangCodeEl.textContent = currentLang.toUpperCase();
        }
    } catch (error)
        {
        console.error('Error loading or applying translations:', error);
    }
}

// Function to set the language (now calls loadAndApplyTranslations)
async function setLanguage(lang) {
    await loadAndApplyTranslations(lang);
}


// Enhanced navigation logic:
const navIcons = document.querySelectorAll('.icon-nav-item .nav-icon');
const iconLinks = document.querySelectorAll('.icon-nav-item .icon-link');
const sections = document.querySelectorAll('header[id], section[id]');


// Function to check and apply scroll-active states
function checkAndApplyScrollActiveStates() {
    let foundActiveSection = false;
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionId = section.id;
        const correspondingLink = document.querySelector(`.icon-link[href="#${sectionId}"]`);
        const correspondingIcon = correspondingLink ? correspondingLink.querySelector('.nav-icon') : null;

        if (correspondingLink && correspondingIcon) {
            // Check if the icon is already clicked
            const isClicked = correspondingIcon.classList.contains('item-clicked');

            // Determine if the section is "active" based on its position
            // (top of section is above bottom of viewport AND bottom of section is below top of viewport, adjusted by rootMargin-like logic)
            // This is a simplified check; IntersectionObserver is more robust for this.
            // For this manual check, we'll use a similar logic to the observer's rootMargin.
            const topOffset = 60; // Corresponds to navbar height
            const bottomFoldPercentage = 0.40; // 40% from the bottom
            const viewHeight = window.innerHeight;

            const isActiveByScroll =
                rect.top < viewHeight - (viewHeight * bottomFoldPercentage) && rect.bottom > topOffset;

            if (!isClicked) { // Only manage scroll-active if not clicked
                if (isActiveByScroll) {
                    correspondingLink.classList.add('scroll-active-link');
                    correspondingIcon.classList.add('scroll-active-icon');
                    foundActiveSection = true;
                } else {
                    correspondingLink.classList.remove('scroll-active-link');
                    correspondingIcon.classList.remove('scroll-active-icon');
                }
            } else {
                // If it's clicked, ensure scroll-active classes are removed
                // as the clicked state takes precedence.
                correspondingLink.classList.remove('scroll-active-link');
                correspondingIcon.classList.remove('scroll-active-icon');
            }
        }
    });
}


// Smooth scroll and active state on click for main navigation links
iconLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId.startsWith('#')) {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });

                // Remove 'item-clicked' and 'link-active' from ALL items first
                navIcons.forEach(icon => icon.classList.remove('item-clicked'));
                iconLinks.forEach(l => l.classList.remove('link-active'));

                // Add 'item-clicked' to the clicked icon and 'link-active' to the clicked link
                const clickedIcon = this.querySelector('.nav-icon');
                if (clickedIcon) {
                    clickedIcon.classList.add('item-clicked');
                }
                this.classList.add('link-active');

                // Also, remove any 'scroll-active' classes from all items,
                // as a click should define the single active state.
                navIcons.forEach(icon => icon.classList.remove('scroll-active-icon'));
                iconLinks.forEach(l => l.classList.remove('scroll-active-link'));
            }
        }
    });
});


// Active state on scroll using IntersectionObserver
const observerOptions = {
    root: null, // viewport
    rootMargin: '-60px 0px -40% 0px', // Adjust top margin for fixed navbar, bottom margin to trigger earlier
    threshold: 0 // Trigger as soon as any part is visible within the adjusted rootMargin
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const sectionId = entry.target.id;
        const correspondingLink = document.querySelector(`.icon-link[href="#${sectionId}"]`);
        const correspondingIcon = correspondingLink ? correspondingLink.querySelector('.nav-icon') : null;

        if (correspondingLink && correspondingIcon) {
            // Only manage scroll-active if the item is NOT clicked
            if (!correspondingIcon.classList.contains('item-clicked')) {
                if (entry.isIntersecting) {
                    // Before adding, remove from others to ensure only one scroll-active at a time (if not clicked)
                    iconLinks.forEach(l => {
                        if (l !== correspondingLink) {
                            l.classList.remove('scroll-active-link');
                            const otherIcon = l.querySelector('.nav-icon');
                            if (otherIcon && !otherIcon.classList.contains('item-clicked')) {
                                otherIcon.classList.remove('scroll-active-icon');
                            }
                        }
                    });
                    correspondingLink.classList.add('scroll-active-link');
                    correspondingIcon.classList.add('scroll-active-icon');
                } else {
                    correspondingLink.classList.remove('scroll-active-link');
                    correspondingIcon.classList.remove('scroll-active-icon');
                }
            }
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});


// Language initialization and event listeners on page load
document.addEventListener('DOMContentLoaded', () => {
    // Update current year in footer
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'pl'; // Default to Polish
    setLanguage(preferredLanguage); // This will also trigger initial scroll active check via applyTranslationsToPage

    // Attach event listeners to language switcher links
    document.querySelectorAll('.dropdown-menu a[data-lang]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            setLanguage(this.dataset.lang);
        });
    });
});
 // Tutaj możesz dodać więcej interaktywności, np. filtrowanie projektów, lightbox dla zdjęć itp.
