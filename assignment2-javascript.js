
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
        }
      };
      // Add commands to annyang
      annyang.addCommands(commands);
  
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

  

// document.addEventListener('DOMContentLoaded', initVoiceRecognition);

document.addEventListener('DOMContentLoaded', function () {
    initVoiceRecognition(); 
    fetchTopStocks();         
});

window.onload = homePage;


