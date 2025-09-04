class TodoApp {
  constructor() {
      this.todos = this.loadTodos();
      this.currentFilter = 'all';
      this.elements = this.getElements();
      this.init();
      console.log('✅ TodoApp initialized with', this.todos.length, 'todos');
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
          filterBtns: queryAll.call(document, '.filter-btn'),
          debug: getById.call(document, 'debug')
      };
  }

  init() {
      this.bindEvents();
      this.render();
      this.updateStats();
      this.updateDebug();
  }

  bindEvents() {
      console.log('🎯 Events binding...');
      
      // Form submit event
      this.elements.form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.addTodo();
      });

      // Filter buttons
      this.elements.filterBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
              this.setFilter(e.target.dataset.filter);
          });
      });

      // Todo list events - KEY FIX: Bu global event listener
      this.bindTodoListEvents();
      
      console.log('✅ All events bound');
  }

  // 🔥 FIX: Ayrı bir fonksiyon olarak todo list events
  bindTodoListEvents() {
      console.log('🎯 Binding todo list events...');
      
      // Remove existing event listeners to prevent duplicates
      this.elements.todoList.removeEventListener('click', this.todoListClickHandler);
      
      // Create bound handler
      this.todoListClickHandler = this.handleTodoListClick.bind(this);
      
      // Add new event listener
      this.elements.todoList.addEventListener('click', this.todoListClickHandler);
      
      console.log('✅ Todo list events bound');
  }

  // 🔥 FIX: Ayrı click handler
  handleTodoListClick(e) {
      console.log('🎯 Todo list clicked:', e.target.className);
      
      const todoItem = e.target.closest('.todo-item');
      if (!todoItem) {
          console.log('❌ No todo item found');
          return;
      }

      const todoId = parseInt(todoItem.dataset.id);
      console.log('📋 Todo ID:', todoId);

      if (e.target.classList.contains('todo-checkbox')) {
          console.log('☑️ Checkbox clicked for todo:', todoId);
          e.stopPropagation(); // Prevent event bubbling
          this.toggleTodo(todoId);
      } else if (e.target.classList.contains('delete-btn')) {
          console.log('🗑️ Delete clicked for todo:', todoId);
          e.stopPropagation(); // Prevent event bubbling
          this.deleteTodo(todoId);
      }
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

      console.log('➕ Adding todo:', newTodo);

      this.todos = [...this.todos, newTodo];
      this.elements.input.value = '';
      this.saveTodos();
      this.render();
      this.updateStats();
      this.updateDebug();
  }

  // 🔥 FIX: Toggle fonksiyonu daha güvenli
  toggleTodo(id) {
      console.log('🔄 Toggling todo:', id);
      
      const todoIndex = this.todos.findIndex(todo => todo.id === id);
      if (todoIndex === -1) {
          console.log('❌ Todo not found:', id);
          return;
      }

      const oldStatus = this.todos[todoIndex].completed;
      this.todos[todoIndex].completed = !oldStatus;
      
      console.log(`✅ Todo ${id} toggled: ${oldStatus} → ${!oldStatus}`);

      this.saveTodos();
      this.render();
      this.updateStats();
      this.updateDebug();
  }

  deleteTodo(id) {
      console.log('🗑️ Deleting todo:', id);
      
      const initialLength = this.todos.length;
      this.todos = this.todos.filter(todo => todo.id !== id);
      
      if (this.todos.length < initialLength) {
          console.log('✅ Todo deleted');
          this.saveTodos();
          this.render();
          this.updateStats();
          this.updateDebug();
      } else {
          console.log('❌ Todo not found for deletion');
      }
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
      console.log('🔍 Setting filter:', filter);
      
      this.currentFilter = filter;

      this.elements.filterBtns.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.filter === filter);
      });

      this.render();
      this.updateDebug();
  }

  render() {
      console.log('🎨 Rendering todos...');
      
      const filteredTodos = this.getFilteredTodos();
      console.log('📊 Filtered todos:', filteredTodos.length);

      if (filteredTodos.length === 0) {
          this.renderEmptyState();
          return;
      }

      // Clear and rebuild
      this.elements.todoList.innerHTML = '';

      filteredTodos.forEach(todo => {
          const todoElement = this.createTodoElement(todo);
          this.elements.todoList.appendChild(todoElement);
      });

      console.log('✅ Render complete');
  }

  // 🔥 FIX: createElement kullanarak daha güvenli element oluşturma
  createTodoElement(todo) {
      const todoDiv = document.createElement('div');
      todoDiv.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      todoDiv.dataset.id = todo.id;

      // Checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
      checkbox.checked = todo.completed;

      // Text span
      const textSpan = document.createElement('span');
      textSpan.className = 'todo-text';
      textSpan.textContent = todo.text;

      // Date span
      const dateSpan = document.createElement('span');
      dateSpan.className = 'todo-date';
      dateSpan.textContent = todo.createdAt;

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '🗑️ Delete';

      // Append all elements
      todoDiv.appendChild(checkbox);
      todoDiv.appendChild(textSpan);
      todoDiv.appendChild(dateSpan);
      todoDiv.appendChild(deleteBtn);

      return todoDiv;
  }

  renderEmptyState() {
      const emptyMessages = {
          all: '🎯 No tasks yet!',
          pending: '🎉 All tasks completed!',
          completed: '😴 No completed tasks yet!'
      };

      this.elements.todoList.innerHTML = `
          <div class="empty-state">
              <h3>${emptyMessages[this.currentFilter]}</h3>
              <p>Start by adding a new task from above.</p>
          </div>
      `;
  }

  updateStats() {
      const total = this.todos.length;
      const completed = this.todos.filter(todo => todo.completed).length;
      const pending = total - completed;

      this.elements.totalCount.textContent = total;
      this.elements.completedCount.textContent = completed;
      this.elements.pendingCount.textContent = pending;

      console.log('📊 Stats updated:', { total, completed, pending });
  }

  updateDebug() {
      const completed = this.todos.filter(todo => todo.completed).length;
      this.elements.debug.textContent = 
          `Debug: Todos: ${this.todos.length}, Completed: ${completed}, Filter: ${this.currentFilter}`;
  }

  saveTodos() {
      try {
          localStorage.setItem('fixedTodos', JSON.stringify(this.todos));
          console.log('💾 Todos saved to localStorage');
      } catch (error) {
          console.error('❌ Error saving todos:', error);
      }
  }

  loadTodos() {
      try {
          const stored = localStorage.getItem('fixedTodos');
          const todos = stored ? JSON.parse(stored) : [];
          console.log('📂 Loaded todos:', todos.length);
          return todos;
      } catch (error) {
          console.error('❌ Error loading todos:', error);
          return [];
      }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌟 DOM ready, initializing app...');
  window.todoApp = new TodoApp();
});

// Debug functions
window.todoDebug = {
  showTodos: () => {
      console.table(window.todoApp.todos);
      return window.todoApp.todos;
  },
  addTestTodo: (completed = false) => {
      const testTodo = {
          id: Date.now(),
          text: 'Test Todo - ' + Date.now(),
          completed: completed,
          createdAt: new Date().toLocaleString('en-US')
      };
      window.todoApp.todos.push(testTodo);
      window.todoApp.saveTodos();
      window.todoApp.render();
      window.todoApp.updateStats();
      window.todoApp.updateDebug();
      console.log('✅ Test todo added:', completed ? 'completed' : 'pending');
  },
  testToggle: (id) => {
      window.todoApp.toggleTodo(id || window.todoApp.todos[0]?.id);
  }
};