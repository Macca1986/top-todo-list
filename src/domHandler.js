// DOM handler module - manages all DOM interactions
export class DOMHandler {
  constructor(app) {
    this.app = app;
    this.initializeElements();
    this.attachEventListeners();
    this.render();
  }

  // Get references to all DOM elements
  initializeElements() {
    this.projectsList = document.getElementById('projects-list');
    this.todosContainer = document.getElementById('todos-container');
    this.currentProjectName = document.getElementById('current-project-name');
    this.newProjectBtn = document.getElementById('new-project-btn');
    this.newTodoBtn = document.getElementById('new-todo-btn');
    this.todoForm = document.getElementById('todo-form');
    this.projectForm = document.getElementById('project-form');
    this.expandedTodo = document.getElementById('expanded-todo');
    this.expandedTodoContent = document.getElementById('expanded-todo-content');
    this.todoOverlay = document.getElementById('todo-overlay');
    this.currentExpandedTodoId = null;
  }

  // Attach all event listeners
  attachEventListeners() {
    // New project button
    this.newProjectBtn.addEventListener('click', () => {
      this.showProjectForm();
    });

    // New todo button
    this.newTodoBtn.addEventListener('click', () => {
      this.showTodoForm();
    });

    // Cancel buttons
    document.getElementById('cancel-project-btn').addEventListener('click', () => {
      this.hideProjectForm();
    });

    document.getElementById('cancel-todo-btn').addEventListener('click', () => {
      this.hideTodoForm();
    });

    // Close expanded todo details
    document.getElementById('close-todo-btn').addEventListener('click', () => {
      this.hideExpandedTodo();
    });

    // Close when clicking overlay
    this.todoOverlay.addEventListener('click', () => {
      this.hideExpandedTodo();
    });

    // Form submissions
    this.projectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleProjectSubmit();
    });

    this.todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleTodoSubmit();
    });
  }

  // Render the entire UI
  render() {
    this.renderProjects();
    this.renderTodos();
    this.updateCurrentProjectHeader();
  }

  // Render the projects list in the sidebar
  renderProjects() {
    this.projectsList.innerHTML = '';
    
    this.app.getAllProjects().forEach(project => {
      const li = document.createElement('li');
      li.classList.add('project-item');
      
      // Highlight current project
      if (project === this.app.getCurrentProject()) {
        li.classList.add('active');
      }
      
      // Add delete button if there's more than one project
      const deleteBtn = this.app.getAllProjects().length > 1 
        ? `<button class="delete-project-btn" data-id="${project.id}">×</button>` 
        : '';
      
      li.innerHTML = `
        <span class="project-name">${project.name}</span>
        ${deleteBtn}
      `;
      
      // Click to switch project
      li.querySelector('.project-name').addEventListener('click', () => {
        this.app.setCurrentProject(project.id);
        this.render();
      });
      
      // Delete project button
      if (deleteBtn) {
        li.querySelector('.delete-project-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
            this.app.deleteProject(project.id);
            this.render();
          }
        });
      }
      
      this.projectsList.appendChild(li);
    });
  }

  // Render todos for the current project
  renderTodos() {
    this.todosContainer.innerHTML = '';
    
    const currentProject = this.app.getCurrentProject();
    if (!currentProject || currentProject.todos.length === 0) {
      this.todosContainer.innerHTML = '<p>No todos yet. Create your first todo!</p>';
      return;
    }

    currentProject.todos.forEach(todo => {
      const todoCard = this.createTodoCard(todo);
      this.todosContainer.appendChild(todoCard);
    });
  }

  // Create a todo card element
  createTodoCard(todo) {
    const card = document.createElement('div');
    card.classList.add('todo-card');
    
    // Add priority class for styling
    card.classList.add(`priority-${todo.priority}`);
    
    // Mark as completed
    if (todo.completed) {
      card.classList.add('completed');
    }

    const formattedDate = this.formatDate(todo.dueDate);
    
    card.innerHTML = `
      <div class="todo-header">
        <label class="checkbox-label">
          <input type="checkbox" class="todo-checkbox" data-id="${todo.id}" ${todo.completed ? 'checked' : ''}>
          <h3>${todo.title}</h3>
        </label>
        <button class="delete-btn" data-id="${todo.id}">Delete</button>
      </div>
      <div class="todo-info">
        <p>${todo.description}</p>
        <p class="due-date">Due: ${formattedDate}</p>
        <p class="priority-badge priority-${todo.priority}">${todo.priority}</p>
      </div>
    `;

    // Add checkbox functionality
    const checkbox = card.querySelector('.todo-checkbox');
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      this.app.toggleTodoCompletion(todo.id);
      this.render();
    });

    // Add delete functionality
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.app.deleteTodoFromCurrentProject(todo.id);
      this.render();
    });

    // Add click to expand details
    card.addEventListener('click', (e) => {
      if (e.target !== deleteBtn && e.target !== checkbox && e.target.tagName !== 'INPUT') {
        this.showExpandedTodo(todo);
      }
    });

    return card;
  }

  // Update the current project header
  updateCurrentProjectHeader() {
    const currentProject = this.app.getCurrentProject();
    if (currentProject) {
      this.currentProjectName.textContent = currentProject.name;
    }
  }

  // Show project form
  showProjectForm() {
    this.projectForm.classList.remove('hidden');
    this.newProjectBtn.disabled = true;
  }

  // Hide project form
  hideProjectForm() {
    this.projectForm.classList.add('hidden');
    this.projectForm.reset();
    this.newProjectBtn.disabled = false;
  }

  // Show todo form
  showTodoForm() {
    this.todoForm.classList.remove('hidden');
    this.newTodoBtn.disabled = true;
  }

  // Hide todo form
  hideTodoForm() {
    this.todoForm.classList.add('hidden');
    this.todoForm.reset();
    this.newTodoBtn.disabled = false;
  }

  // Handle project form submission
  handleProjectSubmit() {
    const name = document.getElementById('project-name').value;
    const description = document.getElementById('project-description').value;
    
    if (name.trim()) {
      this.app.createProject(name, description);
      this.hideProjectForm();
      this.render();
    }
  }

  // Handle todo form submission
  handleTodoSubmit() {
    const title = document.getElementById('todo-title').value;
    const description = document.getElementById('todo-description').value;
    const dueDate = document.getElementById('todo-due-date').value;
    const priority = document.getElementById('todo-priority').value;
    
    if (title.trim() && dueDate) {
      this.app.addTodoToCurrentProject(title, description, dueDate, priority);
      this.hideTodoForm();
      this.render();
    }
  }

  // Show expanded todo details
  showExpandedTodo(todo) {
    this.currentExpandedTodoId = todo.id;
    const formattedDate = this.formatDate(todo.dueDate);
    
    this.expandedTodoContent.innerHTML = `
      <h2>${todo.title}</h2>
      <div class="expanded-todo-info">
        <p><strong>Description:</strong> ${todo.description || 'No description'}</p>
        <p><strong>Due Date:</strong> ${formattedDate}</p>
        <p><strong>Priority:</strong> <span class="priority-badge priority-${todo.priority}">${todo.priority}</span></p>
        <p><strong>Notes:</strong> ${todo.notes || 'No notes'}</p>
        <p><strong>Status:</strong> ${todo.completed ? '✅ Completed' : '⏳ In Progress'}</p>
      </div>
    `;
    
    this.todoOverlay.classList.remove('hidden');
    this.expandedTodo.classList.remove('hidden');
  }

  // Hide expanded todo details
  hideExpandedTodo() {
    this.expandedTodo.classList.add('hidden');
    this.todoOverlay.classList.add('hidden');
    this.currentExpandedTodoId = null;
  }

  // Format date for display
  formatDate(dateString) {
    if (!dateString) return 'No date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

