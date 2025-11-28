# Architecture Documentation

## Project Structure

```
daily-expense-tracker/
├── index.html          # Main HTML structure
├── styles.css          # All styling and themes
├── app.js             # Application logic
├── manifest.json      # PWA configuration
├── README.md          # User documentation
├── .gitignore         # Git ignore rules
└── .kiro/             # Project documentation
    ├── requirements.md
    ├── architecture.md
    └── user-guide.md
```

## Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Styling with custom properties (CSS variables)
- **JavaScript (ES6+)** - Application logic
- **LocalStorage API** - Data persistence

### Design Patterns
- **State Management** - Centralized state object
- **Event-Driven** - Event listeners for user interactions
- **Modular Functions** - Single responsibility principle
- **Data Persistence** - Auto-save on state changes

## Application Architecture

### 1. State Management
```javascript
const state = {
  expenses: [],
  budget: 0,
  categoryBudgets: {},
  reminders: [],
  profile: {},
  darkMode: false,
  selectedChartMonth: null
}
```

**Key Functions:**
- `loadState()` - Load from localStorage on init
- `saveState()` - Save to localStorage on changes
- State is the single source of truth

### 2. UI Components

#### Sidebar (Fixed)
- Greeting section
- Budget overview card
- Quick add expense form
- Navigation tabs

#### Main Content Area
- Dashboard tab (pie chart, recent expenses)
- Expenses tab (filterable table)
- Savings Plan tab (daily savings calculator)
- Reminders tab (bill reminders list)

#### Modal
- Menu with profile and settings

### 3. Data Flow

```
User Action → Event Listener → Update State → Save to LocalStorage → Update UI
```

**Example: Adding an Expense**
1. User fills form and clicks "Add Expense"
2. `addExpense()` validates and creates expense object
3. Expense added to `state.expenses`
4. `saveState()` persists to localStorage
5. `updateUI()` refreshes all relevant components
6. Form resets for next entry

### 4. Key Modules

#### Expense Management
- `addExpense()` - Add new expense
- `deleteExpense(id)` - Remove expense
- `getFilteredExpenses(period)` - Filter by date range
- `updateExpensesList()` - Render expenses table

#### Budget Tracking
- `updateBudgetOverview()` - Calculate and display budget status
- `setBudget()` - Update monthly budget
- `getTotalSpent(period)` - Calculate total for period

#### Visualization
- `updateMainPieChart()` - Render pie chart
- `populateMonthFilter()` - Generate month dropdown
- `createCSSBarChart()` - Create pie chart with CSS
- `updateExpenseSummary()` - Show category breakdown

#### Profile Management
- `loadProfileForm()` - Load saved profile
- `saveProfile()` - Save profile data
- `updateGreeting()` - Update personalized greeting

#### Utilities
- `formatCurrency(amount)` - Format as ₹X,XXX
- `formatDate(dateStr)` - Format date display
- `getCategoryEmoji(category)` - Get category icon
- `toggleDarkMode()` - Switch theme

## CSS Architecture

### Design System

#### Color Scheme
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #43e97b;
  --danger-color: #f5576c;
  --warning-color: #ffa726;
  
  --bg-color: #f5f7fa;
  --card-bg: #ffffff;
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --border-color: #e2e8f0;
}

[data-theme="dark"] {
  --bg-color: #1a202c;
  --card-bg: #2d3748;
  --text-primary: #f7fafc;
  --text-secondary: #cbd5e0;
  --border-color: #4a5568;
}
```

#### Layout System
- **Desktop-first** approach
- **Fixed sidebar** (300px width)
- **Flexible main content** area
- **Responsive breakpoints** at 768px and 480px

#### Component Styling
- **Glass morphism** effects
- **Gradient backgrounds**
- **Smooth transitions** (0.3s)
- **Box shadows** for depth
- **Border radius** (8-12px)

### CSS Organization
1. CSS Variables
2. Reset & Base Styles
3. Layout (Grid, Flexbox)
4. Components (Cards, Buttons, Forms)
5. Utilities
6. Responsive Media Queries

## Performance Optimizations

### 1. Efficient Rendering
- Batch DOM updates
- Use `setTimeout` for non-blocking operations
- Minimize reflows and repaints

### 2. Data Handling
- Filter and sort only when needed
- Use array methods efficiently
- Avoid unnecessary loops

### 3. CSS Performance
- Use CSS transforms for animations
- Hardware acceleration with `will-change`
- Minimize CSS specificity

### 4. LocalStorage
- Single save operation per action
- JSON serialization for complex objects
- Error handling for quota exceeded

## Security Considerations

### Client-Side Only
- No server communication
- No API calls
- No authentication required

### Data Privacy
- All data stored locally
- No data transmission
- User controls all data

### Input Validation
- Number validation for amounts
- Date validation (no future dates)
- String length limits
- XSS prevention (no innerHTML with user input)

## Browser Compatibility

### Minimum Requirements
- ES6 support (const, let, arrow functions, template literals)
- CSS Grid and Flexbox
- LocalStorage API
- CSS Custom Properties

### Tested Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment

### Static Hosting
Can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static file server

### No Build Process Required
- Pure HTML/CSS/JS
- No compilation needed
- No dependencies to install
- Just upload and serve

## Error Handling

### User Input Errors
- Form validation before submission
- Clear error messages
- Prevent invalid states

### Data Errors
- Try-catch for localStorage operations
- Fallback to default state if corrupted
- Graceful degradation

### UI Errors
- Empty state messages
- Loading states
- Fallback content

## Testing Strategy

### Manual Testing
- Test all user flows
- Test on different browsers
- Test responsive layouts
- Test dark mode
- Test with large datasets

### Edge Cases
- Empty state (no data)
- Maximum data (1000+ expenses)
- Invalid dates
- LocalStorage full
- Browser without LocalStorage

## Maintenance

### Code Quality
- Consistent formatting
- Meaningful variable names
- Comments for complex logic
- Modular functions

### Updates
- Keep dependencies minimal
- Test thoroughly before changes
- Maintain backward compatibility
- Document breaking changes

## Scalability Considerations

### Current Limitations
- Client-side only (no sync)
- Single user
- Browser storage limits (~5-10MB)

### Future Scaling Options
- Backend API for sync
- Database for large datasets
- User authentication
- Multi-device support
