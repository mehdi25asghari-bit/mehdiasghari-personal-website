// Planner Object - Manages all planner data and operations
const PlannerApp = {
    storageKey: 'footballPlannerData',
    
    // Initialize the app
    init() {
        this.loadData();
        this.renderGoals();
        this.updateStats();
        this.renderHistory();
        this.attachEventListeners();
    },

    // Event Listeners
    attachEventListeners() {
        document.getElementById('addGoalBtn').addEventListener('click', () => this.addGoal());
        document.getElementById('goalInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addGoal();
        });
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());
        document.getElementById('resetWeekBtn').addEventListener('click', () => this.resetWeek());

        // Event delegation for goal item interactions
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('goal-checkbox')) {
                const goalId = e.target.dataset.goalId;
                this.toggleGoal(goalId);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-small')) {
                const action = e.target.dataset.action;
                const goalId = e.target.dataset.goalId;
                if (action === 'delete') this.deleteGoal(goalId);
            }
        });
    },

    // Data Structure
    data: {
        goals: [],
        completed: [],
        createdDate: new Date().toISOString()
    },

    // Load data from localStorage
    loadData() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                this.data = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading data:', e);
                this.saveData();
            }
        } else {
            this.saveData();
        }
    },

    // Save data to localStorage
    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    },

    // Generate unique ID
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9) + Date.now();
    },

    // Add a new goal
    addGoal() {
        const goalInput = document.getElementById('goalInput');
        const timeInput = document.getElementById('timeInput');
        const daySelect = document.getElementById('daySelect');
        const categorySelect = document.getElementById('categorySelect');

        const goalText = goalInput.value.trim();
        const time = timeInput.value;
        const day = daySelect.value;
        const category = categorySelect.value || 'General';

        if (!goalText) {
            alert('Please enter a goal');
            return;
        }

        if (!day) {
            alert('Please select a day');
            return;
        }

        const goal = {
            id: this.generateId(),
            text: goalText,
            time: time || '',
            day: day,
            category: category,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.data.goals.push(goal);
        this.saveData();

        // Clear inputs
        goalInput.value = '';
        timeInput.value = '';
        daySelect.value = '';
        categorySelect.value = '';

        this.renderGoals();
        this.updateStats();
    }

    // Toggle goal completion
    toggleGoal(goalId) {
        const goal = this.data.goals.find(g => g.id === goalId);
        if (goal) {
            goal.completed = !goal.completed;
            
            // Move to history if completed
            if (goal.completed) {
                const completedGoal = {
                    ...goal,
                    completedAt: new Date().toISOString()
                };
                this.data.completed.push(completedGoal);
            } else {
                // Remove from completed history if unchecking
                this.data.completed = this.data.completed.filter(g => g.id !== goalId);
            }
            
            this.saveData();
            this.renderGoals();
            this.updateStats();
            this.renderHistory();
        }
    },

    // Delete a goal
    deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.data.goals = this.data.goals.filter(g => g.id !== goalId);
            this.data.completed = this.data.completed.filter(g => g.id !== goalId);
            this.saveData();
            this.renderGoals();
            this.updateStats();
            this.renderHistory();
        }
    },

    // Render all goals
    renderGoals() {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        days.forEach(day => {
            const goalsList = document.querySelector(`.goals-list[data-day="${day}"]`);
            const dayGoals = this.data.goals.filter(g => g.day === day);
            
            if (dayGoals.length === 0) {
                goalsList.innerHTML = '<p class="empty-state"><p>No goals yet</p></p>';
            } else {
                goalsList.innerHTML = dayGoals.map(goal => this.createGoalHTML(goal)).join('');
            }
        });
    },

    // Create goal HTML
    createGoalHTML(goal) {
        const completedClass = goal.completed ? 'completed' : '';
        const checkedAttr = goal.completed ? 'checked' : '';
        const timeDisplay = goal.time ? `<span class="goal-time">🕐 ${goal.time}</span>` : '';
        
        return `
            <div class="goal-item ${completedClass}">
                <input type="checkbox" class="goal-checkbox" data-goal-id="${goal.id}" ${checkedAttr}>
                <div class="goal-content">
                    <div class="goal-text">${this.escapeHtml(goal.text)}</div>
                    <div class="goal-meta">
                        ${timeDisplay}
                        <span class="goal-badge">${goal.category}</span>
                        <span class="goal-date">${this.formatDate(goal.createdAt)}</span>
                    </div>
                </div>
                <div class="goal-actions">
                    <button class="btn-small" data-action="delete" data-goal-id="${goal.id}" title="Delete">✕</button>
                </div>
            </div>
        `;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    },

    // Update statistics
    updateStats() {
        const totalGoals = this.data.goals.length;
        const completedGoals = this.data.goals.filter(g => g.completed).length;
        const completedThisWeek = this.data.goals.filter(g => g.completed).length;
        const progress = totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);
        const weeksActive = this.calculateWeeksActive();

        document.getElementById('totalCount').textContent = totalGoals;
        document.getElementById('completedCount').textContent = completedThisWeek;
        document.getElementById('progressPercent').textContent = progress + '%';
        document.getElementById('streakCount').textContent = weeksActive;
    },

    // Calculate weeks active
    calculateWeeksActive() {
        if (this.data.completed.length === 0) return 0;
        
        const createdDate = new Date(this.data.createdDate);
        const now = new Date();
        const diffTime = Math.abs(now - createdDate);
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
        
        return Math.max(1, diffWeeks);
    },

    // Render history
    renderHistory() {
        const historyList = document.getElementById('historyList');
        const completed = this.data.completed;

        if (completed.length === 0) {
            historyList.innerHTML = '<p class="empty-message">No completed goals yet. Start adding goals and mark them as done!</p>';
        } else {
            // Sort by completion date (newest first)
            const sorted = [...completed].sort((a, b) => 
                new Date(b.completedAt) - new Date(a.completedAt)
            );

            historyList.innerHTML = sorted.slice(0, 50).map(goal => `
                <div class="history-item">
                    <div class="history-item-content">
                        <div class="history-item-text">✓ ${this.escapeHtml(goal.text)}</div>
                        <div class="history-item-meta">
                            <span>${goal.day}</span> • 
                            <span>${goal.category}</span> • 
                            <span>Completed ${this.formatDate(goal.completedAt)}</span>
                        </div>
                    </div>
                    <span class="history-item-badge">Completed</span>
                </div>
            `).join('');
        }
    },

    // Clear history
    clearHistory() {
        if (confirm('Are you sure you want to clear all completed goals from history? This cannot be undone.')) {
            this.data.completed = [];
            this.saveData();
            this.renderHistory();
            this.updateStats();
        }
    },

    // Reset week (clear all goals)
    resetWeek() {
        if (confirm('Are you sure you want to reset this week? All current plans will be removed and you can start fresh.')) {
            this.data.goals = [];
            this.saveData();
            this.renderGoals();
            this.updateStats();
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    PlannerApp.init();
});
