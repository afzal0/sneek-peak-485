class VisaDashboard {
    constructor() {
        this.currentSection = 'overview';
        this.data = {};
        this.filteredData = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadAllData();
        // Small delay to ensure smooth transition
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showSection('overview');
        }, 300);
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Year filter
        document.getElementById('year-filter').addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                document.getElementById('date-range').style.display = 'block';
                this.initDateRangePicker();
            } else {
                document.getElementById('date-range').style.display = 'none';
                this.applyYearFilter(e.target.value);
            }
        });
        
        // Visualization tabs
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('viz-tab')) {
                const vizType = e.target.dataset.viz;
                const parent = e.target.closest('.content-section');
                
                // Update tab states
                parent.querySelectorAll('.viz-tab').forEach(tab => {
                    tab.classList.toggle('active', tab.dataset.viz === vizType);
                });
                
                // Update content visibility
                parent.querySelectorAll('.viz-content').forEach(content => {
                    content.classList.toggle('active', content.id === `${vizType}-view`);
                });
                
                // Handle special cases
                if (vizType === 'globe3d' && !this.globeInitialized) {
                    this.initGlobe();
                    this.globeInitialized = true;
                }
            }
        });

        // Window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.redrawCurrentSection();
            }, 250);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const sections = ['overview', 'demographics', 'geographic', 'funnel', 'forecast'];
                const currentIndex = sections.indexOf(this.currentSection);
                
                if (e.key === 'ArrowUp' && currentIndex > 0) {
                    this.showSection(sections[currentIndex - 1]);
                } else if (e.key === 'ArrowDown' && currentIndex < sections.length - 1) {
                    this.showSection(sections[currentIndex + 1]);
                }
            }
        });
    }

    async loadAllData() {
        try {
            const [overview, demographics, geographic, funnel, forecast] = await Promise.all([
                api.getOverview(),
                api.getDemographics(),
                api.getGeographic(),
                api.getFunnelData(),
                api.getForecast()
            ]);

            this.data = {
                overview,
                demographics,
                geographic,
                funnel,
                forecast
            };

            console.log('Data loaded:', this.data);
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load data. Please refresh the page.');
        }
    }

    showSection(sectionName) {
        // Update sidebar navigation
        document.querySelectorAll('.menu-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        this.currentSection = sectionName;
        this.renderSection(sectionName);
    }

    renderSection(sectionName) {
        const dataToUse = this.filteredData || this.data;
        
        switch (sectionName) {
            case 'overview':
                this.renderOverviewSection(dataToUse);
                break;
            case 'demographics':
                this.renderDemographicsSection(dataToUse);
                break;
            case 'geographic':
                this.renderGeographicSection(dataToUse);
                break;
            case 'funnel':
                this.renderFunnelSection(dataToUse);
                break;
            case 'forecast':
                this.renderForecastSection(dataToUse);
                break;
        }
    }

    renderOverviewSection(data) {
        // Animate counters with smooth easing
        this.animateCounter('total-lodged-counter', data.overview.total_lodged);
        this.animateCounter('total-granted-counter', data.overview.total_granted);
        this.animateCounter('success-rate-counter', data.overview.success_rate || 0, '%');
        this.animateCounter('total-rejected-counter', data.overview.total_rejected || 0);

        // Create overview chart
        const ctx = document.getElementById('overview-chart').getContext('2d');
        chartManager.createOverviewChart(ctx, data.overview);
        
        // Initialize advanced visualizations
        this.initAdvancedVisualizations(data);
    }
    
    initAdvancedVisualizations(data) {
        // 1. Waterfall Chart
        const waterfallSteps = [
            { label: 'Lodged', value: data.overview.total_lodged, isTotal: false },
            { label: 'Granted', value: -data.overview.total_granted, isTotal: false },
            { label: 'Refused', value: -(data.overview.total_rejected || 0), isTotal: false },
            { label: 'Net Total', value: data.overview.total_lodged - data.overview.total_granted - (data.overview.total_rejected || 0), isTotal: true }
        ];
        advancedCharts.initWaterfall('waterfall-chart', waterfallSteps);
        
        // 2. Calendar Heatmap (simulated daily data)
        const calendarData = this.generateCalendarData(data.overview);
        advancedCharts.initCalendarHeatmap('calendar-heatmap', calendarData);
        
        // 3. Bump Chart (simulated monthly country rankings)
        const bumpData = this.generateBumpChartData(data.demographics?.countries || []);
        advancedCharts.initBumpChart('bump-chart', bumpData);
    }
    
    generateCalendarData(overview) {
        // Simulate daily application data based on yearly totals
        const dailyData = [];
        const startDate = new Date('2023-01-01');
        const endDate = new Date('2024-12-31');
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            // Simulate daily volume with some variation
            const baseVolume = Math.floor(overview.total_lodged / 730); // Spread over 2 years
            const variation = Math.random() * 0.3 + 0.85; // 85% to 115%
            const weekdayMultiplier = d.getDay() >= 1 && d.getDay() <= 5 ? 1.2 : 0.4; // Weekdays higher
            
            dailyData.push({
                date: d.toISOString().split('T')[0],
                count: Math.floor(baseVolume * variation * weekdayMultiplier)
            });
        }
        
        return dailyData;
    }
    
    generateBumpChartData(countries) {
        // Simulate monthly rankings for top countries
        const months = ['2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06',
                       '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12',
                       '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];
        
        const bumpData = [];
        const topCountries = countries.slice(0, 8);
        
        months.forEach(month => {
            topCountries.forEach(country => {
                // Add some variation to make interesting rankings
                const baseVolume = country.lodged || 1000;
                const variation = 0.8 + Math.random() * 0.4; // 80% to 120% variation
                
                bumpData.push({
                    month,
                    country: country.country,
                    lodged: Math.floor(baseVolume * variation)
                });
            });
        });
        
        return bumpData;
    }

    renderDemographicsSection(data) {
        // Update gender counts
        if (data.demographics.gender && data.demographics.gender.length >= 2) {
            document.getElementById('gender-male-count').textContent = 
                data.demographics.gender[0].count.toLocaleString();
            document.getElementById('gender-female-count').textContent = 
                data.demographics.gender[1].count.toLocaleString();
        }

        // Create treemap
        const treemapContainer = document.getElementById('treemap-container');
        if (treemapContainer && data.demographics.countries) {
            chartManager.createTreemap(treemapContainer, data.demographics.countries);
        }

        // Create applicant type chart
        const applicantCtx = document.getElementById('applicant-type-chart');
        if (applicantCtx && data.demographics.applicant_type) {
            chartManager.createApplicantTypeChart(applicantCtx.getContext('2d'), data.demographics.applicant_type);
        }
        
        // Initialize chord diagram
        this.initChordDiagram(data.demographics.countries || []);
    }
    
    initChordDiagram(countries) {
        // Create flow data for chord diagram
        const flows = [];
        countries.slice(0, 8).forEach(country => {
            // Simulate granted vs rejected flows
            const granted = Math.floor(country.granted || country.lodged * 0.85);
            const rejected = (country.lodged || 0) - granted;
            
            flows.push({
                country: country.country,
                decision: 'Granted',
                count: granted
            });
            
            if (rejected > 0) {
                flows.push({
                    country: country.country,
                    decision: 'Rejected', 
                    count: rejected
                });
            }
        });
        
        advancedCharts.initChordDiagram('chord-diagram', flows);
    }

    renderGeographicSection(data) {
        const mapContainer = document.getElementById('world-map');
        if (mapContainer && data.geographic) {
            chartManager.createWorldMap(mapContainer, data.geographic);
        }
        
        // Initialize ridgeline chart with simulated processing times
        this.initRidgelineChart(data.geographic || []);
    }
    
    initRidgelineChart(countries) {
        // Simulate processing time distributions
        const processingData = [];
        countries.slice(0, 10).forEach(country => {
            const baseDays = 30 + Math.random() * 60; // 30-90 days base
            const count = Math.min(country.lodged || 1000, 500); // Limit samples
            
            for (let i = 0; i < count; i++) {
                // Generate distribution with some skew
                const variation = Math.random() * Math.random() * 120; // Right-skewed
                processingData.push({
                    group: country.country,
                    days: Math.floor(baseDays + variation)
                });
            }
        });
        
        advancedCharts.initRidgeline('ridgeline-chart', processingData);
    }
    
    initDateRangePicker() {
        const dateRangeInput = document.getElementById('date-range');
        
        if (!this.flatpickrInstance) {
            this.flatpickrInstance = flatpickr(dateRangeInput, {
                mode: 'range',
                dateFormat: 'Y-m-d',
                defaultDate: ['2020-01-01', '2024-12-31'],
                maxDate: '2024-12-31',
                minDate: '2007-01-01',
                onChange: (selectedDates, dateStr) => {
                    if (selectedDates.length === 2) {
                        this.applyCustomDateRange(selectedDates[0], selectedDates[1]);
                    }
                }
            });
        }
    }
    
    applyCustomDateRange(startDate, endDate) {
        console.log('Custom date range applied:', startDate, endDate);
        // Here you would filter data based on the date range
        // For now, we'll use the existing filter mechanism
        this.applyYearFilter('custom', { startDate, endDate });
    }
    
    initGlobe() {
        // Initialize globe with geographic data
        if (this.data.geographic) {
            const flows = this.data.geographic.map(country => ({
                country: country.country,
                count: country.lodged || 0,
                lat: this.getCountryLatLng(country.country).lat,
                lng: this.getCountryLatLng(country.country).lng
            }));
            
            advancedCharts.initSimpleGlobe('globe-container', flows);
        }
    }
    
    getCountryLatLng(countryName) {
        // Simple mapping of countries to coordinates
        const coordinates = {
            'China': { lat: 35.8617, lng: 104.1954 },
            'India': { lat: 20.5937, lng: 78.9629 },
            'Nepal': { lat: 28.3949, lng: 84.1240 },
            'Pakistan': { lat: 30.3753, lng: 69.3451 },
            'Sri Lanka': { lat: 7.8731, lng: 80.7718 },
            'Philippines': { lat: 12.8797, lng: 121.7740 },
            'Vietnam': { lat: 14.0583, lng: 108.2772 },
            'Indonesia': { lat: -0.7893, lng: 113.9213 },
            'Thailand': { lat: 15.8700, lng: 100.9925 },
            'Malaysia': { lat: 4.2105, lng: 101.9758 },
            'Bangladesh': { lat: 23.6850, lng: 90.3563 },
            'South Korea': { lat: 35.9078, lng: 127.7669 },
            'United States': { lat: 37.0902, lng: -95.7129 },
            'United Kingdom': { lat: 55.3781, lng: -3.4360 },
            'Canada': { lat: 56.1304, lng: -106.3468 }
        };
        
        return coordinates[countryName] || { lat: 0, lng: 0 };
    }

    renderFunnelSection(data) {
        const sankeyContainer = document.getElementById('sankey-container');
        if (sankeyContainer && data.funnel) {
            chartManager.createSankeyDiagram(sankeyContainer, data.funnel);
        }
    }

    renderForecastSection(data) {
        // Create forecast chart
        const ctx = document.getElementById('forecast-chart');
        if (ctx && data.forecast) {
            chartManager.createForecastChart(ctx.getContext('2d'), data.forecast);
        }
    }

    animateCounter(elementId, targetValue, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Use IntersectionObserver to trigger animation only when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Smooth easing function
                    const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
                    
                    const duration = 2000;
                    const startTime = performance.now();
                    const startValue = 0;
                    
                    const animate = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const easedProgress = easeOutQuart(progress);
                        
                        const currentValue = startValue + (targetValue - startValue) * easedProgress;
                        
                        if (suffix && elementId.includes('rate')) {
                            element.textContent = currentValue.toFixed(1) + suffix;
                        } else {
                            element.textContent = Math.floor(currentValue).toLocaleString();
                        }
                        
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    };
                    
                    requestAnimationFrame(animate);
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(element);
    }

    applyYearFilter(filterValue) {
        console.log('Year filter applied:', filterValue);
        
        // Apply filter using chartManager
        this.filteredData = chartManager.applyFilter(filterValue, this.data);
        
        // Redraw current section with filtered data
        this.redrawCurrentSection();
        
        // Update counters if on overview section
        if (this.currentSection === 'overview') {
            this.animateCounter('total-lodged-counter', this.filteredData.overview.total_lodged);
            this.animateCounter('total-granted-counter', this.filteredData.overview.total_granted);
            this.animateCounter('success-rate-counter', this.filteredData.overview.success_rate);
            this.animateCounter('total-rejected-counter', this.filteredData.overview.total_rejected);
        }
    }

    redrawCurrentSection() {
        // Destroy existing charts to prevent memory leaks
        chartManager.destroyCharts();
        
        // Redraw the current section
        this.renderSection(this.currentSection);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    showError(message) {
        console.error(message);
        // You could show a toast notification or modal here
        alert(message);
    }
}

// Add CSS for content sections
const additionalCSS = `
.content-section {
    display: none;
    animation: fadeIn 0.3s ease;
}

.content-section.active {
    display: block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Initialize the dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new VisaDashboard();
});