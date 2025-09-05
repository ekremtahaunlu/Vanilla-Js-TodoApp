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
      this.elements.form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.addTodo();
      });

      this.elements.filterBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
              this.setFilter(e.target.dataset.filter);
          });
      });

      this.bindTodoListEvents();
  }

  bindTodoListEvents() {
      this.elements.todoList.removeEventListener('click', this.todoListClickHandler);
      
      this.todoListClickHandler = this.handleTodoListClick.bind(this);

      this.elements.todoList.addEventListener('click', this.todoListClickHandler);
  }

  handleTodoListClick(e) {   
      const todoItem = e.target.closest('.todo-item');
      if (!todoItem) {
          return;
      }

      const todoId = parseInt(todoItem.dataset.id);

      if (e.target.classList.contains('todo-checkbox')) {
          e.stopPropagation();
          this.toggleTodo(todoId);
      } else if (e.target.closest('.delete-btn')) {
          e.stopPropagation();
          this.deleteTodo(todoId);
      } else if (e.target.closest('.edit-btn')) {
          e.stopPropagation();
          this.startEditing(todoId, todoItem);
      } 
    }

    startEditing(id, todoItem) {
        const todoIndex = this.todos.findIndex(todo => todo.id === id);
        if (todoIndex === -1) return;

        const oldText = this.todos[todoIndex].text;
        const textSpan = todoItem.querySelector('.todo-text');

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = oldText;

        todoItem.replaceChild(input, textSpan);
        input.focus();

        const finish = () => {
            const newText = input.value.trim();
            if (newText && newText !== oldText) {
                this.updateTodo(id, newText);
            } else {
                this.render();
            }
        };

        input.addEventListener('blur', finish);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') finish();
            if (e.key === 'Escape') this.render();
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
      this.updateDebug();
  }

  updateTodo(id, newText) {
    const todoIndex = this.todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
        return;
    }

    this.todos[todoIndex].text = newText;
    this.saveTodos();
    this.render();
    this.updateStats();
    this.updateDebug();
}


  toggleTodo(id) {
      const todoIndex = this.todos.findIndex(todo => todo.id === id);
      if (todoIndex === -1) {
          return;
      }

      const oldStatus = this.todos[todoIndex].completed;
      this.todos[todoIndex].completed = !oldStatus;

      this.saveTodos();
      this.render();
      this.updateStats();
      this.updateDebug();
  }
deleteTodo(id) {
    const confirmDelete = window.confirm("Bu görevi silmek istiyor musunuz?");
    if (!confirmDelete) {
        console.log('❌ Silme iptal edildi');
        return;
    }

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
      const filteredTodos = this.getFilteredTodos();

      if (filteredTodos.length === 0) {
          this.renderEmptyState();
          return;
      }

      this.elements.todoList.innerHTML = '';

      filteredTodos.forEach(todo => {
          const todoElement = this.createTodoElement(todo);
          this.elements.todoList.appendChild(todoElement);
      });
  }

  createTodoElement(todo) {
      const todoDiv = document.createElement('div');
      todoDiv.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      todoDiv.dataset.id = todo.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
      checkbox.checked = todo.completed;

      const textSpan = document.createElement('span');
      textSpan.className = 'todo-text';
      textSpan.textContent = todo.text;

      const dateSpan = document.createElement('span');
      dateSpan.className = 'todo-date';
      dateSpan.textContent = todo.createdAt;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
      deleteBtn.title = 'Delete task';

      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
      editBtn.title = 'Edit task';
      
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'todo-actions';
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      todoDiv.appendChild(editBtn);

      todoDiv.appendChild(checkbox);
      todoDiv.appendChild(textSpan);
      todoDiv.appendChild(dateSpan);
      todoDiv.appendChild(deleteBtn);
      todoDiv.appendChild(actionsDiv);

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
  }

  updateDebug() {
      const completed = this.todos.filter(todo => todo.completed).length;
      this.elements.debug.textContent = 
          `Debug: Todos: ${this.todos.length}, Completed: ${completed}, Filter: ${this.currentFilter}`;
  }

  saveTodos() {
      try {
          localStorage.setItem('fixedTodos', JSON.stringify(this.todos));
      } catch (error) {
          console.error('❌ Error saving todos:', error);
      }
  }

  loadTodos() {
      try {
          const stored = localStorage.getItem('fixedTodos');
          const todos = stored ? JSON.parse(stored) : [];
          return todos;
      } catch (error) {
          return [];
      }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.todoApp = new TodoApp();
});

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
  },
  testToggle: (id) => {
      window.todoApp.toggleTodo(id || window.todoApp.todos[0]?.id);
  }
};