// State Management
const state = {
    expenses: [],
    budget: 0,
    categoryBudgets: {},
    reminders: [],
    streak: 0,
    salaryDate: 1, // Day of month
    selectedCategory: null,
    darkMode: false,
    selectedChartMonth: null, // null = current month
    profile: {
        name: '',
        age: '',
        occupation: '',
        city: ''
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initializeApp();
    setupEventListeners();
    updateUI();
    checkSalaryCountdown();
    showRecentSuggestions();
});

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('expenseTrackerState');
    if (saved) {
        Object.assign(state, JSON.parse(saved));
    }
    
    // Set today's date as default and max date
    const dateInput = document.getElementById('expenseDate');
    const today = new Date();
    dateInput.valueAsDate = today;
    dateInput.max = today.toISOString().split('T')[0]; // Block future dates
    
    // Apply dark mode
    if (state.darkMode) {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('darkModeToggle').textContent = '☀️';
    }
    
    // Load profile data into form
    loadProfileForm();
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('expenseTrackerState', JSON.stringify(state));
}

// Initialize app
function initializeApp() {
    // Set default budget if not set
    if (state.budget === 0) {
        state.budget = 50000; // Default ₹50,000
    }
    
    // Initialize category budgets
    const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'];
    categories.forEach(cat => {
        if (!state.categoryBudgets[cat]) {
            state.categoryBudgets[cat] = 0;
        }
    });
}

// Event Listeners
function setupEventListeners() {
    // Category selection
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => selectCategory(btn));
    });
    
    // Add expense
    document.getElementById('addExpenseBtn').addEventListener('click', addExpense);
    
    // Amount input
    document.getElementById('expenseAmount').addEventListener('input', validateForm);
    
    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    
    // Menu
    document.getElementById('menuBtn').addEventListener('click', () => {
        document.getElementById('menuModal').classList.add('active');
    });
    
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('menuModal').classList.remove('active');
    });
    
    // Budget edit
    document.getElementById('setBudgetBtn').addEventListener('click', setBudget);
    
    // Tabs
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Filter
    document.getElementById('filterPeriod').addEventListener('change', handleFilterChange);
    
    // Custom date range
    document.getElementById('applyDateRange').addEventListener('click', applyCustomDateRange);
    
    // Daily Savings Goal Calculator
    const dailySavingsInput = document.getElementById('dailySavings');
    if (dailySavingsInput) {
        dailySavingsInput.addEventListener('input', calculateWhatIf);
    }
    
    // Menu actions
    document.getElementById('clearData').addEventListener('click', clearAllData);
    document.getElementById('addReminderBtn').addEventListener('click', addReminder);
    
    // Chart month filter
    const chartMonthFilter = document.getElementById('chartMonthFilter');
    if (chartMonthFilter) {
        chartMonthFilter.addEventListener('change', (e) => {
            state.selectedChartMonth = e.target.value;
            saveState();
            updateMainPieChart();
        });
    }
    
    // Profile save
    document.getElementById('saveProfile').addEventListener('click', saveProfile);
}

// Select category
function selectCategory(btn) {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.selectedCategory = btn.dataset.category;
    validateForm();
}

// Validate form
function validateForm() {
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const addBtn = document.getElementById('addExpenseBtn');
    addBtn.disabled = !(amount > 0 && state.selectedCategory);
}

// Add expense
function addExpense() {
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = state.selectedCategory;
    const notes = document.getElementById('expenseNotes').value;
    const dateInput = document.getElementById('expenseDate');
    const date = dateInput.value;
    
    // Validate date is not in future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (selectedDate > today) {
        alert('Cannot add expenses for future dates!');
        dateInput.valueAsDate = new Date();
        return;
    }
    
    const expense = {
        id: Date.now(),
        amount,
        category,
        notes,
        date: date || new Date().toISOString().split('T')[0],
        timestamp: Date.now()
    };
    
    state.expenses.unshift(expense);
    saveState();
    
    // Reset form
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseNotes').value = '';
    const today2 = new Date();
    dateInput.valueAsDate = today2;
    dateInput.max = today2.toISOString().split('T')[0];
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
    state.selectedCategory = null;
    validateForm();
    
    // Update UI
    updateUI();
    showRecentSuggestions();
    
    // Check if under budget
    checkBudgetStatus();
    
    // Show animation
    showExpenseAddedAnimation();
}

// Delete expense
function deleteExpense(id) {
    if (confirm('Delete this expense?')) {
        state.expenses = state.expenses.filter(e => e.id !== id);
        saveState();
        updateUI();
    }
}

// Update UI
function updateUI() {
    updateGreeting();
    updateBudgetOverview();
    updateHeaderBudget();
    updateExpensesList();
    updateRecentExpensesPreview();
    updateInsights();
    updateReminders();
}

// Update budget overview
function updateBudgetOverview() {
    const total = getTotalSpent('month');
    const left = state.budget - total;
    const percentage = (total / state.budget) * 100;
    
    document.getElementById('budgetAmount').textContent = formatCurrency(state.budget);
    document.getElementById('totalSpent').textContent = formatCurrency(total);
    document.getElementById('budgetLeft').textContent = formatCurrency(Math.max(0, left));
    
    const progressBar = document.getElementById('budgetProgressBar');
    progressBar.style.width = Math.min(percentage, 100) + '%';
    
    // Color coding
    progressBar.className = 'progress-fill';
    if (percentage >= 100) {
        progressBar.classList.add('danger');
    } else if (percentage >= 80) {
        progressBar.classList.add('warning');
    }
}

// Update header budget
function updateHeaderBudget() {
    const total = getTotalSpent('month');
    const left = state.budget - total;
    
    document.getElementById('headerBudget').textContent = formatCurrency(state.budget);
    document.getElementById('headerSpent').textContent = formatCurrency(total);
    document.getElementById('headerRemaining').textContent = formatCurrency(Math.max(0, left));
}

// Get total spent
function getTotalSpent(period = 'month') {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const filtered = state.expenses.filter(e => {
        const expenseDate = new Date(e.date);
        expenseDate.setHours(0, 0, 0, 0);
        
        if (period === 'today') {
            return expenseDate.getTime() === now.getTime();
        } else if (period === 'week') {
            // Get start of current week (Sunday)
            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay();
            startOfWeek.setDate(startOfWeek.getDate() - day);
            startOfWeek.setHours(0, 0, 0, 0);
            
            return expenseDate >= startOfWeek && expenseDate <= now;
        } else if (period === 'month') {
            return expenseDate.getMonth() === now.getMonth() && 
                   expenseDate.getFullYear() === now.getFullYear();
        }
        return true;
    });
    
    return filtered.reduce((sum, e) => sum + e.amount, 0);
}

// Update expenses list (table format)
function updateExpensesList() {
    const period = document.getElementById('filterPeriod').value;
    const tbody = document.getElementById('expensesTableBody');
    
    // Add loading state
    tbody.classList.add('loading');
    
    setTimeout(() => {
        let filtered;
        let periodLabel = period;
        
        if (period === 'custom') {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            if (startDate && endDate) {
                filtered = getFilteredExpenses(period, startDate, endDate);
                periodLabel = `${formatDate(startDate)} to ${formatDate(endDate)}`;
            } else {
                filtered = [];
                periodLabel = 'custom range';
            }
        } else {
            filtered = getFilteredExpenses(period);
            periodLabel = period === 'today' ? 'today' : period === 'week' ? 'this week' : 'this month';
        }
        
        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="empty-state">
                            <div class="empty-state-icon">📭</div>
                            <p>No expenses for ${periodLabel}. Start tracking!</p>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            // Sort by date (newest first)
            const sortedExpenses = filtered.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA; // Descending order
            });
            
            tbody.innerHTML = sortedExpenses.map(expense => `
                <tr>
                    <td>${formatDate(expense.date)}</td>
                    <td>
                        <div class="category-cell">
                            <span class="category-emoji">${getCategoryEmoji(expense.category)}</span>
                            <span>${expense.category}</span>
                        </div>
                    </td>
                    <td>${expense.notes || '-'}</td>
                    <td class="amount-cell">₹${expense.amount.toLocaleString('en-IN')}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteExpense(${expense.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
        
        tbody.classList.remove('loading');
    }, 100);
}

// Update recent expenses preview
function updateRecentExpensesPreview() {
    const container = document.getElementById('recentExpensesPreview');
    if (!container) return;
    
    // Sort by date (newest first) and take top 5
    const sortedExpenses = [...state.expenses].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });
    const recent = sortedExpenses.slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No expenses yet</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="expenses-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${recent.map(expense => `
                    <tr>
                        <td>${formatDate(expense.date)}</td>
                        <td>
                            <div class="category-cell">
                                <span class="category-emoji">${getCategoryEmoji(expense.category)}</span>
                                <span>${expense.category}</span>
                            </div>
                        </td>
                        <td>${expense.notes || '-'}</td>
                        <td class="amount-cell">₹${expense.amount.toLocaleString('en-IN')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Get filtered expenses
function getFilteredExpenses(period, customStart = null, customEnd = null) {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day
    
    return state.expenses.filter(e => {
        const expenseDate = new Date(e.date);
        expenseDate.setHours(0, 0, 0, 0); // Reset to start of day
        
        if (period === 'today') {
            return expenseDate.getTime() === now.getTime();
        } else if (period === 'week') {
            // Get start of current week (Sunday)
            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay();
            startOfWeek.setDate(startOfWeek.getDate() - day);
            startOfWeek.setHours(0, 0, 0, 0);
            
            return expenseDate >= startOfWeek && expenseDate <= now;
        } else if (period === 'month') {
            return expenseDate.getMonth() === now.getMonth() && 
                   expenseDate.getFullYear() === now.getFullYear();
        } else if (period === 'custom' && customStart && customEnd) {
            const start = new Date(customStart);
            start.setHours(0, 0, 0, 0);
            const end = new Date(customEnd);
            end.setHours(23, 59, 59, 999);
            
            return expenseDate >= start && expenseDate <= end;
        }
        return true;
    });
}

// Handle filter change
function handleFilterChange() {
    const period = document.getElementById('filterPeriod').value;
    const customRange = document.getElementById('customDateRange');
    
    if (period === 'custom') {
        customRange.style.display = 'flex';
        // Set default dates
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        document.getElementById('startDate').valueAsDate = weekAgo;
        document.getElementById('endDate').valueAsDate = today;
        document.getElementById('endDate').max = today.toISOString().split('T')[0];
    } else {
        customRange.style.display = 'none';
        updateExpensesList();
    }
}

// Apply custom date range
function applyCustomDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        alert('Start date must be before end date');
        return;
    }
    
    updateExpensesList();
}

// Update insights
function updateInsights() {
    updateMainPieChart();
}

// Populate month filter dropdown
function populateMonthFilter() {
    const select = document.getElementById('chartMonthFilter');
    if (!select) return;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthKey = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Generate all 12 months for current year (January to December)
    const allMonths = [];
    for (let month = 0; month < 12; month++) {
        const monthKey = `${currentYear}-${String(month + 1).padStart(2, '0')}`;
        allMonths.push(monthKey);
    }
    
    // Keep natural order (January to December)
    const sortedMonths = allMonths;
    
    // Populate dropdown
    select.innerHTML = sortedMonths.map(monthKey => {
        const [year, month] = monthKey.split('-');
        const date = new Date(year, parseInt(month) - 1);
        const label = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        const isSelected = state.selectedChartMonth === monthKey || (!state.selectedChartMonth && monthKey === currentMonthKey);
        return `<option value="${monthKey}" ${isSelected ? 'selected' : ''}>${label}</option>`;
    }).join('');
    
    // Set default if not set
    if (!state.selectedChartMonth) {
        state.selectedChartMonth = currentMonthKey;
    }
}

// Update main bar chart on dashboard
function updateMainPieChart() {
    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer) {
        return;
    }
    
    // Populate month filter
    populateMonthFilter();
    
    // Get selected month or default to current
    const selectedMonth = state.selectedChartMonth;
    if (!selectedMonth) {
        const now = new Date();
        state.selectedChartMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    
    // Filter expenses by selected month
    const [year, month] = state.selectedChartMonth.split('-');
    const filteredExpenses = state.expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getFullYear() === parseInt(year) && 
               expenseDate.getMonth() === parseInt(month) - 1;
    });
    
    const categoryTotals = {};
    
    // Calculate totals for filtered expenses
    filteredExpenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    
    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    // Show empty state if no data
    if (total === 0 || Object.keys(categoryTotals).length === 0) {
        const monthLabel = new Date(year, parseInt(month) - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        chartContainer.innerHTML = `<div class="chart-empty-state">No expenses for ${monthLabel}. Start tracking!</div>`;
        
        // Clear summary
        const summaryContainer = document.getElementById('expenseSummary');
        if (summaryContainer) summaryContainer.innerHTML = '';
        return;
    }
    
    // Use CSS-based bar chart (reliable and works everywhere)
    createCSSBarChart(chartContainer, categoryTotals, total);
    
    // Update expense summary below chart
    updateExpenseSummary(categoryTotals, total);
}

// CSS-based pie chart
function createCSSBarChart(container, categoryTotals, total) {
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
    ];
    
    // Create pie chart using conic-gradient
    let gradientStops = [];
    let currentPercentage = 0;
    
    sortedCategories.forEach(([category, amount], index) => {
        const percentage = (amount / total) * 100;
        const color = colors[index % colors.length];
        gradientStops.push(`${color} ${currentPercentage}% ${currentPercentage + percentage}%`);
        currentPercentage += percentage;
    });
    
    const gradientString = gradientStops.join(', ');
    
    let html = `
        <div style="display: flex; flex-direction: column; align-items: center; padding: 2rem; gap: 2rem;">
            <div style="position: relative; width: 320px; height: 320px;">
                <div style="width: 100%; height: 100%; border-radius: 50%; background: conic-gradient(${gradientString}); box-shadow: 0 12px 24px rgba(0,0,0,0.2), 0 0 0 12px var(--bg-color); position: relative;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 140px; height: 140px; border-radius: 50%; background: var(--card-bg); box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">₹${total.toLocaleString('en-IN')}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">Total</div>
                    </div>
                </div>
            </div>
            <div style="width: 100%; max-width: 600px; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.75rem;">
    `;
    
    sortedCategories.forEach(([category, amount], index) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        const color = colors[index % colors.length];
        
        html += `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: var(--card-bg); border-radius: 12px; border-left: 4px solid ${color}; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="font-size: 1.5rem;">${getCategoryEmoji(category)}</span>
                    <div>
                        <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">${category}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">${percentage}%</div>
                    </div>
                </div>
                <div style="font-weight: 700; color: ${color}; font-size: 1.1rem;">₹${amount.toLocaleString('en-IN')}</div>
            </div>
        `;
    });
    
    html += '</div></div>';
    
    container.innerHTML = html;
}

// Update expense summary
function updateExpenseSummary(categoryTotals, total) {
    const container = document.getElementById('expenseSummary');
    if (!container) return;
    
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4); // Show top 4 categories
    
    container.innerHTML = sortedCategories.map(([category, amount]) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        return `
            <div class="summary-item">
                <div class="summary-icon">${getCategoryEmoji(category)}</div>
                <div class="summary-details">
                    <div class="summary-category">${category}</div>
                    <div class="summary-amount">₹${amount.toLocaleString('en-IN')}</div>
                    <div class="summary-percentage">${percentage}% of total</div>
                </div>
            </div>
        `;
    }).join('');
}

// Update trend chart
function updateTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        const parent = ctx.parentElement;
        const errorMsg = document.createElement('div');
        errorMsg.className = 'chart-empty-state';
        errorMsg.textContent = 'Chart library loading...';
        errorMsg.style.cssText = 'text-align: center; padding: 3rem; color: var(--text-secondary);';
        parent.appendChild(errorMsg);
        ctx.style.display = 'none';
        return;
    }
    
    const last7Days = [];
    const amounts = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }));
        
        const dayTotal = state.expenses
            .filter(e => {
                const expenseDate = new Date(e.date);
                return expenseDate.toDateString() === date.toDateString();
            })
            .reduce((sum, e) => sum + e.amount, 0);
        amounts.push(dayTotal);
    }
    
    if (window.trendChart) {
        window.trendChart.destroy();
    }
    
    const hasData = amounts.some(a => a > 0);
    
    if (!hasData) {
        const parent = ctx.parentElement;
        const emptyMsg = parent.querySelector('.chart-empty-state');
        if (!emptyMsg) {
            const div = document.createElement('div');
            div.className = 'chart-empty-state';
            div.textContent = 'No expenses in the last 7 days';
            div.style.cssText = 'text-align: center; padding: 3rem; color: var(--text-secondary);';
            parent.appendChild(div);
        }
        ctx.style.display = 'none';
        return;
    } else {
        ctx.style.display = 'block';
        const emptyMsg = ctx.parentElement.querySelector('.chart-empty-state');
        if (emptyMsg) emptyMsg.remove();
    }
    
    window.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Daily Spending',
                data: amounts,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => '₹' + context.parsed.y.toLocaleString('en-IN')
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '₹' + value.toLocaleString('en-IN'),
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
                    }
                }
            }
        }
    });
}

// Update category chart
function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }
    
    const categoryTotals = {};
    const now = new Date();
    
    // Filter for current month only
    state.expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
    }).forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    if (window.categoryChart) {
        window.categoryChart.destroy();
    }
    
    // Show empty state if no data
    if (labels.length === 0) {
        const parent = ctx.parentElement;
        const emptyMsg = parent.querySelector('.chart-empty-state');
        if (!emptyMsg) {
            const div = document.createElement('div');
            div.className = 'chart-empty-state';
            div.textContent = 'No expenses this month';
            div.style.cssText = 'text-align: center; padding: 3rem; color: var(--text-secondary);';
            parent.appendChild(div);
        }
        ctx.style.display = 'none';
        return;
    } else {
        ctx.style.display = 'block';
        const emptyMsg = ctx.parentElement.querySelector('.chart-empty-state');
        if (emptyMsg) emptyMsg.remove();
    }
    
    window.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.map(l => `${getCategoryEmoji(l)} ${l}`),
            datasets: [{
                data: data,
                backgroundColor: [
                    '#667eea', '#764ba2', '#f093fb', '#f5576c',
                    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
                    }
                },
                tooltip: {
                    callbacks: {
                        label: context => {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `₹${value.toLocaleString('en-IN')} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Update smart insights
function updateSmartInsights() {
    const container = document.getElementById('smartInsights');
    if (!container) return;
    
    const insights = [];
    const now = new Date();
    
    // All-time total expenses
    const allTimeTotal = state.expenses.reduce((sum, e) => sum + e.amount, 0);
    if (allTimeTotal > 0) {
        insights.push({
            type: 'info',
            text: `Total expenses (all time): ₹${allTimeTotal.toLocaleString('en-IN')}`
        });
    }
    
    // Monthly total and budget comparison
    const monthTotal = getTotalSpent('month');
    if (monthTotal > 0) {
        const remaining = state.budget - monthTotal;
        const percentUsed = ((monthTotal / state.budget) * 100).toFixed(1);
        insights.push({
            type: remaining > 0 ? 'success' : 'warning',
            text: `This month: ₹${monthTotal.toLocaleString('en-IN')} - Budget remaining: ₹${Math.max(0, remaining).toLocaleString('en-IN')} (${percentUsed}% used)`
        });
    }
    
    // Highest spending category (all time)
    const categoryTotals = {};
    state.expenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCategory && allTimeTotal > 0) {
        const percentage = ((topCategory[1] / allTimeTotal) * 100).toFixed(1);
        insights.push({
            type: 'info',
            text: `Highest spending: ${getCategoryEmoji(topCategory[0])} ${topCategory[0]} (₹${topCategory[1].toLocaleString('en-IN')} - ${percentage}%)`
        });
    }
    
    // Average daily spend (based on days with expenses)
    if (state.expenses.length > 0) {
        const uniqueDates = [...new Set(state.expenses.map(e => e.date))];
        const avgDaily = allTimeTotal / uniqueDates.length;
        insights.push({
            type: 'info',
            text: `Average daily spend: ₹${avgDaily.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (across ${uniqueDates.length} days)`
        });
    }
    
    // Spending trend (last 7 days vs previous 7 days)
    const last7Days = state.expenses.filter(e => {
        const date = new Date(e.date);
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return date >= sevenDaysAgo;
    }).reduce((sum, e) => sum + e.amount, 0);
    
    const previous7Days = state.expenses.filter(e => {
        const date = new Date(e.date);
        const fourteenDaysAgo = new Date(now);
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return date >= fourteenDaysAgo && date < sevenDaysAgo;
    }).reduce((sum, e) => sum + e.amount, 0);
    
    if (last7Days > 0 && previous7Days > 0) {
        const trend = last7Days > previous7Days ? 'Increasing' : last7Days < previous7Days ? 'Decreasing' : 'Stable';
        const trendEmoji = trend === 'Increasing' ? '📈' : trend === 'Decreasing' ? '📉' : '➡️';
        insights.push({
            type: trend === 'Increasing' ? 'warning' : trend === 'Decreasing' ? 'success' : 'info',
            text: `Spending trend: ${trendEmoji} ${trend} (Last 7 days: ₹${last7Days.toLocaleString('en-IN')} vs Previous: ₹${previous7Days.toLocaleString('en-IN')})`
        });
    } else if (last7Days > 0) {
        insights.push({
            type: 'info',
            text: `Last 7 days spending: ₹${last7Days.toLocaleString('en-IN')}`
        });
    }
    
    if (insights.length === 0) {
        container.innerHTML = '<div class="insight-item info">No expenses yet. Start tracking to see insights!</div>';
    } else {
        container.innerHTML = insights.map(insight => `
            <div class="insight-item ${insight.type}">
                ${insight.text}
            </div>
        `).join('');
    }
}

// Update detailed insights
function updateDetailedInsights() {
    const container = document.getElementById('detailedInsights');
    if (!container) return;
    
    const insights = [];
    
    // Average daily spending
    const monthTotal = getTotalSpent('month');
    const currentDay = new Date().getDate();
    const avgDaily = monthTotal / currentDay;
    
    insights.push({
        type: 'info',
        text: `Average daily spending this month: ₹${avgDaily.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    });
    
    // Top spending category
    const categoryTotals = {};
    state.expenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
        const percentage = ((topCategory[1] / monthTotal) * 100).toFixed(1);
        insights.push({
            type: 'info',
            text: `${getCategoryEmoji(topCategory[0])} ${topCategory[0]} is your top category (${percentage}% of total spending)`
        });
    }
    
    container.innerHTML = insights.map(insight => `
        <div class="insight-item ${insight.type}">
            ${insight.text}
        </div>
    `).join('');
}

// Update trend chart detailed
function updateTrendChartDetailed() {
    const ctx = document.getElementById('trendChartDetailed');
    if (!ctx) return;
    
    const last7Days = [];
    const amounts = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }));
        
        const dayTotal = state.expenses
            .filter(e => new Date(e.date).toDateString() === date.toDateString())
            .reduce((sum, e) => sum + e.amount, 0);
        amounts.push(dayTotal);
    }
    
    if (window.trendChartDetailed) {
        window.trendChartDetailed.destroy();
    }
    
    window.trendChartDetailed = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Daily Spending',
                data: amounts,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: '#667eea',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => '₹' + context.parsed.y.toLocaleString('en-IN')
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '₹' + value.toLocaleString('en-IN'),
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update category chart detailed
function updateCategoryChartDetailed() {
    const ctx = document.getElementById('categoryChartDetailed');
    if (!ctx) return;
    
    const categoryTotals = {};
    const now = new Date();
    
    state.expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
    }).forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    if (window.categoryChartDetailed) {
        window.categoryChartDetailed.destroy();
    }
    
    if (labels.length === 0) {
        const parent = ctx.parentElement;
        const emptyMsg = parent.querySelector('.chart-empty-state');
        if (!emptyMsg) {
            const div = document.createElement('div');
            div.className = 'chart-empty-state';
            div.textContent = 'No expenses this month';
            div.style.cssText = 'text-align: center; padding: 3rem; color: var(--text-secondary);';
            parent.appendChild(div);
        }
        ctx.style.display = 'none';
        return;
    } else {
        ctx.style.display = 'block';
        const emptyMsg = ctx.parentElement.querySelector('.chart-empty-state');
        if (emptyMsg) emptyMsg.remove();
    }
    
    window.categoryChartDetailed = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.map(l => `${getCategoryEmoji(l)} ${l}`),
            datasets: [{
                data: data,
                backgroundColor: [
                    '#667eea', '#764ba2', '#f093fb', '#f5576c',
                    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
                    }
                },
                tooltip: {
                    callbacks: {
                        label: context => {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `₹${value.toLocaleString('en-IN')} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Update category budgets
function updateCategoryBudgets() {
    const container = document.getElementById('categoryBudgets');
    if (!container) return;
    
    const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'];
    
    container.innerHTML = categories.map(cat => {
        const spent = state.expenses
            .filter(e => e.category === cat)
            .reduce((sum, e) => sum + e.amount, 0);
        const budget = state.categoryBudgets[cat] || 0;
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
        
        return `
            <div class="category-budget-item">
                <div class="category-budget-header">
                    <span>${getCategoryEmoji(cat)} ${cat}</span>
                    <input type="number" class="category-budget-input" 
                           value="${budget}" 
                           onchange="updateCategoryBudget('${cat}', this.value)"
                           placeholder="Set budget">
                </div>
                ${budget > 0 ? `
                    <div class="progress-bar">
                        <div class="progress-fill ${percentage >= 100 ? 'danger' : percentage >= 80 ? 'warning' : ''}" 
                             style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div class="budget-stats">
                        <span>Spent: ₹${spent.toLocaleString('en-IN')}</span>
                        <span>Left: ₹${Math.max(0, budget - spent).toLocaleString('en-IN')}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Update category budget
function updateCategoryBudget(category, value) {
    state.categoryBudgets[category] = parseFloat(value) || 0;
    saveState();
    updateCategoryBudgets();
}

// Calculate What If
function calculateWhatIf() {
    const daily = parseFloat(document.getElementById('dailySavings').value);
    const result = document.getElementById('whatIfResult');
    
    if (!daily || daily <= 0) {
        result.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Enter a daily savings amount to see projections</p>';
        return;
    }
    
    const weekly = daily * 7;
    const monthly = daily * 30;
    const yearly = daily * 365;
    
    result.innerHTML = `
        <div class="result-grid" style="margin-bottom: 1.5rem;">
            <div class="result-card">
                <div class="result-label">Per Week</div>
                <div class="result-value">₹${weekly.toLocaleString('en-IN')}</div>
            </div>
            <div class="result-card">
                <div class="result-label">Per Month</div>
                <div class="result-value">₹${monthly.toLocaleString('en-IN')}</div>
            </div>
            <div class="result-card highlight">
                <div class="result-label">Per Year</div>
                <div class="result-value">₹${yearly.toLocaleString('en-IN')}</div>
            </div>
        </div>
        <div style="text-align: center; padding: 1.25rem; background: var(--bg-color); border-radius: 12px; border: 2px solid var(--border-color);">
            <p style="font-size: 1rem; color: var(--text-primary); margin: 0;">
                💡 <strong>Tip:</strong> Saving just ₹${daily.toLocaleString('en-IN')} per day can add up to 
                <strong style="color: #667eea;">₹${yearly.toLocaleString('en-IN')}</strong> in a year!
            </p>
        </div>
    `;
}

// Update reminders
function updateReminders() {
    const container = document.getElementById('remindersList');
    if (!container) return;
    
    if (state.reminders.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary)">No reminders set</p>';
        return;
    }
    
    container.innerHTML = state.reminders.map((r, i) => {
        const daysLeft = Math.ceil((new Date(r.date) - new Date()) / (1000 * 60 * 60 * 24));
        const isUrgent = daysLeft <= 3;
        
        return `
            <div class="reminder-item ${isUrgent ? 'urgent' : ''}">
                <div>
                    <strong>${r.title}</strong><br>
                    <small>₹${r.amount.toLocaleString('en-IN')} - ${daysLeft} days left</small>
                </div>
                <button onclick="deleteReminder(${i})" style="background: none; border: none; font-size: 1.2rem; cursor: pointer;">🗑️</button>
            </div>
        `;
    }).join('');
}

// Add reminder
function addReminder() {
    const title = prompt('Reminder title (e.g., Rent):');
    if (!title) return;
    
    const amount = parseFloat(prompt('Amount:'));
    if (!amount) return;
    
    const date = prompt('Due date (YYYY-MM-DD):');
    if (!date) return;
    
    state.reminders.push({ title, amount, date });
    saveState();
    updateReminders();
}

// Delete reminder
function deleteReminder(index) {
    state.reminders.splice(index, 1);
    saveState();
    updateReminders();
}

// Update streak
function updateStreak() {
    const today = getTotalSpent('today');
    const dailyLimit = state.budget / 30;
    
    if (today <= dailyLimit) {
        state.streak++;
    } else {
        state.streak = 0;
    }
    
    document.getElementById('streakCount').textContent = state.streak;
    saveState();
}

// Check salary countdown
function checkSalaryCountdown() {
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    let daysLeft;
    if (currentDay < state.salaryDate) {
        daysLeft = state.salaryDate - currentDay;
    } else {
        daysLeft = daysInMonth - currentDay + state.salaryDate;
    }
    
    const dailyLimit = (state.budget - getTotalSpent('month')) / daysLeft;
    
    document.getElementById('salaryCountdown').innerHTML = `
        ${daysLeft} days until salary<br>
        Safe daily spend: <strong>₹${Math.max(0, dailyLimit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
    `;
}

// Check budget status
function checkBudgetStatus() {
    const total = getTotalSpent('month');
    const percentage = (total / state.budget) * 100;
    
    if (percentage < 80) {
        showConfetti();
    } else if (percentage >= 100) {
        showSadEmoji();
    }
}

// Show confetti
function showConfetti() {
    const container = document.getElementById('confetti');
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];
    
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 0.5 + 's';
        container.appendChild(piece);
        
        setTimeout(() => piece.remove(), 3000);
    }
}

// Show sad emoji
function showSadEmoji() {
    // Could add a sad emoji animation here
    console.log('Budget exceeded 😢');
}

// Show expense added animation
function showExpenseAddedAnimation() {
    const btn = document.getElementById('addExpenseBtn');
    btn.textContent = '✓ Added!';
    btn.style.background = 'var(--success-color)';
    
    setTimeout(() => {
        btn.textContent = 'Add Expense';
        btn.style.background = '';
    }, 1000);
}

// Show recent suggestions
function showRecentSuggestions() {
    const container = document.getElementById('recentSuggestions');
    const recent = state.expenses.slice(0, 3);
    
    if (recent.length === 0) return;
    
    container.innerHTML = recent.map(e => `
        <div class="suggestion-chip" onclick="applySuggestion(${e.amount}, '${e.category}', '${e.notes}')">
            ₹${e.amount} - ${e.category}
        </div>
    `).join('');
}

// Apply suggestion
function applySuggestion(amount, category, notes) {
    document.getElementById('expenseAmount').value = amount;
    document.getElementById('expenseNotes').value = notes;
    
    const categoryBtn = Array.from(document.querySelectorAll('.category-btn'))
        .find(btn => btn.dataset.category === category);
    if (categoryBtn) {
        selectCategory(categoryBtn);
    }
}

// Voice input
function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('Voice input not supported in this browser');
        return;
    }
    
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    
    const btn = document.getElementById('voiceBtn');
    btn.classList.add('listening');
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const amount = parseAmount(transcript);
        if (amount) {
            document.getElementById('expenseAmount').value = amount;
            validateForm();
        }
    };
    
    recognition.onend = () => {
        btn.classList.remove('listening');
    };
    
    recognition.start();
}

// Parse amount from speech
function parseAmount(text) {
    const words = {
        'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
        'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
        'ten': 10, 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
        'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
        'hundred': 100, 'thousand': 1000
    };
    
    // Try to extract number directly
    const match = text.match(/\d+/);
    if (match) return parseInt(match[0]);
    
    // Parse words
    let total = 0;
    let current = 0;
    
    text.toLowerCase().split(' ').forEach(word => {
        if (words[word] !== undefined) {
            if (words[word] >= 100) {
                current = current * words[word];
            } else {
                current += words[word];
            }
        }
    });
    
    return current || null;
}

// Set budget
function setBudget() {
    const newBudget = prompt('Set monthly budget:', state.budget);
    if (newBudget && !isNaN(newBudget)) {
        state.budget = parseFloat(newBudget);
        saveState();
        updateUI();
    }
}

// Switch tab
function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === tabName + 'Tab');
    });
    
    // Update charts when switching to insights
    if (tabName === 'insights') {
        setTimeout(updateInsights, 100);
    }
    
    // Update expenses list when switching to expenses
    if (tabName === 'expenses') {
        updateExpensesList();
    }
}

// Toggle dark mode
function toggleDarkMode() {
    state.darkMode = !state.darkMode;
    document.body.setAttribute('data-theme', state.darkMode ? 'dark' : 'light');
    document.getElementById('darkModeToggle').textContent = state.darkMode ? '☀️' : '🌙';
    saveState();
    
    // Redraw charts with new theme
    if (window.trendChart) updateTrendChart();
    if (window.categoryChart) updateCategoryChart();
}

// Export CSV
function exportCSV() {
    const csv = ['Date,Category,Amount,Notes'];
    state.expenses.forEach(e => {
        csv.push(`${e.date},${e.category},${e.amount},"${e.notes || ''}"`);
    });
    
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// Export PDF
function exportPDF() {
    alert('PDF export feature - In a real app, this would generate a PDF report');
}

// Share report
function shareReport() {
    const total = getTotalSpent('month');
    const text = `My monthly expenses: ₹${total.toLocaleString('en-IN')}. Tracking with Expense Tracker!`;
    
    if (navigator.share) {
        navigator.share({ text });
    } else {
        navigator.clipboard.writeText(text);
        alert('Report copied to clipboard!');
    }
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure? This will delete all your data!')) {
        if (confirm('Really sure? This cannot be undone!')) {
            localStorage.clear();
            location.reload();
        }
    }
}

// Profile Management
function loadProfileForm() {
    const profile = state.profile || {};
    document.getElementById('userName').value = profile.name || '';
    document.getElementById('userAge').value = profile.age || '';
    document.getElementById('userOccupation').value = profile.occupation || '';
    document.getElementById('userCity').value = profile.city || '';
}

function saveProfile() {
    const name = document.getElementById('userName').value.trim();
    const age = document.getElementById('userAge').value.trim();
    const occupation = document.getElementById('userOccupation').value.trim();
    const city = document.getElementById('userCity').value.trim();
    
    state.profile = {
        name,
        age,
        occupation,
        city
    };
    
    saveState();
    
    // Show success message
    const btn = document.getElementById('saveProfile');
    const originalText = btn.textContent;
    btn.textContent = '✅ Saved!';
    btn.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
    
    // Update greeting immediately
    updateGreeting();
    
    // Close modal after short delay
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        document.getElementById('menuModal').classList.remove('active');
    }, 1500);
}

function updateGreeting() {
    const greetingElement = document.querySelector('.greeting');
    if (!greetingElement) return;
    
    const name = state.profile?.name;
    const hour = new Date().getHours();
    let timeGreeting = 'Good Evening';
    
    if (hour < 12) timeGreeting = 'Good Morning';
    else if (hour < 17) timeGreeting = 'Good Afternoon';
    
    if (name) {
        greetingElement.textContent = `${timeGreeting}, ${name}! 👋`;
    } else {
        greetingElement.textContent = `${timeGreeting}! 👋`;
    }
}

// Utility functions
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatDate(dateStr) {
    try {
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        
        if (compareDate.getTime() === today.getTime()) return 'Today';
        if (compareDate.getTime() === yesterday.getTime()) return 'Yesterday';
        
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
        return dateStr;
    }
}

function getCategoryEmoji(category) {
    const emojis = {
        'Food': '🍔',
        'Transport': '🚗',
        'Bills': '⚡',
        'Shopping': '🛒',
        'Entertainment': '🎬',
        'Health': '💊',
        'Education': '📚',
        'Other': '📦'
    };
    return emojis[category] || '📦';
}
