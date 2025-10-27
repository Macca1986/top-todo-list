// Project class to hold groups of todos
export class Project {
  constructor(name, description = '') {
    this.name = name;
    this.description = description;
    this.todos = []; // Array to store todos
    this.id = crypto.randomUUID();
  }

  // Add a todo to this project
  addTodo(todo) {
    this.todos.push(todo);
  }

  // Remove a todo by ID
  removeTodo(todoId) {
    this.todos = this.todos.filter(todo => todo.id !== todoId);
  }

  // Get a todo by ID
  getTodo(todoId) {
    return this.todos.find(todo => todo.id === todoId);
  }
}

