let db;
const request = indexedDB.open('foodTracker', 1);

request.onsuccess = function(e) {
    db = e.target.result;
    displayChart();
};

request.onerror = function(e) {
    console.log('Error: ', e.target.errorCode);
};

function displayChart() {
    let transaction = db.transaction(['foods'], 'readonly');
    let objectStore = transaction.objectStore('foods');
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
