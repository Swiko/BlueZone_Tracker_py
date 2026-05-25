let allLakesData = [];
let currentFilter = 'all';
let map;
let markersLayer; // Группа для динамического управления маркерами при фильтрации
let searchQuery = '';

// Инициализация карты OpenStreetMap
function initMap() {
    // Устанавливаем центр карты на Ленинградскую область [Широта, Долгота] и начальный зум
    map = L.map('map').setView([60.0, 30.6], 8);

    // ИСПРАВЛЕНИЕ: Используем официальный, самый стабильный сервер OpenStreetMap без блокировок CSP/CORS
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);


    // Создаем слой-группу для маркеров, чтобы легко очищать их при фильтрации
    markersLayer = L.layerGroup().addTo(map);
}

function updateUI() {
    const container = document.getElementById('lakes-container');
    if (!container) return;

    container.innerHTML = '';
    markersLayer.clearLayers(); // Стираем старые маркеры перед отрисовкой новых

    const loadingText = document.getElementById('loading-text');
    if (loadingText) loadingText.remove();

    // Эти переменные теперь считают ТОЛЬКО отфильтрованные и найденные озера
    let total = 0, safe = 0, unsafe = 0;

    allLakesData.forEach((lake) => {
        // 1. Сначала проверяем фильтр по статусу безопасности
        if (currentFilter === 'safe' && lake.status.toLowerCase() !== 'safe') return;
        if (currentFilter === 'unsafe' && lake.status.toLowerCase() === 'safe') return;

        // 2. Затем проверяем текстовый поиск (по названию или району)
        const nameMatch = lake.name.toLowerCase().includes(searchQuery);
        const districtMatch = lake.district.toLowerCase().includes(searchQuery);
        if (searchQuery && !nameMatch && !districtMatch) return;

        // --- Если код дошел сюда, значит озеро прошло ВСЕ фильтры и будет показано ---

        // Пополняем счетчики только для тех, кто прошел фильтрацию
        total++;
        if (lake.status.toLowerCase() === 'safe') safe++; else unsafe++;

        const badgeClass = lake.status.toLowerCase() === 'safe' ? 'status-safe' : 'status-unsafe';
        const color = lake.status.toLowerCase() === 'safe' ? '#2b8a3e' : '#c92a2a';

        // Создаем маркер в виде цветного круга
        const marker = L.circleMarker(lake.coordinates, {
            radius: 8,
            fillColor: color,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        });

        const popupContent = `
            <h3>${lake.name}</h3>
            <p><b>District:</b> ${lake.district}</p>
            <p><b>Status:</b> <span class="${badgeClass}">${lake.status}</span></p>
            <hr style="border:0; border-top:1px solid #eee; margin:8px 0;">
            <p>${lake.description}</p>
        `;
        marker.bindPopup(popupContent);

        marker.on('mouseover', function () { this.setRadius(12); });
        marker.on('mouseout', function () { this.setRadius(8); });

        // Добавляем маркер на карту (покажутся только отфильтрованные)
        markersLayer.addLayer(marker);

        // Создаем карточку в правом сайдбаре
        const card = document.createElement('div');
        card.className = 'lake-item';
        card.innerHTML = `
            <h3>${lake.name}</h3>
            <p><b>District:</b> ${lake.district}</p>
            <p>Status: <span class="${badgeClass}">${lake.status}</span></p>
        `;

        card.addEventListener('click', () => {
            map.setView(lake.coordinates, 12, { animate: true, duration: 1.5 });
            marker.openPopup();
        });

        container.appendChild(card);
    });

    // Обновляем плашки статистики актуальными живыми цифрами
    document.getElementById('total-lakes').innerText = total;
    document.getElementById('safe-lakes').innerText = safe;
    document.getElementById('unsafe-lakes').innerText = unsafe;
}


// Загрузка статичного JSON
async function fetchLakesData() {
    try {
        const response = await fetch('lakes.json');
        allLakesData = await response.json();
        updateUI();
    } catch (err) {
        console.error('Data error:', err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initMap(); // Сначала запускаем карту
    fetchLakesData(); // Затем грузим данные

    // ИСПРАВЛЕНИЕ СЕРОЙ КАРТЫ: Принудительный пересчет размеров контейнера
    setTimeout(() => {
        map.invalidateSize();
    }, 200);

    // Пересчет при изменении размеров экрана (например, поворот телефона)
    window.addEventListener('resize', () => {
        map.invalidateSize();
    });

    // ТОЧЕЧНОЕ ДОБАВЛЕНИЕ: Слушатель для поля поиска
    document.getElementById('lake-search').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        updateUI(); // Перерисовываем карту и сайдбар при каждом вводе буквы
    });


    document.getElementById('status-filter').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        updateUI();
    });
});

