const API_KEY = '4f81cc1d15de45d785082423252302';
let tempChartInstance = null;
let humidityChartInstance = null;

async function getWeatherData(city) {
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=7&aqi=yes&alerts=yes`
        );
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data;
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching weather data: ' + error.message);
        throw error;
    }
}

function updateUI(data) {
    updateCurrentWeather(data);
    updateWeatherDetails(data);
    updateForecast(data.forecast.forecastday);
    updateCharts(data.forecast.forecastday);
}

function updateCurrentWeather(data) {
    const current = data.current;
    const location = data.location;

    // Get the weather condition
    const weatherCondition = current.condition.text.toLowerCase();

    // Map weather condition to image
    const weatherImages = {
        'sunny': 'https://example.com/sunny.png', // Replace with actual image URLs
        'partly cloudy': 'https://example.com/partly_cloudy.png',
        'cloudy': 'https://example.com/cloudy.png',
        'rainy': 'https://example.com/rainy.png',
        'snowy': 'https://example.com/snowy.png',
        'fog': 'https://example.com/fog.png',
        'thunderstorm': 'https://example.com/thunderstorm.png',
        // Add more mappings as needed
    };

    // Get the corresponding image URL
    const imageUrl = weatherImages[weatherCondition] || 'https://example.com/default.png';

    document.getElementById('currentWeather').innerHTML = `
        <div class="current-header">
            <h2>${location.name}, ${location.country}</h2>
            <p>${new Date(current.last_updated_epoch * 1000).toLocaleString()}</p>
        </div>
        <div class="current-body">
            <img id="weather-icon" src="${imageUrl}" class="weather-icon" alt="${current.condition.text}">
            <div class="current-temp">${current.temp_c}°C</div>
            <div class="current-condition">${current.condition.text}</div>
        </div>
    `;
}

function updateWeatherDetails(data) {
    const current = data.current;
    const detailsHTML = `
        <div class="detail-card">
            <i class="fas fa-temperature-low"></i>
            <div>
                <h3>Feels Like</h3>
                <p>${current.feelslike_c}°C</p>
            </div>
        </div>
        <div class="detail-card">
            <i class="fas fa-tint"></i>
            <div>
                <h3>Humidity</h3>
                <p>${current.humidity}%</p>
            </div>
        </div>
        <div class="detail-card">
            <i class="fas fa-wind"></i>
            <div>
                <h3>Wind Speed</h3>
                <p>${current.wind_kph} km/h</p>
            </div>
        </div>
        <div class="detail-card">
            <i class="fas fa-sun"></i>
            <div>
                <h3>UV Index</h3>
                <p>${current.uv}</p>
            </div>
        </div>
        <div class="detail-card">
            <i class="fas fa-eye"></i>
            <div>
                <h3>Visibility</h3>
                <p>${current.vis_km} km</p>
            </div>
        </div>
        <div class="detail-card">
            <i class="fas fa-tachometer-alt"></i>
            <div>
                <h3>Pressure</h3>
                <p>${current.pressure_mb} hPa</p>
            </div>
        </div>
    `;
    document.getElementById('weatherDetailsContent').innerHTML = detailsHTML;
}

function updateForecast(forecastDays) {
    const forecastHTML = forecastDays.map((day, index) => `
        <div class="forecast-card" style="animation-delay: ${index * 0.1}s">
            <h3>${new Date(day.date_epoch * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</h3>
            <img src="${day.day.condition.icon}" alt="${day.day.condition.text}">
            <div class="temp-range">
                <span class="max-temp">${day.day.maxtemp_c}°C</span>
                <span class="min-temp">${day.day.mintemp_c}°C</span>
            </div>
            <p>${day.day.condition.text}</p>
            <div class="forecast-details">
                <span><i class="fas fa-tint"></i> ${day.day.avghumidity}%</span>
                <span><i class="fas fa-wind"></i> ${day.day.maxwind_kph}km/h</span>
            </div>
        </div>
    `).join('');
    document.getElementById('dailyForecast').innerHTML = forecastHTML;
}

function updateCharts(forecastDays) {
    const labels = forecastDays.map(day => 
        new Date(day.date_epoch * 1000).toLocaleDateString('en-US', { weekday: 'short' })
    );

    // Temperature Chart
    if (tempChartInstance) tempChartInstance.destroy();
    const tempCtx = document.getElementById('tempChart').getContext('2d');
    tempChartInstance = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Max Temperature (°C)',
                data: forecastDays.map(day => day.day.maxtemp_c),
                borderColor: '#ff6b6b',
                tension: 0.4,
                fill: false
            }, {
                label: 'Min Temperature (°C)',
                data: forecastDays.map(day => day.day.mintemp_c),
                borderColor: '#4ecdc4',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: '7-Day Temperature Forecast' }
            }
        }
    });

    // Humidity Chart
    if (humidityChartInstance) humidityChartInstance.destroy();
    const humidityCtx = document.getElementById('humidityChart').getContext('2d');
    humidityChartInstance = new Chart(humidityCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Humidity (%)',
                data: forecastDays.map(day => day.day.avghumidity),
                backgroundColor: 'rgba(78, 205, 196, 0.5)',
                borderColor: '#4ecdc4',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: '7-Day Humidity Forecast' }
            }
        }
    });
}

// Initial load
window.onload = function() {
    document.getElementById('loading').style.display = 'flex';
    getWeatherByCity('Delhi'); // Set Delhi as the default location
};

async function getWeatherByCity(city) {
    try {
        const data = await getWeatherData(city);
        updateUI(data);
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error(error);
        alert('Error fetching weather data');
    }
}

function searchWeather() {
    const city = document.getElementById('cityInput').value;
    if (city.trim() === '') return;

    document.getElementById('loading').style.display = 'flex';
    getWeatherByCity(city);
}

document.getElementById('cityInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchWeather();
});