let apiKey = "";
window.onload = async function () {
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

  let weatherHeading = document.getElementById("weather_heading");
  let weatherSubheading = document.getElementById("weather_subheading");
  let feelslike = document.getElementById("feels_like");
  let humidity = document.getElementById("humidity");
  let pressure = document.getElementById("pressure");
  let minMaxTemp = document.getElementById("min_max_temp");
  let windSpeed = document.getElementById("wind_speed");
  let weatherStructureArray = [
    weatherHeading,
    weatherSubheading,
    feelslike,
    humidity,
    pressure,
    minMaxTemp,
    windSpeed,
  ];

  let weatherData;
  const input = document.getElementById("city_input");
  if (input.value != "") {
    weatherData = await initiateSearch(input.value);
    insertWeather(weatherData, weatherStructureArray);
  }

  let timer; // Timer identifier
  const waitTime = 800; // Wait time in milliseconds
  // Listen for `keyup` event
  input.addEventListener("keyup", async (event) => {
    // Clear timer
    clearTimeout(timer);

    if (input.value) {
      if (event.key === "Enter") {
        weatherData = await initiateSearch(input.value);
        insertWeather(weatherData, weatherStructureArray);
      } else {
        // Wait for X ms and then process the request
        timer = setTimeout(async () => {
          weatherData = await initiateSearch(input.value);
          insertWeather(weatherData, weatherStructureArray);
        }, waitTime);
      }
    } else {
      return;
    }
  });

  const unitButton = document.getElementById("unit_button");

  unitButton.addEventListener("click", async function () {
    toggleUnit(unitButton, weatherData);
    updateTemperature(weatherData, weatherStructureArray);
  });
};

async function initiateSearch(input) {
  let coordinates = await getLocation(input);
  weatherData = await getWeather(coordinates.lat, coordinates.lon);
  return weatherData;
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
function toggleUnit(unitButton) {
  if (unitType == "metric") {
    unitType = "imperial";
    unitSymbol = "°F";
  } else {
    unitType = "metric";
    unitSymbol = "°C";
  }
  unitButton.innerText = unitSymbol;
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

var temp, minTemp, maxTemp, feelsLikeTemp;
function insertWeather(weatherData, weatherStructureArray) {
  const currentWeather = document.getElementById("current_weather");
  const additionalInformation = document.getElementById(
    "additional_information"
  );

  currentWeather.style.display = "flex";
  additionalInformation.style.display = "flex";

  const currentInformation = document.getElementById("current_information");
  currentInformation.style = "margin-top: 11rem;";

  temp = convertTemperature(weatherData.main.temp);
  minTemp = convertTemperature(weatherData.main.temp_min);
  maxTemp = convertTemperature(weatherData.main.temp_max);
  feelsLikeTemp = convertTemperature(weatherData.main.feels_like);

  weatherStructureArray[0].innerHTML = `<img class="weather_icon" src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png"/>${temp}${unitSymbol}`;
  weatherStructureArray[1].innerHTML = `${weatherData.weather[0].description}`;
  weatherStructureArray[2].innerHTML = `Feels Like: ${feelsLikeTemp}${unitSymbol}`;
  weatherStructureArray[3].innerHTML = `<img class="information_icon" src="./imgs/humidity.svg"/>Humidity: ${weatherData.main.humidity}%`;
  weatherStructureArray[4].innerHTML = `<img class="information_icon" src="./imgs/barometer.svg"/>Pressure: ${weatherData.main.pressure}hPa</p>`;
  weatherStructureArray[5].innerHTML = `<img class="information_icon" src="./imgs/thermometer.svg"/>Max Temp: ${maxTemp}${unitSymbol}<br>Min Temp: ${minTemp}${unitSymbol}`;
  weatherStructureArray[6].innerHTML = `Wind Speed: ${
    weatherData.wind.speed
  } m/s <br>Wind Direction: ${convertAngleToCardinalDirection(
    weatherData.wind.deg
  )}`;

  updateTab(weatherData, temp);
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

function updateTemperature(weatherData, weatherStructureArray) {
  temp = convertTemperature(weatherData.main.temp);
  minTemp = convertTemperature(weatherData.main.temp_min);
  maxTemp = convertTemperature(weatherData.main.temp_max);
  feelsLikeTemp = convertTemperature(weatherData.main.feels_like);

  weatherStructureArray[0].innerHTML = `<img class="weather_icon" src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png"/>${temp}${unitSymbol}`;
  weatherStructureArray[2].innerHTML = `Feels Like: ${feelsLikeTemp}${unitSymbol}`;
  weatherStructureArray[5].innerHTML = `<img class="information_icon" src="./imgs/thermometer.svg"/>Max Temp: ${maxTemp}${unitSymbol}<br>Min Temp: ${minTemp}${unitSymbol}`;

  updateTab(weatherData, temp);
}
