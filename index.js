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
}