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

    // Определяем, находимся ли мы на странице коллекции
    const isCollectionPage = document.querySelector('.season-filter') !== null;

    // Функция поиска
    function performSearch(searchTerm) {
        const cards = document.querySelectorAll('.flower-card');
        const normalizedTerm = searchTerm.toLowerCase().trim();

        // Удаляем старые сообщения об отсутствии результатов
        document.querySelectorAll('.no-results-message').forEach(msg => msg.remove());

        // Счетчик видимых карточек для каждой секции
        const visibleCardsBySection = new Map();

        cards.forEach(card => {
            const flowerName = card.querySelector('.flower-name')?.textContent.toLowerCase() || '';
            const family = card.querySelector('.flower-family')?.textContent.toLowerCase() || '';
            const scientificName = card.querySelector('.scientific-name p')?.textContent.toLowerCase() || '';
            const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());

            let isMatch = false;

            if (normalizedTerm === '') {
                isMatch = true;
            } else if (normalizedTerm.length === 1) {
                // Поиск по первой букве
                isMatch = flowerName.charAt(0) === normalizedTerm;
            } else {
                // Полный поиск
                isMatch = flowerName.includes(normalizedTerm) ||
                    family.includes(normalizedTerm) ||
                    scientificName.includes(normalizedTerm) ||
                    tags.some(tag => tag.includes(normalizedTerm));
            }

            // Для страницы коллекции проверяем активный сезон
            let shouldShow = isMatch;

            if (isCollectionPage) {
                const seasonSection = card.closest('.season-section');
                const isActiveSeason = seasonSection ? seasonSection.classList.contains('active') : false;
                shouldShow = isMatch && isActiveSeason;

                // Считаем видимые карточки по секциям
                if (shouldShow && seasonSection) {
                    const seasonId = seasonSection.id;
                    visibleCardsBySection.set(seasonId, (visibleCardsBySection.get(seasonId) || 0) + 1);
                }
            }

            // Применяем видимость без анимаций для лучшей производительности на мобильных
            if (shouldShow) {
                card.style.display = 'block';
                // Используем requestAnimationFrame для плавности
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                // Уменьшаем задержку для мобильных
                setTimeout(() => {
                    if (card.style.opacity === '0') {
                        card.style.display = 'none';
                    }
                }, 200);
            }
        });

        // Показываем сообщение, если ничего не найдено
        if (normalizedTerm !== '') {
            if (isCollectionPage) {
                // Для страницы коллекции показываем сообщение в активной секции
                const activeSection = document.querySelector('.season-section.active');
                if (activeSection) {
                    const sectionId = activeSection.id;
                    const visibleCount = visibleCardsBySection.get(sectionId) || 0;

                    if (visibleCount === 0) {
                        const grid = activeSection.querySelector('.flower-grid');
                        if (grid) {
                            const noResultsMsg = document.createElement('div');
                            noResultsMsg.className = 'no-results-message';
                            noResultsMsg.textContent = `По запросу "${searchTerm}" ничего не найдено`;
                            noResultsMsg.style.cssText = `
                                text-align: center;
                                padding: 2rem;
                                color: #64748b;
                                font-size: 1.1rem;
                                grid-column: 1 / -1;
                            `;
                            grid.appendChild(noResultsMsg);
                        }
                    }
                }
            } else {
                // Для главной страницы
                const visibleCards = Array.from(cards).filter(card => card.style.display !== 'none');
                if (visibleCards.length === 0) {
                    const grid = document.querySelector('.flower-grid');
                    if (grid) {
                        const noResultsMsg = document.createElement('div');
                        noResultsMsg.className = 'no-results-message';
                        noResultsMsg.textContent = `По запросу "${searchTerm}" ничего не найдено`;
                        noResultsMsg.style.cssText = `
                            text-align: center;
                            padding: 2rem;
                            color: #64748b;
                            font-size: 1.1rem;
                            grid-column: 1 / -1;
                        `;
                        grid.appendChild(noResultsMsg);
                    }
                }
            }
        }
    }

    // Обработчик ввода с debounce
    let searchTimeout;

    function handleSearch(e) {
        const searchTerm = e.target.value;

        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            performSearch(searchTerm);
        }, 250); // Уменьшаем задержку для лучшего отклика на мобильных
    }

    // Добавляем обработчики событий
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('search', handleSearch); // Для мобильных браузеров

    // Обработка Enter на мобильных
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(this.value);
        }
    });

    // Очистка поиска при фокусе (удобно на мобильных)
    searchInput.addEventListener('focus', function () {
        this.select();
    });
}

// Обновленная функция инициализации сезонных фильтров
function initSeasonFilter() {
    const seasonBtns = document.querySelectorAll('.season-btn');
    const seasonSections = document.querySelectorAll('.season-section');
    const searchInput = document.querySelector('.search-input');

    if (!seasonBtns.length || !seasonSections.length) return;

    function switchSeason(season) {
        // Обновляем активную кнопку
        seasonBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.season === season);
        });

        // Обновляем активную секцию
        seasonSections.forEach(section => {
            section.classList.toggle('active', section.id === season);
        });

        // Сбрасываем поиск при переключении сезона
        if (searchInput) {
            searchInput.value = '';
            // Триггерим событие поиска для обновления отображения
            searchInput.dispatchEvent(new Event('input'));
        }
    }

    seasonBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const season = btn.dataset.season;
            switchSeason(season);

            // Обновляем URL хеш для возможности прямых ссылок
            history.replaceState(null, '', `#${season}`);
        });
    });

    // Проверяем хеш при загрузке
    const hash = window.location.hash.slice(1);
    if (hash && ['spring', 'summer', 'autumn', 'winter'].includes(hash)) {
        switchSeason(hash);
    }
}

// Обновленная инициализация в DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    // Инициализируем сезонные фильтры
    initSeasonFilter();

    // Загружаем описания и инициализируем остальное
    loadDescriptions().then(() => {
        initScrollAnimations();
        initSearchFunctionality();
        initCardClickHandlers();
        initBurgerMenu();
    }).catch(error => {
        console.error('Ошибка загрузки описаний:', error);
        initScrollAnimations();
        initSearchFunctionality();
        initCardClickHandlers();
        initBurgerMenu();
    });
});

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