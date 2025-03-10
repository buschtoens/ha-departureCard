// developed by BagelBeef
class DepartureCard extends HTMLElement {
  constructor() {
    super();
    this.prevState = null;  // saves the previous state of the departure entity
    this.prevHass = null; // saves the previous Hass
  }
  // Sets the 'hass' state, which holds the Home Assistant data
  set hass(hass) {
    const config = this.config;
    const entity = config.entity;

    //check if entity is valid
    if (!entity || !hass.states || !hass.states?.[entity]) {
      this.innerHTML = `<ha-card>
                          <div class="card-content">
                            <h1>${config.title}</h1>
                            <p>No valid entity.</p>
                          </div>
                        </ha-card>`;
      return;
    }

    const currentState = hass.states[entity].state;

    // Check if entity and attributes has changed
    if (this.prevHass && this.prevHass.states[entity] === hass.states[entity]) {
      return;
    }

    // Check if the state of entity has changed
    if (this.prevState === currentState) {
      return;
    }

    this.prevState = currentState; // save current state
    this.prevHass = hass; // save current hass

    const connectionsAttribute = config.connections_attribute || 'next_departures';
    const displayed_connections = config.displayed_connections || 5;
    const unixTime = config.unix_time || false;
    const convertTimeHHMM = config.convertTimeHHMM || false;

    // Targets (destinations) that should be filtered from the connections list
    const targets = config.connection_properties.targets || [];
    const connections = hass.states[entity].attributes[connectionsAttribute];
    
    // Get stopAttribute and stop for filtering
    const stopAttribute = config.connection_properties.stopAttribute || 'route'; //where to found route list
    const stop = config.connection_properties.filterByStop || null; // filterByStop stop can be null
    const stationName = config.connection_properties.stationName || null; // stationName to slice route up to statioName

    // If no connections are available, display a message saying no departures are available
    if (!connections || connections.length === 0) {
      this.innerHTML = `<ha-card>
                          <div style="padding: 16px;">
                            <h1>${config.title}</h1>
                            <p>No departures available.</p>
                          </div>
                        </ha-card>`;
      return;
    }

    // If there are specified target destinations, filter the connections accordingly
    let filtered_connections = connections;
    if (targets.length > 0) {
      filtered_connections = connections.filter(connection =>
        targets.includes(connection.destination)
      );
    }
    
    // Filter by the specified stop in the route, but only if stop and stopAttribute are valid
    if (stop && stopAttribute) {
      filtered_connections = filtered_connections.filter(connection => {
        const route = connection[stopAttribute];
        if (route && Array.isArray(route)) {
          // Find the index of stationName in the route
          const stationIndex = route.findIndex(routeStop => routeStop.name === stationName);
          if (stationIndex === -1) {
            return false; // stationName is not in the route, so skip this connection
          }

          // Extract stops after stationName
          const stopsAfterStation = route.slice(stationIndex);
          connection[stopAttribute] = stopsAfterStation; // Update the route list to include only stops after stationName

          // Check if the stop exists in the stops after stationName
          return stopsAfterStation.some(routeStop => routeStop.name === stop);
        }
        return false; // No valid route or no valid stops in the route
      });
    }
    
    // If no connections match the specified targets, show a message saying no departures were found
    if (filtered_connections.length === 0) {
      this.innerHTML = `<ha-card>
                          <div style="padding: 16px;">
                            <h1>${config.title}</h1>
                            <p>No departures found for the specified destinations or stops. Check statioName if you want to use filter by stop!</p>
                          </div>
                        </ha-card>`;
      return;
    }

    // Build HTML content to display the departure information
    let departuresHtml = `<ha-card>
                           <div style="padding: 16px;">
                             <h1 style="margin-top: 0px; margin-bottom: 0px;">${config.title}</h1>`;
    
    // Display the filtered stop information, if any
    if (stop) {
      departuresHtml += `<p style="font-size: 0.8em; color: gray; margin-top: 0px;">Filtered by stop: ${stop}</p>`; // Show filtered stop
    }
    
    // Loop through the filtered connections and display them
    filtered_connections.slice(0, displayed_connections).forEach(connection => {
      const train = connection[config.connection_properties.train]; 
      const destination = connection.destination;
      const delay = connection[config.connection_properties.delay] || 0;
      const platform = connection[config.connection_properties.platform] || 'N/A';  // Default to 'N/A' if no platform info
      const isCancelled = connection[config.connection_properties.isCancelled || 'isCancelled'] || 0;
      // Check if a conversion of unix-time is necessary
      let departure;
      if (unixTime) {
        departure = new Date(connection[config.connection_properties.departure] * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      } else if (convertTimeHHMM) {
        departure = new Date(connection[config.connection_properties.departure].replace(' ', 'T')).toTimeString().slice(0, 5);
      } else {
        departure = connection[config.connection_properties.departure] || '';
      }

      // Default color for departure time and text for no delay
      let departureColor = 'green';
      let delayText = '';

      // If there is a delay, adjust color and add delay text
      if (delay > 0) {
        departureColor = 'red';
        delayText = `+${delay}`;
      }
      
      let isCancelledStyle = isCancelled == 1 ? 'text-decoration: line-through; opacity: 0.6;' : '';
      
      departuresHtml += `
        <div style="display: grid; grid-template-columns: 3fr 6fr 2fr 2fr 1fr; gap: 8px; padding: 4px 0; border-bottom: 1px solid rgba(180, 180, 180, 0.6); line-height: 1.2;${isCancelledStyle}">
          <div style="font-size: 0.9em; text-align: left;"><strong>${train}</strong></div>
          <div style="font-size: 0.8em; text-align: left; padding-left: 4px;">${destination}</div>
          <div style="font-size: 0.9em; text-align: left; padding-left: 4px;">
            ${config.connection_properties.show_platform ? platform : ''}
          </div>
          <div style="font-size: 0.9em; text-align: right; color: ${departureColor};">${departure}</div>
          <div style="font-size: 0.9em; text-align: left; color: ${departureColor};">
            ${delayText ? `<span style="color: red;">${delayText}</span>` : ''}
          </div>
        </div>
      `;
    });

    departuresHtml += `</div></ha-card>`;

    this.innerHTML = departuresHtml;
  }

  // Saves the configuration for the custom card
  setConfig(config) {
    this.config = config;
  }

  // Returns a sample configuration for the custom card
  static getStubConfig() {
    return {
      title: "Departures",
      entity: '',
      connections_attribute: 'next_departures',
      displayed_connections: 5,
      unix_time: false,  
      convertTimeHHMM: false,
      connection_properties: {
        targets: '', 
        train: 'train', 
        departure: 'scheduledTime',
        delay: 'delay',
        platform: 'platform',
        show_platform: true,  // Default to true (platform column always rendered)
        isCancelled: 'isCancelled',
        stopAttribute: 'route',  // Attribute for the stops/route
        filterByStop: '',   // The specific stop to filter by
        stationName: ''  // Your stationName for deleting stops before it
      },
    };
  }
}

// Defines the custom HTML element 'departure-card'
customElements.define('departure-card', DepartureCard);
