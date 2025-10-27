// Todo constructor/class
export class Todo {
  constructor(title, description, dueDate, priority, notes = '') {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority; // Can be: 'low', 'medium', 'high' or 1, 2, 3, etc.
    this.notes = notes;
    this.completed = false;
    this.id = crypto.randomUUID(); // UUID generation for unique IDs
  }

  // Method to toggle completion status
  toggleCompletion() {
    this.completed = !this.completed;
  }
}

