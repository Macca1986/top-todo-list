import "./styles.css";
import TodoApp from "./appLogic.js";
import { DOMHandler } from "./domHandler.js";

// Create an instance of the TodoApp
const app = new TodoApp();

// Initialize the DOM handler
const domHandler = new DOMHandler(app);

console.log('App initialized!');

