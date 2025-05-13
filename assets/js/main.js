// Custom JavaScript for Portfolio

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
}

// Function to set the language
async function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('preferredLanguage', lang);

    try {
        const response = await fetch(`locales/${lang}.json?v=${new Date().getTime()}`); // Cache busting for dev
        if (!response.ok) {
            throw new Error(`Failed to load translation file: ${response.statusText} for locales/${lang}.json`);
        }
        currentTranslations = await response.json();
        await applyTranslationsToPage();
    } catch (error) {
        console.error('Error loading or applying translations:', error);
    }
}
// Płynne przewijanie dla linków nawigacyjnych
// document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//     anchor.addEventListener('click', function (e) {
//         e.preventDefault();
//         const targetId = this.getAttribute('href');
//         const targetElement = document.querySelector(targetId);
//         if (targetElement) {
//             targetElement.scrollIntoView({
//                 behavior: 'smooth'
//             });
//         }
//     });
// });

// Enhanced navigation logic:
const navIcons = document.querySelectorAll('.icon-nav-item .nav-icon');
const navLinks = document.querySelectorAll('.icon-nav-item .icon-link'); // Pobieramy linki <a>
const sections = document.querySelectorAll('header[id], section[id]');

// Ta funkcja może zarządzać ogólną klasą 'active-section-indicator' dla linku lub etykiety,
// ale nie będzie już odpowiadać za kolorowanie ikony.
const activateNavLink = (id) => {
    // Usuwamy poprzednie wskaźniki aktywnej sekcji (jeśli są używane)
    navLinks.forEach(link => link.classList.remove('active-section-indicator'));
    const activeLink = document.querySelector(`.icon-link[href="#${id}"]`);
    if (activeLink) {
        // activeLink.classList.add('active-section-indicator'); // Można odkomentować i ostylować w CSS, jeśli potrzebny jest wskaźnik niezwiązany z kolorem ikony
    }
};

// Smooth scroll and active state on click for main navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // Apply only to main navigation links (icon links)
    if (anchor.classList.contains('icon-link') || anchor.closest('.icon-nav-item')) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                    // Zarządzanie kolorowaniem ikony po kliknięciu
                    const clickedIcon = this.querySelector('.nav-icon'); // 'this' to kliknięty link <a>
                    navIcons.forEach(icon => icon.classList.remove('item-clicked')); // Usuwamy klasę ze wszystkich ikon
                    if (clickedIcon) {
                        clickedIcon.classList.add('item-clicked'); // Dodajemy klasę do klikniętej ikony
                    }
                }
            }
        });
    }
});

// Active state on scroll
const observerOptions = {
    root: null, // viewport
    rootMargin: '-60px 0px -40% 0px', // Adjust top margin for fixed navbar, bottom margin to trigger earlier
    threshold: 0 // Trigger as soon as any part is visible within the adjusted rootMargin
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            activateNavLink(entry.target.id);
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
    setLanguage(preferredLanguage);

    // Attach event listeners to language switcher links
    document.querySelectorAll('.dropdown-menu a[data-lang]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            setLanguage(this.dataset.lang);
        });
    });
 });
 // Tutaj możesz dodać więcej interaktywności, np. filtrowanie projektów, lightbox dla zdjęć itp.