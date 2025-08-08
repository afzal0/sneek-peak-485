const API_BASE_URL = '/api';

class VisaAPI {
    constructor() {
        this.cache = new Map();
    }

    async fetchWithCache(endpoint) {
        if (this.cache.has(endpoint)) {
            return this.cache.get(endpoint);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.cache.set(endpoint, data);
            return data;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            throw error;
        }
    }

    getOverview() {
        return this.fetchWithCache('/overview');
    }

    getDemographics() {
        return this.fetchWithCache('/demographics');
    }

    getGeographic() {
        return this.fetchWithCache('/geographic');
    }

    getFunnelData() {
        return this.fetchWithCache('/funnel');
    }

    getForecast() {
        return this.fetchWithCache('/forecast');
    }
}

const api = new VisaAPI();