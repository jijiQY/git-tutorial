const STORAGE_KEY = "todo-app-items";

const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const taskCount = document.querySelector("#task-count");
const taskProgress = document.querySelector("#task-progress");
const clearCompletedBtn = document.querySelector("#clear-completed");
const filters = document.querySelector("#filters");
const template = document.querySelector("#todo-item-template");

let currentFilter = "all";
let todos = loadTodos();

function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("读取待办数据失败:", error);
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function createTodoItem(text) {
  return {
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: Date.now()
  };
}

function getFilteredTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function updateSummary() {
  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  taskCount.textContent = `${total} 个任务`;
  taskProgress.textContent = `完成率 ${percent}%`;
}

function renderTodos() {
  const visibleTodos = getFilteredTodos();

  todoList.innerHTML = "";

  visibleTodos.forEach((todo) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const toggle = item.querySelector(".todo-toggle");
    const text = item.querySelector(".todo-text");
    const deleteBtn = item.querySelector(".delete-btn");

    item.dataset.id = todo.id;
    text.textContent = todo.text;
    toggle.checked = todo.completed;

    if (todo.completed) {
      item.classList.add("completed");
    }

    toggle.addEventListener("change", () => {
      todos = todos.map((entry) =>
        entry.id === todo.id ? { ...entry, completed: toggle.checked } : entry
      );
      saveTodos();
      renderTodos();
    });

    deleteBtn.addEventListener("click", () => {
      todos = todos.filter((entry) => entry.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    todoList.appendChild(item);
  });

  emptyState.classList.toggle("show", visibleTodos.length === 0);
  updateSummary();
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = todoInput.value.trim();
  if (!value) {
    todoInput.focus();
    return;
  }

  todos.unshift(createTodoItem(value));
  saveTodos();
  renderTodos();
  todoInput.value = "";
  todoInput.focus();
});

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) {
    return;
  }

  currentFilter = button.dataset.filter;

  filters.querySelectorAll(".filter-btn").forEach((item) => {
    item.classList.toggle("active", item === button);
  });

  renderTodos();
});

clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
});

renderTodos();
