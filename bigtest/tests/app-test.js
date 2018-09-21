import { expect } from "chai";
import { setupApplicationForTesting } from "../helpers/setup-app";
import { when } from "@bigtest/convergence";

import AppInteractor from "../interactors/app.js";

describe("TodoMVC BigTest example", () => {
  let TodoApp = new AppInteractor();

  beforeEach(async () => {
    await setupApplicationForTesting();
    await when(() => !TodoApp.isLoading);
  });

  describe("When page is initially opened", () => {
    it("should focus on the todo input field", async () => {
      await when(() => expect(TodoApp.newInputIsFocused).to.equal(true));
    });
  });

  describe("No Todos", () => {
    it(
      "should hide #main and #footer",
      when(() => {
        expect(TodoApp.todoList().length).to.equal(0);
        expect(TodoApp.footerExists).to.equal(false);
      })
    );
  });

  describe("New Todo", function() {
    it("should allow me to add todo items", async () => {
      // create 1st todo
      await TodoApp.newTodo("My First Todo").submitTodo();

      // make sure the 1st label contains the 1st todo text
      await when(() => expect(TodoApp.todoList(0).todoText).to.equal("My First Todo"));

      // create 2nd todo
      await TodoApp.newTodo("My Second Todo").submitTodo();

      // make sure the 2nd label contains the 2nd todo text
      await when(() => expect(TodoApp.todoList(1).todoText).to.equal("My Second Todo"));
    });

    it("should clear text input field when an item is added", async () => {
      await TodoApp.newTodo("My First Todo").submitTodo();
      await when(() => expect(TodoApp.newTodoInputValue).to.equal(""));
    });

    it("should append new items to the bottom of the list", async () => {
      await TodoApp.newTodo("My First Todo").submitTodo();
      await when(() => expect(TodoApp.todoList(0).todoText).to.equal("My First Todo"));

      await TodoApp.newTodo("My Second Todo").submitTodo();
      await when(() => expect(TodoApp.todoList(1).todoText).to.equal("My Second Todo"));

      await TodoApp.newTodo("My Third Todo").submitTodo();
      await when(() => expect(TodoApp.todoList(2).todoText).to.equal("My Third Todo"));
      await when(() => expect(TodoApp.todoCountText).to.equal("3 items"));
    });

    it("should trim text input", async () => {
      await TodoApp.newTodo("    My First Todo     ").submitTodo();
      await when(() => expect(TodoApp.todoList(0).todoText).to.equal("My First Todo"));
    });

    it("should show #main and #footer when items added", async () => {
      await TodoApp.newTodo("My First Todo").submitTodo();

      await when(() => expect(TodoApp.todoList().length).to.equal(1));
      await when(() => expect(TodoApp.todoCountText).to.equal("1 item"));
      await when(() => expect(TodoApp.footerExists).to.equal(true));
    });
  });

  describe("Mark all as completed", function() {
    beforeEach(async () => {
      await TodoApp.createTwoTodos();
    });

    it("should allow me to mark all items as completed", async () => {
      await TodoApp.completeAllTodos();

      // get each todo li and ensure it is 'completed'
      await when(() => expect(TodoApp.todoList(0).isCompleted).to.equal(true));
      await when(() => expect(TodoApp.todoList(1).isCompleted).to.equal(true));
    });

    it("should allow me to clear the complete state of all items", async () => {
      // check and then immediately uncheck
      await TodoApp.completeAllTodos().completeAllTodos();

      await when(() => expect(TodoApp.todoList(0).isCompleted).to.equal(false));
      await when(() => expect(TodoApp.todoList(1).isCompleted).to.equal(false));
    });

    it("complete all checkbox should update state when items are completed / cleared", async () => {
      await TodoApp.completeAllTodos();
      await when(() => expect(TodoApp.completeAllIsChecked).to.equal(true));
      await TodoApp.todoList(0).toggle();

      // make sure toggle all is not checked
      await when(() => expect(TodoApp.completeAllIsChecked).to.equal(false));

      // toggle the first todo
      await TodoApp.todoList(0).toggle();

      // assert the toggle all is checked again
      await when(() => expect(TodoApp.completeAllIsChecked).to.equal(true));
    });
  });

  describe("Item", function() {
    it("should allow me to mark items as complete", async () => {
      await TodoApp.createTwoTodos();

      await TodoApp.todoList(0).toggle();
      await when(() => expect(TodoApp.todoList(0).isCompleted).to.equal(true));

      await when(() => expect(TodoApp.todoList(1).isCompleted).to.equal(false));
      await TodoApp.todoList(1).toggle();

      await when(() => expect(TodoApp.todoList(0).isCompleted).to.equal(true));
      await when(() => expect(TodoApp.todoList(1).isCompleted).to.equal(true));
    });

    it("should allow me to un-mark items as complete", async () => {
      await TodoApp.createTwoTodos();

      await TodoApp.todoList(0).toggle();
      await when(() => expect(TodoApp.todoList(0).isCompleted).to.equal(true));
      await when(() => expect(TodoApp.todoList(1).isCompleted).to.equal(false));

      await TodoApp.todoList(0).toggle();
      await when(() => expect(TodoApp.todoList(0).isCompleted).to.equal(false));
      await when(() => expect(TodoApp.todoList(1).isCompleted).to.equal(false));
    });

    it("should allow me to edit an item", async () => {
      await TodoApp.createTwoTodos();

      await TodoApp.todoList(1)
        .only()
        .doubleClick()
        .fillInput("buy some sausages")
        .pressEnter();

      // explicitly assert about the text value
      await when(() => expect(TodoApp.todoList(0).text).to.equal("My First Todo"));
      await when(() => expect(TodoApp.todoList(1).text).to.equal("buy some sausages"));
    });
  });

  describe("Editing", function() {
    beforeEach(async () => {
      await TodoApp.createTwoTodos();
    });

    it("should hide other controls when editing", async () => {
      await TodoApp.todoList(1).doubleClick();

      await when(() => expect(TodoApp.todoList(1).labelIsPresent).to.equal(false));
      await when(() => expect(TodoApp.todoList(1).toggleIsPresent).to.equal(false));
    });

    it("should save edits on blur", async () => {
      await TodoApp.todoList(1)
        .only()
        .doubleClick()
        .fillInput("buy some sausages")
        .blurInput();

      await when(() => expect(TodoApp.todoList(0).text).to.equal("My First Todo"));
      await when(() => expect(TodoApp.todoList(1).text).to.equal("buy some sausages"));
    });

    it("should trim entered text", async () => {
      await TodoApp.todoList(1)
        .only()
        .doubleClick()
        .fillInput("    buy some sausages    ")
        .pressEnter();

      await when(() => expect(TodoApp.todoList(0).text).to.equal("My First Todo"));
      await when(() => expect(TodoApp.todoList(1).text).to.equal("buy some sausages"));
    });

    // this TodoMVC actually lacks this feature... TODO
    it.skip("should remove the item if an empty text string was entered", async () => {
      await TodoApp.todoList(1)
        .only()
        .doubleClick()
        .fillInput("")
        .pressEnter();

      await when(() => expect(TodoApp.todoList().length).to.equal(1));
    });

    it("should cancel edits on escape", async () => {
      await TodoApp.todoList(1)
        .only()
        .doubleClick()
        .fillInput("")
        .pressEscape();

      await when(() => expect(TodoApp.todoList(0).text).to.equal("My First Todo"));
      await when(() => expect(TodoApp.todoList(1).text).to.equal("My Second Todo"));
    });
  });

  describe("Counter", function() {
    it("should display the current number of todo items", async () => {
      await TodoApp.newTodo("My First Todo").submitTodo();
      await when(() => expect(TodoApp.todoCountText).to.equal("1 item"));

      await TodoApp.newTodo("My Second Todo").submitTodo();
      await when(() => expect(TodoApp.todoCountText).to.equal("2 items"));
    });
  });

  describe("Clear completed button", function() {
    beforeEach(async () => {
      await TodoApp.createTwoTodos();
    });

    it("should display the correct text", async () => {
      await TodoApp.todoList(0).toggle();
      await when(() => expect(TodoApp.clearCompletedText).to.equal("Clear completed"));
    });

    it("should remove completed items when clicked", async () => {
      await TodoApp.todoList(0)
        .toggle()
        .clearCompleted();

      await when(() => expect(TodoApp.todoList().length).to.equal(1));
      await when(() => expect(TodoApp.todoList(0).text).to.equal("My Second Todo"));
    });

    it("should be hidden when there are no items that are completed", async () => {
      await TodoApp.todoList(0).toggle();
      await when(() => expect(TodoApp.clearCompletedText).to.equal("Clear completed"));
      await TodoApp.clearCompleted();
      await when(() => expect(TodoApp.clearCompletedPresent).to.equal(false));
    });
  });

  // Even though this TodoMVC app doesn't use routing
  describe("Routing", function() {
    beforeEach(async () => {
      await TodoApp.createTwoTodos();
    });

    it("should allow me to display active items", async () => {
      await TodoApp.todoList(1)
        .toggle()
        .clickActiveFilter();
      await when(() => expect(TodoApp.todoList(0).text).to.equal("My First Todo"));
      await when(() => expect(TodoApp.todoList().length).to.equal(1));
    });

    it("should allow me to display completed items", async () => {
      await TodoApp.todoList(1)
        .toggle()
        .clickCompleteFilter();

      await when(() => expect(TodoApp.todoList(0).text).to.equal("My Second Todo"));
      await when(() => expect(TodoApp.todoList().length).to.equal(1));
    });

    it("should allow me to display all items", async () => {
      await TodoApp.todoList(1)
        .toggle()
        .clickActiveFilter()
        .clickCompleteFilter()
        .clickAllFilter();

      await when(() => expect(TodoApp.todoList().length).to.equal(2));
    });

    it(
      "should highlight the currently applied filter",
      when(() => {
        expect(TodoApp.allFilterHasSelectedClass).to.equal(true);
      })
    );
  });
});
