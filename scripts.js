document.addEventListener('DOMContentLoaded', () => {
  const homePage = document.getElementById('home-page');
  const searchPage = document.getElementById('search-page');
  const chartPage = document.getElementById('chart-page');
  const searchInput = document.getElementById('search-input');
  const suggestionsBox = document.getElementById('suggestions');
  const stockList = document.getElementById('stock-list');
  const stockChartCtx = document.getElementById('stock-chart').getContext('2d');
  const timeRangeSelect = document.getElementById('time-range');

  let chart; // To store the chart instance
  let stockSymbols = []; // List to store fetched stock symbols

  const apiKey = 'W_i92jjoOhLCiZ4yFokDT5CucoP_jNdb';

  // Function to fetch stock data
  const fetchStockData = async (symbol, range) => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - range);

      const endStr = formatDate(endDate);
      const startStr = formatDate(startDate);

      const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startStr}/${endStr}?adjusted=true&sort=asc&limit=100&apiKey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.results.reverse(); // Reverse to display in chronological order
  };

  // Function to format date as yyyy-mm-dd
  const formatDate = (date) => {
      const year = date.getFullYear();
      let month = (1 + date.getMonth()).toString().padStart(2, '0');
      let day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  // Function to fetch stock symbols
  const fetchStockSymbols = async () => {
      const url = `https://api.polygon.io/v3/reference/tickers?market=stocks&active=true&sort=ticker&order=asc&limit=1000&apiKey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      stockSymbols = data.results.map(stock => stock.ticker);
  };

  // Function to display stock data
  const displayStockData = async (symbol) => {
      const range = parseInt(timeRangeSelect.value);
      const stockData = await fetchStockData(symbol, range);
      const dates = stockData.map(item => new Date(item.t).toISOString().split('T')[0]);
      const prices = stockData.map(item => item.c);

      stockList.innerHTML = '';
      const li = document.createElement('li');
      li.textContent = `${symbol}: $${prices[prices.length - 1]}`;
      li.classList.add('list-group-item');
      stockList.appendChild(li);

      // Update chart
      if (chart) {
          chart.destroy();
      }
      chart = new Chart(stockChartCtx, {
          type: 'line',
          data: {
              labels: dates,
              datasets: [{
                  label: `${symbol} Stock Price`,
                  data: prices,
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  fill: true,
              }]
          },
          options: {
              scales: {
                  x: {
                      title: {
                          display: true,
                          text: 'Date'
                      }
                  },
                  y: {
                      title: {
                          display: true,
                          text: 'Price (USD)'
                      }
                  }
              }
          }
      });
  };

  // Function to update suggestions
  const updateSuggestions = (query) => {
      suggestionsBox.innerHTML = '';
      if (query.length > 0) {
          const filteredSymbols = stockSymbols.filter(symbol => symbol.toLowerCase().includes(query.toLowerCase()));
          filteredSymbols.forEach(symbol => {
              const div = document.createElement('div');
              div.textContent = symbol;
              div.addEventListener('click', () => {
                  searchInput.value = symbol;
                  suggestionsBox.innerHTML = '';
                  displayStockData(symbol);
              });
              suggestionsBox.appendChild(div);
          });
      }
  };

  // Event listeners for page navigation
  document.getElementById('home-link').addEventListener('click', () => {
      homePage.classList.remove('d-none');
      searchPage.classList.add('d-none');
      chartPage.classList.add('d-none');
  });

  document.getElementById('search-link').addEventListener('click', () => {
      homePage.classList.add('d-none');
      searchPage.classList.remove('d-none');
      chartPage.classList.add('d-none');
  });

  document.getElementById('chart-link').addEventListener('click', () => {
      homePage.classList.add('d-none');
      searchPage.classList.add('d-none');
      chartPage.classList.remove('d-none');
  });

  // Event listener for search input to show suggestions
  searchInput.addEventListener('input', (e) => {
      updateSuggestions(e.target.value);
  });

  // Event listener for time range selection
  timeRangeSelect.addEventListener('change', () => {
      if (searchInput.value) {
          displayStockData(searchInput.value);
      }
  });

  // Fetch stock symbols when the page loads
  fetchStockSymbols();
});

//API KEy = M1NI2YNNOOQTX6RT