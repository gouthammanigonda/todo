const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log(`Server Running At http://localhost:3000/`)
    );
  } catch (e) {
    console.log(`DBError:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const hasPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  const data = null;
  const getTodoQuery = "";
  switch (true) {
    case hasPriorityAndStatus(request.query):
      getTodoQuery = `
          SELECT
            *
          FROM
            todo
          WHERE
            todo LIKE '%${search_q}%'
            AND status = '${status}'
            AND priority = '${priority}'
          `;
      break;
    case hasPriority(request.query):
      getTodoQuery = `
          SELECT
            *
          FROM
            todo
          WHERE
            todo LIKE '%${search_q}%'
            AND priority = '${priority}'
        `;
      break;
    case hasStatus(request.query):
      getTodoQuery = `
          SELECT
            *
          FROM
            todo
          WHERE
            todo LIKE '%${search_q}%'
            AND status = '${status}'
        `;
      break;
    default:
      getTodoQuery = `
          SELECT
            *
          FROM
            todo
          WHERE
            todo LIKE '%${search_q}%'
        `;
  }
  data = await db.all(getTodoQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  try {
    const { todoId } = request.params;
    const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId}
    `;
    const todoItem = await db.get(getTodoQuery);
    response.send(todoItem);
  } catch (e) {
    console.log(`DBError:${e.message}`);
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const createTodoQuery = `
    INSERT INTO
      todo(id,todo,priority,status)
    VALUES
      (${id},'${todo}','${priority}','${status}' )
    `;
  await db.run(createTodoQuery);
  response.send(`Todo Successfully Added`);
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const PreviousQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId}
    `;
  const previousTodo = await db.get(PreviousQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `
    UPDATE 
      todo
    SET
      todo = '${todo}',
      priority = '${priority}',
      status = '${status}'
    `;
  await db.run(updateColumn);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId}
    `;
  await db.run(deleteTodoQuery);
  response.send(`Todo Deleted`);
});

module.exports = app;
