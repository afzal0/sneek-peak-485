# VisaFlow Analytics Dashboard

A modern, Vision UI-inspired analytics dashboard for Australian Temporary Graduate Visa (subclass 485) data visualization.

## Features

- 🎨 **Glassmorphism Design**: Dark theme with backdrop blur effects
- 📊 **Interactive Charts**: Line charts, donut charts, treemap, world map, and Sankey diagrams
- 📱 **Responsive Layout**: Mobile-friendly with collapsible sidebar
- 🔍 **Data Filtering**: Year-based filtering across all visualizations
- ♿ **Accessible**: WCAG 2.2 compliant with proper focus indicators

## Quick Start

1. Install dependencies:
   ```bash
   pip install flask pandas numpy openpyxl
   ```

2. Run the application:
   ```bash
   python app.py
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:9000
   ```

## Project Structure

```
├── app.py                          # Main Flask application
├── templates/index.html            # HTML template
├── static/
│   ├── css/styles.css              # Vision UI styles
│   └── js/
│       ├── api.js                  # API communication
│       ├── charts.js               # Chart visualizations
│       └── app.js                  # Main application logic
└── *.xlsx                          # Australian visa data files
```

## Tech Stack

- **Backend**: Flask, Pandas, NumPy
- **Frontend**: Vanilla JavaScript, D3.js, Chart.js
- **Design**: CSS3 with glassmorphism effects
- **Data**: Excel files with visa statistics

## Dashboard Sections

1. **Overview**: Total statistics and trends over time
2. **Demographics**: Country breakdown and applicant analysis  
3. **Global Flow**: Interactive world map visualization
4. **Application Flow**: Sankey diagram showing visa processing
5. **Future Trends**: Historical data with forecasting

---

Built with ❤️ inspired by Vision UI Dashboard design principles.