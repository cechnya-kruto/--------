// script.js

document.addEventListener('DOMContentLoaded', function () {
    initScrollAnimations();
    initSearchFunctionality();
    initCardClickHandlers();
    initBurgerMenu();
});

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
    const cards = document.querySelectorAll('.flower-card');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(function (e) {
            const searchTerm = e.target.value.toLowerCase().trim();

            cards.forEach(card => {
                const flowerName = card.querySelector('.flower-name')?.textContent.toLowerCase() || '';
                const family = card.querySelector('.flower-family')?.textContent.toLowerCase() || '';
                const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
                const scientificName = card.querySelector('.scientific-name p')?.textContent.toLowerCase() || '';

                let isMatch = false;

                if (searchTerm === '') {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                    return;
                }

                // Если введена одна буква — ищем только по первой букве названия
                if (searchTerm.length === 1) {
                    isMatch = flowerName.charAt(0) === searchTerm;
                } else {
                    // При вводе 2+ букв — обычный поиск по всем полям
                    isMatch = flowerName.includes(searchTerm) ||
                        family.includes(searchTerm) ||
                        tags.some(tag => tag.includes(searchTerm)) ||
                        scientificName.includes(searchTerm);
                }

                // На странице collection.html учитываем активный сезон
                const isActiveSeason = card.closest('.season-section')?.classList.contains('active');
                const isOnCollectionPage = document.querySelector('.season-filter') !== null;

                if (isOnCollectionPage && !isActiveSeason) {
                    card.style.display = 'none';
                    card.style.opacity = '0';
                    return;
                }

                if (isMatch) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });

            showNoResultsMessage(searchTerm, cards);
        }, 300));
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
    const descriptions = {
        'Rose': 'Розы — одни из самых популярных цветов в мире, известные своей красотой и ароматом. Символ любви и страсти, они насчитывают более 300 видов и тысячи сортов.',
        'Tulip': 'Тюльпаны — весенние цветы, символ Голландии и новой жизни. Их яркие бутоны радуют глаз после долгой зимы и ассоциируются с приходом тепла.',
        'Sunflower': 'Подсолнухи всегда поворачиваются к солнцу, символизируя оптимизм и жизненную силу. Эти величественные цветы могут достигать высоты до 3 метров.',
        'Orchid': 'Орхидеи — одни из древнейших цветов на планете. Они символизируют красоту, любовь и роскошь. В мире существует более 25 000 видов орхидей.',
        'Lily': 'Лилии — изящные цветы с крупными выразительными бутонами и тонким ароматом. Символ чистоты и благородства, они ценятся за разнообразие форм и оттенков.',
        'Peony': 'Пионы — пышные и ароматные цветы с множеством нежных лепестков. Символизируют богатство и процветание, отличаются долгим цветением и высокой декоративностью.',
        'Mimosa': 'Мимозы — нежные растения с мелкими пушистыми соцветиями ярко-жёлтого цвета. Ассоциируются с весной и теплом, символизируют чувствительность и искренность.',
        'Violet': 'Фиалки — компактные цветы с бархатистыми лепестками и мягким ароматом. Символ скромности и верности, популярны как садовые и комнатные растения.',
        'Daisy': 'Ромашки — простые и очаровательные цветы с белыми лепестками и жёлтой серединкой. Символ невинности и чистоты, они радуют своим жизнерадостным видом.',
        'Lavender': 'Лаванда — ароматное растение с фиолетовыми соцветиями. Широко используется в парфюмерии и медицине, символизирует спокойствие и умиротворение.',
        'Carnation': 'Гвоздики — цветы с зубчатыми лепестками и пряным ароматом. Символ материнской любви, они долго стоят в срезке и бывают разных оттенков.',
        'Iris': 'Ирисы — элегантные цветы с характерной формой лепестков. Названы в честь богини радуги, символизируют мудрость и надежду.',
        'Dahlia': 'Георгины — пышные цветы с многочисленными лепестками. Могут быть разных форм и размеров, символизируют благодарность и достоинство.',
        'Marigold': 'Бархатцы — яркие оранжево-жёлтые цветы с сильным ароматом. Неприхотливы, отпугивают вредителей, символизируют творчество.',
        'Zinnia': 'Циннии — яркие однолетние цветы с длительным цветением. Любят тепло и солнце, идеально подходят для букетов.',
        'Poppy': 'Маки — цветы с нежными лепестками и тёмной серединкой. Символ памяти и забвения, растут в дикой природе и садах.',
        'Hydrangea': 'Гортензии — кустарники с крупными шаровидными соцветиями. Меняют цвет в зависимости от кислотности почвы, символизируют искренность.',
        'Begonia': 'Бегонии — теневыносливые растения с красивыми листьями и цветами. Бывают клубневые и кустовые виды, цветут всё лето.',
        'Geranium': 'Герани — популярные комнатные и садовые растения. Неприхотливы, имеют характерный аромат, отпугивают насекомых.',
        'Jasmine': 'Жасмин — вьющееся растение с ароматными белыми цветами. Символ любви и красоты, широко используется в парфюмерии.',
        'Magnolia': 'Магнолии — древние деревья с крупными ароматными цветами. Символ благородства и настойчивости, цветут ранней весной.',
        'Camellia': 'Камелии — вечнозелёные кустарники с элегантными цветами. Цветут зимой и ранней весной, символизируют совершенство.',
        'Azalea': 'Азалии — красивоцветущие кустарники из рода рододендронов. Требуют кислой почвы, цветут обильно и ярко.',
        'Gardenia': 'Гардении — растения с восковыми белыми цветами и сильным ароматом. Требовательны в уходе, символизируют чистоту.',
        'Hibiscus': 'Гибискусы — тропические цветы с крупными яркими бутонами. Символ Гаев, цветут обильно в тёплом климате.',
        'Freesia': 'Фрезии — луковичные растения с ароматными воронковидными цветами. Популярны в срезке, символизируют дружбу.',
        'Anemone': 'Ветреницы — нежные цветы, раскрывающиеся на ветру. Бывают весенние и осенние виды, символизируют ожидание.',
        'Ranunculus': 'Лютики азиатские — цветы с многослойными лепестками. Напоминают пионы в миниатюре, популярны в букетах.',
        'Delphinium': 'Дельфиниумы — высокие растения с синими свечевидными соцветиями. Требуют опоры, символизируют легкомыслие.',
        'Foxglove': 'Наперстянка — растение с колокольчатыми цветами в виде напёрстков. Ядовито, используется в медицине.',
        'Hollyhock': 'Штокроза — высокие растения с крупными цветами вдоль стебля. Символ плодородия, украшают дачные участки.',
        'Snapdragon': 'Львиный зев — цветы с оригинальной формой, напоминающей пасть. Раскрываются при нажатии, любят прохладу.',
        'Sweet Pea': 'Душистый горошек — вьющееся растение с ароматными цветами. Символ удовольствия, цветёт в начале лета.',
        'Cosmos': 'Космеи — лёгкие воздушные цветы с перистой листвой. Неприхотливы, создают эффект полевого луга.',
        'Aster': 'Астры — осенние цветы в форме звёзд. Символ терпения и изящества, цветут до заморозков.',
        'Chrysanthemum': 'Хризантемы — осенние цветы с многочисленными лепестками. Символ долголетия в Азии, бывают разных форм.',
        'Gladiolus': 'Гладиолусы — высокие растения с мечевидными листьями и колосовидными соцветиями. Символ силы и победы.',
        'Crocus': 'Крокусы — первые весенние цветы из луковиц. Символ возрождения, зацветают сразу после схода снега.',
        'Snowdrop': 'Подснежники — маленькие белые цветы, пробивающиеся сквозь снег. Символ надежды и начала весны.',
        'Daffodil': 'Нарциссы — весенние луковичные цветы с трубчатой серединкой. Символ самовлюблённости и нового начала.',
        'Hyacinth': 'Гиацинты — ароматные луковичные цветы с плотными соцветиями. Символ спорта и игр, цветут ранней весной.',
        'Allium': 'Декоративный лук — растения с шаровидными соцветиями на высоких стеблях. Неприхотливы, выглядят экзотично.',
        'Fritillaria': 'Рябчик — луковичные цветы с пёстрыми поникающими бутонами. Короновидная форма, символ богатства.',
        'Scilla': 'Пролеска — маленькие синие цветы, цветущие ранней весной. Неприхотливы, быстро разрастаются.',
        'Muscari': 'Мускари — луковичные цветы в форме виноградной грозди. Символ искренности, цветут в апреле-мае.',
        'Columbine': 'Водосбор — цветы с оригинальной шпорцевой формой. Символ святого духа, любят полутень.',
        'Bleeding Heart': 'Дицентра — растение с цветами в форме сердечек. Символ безответной любви, растёт в тени.',
        'Hosta': 'Хосты — теневыносливые растения с декоративными листьями. Бывают разных размеров и расцветок.',
        'Astilbe': 'Астильба — растение с метельчатыми пушистыми соцветиями. Любит влагу и тень, цветёт летом.',
        'Lupine': 'Люпины — высокие растения с кистевидными соцветиями. Обогащают почву азотом, бывают разных цветов.',
        'Salvia': 'Шалфей — ароматное растение с колосовидными соцветиями. Привлекает колибри, используется в кулинарии.',
        'Verbena': 'Вербена — растение с мелкими цветами в зонтиках. Цветёт всё лето, привлекает бабочек.',
        'Phlox': 'Флоксы — ароматные многолетники с метельчатыми соцветиями. Символ согласия, цветут летом.',
        'Coneflower': 'Эхинацея — цветок с розовыми лепестками и выступающей серединкой. Лекарственное растение, укрепляет иммунитет.',
        'Black-eyed Susan': 'Рудбекия — цветок с жёлтыми лепестками и тёмной серединкой. Символ справедливости, цветёт до осени.',
        'Coreopsis': 'Кореопсис — растение с жёлтыми ромашковидными цветами. Долго цветёт, засухоустойчиво.',
        'Gaillardia': 'Гайлардия — цветок с красно-жёлтыми лепестками. Символ пути, устойчив к жаре.',
        'Yarrow': 'Тысячелистник — растение с плоскими зонтичными соцветиями. Лекарственное, останавливает кровь.',
        'Sedum': 'Очиток — суккулент с мясистыми листьями и звёздчатыми цветами. Неприхотлив, цветёт осенью.',
        'Hellebore': 'Морозник — цветок, цветущий зимой. Символ надежды, растёт в тени.',
        'Primrose': 'Первоцвет — ранневесенние цветы с яркими соцветиями. Символ юности и рождения.',
        'Pulmonaria': 'Медуница — растение с пятнистыми листьями и розово-синими цветами. Медонос, растёт в тени.',
        'Brunnera': 'Бруннера — растение с голубыми цветами, похожими на незабудки. Декоративные листья, тенелюбива.',
        'Dicentra': 'Дицентра — растение с розовыми сердцевидными цветами. Символ разбитого сердца.',
        'Epimedium': 'Горянка — почвопокровное растение с изящными цветами. Вечнозелёные листья, для тени.',
        'Tiarella': 'Пенсильвания — почвопокровное растение с пушистыми белыми цветами.Native, для влажных мест.',
        'Heuchera': 'Гейхера — растение с цветными листьями и мелкими цветами. Символ признательности, декоративна.',
        'Bergenia': 'Бадан — растение с крупными листьями и розовыми цветами. Вечнозелёное, неприхотливое.',
        'Rodgersia': 'Роджерсия — крупное растение с перистыми листьями. Любит влагу, архитектурное.',
        'Ligularia': 'Бузульник — растение с крупными листьями и жёлтыми свечами. Для влажных тенистых мест.',
        'Gunnera': 'Гуннера — гигантское растение с огромными листьями. Экзотический вид, требует места.',
        'Fern': 'Папоротник — древнее растение с перистыми вайями. Символ искренности, растёт в тени.',
        'Bamboo': 'Бамбук — быстрорастущая трава с полыми стеблями. Символ долголетия и гибкости.',
        'Lotus': 'Лотос — водное растение с крупными ароматными цветами. Священный цветок, символ чистоты.',
        'Water Lily': 'Кувшинка — водное растение с плавающими листьями и цветами. Символ тишины и мира.',
        'Calla Lily': 'Калла — элегантный цветок с белым покрывалом. Символ красоты, популярен в свадьбах.',
        'Anthurium': 'Антуриум — тропическое растение с красными восковыми цветами. Символ гостеприимства.',
        'Bird of Paradise': 'Стрелиция — экзотический цветок в форме птицы. Символ свободы и радости.',
        'Protea': 'Протея — южноафриканский цветок с крупными соцветиями. Символ разнообразия.',
        'Banksia': 'Банксия — австралийское растение с конусовидными соцветиями.Native, для сухих мест.',
        'Grevillea': 'Гревиллея — растение с паукообразными цветами. Медонос, привлекает птиц.',
        'Plumeria': 'Плюмерия — тропическое дерево с ароматными цветами. Символ бессмертия, для леи.',
        'Bougainvillea': 'Бугенвиллея — вьющееся растение с яркими прицветниками. Символ страсти, для тёплого климата.',
        'Mandevilla': 'Мандевилла — лиана с крупными воронковидными цветами. Тропическая, цветёт летом.',
        'Allamanda': 'Алламанда — лиана с жёлтыми трубчатыми цветами. Тропическая, любит солнце.',
        'Ixora': 'Иксора — кустарник с зонтичными соцветиями. Вечнозелёный, для тропиков.',
        'Pentas': 'Пентас — растение со звёздчатыми цветами. Привлекает бабочек, цветёт обильно.',
        'Lantana': 'Лантана — кустарник с меняющими цвет цветами. Засухоустойчив, для бабочек.',
        'Portulaca': 'Портулак — суккулент с яркими цветами. Любит солнце, закрывается в пасмурную погоду.',
        'Celosia': 'Целозия — цветок с перистыми или гребенчатыми соцветиями. Яркий, для жаркого лета.',
        'Amaranthus': 'Амарант — растение с поникающими красными соцветиями. Символ верности, для сухих букетов.',
        'Nicotiana': 'Никотиана — растение с ароматными трубчатыми цветами. Цветёт вечером, привлекает мотыльков.',
        'Petunia': 'Петуния — популярное однолетнее растение с воронковидными цветами. Бывает ампельной и кустовой.',
        'Impatiens': 'Недотрога — тенелюбивое растение с сочными стеблями. Цветёт обильно, символ нетерпения.',
        'Nemesia': 'Немезия — растение с двугубыми ароматными цветами. Для прохладной погоды, цветёт весной.',
        'Lobelia': 'Лобелия — растение с мелкими синими цветами. Для бордюров и подвесных корзин.',
        'Alyssum': 'Алиссум — почвопокровное растение с медовым ароматом. Белые мелкие цветы, для окантовки.',
        'Forget-me-not': 'Незабудка — маленький цветок с голубыми лепестками. Символ настоящей любви и памяти.'
    };

    return descriptions[name] || 'Прекрасное творение природы, которое радует глаз своей неповторимой красотой и изяществом.';
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