# Contributing Guide

## How to Contribute

Thank you for considering contributing to the Daily Expense Tracker! This guide will help you get started.

## Development Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Text editor or IDE
- Basic knowledge of HTML, CSS, and JavaScript

### Getting Started
1. Clone or download the repository
2. Open `index.html` in your browser
3. Make changes to the code
4. Refresh browser to see changes
5. No build process required!

## Project Structure

```
daily-expense-tracker/
├── index.html          # Main HTML - UI structure
├── styles.css          # All styling - design system
├── app.js             # JavaScript - application logic
├── manifest.json      # PWA config - app metadata
├── README.md          # User documentation
├── CONTRIBUTING.md    # This file
├── .gitignore         # Git ignore rules
└── .kiro/             # Developer documentation
    ├── requirements.md      # Feature requirements
    ├── architecture.md      # Technical architecture
    ├── user-guide.md        # End-user guide
    └── prompts.md           # Development prompts
```

## Code Style Guidelines

### JavaScript
- Use `const` for constants, `let` for variables
- Use arrow functions where appropriate
- Use template literals for strings
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names

**Example:**
```javascript
// Good
const calculateTotal = (expenses) => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

// Avoid
function calc(e) {
    var t = 0;
    for(var i=0;i<e.length;i++) t+=e[i].amount;
    return t;
}
```

### CSS
- Use CSS custom properties for colors
- Follow BEM-like naming for classes
- Group related styles together
- Add comments for sections
- Mobile-first for new features

**Example:**
```css
/* Good */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Avoid */
.ch { display:flex;justify-content:space-between;align-items:center; }
```

### HTML
- Use semantic HTML5 elements
- Add ARIA labels for accessibility
- Keep structure clean and indented
- Use meaningful IDs and classes

## Making Changes

### 1. Adding a New Feature

**Steps:**
1. Plan the feature (UI, logic, data)
2. Update HTML structure if needed
3. Add CSS styling
4. Implement JavaScript logic
5. Test thoroughly
6. Update documentation

**Example: Adding a new category**
```javascript
// 1. Add to HTML
<button class="category-btn" data-category="Pets">🐕<span>Pets</span></button>

// 2. Add to CSS (if custom styling needed)
.category-btn[data-category="Pets"] { /* styles */ }

// 3. Update JavaScript (usually automatic)
// Category system is dynamic, no changes needed
```

### 2. Fixing a Bug

**Steps:**
1. Reproduce the bug
2. Identify the root cause
3. Write a fix
4. Test the fix
5. Test for regressions
6. Document the fix

### 3. Improving UI/UX

**Steps:**
1. Identify the improvement area
2. Design the solution
3. Update CSS/HTML
4. Test on different screen sizes
5. Test in dark mode
6. Ensure accessibility

## Testing Checklist

### Before Submitting Changes

- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari (if available)
- [ ] Test on mobile screen size
- [ ] Test in dark mode
- [ ] Test with empty state (no data)
- [ ] Test with lots of data (100+ expenses)
- [ ] Test all user flows affected
- [ ] Check browser console for errors
- [ ] Verify localStorage works
- [ ] Test form validations
- [ ] Check responsive design

### Specific Feature Tests

**Expenses:**
- [ ] Add expense
- [ ] Delete expense
- [ ] Filter by period
- [ ] Sort order correct
- [ ] Date validation works

**Budget:**
- [ ] Set budget
- [ ] Budget calculation correct
- [ ] Progress bar updates
- [ ] Color indicators work

**Charts:**
- [ ] Pie chart displays
- [ ] Month filter works
- [ ] Empty state shows
- [ ] Colors are distinct

**Profile:**
- [ ] Save profile
- [ ] Greeting updates
- [ ] Modal closes
- [ ] Data persists

## Common Tasks

### Adding a New Tab

1. **HTML:** Add tab button and content pane
```html
<!-- Tab button -->
<button class="nav-tab" data-tab="newtab">🆕 New Tab</button>

<!-- Tab content -->
<div id="newtabTab" class="tab-pane">
    <!-- Content here -->
</div>
```

2. **CSS:** Style if needed (usually inherits)

3. **JavaScript:** Tab switching is automatic

### Adding a New Chart

1. Create container in HTML
2. Write function to generate chart
3. Call function in `updateUI()` or relevant place
4. Handle empty state

### Modifying State Structure

1. Update state object definition
2. Update `loadState()` for backward compatibility
3. Update all functions that use the state
4. Test data migration

## Performance Guidelines

### Do's ✅
- Batch DOM updates
- Use event delegation
- Cache DOM queries
- Use CSS transforms for animations
- Minimize reflows

### Don'ts ❌
- Don't use `innerHTML` with user input
- Don't query DOM in loops
- Don't use inline styles (use classes)
- Don't block the main thread
- Don't create memory leaks

## Accessibility Guidelines

### Requirements
- Use semantic HTML
- Add ARIA labels to buttons
- Ensure keyboard navigation
- Maintain color contrast
- Support screen readers

### Testing
- Tab through the interface
- Use browser accessibility tools
- Test with screen reader (if possible)
- Check color contrast ratios

## Documentation

### When to Update Docs

**Update README.md when:**
- Adding user-facing features
- Changing how to use the app
- Updating installation steps

**Update .kiro/requirements.md when:**
- Adding new requirements
- Changing feature scope
- Updating data structures

**Update .kiro/architecture.md when:**
- Changing architecture
- Adding new patterns
- Updating tech stack

**Update .kiro/user-guide.md when:**
- Adding user features
- Changing UI flows
- Adding tips/tricks

## Git Workflow

### Commit Messages
Use clear, descriptive commit messages:

```
Good:
- "Add profile feature with personalized greeting"
- "Fix budget calculation for current month"
- "Improve pie chart colors for better contrast"

Avoid:
- "Update"
- "Fix bug"
- "Changes"
```

### Branch Naming (if using branches)
- `feature/profile-section`
- `fix/budget-calculation`
- `improve/chart-colors`

## Code Review Checklist

### For Reviewers
- [ ] Code follows style guidelines
- [ ] Changes are well-tested
- [ ] No console errors
- [ ] Documentation updated
- [ ] Backward compatible
- [ ] Performance not degraded
- [ ] Accessibility maintained

## Questions?

If you have questions about contributing:
1. Check existing documentation in `.kiro/` folder
2. Review similar code in the project
3. Test your changes thoroughly
4. Open an issue for clarification

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing! 🎉**
