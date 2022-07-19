let apiKey = "";
window.onload = function () {
  // API key prompt
  if (!localStorage.getItem("apiKey")) {
    apiKey = prompt("Enter OpenWeather API Key:");
    localStorage.setItem("apiKey", apiKey);
  } else {
    apiKey = localStorage.getItem("apiKey");
  }

  const removeKeyButton = document.getElementById("remove_api_button");

  removeKeyButton.addEventListener("click", function () {
    if (confirm("Remove LocalStorage API Key?")) {
      localStorage.clear();
      location.reload();
    }
  });

  let weatherData;
  const input = document.getElementById("city_input");
  if (input.value != "") {
    initiateSearch(input.value);
  }

  let timer; // Timer identifier
  const waitTime = 800; // Wait time in milliseconds

  // Listen for `keyup` event
  input.addEventListener("keyup", (event) => {
    // Clear timer
    clearTimeout(timer);

    if (input.value) {
      if (event.key === "Enter") {
        initiateSearch(input.value);
      } else {
        // Wait for X ms and then process the request
        timer = setTimeout(() => {
          initiateSearch(input.value);
        }, waitTime);
      }
    } else {
      return;
    }
  });

  const unitButton = document.getElementById("unit_button");

  unitButton.addEventListener("click", async function () {
    toggleUnit(unitButton, weatherData);
    updateTemperature();
  });
};

async function initiateSearch(input) {
  let coordinates = await getLocation(input);
  weatherData = await getWeather(coordinates.lat, coordinates.lon);
  insertWeather(weatherData);
}

const geocodeURL = (city) =>
  `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

async function getLocation(city) {
  const response = await fetch(geocodeURL(city), { origin: "cors" });
  const responseData = await response.json();

  if (response.ok) {
    updateInputText(responseData[0].name);
  }

  return { lat: responseData[0].lat, lon: responseData[0].lon };
}

function updateInputText(name) {
  const input = document.getElementById("city_input");
  input.value = name;
  document.activeElement.blur();
}

let unitSymbol = "°C";
let unitType = "metric";
function toggleUnit(unitButton, weather) {
  if (unitType == "metric") {
    unitType = "imperial";
    unitSymbol = "°F";
  } else {
    unitType = "metric";
    unitSymbol = "°C";
  }
  unitButton.innerText = unitSymbol;
  if (weather != undefined) insertWeather(weather);
}

const weatherURL = (lat, lon) =>
  `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

async function getWeather(lat, lon) {
  const response = await fetch(weatherURL(lat, lon), { origin: "cors" });
  const responseData = await response.json();
  //getForecast(lat, lon);

  return responseData;
}

// const forecastURL = (lat, lon) =>
//   `api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

// async function getForecast(lat, lon) {
//   const response = await fetch(forecastURL(lat, lon), { origin: "cors" });
//   const responseData = await response.json();

//   console.log(responseData);
// }

function insertWeather(data) {
  const currentWeather = document.getElementById("current_weather");
  const additionalInformation = document.getElementById(
    "additional_information"
  );

  const currentInformation = document.getElementById("current_information");
  currentInformation.style = "margin-top: 11rem;";

  let temp, minTemp, maxTemp, feelsLike;
  temp = convertTemperature(data.main.temp);
  minTemp = convertTemperature(data.main.temp_min);
  maxTemp = convertTemperature(data.main.temp_max);
  feelsLike = convertTemperature(data.main.feels_like);

  currentWeather.innerHTML = `<h1><img class="weather_icon" src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"/>${temp}${unitSymbol}</h1><h2 style="text-transform: capitalize;">${data.weather[0].description}</h2>`;
  additionalInformation.innerHTML = `<div class="information_column"><p>Feels Like: ${feelsLike}${unitSymbol}</p><p><img class="information_icon" src="./imgs/humidity.svg"/>Humidity: ${
    data.main.humidity
  }%</p>
  <p><img class="information_icon" src="./imgs/barometer.svg"/>Pressure: ${
    data.main.pressure
  }hPa</p></div><div></div><div class="information_column">
  <p><img class="information_icon" src="./imgs/thermometer.svg"/>Max Temp: ${maxTemp}${unitSymbol}<br>Min Temp: ${minTemp}${unitSymbol}</p>
  <p><img  style="transform:rotate(${
    data.wind.deg
  }deg);" class="information_icon" src="./imgs/wind_degrees.svg"/>Wind Speed: ${
    data.wind.speed
  } m/s <br>Wind Direction: ${convertAngleToCardinalDirection(
    data.wind.deg
  )}</p></div>`;

  updateTab(data, temp);
}

function convertTemperature(originalTemperature) {
  let convertedTemperature;
  if (unitType == "metric") {
    convertedTemperature = originalTemperature - 273.15;
  } else {
    convertedTemperature = ((originalTemperature - 273.15) * 9) / 5 + 32;
  }

  convertedTemperature = Math.floor(convertedTemperature);

  return convertedTemperature;
}

function convertAngleToCardinalDirection(angle) {
  var directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  var index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8;
  return directions[index];
}

function updateTab(data, temp) {
  let headTitle = document.querySelector("head");
  let setFavicon = document.createElement("link");
  setFavicon.setAttribute("rel", "shortcut icon");
  setFavicon.setAttribute(
    "href",
    `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
  );
  headTitle.appendChild(setFavicon);
  document.title = `${data.name} ${temp}${unitSymbol} | Weathr`;
}

// function round(value, decimals) {
//   return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
// }
