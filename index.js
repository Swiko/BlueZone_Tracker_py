let allLakesData = [];
let currentFilter = 'all';
let map;
let markersLayer; // Группа для динамического управления маркерами при фильтрации

// Инициализация карты OpenStreetMap
function initMap() {
    // Устанавливаем центр карты на Ленинградскую область [Широта, Долгота] и начальный зум
    map = L.map('map').setView([60.0, 30.6], 8);

    // ИСПОЛЬЗУЕМ АНГЛОЯЗЫЧНЫЙ СЕРВЕР: Подложка OSM Humanitarian с принудительными английскими тегами
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, Tiles style by Humanitarian OpenStreetMap Team'
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

    let total = 0, safe = 0, unsafe = 0;

    allLakesData.forEach((lake) => {
        total++;
        if (lake.status.toLowerCase() === 'safe') safe++; else unsafe++;

        // Фильтрация
        if (currentFilter === 'safe' && lake.status.toLowerCase() !== 'safe') return;
        if (currentFilter === 'unsafe' && lake.status.toLowerCase() === 'safe') return;

        const badgeClass = lake.status.toLowerCase() === 'safe' ? 'status-safe' : 'status-unsafe';
        const color = lake.status.toLowerCase() === 'safe' ? '#2b8a3e' : '#c92a2a';

        // 1. Создаем маркер в виде цветного круга прямо по географическим координатам
        const marker = L.circleMarker(lake.coordinates, {
            radius: 8,
            fillColor: color,
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        });

        // Создаем всплывающее окно (Popup) при клике или наведении на маркер
        const popupContent = `
            <h3>${lake.name}</h3>
            <p><b>District:</b> ${lake.district}</p>
            <p><b>Status:</b> <span class="${badgeClass}">${lake.status}</span></p>
            <hr style="border:0; border-top:1px solid #eee; margin:8px 0;">
            <p>${lake.description}</p>
        `;
        marker.bindPopup(popupContent);

        // Эффект увеличения маркера при наведении мыши
        marker.on('mouseover', function () {
            this.setRadius(12);
        });
        marker.on('mouseout', function () {
            this.setRadius(8);
        });

        // Добавляем маркер в нашу группу на карте
        markersLayer.addLayer(marker);

        // 2. Создаем карточку в правом сайдбаре
        const card = document.createElement('div');
        card.className = 'lake-item';

        card.innerHTML = `
            <h3>${lake.name}</h3>
            <p><b>District:</b> ${lake.district}</p>
            <p>Status: <span class="${badgeClass}">${lake.status}</span></p>
        `;

        // Плавный подлет карты к озеру и открытие попапа при клике на сайдбар
        card.addEventListener('click', () => {
            map.setView(lake.coordinates, 12, { animate: true, duration: 1.5 });
            marker.openPopup();
        });

        container.appendChild(card);
    });

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

    document.getElementById('status-filter').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        updateUI();
    });
});

