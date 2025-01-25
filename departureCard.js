// v.1 developed by BagelBeef
class DepartureCard extends HTMLElement {
  // Sets the 'hass' state, which holds the Home Assistant data
  set hass(hass) {
    const config = this.config;
    const entity = config.entity;
    const connectionsAttribute = config.connections_attribute || 'next_departures';
    const displayed_connections = config.displayed_connections || 5;
    const unixTime = config.unix_time || false;

    // Targets (destinations) that should be filtered from the connections list
    const targets = config.connection_properties.targets || [];
    const connections = hass.states[entity].attributes[connectionsAttribute];

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

    // If no connections match the specified targets, show a message saying no departures were found
    if (filtered_connections.length === 0) {
      this.innerHTML = `<ha-card>
                          <div style="padding: 16px;">
                            <h1>${config.title}</h1>
                            <p>No departures found for the specified destinations.</p>
                          </div>
                        </ha-card>`;
      return;
    }

    // Build HTML content to display the departure information
    let departuresHtml = `<ha-card>
                           <div style="padding: 16px;">
                             <h1>${config.title}</h1>`;

    // Loop through the filtered connections and display them
    filtered_connections.slice(0, displayed_connections).forEach(connection => {
      const train = connection[config.connection_properties.train]; 
      const destination = connection.destination;
      const delay = connection[config.connection_properties.delay] || 0;
      const platform = connection[config.connection_properties.platform] || 'N/A';  // Default to 'N/A' if no platform info

      // Check if a conversion of unix-time is necessary
      let departure;
      if (unixTime) {
        departure = new Date(connection[config.connection_properties.departure] * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      } else {
        departure = connection[config.connection_properties.departure];
      }

      // Default color for departure time and text for no delay
      let departureColor = 'green';
      let delayText = '';

      // If there is a delay, adjust color and add delay text
      if (delay > 0) {
        departureColor = 'red';
        delayText = `+${delay}`;
      }

      departuresHtml += `
        <div style="display: grid; grid-template-columns: 2fr 8fr 2fr 2fr 1fr; gap: 8px; padding: 4px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.3); line-height: 1.2;">
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
      unix_time: true,  // Default to true (convert timestamps)
      connection_properties: {
        targets: '', 
        train: 'train', 
        departure: 'scheduledTime',
        delay: 'delay',
        platform: 'platform',
        show_platform: true,  // Default to true (platform column always rendered)
      },
    };
  }
}

// Defines the custom HTML element 'departure-card'
customElements.define('departure-card', DepartureCard);
