const apikey = "";

const url = (city) =>
  `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`;

async function getWeather(city) {
  const response = await fetch(url(city), { origin: "cors" });
  const responseData = await response.json();

  console.log(await responseData);
}

let timer; // Timer identifier
const waitTime = 500; // Wait time in milliseconds

// Listen for `keyup` event
const input = document.querySelector("#input-text");
input.addEventListener("keyup", (e) => {
  const text = e.currentTarget.value;

  // Clear timer
  clearTimeout(timer);

  // Wait for X ms and then process the request
  timer = setTimeout(() => {
    getWeather(text);
  }, waitTime);
});
