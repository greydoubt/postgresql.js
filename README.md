# postgresql.js
postgresql.js

postgresql.js

A minimal PostgreSQL utility for Node.js that provides simple database access and CRUD-style query execution with a lightweight interface.

This module is designed to:

Keep PostgreSQL usage simple

Avoid heavy ORM frameworks

Work with plain SQL

Provide a clean entry point for database operations

Installation

Install PostgreSQL client dependencies for Node.js.

npm install pg

Place postgresql.js in your project:

project/
 ├─ postgresql.js
 ├─ app.js
 └─ package.json
Configuration

Set your database connection values using environment variables.

Example .env:

PGHOST=localhost
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=mydb
PGPORT=5432
Basic Usage

Import the module in your Node.js application.

const db = require("./postgresql.js")

Initialize the connection:

db.connect()
Running Queries

Execute SQL queries directly.

const users = await db.query(
  "SELECT * FROM users WHERE id = $1",
  [1]
)

console.log(users.rows)
CRUD Examples
Create
await db.query(
  "INSERT INTO users(name,email) VALUES($1,$2)",
  ["Alice","alice@email.com"]
)
Read
const result = await db.query(
  "SELECT * FROM users"
)

console.log(result.rows)
Update
await db.query(
  "UPDATE users SET name=$1 WHERE id=$2",
  ["Bob",1]
)
Delete
await db.query(
  "DELETE FROM users WHERE id=$1",
  [1]
)
Example Node Application
const db = require("./postgresql.js")

async function main(){

  await db.connect()

  const result = await db.query(
    "SELECT NOW()"
  )

  console.log(result.rows)

}

main()
File Structure
project
│
├─ postgresql.js   # database helper
├─ app.js          # application entry point
├─ package.json
└─ README.md
Goals

This module focuses on:

simplicity

functional usage

direct SQL access

minimal dependencies

It is intended for small services, APIs, and scripts where a full ORM is unnecessary.

License

MIT
