import { when } from "@bigtest/convergence";
import {
  is,
  text,
  interactor,
  clickable,
  fillable,
  triggerable,
  collection,
  isPresent,
  attribute,
  property,
  hasClass
} from "@bigtest/interactor";
import TodoItem from "./todo-item";

@interactor
class TodoMVC {
  titleText = text("h1");
  newTodo = fillable(".new-todo");
  newInputIsFocused = is(".new-todo", ":focus");
  isLoading = isPresent(".loading");
  footerExists = isPresent(".footer");
  todoCountText = text(".todo-count");
  activeFilter = text(".filters .selected");
  completeAllTodos = clickable(".toggle-all + label");
  completeAllIsChecked = property(".toggle-all", "checked");
  todoList = collection(".todo-list li", TodoItem);
  newTodoInputValue = attribute(".new-todo", "value");
  clearCompleted = clickable(".clear-completed");
  clearCompletedText = text(".clear-completed");
  clearCompletedPresent = isPresent(".clear-completed");
  clearCompletedExists = isPresent(".clear-completed");
  clickAllFilter = clickable(".filters li:first-child button");
  clickActiveFilter = clickable(".filters li:nth-child(2) button");
  clickCompleteFilter = clickable(".filters li:last-child button");
  allFilterHasSelectedClass = hasClass(".filters li:first-child button", "selected");

  submitTodo = triggerable(".new-todo", "keydown", {
    keyCode: 13
  });

  async createTwoTodos() {
    await this.newTodo("My First Todo").submitTodo();
    await when(() => this.todoList(0).isPresent);

    await this.newTodo("My Second Todo").submitTodo();
    await when(() => this.todoList(1).isPresent);
  }
}

export default TodoMVC;
