let db;
const request = indexedDB.open('calorieTrackerDB', 1); // Match with app.js

request.onupgradeneeded = function(e) {
    db = e.target.result;
    // Create the object store if it doesn't exist
    if (!db.objectStoreNames.contains('calories')) {
        const store = db.createObjectStore('calories', { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date', { unique: false });
    }
};

request.onsuccess = function(e) {
    db = e.target.result;
    displayChart(); // Call displayChart once the database is opened successfully
};

request.onerror = function(e) {
    console.log('Error: ', e.target.errorCode);
};

function displayChart() {
    let transaction = db.transaction(['calories'], 'readonly'); // Use 'calories' object store
    let objectStore = transaction.objectStore('calories');
    let request = objectStore.getAll();

    request.onsuccess = function() {
        let data = request.result;
        let dailyCalories = {};

        data.forEach(item => {
            let date = item.date;
            if (!dailyCalories[date]) {
                dailyCalories[date] = 0;
            }
            dailyCalories[date] += item.calories;
        });

        updateChart(dailyCalories);
    };

    request.onerror = function(event) {
        console.error('Request error:', event.target.errorCode);
    };
}

let calorieChart;

function updateChart(dailyCalories) {
    let ctx = document.getElementById('calorieChart').getContext('2d');

    let dates = Object.keys(dailyCalories).sort();
    let calorieValues = dates.map(date => dailyCalories[date]);

    if (calorieChart) {
        calorieChart.destroy();
    }

    calorieChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Calories',
                data: calorieValues,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
