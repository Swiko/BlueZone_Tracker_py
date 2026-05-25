let allLakesData = [];
let currentFilter = 'all';

const mapContainer = document.getElementById('map-container');
const viewport = document.getElementById('svg-viewport');
const popup = document.getElementById('map-popup');

let transformState = { x: -100, y: -80, scale: 1.2 };
let isDragging = false;
let dragStart = { x: 0, y: 0 };

function applyTransform() {
    viewport.style.transform = `translate(${transformState.x}px, ${transformState.y}px) scale(${transformState.scale})`;
}

// Проекция координат Ленобласти в пиксели SVG слоя (viewBox 1000x800)
function projectGeoToSvg(coords) {
    const lat = coords[0];
    const lon = coords[1];

    const minLat = 58.5, maxLat = 61.5;
    const minLon = 28.0, maxLon = 34.5;

    const x = ((lon - minLon) / (maxLon - minLon)) * 800 + 100;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 600 + 100;

    return { x, y };
}

function updateUI() {
    const container = document.getElementById('lakes-container');
    const markersGroup = document.getElementById('svg-markers-group');

    if (!container || !markersGroup) return;

    container.innerHTML = '';
    markersGroup.innerHTML = '';

    const loadingText = document.getElementById('loading-text');
    if (loadingText) loadingText.remove();

    let total = 0, safe = 0, unsafe = 0;

    allLakesData.forEach((lake, index) => {
        total++;
        if (lake.status.toLowerCase() === 'safe') safe++; else unsafe++;

        if (currentFilter === 'safe' && lake.status.toLowerCase() !== 'safe') return;
        if (currentFilter === 'unsafe' && lake.status.toLowerCase() === 'safe') return;

        const pos = projectGeoToSvg(lake.coordinates);
        const color = lake.status.toLowerCase() === 'safe' ? '#2b8a3e' : '#c92a2a';

        // Создание SVG элемента с корректным пространством имен
        const circle = document.createElementNS("http://w3.org", "circle");
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", "7");
        circle.setAttribute("fill", color);
        circle.setAttribute("stroke", "#ffffff");
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("class", "map-marker");
        circle.setAttribute("id", `marker-${index}`);

        circle.addEventListener('mouseenter', (e) => {
            popup.innerHTML = `<strong>${lake.name}</strong><br><span style="color:#666;">District: ${lake.district}</span><br><p style="margin:5px 0 0 0;font-size:12px;">${lake.description}</p>`;
            popup.style.display = 'block';

            const screenX = pos.x * transformState.scale + transformState.x;
            const screenY = pos.y * transformState.scale + transformState.y;

            popup.style.left = `${screenX + 15}px`;
            popup.style.top = `${screenY - 15}px`;
        });

        circle.addEventListener('mouseleave', () => {
            popup.style.display = 'none';
        });

        markersGroup.appendChild(circle);

        const card = document.createElement('div');
        card.className = 'lake-item';
        const badgeClass = lake.status.toLowerCase() === 'safe' ? 'status-safe' : 'status-unsafe';

        card.innerHTML = `
            <h3>${lake.name}</h3>
            <p><b>District:</b> ${lake.district}</p>
            <p>Status: <span class="${badgeClass}">${lake.status}</span></p>
        `;

        card.addEventListener('click', () => {
            const containerRect = mapContainer.getBoundingClientRect();
            transformState.scale = 2.5;
            transformState.x = containerRect.width / 2 - pos.x * transformState.scale;
            transformState.y = containerRect.height / 2 - pos.y * transformState.scale;
            applyTransform();

            document.querySelectorAll('.map-marker').forEach(c => c.setAttribute("r", "7"));
            circle.setAttribute("r", "12");
        });

        container.appendChild(card);
    });

    document.getElementById('total-lakes').innerText = total;
    document.getElementById('safe-lakes').innerText = safe;
    document.getElementById('unsafe-lakes').innerText = unsafe;
}

// Drag-n-drop карты
mapContainer.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('map-marker')) return;
    isDragging = true;
    dragStart = { x: e.clientX - transformState.x, y: e.clientY - transformState.y };
});

window.addEventListener('mouseup', () => { isDragging = false; });

mapContainer.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    transformState.x = e.clientX - dragStart.x;
    transformState.y = e.clientY - dragStart.y;
    applyTransform();
});

// Масштабирование колесиком
mapContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const rect = mapContainer.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const svgX = (mouseX - transformState.x) / transformState.scale;
    const svgY = (mouseY - transformState.y) / transformState.scale;

    transformState.scale *= zoomFactor;
    transformState.scale = Math.max(0.6, Math.min(transformState.scale, 6));

    transformState.x = mouseX - svgX * transformState.scale;
    transformState.y = mouseY - svgY * transformState.scale;

    applyTransform();
}, { passive: false });

// Прямой статический запрос к JSON файлу проекта
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
    applyTransform();
    fetchLakesData();

    document.getElementById('status-filter').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        updateUI();
    });
});
