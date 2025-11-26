const CONFIG_PATH = 'data/config.json';
let configuration;
let activeTotem;
let selectedDestination;

const mapContainer = document.getElementById('map-container');
const youAreHereMarker = document.getElementById('you-are-here');
const poiMarkersContainer = document.getElementById('poi-markers');
const destinationList = document.getElementById('destination-list');
const totemName = document.getElementById('totem-name');
const directionsLink = document.getElementById('directions-link');
const destinationCardTemplate = document.getElementById('destination-card-template');

async function loadConfiguration() {
  const response = await fetch(CONFIG_PATH);
  if (!response.ok) {
    throw new Error('Unable to load map configuration.');
  }
  return response.json();
}

function getTotemFromQuery(config) {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('totem');
  const fallbackId = config.defaultTotemId ?? config.totems[0]?.id;
  if (!fallbackId) {
    throw new Error('Configuration is missing at least one totem.');
  }
  return config.totems.find((t) => t.id === fromQuery) ?? config.totems.find((t) => t.id === fallbackId) ?? config.totems[0];
}

function placeMarker(element, mapPosition) {
  element.style.left = `${mapPosition.x}%`;
  element.style.top = `${mapPosition.y}%`;
  element.hidden = false;
}

function createPoiMarker(destination) {
  const marker = document.createElement('button');
  marker.className = 'poi-marker';
  marker.style.left = `${destination.mapPosition.x}%`;
  marker.style.top = `${destination.mapPosition.y}%`;
  marker.type = 'button';
  marker.title = destination.name;
  marker.setAttribute('aria-label', destination.name);
  marker.addEventListener('click', () => selectDestination(destination.id));
  marker.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectDestination(destination.id);
    }
  });
  return marker;
}

function renderPoiMarkers(destinations) {
  poiMarkersContainer.innerHTML = '';
  destinations.forEach((destination) => {
    const marker = createPoiMarker(destination);
    poiMarkersContainer.appendChild(marker);
  });
}

function renderDestinationList(destinations) {
  destinationList.innerHTML = '';
  destinations.forEach((destination) => {
    const card = destinationCardTemplate.content.firstElementChild.cloneNode(true);
    card.dataset.destinationId = destination.id;
    card.querySelector('h3').textContent = destination.name;
    card.querySelector('.description').textContent = destination.description;
    card.querySelector('.meta').textContent = destination.category;

    const activate = () => selectDestination(destination.id);
    card.addEventListener('click', activate);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });

    destinationList.appendChild(card);
  });
}

function highlightCard(destinationId) {
  destinationList.querySelectorAll('.destination-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.destinationId === destinationId);
  });
}

function buildGoogleMapsLink(origin, destination) {
  const originParam = `${origin.lat},${origin.lng}`;
  const destinationParam = `${destination.coordinates.lat},${destination.coordinates.lng}`;
  const label = encodeURIComponent(destination.name);
  return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destinationParam}&destination_place_id=&travelmode=driving&dir_action=navigate&destination_place=${label}`;
}

function selectDestination(destinationId) {
  const destination = configuration.destinations.find((dest) => dest.id === destinationId);
  if (!destination) return;
  selectedDestination = destination;
  highlightCard(destinationId);

  const googleMapsUrl = buildGoogleMapsLink(activeTotem.coordinates, destination);
  directionsLink.href = googleMapsUrl;
  directionsLink.hidden = false;
  directionsLink.textContent = `Rota para ${destination.name}`;
}

async function init() {
  try {
    configuration = await loadConfiguration();
    activeTotem = getTotemFromQuery(configuration);

    totemName.textContent = activeTotem.name;
    placeMarker(youAreHereMarker, activeTotem.mapPosition);

    renderPoiMarkers(configuration.destinations);
    renderDestinationList(configuration.destinations);

    if (configuration.destinations[0]) {
      selectDestination(configuration.destinations[0].id);
    }
  } catch (error) {
    console.error(error);
    totemName.textContent = 'Unable to load map';
    destinationList.innerHTML = '<p role="alert">Something went wrong while loading the condominium map. Please try scanning again.</p>';
  }
}

document.addEventListener('DOMContentLoaded', init);
