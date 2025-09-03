class TodoApp {
  constructor() {
    this.todos = this.loadTodos();
    this.currentFilter = 'all';
    this.elements = this.getElements();
    this.init();
  }

  getElements() {
    const {
      getElementById: getById,
      querySelectorAll: queryAll
    } = document;

    return {
      form: getById.call(document, 'todoForm'),
      input: getById.call(document, 'todoInput'),
      todoList: getById.call(document, 'todoList'),
      totalCount: getById.call(document, 'totalCount'),
      completedCount: getById.call(document, 'completedCount'),
      pendingCount: getById.call(document, 'pendingCount'),
      filterBtns: queryAll.call(document, '.filter-btn')
    };
  }
  
  init() {
    this.bindEvents();
    this.render();
    this.updateStats();
  }

  bindEvents() {
    this.elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTodo();
    });

    this.elements.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });
  }

  addTodo() {
    const todoText = this.elements.input.value.trim();
    if (!todoText) return;

    const newTodo = {
      id: Date.now(),
      text: todoText,
      completed: false,
      createdAt: new Date().toLocaleString('en-US')
    };

    this.todos = [...this.todos, newTodo];

    this.elements.input.value = '';
    this.saveTodos();
    this.render();
    this.updateStats();
  }

  toggleTodo(id) {
    this.todos = this.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );

    this.saveTodos();
    this.render();
    this.updateStats();
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.saveTodos();
    this.render();
    this.updateStats();
  }

  getFilteredTodos() {
    const filters = {
      all: () => this.todos,
      pending: () => this.todos.filter(todo => !todo.completed),
      completed: () => this.todos.filter(todo => todo.completed)
    };

    return filters[this.currentFilter]();
  }

  setFilter(filter) {
    this.currentFilter = filter;

    this.elements.filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    this.render();
  }

  render() {
    const filteredTodos = this.getFilteredTodos();
    
    if (filteredTodos.length === 0) {
      this.renderEmptyState();
      return;
    }

    const todosHTML = filteredTodos
      .map(todo => this.createTodoHTML(todo))
      .join('');

    this.elements.todoList.innerHTML = todosHTML;

    this.bindTodoEvents();
  }
  
  createTodoHTML(todo) {
    const { id, text, completed, createdAt } = todo;
    return `
      <div class="todo-item ${completed ? 'completed' : ''}" data-id="${id}">
        <input
          type="checkbox"
          class="todo-checkbox"
          ${completed ? 'checked' : ''}
        >
        <span class="todo-text">${text}</span>
        <span class="todo-date">${createdAt}</span>
        <button class="delete-btn">🗑️</button>
      </div>
    `;
  }

  renderEmptyState() {
    const emptyMessages = {
      all: 'No tasks available. Add a new task!',
      pending: 'No pending tasks. Enjoy your day!',
      completed: 'No completed tasks yet. Keep going!'
    };

    this.elements.todoList.innerHTML = `
      <div class="empty-state">
        <h3>${emptyMessages[this.currentFilter]}</h3>
        <p>Start by adding a new task above.</p>
      </div>
    `;
  }

  bindTodoEvents() {
    this.elements.todoList.addEventListener('click', (e) => {
      const todoItem = e.target.closest('.todo-item');
      if (!todoItem) return;

      const id = parseInt(todoItem.dataset.id);

      if (e.target.classList.contains('todo-checkbox')) {
        this.toggleTodo(id);
      } else if (e.target.classList.contains('delete-btn')) {
        this.deleteTodo(id);
      }
    });
  }

  updateStats() {
    const stats = this.todos.reduce((acc, todo) => ({
      total: acc.total + 1,
      completed: todo.completed ? acc.completed + 1 : acc.completed,
      pending: !todo.completed ? acc.pending + 1 : acc.pending
    }), { total: 0, completed: 0, pending: 0 });
  }

  saveTodos() {
    try {
      localStorage.setItem('todos', JSON.stringify(this.todos));
    } catch (error) {
      console.error('Error saving todos to localStorage:', error);
    }
  }

  loadTodos() {
    try {
      const stored = localStorage.getItem('todos');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading todos from localStorage:', error);
      return [];
    }
  }
}
  document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      document.getElementById('todoInput').focus();
      }
  });