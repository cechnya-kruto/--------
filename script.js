document.addEventListener('DOMContentLoaded', function () {
    // Сначала загружаем описания, потом инициализируем всё остальное
    loadDescriptions().then(() => {
        initScrollAnimations();
        initSearchFunctionality();
        initCardClickHandlers();
        initBurgerMenu();
    }).catch(error => {
        console.error('Ошибка загрузки описаний:', error);
        // Всё равно инициализируем, но описания будут по умолчанию
        initScrollAnimations();
        initSearchFunctionality();
        initCardClickHandlers();
        initBurgerMenu();
    });
});

// Глобальная переменная для хранения описаний
let flowerDescriptions = {};

// Функция загрузки описаний из JSON
async function loadDescriptions() {
    try {
        const response = await fetch('roses.json');
        if (!response.ok) throw new Error('Ошибка загрузки roses.json');
        const data = await response.json();
        flowerDescriptions = data;
        return flowerDescriptions;
    } catch (error) {
        console.error('Ошибка при загрузке roses.json:', error);
        // Возвращаем пустой объект, чтобы функция не упала
        flowerDescriptions = {};
        return flowerDescriptions;
    }
}

function initScrollAnimations() {
    const cards = document.querySelectorAll('.flower-card');
    const heroContent = document.querySelector('.hero-content');

    if (heroContent) {
        heroContent.style.opacity = '0';
        setTimeout(() => {
            heroContent.style.transition = 'opacity 1s ease-in, transform 1s ease-in';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 200);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.5s ease-in ${index * 0.1}s`;
        observer.observe(card);
    });
}

function initSearchFunctionality() {
    const searchInput = document.querySelector('.search-input');

    if (!searchInput) return;

    let searchTimeout;
    let lastSearchTerm = '';

    // Функция выполнения поиска
    function performSearch(searchTerm) {
        const cards = document.querySelectorAll('.flower-card');
        const normalizedTerm = searchTerm.toLowerCase().trim();

        cards.forEach(card => {
            const flowerName = card.querySelector('.flower-name')?.textContent.toLowerCase() || '';
            const family = card.querySelector('.flower-family')?.textContent.toLowerCase() || '';
            const scientificName = card.querySelector('.scientific-name p')?.textContent.toLowerCase() || '';

            let isMatch = normalizedTerm === '' ||
                flowerName.includes(normalizedTerm) ||
                family.includes(normalizedTerm) ||
                scientificName.includes(normalizedTerm);

            // Поиск по тегам
            if (!isMatch) {
                const tags = Array.from(card.querySelectorAll('.tag'));
                isMatch = tags.some(tag =>
                    tag.textContent.toLowerCase().includes(normalizedTerm)
                );
            }

            card.style.display = isMatch ? 'block' : 'none';
        });

        showNoResultsMessage(normalizedTerm, cards);
    }

    // Обработчик ввода
    function handleInput(e) {
        const searchTerm = e.target.value;

        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            if (searchTerm !== lastSearchTerm) {
                lastSearchTerm = searchTerm;
                performSearch(searchTerm);
            }
        }, 200);
    }

    // Добавляем все необходимые слушатели
    ['input', 'change', 'keyup', 'search'].forEach(eventType => {
        searchInput.addEventListener(eventType, handleInput);
    });

    // Специфичная обработка для мобильных браузеров
    if ('ontouchstart' in window) {
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(this.value);
            }
        });
    }
}

function initCardClickHandlers() {
    const cards = document.querySelectorAll('.flower-card');

    cards.forEach(card => {
        card.addEventListener('click', function (e) {
            if (e.target.classList.contains('tag')) return;

            const flowerName = this.querySelector('.flower-name')?.textContent || 'Неизвестный цветок';
            const flowerFamily = this.querySelector('.flower-family')?.textContent || 'Неизвестное семейство';
            const flowerImage = this.querySelector('.card-image')?.src || '';
            const scientificName = this.querySelector('.scientific-name p')?.textContent || 'Научное название неизвестно';

            showFlowerModal(flowerName, flowerFamily, flowerImage, scientificName);
        });
    });
}

function showFlowerModal(name, family, imageSrc, scientificName) {
    const existingModal = document.querySelector('.flower-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'flower-modal';

    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">×</button>
            <img src="${imageSrc}" alt="${name}" class="modal-image">
            <div class="modal-body">
                <h2 class="modal-title">${name}</h2>
                <p class="modal-scientific">${scientificName}</p>
                <p class="modal-family">Семейство: ${family}</p>
                <p class="modal-description">${getFlowerDescription(name)}</p>
                <button class="close-modal-btn">Закрыть</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);

    document.body.style.overflow = 'hidden';

    function closeModal() {
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.close-modal-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

function getFlowerDescription(name) {
    // Ищем описание в загруженных данных
    if (flowerDescriptions[name]) {
        return flowerDescriptions[name];
    }

    // Если точного совпадения нет, пробуем найти без учета регистра или с другими вариантами
    const lowerName = name.toLowerCase();
    for (const [key, value] of Object.entries(flowerDescriptions)) {
        if (key.toLowerCase() === lowerName) {
            return value;
        }
    }

    // Описание по умолчанию, если ничего не найдено
    return 'Прекрасное творение природы, которое радует глаз своей неповторимой красотой и изяществом.';
}

function showNoResultsMessage(searchTerm, cards) {
    if (searchTerm !== '') {
        const visibleCards = Array.from(cards).filter(card => card.style.display !== 'none');

        // Удаляем все существующие сообщения
        document.querySelectorAll('.no-results-message').forEach(msg => msg.remove());

        if (visibleCards.length === 0) {
            // На странице коллекции добавляем сообщение в активную секцию
            const activeSection = document.querySelector('.season-section.active .flower-grid');
            const mainGrid = document.querySelector('.flower-grid');
            const targetGrid = activeSection || mainGrid;

            if (targetGrid) {
                const noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results-message';
                noResultsMsg.textContent = `По запросу "${searchTerm}" ничего не найдено`;
                targetGrid.appendChild(noResultsMsg);
            }
        }
    } else {
        document.querySelectorAll('.no-results-message').forEach(msg => msg.remove());
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function initBurgerMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            this.classList.toggle('active');
            navMenu.classList.toggle('open');
        });

        // Закрыть меню при клике на ссылку
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function () {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('open');
            });
        });

        // Закрыть меню при клике вне его
        document.addEventListener('click', function (e) {
            if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('open');
            }
        });
    }
}