const apiKey = '80f00781db97197cafb89f509dd1d8ee';
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast');
const searchHistoryDiv = document.getElementById('search-history');

searchBtn.addEventListener('click', () => {
  const city = cityInput.value;
  fetchWeather(city);
  saveSearchHistory(city);
  displaySearchHistory();
});

function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      displayCurrentWeather(data);
      return fetchForecast(data.coord.lat, data.coord.lon);
    })
    .catch(error => {
      console.error('Error fetching current weather:', error);
      alert('Failed to retrieve weather data. Please check the console for more information.');
    });
}

function fetchForecast(lat, lon) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

  return fetch(forecastUrl)
    .then(response => response.json())
    .then(data => displayForecast(data))
    .catch(error => console.error('Error fetching forecast:', error));
}

function displayCurrentWeather(data) {
  currentWeatherDiv.innerHTML = `
      <h3>${data.name} (${new Date().toLocaleDateString()})</h3>
      <p>Temp: ${data.main.temp.toFixed(1)}°F</p>
      <p>Wind: ${data.wind.speed.toFixed(1)} MPH</p>
      <p>Humidity: ${data.main.humidity}%</p>
  `;
}

function displayForecast(data) {
  forecastDiv.innerHTML = '';
  const dailyForecasts = data.list.filter(forecast => forecast.dt_txt.endsWith('15:00:00'));

  dailyForecasts.forEach(day => {
    const date = new Date(day.dt_txt).toLocaleDateString();
    const icon = day.weather[0].icon;
    const temp = day.main.temp.toFixed(1);
    const wind = day.wind.speed.toFixed(1);
    const humidity = day.main.humidity;

    forecastDiv.innerHTML += `
        <div class="forecast-item">
            <h5>${date}</h5>
            <img src="http://openweathermap.org/img/wn/${icon}.png" alt="${day.weather[0].description}" />
            <p>Temp: ${temp}°F</p>
            <p>Wind: ${wind} MPH</p>
            <p>Humidity: ${humidity}%</p>
        </div>
    `;
  });
}

function saveSearchHistory(city) {
  let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  if (!history.includes(city)) {
    history.unshift(city);
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }
}

function displaySearchHistory() {
  let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  searchHistoryDiv.innerHTML = history.map(city =>
    `<button class="list-group-item list-group-item-action">${city}</button>`
  ).join('');

  document.querySelectorAll('#search-history .list-group-item').forEach(item => {
    item.addEventListener('click', function() {
      fetchWeather(this.textContent);
    });
  });
}

displaySearchHistory();
