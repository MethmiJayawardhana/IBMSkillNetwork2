const searchInput = document.getElementById('searchInput');
const btnSearch = document.getElementById('btnSearch');
const btnReset = document.getElementById('btnReset');
const resultsContainer = document.getElementById('resultsContainer');

if (btnSearch) btnSearch.addEventListener('click', executeSearch);
if (btnReset) btnReset.addEventListener('click', clearResults);

function executeSearch() {
  const keyword = searchInput.value.trim().toLowerCase();
  
  if (!keyword) {
    alert('Please enter a keyword to search (beach, temple, or country).');
    return;
  }

  resultsContainer.innerHTML = '';

  fetch('./travel_recommendation_api.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load JSON database');
      return response.json();
    })
    .then(data => {
      console.log("Data loaded successfully:", data);
      
      let matchedData = [];

      // Keyword normalization logic
      if (keyword === 'beach' || keyword === 'beaches') {
        matchedData = data.beaches;
      } else if (keyword === 'temple' || keyword === 'temples') {
        matchedData = data.temples;
      } else if (keyword === 'country' || keyword === 'countries') {
        // Flat map loop captures all inner cities inside the three structural countries
        data.countries.forEach(country => {
          country.cities.forEach(city => {
            matchedData.push(city);
          });
        });
      } else {
        // Optional search behavior override check: Check if user typed a specific country name directly
        const directCountryMatch = data.countries.find(c => c.name.toLowerCase() === keyword);
        if (directCountryMatch) {
          matchedData = directCountryMatch.cities;
        }
      }

      // Check validation length outputs
      if (matchedData.length > 0) {
        displayResults(matchedData);
      } else {
        resultsContainer.innerHTML = `<p style="color: white; font-weight: bold; background: rgba(0,0,0,0.6); padding: 1rem; border-radius: 4px;">No matches found for "${searchInput.value}". Try searching for "beach", "temple", or "country".</p>`;
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      resultsContainer.innerHTML = `<p style="color: #ef4444; font-weight: bold;">Error loading recommendations. Please ensure you are viewing through a local development server environment.</p>`;
    });
}

function displayResults(places) {
  places.forEach(place => {
    // Structural layout wrapper card node definition element
    const card = document.createElement('div');
    card.classList.add('card');

    const img = document.createElement('img');
    img.src = place.imageUrl || getSvgPlaceholder(place.name);
    img.alt = place.name;
    img.addEventListener('error', () => {
      if (!img.src.startsWith('data:')) {
        img.src = getSvgPlaceholder(place.name);
        img.alt = `${place.name} image not available`;
      }
    });

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const title = document.createElement('h3');
    title.textContent = place.name;

    const desc = document.createElement('p');
    desc.textContent = place.description;

    cardBody.appendChild(title);
    cardBody.appendChild(desc);

    // Optional Time Zone Calculation Block
    if (place.timeZone) {
      const timeOptions = { 
        timeZone: place.timeZone, 
        hour12: true, 
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric' 
      };
      const localTimeString = new Date().toLocaleTimeString('en-US', timeOptions);
      
      const timeStamp = document.createElement('div');
      timeStamp.classList.add('time-stamp');
      timeStamp.textContent = `Local Time: ${localTimeString}`;
      cardBody.appendChild(timeStamp);
    }

    card.appendChild(img);
    card.appendChild(cardBody);
    
    // Mount complete card component on target screen view window
    resultsContainer.appendChild(card);
  });
}

function clearResults() {
  searchInput.value = '';
  resultsContainer.innerHTML = '';
}

function getSvgPlaceholder(text) {
  const encodedText = encodeURIComponent(text || 'No Image');
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="240">
      <rect width="400" height="240" fill="#e2e8f0" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="24">${encodedText}</text>
    </svg>
  `)}`;
}
