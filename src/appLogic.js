// Application logic module - manages the state of all projects and todos
import { Project } from "./project.js";
import { Todo } from "./todo.js";

class TodoApp {
  constructor() {
    this.projects = [];
    this.currentProject = null;
    
    // Try to load from local storage first
    const loaded = this.loadFromLocalStorage();
    
    // Only initialize default project if localStorage was empty
    if (!loaded) {
      this.initializeDefaultProject();
      this.saveToLocalStorage();
    }
  }

  // Create and set up the default project
  initializeDefaultProject() {
    const defaultProject = new Project("Default", "My default todo list");
    this.projects.push(defaultProject);
    this.currentProject = defaultProject;
  }

  // Create a new project
  createProject(name, description = '') {
    const newProject = new Project(name, description);
    this.projects.push(newProject);
    this.saveToLocalStorage();
    return newProject;
  }

  // Get all projects
  getAllProjects() {
    return this.projects;
  }

  // Set the current project by ID
  setCurrentProject(projectId) {
    const project = this.projects.find(project => project.id === projectId);
    if (project) {
      this.currentProject = project;
    }
  }

  // Get the current project
  getCurrentProject() {
    return this.currentProject;
  }

  // Add a todo to the current project
  addTodoToCurrentProject(title, description, dueDate, priority, notes = '') {
    const newTodo = new Todo(title, description, dueDate, priority, notes);
    this.currentProject.addTodo(newTodo);
    this.saveToLocalStorage();
    return newTodo;
  }

  // Delete a todo from the current project by ID
  deleteTodoFromCurrentProject(todoId) {
    this.currentProject.removeTodo(todoId);
    this.saveToLocalStorage();
  }

  // Toggle todo completion status
  toggleTodoCompletion(todoId) {
    const todo = this.currentProject.getTodo(todoId);
    if (todo) {
      todo.toggleCompletion();
      this.saveToLocalStorage();
    }
  }

  // Delete a project by ID
  deleteProject(projectId) {
    this.projects = this.projects.filter(project => project.id !== projectId);
    
    // If we deleted the current project, switch to another
    if (this.currentProject && this.currentProject.id === projectId) {
      if (this.projects.length > 0) {
        this.currentProject = this.projects[0];
      } else {
        this.currentProject = null;
      }
    }
    
    this.saveToLocalStorage();
  }

  // Save to local storage
  saveToLocalStorage() {
    localStorage.setItem('todoApp', JSON.stringify(this.projects));
  }

  // Load from local storage and reconstruct objects
  loadFromLocalStorage() {
    const stored = localStorage.getItem('todoApp');
    if (!stored) {
      return false; // No data found
    }
    
    const projectsData = JSON.parse(stored);
    
    // Reconstruct Project and Todo objects with their methods
    this.projects = projectsData.map(projectData => {
      const project = new Project(projectData.name, projectData.description);
      project.id = projectData.id; // Restore the saved ID
      
      // Reconstruct todos
      project.todos = projectData.todos.map(todoData => {
        const todo = new Todo(
          todoData.title,
          todoData.description,
          todoData.dueDate,
          todoData.priority,
          todoData.notes
        );
        todo.id = todoData.id; // Restore the saved ID
        todo.completed = todoData.completed; // Restore completion status
        return todo;
      });
      
      return project;
    });
    
    // Restore current project reference
    if (this.projects.length > 0) {
      this.currentProject = this.projects[0];
    }
    
    return true; // Data was loaded
  }
}

export default TodoApp;

