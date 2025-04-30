// ----------------------
// ALL PAGES
// ----------------------

// voice recognition using the annyang.js library
function initVoiceRecognition() {
  if (annyang) {
    // Define voice commands
    const commands = {
      // when the user says "hello", show an alert
      'hello': () => { alert('Hello!');
      },
      // when the user says the change the background color of the page
      'change the color to *color': (color) => {
          document.body.style.backgroundColor = color.toLowerCase();
          console.log(`Changed background to ${color}`);
      },
      // when the user says "navigate to home", go to the home page or dogs and stocks
      'navigate to *page': (page) => {
          const pageMap = {
              'home': 'homePage.html',
              'stocks': 'stocksPage.html',
              'dogs': 'dogsPage.html',
          };
          // Get the matching page URL from the command
          const targetPage = pageMap[page.toLowerCase()];
          if (targetPage) {
             // store the user's voice preference in localStorage so we can remember it after navigation
            localStorage.setItem('voiceEnabled', 'true');
            window.location.href = targetPage;
          } else {
              alert('Page not found!');
          }
      },
      // Automatically fill in stock ticker and fetch its chart
      'look up *stock': (stock) => {
          const stockUpper = stock.replace(/\s+/g, '').toUpperCase(); // removes all spaces and uppercases it
          document.getElementById('ticker').value = stockUpper;
          document.getElementById('days').value = 30; // Default to 30 days
          fetchStockData(); // Call the function to fetch stock data
      },
      // Select a dog breed by name
      'load dog breed *breedName': (breedName) => {
        const buttons = document.querySelectorAll('#breed-buttons button');
        let matched = false;
        
        buttons.forEach(button => {
          const buttonText = button.textContent.toLowerCase();
          const spoken = breedName.toLowerCase();
          // Match spoken breed name to button text
          if (buttonText === spoken || buttonText.includes(spoken)) {
            button.click();
            matched = true;
          }
        });
        if (!matched) {
          alert(`Breed "${breedName}" not found among buttons.`);
        }
      }

      

    };
    // Add commands to annyang
    annyang.addCommands(commands);
    // debug in console
    annyang.addCallback('result', function(phrases) {
      console.log('Heard:', phrases);
    });
    // ----------------------
    // 3. Set up Start/Stop voice control buttons
    // ----------------------
    // Get the buttons by their IDs
    const startBtn = document.getElementById('start-voice-btn');
    const stopBtn = document.getElementById('stop-voice-btn');

    if (startBtn && stopBtn) {
      // When user clicks "Start Voice", begin listening and remember preference
      startBtn.addEventListener('click', () => {
        annyang.start();
        localStorage.setItem('voiceEnabled', 'true'); 
        console.log('Voice recognition started');
      });
      // When user clicks "Stop Voice", stop listening and clear preference
      stopBtn.addEventListener('click', () => {
        annyang.abort();
        localStorage.setItem('voiceEnabled', 'false'); 
        console.log('Voice recognition stopped');
      });
    }
    // ----------------------
    // 4. Automatically resume voice recognition on page load if enabled
    // ----------------------
    if (localStorage.getItem('voiceEnabled') === 'true') {
      annyang.start();
      console.log('Voice recognition auto-started after page load');
    }
  }
}


// ----------------------
// HOME PAGE
// ----------------------

// Fetch a random quote from the API and display it
function loadQuoteApi() {
    return fetch("https://zenquotes.io/api/random").then((result) => result.json());
}

// Home page logic: fetch and display a quote on page load
function homePage() {
    // call the loadQuoteApi and display the quote on the page
    loadQuoteApi().then((data) => {
        const quoteText = data[0].q + " — " + data[0].a;
        document.getElementById('quote').innerHTML = `"${quoteText}"`;
    });
}


// ----------------------
// STOCKS PAGE
// ----------------------

// Fetch data from the API and render the table
async function fetchTopStocks() {
    const url = 'https://tradestie.com/api/v1/apps/reddit?date=2022-04-03';
    const response = await fetch(url);
    const data = await response.json();

    const topStocks = data.sort((a, b) => b.no_of_comments - a.no_of_comments).slice(0, 5);
    const tableBody = document.querySelector('#stocks-table tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    // Loop through each stock and create a table row
    topStocks.forEach(stock => {
        const row = document.createElement('tr');
        
        // Create Ticker link
        const tickerCell = document.createElement('td');
        const tickerLink = document.createElement('a');
        tickerLink.href = `https://finance.yahoo.com/quote/${stock.ticker}`;
        tickerLink.textContent = stock.ticker;
        tickerCell.appendChild(tickerLink);
        row.appendChild(tickerCell);

        // Create Comment Count cell
        const commentCell = document.createElement('td');
        commentCell.textContent = stock.no_of_comments;
        row.appendChild(commentCell);

        // Create Sentiment cell with Bullish/Bearish icon
        const sentimentCell = document.createElement('td');
        const sentimentIcon = document.createElement('span');
        
        // Add Bullish/Bearish icon based on sentiment
        if (stock.sentiment === 'Bullish') {
            const sentimentImg = document.createElement('img');
            sentimentImg.src = 'https://imagedelivery.net/4-5JC1r3VHAXpnrwWHBHRQ/589fd70e-dfe5-498a-d9b4-a9363fdd7e00/w=430,h=242,fit=cover'; // Bullish icon
            // sentimentImg.alt = 'Bullish';
            sentimentIcon.classList.add('bullish-icon'); // Optional if you still want to style the container
            sentimentIcon.appendChild(sentimentImg);
            sentimentCell.appendChild(sentimentIcon);
        } else if (stock.sentiment === 'Bearish') {
            const sentimentImg = document.createElement('img');
            sentimentImg.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiMcFoNmPE8kIUnHVvJO9e8gB708jwkarZ1A&s'; // Bearish icon
            // sentimentImg.alt = 'Bearish';
            sentimentIcon.classList.add('bearish-icon');
            sentimentIcon.appendChild(sentimentImg);
            sentimentCell.appendChild(sentimentIcon);
        }
        
        row.appendChild(sentimentCell);

        // Append the row to the table body
        tableBody.appendChild(row);
    });

}

let chart; // global variable for Chart.js chart

// Fetch stock data for a specific ticker
async function fetchStockData() {
    const ticker = document.getElementById('ticker').value.toUpperCase(); // Get the ticker from input
    const days = parseInt(document.getElementById('days').value); 
  const apiKey = '0TBzwF6dyskA6vemZGnGdqGwSnDEJZcL'; // API key for stock data

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

  // Polygon API call
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${start}/${end}?adjusted=true&sort=asc&limit=${days}&apiKey=${apiKey}`;

  try {
    const response = await fetch(url); // Fetch the stock data
    const result = await response.json();

    if (!result.results) {
      alert("No data found. Check the stock ticker.");
      return;
    }

    // Process and format the stock data for display
    const labels = result.results.map(d => {
      const date = new Date(d.t);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const prices = result.results.map(d => d.c);

    // Draw the chart with the fetched data
    drawChart(labels, prices, ticker);
  } catch (err) {
    console.error('Fetch error:', err);
    alert("Something went wrong fetching the data.");
  }
}

// Function to draw a line chart with the stock data
function drawChart(labels, prices, tickerSymbol) {
  const ctx = document.getElementById('myChart').getContext('2d');
  if (chart) chart.destroy(); // remove previous chart

  const data = {
    labels: labels,  // Date labels
    datasets: [{
      label: `${tickerSymbol} Closing Prices`,
      data: prices, // Closing prices data
      fill: false,
      borderColor: 'rgb(75, 192, 192)',  // Line color
      tension: 0.1
    }]
  };

  const config = {
    type: 'line',
    data: data
  };

  chart = new Chart(ctx, config); // Create a new chart 
}


// ----------------------
// DOGS PAGE
// ----------------------

// Function to load a carousel of random dog images
function loadDogCarousel() {
  console.log("Starting to fetch dog images...");
  const carousel = document.getElementById("carousel");

  if (!carousel) {
    console.error("Carousel element not found.");
    return;
  }

  fetch("https://dog.ceo/api/breeds/image/random/10")
    .then(response => {
      console.log("Got response:", response);
      return response.json();
    })
    .then(data => {
      console.log("Dog API response:", data);

      // Check if data.message is an object 
      if (typeof data.message === 'object') {
        // Flatten the object to get all images in a single array, skipping empty arrays
        const images = Object.values(data.message)
          .flat() // Flatten the arrays into one large array
          .filter(url => url); // Remove empty values 

        console.log("Flattened images:", images);

        // Clear the carousel before adding new images
        carousel.innerHTML = "";

        // Append each image to the carousel
        images.forEach(url => {
          const img = document.createElement("img");
          img.src = url;
          img.alt = "Dog";
          carousel.appendChild(img); // Append image to carousel
        });

        // Initialize the slider
        if (typeof simpleslider === "undefined") {
          console.error("SimpleSlider is not loaded.");
          return;
        }

        console.log("Initializing slider...");
        simpleslider.getSlider({
          container: carousel, // Set the carousel container
          delay: 3 // Set delay between slides
        });
      } else {
        console.error("Unexpected format from API:", data);
      }
    })
    .catch(err => {
      console.error("Fetch error:", err);
    });
}



// Function to load dog breed buttons dynamically
function loadDogBreedButtons() {
  const breedButtonsContainer = document.getElementById("breed-buttons");

  fetch("https://dogapi.dog/api/v2/breeds")
    .then(res => res.json())
    .then(data => {
      const breeds = data.data;
      const selectedBreeds = breeds.sort(() => 0.5 - Math.random()).slice(0, 10); // Random 10 breeds

      breedButtonsContainer.innerHTML = '';

      selectedBreeds.forEach(breed => {
        const { name, description, life } = breed.attributes;

        // Create a button for each breed
        const button = document.createElement("button");
        button.textContent = name;
        button.setAttribute("class", "button-54");
        // Event listener for button click to display breed info
        button.addEventListener("click", () => {
          document.getElementById('dog-info').style.display = 'block';
          document.getElementById('name').textContent = `Name: ${name}`;
          document.getElementById('description').textContent = `Description: ${description || "Not available"}`;
          document.getElementById('min').textContent = `Min Life: ${life?.min || "?"} years`;
          document.getElementById('max').textContent = `Max Life: ${life?.max || "?"} years`;
        });

        breedButtonsContainer.appendChild(button); // Add breed button to container
      });
    })
    .catch(err => {
      console.error("Error loading dog breed info:", err);
    });
}






// ----------------------
// Init Based on Page
// ----------------------
// Event listener to initialize page-specific functions after the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initVoiceRecognition();

  const path = window.location.pathname;
  // Check the page type and initialize the corresponding page logic
  if (path.includes('homePage.html')) {
    homePage();
  }

  if (path.includes('stocksPage.html')) {
    fetchTopStocks();
  }

  if (path.includes('dogsPage.html')) {
    loadDogCarousel();
    loadDogBreedButtons();
  }
});


