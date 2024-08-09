document.addEventListener('DOMContentLoaded', () => {
    const dbRequest = indexedDB.open('calorieTrackerDB', 1);
    let db;

    dbRequest.onupgradeneeded = function(event) {
        db = event.target.result;
        const store = db.createObjectStore('calories', { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date', { unique: false });
    };

    dbRequest.onsuccess = function(event) {
        db = event.target.result;
    };

    dbRequest.onerror = function(event) {
        console.error('Database error:', event.target.errorCode);
    };

    const foodForm = document.getElementById('food-form');
    foodForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const entryDate = document.getElementById('entry-date').value;
        const foodCategory = document.getElementById('food-category').value;
        const amount = document.getElementById('amount').value;

        if (!entryDate) {
            alert('Please select a date first.');
            return;
        }

        const transaction = db.transaction(['calories'], 'readwrite');
        const store = transaction.objectStore('calories');
        const data = {
            date: entryDate,
            category: foodCategory,
            amount: parseInt(amount),
            calories: calculateCalories(foodCategory, parseInt(amount))
        };
        store.add(data);

        transaction.oncomplete = function() {
            displayDataForDate(entryDate);
            foodForm.reset();
            updateFoodPicture('');
        };

        transaction.onerror = function(event) {
            console.error('Transaction error:', event.target.errorCode);
        };
    });

    document.getElementById('food-category').addEventListener('change', (event) => {
        const foodCategory = event.target.value;
        updateFoodPicture(foodCategory);
    });

    function updateFoodPicture(category) {
        const foodPicture = document.getElementById('food-picture');
        const foodPictures = {
            rice: 'images/rice.jpg',
            chicken: 'images/chicken.jpg',
            vegetable: 'images/vegetable.jpg',
            fish: 'images/fish.jpg',
            pork: 'images/pork.jpg',
            beef: 'images/beef.jpg',
            seafood: 'images/seafood.jpg',
            pizza: 'images/pizza.jpg',
            spaghetti: 'images/spaghetti.jpg',
            bread: 'images/bread.jpg',
            noodle: 'images/noodle.jpg',
            fruits: 'images/fruits.jpg',
            general: 'images/general_food.jpg'
        };

        foodPicture.src = foodPictures[category] || foodPictures['general'];
        foodPicture.style.display = 'block';
    }

    flatpickr('#calendar', {
        inline: true,
        onChange: function(selectedDates, dateStr, instance) {
            document.getElementById('entry-date').value = dateStr;
            displayDataForDate(dateStr);
        }
    });

    function calculateCalories(category, amount) {
        const calorieMap = {
            rice: 130,
            chicken: 165,
            vegetable: 55,
            fish: 206,
            pork: 242,
            beef: 250,
            seafood: 99,
            pizza: 266,
            spaghetti: 158,
            bread: 265,
            noodle: 138,
            fruits: 52
        };
        return (calorieMap[category] || 0) * (amount / 100);
    }

    function displayDataForDate(dateStr) {
        const transaction = db.transaction(['calories'], 'readonly');
        const store = transaction.objectStore('calories');
        const index = store.index('date');
        const request = index.getAll(dateStr);

        request.onsuccess = function(event) {
            const result = event.target.result;
            document.getElementById('food-tables').innerHTML = renderFoodTable(dateStr, result);
        };

        request.onerror = function(event) {
            console.error('Request error:', event.target.errorCode);
        };
    }

    function renderFoodTable(date, items) {
        if (items.length === 0) {
            return `<h3>${date}</h3><p>No data available for this date.</p>`;
        }

        let tableHTML = `<h3>${date}</h3><table><thead><tr><th>Category</th><th>Amount</th><th>Calories</th><th>Action</th></tr></thead><tbody>`;
        let dailyTotalCalories = 0;

        items.forEach(item => {
            dailyTotalCalories += item.calories;
            tableHTML += `<tr><td>${item.category}</td><td>${item.amount}</td><td>${item.calories.toFixed(2)}</td><td><button onclick="deleteEntry(${item.id}, '${date}')">Delete</button></td></tr>`;
        });

        tableHTML += `<tr><td colspan="2"><strong>Total</strong></td><td><strong>${dailyTotalCalories.toFixed(2)}</strong></td><td></td></tr></tbody></table>`;
        return tableHTML;
    }

    window.deleteEntry = function(id, dateStr) {
        const transaction = db.transaction(['calories'], 'readwrite');
        const store = transaction.objectStore('calories');
        store.delete(id);

        transaction.oncomplete = function() {
            displayDataForDate(dateStr);
        };

        transaction.onerror = function(event) {
            console.error('Delete transaction error:', event.target.errorCode);
        };
    };
});
