{

  "sql_queries": {

    "select_all": "SELECT * FROM table_name;",

    "select_columns": "SELECT column1, column2 FROM table_name;",

    "where_clause": "SELECT * FROM table_name WHERE condition;",

    "insert": "INSERT INTO table_name (column1, column2) VALUES (value1, value2);",

    "update": "UPDATE table_name SET column1 = value1 WHERE condition;",

    "delete": "DELETE FROM table_name WHERE condition;",

    "order_by": "SELECT * FROM table_name ORDER BY column1 ASC;",

    "group_by": "SELECT column1, COUNT(*) FROM table_name GROUP BY column1;",

    "join_inner": "SELECT a.*, b.* FROM table_a a INNER JOIN table_b b ON a.id = b.id;",

    "join_left": "SELECT a.*, b.* FROM table_a a LEFT JOIN table_b b ON a.id = b.id;",

    "join_right": "SELECT a.*, b.* FROM table_a a RIGHT JOIN table_b b ON a.id = b.id;",

    "limit": "SELECT * FROM table_name LIMIT 10;",

    "distinct": "SELECT DISTINCT column1 FROM table_name;",

    "count": "SELECT COUNT(*) FROM table_name;",

    "max": "SELECT MAX(column1) FROM table_name;",

    "min": "SELECT MIN(column1) FROM table_name;",

    "avg": "SELECT AVG(column1) FROM table_name;"

},



"json_queries": {

  "get_root": "$",

  "get_field": "$.field",

  "get_nested_field": "$.parent.child",

  "get_array": "$.array",

  "get_array_element": "$.array[0]",

  "get_all_array_elements": "$.array[*]",
  
  "filter_array": "$.array[?(@.price > 10)]",

  "multiple_fields": "$['field1','field2']",

  "recursive_descent": "$..field",

  "slice_array": "$.array[0:5]",

  "length": "length($.array)",

  "contains": "$.array[?(@ == 'value')]",

  "exists": "$.field ? (@ != null)",

  "update_value_example": "{ \"field\": \"new_value\" }",

  "delete_field_example": "Remove key from JSON object (implementation depends on language)",

  "parse_json_example": "JSON.parse(string)",

  "stringify_json_example": "JSON.stringify(object)"

}

}


An expanded JSON focused specifically on PostgreSQL, including advanced SQL features and its powerful native JSON/JSONB capabilities:

{


  "postgresql_queries": {

    "basic": {

      "select_all": "SELECT * FROM table_name;",

      "select_with_alias": "SELECT column1 AS c1 FROM table_name;",

      "where_ilike": "SELECT * FROM table_name WHERE column1 ILIKE '%value%';",

      "limit_offset": "SELECT * FROM table_name LIMIT 10 OFFSET 20;",

      "returning": "INSERT INTO table_name (col1) VALUES ('val') RETURNING id;"

    },

    "advanced": {

      "upsert": "INSERT INTO table_name (id, col1) VALUES (1, 'value') ON CONFLICT (id) DO UPDATE SET col1 = EXCLUDED.col1;",

      "cte": "WITH temp AS (SELECT * FROM table_name) SELECT * FROM temp;",

      "recursive_cte": "WITH RECURSIVE t(n) AS (VALUES (1) UNION ALL SELECT n+1 FROM t WHERE n < 5) SELECT * FROM t;",

      "window_function": "SELECT col1, ROW_NUMBER() OVER (PARTITION BY col2 ORDER BY col3) FROM table_name;",

      "case_statement": "SELECT col1, CASE WHEN col2 > 10 THEN 'high' ELSE 'low' END FROM table_name;",

      "coalesce": "SELECT COALESCE(col1, 'default') FROM table_name;",

      "nullif": "SELECT NULLIF(col1, col2) FROM table_name;"

    },

    "indexes": {

      "create_index": "CREATE INDEX idx_name ON table_name (column1);",

      "create_unique_index": "CREATE UNIQUE INDEX idx_name ON table_name (column1);",

      "partial_index": "CREATE INDEX idx_name ON table_name (column1) WHERE column2 IS NOT NULL;",

      "gin_index_jsonb": "CREATE INDEX idx_jsonb ON table_name USING GIN (jsonb_column);"

    },

    "json_jsonb": {

      "create_json": "SELECT '{\"name\": \"John\", \"age\": 30}'::jsonb;",

      "access_field": "SELECT jsonb_column->'name' FROM table_name;",

      "access_text": "SELECT jsonb_column->>'name' FROM table_name;",

      "nested_access": "SELECT jsonb_column#>'{address,city}' FROM table_name;",

      "update_field": "UPDATE table_name SET jsonb_column = jsonb_set(jsonb_column, '{name}', '\"Jane\"');",

      "remove_key": "UPDATE table_name SET jsonb_column = jsonb_column - 'age';",

      "contains": "SELECT * FROM table_name WHERE jsonb_column @> '{\"name\": \"John\"}';",

      "exists_key": "SELECT * FROM table_name WHERE jsonb_column ? 'name';",

      "array_elements": "SELECT jsonb_array_elements(jsonb_column->'items') FROM table_name;",

      "build_object": "SELECT jsonb_build_object('name', col1, 'age', col2) FROM table_name;",

      "aggregate_json": "SELECT jsonb_agg(col1) FROM table_name;"

    },

    "arrays": {

      "create_array": "SELECT ARRAY[1,2,3];",

      "unnest": "SELECT unnest(array_column) FROM table_name;",

      "array_length": "SELECT array_length(array_column, 1) FROM table_name;",

      "contains": "SELECT * FROM table_name WHERE array_column @> ARRAY[1];"

    },

    "full_text_search": {

      "basic_search": "SELECT * FROM table_name WHERE to_tsvector('english', column1) @@ to_tsquery('english', 'word');",

      "ranking": "SELECT column1, ts_rank(to_tsvector(column1), to_tsquery('word')) FROM table_name;"

    },

    "performance": {

      "explain": "EXPLAIN SELECT * FROM table_name;",

      "explain_analyze": "EXPLAIN ANALYZE SELECT * FROM table_name;",

      "vacuum": "VACUUM;",

      "analyze": "ANALYZE table_name;"

    },

    "transactions": {

      "begin": "BEGIN;",

      "commit": "COMMIT;",

      "rollback": "ROLLBACK;",

      "savepoint": "SAVEPOINT sp1;",

      "rollback_to_savepoint": "ROLLBACK TO sp1;"

    },

    "roles_permissions": {

      "create_user": "CREATE USER username WITH PASSWORD 'password';",

      "grant": "GRANT SELECT, INSERT ON table_name TO username;",

      "revoke": "REVOKE INSERT ON table_name FROM username;"

    }

  }

}




PostgreSQL example (schema + sample data + practical queries) using PostgreSQL features like joins, JSONB, indexing, and analytics.


🧱 1. Schema (E-commerce Example)

{

  "schema_sql": [

    "CREATE TABLE users (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE, created_at TIMESTAMP DEFAULT NOW());",

    "CREATE TABLE products (id SERIAL PRIMARY KEY, name TEXT, price NUMERIC(10,2), metadata JSONB);",

    "CREATE TABLE orders (id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), total NUMERIC(10,2), created_at TIMESTAMP DEFAULT NOW());",

    "CREATE TABLE order_items (id SERIAL PRIMARY KEY, order_id INT REFERENCES orders(id), product_id INT REFERENCES products(id), quantity INT);"
  
]

}



📦 2. Sample Data

{
  "sample_data_sql": [

    "INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com'), ('Bob', 'bob@example.com');",

    "INSERT INTO products (name, price, metadata) VALUES ('Laptop', 1200.00, '{\"brand\": \"Dell\", \"specs\": {\"ram\": \"16GB\", \"cpu\": \"i7\"}}'), ('Phone', 800.00, '{\"brand\": \"Apple\", \"specs\": {\"storage\": \"128GB\"}}');",

    "INSERT INTO orders (user_id, total) VALUES (1, 2000.00), (2, 800.00);",

    "INSERT INTO order_items (order_id, product_id, quantity) VALUES (1, 1, 1), (1, 2, 1), (2, 2, 1);"

  ]

}


🔍 3. Common Queries


Basic Joins

SELECT u.name, o.id AS order_id, o.total

FROM users u

JOIN orders o ON u.id = o.user_id;



Order Details with Products

SELECT o.id, p.name, oi.quantity

FROM orders o

JOIN order_items oi ON o.id = oi.order_id

JOIN products p ON p.id = oi.product_id;



📊 4. Aggregations & Analytics

Total spent per user

SELECT u.name, SUM(o.total) AS total_spent

FROM users u

JOIN orders o ON u.id = o.user_id

GROUP BY u.name;



Most popular product

SELECT p.name, SUM(oi.quantity) AS total_sold

FROM products p

JOIN order_items oi ON p.id = oi.product_id

GROUP BY p.name

ORDER BY total_sold DESC

LIMIT 1;

🧠 5. JSONB Queries (Postgres Strength)

Get product brand

SELECT name, metadata->>'brand' AS brand

FROM products;



Filter by JSON field

SELECT *

FROM products

WHERE metadata->>'brand' = 'Apple';

Nested JSON access

SELECT metadata#>>'{specs,ram}' AS ram

FROM products

WHERE name = 'Laptop';



⚡ 6. Advanced Queries

CTE (Common Table Expression)

WITH user_totals AS (

  SELECT user_id, SUM(total) AS total_spent

  FROM orders

  GROUP BY user_id

)



SELECT u.name, ut.total_spent

FROM user_totals ut

JOIN users u ON u.id = ut.user_id;

Window Function (Ranking users)

SELECT name, total_spent,

RANK() OVER (ORDER BY total_spent DESC)

FROM (

  SELECT u.name, SUM(o.total) AS total_spent

  FROM users u

  JOIN orders o ON u.id = o.user_id

  GROUP BY u.name

) t;



🚀 7. Indexing for Performance

-- Speed up JSONB queries


CREATE INDEX idx_products_metadata ON products USING GIN (metadata);




-- Speed up joins

CREATE INDEX idx_orders_user_id ON orders(user_id);




🔄 8. Real-World Query Example

“Get full order history with product details as JSON”

SELECT o.id,

       u.name,

       jsonb_agg(

         jsonb_build_object(

           'product', p.name,

           'quantity', oi.quantity

         )

       ) AS items

FROM orders o

JOIN users u ON u.id = o.user_id

JOIN order_items oi ON oi.order_id = o.id

JOIN products p ON p.id = oi.product_id

GROUP BY o.id, u.name;
