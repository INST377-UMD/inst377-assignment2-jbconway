
// function to load the quote API
function loadQuoteApi() {
    return fetch("https://zenquotes.io/api/random").then((result) => result.json());
}

function homePage() {
    // call the loadQuoteApi and display the quote on the page
    loadQuoteApi().then((data) => {
        const quoteText = data[0].q + " — " + data[0].a;
        document.getElementById('quote').innerHTML = `"${quoteText}"`;
    });
}

// voice recognition
function initVoiceRecognition() {
    if (annyang) {
      // Define voice commands
      const commands = {
        'hello': () => { alert('Hello!');
        },
        'change the color to *color': (color) => {
            document.body.style.backgroundColor = color.toLowerCase();
            console.log(`Changed background to ${color}`);
        },
        'navigate to *page': (page) => {
            const pageMap = {
                'home': 'homePage.html',
                'stocks': 'stocksPage.html',
                'dogs': 'dogsPage.html',
            };
            const targetPage = pageMap[page.toLowerCase()];
            if (targetPage) {
                window.location.href = targetPage;
            } else {
                alert('Page not found!');
            }
        },
        'look up *stock': (stock) => {
            const stockUpper = stock.replace(/\s+/g, '').toUpperCase(); // removes all spaces and uppercases it
            document.getElementById('ticker').value = stockUpper;
            document.getElementById('days').value = 30; // Default to 30 days
            fetchStockData();
        }
      };
      // Add commands to annyang
      annyang.addCommands(commands);
      
      annyang.addCallback('result', function(phrases) {
        console.log('Heard:', phrases);
      });
  
      // Get the buttons by their IDs
      const startBtn = document.getElementById('start-voice-btn');
      const stopBtn = document.getElementById('stop-voice-btn');
  
      // Start listening when the "Start" button is clicked
      startBtn.addEventListener('click', () => {
        annyang.start();
        console.log('Voice recognition started');
      });
  
      // Stop listening when the "Stop" button is clicked
      stopBtn.addEventListener('click', () => {
        annyang.abort();
        console.log('Voice recognition paused');
      });
    }
  }


// Fetch data from the API and render the table
async function fetchTopStocks() {
    const url = 'https://tradestie.com/api/v1/apps/reddit?date=2022-04-03';
    const response = await fetch(url);
    const data = await response.json();

    const topStocks = data.sort((a, b) => b.no_of_comments - a.no_of_comments).slice(0, 5);
    const tableBody = document.querySelector('#stocks-table tbody');
    tableBody.innerHTML = ''; // Clear existing rows

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


document.addEventListener('DOMContentLoaded', function () {
    initVoiceRecognition(); 
    fetchTopStocks();         
});

window.onload = function () {
    const currentPage = window.location.pathname;
  
    if (currentPage.includes('homePage.html')) {
      homePage();
    }
  };



// new code

let chart; // global variable for Chart.js chart

async function fetchStockData() {
    const ticker = document.getElementById('ticker').value.toUpperCase();
    const days = parseInt(document.getElementById('days').value);
//   const days = parseInt(document.getElementById('days').value);
  const apiKey = '0TBzwF6dyskA6vemZGnGdqGwSnDEJZcL';

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

  // Polygon API call
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${start}/${end}?adjusted=true&sort=asc&limit=${days}&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const result = await response.json();

    if (!result.results) {
      alert("No data found. Check the stock ticker.");
      return;
    }

    // Convert data
    const labels = result.results.map(d => {
      const date = new Date(d.t);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const prices = result.results.map(d => d.c);

    // Build chart
    drawChart(labels, prices, ticker);
  } catch (err) {
    console.error('Fetch error:', err);
    alert("Something went wrong fetching the data.");
  }
}

function drawChart(labels, prices, tickerSymbol) {
  const ctx = document.getElementById('myChart').getContext('2d');
  if (chart) chart.destroy(); // remove previous chart

  const data = {
    labels: labels,
    datasets: [{
      label: `${tickerSymbol} Closing Prices`,
      data: prices,
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const config = {
    type: 'line',
    data: data
  };

  chart = new Chart(ctx, config);
}

