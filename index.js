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
}