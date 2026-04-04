# postgresql.js
postgresql.js

vector modality layer for lambda calculus


<img width="979" height="1052" alt="sample_schema informal toml" src="https://github.com/user-attachments/assets/6c1c5f13-1ffb-47e3-a1c0-b27ebb09bf71" />



```
postgresql.js
```

# A minimal PostgreSQL utility for Node.js that provides simple database access and CRUD-style query execution with a lightweight interface.

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


## 

<img width="1448" height="1651" alt="Screenshot 2026-04-04 at 11 35 39" src="https://github.com/user-attachments/assets/35a356d3-395e-4157-8a76-ee9a1d28c1ae" />


## Type Codes 
(SQLite for more info: )



 * Type codes  6/12/91

	This typecode system allows us to represent the type
	of scalars in a uniform way. For instance, all integer types
	have some bits in common, and are distinguished by a built-in
	size field. Types without multiple sizes don't have a size field.

	Scalars may only have sizes which are powers of 2. The size
	field holds the log-based-2 of the object's size.

	All run-time types can be encoded in 4 bits. There are more
	compile- time types. These fit in 5 bits.
	Schematically, we have:

```
		+----+----+----+----+----+
		| c  |    t    |    s    |
		+----+----+----+----+----+
```

Encoding is:

```
		   c   t  s	type
		-------------------------
		   0  00 00	unassigned
		   0  00 01	array
		   0  00 10	class
		   0  00 11	proxy    (OBSOLETE)
		   0  01 00	boolean (1 byte)
		   0  01 01	char	(2 bytes)
		   0  01 1s	float (single=1; double=2)
		   0  1u xx	integer (byte=0; short=1; int=2; long=3;
					 u=1 => unsigned)

			For runtime types, the size of an object
			is 1<<(t&3)

		   1  00 00	typedef	(compiler only)
		   1  00 01	void	(compiler only)
		   1  00 10	func    (compiler only)
		   1  00 11	unknown (compiler only)
		   1  01 00     error   (compiler only)

```


	Char and Boolean are not int's because they need a different signature,
	so have to be distinguishable, even at runtime. We allow arrays
	of objects, arrays(?), booleans, char, integers, and floats.
	Note that the low-order two bits of all these gives the log of
	the size, except for arrays, of course.

	I would prefer not to have unsigned int in the language, but
	don't want to make that decision at this level. We could come up
	with a better encoding of boolean and char if there were no
	unsigned.

	The compile-only type values that could be confused with the 
	integer and float scalar types must not ever be used. Value 0 must
	not be assigned a runtime type, as this is used for some sleazy
	trickery in punning types and pointer. In fact, we even have a name
	for it.
*/

/* If you change these typecodes, you'll have to fix the arrayinfo table
   in gc.c and the {in,}direct_{load,store}_ops tables in
   compiler/tree2code.c */
```
#ifndef _TYPECODES_H_
#define _TYPECODES_H_

#define T_NORMAL_OBJECT	0
#define T_XXUNUSEDXX1   1	/* Used to be T_ARRAY */
#define T_CLASS		2
#define T_BOOLEAN	4
#define T_CHAR		5

#define T_FLOATING	4	/* add log2 size to get correct code:
					float has code 6,
					double has code 7 */
#define T_INTEGER	010
#define T_UINTEGER	014

#define	T_MAXNUMERIC	020

#define	T_XXUNUSEDXX2	020
#define	T_VOID		021
#define	T_FUNC		022
#define	T_UNKNOWN	023
#define	T_ERROR		024

/* for type construction */
#define T_TMASK	034
#define T_LMASK 003
#define T_LSIZE 2
#define T_MKTYPE( t, l )  ( ( (t)&T_TMASK ) | ( (l)&T_LMASK) )

/* for type deconstruction */
	/*
	 * Because we promise always to let ints and compile-only types be 
	 * distinguished by the "t" and "s" bits above, we can simplify
	 * some of our predicates by masking out the "c" bit when testing
	 * for integers. Thus the T_TS_MASK...
	 */
#define T_TS_MASK 034
#define T_ISINTEGER(t)  ( ((t)&030) == T_INTEGER  )
#define T_ISFLOATING(t) ( ((t)&036) == T_FLOAT )
#define T_ISNUMERIC(t)  ( (t) >= T_CHAR && (t) < T_MAXNUMERIC )
#define T_SIZEFIELD(t)	((t)&T_LMASK)
#define T_ELEMENT_SIZE(t) (1<<T_SIZEFIELD(t))	/* only for some!! */

#define T_IS_BIG_TYPE(t) ((t == T_DOUBLE) || (t == T_LONG))
#define T_TYPE_WORDS(t) (T_IS_BIG_TYPE(t) ? 2 : 1)

/* nick-names for the usual scalar types */
#define T_FLOAT  T_MKTYPE(T_FLOATING,2)
#define T_DOUBLE T_MKTYPE(T_FLOATING,3)
#define T_BYTE	 T_MKTYPE(T_INTEGER,0)
#define T_SHORT	 T_MKTYPE(T_INTEGER,1)
#define T_INT	 T_MKTYPE(T_INTEGER,2)
#define T_LONG	 T_MKTYPE(T_INTEGER,3)

#ifdef NO_LONGER_USED
/* We no longer support these types */
#define T_UBYTE	 T_MKTYPE(T_UINTEGER,0)
#define T_USHORT T_MKTYPE(T_UINTEGER,1)
#define T_UINT	 T_MKTYPE(T_UINTEGER,2)
#define T_ULONG	 T_MKTYPE(T_UINTEGER,3)

#endif

/* only a slight exaggeration */
#define N_TYPECODES	(1<<6)
#define	N_TYPEMASK	(N_TYPECODES-1)

#endif /* !_TYPECODES_H_ */
```


## SQL Commands 

Terminal command:
```bash
psql -U postgres
```

Some interesting flags (to see all, use `-h` or `--help` depending on your psql version):
- `-E`: will describe the underlaying queries of the `\` commands (cool for learning!)
- `-l`: psql will list all databases and then exit (useful if the user you connect with doesn't has a default database, like at AWS RDS)



## Most `\d` commands support additional param of `__schema__.name__` and accept wildcards like `*.*`


- `\?`: Show help (list of available commands with an explanation)
- `\q`: Quit/Exit
- `\c __database__`: Connect to a database
- `\d __table__`: Show table definition (columns, etc.) including triggers
- `\d+ __table__`: More detailed table definition including description and physical disk size
- `\l`: List databases
- `\dy`: List events
- `\df`: List functions
- `\di`: List indexes
- `\dn`: List schemas
- `\dt *.*`: List tables from all schemas (if `*.*` is omitted will only show SEARCH_PATH ones)
- `\dT+`: List all data types
- `\dv`: List views
- `\dx`: List all extensions installed
- `\df+ __function__` : Show function SQL code. 
- `\x`: Pretty-format query results instead of the not-so-useful ASCII tables
- `\copy (SELECT * FROM __table_name__) TO 'file_path_and_name.csv' WITH CSV`: Export a table as CSV
- `\des+`: List all foreign servers
- `\dE[S+]`: List all foreign tables
- `\! __bash_command__`: execute `__bash_command__` (e.g. `\! ls`)

User Related:
- `\du`: List users
- `\du __username__`: List a username if present.
- `create role __test1__`: Create a role with an existing username.
- `create role __test2__ noinherit login password __passsword__;`: Create a role with username and password.
- `set role __test__;`: Change role for current session to `__test__`.
- `grant __test2__ to __test1__;`: Allow `__test1__` to set its role as `__test2__`.
- `\deu+`: List all user mapping on server

## Configuration

- Service management commands:
```
sudo service postgresql stop
sudo service postgresql start
sudo service postgresql restart
```

- Changing verbosity & querying Postgres log:
  <br/>1) First edit the config file, set a decent verbosity, save and restart postgres:
```
sudo vim /etc/postgresql/9.3/main/postgresql.conf

# Uncomment/Change inside:
log_min_messages = debug5
log_min_error_statement = debug5
log_min_duration_statement = -1

sudo service postgresql restart
```
  2) Now you will get tons of details of every statement, error, and even background tasks like VACUUMs
```
tail -f /var/log/postgresql/postgresql-9.3-main.log
```
  3) How to add user who executed a PG statement to log (editing `postgresql.conf`):
```
log_line_prefix = '%t %u %d %a '
```

- Check Extensions enabled in postgres: `SELECT * FROM pg_extension;`

- Show available extensions: `SELECT * FROM pg_available_extension_versions;`

## Create command

There are many `CREATE` choices, like `CREATE DATABASE __database_name__`, `CREATE TABLE __table_name__` ... Parameters differ but can be checked [at the official documentation](https://www.postgresql.org/search/?u=%2Fdocs%2F9.1%2F&q=CREATE).

## Handy queries
- `SELECT * FROM pg_proc WHERE proname='__procedurename__'`: List procedure/function
- `SELECT * FROM pg_views WHERE viewname='__viewname__';`: List view (including the definition)
- `SELECT pg_size_pretty(pg_total_relation_size('__table_name__'));`: Show DB table space in use
- `SELECT pg_size_pretty(pg_database_size('__database_name__'));`: Show DB space in use
- `show statement_timeout;`: Show current user's statement timeout
- `SELECT * FROM pg_indexes WHERE tablename='__table_name__' AND schemaname='__schema_name__';`: Show table indexes
- Get all indexes from all tables of a schema:
```sql
SELECT
   t.relname AS table_name,
   i.relname AS index_name,
   a.attname AS column_name
FROM
   pg_class t,
   pg_class i,
   pg_index ix,
   pg_attribute a,
    pg_namespace n
WHERE
   t.oid = ix.indrelid
   AND i.oid = ix.indexrelid
   AND a.attrelid = t.oid
   AND a.attnum = ANY(ix.indkey)
   AND t.relnamespace = n.oid
    AND n.nspname = 'kartones'
ORDER BY
   t.relname,
   i.relname
```
- Execution data:
  - Queries being executed at a certain DB:
```sql
SELECT datname, application_name, pid, backend_start, query_start, state_change, state, query 
  FROM pg_stat_activity 
  WHERE datname='__database_name__';
```
  - Get all queries from all dbs waiting for data (might be hung): 
```sql
SELECT * FROM pg_stat_activity WHERE waiting='t'
```
  - Currently running queries with process pid:
```sql
SELECT 
  pg_stat_get_backend_pid(s.backendid) AS procpid, 
  pg_stat_get_backend_activity(s.backendid) AS current_query
FROM (SELECT pg_stat_get_backend_idset() AS backendid) AS s;
```
  - Get Connections by Database: `SELECT datname, numbackends FROM pg_stat_database;`

Casting:
- `CAST (column AS type)` or `column::type`
- `'__table_name__'::regclass::oid`: Get oid having a table name

Query analysis:
- `EXPLAIN __query__`: see the query plan for the given query
- `EXPLAIN ANALYZE __query__`: see and execute the query plan for the given query
- `ANALYZE [__table__]`: collect statistics  

Generating random data ([source](https://www.citusdata.com/blog/2019/07/17/postgres-tips-for-average-and-power-user/)):
- `INSERT INTO some_table (a_float_value) SELECT random() * 100000 FROM generate_series(1, 1000000) i;`

Get sizes of tables, indexes and full DBs:
```sql
select current_database() as database,
  pg_size_pretty(total_database_size) as total_database_size,
  schema_name,
  table_name,
  pg_size_pretty(total_table_size) as total_table_size,
  pg_size_pretty(table_size) as table_size,
  pg_size_pretty(index_size) as index_size
  from ( select table_name,
          table_schema as schema_name,
          pg_database_size(current_database()) as total_database_size,
          pg_total_relation_size(table_name) as total_table_size,
          pg_relation_size(table_name) as table_size,
          pg_indexes_size(table_name) as index_size
          from information_schema.tables
          where table_schema=current_schema() and table_name like 'table_%'
          order by total_table_size
      ) as sizes;
```

- [COPY command](https://www.postgresql.org/docs/9.2/sql-copy.html): Import/export from CSV to tables:
```sql 
COPY table_name [ ( column_name [, ...] ) ]
FROM { 'filename' | STDIN }
[ [ WITH ] ( option [, ...] ) ]

COPY { table_name [ ( column_name [, ...] ) ] | ( query ) }
TO { 'filename' | STDOUT }
[ [ WITH ] ( option [, ...] ) ]
```

- List all grants for a specific user
```sql
SELECT table_catalog, table_schema, table_name, privilege_type
FROM   information_schema.table_privileges
WHERE  grantee = 'user_to_check' ORDER BY table_name;
```

- List all assigned user roles
```sql
SELECT
    r.rolname,
    r.rolsuper,
    r.rolinherit,
    r.rolcreaterole,
    r.rolcreatedb,
    r.rolcanlogin,
    r.rolconnlimit,
    r.rolvaliduntil,
    ARRAY(SELECT b.rolname
      FROM pg_catalog.pg_auth_members m
      JOIN pg_catalog.pg_roles b ON (m.roleid = b.oid)
      WHERE m.member = r.oid) as memberof, 
    r.rolreplication
FROM pg_catalog.pg_roles r
ORDER BY 1;
```

- Check permissions in a table:
```sql
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name='name-of-the-table';
```

- Kill all Connections:
```sql
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE datname = current_database() AND pid <> pg_backend_pid();
```


## Tools
- `ptop` and `pg_top`: `top` for PG. Available on the APT repository from `apt.postgresql.org`.
- [pg_activity](https://github.com/julmon/pg_activity): Command line tool for PostgreSQL server activity monitoring.
- [Unix-like reverse search in psql](https://dba.stackexchange.com/questions/63453/is-there-a-psql-equivalent-of-bashs-reverse-search-history):
```bash
$ echo "bind "^R" em-inc-search-prev" > $HOME/.editrc
$ source $HOME/.editrc
``` 
- Show IP of the DB Instance: `SELECT inet_server_addr();`
- File to save PostgreSQL credentials and permissions (format: `hostname:port:database:username:password`): `chmod 600 ~/.pgpass`
- Collect statistics of a database (useful to improve speed after a Database Upgrade as previous query plans are deleted): `ANALYZE VERBOSE;`
- To obtain the `CREATE TABLE` query of a table, any visual GUI like [pgAdmin](https://www.pgadmin.org/) allows to easily, but else you can use `pg_dump`, e.g.: `pg_dump -t '<schema>.<table>' --schema-only <database>` ([source](https://stackoverflow.com/questions/2593803/how-to-generate-the-create-table-sql-statement-for-an-existing-table-in-postgr))

## Resources & Documentation
- [Operations Cheat Sheet](https://wiki.postgresql.org/wiki/Operations_cheat_sheet): Official PG wiki cheat sheet with an amazing amount of explanations of many topics, features, and many many internal implementation details
- [Postgres Weekly](https://postgresweekly.com/) newsletter: The best way IMHO to keep up to date with PG news
- [100 psql Tips](https://mydbanotebook.org/psql_tips_all.html): Name says all, lots of useful tips!
- [PostgreSQL Exercises](https://pgexercises.com/): An awesome resource to learn to learn SQL, teaching you with simple examples in a great visual way. **Highly recommended**.
- [A Performance Cheat Sheet for PostgreSQL](https://severalnines.com/blog/performance-cheat-sheet-postgresql): Great explanations of `EXPLAIN`, `EXPLAIN ANALYZE`, `VACUUM`, configuration parameters and more. Quite interesting if you need to tune-up a postgres setup.
- [annotated.conf](https://github.com/jberkus/annotated.conf): Annotations of all 269 postgresql.conf settings for PostgreSQL 10.
- `psql -c "\l+" -H -q postgres > out.html`: Generate a html report of your databases (source: [Daniel Westermann](https://twitter.com/westermanndanie/status/1242117182982586372))




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
  ["Set",".
.
#̴̢͚̯̠͖̤̍̀̐̾̀͡ p̷̨̱̦͕͓̺̼̱͆̅̓̄͗͆̈́ͅo̵̺̙̞̘̯̯͕̭͊̍̐̓͢͞͡͠ͅs̷͎̤̭͚̒̆͋̀͌͜ţ̷̟̟̩͕͎̜̦̿̆́͊̈́͜ǵ̬̯͕̬̏͊́̊͛͜r̡̨͎̜̥̤̲̒̇̂͊̏́͂̊̽͠e̶̡͉̳̪̫̋́̑́͗͠ş̜̮͙̳̫̐̈̐̉̇̿͘͞q̵̢̢̧̛̬̹̼̀̔̓͒̕͘ͅḽ̘̭͖͍͖̘̲͙̀̀͆͋́̀͆͞͡ͅ.̧͈̬͍̅͗͐̑͑͛͜͠͞j̶͚̭̭̠͈̍̓͌͊͐͊̑̚͝͡ş̘̜̩̤̼̩̎̄͆͋̇̕͠
̳͖̝̲̤̝͉̤̖́̿̀͛̌͋̚͠p̨̫̠̲̜̰͙͑̽̽̑̀̍̓͝͠ơ̫͓̻̮͐́̉͋̒̃͐̏ͅś̶͚̤̟̩̹̟̗͋̈́̃̈́̇̌̽̕͘͟t̢͎̙̻͍̮͂͗̂̈͟͝g̢̩̙̬͉͛̑̇͂̐̔͆r̡̡̧͚̼̺̟̣̣̙̂̔̄̿͌̂͌̒̏͞ẽ̶͓̥̬̲̣͓̣͍̐͗́̃̂̈͘s̛̲̣̜͙͈̘̥̀̈͛̈́̄̈́̅͘͞q̺͎͈͙̻͕̣̿̄͗̾̊͠͡l̛̥͇͙̦͕͌̽͒̄̂̽͋.͖̼͓̖͖̪̦̼͈͂̾̍̂͠j̸̢̡̡͙͍͇̪̤̙̇̓͗͒̏̈́̈́̾̓̂s̬̖̝̯̗͋̊͆͊͋
̨̙͉̞̳̙͖̝͛͑͑͑́̋͠
̸̨̨͍͎̯̱̻̠̤͒͂͐͂͗̓̚ṗ̵̡̼̼͕̖̙̭̜̤͇̄͐̾̎̈́ȏ̶̡̦̜̳̲̝̥̬͉͇͌͊̌̒̆̆̓̉s̴̢̺̪̺̗̣̥̭͊̉͗͂̊̍t̴̡̤͎͔͍̺̀̊̉̒̇̊ͅg̷̗̘̻̜̏͛̀́̊̽̌̕͘͟͡r̸̨̡͉̩͖̮̖͒́̌̏͞ḙ̛̛̟͔͎̙̫͎̰̑͒͒̑͛̂͘͢͜͠s̷̬̞̳̬̰̥͓̯̤̃͒͌̾͑̉́̕͘͢͠q̷̡̧̪̪̜̖̖̤̊̄̎͗́l̳͕̗̼̯̼̘̓̂̈̊̉͑̕͝.̻̪͍̲̯̅̈͑̍̉͐͗̈̒̓͢j̷̧̡̛̼͓͍̠͈̪̼͍̅̿͊͝s̛͖̖̩̞̿̌͌̄͗͢͠ͅ
̧͈̮̯̭͖̯͌̉͆̀̈́͡
͖͍͚̳͇̦̺́̊͐̍̽̈́̿͢͞A͍͚͙̼̦͐̍̿̑͋̍̚̕͡ m̨̭̺̼̺̭̽̀̄̎͂́͛̔i͔͚̝̟̰͋̐̀̂̽̎̂̔͊͡n̷̢̢̨̮̘̥͖͍̮̑̌̆̀͗̌̀͠͝͠ͅḭ̢͓̫͎͚̩͉̳͗̌̀̐̈͂̄̇m̤̞̤̜̣̱̈͛̉͆̆́̔̀̽̓a̢̹̹̠̙̦̭̠̦͈̋̈̍̇͠ļ̶̖͈̣̣͇̮̀̆̋̔̀͋̀̀͘͞ P̧̡̧̝̫͗͋̒̔̉ő̴̧̝̪̼̲̍̆̌͒̇̂͆̅̈ş̼̝̝̫̫̣̀́͂̀͑̈̑͢͜͞t̶̻̘͎̲̳͕̣̠̓͑͊̈́̾͛͐̂̒̕g̲̭̰̖͚͔̎̋͊̃̌̐̀r̶̛̞̮̖̮̠̐̽̒͋̍̕͘͢͠͡ḙ̛͕̦̺̯͎̮͆́̽͐͘͜͝͠Š͍͉͓̠̹̄̾̔̑͋͋ͅQ̪͚̻͚̫̟͌̈̎̇͋͜L̢̰̗̩̞͖̻͉͕͊̈̌͒̊̋͗͊͞ ṳ̵̞̲̰̹̟̐̈́͒̐́͑͟͜͝t̶̛̹̻͎̝͑̂̓̀̓̒̊̎͌͢ī̯̯͔̩̥͇̮̱̀̇̐̌̀̕̕̚̚ḽ̙̺̫̯̳͔͉̱͉͐̆͒̒̌̂̉̒̏͞î̴̼̦͓̹̱̓̀̄̋͛̌̋̅t̵̢̺͈̲̟̪̰̪̀͆́̓͘͟͠ͅy̡̧̜̯̣͔͔̣͛́̿̐͂̏̀̈͘͟ f̨͔͇̬͔͎͂̅̽̐͊͞͞o̴̧̜̗̪͉̤͉͊̍̓̔͋̎̏̌͢ͅŗ̵̢̛͉̗̠͆̓́͗͢͟ N̛̫͚͈͓͎̝̳̗̉̒̀̈́̓o̴̜̮̜̻̠̗̭͗̊̆̾͘͟d̜̜̰̮̩̫̤̰̎͑̓̔͑͑͟͢e̸̮̱͙͚̬̲̪͊̅͆͒̑͆̔̐͘ͅ.̡̼͍͇̩̰̺͌̊̿̉̈̔̓͢͠j͓͖͇̭̻̯̝͙̞̹͗̇͐̃̌͡s̥̝̭͎͖̣̅͗̒͂́̊̚͡ t̶̨͍͍̮̦̯̠͂͗͒̑́͋̀̍͘͝ḩ̶͍͕̖̺͑̈́͗̾͒̚͜͝a̛͙̘̟̗̮̓͊͛̒͢͜͟͠͞t̴̩̞͙̥̣̰̒̆̉̑͆̚ p̡̪͉̜̻̯̯̰͚̎̀̄̄͆͊͘ŗ̴͙̲̙͕͔̝̓͗̇̓̽̚͢͞ó͉̙̖͍̞̌̌̅͆̚͠v̸̢̡̦̞̱̗̥͇̭̝͂̈́̔̄̾͒͞͡i̞̤̮͖͉̪̤̾͆̌͗̆̌ď̝̟͙͍̺̘͔̭͉̀̌̐͌̓̔͘͢e̲̣͚̗̰̘̤͗̅͆̒͊̀͑̓š̡̨̺͓͚̬͙͉̋̽̈̏̀͘̕͠ s͕̟̖͉͙̒̑̓̈̕͜͞͞ȋ̶͙̥͍̼̖̙̳̱͈̅̏͗͘m̢̨̗̱̰̱̟̬͎̽͊̏͒̐̃̕͢͠͝p̡̧̨͎͓̜̏̉̄̂̇̀̀͝͠l̻̬̗̮̥̫̘̼̗̄̒̂̈́͊̊͒̾͡ȩ̞̣͎̜̪̥̀̏̋̈́̅ d̸̢̧̛̦͇͍̺̭̖̦̳̀̑̐̎â̞̭̼̞̫̙̿̌͛͘̚͢͠t̴̘̖͓͎̜̞̖͈̦̰͑͆͌̊̏͝͠͠a̝̬͉̺̝̞͙̩̝̩̾̌̀̊̓͗̔̏̓́b̴̛̺͈͚͓͉̱͍͉̖̔̊̿͒̋̍̎̆̚͢a̢̨̡̨͈̭̖̠̦͕͐̃̊̊̒̄s̡̳͚̫̦̀̂̐͗̒̔̔͠ḙ̛̜̖̖̗̰͔̃̐͛̃̔̇͊͆̈͟͜ ä̶̢̹͙̖̦́̍̿͊̉̆̀͞c̴͚̰̬̻̖̲̟͎̙̓͐̂̓̓̌̓̀͂͡ͅc̢̘̱͎̯̀̿͑̂̀̒̈́̋̒͘è̴̫͔̝͇͇͉̊̉̐͠ş̥͓͖͚̟͊̅͂̂̀̕ŝ̸͚͈̺̭̟͉̒̾̍̏̌́́͘͡ a̵̡̛̹͇̠̖͎̻͚͂̋̈́̈́́͢͝ͅn̼͇̺͇̖͆̎̇̇͐̓̾̽̚͝ḍ̛̳̺̙̙̙̙̒̅́͋̏̈́̀̕͠ C̷̛̪̣̰̥̫̜͉̖͑̅̀̒̋͂̏̊͡ͅŔ͚͉̪̟̂́̃̐͟U̵͎̼̙͈̪͔̦̲̍͗̅̄̑̍̓͑͘͟D̡͚̜͚̪̜̺̓̃̏̑͊̓͠-͇̼̻̙͓̳̎͋̊̈͛̓͐͡͡͠s̛̮͚̬̫̓̔̀͌̓̆͜ṱ̴̪̟̹͙̯͆͐͒̑́̃̿͘̚͡ỹ͚͔̪̙͈̰͓̜̞̉̏́͐̕͜l̶͚̖̥͈͍̬͈͓͂̑̓̊͐͂̔̊͂͠ͅȩ̸̛̳̠̥̯̖͒͑͋͒͑̏́͢͢ q̧̝̫̝̽̽͒͒̚͜͠ų̷̭͓͈̃͊̑̑̋̅͒̾̎͜ę̙͔̞̲̃͋̾͋̽̈́̈͡͡r̴̥̥̹̙̱̘̜̰̿̎̐͆͛̉̾͞ỵ̸̢̟͉͖̹͎͓̱̥́̐̅̑̊̀̇́́͠ ḙ͖͉̥͎͔͍̲̩̣͛͗̓͂̀̑̑͗͡͡x͚͇̭̹̮̌͋́͐͡͠ę̡̡͖̤̳̥̽̑̀́̇͢͡͞c̡̨̬̟̦͓̜͎͈̮̈̏̓̑̎̃͡͝u͕͉̪̭̙̻͒̅̍̈́͐̎͘͢ṭ̴͇̻͚̣͗̑͗̒̚į̵̟̪͙̘̺͑͂̊͒̓͛̒͆ǫ̸̛̛͇̺̠͖̣̟͎̝̆͗̕͝͝ͅn̳̩̹̻̤͐͒͒̿͘ ẉ̙̯̘̟̪̀͑̇́̀͘͜͢͡í̷̫̻̰͎̟̍̅͗͒͗̽̽͛͟͢t̡͙̺͓͊̄̎̀͛̎̍̕͘͢͞ḩ̷̥͓̤̳͉̊̅́͑̿͋̋͘ͅ ą̛͈͇̻̮̺͖̙͕̮͊̀̍͒ l͍̠̣̝̓͒́̿̀̽͜į̵̧̛̙̫͔̗̻̍͊̒̑̕̚͠͞g̨̯͚̲͙̼̦̼͎̊̏̉̾̓͛͝͝ḩ̵̻̝̘͎̦̦̟͎͌̅̈́͛̌̃͢͝t͚̮̱̝̭̰͈̙̟̏̍̈͛̀̑͞w̨̳̼̟̠̗͖̾͑̑̋͒̈́̏̔͢͞e̷͙̺͓̝͇̬̥̊͊̿͆́̓̾ͅi̡̛̙̗̺̎̾̓͗̌͟ģ̨̪̩̖͙̤̫͎̪̿͋́͑́̈́̿̔̕͡h̡̺̺̺̥̪̙̄̆̆̓̊̆̇͜͞͝͞t̡̮̮̜̞̤̙̗̰̄̀͊̈͜͞ i̡̛͓̥̪͍͊̿̌̑̈́͘̕͢ņ̸̢̧̡̞̥̼̗̭̒̊̍̋̌͆́ţ̸̜̳͙͍̭́̓͂̒̕͠ḛ̷̢̛̳͚̳͇̮̼͎̖̊̍̓͐̃̄̎̽̎r̶͙͕̠̲̰̭̉͗̀͒̂͘f̵͎̹̯͚̪̰̩̱̄̃̀͌͢͞ͅä͍̖̮̰̳̎̈̎̑ͅc̼̠̱̮̼͋̿͛͒̂̀̕͝͝ẹ̴̛̙̬̙͊̔̂͊͜͝.̷̧̡̨̣͈̱̞̱͓͐̏̓̆͋̾̿̕͢͡
̶̣̭̺͍̦͓̹̫͊̏̓̄͌
̷̩̰̫̩̜̣̻̝͛̍̍͆͘͢͞͞Ṯ̢̗̥͚͖̼͉̰̗̐̓̒̚͞h̶̡̻̖̞̞͙͎̉̊̒̎̈́́͆̕͝į̴̟͈̮̮͙̞̟̋̀̎͐͡ͅͅs̖̪͚̳͓͛͛̌̽͆͆̇͘ m̴̢̱͙̜̰̼̤̘̖̘͑̀͂̐̒̕̚͞͝ǫ̷͕̠͚͎̩̫͓̏̌̄͆̄̽d̨̟͉̤̞̪̠̤̈́̌͛͆̉̃͗̏͑͜u̢̠͎̣̣̥̿͌̃̒͝l̸͙̯͍̮̺̜͔̙̈̔̆͂́̂̓͊́͗ͅȅ̡̡͔̼̗͎͎̉̏͆̌͝ ị̧̹̲̥̦̰̬͇̯̃̿͑̑̐̊̀͘̚͞ŝ̴̨̧̛͍̰͖̀̂̀̏̊͢͜ͅͅ d̴͉̹̬̦̪̯̖̯̥͆̾̿́̇́̚e̴̢̺̜͋̏͆͂͒͜͢ŝ̡̼͓̥̮̥͕́̊́̚ȋ̛̱͇͚̞͖̲̇́̀̓̀̔̍͢͢͢͠g̸̙̳̯̮͚̮̏̈́͆̀͆̓͘ǹ͔̠̮̟̖͔̮͔̾̉̍͊͜͡ͅę̸͔̲̺̯̞́͒͊̏͑͗̉̄͑͠d̢̢̛͍͇͎̾̾͑̑̀͛͘̚͟͢͞ t̷̨͕̻̰̪̪̏̅̀̀̕ŏ̸̪̳̝̻̞̼̻̯̓͑͘͝:̛̰̯̫̜̞̊̍̿̀̆͊͋
̮̙̣̬̯̻͗̾̏̎̓̄͠
̶̧̫͖̞͈̹͉͔̆͆̓̋́̿̚͡Ķ̢͕̫̘͍̻̲̂̽̊̋̑̊̂͝e̯͖̭͇͈̯̓̋̈̉͐ȩ̸̤̤͖̩͓͆̽̃̆́̇̚͠ͅp̸̡̼̟͚̮̯̳̓́̒͌̏͟ͅ Ṕ̨̛̼̞̘̘̖͍́́̋̀̎̀̾̕ͅͅơ̟͚̤̗̠̤͙̞̈̍̅̒͟͢ṡ̶̠̤̙̟̪̙͓̟̦͙̊̇̐̐t̶̢̛͍̜̟̋̌̇͟͢͡ͅğ͈͙̻̲́̔̒̊̚͜r̡̩̟̥̝̹̫̟̾̓̓̈͜͜͡e̡̤̦̙̣̮̺͆̇̉̇̔͢͟͝ͅŜ̨̧̛̬̮͙̩̣̤̲̻̍͋̓̑͘Q̡̢̝͓͉̫͕͍̰̿͊͛̌̈́̃͒͋̚L̴̢̹̟̣̪͖͙̥̼̉͌̈́̄̀̿̚̕͝ ṷ̶̰͎͕̼͕̾́̆́̕s̵̡͈͚̣̥̈́́͌͗͆͢͝ͅͅa͕̘̩͎̙̞͌̒̐͆̍̅̽͘g̶̡̨̼͉̝̦̺̬͗͐́̆̓͂̇̇̒͠e̴̳̪͍͓͔̣̔̊́͂̋̚ s̸̠̬͕̞̰̻̗̮͉̎͑̅͐̂͐̇̕̚͡ȉ̞̞͖̜̥̩͕̿̽̔̈́m̧̢̲̝͖̩͔̫̖͉̍͌̋͋͆͒́̕͝p̤̮̠̜̹̖̠̩̱̘͋̑͐͊̆͆̅͘̚l̳̖̮̟̺̫̆̎̾̋̊͟e̦̱̖̩͗̈̍̒͊̔͘͢
̶̼͕̲̳̜͋̒͒̉͡
̶̢̧͍̝̤͓̥͓̰̭̂̌̀̊͐Ą̵͙̱̙͈͖̏̅̔̊̐̕v̷̲͎͔̹̬̙̙̼̫̈̐̆̑͌ͅȏ̵̡̮̠̲̖̫́̽̓́̀̆͜ì̧̛̱̪̤̝͎̟͐̋̀̊̕͠͞d̡̠͎̲̫̬͎̦̅̈́͗͑̋͂́̚ h̵̲̘̺͉̣̽͐̔̊̆̾͞͠ȩ̴̩̺̦͙̩̯̖̘̀̋͐͋̓̂͟à͈̱͍̖̱̉́̀̕͞v̵̳̬̳̮̱̹̿̎̒̃͠y̶̨̮̺͍͉̼̻̬̑̑̇̐͠ O̢̡͖̗̰̩̘̐͆̿͂͆͊̎͝R̩̹͎̣̘̠̲̭̠͛̽̅̐̾́̃M̶̧̰͓̫̠͌̔̌̑̚ f̧̺͎̥̠̲͖̬̊́́̾͌̊̈̚͢͢͠r̵̛͉̭̙̠̞͓̩͕͓͚͗̈͑͠͞ă̶̦̖̜̭͚͔̜̫̣̔̍̑̈́̀͐̓͋͠m̤̯̮̞̼̬̜̩͛̂́̄̓̚͞͝e̵͕͍̜̥̾̑̌̄̓̈̌̏͟ͅẃ̵͔͓̖̺̪̹̰͌͛̄̎̃̈́̚͡o̱̼̪̥̣̜͉̤̫͊͑̏́̔͡͡r̵̬̼̣̪̟̜͊̓͊͑̾́̈́̅̌̚ķ͔͖͌̏͛͋̂͘͘̚͟͜͡s̸͓̙̪̜̻̘̈́̌̒̒̄̾̚̚͢
̵̡̫̺̰̼̤͉͔́͊̃͋͡͝
̴̨̢̦͖̪̭͙͔̟̬͗͊̾̑͗W̩͓̤̜̦̮͎̫͐͐̌̂̆͘̕͢͟͝o̵̧̨͔͇͓̬̠̻̒͒̇̍͘͝ͅr̢̲̼̦̤̤͈̟̗̯̀͆̽̿͑̍́̔k̷̩̪͎̞͌̔͑̔̀̕͟ w̴̡̧̙̤̫͖̭̪͂̑̔͒̄͐͠͡į̶͚͇̤̱͍͉͉͇̈͗̇͌̈̂̐͋͜t̢͕͈͚͚̆͑̆̔̆̀̚͡h̷̡̝̤͇̮̄̒̇̈́̒̈́͞͝ p̨̩̫̭̟͈͑̒̽͡͠l͔͚͈̦̮͑̊̔̌̍͟͜͢ą̴͈͈͎͔͉̩̪͔̏̾̀̄͛̈́ì̵̡͇̙̻̪̦̭͚̔͂̒͒̉̑͛̋ǹ͔͎̯̺̦͓͊͊͐̾̐̍̚͟͠ S̡̠̻͇̰͕͛͐̽̌̇̚͢Q̨̭͎̲̼̫͇̯̉̈̎͊͘͠͝L̘̥̙̙̮̪̻̭̋̇̑͆̄͆̑͆͢ͅ
̸̤̮̪̙͉͎̊̓̓̌̂̒͗ͅ
̼̘͔̙͋̄̌͆͆͑̔͠͞ͅP̴̧̜̦̲̞͓̞̖̑̉́̒̌͋̐͘͘͠r͔͈̖͙̗͚͖͋̂̀̇̔͋̚̚͜͢͡o͓̠̮̗͖̜͒̉͛̍̚͝v̸͙̙͉̳͍͉͋́͆̅̒͐̎̎i̡̭͉̥͓̿͌̑̆̍̐͌̀ḓ̛̮͙̘̯̉͐̇̈̃̎̕͝ȩ̪͉̼̻̲͂̆̓̽͊͒̚͡ a̧̧̹̰̥͓̓͑͗͗̂͊ c̸͈̰̥͈̘̙̰̀̿̊̄͗͝͝l̟̩͇͓̘̗̰̜̪̖̀̃̃̌̍̑͠ę̖̥͔̝͓̀̊̾̆͗̉̕͜ã̡̧̱̦̰̻͔͎̟̓͗̂̓̓̈͗̂͢ņ̴̨̛̛̳̟͚̗͖̇͆̽̈͜ͅ e̡̮͎̝̯͙͛̃̾͒̿͆̍͡n̡̛̤̣͍͉̤̝͓̾͊̿̐̉͟͠͝͠t̢̧̡̛͈̭̜̩̮̱͂͌̉̂͠r̸͎̜̺̙̱̪̦͔̟̾̎͗̏̇͘͜͠y̶̨̳̼̪͈͒̑͑̌͌̏̃͆͜͠͠ p̴̢͕̝̩̦̉͌͐̇͒͋͢͞ó̷̢̻̫̬̱̦̹͉̖͊͗͑̅̏͊̚͢͞͠ḯ̷̢̙̣̱͉̓̊͛͑͑̇͢n̵̢̛͍̭͙͕̘̊̓̓̒̏̕͞ţ̸̧̥͓̤̑̒̉̎̿̌̽̚͝ f̷̲̣̫͚̞̤̣̀̏͌͑͊̀̓̌̇͑o̢̧̹̪̦̗̺̓̀̆̄̈́̊ŕ̸̰̳̼̰̝̈̉̅́̔̂͋̿̑ d̷̯͕͔̱̭̅̾̂̈́̇̅̔́̓͒ͅa̸̦͇͇̗͙̺͓̐̓̓̅̈̐͘t̴̮̦̜̰̭̽̔̔͊̔̋̃͊͋ã͙̮̪͍͎̱̜̝̃͐͑̒̕͜ͅb̷̢̮̖͓͇͓̯̙͖̈̂̓͊͗͘͜a̧̨͙̯̫̙̭͔̰̒̓̀̓̓̿͂͌͢s͖̟͇̩̤͙͕̞̞͒̏̌́̑́͆̀͝͞ě̵̛̛̞͍̺̮̰͕́̓́͢ͅ ò̴͎̩̱̲̪̥͈̾̌̈̀̃̋͢͢p̢̧̛̟̗͖͚̝̜͐̌͆͑̆́̓̽͜͠ê̴̢͇͚̘͌̉͛͛͘ͅr̵̛̞̝̤̝̲̮̎̄̿͂̑͘͜ḁ̧̧̝̗̼̙̰̝̰̈́̾͌̅͌̉͒͒͞͝t̨̨̨͉͙͎̩͈̳͌̓̐̒̓̅͑͡i̛̲̺̤̞̺͉̪̿̄̒̀̓͑̌̄͆͟o̡̜̦̜̽̄̇͗̕ͅn̶͚̺̪̬͉͙̅̈́̀̀̇̑̿͑s̛̫̟͖̰̖͔̔̆̀͛͌͆̌͞
̴͚͇̫̱̈̌̌̔́͆͟͡
̡̧͚̜̼͔̺̒̅̀̑̈́̕Í̷͚̪̜̪̭̀̒̔͡ǹ̵̡̥̦̟̜̻̖̏́͂̿̔́́̾̂͟š̷̹͔̫̥̟́̔̽̄̉̊̑̀̚͟t̵̩͙̹̪̲̹̪͂͛̃̍̇̚͡a̰̹̯͔̼̪͔͍̭̣̓̓̓͋̇̉̅̕l̞̘̻͕͇͉̾̅̾̉̄̇͆̑͞l̻̫̱͎̥̯̟͈̎̒̉̄̓̚͜͝͡͞͝a̛̲̟̳̲̗̼͕̎͛̽̽̃̊ͅț̛͓̳͖̬͌̂̄͆̏̓̕͟͞í̸͈̲̞͔̬͗̈́͊̈́̎o̪̪͓̤͑̇̍͒́̍͜͞n̙̱̤̯͍̓̆̃̊̂͂̎̕̕
̸̨͍͖̤̞̣̩̈̉̾͋́̌̊̕
̴̙̞̘̠̱̠̠͕̳̋̊̀̏̽̃͘͝͠Į̸̲̜̩̥̯̲̂̐̔̀͠ͅn̶̢͇̗̜̥̲̭͋͊̀̅̉͛̍͝͠s̡̰̪̜͙͖̱̦͚̈̂͛̀̔̏̆̇͘ț̡͓̗̼̲̽̃́̾͛́̂̔̓͞ä̼̘͖̞̥̘͎͍́̂̃̀̒͊̚͢͡͞l̙̺͔̘̳̓̀͆̅̆̀̌l̸̛̛̲͔̜̺͎̩̼̪̔̋̄̑̓͊̈̚ Ṗ̨̰̣͈̮̍̔͛̍͜õ̧̻̬̟̅͋̋͛̀ͅş̵͔͔̥͍̇̽̈́̓̚͜ͅt̶̢̯̫͙̱̱̹̓͆̒̄̃͒͗̀̋͡ģ̷̯̳͚̣̻̙̆̃͌́͊̑͟͝r̢̥̜̳͇̝̟͋̇̀̅̈́͘͢ę̧̮̭͙̾̐̊̄͛͘̕S̹̣̹̹̫̣̭͖̉͂̆̇͐͆̌̽͜͡͠Q̷̧̛̞͍͖͉̥͚̞́̄̓̈͟͝ͅL̛̛̠̤͍͙̭̙͍͋͊͊̀̚͢͠ c̴̰͈̳͈̲͛͛͛͛̏͌̔͒̔͟l̵̺̭͉̪̖͓̭̜̉̏̍̈́̈́͟͞i̧͕̮̠̱̙͇̻̯̓͋̃͒͌͂͊̑͂͌e̡̳̯̻̼̤͕̙̱͒̈̐̈́͌̎̑̚͜͠ņ̷̛̗̹̦̜͓̞͇̌̉̈̓̇͝t̸̛̤̻̻̬̙͓̂̋́̌͋̿͞͝ d̡̛̮͖̝̽͒̈̍̉͜é̸͕̩͙̋̆̔͟͜͡ͅp̸̡̺̩̥͇͔̳͔̓̅͊̑̔͑͆͢e̛̜̯̪͈͙̰͎͛̈́̈́̓n̸͈̣͉̳͍͋͐͛̄̽̏̚͜d̴̢͉̪͕͓̘̿̂́̾͗̄͠e̶̱̬̜̼͖̞͓̞̽͑̒͑̑̔̐̅̿͜ņ̷̮͔̗̞͙̈̿͛͊͊̀͜͟͢͠c̣̲̜͉̫̯̐̿̍̓͋̚͢i̷̠̰̫̩̱̅͛̽͐͑͆̔̚͠e̷̢͚̲̲̯̹̝̘͗̀̉͡͠͠ͅs͉̟̙̪̲̬͐͌͒̃́̔̏͞ f̧̟͈̤͍̘̘̬̻͕̆̎͒͊̓͋͐͠ò̙̪̠̻͍͍̪̜̎̓̂̿͞͡ͅr̷̛̮̰̮͔̖̹͖̝̆̀̓̊̃̊̓ͅ Ņ̛͖̬̮̤̦̂̓̀̍̑͞ȏ̜̭̟͎̦̟̯͚̃̿̽͛͢͜͡͝d̸̛̪͎̬̩̰̠̏͛̄̅̀͐̊͋͟ë̷̛͚̙͔̰͖̹͎̱̼̿̑̀̌̃͆͘͟͝.̨̲̬̟̖̭̹̃̆̉̒̒̌̎͛̌͘ͅj̗͇̲͍̹̤̰͔̱̆̊͛͆̂̾̔̿̊͢͠s̵̨̢̘̹͓̥͙̲̐̂̂̂͌͆̾.̴̪̱͎̣̩̾͗̄̈́̍̑͌́̐̐
̛̥̝̖̫̮͎̫̺͕̃̐̊̓̿͘͠ͅ
̱̦̗̣͇̮͖̮͙͐̓̽͋͊̕n̬̭͈͈̏́̎͋̈́̈́̔͟p̢̧̩̙͔̬̏̽͑̍̄͊͊̑̈́͠m̶̢̢̻̩̟̄̿̒̌̐ ì̵̛̞̺͉̥̺͋͗͘ͅņ̵̢͓͙̠͆̓̂̓̊̊̓͛͟͞ṡ̵̨̢͉̳̞̯͕̼̓̿͋͐͐̚͝͞ͅt̸̘̝̪̫͔̊́͑̃̐̐a̧̳̟̰̠͔͆͂̓͒̀̕͢l̛̮̩͈̪̓͛̈̀͌̈̂͢͝l̸͍̯͖͇̙͊̒̓͡͝ p̡̡̳̩̭͊̉͛̌̓̇͘͘͢ģ̸̛̖̗͕̤͖͈̪̆̽͒̋͒͞͡
̶̟̜̠̫̃͐͋̊͛̆͜
̷̪͕͍̳̝̏̑͆̆͗͒̑̎͠P̶̻̖̫̪̮̍̏̋̑̄̒͗̕̕͟l̷̡̢̮̺͔̯̎̓͊͋̽͞͞͡ͅa̢̨͓̝͚͐̽͌̐̑̔͌̚͞c̶̛̠͚͔͍̪̬̭̎͌̋́̓e̛̛͕̰̪̦̟͇̬̞͑̉̐͆͡ p̵̡̜͙̉͗̾͒̕̚͟͢͞o̵̡̹̼̰͖̤̥͊͌̈́͐̃͊̃͋̇͊s̢͙̹̯͔̱͇̘͋͂̉͝͞t̶̨̛͖̯͙̺͓̽͌̔͛ͅģ̶̣̬̼͍̼̠͎͉̑́̉̌̅̍͛̕͘͝r̨̖͚̜̖̣̍̆̆͛̑̎͋̂͝ę̧̳̳͎̌̓̓̊̈͘͢ś̮̹̲̜̥̉͒͘͘͜q̴̭͖͇̺̬͇͉̗̂̄͆̐̽͘͜͠͠ͅl̯̦̺͉͔̫̀̀̃̔̓̈́́.̫̹̥̩̠̻̱͔͎̰̀͗̈́̊̚j̸͚͖̹̫̣̟̤͂͌̊̀̍̈͢ͅș̴̮̞̳̏̓̈͆̅̕͢͞ ì̡͙̤̳̭͖̊̏̎̿͜͞ṋ͇̖̮̗̫̜̞́̑̐̀͆͘ y̷̜̩͉̺̌́̓̋̂̌̄̂̅͟o̷̧̰̪̞̖̥̊̀́̽͐̌ư̶̧̨̰̠̝̦̰̭͈̆͆̈́̓̇͐͋̀̿r̴̡͇̰̼̫̝̓̊̌̊̈̓̓̀ p̷̡̱̯͖͖̰̐̀̍̌͟͝r̸͙̗͚̦͚̝̦͐́͋̑̊̚̚͞͞ǒ̦̬̻̫̖̼̟̱̿̉͂́̊̀̆͘͜͟͝j̴͖̜̻̮̞̲͖̖͗̓̔̄̌́̽̍̈́̆͢ȩ̛̳̝͚̮̭̰͋͛̎̾́̄͋̅͠c̡̛̠̮̖̝̻͓̲̜̽͌͒͑̿̉t̨̪̭̣̝̼͌̋̇̽͑̾:̸̧̼͚̤̩͓̼͇͛͐͂̎̃͝
̷̡͓̤̲̣̫̼̥̰͌̋̈́̽̓͛́̿̀͜
̺̬̟̦͕͉͍̓͂͑̿̓̕p̵̢͔͉̙̙͆́̓͛̊̉̈͞r̻̳̪͖̞̈́̓̔̏͌̑̕͝͞õ͈͙͉̭͇̘̿́̂͋͝ͅj̗̥̗͓̰͉̗́̃͋͆͡͠ḙ͔͈̯̥̂͑̊̌̕̚͠c̵̡̨̟͍̤͎̝͇̤͌̓̏̋́̋͘t̳̗͉́͐̉̋̄̌͂̓̚͟ͅ/̸̡̢̬͈͒͋͗̐̆̊̂̉̂͜
̢̡͎̦̯̩̐̓̓́̊̀͑͢͝͞ͅͅ ├̳͍̦̠͓̍̉̃͗͌̽̉̿̑͛͜ͅ─̛̟̝͇̯̭̆̿̔̈́͋͒͘͝ ṕ̷̧̛̭̜͍͇̤̇͗̽̽͑͘͟o̶͖̼̲̩̟̳̠͋͑̀̍̄̚s̭̞̖̠͈̖̆̃̑̋͛͗͟ẗ̴̻͓͚͙̥͙̜̹́͂͒̏̑̔͘̚g̵̡̡̺̻͚̣̫̀̌͊̒͝͡r̵̝̮͈̮̪̺̪̙̱͗̔̈́̈́͆̂͌̎̚͟͡e̸̡̛̫̯̫̻̳͂̇̽̒͋͋͑ͅš͍̘̘̝̺̹̙͂̉̏̇͛̌́̚͡q̲̦̰̮̤̪̒͗̇̀̓͢l̖̗͇̠̯͉̦̬͋̑̋̓͗̇͘͢͢͡͝.̶̨̛͓̗̬̟̝͇̿́̌̀͊̎̚j̡͓̖͍̼͓̄̔̍̽̊͘s̭͚̳̹̹̱̀̒͐̒͒̐̋͘̕͢
̵̨̢̤̤͍̹̬̋̇̾̇̃͠ ├̨̱͎̻̙̠̱̖͐͐̓͗̂̅̈̅̃─̨̠̥̰̫̜͈̘̃̄̊̓̚͢ import table from "./types.json"ạ̢͍͕̮̺̈́͛͂͋̀̐͘͟͞p̶̧̞̼͔̳̤͚͊͆̅̅͛̅̉̀͢͝p̼͓̥̖̬̝̏͗̍͊͘ͅ.̸̢̩̤̮̯͎͚̬̇͋͐̓̉̂͠j̛͈̖̙͈̘̤̬̉̍̐̎̐͘͠ͅs̥̺̹̘̤̎̋͂̏̄̅͂̚͡
̡̛̞̪̗̳̻̥̒͂̅̽̃̀͘͘͜ └̨͓̜̱͚̺̤͍̒́̍̄͗̔̐̑͊͝─̢̘̰͈̮̺̹̬̈̎̅̊̂̚͢͢͝ p̷̡̪̼͇̤̹̖̒͋̈́̌́͑͋̚͜͟a̛̠͈͚̥̺͓͒̔̐̌͆̇c̶̢̘̖̭̼͈̫͕̿͌̾́̓̇̌̑̚k̷̢̛̪̘͎̜͖̖̫͌̾̂̈́͜a̸̘͕̥̝̟̪̖͕̎̅̊͛̒̉g̢̛̠̭̹͕̺̥͙̾͒̏͐̾̓̾ȩ̻̘̟̗̙̺̰͓̈͂̓̎͐͒͡.̷̤̠͖͓̣̮̜͆̌̈́̂̏̽̉̽̄j̤̠̖̹̬͈̿̎̈̄͗̽̃̌̾͠s̵̨̞̫̭̙̓̆̔͘͝ǫ̶̢̛̝͇̈́͒̌͆̋͂̇̊͟n͖̦̥̙͇̤̬̽́̏́̂̈̉͘͡͡
̸̨̱̱͕̹̪͆̏͌̌͌ͅḈ͉̙͍͍̐̉͑͋͘͟o̴̢̡̗͈͙̝̒͛͆̉̀̀͞ͅn̶̡̳͎͖̮̗̞̓́̅̐̽̀͂f̢̹͇̲̜̆̏͒̐̾̋͒̓͐́ḯ̢̭̹̫̭̼̲̞̹͛̓̚̚ͅg̵̢̻̣̩̯̣͙̈͂̀̅͂͒̈̃̚̚u͉̱͈̲̯͑̔̈́͂̑̅̎͘͞ŗ̢̗̳̼̬̠̎͛͐͛͋͊͛́͟a̷̛̛̼̮̗̹̩̻͂̓͜͞t̛͖̳̟̺̩̃͆́̇̄̈́i̢͈̻͓̤̼̐͋͌̂̌ǫ̵̛͔̩̫̍̆̉̍̆͂̇͢͜ǹ̨̛̥̞͇̗͎̄̓̓͐͆̓̚͞
̩̘̗̖͎͕̙̆̈́̔̐͆͋̽̑̚͜͡
̡̛͕͕̪͂͐̔́̎͋͜͟Š̢͙͕̥̼̗̪̥̜͋͐̐̓̚͢͠e̸̯̪̲̥͔̓͊͆̈͒̈́͊̀̉̎t̞͓̝̪̞̙̹̬́̅̌̿̅ ỷ̸̢̥̮̮̜̗͖̟̼̓̿̀̚͝ơ̷̢͍̣̮͙̤̘̲̾̓̏͐̾̐̓̐̚ų̸̛̻̺̲͉̇̏͑̒͑̔͑̍̕r̵̡̛͕͚̭̜̫̩̞̯̪͐͌̎̋ ḍ͕͚̹̰̻̩̫̳͖̋͆͒͌́ȧ̴̲̤͖̯̬̭͓͂̀̔̆̽̚͜ͅṭ̷͓̞̞̪̯̌̋̓͊̄̎̀́̚̚a̡̯̰͓͎̞̎́̋̑̈́̋̈́͡͠͞b̵̧̛͇̘̲́̋̓̆̄͜͠a̼̳̤̬̼̬̼͕̤̣̎̌̃̽̇s͕̟͙̩̬͔͒͋͗̏̿̿̉͟͡è̙͇̦͎͙̰̀̈́̂̔̎ c̵̡̞̳̭̹̐͐̇͗̏́̅͒͌͟͝o̵͉̦̫̬̪̮̲͙̹̜͒̂̽̑̒̌̄͡n̢̢̧̤̥̜̥͚̋̄̈̌́n̴̡̖̦͈͔͊̇̏͆̀̂̎́͑̈́͜͜e̸̢͍̜̞͍̫̪̖̒̓̓̍̒̒̌̚͞ͅc͔͓͔̗̯̫͓̞͚͛̔̔̄͂̃̚͜t͇̹͚̟̟̟̥͆̆͗́̒̏͊̓̄ĩ̴̤͚͖̯̗̩̦͈̊̃̆͘͠o̲͎̙̪̥̔͑͗͡͡ṅ̢̪̼̱̩̟̣̺̤̦̇̂̐͒ v̴̲̯͈̤͖̩͙̌͋̾̆͘͜͡ḁ̵̳̭̮̜̩̹̻͋̏̉͌͐͠͝l̷͔͙͓̖͙͛̈̆̍̐̆̾͋͆̚ͅù̠̖̭̓̿̍͗͊̇͊͜͜͡͠e̶̡̛̬̹͇̖͚̱͈͐̅̐̂̽š̢̙͍͓̤̥̹͖̠̔͂͒̑͘͝ ů̼̫̯͈̭̮͋̒̽͊̇̂͡͞š̡̞͈̣̣̦̣̃̽̈͘̕͢ĩ̶͇͓̤̳̠̓͛̄̂́̉̿̍̍ņ̷̱͕̼̗͎̯̺̫͎̎͛͒̓̄͌̍́́g̷̠̣͉͇͕̭̪͔̀̈́̾̒̈́͟ͅ é̛̳̠̘̻̩̮̜̌̾͘̕̚͝ņ̢̝̳̜͍̗̰̰̾̊̄̍͐́͌̓̅́ͅv̷̞͍͓̠̼̬̉͑̀̏̈́̾̚͘͠͝ͅį̳̮̪̭̣͉̳̠͇̃̍́̾̿̚r̙̼̙͕̹͌̽͊̓̀̌͘͟͝͞o̡̨̧͎̦̹̜̝̥̍̃̊̐͑̉̓̅̈́͘͜ṋ̴̛̣͇̻̙̦̫̫̿́͒̏̏͟͠m̸̢͕̖̗͈̣̝̣̻̄̄̑̒͊̓̒͢͝ë̛̲͕̗̪̔͆̔͑͑̅͘̚ͅṇ̷̨̜̱̻̤̖̬̳̦͋̐́̿͒͒͆̈́͊t̩͇̹̺͎̹́̓͂̋̋́͒̉̕͟ v̷̨̰̲͚͖̼̪͑̀̑̽̌̆͆̎̚͜ă̸̡͈͔͉̙̱̟͂̀́̉̄̇̈́̅̚r̸͉̤͚̻̝͎̃͛̓̐̋͌̏i̵̱͖̲̹͛̑̆̽͋͜͢a̙̗̗͇̯̹̯͌̄͐̆̓̅̄̀̐́͜͜b̹̲̫͚̩̯̼̙́̆͗͂́ĺ̸̬̤̟̰̹̭̱̦̗̈̿̇̅̆ͅȩ̷͈̼͇̟͙̱͚̞̑̂̓͂͒̔̅͘s̵̨͓̹̺͈̗͉͛͊͗̂̀́͠.̶̨̪͎͈͉̬̱̮̄̓̂̿̈́̿̕͡͠
̸̢̝̘̝̜̭̠̙̲̍̿̔̇́́
̛̛͚̲͙̱̱̻͎̣̙͐̏̆̔̿͢͞E̝̹̝͇̗̺͚̽̔͛͂̐̔͛͂͑͟͝x͖͕̗̻͓̟͑̇̉̌̑̊̚ͅá̧͔͇͉̭̙̜͚̽̊̕͘͟͜͞m̡̧̱̲̬̗̻͍̎͐̂̾͐̆̿̎͐͗p̷̛͇̙̰̗̞͈̓́̒̅̈́̉͟͡͡͡ľ̫̼̪̞̻̿̽̆͗̐̔͠e̵̡̬̘̱̍̿̌̋́̔̾͢͜ .̵͚̻̼̘̙͔̺̝͉͗͊͐́̽̿͒̌̽͢ė̷̡̧͍̯̱̟͍̋̐͐͂͒̀̄̈͢ͅͅn̢̫̹̻̖̟̖͍̽͛͒̇̆͗ͅv̢̛͙̞͕̺̳͇̭̜͑͋̋͐̑͋:̶͕͚̜̾̀̊͛̃͡͞ͅͅ
̶̢̛̱̩̾̓̿͌̐̒̈́͌͘͟͜͟
̻̺̖̯͚̞̗̙̣͂͐̇̔̋͘P̨̺̙͇̟̯̲̯͖̉͂̓̐̿̇Ǵ̣̳̦̝͉̄̇̉̔͘͞͞ͅḨ̷̲͕͇͂̽͆́͘ͅO͕͓̺̞̭͖͎̽̈̏́̍̃̎͂̕͘S̵̗̠̰̩̱̤̒͂̓̐͆̋̒Ṭ̷̛̫̗̹̰̳̱̩̭̋̓̒̽̇̑̓̚͡=̢̰̫̜̳͑͐͋͛̈́͛͟͡͝l̟͖̫̼̥̻͆̋̀͋̈͘ȯ̬͕̖̻̘̆͗̽͘ͅc̴̺̠͎̰̱̙̼̀̈́́̔͑a̶̮̜̩͖̪͈͊̄̎͆̿́l̶̢̦͔̗̮̉̔̇͒̆͐̋̀̚͠h̢̪͈̻̤͓̒͛͒̂͠ơ̳̱͉̥̝͈̈̏̌̊̉̾͘̚s̷̡͕̮̬͖̣̲̠̀̍̑̄͊͂͟͠͞ṱ̛̪̝̬̻̥͈̅̆̔̂̓̐͊͌͢ͅ
̧͚̫̱̎̎͆͛͒̀̕͢͠͝ͅP̵̧͔͖͉̪̖͍̻̥̀̑͗̀̍͝ͅG̴̢̞̥͙̳͒̍̉̒͐̌͡U̮͔̘͉͉̻͖̹̐͑̿̋̇̂S̷̻̼̺̥̫͌̂̐̓̇̌̋̋̌̀Ẹ̢͍͕̅̍̽̏̎͜͠R̛̻͙̤̗̅̆̈͛͜͟=̷̡͔̩̟̠̤̰̼̙̻̿͛̉͆̓̚͝p̷̨̻̳͓̖͔͇̭͐̾̊̅͡o̝͚̭̘̫͓̺̠̔͗͑͗̽̅͘͝͡͝ͅs̶̡̟̞̭̥̥͇̭͔͊͑́͒̏͌͛́͝t̪͎̖͓͔̻̓̔͛͊͋͝g̢̛̘̝̲̩̓͆̎͋̎̂̀̐̚ͅr̵̢̗̳̬̳̫̯̱͆̉͂̅̉̈́̈͞e̶̙̺͍̩̗͌̂̎͋̐͗͆͞s̴͖͇̠̬̲̫̠̅̆͐̋̋̓̓̚̕
̶͍̟̮̥̘̱̯̜̋̅̽͛͞͠P̛̟̦̞̖̫͋̽̑͜͝͠Ḡ̸̦͍̩̲̦͓͈̥̀̀́̾̑̇͘͟͡P̛̭̭̺͎͇͎̝̗̂͊͂͗͆̀͟À̜̱̞͔̥͖͂̅̋̽̉̐̚͢͞Š̵̹͙̼̲͇̤̓̓̅̓̂͛S̷͕̗̘͉̩̮̀̎͂̀̄͂͜͞W͔̠͉̗̩̽͊̎̇̒̒̆̕͟O̸̢̤̪͍̬͚̜͛̀̓̒̊̐̒̏̃͜͢Ṙ̶̰̼̠͚̳̦͛̓͌͌͞͝Ḏ̨̢̛̲͚̤͕̦̻̞̓̉̂̑͞͝=̵̢̡̥̳͎̠̟̮̜̩̓͗̒͑̽́̅͆̌p̨̱̖̦̘͍͉̀̌͋̈́͐̋͆͘͢͜a̡̱͓̪̹̠̦͒̋̔̆͊̋͘͘͘͡s͎̭̪̹̙͚͖̿̈́͒͌͛̓̃̚s̢̛̺̼̬͚̠̪̬̱̱̊̆̓̄͂̕͡͝w̸̛̬̲͕̠̩̗̱̞̑͑̋̑͒̑͟ȯ̷̡͔̪͎̲̮́͋́̏̀͊̽͂̚r͍̳̜̯͓̾̒̏́̐̈̔͡ͅd̡͍̫͓̪͖̺̳̯̥̓̿͗̂̀̂̑̕
̵̧͔̭̠̝̞́̃̂̃̐̎̊͠͡ͅP͖̜̗̝̤̰̹͋̉͊̀͛́͜Ģ̹̩͕̳̖͊͑́̎̿̄̒̐D̙̣̰̙͖͙̞͛́̓͋̕A̸̢̛̬̙̦̭̻͂̓̀̋̄̀͟͟͝Ṯ̣͇̲̜̖̣̪͂̆͌́͌̅̔̾͞A̢̡̦̝̩̹̝̹̙̟̔̈́̀̓̃̀̕͠B̥̙̼̫̒̀́̄̀̔͜͠Á̙̥̳̻̱̌͂̊̄̒̌̆͜͡S̴̺͙̖̮̻̣̈̀̐̋̆̐̚̚͘̕ͅͅE̷̜̝͚̗̲̜̬̙̜͑̐̃͊͑̑͘͘͘͘=̷̛̱̲͎͖̩̬̟̿̿͂̔̈́͌m̴̧͖͍͕̟̟̬͚̆̃͐̓̽̈́̾̉̚ȳ̶̩̙̘̮̤̂̀͘͠͠͡͠d̡̰̦̠̗̙͖̞́̉̊̋͊̾́̕͢͡b̧͖͇̳͕͚̠͍͌̐̉̄̄̐̽͋̉
̧̩͓̬̲̹̬̝͕̽̓̓̉́̌̊͌ͅP̵̡̙̥̬̗̝̲̹̩̈̆̽͂̽̍̊̄̚͜͝G̢͕̬͎͔̦̦̭̎́͂̓̓͆́̃͟P̧̝͚̬̤̾̌͌̇̔̆̋̽̿͠ͅͅÕ̵̢̞̟̼͖͔͚̯̎͗̄̐̔͠͝Ṙ̵̡̳̏̒̇̾͐̚͢͢͟T̶̨͉͙̬̪̯̰̘̝̮́̓̓̏̍͂̈̕͠=̧̧͈̻̹͔̻̣̦͉́͆́͐̆̎́̕͞͞5̛͉̣̤̳̫̳̫̤̦͒͒̎̑̿̂͝͠4̢̢̞̲̬̱͓͓͈̀̓̅̈̾́͝3̵̝͇̯̙͎̯̠̻̒͛̒̊͂͝2̴̨̨̯̱͓̫͎̓̽̾̑̔͌̃̓͂
̨̥͚̻̤̙̼̞͓͋̊̽̑̿̍͟͡͠B̷̗͈͍͈̟̞̻̯̊̊̾̈́͊͆͝ͅa̶̢̠̮͔̰̋͊̀͗͑̆̏́͠͠s̸͓̙͔̰̮̥͖͂͐̐̐̋͗̄̚͢͝͡i̵̡̛̯̬̼̬̖̥̻̥͂͆̃̂̓̔ͅc̷̼̪̺̫̮͍͐̈̇̀̈́̏̿͘ͅͅ Ṵ̵̘̻̠͙̟̦̦̺̒̀͒̈͜͠s̨͖̹̥͇̣̤̭̥̾̄̉͊̈͊̓̌a̲̫̯̹͚̺͍̎̂͆̑̄͊̂̒̍g̵̛̦̤̻͔̻̐̓́̈́̍͒̒̓̚ẹ̷̦̩͕͈̳̿̌̑̉̍
̨̢̰͇͙̗̟͒̏͊̾̇̚͟͠͞
̞͚̜͍͓̅͗͋̅̌̒͢͞Ǐ̸̡̤̥̭̟̠̪̆̎̏͋̋̄͘m̸͔̼̘̹͎̖̝͖̪̌͐̒̄͐̋̈̊̀p̷̢̧͚̝̬̪̻͕̙̹̀̽̏̍̾͌͛̚͠ò̪̳̟̫̍͊͆͟͡͝r̸̮͙̤̫͕̞̱͐̓̈́͆̾͡t̙̙̮̤̪͖͖̆́̆͐͌̌̀ t̶̡͇̫̝̻́̀̓͋̿̇ẖ̳̝͇̞̙͖̠́̈͂̒́͜͡e̫̜̫̭̪͛̒̀̄̓̑̄͘ ṃ̪̖̰̯̪͊̀́̓̚ͅǒ̸̜̣̝̰̻͎̝̠͑̅͊̔͞͝͠d̞̤̜̠̙̈̎̎́̿̀̌͠u̴̧͎͕̯͕̥̓̏͊̿̆͟͟ͅl̹̭̦̖̻̖̲̥͒͐̓͋̋̃͋͡ͅͅë̴̛̗͕͕̯̦̿̿̂̀̔̈ i͍͕̗͔̝̼̎̆̓̇͋́̊̊͝ͅn̵̛̛̺̱̬͍̯̝̖̻͊̆̃͗̓ y̴͕̤̳̻̭̋͊̾̋͑͐́͜͜͝o͔͉̦̱̘̥̥͗̎̓̓̆̃͂̀̚͟ͅų̧̦̫̜͙̖̂̌͆͆̕ͅr̸̢̭̖͚̦̠̻̤̍̄́͂͂̄̽͢͝͞ͅ N̝̩̰̬̥͖͛́̀͆̈́̓̐ó̧̺̥̠̝̖̦̾̆͌͒͊̾͡ͅd͓̠̳̺̦͚̼͍̫͋̆̿̅̕͟͞e̴̡̧̝̜̖̟̝̓͌͛̽̓͋́͜͢.̬̘̙̲̞̑̍̀̋͂͋̑͜͠ǰ̛̮͈͚̻̻̙͎̻͚̇̄̽̾̄̀͘͠s͕̱̪̩̭͂͌͋̒̓̿̈́͡ ä̶̞̜̜̘̙̣̼́̓́̀̋̔̕̚͞͡p̢̛̘̼̻̦̮̑̓̂͛̏͗͠͡p̛̲͖͓̟̦̳͍̦͙̏̅̑̔́́͠͠ͅl̵̡̧̺͓̗̜̖̩̤̑̄̎̇̃̃͌̈́͠͝ȋ̢̻̺̳̼͋̎͋̂̃̃͜͡c̡̞̬͚̪̫͑̅͂̆̅͆͡ą̵̰̜̖̖͚̬̿̈̓͋̕͟͜͠t̴̡̛̜͍̣͍̳̟͛͆͊͂̆ị̢̬͙̬͍̳̮̌̊̓̀̚̚͝o̶̢̧̮̖̩̻̎͗̃̈̈̋͑͂̌͘ñ̢̧̩̺̤͕͊̓͌͛̓̀͂͆.̶̛̜̠̤̙̰̃́̊͗̀̕ͅͅ
͙̣̣̘̳̫̟̼͔́͌͑̕͟͠
̸̢̢̨̯̣̲̪͍̒̄̐͂͆̅̊̏͝͞c̛̪̞̩͔̮̙̣̲̈́̓̽͝ǫ̷͖̺̯͈͎̳̓͒̃̄̈̀͡͡n̴͙̭͎͓͖̓̅͆̄̕s̢̡̝͉̟̱͇͗̋͒̓̾̆̿̉̉͟͠ͅͅt̶̢̢̲̼̫̩̪͙͛͒͊́̇͢͢͠ d̴̢͚͍̱͖̞͈̿̅͛̒̍̀͒̕͜͝b̴̘̳͇̼̪̗̥̦̳͌͋̌͒͑͋͑̚͜ =̧̛̥̪͔̙͛̑̊͋̕͝ r̡̟͖͚͎̄̅̊̽̄͜͝e̴̻͙̟̥̲͕̳͐̓̀̃̍̂̀q̧̭̱͈̩̤̌̄͒̇͢͝u̺̬̥̮̱̪̤̘̍̈́̀͌̓́̇͞į̰̺͖͙̀̐̆̋͆̀̅̊́̿ṟ̸̹̭̰͎̼͉͗̍͆͆̕̕ę̸͕̥̪̫̜̱̂͆̇̉̌̐̽͛̚͜͟ͅ(̨͔͚͍̹̫͕͖̟̩̅̐̅̐̿̕͝͡"̺̱̬̳̐̾͋̀̇̇̐̏̿̚͜.̲̝͍̬̠̽̉́̏̔͠/̷̨͓̼̣͈̜͂͐̒̋͟͟͝p̺̫̩͙̘̣̬͋̾̊̓̚͝o̠̮͉̞̙̥͔̲̜͆̌̂̆̕ṣ̵̢̩̮͇̠̩̑͒̉́͐t̹͎͖͓͑̓̊̾̾̿͗͋̀̕͜g̤͈̭͇̤̝̩̪̼̼̍̆̑͋̉͂̕͠͝r̴͖̮̰͕͇͔̝̫͔̄́̏̂͌̎̅͆̚͞e̢̡̘̖͉̗̺̲̭̗̓̉͑͗̔͠s̵̜͉͎͖̫̉͑́͐̿̓̐̋̀̕q̶̤̩̼̳̏͒́̆͌̇́̇͟l̴̙̟̺̟̃̅͑̎̽̍̈́͗̽͞ͅ.̰͍̟͖̮͈́̓̔̏̈̀̕͝j̧̰̖̩͔͉͖̼̙̲̀̔͌̾͌̾̕s̸̮͇̟͖͔͎̀̾̑́̀̒͗͒̿"̧̰̪̪͖̭̺̤̻͉̔̇̑̽͛̏͐͊͝͡)̢̱̭̟̼̻̯͍̍͑̃͑̋̾͜͟͝
̸̙͍̬̯̰̜̰́̓͊̀̊̑̕ͅ
̢̮̯̼̻͓̻̋͋̑̀̾͐̃͋͛̑͟ͅͅĨ̛͖͓̜̟̥͗́͒͌̑̏͋̕n̴̨̞͖̼͚͉̓́̉̿̍̊̔͢ͅị̪̠͍̼͚̃͛̐̓͋̅͘͡͝t̵̨̜͓̹͉̗͉̱̆̄͆̆̈́͌̍̉̄͜͞ī̢̮̱͉͙̯͕̀̂̑̒̂̀͘͠ȁ̡̧͎̫̠̬̘͕͛̑̔̓͂l̹̞̭̼̰̩͔̓̎̊̍̀̍̅̍͘͞i̷̟̩̟̜̗̤͋̐̈̿̅̀͢͟z͉͚̥͎̫̺̈̅͛̅͂̈́́̂̃̕͜ȩ͕͉̟̗͚̮͑͂͆̊̾͊̒̈́̕͜͢͠ ț̢̛̛̪͔̱̩͉̉̈́̓̐͗͘͟ͅh̨̫̤̘̦͖̺̯̩͌̀̾̍̓͐̿͘͞ȩ̸̢̱̮͖͉̇̒̑͌̿͜͠ ĉ̛͎̠̻̗̲̟̘̝̘̼̆̾̀̋̏̀͝ŏ̶̢̘̩̣̥̞͓̈́̋́͂̂͆̕͢͝n̢̢͎͎̦͚̽͒̈́̀̇̆̀͝͝n̷͉̭̝̖̜̩͊͒̈͑̃̀͝͡ͅͅe̶̠̪̺͓͈̖̐̿͒̒͘͟͝c̣̮̻͎͓̣̐̈́͆̇͊̉̉͡t̸͚̲̦̪͕̺̩̽̃̈́̈̾̋́͜į͕̳̻͇͙̼̏̍͐͂͂͌̉̒͞o̷͉̫͍̠̼͒̾͐̾̓̅͆́͑n̨̢̡̯͚̫̖̬̮̾͒̔͑̑̕ͅ:̵̢̡̢̙̜̲͕͑̑͛̀͋̋̿͛͒
̦̝͓̞͕̦̔̀̌̑͒̕
̴͙̲̭͓͔͛͗̒̂͂́̒͠͝d̶̢̨̢̨̡͇̫̝̫̞̃̒͋͗̊̄͠͞͠b̸̰̘̻̗̖̟͓̺̪̔̋̓̌͒̆̀̚͜.̶̺̫͉̤̭̟̝̇̐́͂̀̚͡c̴͙͉̺̫̱̟̻͖͓͊̓̿̂͝ơ͎̮̥̤̓̽̈́͗͑͘͟n̟̲̬̠͎̠͍̱̫͍͋̏͌̓̔̑̕n̵̰̮͇̯͔̝̞̫͕̍̏̎͒̌͑̀̏̓͑͜e̶̤͙͈̳̘̯̮̻̔̀̂͋̽̿̌̔̔͟͢͡c̶̙̻̜̰͍̦̩̭͔͗̋̒̉̔̋͋͟͞͝ţ̸͉͇̠̤͙̽͊͂̎̔̃̚͞(̴̡̩̭̺̥̱̼͇̋̓̉̓̈͊)̶̢̟̻͔̝̉̓̄̓̚͞
̖͓̰̝̳̺̓́̾͆̋̋͆̒͜͠Ṟ̨͈̳̜̠̳̭̅̎͊͗͑̏̕͞͞ͅu̶͔͇͚̝̯̟̖̣̾͛͌̈́̓̌͡͝n̷̛͕͖̙͍͗͊̔̉̇͘͟ń̵̖͇̥̠͓̪̈̈́̈́͌͑̒̋̔̒i̛̛̤̝̜̻̗̩̩̎͒̑̂̍͐͌̽ǹ̴̛͈͎̝̪̔̄̑̓̍̆ͅǧ̶̞̼͍̯̣̫̯̝̘̓̀̍̂̈͊̕ Q̷̗̗̩̯̹͋́̄̔͢͠͠u̸̬̝͕̱̦̮͙̓͆̓̑̄̊̉́̕ȩ̵̺͖̰̯̞̣̻͕̑̀͌͋͛̉̀̾̎̕r͓͕̼̟͎̎̐͋̽̀́ỉ̷̜̖̮̻̦̑̆͛̃́̿͘͠ę̸̖̤̩̲̟̑̌̓̈̇̾̽̄͘s̶̱̗̣͓̠͉̰͛̌͑̆̓̚͘͟͞͞
̶̲̯͕̭̩̓͋̇̌͟͜͠
̵̢̡̞̥̊̄͌̋̄͂͜͢͠Ē̸̢̡̛͕̹̳̺͕̄́̿̉x̢͓̼͓̱͎̠͖͒̔̀̒̎͟͠͞e̸̡͇̠̬͙̝̰͇̣̅̔̾̿̋̏ċ̶̜̟̻̲̘͕̐̊̌͐ṳ̵̲̫͖͍̦̜̘̃̐̅̄̍̔t̷̯̙̱̠̩̟͓̀̒̔̈̾̚͟͢ë͓̳̟̩̮́̓̏̾̔̌͗̕ S̶̘̼̝̭̱̙̭̥̒͋́̇͋̐̿̅͞Q̵̢̢̪̦͔͈̾̑̀̏͋̂̾͢͞L̷̠̪̠̮̥͕̩̭̜̀̎̔̕̚̚͡ q̶̬͍̼͔͓͇̿̅͌͆̐͢ǘ̢̲̜͉̻̠͇͈̱̼̀͗̊̓̆̇͘͘͠ę̷̥̜͎̐̀͗͛͐̄̀͟͡͡͡ͅr̤͈̹̹̘̙͚̎͆̄̏̔͟͡͠i̶͎̠͕̦̯͖̔̔̅́͛͊̔͑e̗̬̦̩̗̭͆̇̾̾̀̋͡ş̰̟̝̣̮̫̋̂̌͒̍̀͐͐̕̚͢ͅ d̵̡̲͇̼̰̬̦͔́̀̃̍̃̾̿̚͜͜͡͠ȋ̴̟̦̩̘͚̦̌̂̂̄̕͢r͈̳͚̞͓̙̉̄̈́̽̍͑̀̋̉̚e̴̹̪̫̣͉̒̃̓͂̃̃̾̇͘c̸͉̩͙͉̰̰̔̄̃̃̎̓̄͘͢͠ţ̝͓̞̘̌̐́̑̓͒̑̆͝l̷̨͕̩̯̮̬͉̗͂̀̒͐̂̉̃͆͟͢͠͡ŷ̧̝̭̩̺͙̰̑̇̌̈́̀͗͒.̥͍̺̠̻̈̉́͆̕̚͘͡ͅ
̗̘͙͎̘̥̗̠̤̅͛̓̈͑̚̕
̛̤͖̙̭̣̠̓̃̇̄́͘̕c̸̳͕͈͈͚̭͙̱̜̀̓̽̊̔̄̀͐ǫ̛̺̥͓̻̾̃̈́̏̒͆͜n̴̛̪͕͖̱͕̾̀̐͋̋ş͎̮͙̜͕̺̌̒̋̂̏̀̆̎͘͢͟͡ṭ̲͇̼̹́̑͗̈̿̔͒̓͘͠ ư̢̹̞̖̆̊̆̍̆͢͞s̜̳͚̜̯̱͙̒̏̈́͞͝ę̵̰̺̮͙̹̫̯͍̀̿͗̎̉͟͡r̴͇̱͉̬̠͉̈́̅̂̆̒̌̐͝s̷̛̹̰͓͈͍̬͒̀̍̕ =̴̢̢̫̟̯͕͇̼̻̘̾̉́͐̾̍ ä̘͍̳̯͕́̎͗͂̔͑̑̿w̥̥͇̞̥̐͊͆̒̽̚͝a̮̭̣͓̦͚̘̳̓̉̅̽̈́̔͑̚͟i̶̩̝͇͎͍̲̔͋͊̕͢͞ṱ̸̛̰̩͕̳͗́̔̉̾̂͗̌ ḍ̵̝͉̬̗͂̎̂̂̎̃͒̉̚͘ͅb̨͎̥̠̳͇̍̑̈̀̾͒͜͞͞.͎̱̳͔̜͇͕̊̃͑͗̐̀̿̎́͝q͎͓͕̬͖̐͗̾̐̀͘u̧̮͎͈̗͗̿̒̊͘ͅę̨̰̠̻̲͇̔̿̅̐̚r̴̼͇̪̪̥̫̩̭̾̄̀́̃̃̋͡y̶̧͓̻̘̮̳̿͋̌̅̀͑̿͘(̸̼̝̯̣̥̽̿̀͂͘
̰̩̜̟͙͓̰̥̌̀̇̒͒̓̾̏̓  "̵̡̣̼͇̯̫͕͙̮̠͂̈̿͂́͑̓̎̄̈́Ŝ̛̞͕͔̏́̈́͒̚̚͘͜͟ͅE͙̹̝̞̻͙͉̫̔͆̇͊́́͑͘͟͠L̵̤̩͖͉̩͑̋̿́̉̒̄͒́͝É̼͍̻̖̣͓͒̉̒͒͠͠C̯̱͙͇̀͋́͂̄̊̈́͜͢͝ͅͅŢ̶̮͔̺̹̞̦̽̆͂͌̊͆̾̚ *̷̢̦̳̳̀͑̔̿̏̄̋͜͝͠ F̸̛̤̜͈̭̠͔͎͇̥̲̌̐̆̊̇͆͂͛Ŗ̛̮̞̤̗̭̠̲̓̔͆͒̽̾͠͠Ọ̯̩̮̗̑̋̉̍͘̕͝M̵̛̲̲̣̖͙̺͍̥͉̺̋͆̾͗̋͂͝ u̶̥̥͕̘̥͖̩͓̭͊̀̏̿͘͟s̴͙͙̟̺͆̀̊͗́̕͢͡͞e̶͚̘͔̘̹̐̇͑̒͞ŗ̛̭̯̦̞̜̌̒̌͌̌́͐̓̌s̡͓̭̤̪͕̬̣͐̃̊̾͒ W̠̳̣̳̣͊̇̇̈́̾̇́̚̚͘ͅH̨͈͎̳̘̰͌̂̐͑͊͂̒̚͡͞E̷̡̖̰̻͕̺͊͌̃̿̎͆̆R̴͎̖̼̠̽̏̐̂͊̂̀͜͟͝Ȅ̸̞͓̟̗̦̘̠̉̑̐̀̌̔̇̔͡ į̴̮̙̹͈̞̺̜̳̆͛́̆̚d̼̖͍̲̦͐̉̀͊̔̈̈̚͘͟͟͜͟͝ ≠̨̲̱̞͕̭̗̈͛͆̈́̅͊͐͆̋̒ $̴͎̟̞̱̒̈́͌̾̈̃̅͢1͓̞̼͇͖͚̅̂̉̿͆̕͟"̷͕̭̣̝͈̖͖̫̀̀͌̀͒̎̌̒̊͞ͅͅ,̶͔̻̝̩͎̦̽̀̆́͞
͎̮̳̞̪̝͍̃̒͐͒̍̆͟͞  [̶̲̠͔̬̳͙͕̙̀̈́͌͛̓́͐̈͘͢͟1̢̧̥̺̹͙̙̂́̾͗͠ͅ]̵̯̤̦̥͉͛͆́̂̀͐̏͑
̸̛̳͓̲̮͔̫̲͚̺̅̾̆̓͌̾̓̕̕)̟̣̭͎̣̯̜͇͊͛̓̈̎̓͘͜͝
̴̖̼̼̮̥͒͗̈́͛͑́͒͒̋͘͜
̶̦͖͇̭̜̀̅͋̏̚ͅć̴̮̹͖̲̱̥̋̀̅̉͢͞o̵̙̮̝̮̲̣͙̗̭̅̆̂͂̏͂̌͒̇̏n̸̡͖͖̺̙̞͊̀̀̇͐̔͡s̸͇̭̝̟͇͍̺̄͛͐̋̃͋̕͢͜͠o͈͈̳͓͂̌̉̓̇͐͊͜ḻ̡̛̛̗̭͙͔̞̣̦̈́̒̊̿̂͞e̸̯̩̮̖͉͔̯͓͕̿̈̿͒́̌͘͠͠ͅ.̶̛͕̲̖̞͕̂͐͂̓̓̉͋̔̾l̵̢̘͖̺̦͓̿̄̓͂̎̓̉͠ͅͅơ̝̜͚͕̝͙͔͇̌̇̚͞ͅg̶̨̛̗̪̹̠̱̮̮̑̓̀͗̂̾̈́͢͟(̹̞͓̮͎̟̦̹͉͛͐́̈͋͘͝ȗ̴̬̭̠̥͍̮̘̯̯̍̎̐̌͂̉̕͜ş̛͔͙̬̯͈̫̍̆̀̃́̓͟͢͝͠͞e̯̱̦͔̖̼̪̔̐̓͆̈́͊̈͠͞r̴̛̲̹͇̗̦͎̫̟̀͂͛̒̐̿͝s̶̭̹͎̯̮̘͖͊̾͑̀̊͘̕͡.̧̨̖̠̤̞̰̟͖̏́͋̏̏͗̕͘͝r̭̝͍̝͉͎͉̿̓̒͋͊͒͂o̗̭̹̯̗̳͑̋̎̄̆͂w͉̻̤͎̱̱͗̏́̑̐͋̊͡s̸͉͓͚͇̺̬̮̫̰̰̊͗̒́͑͘̕̚͘͘)̷̡̡̛̫̠̻̠̪͇͍͋̃̈͋́̓̈͂̒ͅ
̷̨͉͇͎̖̣̟̂̍͋̔̋̆̑̓͞Ç̯̹̩̗̣̰͈̲̂̓̏͐̑͗̌́̕͜R̴͙͚̳̼͍̺̋̌͂̐͡U̧̡͓͉̙͗̊̄̽͐̚͡Ḑ̵͍̦͕̠̻̬͛̽͑̈͌̚͢͡ Ȅ̴̢̯̭̫̙̰̲̩͙̪́̾̀͗x̠̺͖̣͔͓̑͆́͋̄̈́̈̀͌͘a̛̲͇̦̩͓̮̾͗̍͒̔͒͌͑̕͢ͅm̡̭̣̳͕̖̙̆̀̓́̑p̴̟̝͈̙͕̱̹̥̄̏́̉̉̍̂̓̕ͅļ̛͎̹̖̝̰̐̑̏̈̓̆̚͝͡ẽ̢͙̭̟̗̪̩̊̎̒̑̽̃͢͡s̴͚̳͇̬̜̦̝̦̮̩͐̅͒̒̏̂͌͗͝
̫̰̼̻͕̪̈͒͑̾̓̋͐̊͌̅C̵̛̯̥͉̺̻͕̅͒̏͆̾̏͟͡͝ͅr̡͉̟̬̮̒͛̀̄͝͞ẹ̮̼̯̦͚̖̲͌̃̄̂̈́͞͞ͅa̵̘̳̹̻͖̲̙͒̇͗̿̄̚͡͝t͙̲̹̱̿̀̾͗̏̎ͅe̪̥͓͚̖͎̮̫͌͆̌̌̿̊́͠͞
̛̘̥̭͎̤͔̆̓̎́̈͌̍̉̐ä̱̭̟͍̜̼͖̓̎̎́̏̈̅̚̚w̴̡̯̳̺͚̰̗͕̅̄́͐͑͐̋̔͋̑ȁ̷̢̮͓̦̙̘̲͂̀̒̿̀̈͘̕͟͜͝ͅȋ̸̞͖̻̖̦͉̼͎͍̟͒̀̿̋̽̀̈́͠͝t̳̝͚̩͓̳̺̺̜̽͂́̾͊̿ͅ d̢̡̟̟͇̬̺̣̻͂̐̎͐͐͋̊͑b̨̪̰̟̹̊̔͑́̂̃̓̾.̤̘̜̪̬̀̊̄̀͑̊̈̕͞q̵̝̣͓͖̗̘̳̑̉̽͐͜͞ų̙͍̹̤͈̔͐͆̇̀̈̿͛͜͞e̡͕͈̲̯̳͕̪͋͗̀͌̎͑͘̕͡ŗ̢̦̘̼͙͓͈͚̓̾͛̕͠ý͎͖̲̰̳̥͛͂̀̋́̈́͐(̢̙͖͍̮͓͗͗̄̎̀̏̋̇̂͟͡
͉͍͍̜̩̅̆̂̆̏͜͠  "̷̡̧̨͍͍̹̘̙̖͇̎̾̒̒̑́̕̕Í̢̛͈͇̺̙̠͉̇̋̃͊͐͑͆̆͢͜N̡̫͕̗̩̝̾́͗͒̔̚S̵͎̤͇̗͉̯͒̔͑̈́̚͡͞Ę̸̠͈͔̮̭̣̫͑͂̏͒́͘̕͘̕͜͢Ŗ̧̱̦͇̱̽̔̽͛͌̀̍̀̆͘T̘̘͈̮̝̓̾̎̉͌̽͋ I̵̡̦̞͍̲̩̗͇̭̐̔̏̈́̓̍́̅͘̕N̛̜͇͕̳̰̞̙̤̔̄̈́̀̕͡T̸̟̯̼͇͎͓̩̤̙͑̂̅̅̆̑̚O̵̰̥͔̻̳̲̳̜͋̊̆̀̃͠ͅ ṳ̧̢̢͍̀̂̓̈̕͟s̠͔͈̮̜̤͗̉͗̀̑̊̚̚͠ͅe̢̡̪̩̰͍̫̽͂̀͛̿͝r̡͙̤̼̝͈̱̞̉͒̾͊͢͞s̰̱̳̱̱̠̆͑̐̏́͌̌͆͘ͅ(̸͓̰̗̲͚̹̏͗͂̒̔̃͠n̶̲̰͖͙͕̗̣̽̓͐̔̍̀̃̇̕ͅͅa̸̡̞̟̦̔́̆̑͟͞ṁ̶͙͎͍͈͓̠̮̆͑͒͒̅̂͗͜e̷̘̮̻̰̹̟̦̿̅͐́̔̓̎̚͠ͅ,̵̨͓̪̼̟̗͙͍͗͌̅̔͘͝ḕ̙̘̱̣͉͓̘͍̙͑̏̔͆̃̀̓͠m̴̡̭̥̯̼̮̟͖̺͒͑̓͛̕̕ȧ͚͎̲̣̮̆͐͂̑̈̚͘͜ͅị̷̺͉͍̳̭̣̯̤̋͐͛̔̂̌͌̚͞͝l̴̢͍̤͔̻͉̱̰̏̐̋͒͜͝)̵̨̨̗̘͇̊͑́͠͝͞͡ V̴̧̧͓̮͉̣̘̀̾̋͛̽̉͢͡A̵̢̹̻̩̩̪̻̘̞̐̽͋͛̾L͓̝͇̣͈͆̽̄̑͂͜͡Ư̯̦̺͖̞͓̼̣̽̂͐̐͛̆̕͘͜ͅĘ̰̫͙̥͛̉̈́̕͝S̸̟̩͉̺̱̀̓͛̽̇̐̓̒̕(͕̮̫͇͌̒͆͒́͛͜$̢̼͔͙͎͎̮̌̈̾͛̂̓͢1̨̠͉͕̤̮̙̆̆͆̃̑͑̊̌,̡̪̫̝̬̣̱̠́̈́̋̊̂̒͜$̴̨͔̹̩͔͚̊̓̾̉̋̈͛̏͒̚͢͜2̛͕̭̪̱̭̻̽͐̍̇̎͘)̸̧̟͍̼̳̥̺̰̓̐̇̑̽̄̋̌̃͜͝ͅ"̴̲͓͍̲̞͊́͂͘̕͡,̵̲͓͇͈͉̋̏̈́̀́͢͠
̵̡̱̝̩̺̾̀͊͆̆  [̷̪̙̞͒̄̈́̒̒̎̽̔͘͜͝ͅ"̸͈̺͚͔̙̖̯̰̯̣̇̎̋͘͝S̡̛͕͓̦͍̯̻̃̃̔̆͑̈̏̄ȩ̜̬̱̘̼̼̄̃́̔̕͜ţ̖̳͎̺͖̆̽̅̇̉͗͡"̷̰̼̙̞͔̄̽̐͆̍̂,̢̨͉̞̭͇̀̈́̽͋́͋̓̋̉͜ͅ"͔̖͎͖̣̼͕͖͑̔̃͂͆s̵̢̥̰̤̜̤̼̜̖͌̽̂̃͘͜͞ȁ̷͕̲̹̮̾̐͒̾̓͋̚͜͜͞t̨̟̠̪̮̄͐͗̇͘̚͜ͅȯ̘̘͙̮͖͚͙͕̑̿̒̌͢͜͝ṡ̸̨̢̛͇̺̣̳̻̒̐͑̚͢͟͠ȟ̸̨̢̪̠̳̤͓̜̓̓̄̾͗͘i͚͈̣̬̘̖̺̐̎̊̄̌͆́͛̓̓n̷̡̧̛̟̫̦̲̟͎͈̆́̎̒͊̐̉̏͠@̶͓͍͉̱̦̽̅̉̑̔̈̐̉͘͝g̸̡̹̖͓̗͇̲̟̗̎̎̑͆̒́̕͜m̵̨̼͔͇͎̗̮̜̻̘̈́̊̿́͐́̓̆x̶̢̪̲͕̼̻̼̠̯̙́͂͒̂̑̎̄̇͒.̧̢̧̧̭̗͚͚͍̔͆̈͗̊̚̚c̟̱͓̫̈̋̒̂̇͢͜͞ͅō̸̦͉͇͎̞̆́̅̐̉͟m̻̱̩̝̞̆̔̌̏̿̂͠ͅ"̸̡͔͖̪̪́̑̀̒̍̈́̋͑͜]̷̢͎̼̫͊̔̒͋̀̈͘ͅͅ
̵̛͙̦̪̇͒͌̏͢ͅ)̨̛̼̗͚͓̆̾̊͊̃̓̓̿͘ͅ
̵̧͎͚̞̹̤̎̓̀͆̾̔̀̇͝Ŗ̸̡̟̺͍̠̒̔͐̍̑͜͢͠͡͠ę̵̬͎͉̲̣̊͒̆̎͌͐́͠â̵̢̛̗̟͉͇̏̒̍͝͠͠d̵̢̨̛̤̳̤̥̬̘̣͎̓̋͆̃̾̚͘
̨̦͉̳̺̰̯́̽̓̀̄͊̎̚͝c̸̨̜̺̱̉̎̈͂̅͘͜͜͝ö̵̥̙͕̳́̓̐͛͊̇̏͘̚͢͜͝ṋ̴̮̫̘̦̤͋̈́͗̊͐͋̈́̈́̉͌͜s͙̣͉̭̯̹͍̰̗͋̇͌͐̀͐͟͝t̸̬̯̞̥̱̞̼̻̖͙̎́̈́̈́̀̉̀̚ ŕ̷̜̝̩͇̙̦̲̈́̂̔͂̍͢͠e̗̺̠̽̓̄͌͒́̀̏ͅͅş̷̟̰̥͈̀̄̄͒͗̏̕͞u͍̠͚̙͊͌̓͗̽͂̎͟͟͠l̤̫̣̞̖͓̆͊̀̋͊́͂̃̀͢͜͞t̗̞̘̮̞̺͎͈͊͐́̀̇̀͊͠ͅͅ =̢̛͖͉̠̊̆̾͌̀͛̿͠ͅ a̴̲͖̱̣̰̦̪̗̙̍̔̓̐̓͆̅̚̚͠w̠͍̦̰̙͍̲͋̐̆͋͛̚̕͘ȃ̴͎̺̰̳͍̮̩̽̎̆̽͗͘i̶̠͔̦̱͉̊͋͐̚͡t̴̨̧̛̥͇̻̒̊̒͒͛̂͌ d̢̙̰̹͇̗̜̠̔͌̌̄͌͌͜b̸̢͇͔̠̻͍̯̓̅̓̌͘͘͜͝͝.̷̛̥͍͎̞̙͉̣̬̄͋̃̉͐͟͜q̛̝̬̥̝͎͙͈͚͉̐̑̔̀̇͆̆̽͊ͅu̡͉͓̠̗̬͖̫̞̍́̔͆̐͟͞ȩ̷̬̻̤̎́̀͒̔̔̎͗͢͟͠ŕ̷͍͈͙̯̬̙̦̲̐͗̎̔̌͡y̵͙͕͉̞̣̾͐̈́̃̀̆̀̃͑(̜̪̤͈͍͗͑͌͆͂̎͋͡͞͝
̶̧̳̞͔̞̯̰̮̤̄̇̌̾͡͠  "̞̠̳̻̥̭͖̭͌͗͂̿͑̕S̷̡̡̧̢̟͔͈̙̣̖̑͛̍͛̽̇͑͂͐̏È̖̦̣̼̣̿̀̄̚͞L̼̬̗̪̹̆̈͊̃̐̒͒͘͢Ê̛̙̻̠̲̞͕͍̾̍͘͜͜Ç̶̛͚̻̫͇̼̦̭̺̏̂̂͞T̡͉̳̻̼̱̙͕͙̬̀̽̾͌̑ *̤̮̯̜̺̺͛̆̅͒͢͞ F̶̞͕͇͕͈̐̄̆̿͟͡ͅR̷̢̰̺̫͍̲̿̅̀̽̇͠͝͡͞Ờ̱̥̤̦̣̐͒̓̍̆̿̄M̸̲͔̻̖͍̞͔͋̑͗̿̔̒̊͝ ụ̝̥͙̭̬̩͒͛̿͛̊̚s̵̡̢̢͖̯͉̟͗͋̒̊͜͝ę̷̜̘͕̟͓͋̉̎̾͟͝͡r̵̯̝̘̰̲̥̺̉͌̈̍͗̀͢ͅs̴͖̘͎͖̘̖̅̇͌̂͐͘̕̚͞͠"̵̡̜̤̲͎̥̠̈͒͛̍̌͟͡
̴̨͖̜̬̣͎̘̏͗̆̈̈́̓͠͞͠)̛̣̰̪̰̲̭̳̇́͗͒
̤̩̤̬͖̼̄͂̇̈́̒̋͘̚͜͝͝
̡̥̹̱͇̱̱̠̰̑̀̏̿̎̕͝c̦̰̭̣͇͌̿̏̅̓̾̔́͒ơ̸̧̢̡̧̟̠͓̱͉̈́́̃̽͂́́̕͘͟ṅ̡̮̘̘̌̑̏̿̀̄̕͢͜͠͠s̶͚̞̬̼̟̩̪͑͐̀́̌̚͜ő̭̭̻̩̘̑̎͗̀̉͐͂̓̕ḽ̢̛̹͖̫̝͖͕͛͛̋̃̏͢͡ȩ̸̭̬̮̪̋͂̉̍̌̉̌̏̕͘.̢̛͍̭̭̜̝̜͍̗͐̋̀̇͑͢l̸̨͖̥̙̝͓̑̔̏̅̏̌̚̕̚ò̷̧̠̥͇̼̳͍̬̭̉̏̾͊̾͂̄̓͢g̵̖̪̱̦̱̔́͂̇͐͑̿̕ͅͅ(̮͉̩̲̹̣͖̫͗͌͌̓̍̄̏̀͗ŕ̴̡̨̢͎͉͈̫̠̥̀̈̒͊̌̈̓͠͞ẻ͈͖̣͈̲̹̝̭͛̅̀̕͜s̴̡͕̠̬̣̲͊́̑̄̅͌̽̕u̢̠̯̺͇̺̽̐͒͋́l̷̨͉̟̙̝̬̞͇̜͊̒͋̉͘͢͝ţ͎̪̹̞͍̘͖͛̎̆̍͘͝ͅ.̵̞̳̲͕͍̙͎͙̘̓̏͋̎̀̿͌͌͝r̴̢̰͚̹̮̫̜̬͖̳̃̈̋̾͌̂̏̓͘͞o̵̢̧̼̪͈̭̣͈͕͌̔̊͒̊w̡̤͙̝̥̜̪͙̓͗̈̋̾̈́͐͝ś̸͙̦͍̗̖̂̍̕͝ͅ)̷̘̲͍͓̦͙̹́̍̒̀̉̅̚
̗̟͖̱̜̖̀̈̐̀̑U̵͖̬̘̼͈͋̋͒̃́̇̑̄̚̚p̵̢̺̺̗̑̓̔̈̒̈͢ḑ̵͈͙̯̣̝͔͂̋́̒̾̎͋͜͞ͅa̵̞̭̞͈̟̼͐̓̽̈́̀́̎̀̔͝ͅţ̧̛̩͚̯̒̇̀̄̾͗͘͘͘ȇ̸͎̘͍̯̪̻̻̔̓͑͗͒̎͟͝
̡̙͙͉̜͓͈͊̌͐̆͡͞͞ā̴̹̯̥̘̫̳̤̂͐͘͞͝w̶̹̮̩̙̪̣̲͊̓͐̓͑͗̂͟a̡̨͈̥͉̖̝̼̍̏̈͌̇̋̚͢͞ȋ̞̪̳̣͇̘̙͓̔̄͛̚t̸̢̲̙͉̯̳͓͉̿͂̓̕͢͠ d̢̮̹̲͉̥̳̥̐͊̾̎̒̍͝b̧̡̗̦̹̠̣̙̯̋̈́̈́̂̀̏͒̿͊̉͟.̶̙̣̮͔̰̲͇͐̑͂̽͊̋̎͟͢q̯͇̜͇͙̠̳̮̄̽̎̈́̔͝u̸̡̞̻̤͓̳̮̪̥̱͛̓̈́͆̍̇̕͞e̜͈̘̥̟̣̪͗̅̀̈́͞r̴͉̫̝̞̞͈̎͛̎͋͛̄̏̓͝y̸̹̦̣͚̖̭͚͑̈́̀̏́̾͘̚͢(̢̺̳͙͎̗͖͖͓̊̏̉͋̎̂̿͌̽͝
̼̤͇̫̗͖̗͔̊̐̀̑̾́̚͟͜͞  "̞̭͕͓͙̟̭͓́̌̍̋̃̇͋̃͝U͚̳͈̻̹͂̂͘̕͝͡P̘̞̥̹̖̖̾̂͂̽͌͘̚D̡̢̻̣̠͓̰̳͍͖́̍͌̇̌̋͛A̢͔̩̺͔̮̱̙̟̔́̏̽̀̈́̊͢͞T̡̗̖̤̙̖̝͈͗͋̄́̋̕͘͜͞Ḙ̢̺̬̣̽͒̽̄̈́̏́̕ u̧͙̩̩͔̭̩̪̽̀̐́͘s͙͚̟̭̖̼̆̉̂͂̾͋̋̆̉̚͜e͈̖͓͈͔͖̟̩͒̓̓͑̈́̓̾̌̈́͛r̵̨̨̪̩͔͙̺̓̈́͂̋̓̇͊̈͠ṣ̡̭͍͇̤̙̻̠͛͛̓͋͡ Ş̷͉͔͎̼͈̭̪̊̐̆̍͆͑̽̇͝͡Ȩ̷̳̲͈͎̖̈̔̀̀͐̑̚Ṱ͚̰̜̻́͋̌̏̓̏͗͡͞ ņ̱͓̻̳̟͈̺̅̏͒͌́̓̂̒͞ä̴̢̪͚̦̝̩͉̲́̅͋̓̕̕͟m̷̬͓̦̘͈͕̍͛͌̈́̕ē̞͖̲̫̫̹̲̦̊̒̑͌̀̚͢͠=̢̲̬͍͈̌͗̈̋̃̋͆̾͘͝$̨̼̦̼̠̬̭̗̾́͐̾̇̓͢1̹̝̯͙͔̪̖̞̌̿͆̐̋͒̓́̊͡ W̸̡̫͍̗̰̼̲̤̅̔̑̋̕͟H̶̨͖̯̣̐͗̀̓͋̈́̅͗͢͜E̬̞̺̬̝͐̏͌͑͝R͉̜̤̫̩͗͌̔̾̃̋̊͂͡E̛̮͚̺̱͓̙̣͇̓̿̃̄͆̿͢͠͞ i̢̛̳̰̻̳̝̦͈̇̇́̇̏̽͊d̷̛̗̥̘̠̗̓̽͊̚͟͞=̷̨̛͇͚̹̰̻͉͎̭̠̎̐͆̑̇̄͛̒̚$̷̨̛̺͓̺̭͙̊͊̇͑̈ͅ2̝̖̰̖͓͓̏̏͋̏̆̂̔̓͘͡"̳̫͈͖̺̱́̉̊͂̊̑͋͑͘͞ͅ,̷̨̙̲̟̜̱̪̠̯̿͑̾̃̚͝͝ͅ
̻̙̖̬͕͍̫̹̆̊͛̈̎̏̎̕͟͝  [̢̬͚̠͍̝͊͊̍̅̐́̊̉͘͞"̶̟͎̺̺̹̓̍̀̊̃͛B͕̩͍̫̀̀̽̿̀́̐̿̎͢͜o̴̡̢̼̘̭̯͎̓̉͗̍̌̊͠b̶̗͉͓̟̙̓͌̽̏̃̔͘͝ͅ"̨̯͉̥̼́́̒̎̈͞͞,̶̨̢̛͖̗̥͕̮̼̮̜̓̒͐͐̋̇̀̅̊1̷̙̫̗̊̉̋̀͢͡ͅ]̢̛͔̦̣̮̤͓̪͎̈̎̽̈́̌̉͡ͅ
̸͔̰͇̟̼̖͌̓̌͊̄͌͟)̸̯̞̹͇̅͊̈͆͗̀̅̎͜
̪̼̭̩̦̤̠̌͋̎̿̏̽̃͜͢͟͠D̵̡̛̛̠̭̖̘̟̭̬̏̄͘͢͜ê̛͉̼̖̬͍̩͉͛͊̌͋̅͘͡͝l̴̡̼͔̠͍̞̲͖̫̀̊̈͋͐̋͜ĕ̯͎̬̞̅̆̾͟͠t̬̝̠̰̄͛̀́̑͑̊͋͜͡ȩ̵̢̛̺̼̰̦̗͔̩̻͒̇̎̓͛̉̐̋͝
̴̝͈͈̞̫̗̬̊̃̓͊͛̋͝å̘͓̲̰̠̎̓̄̂̀̔̀͘ͅw̷̧̜̟̺̻̩͉̜͐͋̒̄̐̄a̸̛̬͔̲͚͓͓͉͆́̈́̇͒̔͝i̧̧̧̛͎͔̬̜̬̽̄̐̄͑̔̔͟ṯ̸̡̛̝̱̗̻̖̩̪̯̊͌̉͒̚͡ d̵̨͓̣͉̥̠̘͇͐̐̾͌͋̕͜b̴̛̰̖̟̣̤̗̽̓͊̓.̳̬̜̬͉̺̗̼́̇̂̅͑̂͊̈́̿͆ͅq̖̖͙̘̲͙͍̉̍̈͛͆̌̓̈́ú̵̧̧̹͕̠̺͈̹̿̈̂̐͢͡͝ȩ̤͍̪̍͌̂̽͑͟͠͡͞r̛̞̞̤̳̩̟̹̟̎̄̐͆̾͗͂͊͞y͔͖̯̟̬̔̇͗́͒̓͑͛͘͞ͅ(̬̟̲̮̯̞̯͈̞̇̀͋̀̋͗͠
̸̬͈͇̻̫̯͍͔̃͂̒̄͑̈́̃̚͜͝  "̨̥̪̯̙̒̾̀̌̍͢Ḏ̨̢̘̯̙̰̄͗͐̉͒̉͘͟E̴̮̤͚̠̓̒͐͒̑̇̕͜͞͠Ļ̤͎̰͙͇̭̙͈͓͆͛͛̌̔̊͐̋́͠Ę̨̥̯̲̘͕͕̯́̈̍̎̕͠Ṱ̨̘̫̳͓͕̝̣̏̆̀̄̈̀E̵͚̥͚͖̗̺̘̝̔̌̋̾̈̾͜ F̧̱̠͓͔̦͉̦͐̊͂͆̆͠͝R̖̯̬̪͐͌̏̈́́̐̍̾̄͜͜͜ͅO͕̬͕̼͒̎͗̊̑̀͟͞͝ͅM͎̱̻̦͉̅̀̚̕̚ ű̥̺͙͓̹̝̬͂͊͐̇s̶̫̬͓̻̩͔̹̬̒̔͛͊̌̆͟͢͞͝ȇ̠̳̗̜̥͚̠̭͇̎̎̀̿͝ͅr̛͉̙̠͚̙̩̺̦̈́͂̿̋ṣ͓͕͙̦̹̮̒̍̽͞͡ W̸̗̳̤̳͓̝͔̝̭͐̈̓̓̾̈̓̋ͅH̨͓̝̘͕͉̎̓̈̄͆̕̚Ȇ̷͔͕̪̘̭̜̜͆̂̔̎̍͆͜͠͡R̸̩͚̖̯͙̗̙̦̝͋͗̽͌͊Ȇ̷͙̥̬͖̹͔̼͌̿̌̏́̆͟͞ i̡̩̬̰͙͌͐̈̋̀̇̒͟d̴̨̤̥͓̹̳͕̫͎̀̊́̐̅̔̃͆͝=̶̡͎̯̼̝̻̜̙̱͌̿̎͘͝͞$̴̢̫̼̰͎̻̀̾͛̉͛̅̈́ͅ1̸̤͈̜͉̻͍̗̼͂̾͂͂͊͌͒̒̕͝"̧̨̩͈̹͍̟̖͇̄͛́̾̓͞ͅ,̩̭̳̰̲͚̈̀͊̀͋͆̚͞
̧̢̩̺͎̦̖̲̎̀͐̏̃̌͒̑̑̕ͅ  [̷̼͙̞̖̥̿̍̽̒̾1̸̛͕̻͈̥̓̓̈́̄͘ͅ]̪̜̟̜̦͖̓̊͒̽̂͐
̶͎͎̥̫̞̑͆̒̉͠)̛͚̠̠̥̬̌͑̈̏̀̀́̒͟
̸̨̛̼̖̺͇̪̹̖͊͂̓̿̂͆́͟͞E̢̞̖̭̯̞̐̋́̄͛̚̕x͓̭̹͈̱̳̹̦͓͒̂̀͌͂̈́̏̓̚à̵̛̭̦̺͎̬̤̦̿͐̓̂̎͐͞ͅm̸̡͕̺̖̭̘̾̓̏͑͐̆͘͜͠͡p̷̧̝̝̼̟͍͚̫̾͊͐̐͆̒̕͟͞͡ļ̨̖͖̮̗͙̼̊͋̒̀̑̍ę̷̼̗͎̰̞̩͉̞̌͋͛́̓͜͠ N̶̨͍̰͇̦͈̜̱͐̂̍̀̎͝͠ỏ̴̡͎̠̖̱̳̪̞̭̈̏͌̎̕d̷̡̨̙̗̪̜̅́́̆́̚͞ę̥͍̭̰̞́̒́͘͝͡ A̷͉̝̳̰̖̲̾̓̔̍̒͝p̷͚̫̗̤̘̘̹̄̒̋̎͒͟͝͝p̛̝̗͉̟͓̓̀̀͐̆̾͞͞l̡̻̠̳͎̩̆́̆͐̃̈͟͝͡ͅḭ̹̯͙̭̖͎͚̜̒͐̃̊̽̊̅ͅc̵̢̩̠̥̭̘͎̮̠͂͋̀͂̀a̵̧̛̩̳̤̪̙̺̠̾̿̆̏͋̓̕ţ̶̯͙̗̀͐̑́̇͆̎͛͐̃͟͟ị̴̤̩̻͔̺͕̯̣͂͑͗̽̈́̕͘ͅơ̢͍̹̪̩̆͋̓̀͆̃n͓̳͔̬͕̩̬̈́͂̀̌́̃̔̽͐̐
̭͙̲̫͙͋͗̇͌͊͠ͅć̖͇̮̝̗̺̝̥̹̌̂̀̉̆̓͂̍õ͕͔̭͉̣̼̰̻̉̑͑̇͢͟ṅ̶̢̢͍͕̤̝̙̓̌͆̊͢ͅs̱͉̥̰̦̮̗̓̇͐̄̓̌͟͞ͅţ̴̛̪͍̬͍̺̬̝̮͑͌̿͐͑̕͠ ḍ̶͕̼̘̠̞̘͇̟͒̑̾̆̂̇̀̑͡͝b̺̙̯̻̜̔́͛̇͡ =̨̖͖̲̭̬͎̅͗̅̈̉̇́̎͟͞͝ r̷̡̨̲͈̱̫͚̍͋̂̇̂̎̆̕ȅ̴̢̜̮̱͇̫̞̣̑̿̓͛̇͐̓͊̕q̧͚̬͖̞̙͈̱̰̽́́͆͌̈̀̅u͚̘͚͙͇̰͋̈̍̌͗̏̾̚͝i̵̥͙͔͈͎̲̽͒̏̀̇̓͡͡͠ŗ͚̹͔̩͙͒͗́̽̀̇̾̏͟e̢͚̞̟̥̦͚̗̻̎̽͂̇̚(̵̞̙͈͕͖̝͑̔͒̓́͒́̚͞͞"̴̛͇̘̠̥̖̟̳̞̼̺̋͋͂̃.̛̜͎͇̖̟͑̈̓̿ͅ/̧̟̗͓̯̞̙̼̞͋̈̉̈̊ͅp̸̙̱̤̝̣̹͉̱̗͇͆͗̊͗͞ơ̻̖̬͇̦̩̿̊͐͌̓̓̕s̼̦̻̫̲̎̎́̆̔t̡̧͚̣͔͙͕̤͖̃̒̃͂͘ḡ̷̼̮͎̯̖̺̳̹͒̐̅͋͝r̜̲̹̹̟͈̹̠͒͑́̈́̏͌̇͘͜e̛̹̣̝̗̼͔̓̑̍̍͑́̆̾̕s̶̩̦̺͕͙͔̯͎͉̓̐͊͊͒̉̔͠͡͝q̸̨̩̗̲̯̔̇̑͋̏̀͘̕l̵̰͔̞͓̟̦̥̅̌͊̾̔͗.̢̧̭̠̯̀̅́́͢͞j̴͖͖̲̺̭̳͗͂̌͌́͌͊̎̽̎͜͟͜ś̜̺̘͖̹͓͗͛̍̇̌̎̾͢͡͝"̶̨̤̮͚̪͎̳̣͊̈́͊̋̃̎͘͢)̴̛̳̰̞̯͆͢͝͠͝
̸̙͚̘̥̳̆̑͑̎͐͋̌
̵͈̗̝͕͕͂͋͂̋͛̂͊̀͢͞ͅͅa̷̡̳̻̪̦̽͋̈͗͞s̳͎͇͈̺̜͈̱̯̙̅̾͛̀̑́̇ý̵̛͚̬͕̱͖̪̃͆̄̓͊̑͋n̵͔̝͕̮̫͈̳̻̊̓̂̐̐͌̓̓̕c̸̪̭̟͓̘̙͓͈̑̋̽̎̾͆̅͛͐ f̴̡̞͔̼͓̭̏̇̏̔͐̂̈̑ų̶̗͎̦̟̣̻̙̂́̽́͘͢ͅń̷̛̥͚̼̰̼̥͈͕̑̎͗̿̏̋̀̈́͟c̵͙̙͖͖̯͆̆̏̎̿̐̿̄̚̕t̳̪̗̲͚̮̤͈͈̞͒̽̆̐́̉̒̚ï̢̭̯̺̝̗̎̔̍̈̓̽̚͠͠o̷͈͓͖̦̻̻̮̲̙̎̿́̈́͘͘͘͡n̛̳̘̦͈͎̟̾̐̋̋̿͌ m̷̫̰̱̮̯̟̘̬̋̄̀̂͜͢͞ã̛̼̯͕̝̱̼͋͒́̌͗̿͘į̵̧̛͉̫͙͉̺͔̈̈́̋̌̅̚̚n̛̞̲̳̥͉͕̙͖̂̾̎́̓̓͌̕ͅ(̢̨̪̭͕̝̳̖̓̓͗͐̌̅̕͢)͉̟̫͍̩̠̈͑̔̆͋̿̅͠͠{̡̻͎̝̗͗̐̏̔͂̋͋̕͜͠
̸̨̨̛͓̜̥͖͂̐̓͌̏͆̓̾
̛͕͉̞͚́̓̊̾͜͜͝͠͝  a̵̡̧̤̠͐̑̌̍͂͡ͅw̴̺͍̓͋̽̈̃͢͜͠ͅà̵̡̡̛͔̜͈̳͇͙̏̽̀̌̐̕͜i̡̤̖͎͉̱̥̦̦̮͋̅̍͋̀͌ț̴̗̻̩̮͖̉̿̔͋̂̋͂͘͝ d̸͓͙̰͓̰͖͕͖̑̅͌̉̆̎̃͌͡͡b̸̙͔͈̺̬̋̔̓͋͝͝.̴͚̠͖̹̦̬͗̓̀͗̓͑̔̊͌̕͟c̴̢̗̣͇̽̓͛̅͘͢͡͡͡o͇͙͖̱̬͆͋͑̊̋́́͗͝ͅn̸̖̥͍̻̠͙͒͗͊̂̆͋̇̑͟͢͝n̰̼̪̩̘͋̋̒̂̌̉͘͘͝͞ẹ̸̛͕̳̣̣̬̥̆̄̄͐̔͌͟͠ͅc̭̟̣̺̗͆̀̀͘͝ţ̛̹̠̞͔̙̼̞̄̓̾͂̒̆̚͟(̨͚͖̮͖̗̰̎̀̂̿̽̃͜)̷̢̬͔̮̬̤͓̥͓̍̄̎͋͊̀̽̀͢͝
̸̜͇̬̹̤̟̘̗̰̍͆͂̑͊̂̾͊͟͠
̢̰̙̲͈̠͈͒̑͒̄̾  c̸̡͕͔͈͔̋̍͗̀̍̆̾̕͜͡o̡̮̥͇̟̜̓̇̈́́̒͜͟͠ņ̵̱̣̲̝̺̓̐͛̄̕͡s̤̺̼̼̫͊̾̌̊́͌̆̅̈͡t̵̨̮̪̜̣̩̞͑̿̇̌̾̈̈́̇̋̕͢ r̷͓̬̖͎̱͙̥͂̓̅̋̎͋͑̌͘e͓̤̪̊͌̄̅͘͟͡ͅs̶̡̤͎̥̺̫̬͓̎̽͗̋̃͘͘͜͢ů̷̢̱̱̲̣̜̠̬̪̅̿̊͜͞͡͡ḻ̶̘̝̻̘̖̜͍̋̏͗̆͂̒͒͡t̞͓͍̰͔͇̞̹̎̔̿͒̔ =̤͇͔͖̭̰͈̊̿͒͐̓̅̇̑ a̴̹͕͖͓̤͔̼̿̒̎̅̾̚ẘ̢̻̱͖͉̺̞̘̏̈͗̽̌͐̈́̔͞ͅͅa̵̢͚̺͈̟͆̀̅͊͒͝͠i̷̛͇̙̖̞͎͑͗͂̒̇͝t̢̧̺̩͙͙̘̞̣̀͗̄̌̿͆̐̂͜ d̴̹̥̺̯͙͕̹̬̠͑̐̀̉͘͝b̷̫̘̹͕̠͈̣̣̟̜̉̃̽̀́̕.͙͙̳̖̩̗̖̼̄̎̀̿͆͊̎̏̉̚q̷̖̪̲͇̻̮̟̬́̽̉̿̽͂̃̉͢͟ȕ̝̙̜̳̖̼̄̉̌͗̋͘͜͡͝ẻ̛̺̘̙̗̟̲̫̀͊͊̈̅̒͘͟͞r̷̨͇̖̙̼̭̈́͂̾̏̒̕͢ỳ̵̦̝̘̪̙͑̆̀̿͡(̶̢͙͎̰̜͖̱̠̤̜̋̉̈̌̕
̶̡̢̼̺̦̻̝̓͌̐̌̈̕͠    "̷̢̳̯̻̪͖͛͂͗̀̑̂̏̕͠S̛̲̹͈̩̪̭̋̀́̑͠Ē̢͓̟̥͇̩̫̥̏͛͋͆̈͊͢ͅĻ̵͙̩͕̮͉̦͓͗̀̌̒͝È̥̬̣̝͎̮̎̓̑͌͆̓͐̚Ç̸̧͓̗̪̦͖̆̓͋̆͞T͍̱̞̝̭̪́́͆̅̍̀͂͌̄͡ N͉̦̥͍͖̭̬̓̓̓̓̿͌̍̇Ǫ̡̨͕̗̹̎̐͋̒̌̏̑̋͟͞͡W̵̧̡̡̛̘̪̦̘̣̊̈́͆́̚(̨̫̟̩͒͌͗̂͠ͅ)̨̡̢̱̻͕͎͚̇̅̓͛̀̓̍"̶̡̨̙̜̟̗̙̖̍̂̀̓̃͊͑͘͢
̡̢̼͍̻̗̳̦̪̋̓͒̋̃̓̏͆͜͡͡  )̷̨͚̺̞̖̋́̓̀͒́̊̽̚͘
̴̨̣̤͚̻̝͇͎̜̈́̐̏̈̌̏̎͟
̵̲̠͓̈́͊͌̈͋̈́̓͟ͅͅ  c̨̣͎͔̱̝͓̮̠͂̒̀̇͗̃̍͒͞ǫ̶̥̫̪̥̱̀̽͊̑̋n̸̮͈̥͓͖̯̿̍̂̃̈̐̚͟s̸̢͈͔̝̥̹̭̑̅͌͒̈́̐̏͊̉͘o͚̮̖̖̰̗͛̈̄̃̑̉̽͡l͔͍͚̥̮̳̄̂̓̔̑̀̀e̡̺̯͚̦̘̘͉̩͂̎̓͌̊̎̐͜͞.̶̙̩̭̖͓̞̝͊̐́̽͢͝l̜͇̯͓̞̣̭̒̿̔̂́͒̚͝o̵̢̡͚̲͈̲͍̝̼͂͊͌̾̏͌̚g̶̱̳̙͎̭̈́͒͗̈́͝(̴̪̱̗̟͙͍̝̭̱͂̊͊̅̕͟r̷̨̳̫͓̹͖͑̆͌̏͑͘͡͡ë̗͎̫̙͈̱̻̤͙̅̾̽̄̋̚ś̢̳̲̳̥̪̯̗̟̃͑͌͊̚͟u̴̲̥͈̙̤̔͂̀̏̉ͅl̗̠͙͇̬̱̝̟̾̊̐̉͘ẗ̜͔̱͈̣͚̹͔́̎̍͌͒̕.̢̢̛̮͎͍̖̦͒̃̋̀̓̈̕͜͠r̡̡̮͍̤̥̭͇͇̉̀̇͊͑́͐͡͝ͅȏ͕̼̜̰̝̤̘͔̍͒͌̓̅͘w̷̹͇̥̤̝̻̰͙̒̑̎̋͐́̌͋͟͡s̴̢̠͕̻̠͕̣͈̥̤̃̈́̀͐̆̊)̧̛̹̪̫͔̻͙̹̌̀̃̂̀͐͛͌͟͠ͅ
̬̩̹͈̘̻̎̍̍̔͝͠
̧̼̱̙̃͊̄͐́͘͟͡}̶̧̹̝̣͈̮͈͋̈́̄̚͟͝͝
͉͓̩̘͉̟̗̮̖̰̏̆̅̆͡
͉̮̩̦̣̟̺̈͑̃͒̽̑̌̓̅͢͝m̵̢͙̗̼̙̮͎̖̖̼̀̾̋̏̉̐͡ȧ͔̰͍̬̱̖́́͐̉́̀̒̈͞ï̸͖͚͍̖̪̬̞̃̏̇͊̌̎͞n̡̛̘̝͈̽͑̐͟͠(̷͓̫͖̯̎͐͆͂̒̕͘̚͘͟ͅ)̷̢̥̰͙̳̫̱͙̒̽̓̎̚͠
̡̭̣̘͉̱̦̻̔̿͂̓̍̔̊͜͢͝F̵̟̺͔͔̖̫̍͑͐̕͢͠i͇̙̼̣̹̭̎̾̃̄̈́͆̉̓̍͡ḷ̸̭̩̟̝̝͍̮̅͒͗̿͠͝ͅe̢̛̳̱̫͋͛̃̊͛̑̓ͅ S̷̺͖̟̟͖̤̹̐̌̍͂̏͘͠͞t̷̹͇̹̞̳͈̗̰̉̋̅͑́̓͟͢͞͡͞ŗ̸̨̼̦̯̟́̿͛̂̍͘ü̗̯̫̥̭̥̻̻̖̞͛̐͐͠c̡̨̣̲̲̯͗̔͑́̒͛̒̚̕͢t̫̭̣̻̗̗̂͂̾͋̌͛͊̕͢͠ư̢͉̝͓̱̙͙̙͗̀̀͘ͅr̭̦̖̰͍͊͋͗̓̃̂͋̓̋ḙ̶̡̨̛͕͍̜̮͈̪̠̃̇͊̓̂͘
̸͚̭͇͖̞͎͎̉̅͊̅̓͆̈̿̄ͅp̛͎͎̺̞͙͊̂̍̌̀̈̋r̢̹͎͔̎̏͌̑̊̎̇͢ơ̴͓͉͔̞̩͋̂̌̇̈͟ͅj̢̞͉͙́̀̓̉̇͒̿͠ͅẻ̸̢̨̢̛̘̝͔̀͌͒̆͋͐ç̸̧̘̮̣̜̞͖̱̍̍͗͆̀͘͝͡t̨͚͚͖̺͆͊́͊͋̀̕ͅ
̸̨̨̱̝̣̠̟̞̇̐̾̍̄̈͜│̨̢̦̦͚͌͊̎̀͆̕
̨͍̯̼͛̌͗͗̚͟͜͠├̴̛̳͉̭̻̠̰͖̉̿̎̆͑̌͛͡─̵͎̩̤̦̥̔̿͐͐̽ p̡̢̦͓̪̫̹͎͕̓̓̐͑͢͝ŏ̷̧̼̰̝̺̱̦́̾̂̌̇͊̊͟͜s̵̢͚̹̯̼̫͌̇́̉́͆́͛͟͟͟͡t̴̥͈̮̫̦͖͎͍̆́͛̌̂̉́̍ͅg̶̨̞̲̬̈́̓̆̆̏̉͢ṟ̵̢̰͉̱̤̜̈͌̊͊̍e̢̯͍̞͌̈̈͑͝ͅs̸̡̮̠̘͊͊̆̆͊̌͟͞͝q̨͕̬̭̜̥̻͕̳͈̋̈̊͂̎̕͠ļ̵̤̪͚͇͒̽̔̔̒̽̄͆͛͝.̪̬͓͕̥̫͍͚̀͐̔͐̈́̅̚̚j̸̳̲̮̼̖̠̬͚̰̏̓̓̓͘͠s̬͙̱̫̟̪̾͋̿̒̈́͆̇͐̕   #̧̘̻̦͎̣̭̑̇͐̀̋͟͜ d̴̨̡̗̰̘̘̋͋̃̊̈́̽͠a̡̢̳̰̗̱̹̯̰͓͒͛͗̋͋̐̋͘͠t̡̳̬̦͓͈̽̓̊̎͌̓̽á̴̧̱̤͓͖̉͐̅̎͂͘ḇ̸̡̛̟̘̳̟̪̻̊̈́̆̅̆̀͗̕͢͡ͅā̛̰͍͕̔͂̑̊͘͟͜ş̢̠͚̫̭͍̖̔͐̉̍̑̔̎̊̕ͅę̶͉̣͓̦̼̖͛́̿̌̓̉̔̓̂́͜ͅ h̸̞͇̪̪̭̗̩͗̾͐͢͝͝é̷̥͍̫̠̗̻̯̙̊̀̎̀͒̒̅̍͟͟͞l̸̛͚̦̠̤̦̹̭͍̒̃̽̓̎͞p̧̼̮̗͖̯͂̽̑͌̆̈́͟͝ͅè͎͔͉̤̟̪̹͎́̊̊̉͌̇̒͜ṟ̵͍̦͕͖͇͋͋̐̀̀͘͢͞
̶̡̛̲̼̙̦̼͈̙̩̤̌̈͐͋̊͘͡├̷͙͉̤̘̄̀̀̾́̐͗́́͜─̱͉̞̻̱̼͓̓̍͑͛̔̕͟ ǟ̵̧̧̛̯̖̱̞̲̓̈̕p̮̤̟̩̺̦̟̦̳̥̓̀͐̀͊͞p̢̛̛̬͎̼̫͙͓̱͔̒̒̿̈͐̽̓͝.̧̯̲̘̝̜̱̱͉͔̈͐̊̾͂͊͑͂ĵ̸̛̮̝͕͕̤̟̈́̆̂̍̌̇̐͘ş̸̫͇͍̭̰̣͋̾͒̋̇          #̺̬͔͚̩͈̏̄̽̄̓̊͑̃̈̏ ḁ̶̢̞͖̩̤͌͂͊͗̽͟͜͟p̼̘̠̯͕̹̠̣͛̉͆̔̉̅̾́̆͘͢p̢̡̥͎̮̤̠̻͎̬̎́͑̃̑̍̕ļ̶̩̪͇̤̦͗͌͑̍͛̈́̓ỉ̷̥̫̱̼̦̐̓̓̕͝͞͠ͅͅc̵̢̧͍̙͉̥̦̗̀̌̎̍̽͋̇ͅą̵̡̡̫͙̤̣̻̟̑̌̋̿̾̈̔ͅṭ̸̡̼̣͎̪͙̪̊̌̽̌̈́̚͢ĭ̡̧̘̹͎̃̎̉̓ơ̶͖̝̺̦͉̘̜̭͈͊̈́͆̚͡ͅǹ̯͈̮͖̠͎̳̎͛̅̅͊͌͗̓ ĕ̱̝͈̙̰̝̼̫̄̿̏͊̔̔̽n̰̬̜̱̟͑̆͂̍́̚ţ̵͈̖͕̱̜͎̌͆̌̏̅͢͟͠ř̢̨̢̼̙͇̬̲̖̀̈́̌̂̓͌̑̚͜ỳ̶̺͕͔̤̦̗̜̈͐́͟͠͝ͅ p̵̼̻̪̗̘͑̽͋͛̏̚͡o̷͎̼̠̻̓́̐̈́̔̎̍̐͐͢͠ǐ̛̙̯̥͔̗̓͌̚n̶̪̪̣̫̙̋̋͌̀͂͜͠t̴̠̖̬͍̺̭̺̖͆̅̆͌̓̔
̶͓͚͔̤̥̐̍̔͊̕├̸̛̭͖̗̦̩͕̀͆̏͊̇͛͋̕̕͟͟͜─̮̳̲̦̦̲̥̱͍̩̃̍̄́͝ ṕ̧̪͕͉̺̬̠̎̇̔̒͂͜͠ḁ̶̡̛͖͎̝͎̊̅̓̏̉̀c̢͕͈̲̤̫̻͍̞̫̅̀͂̄͒̈́̑͑̕͠ķ̘͖̝͍͗͊̃̊̄̆͆͌͜͟à̸̼̪̬̱͑̒̈́͜͞ğ̢̧̭͖͖̞̦͗̾͂̓̓͛̓̉͜͡e̸̢̬̪̭̪̠͎̿̇̏͘̕͡͠.̶̬̘͙̥͍̺͖̞́̆̅͋͑̂̍̾̊j̵̠̺̣̣̖̿̉͗̉̓̿͘͟ṣ̵̡̛̛̛̣̦͇͊̒̑͑͡o̴̝͎̠̠̦̖̹̰̓̆̈͐̿́̾͜͟ṋ̴̢͉̟̦̜̙͊͐̉̀̎͒̅͗͝͠
̸̢̬̬̺̫̥͔͇̏͆͂̾͆̓͡͞͝͡└̢̢̛͔̞͉̱̤͊̀͂̋̓͐͜͜─̠̘͓̼̹̻̩̆͌̓̊͒̕͢ R̸̢̢̝̘͎͖̗̍̍̉̅̇́͢͝͠͡Ȩ̷̧̢̰̭̳̮͙͚̟̋̽͗̚̕͡Á̶̼̮͖̦̐̒̐̉̓̇̅̊̕͟D̴̛̛͚͚͈̓̊̓̔̄̽͜͢͠M̡̡̮͓̳̳̠̹̓͛̑̆̅̓̀̕͢͢͡Ȩ͇̩̖̖̲̫̯̻̊̆̊̀͘.̨͚̦̱̥̺̫̺̍̀̿̌̓̿́͜͜͡͝m̱͖̖̳̥͕̠͛̾͋̚͢͟͢͡d̶̻̺̳̺̜̦̳́̐̓͌̐̀̊̐͝
͎͖͉̯̜̾̾͌͂͐̾͋́͢͟͟͝G̘̥̟̺͐͑̂͒́̌͟͟͠o̸̱͉̗̱̻̅͛̉̍̓̈́͑̂̅̾a̶̛̛̠̘̣̼̰̥͌̅̍͘l̸͖͉̘͍̖̗̙̘̍̋͋͂͆͋͘͜ͅs̫͚̬̲͔͚̗̾̈́͆̽̇
̢̛̺̙͈̭̦͈͓͚̟̈͑͌̑̃
̯͖̱̼̪̪̠̈́́͋̚͜T̷͔̣̫͖̗̦͈͇͒̑́̌͑̕h̭̺̻͍̯̹̮̎̋̄̏͊̂͐̉͘̚i̷̛̙̹̝͚̞̎͑͌͗͛̀͌ͅs̵̨̮̙͎̖̠̖̮̀̂̋͛͆̆͞ͅ ḿ̡̪͓̞̗̲͕͈̗̝̈͋̇͐͆̓̕o̺̱͇̲̘͂̓̉͆̓̑͐̕ḑ̷̜̰̥̞͚̍̍̀̋̕ǘ̷̞͚̜̦̥̻̗̩̗̀͌̆̈̓̄̂l̷̢̨̢̥̲̼͔̫̇̇͒̍̕͢͟è̷̢̢̛̠͉̬̤̀͂̔ f̵̡̧͓̩̳͓̲̻̱̈͂͊̇͢͠ò̝̼̭̦̦̉̀͑̑͊͘̚͟͢c̵͍͈̹͚̰͈̮̰̮͎̈́̊̊͑̍͛̿͘͠ů̢͎̭͕̗̤͒̆͗͢͝s̸̛̰̞̳͈̱̝̊̀̉̂̆͘͝͡͞e̯͔͕̦͎͚̓̍͑͗̐͋̆̄͢͡s̶̞̝͍̝̖̎͒̾̑̀̿͟͝ ơ͕̦͖͍͉̈͐͘͝n̵̡͔̗̰̥̆̀́͑́͝:̶͎̟͙͙̙̪͂͑͐̐̃̚͟
̨̥̦͓̙̯̗̮͛̍̀̋̀̏̂̋͢͝
̨̥͚̪̬͇̙̻̯̙́̍͗́̈̑̋̔ś̤̝̩̰͓̭͐͆̅̂͒͢͡į̬͎̠̮̒̈̎̍̄̌̌͘͘͝ṃ̷̨͙̳͍̩̳͍̼͆̿̇͛͌͋̆̕̚ͅp̛̮͉̭̻͎̰͗̈̈́̈́́̌͞͠l̡̢̻̻̭̻̣͎̎͒̋͐̚i̘͖̗̹̞̐̓̉̌͟͢͡c̛̠͈͍͚̗̝̲̞̣͎̄̏̓͒̈́̐͂ī̧̩͎̫̺͓̙͚̻͚̈́̽͑͛t̰͍͔̠͚̫̖̝͖̀̉̐̓͡͞y̵̳͚̫͓͎͗̀͊͆͡͝ͅ
̻̱̙̙̰̂̓͌̈́̾͗̌̑̕
̧̬̟͎̫͉̺̜̉̅̆͐̃̿͘͘f̷̢͎̥͚̺̦͎̔̃̐̄͋̌͜ụ̢͈̼͓̑͠͡͠͝n̡̻͉͔̗͓͐͊̇͊̉̾̀͆̎͟͠c͎̤̦̫͙̝͒̀̄̂͐͠͝t̪̲͉̲̫̙́̇̿͑̓̆̓́̀ȋ̤̯͙̩̜̖̦͇̲͔̉͌̑̿̔̒̓͆o̸̹̟̫̜̲̝͋̎̾͆͟͟͝n̵̰͎̘̗̣̰̯͌̌̇̈́͑͗͋̓̇͘a̘̥̜̦͍̔̓́̾̾̐̿̔͢͞͠l̠̻̘̯̗̮͎̅̀͌͛͛̚͟ u̶͚̦̦̭̱̞͉͋̋̎͐̐̀́͢ṡ̸̢̜͈̳̹̰͗͛̓̏̉̈͘͟͢͡ă̶̡̮͉͇̜̮̱͇͋͂̆̽̄͛̓͝͠g̵̦͕̹͇͇͖͋͛̎̉͟͡͞ę̶̢͕̲̬̗̱̲̯̇̔̿̄̅͡
̗͉̭̳̱͓͂͒͊̒̃̉̕̕͟
̷̻̖̭̪̮͆̉̑̄̈́͋͝͡d̸̡̞̦̱̭̳͛̀̓̌̂ì̶̫̪͇͙͎̬͐̍̉̀̌̒̑̑͜r̡̩̫̞͎͍̂̋͌́͊̃͌̾̐̕ẻ̡̙̯̩̦̾͌̽̔͊̊̈́͘͠c̢̣͔̳̜͎̤̳͊̿̇̃̎̿̀̄͐͘t̸̨̢̡̫̟̲̯̤̹͋͑̀̈̏͑̀̚͢ S̵̮̥̜͔̝͓̩̪͎͓͒͆̀̍̊̀͑͠Q̵̨̫̞̳̍̽̋̀̃͊͘̕͜͡Ḷ̢̨̲̜̳̓͌͋̄̈́̐̃̽͢͠ͅ á̵̢̻̞̮͕̬͚̱̍̂̽̎̈͟c̲̭̙̙̞͈͉̿̽̽̿̕͢͢͢͞͝ç̸̞̞̰̘̪̼͇͆̅̽̀̚͠é̵̛̱̫̪̪̟̩̥̔̏̏̎̃s̷͙̯̙̖͖̹͗̏̐͊̚͢͜͝s̷̡̖̥̳̯̬͂̏͗̓̀̅̒͡͡
̢̬̜͋͒̉͂̊́̈́͌̾̏ͅͅ
̧̢͓͙̞̤̘̤͛̽͌͆̀̾͘͞m̢̛̦̯̬͎̱͉̏͂̌̂̽̍͒͞͝i̵̧̲̲̮̘̓͛̅̄̈̅̅͐̕̚͢n̵̡̝̼̙͚̦̪̐͂̆̎͐́̚̚͟i̸̫̬̲̘̪̮̖̣̊̓͋͂̌m̷̢̧͉̙̟̬̺̗̮̈͗͛̑̆̚̕͟ą̴̝̹̳̱͕͎͓̂̅̐͛̐͑̉l̷̢̡̫̹̩͍͖͔̿̃̏͋͛̀̐͠ d̙̼̦̯̪̒̎̎͊͆͆͑͝ȇ̩͉̻̞̹̦̖̻̋̾̕͞͝p̘̯͇͍̫̭͌̒͋̈́͒͘e̴̢̨̙̝͉͌͒͗̇̄̿͌͜͠ņ̨̡͎̠͈̖̜͗̒̔̃̑̔͆̃d̵̛̛̦̝̗̪͉̺͒̈̇̓̋̈́̿͘è̸͕͓̗̱͎͕͍̑̂̔̊̕ṅ̨̗̖̭͓͉́̌̉̕c̡̡͖͖͈̜͇̬̘̈́̀́͗̅̓̈́͗͢͞i̼̹͓͕̦͆̿͛̐̕̕͜͢͜͜͝ͅȩ̢̛̱̲̻̱̱̱̠̯́̏͒̆̀͂͑̇s̵̡̩̦͓͓̭̘̓̓̓̓̇
̸̙̟̖̠͙̤̫͓͕̯̇͛̔̓͋́͘
̧̮̯̰̜͍̲̱͍̈́́͌̆̅̂͛̾͡I̟̹̯̺̒͋̀̆̓͊͆̌̑͐͜ț̷̛͉̳̞͍̆͐͛̋̑ į̤̳̗̳̲̯̩̗͒̆̀̐̀͘s̸̢̭̘̻̥̦̻̏̋͛̾̑̀ i̵̛̙̱̞͎̅̄̉̓̆̀̇̚͢͟ͅn̨̧̩̼̰͉̗͆̑͐̓̃͞t̴̨̝̖̭̩̥̑̀̌͊̌e̸͈̮̗͖̟͌̆̌́͌͂͌͟͢͝͠ņ̥̺͍̾͛̔͂̂͗̒̏̒͘͟͜ͅd̸̙̺̻̭̩̱͙̐́́̿̋ͅè̡͕̼̣̥͓͓̣̍̀̌̾͘̕͢d̸̢̦͎͚͇̓̽̒̾̚͠ f̵̧̩̜̠̪̭̖͕̎̉͋͑́͆̆͛͜͢ô̡̯͔̭̣̦̌̇́̀̊́͡͞ͅr̴̨̰͖̹͍͕̠͒̂́͒́̾͂́̇͝ ś̵̛̻̯̜̳̘̭͌̾͐̈́̒͆ṁ̸͎̲̹̱̻͇̯͇̬͐͛̉͛͞͡a̢̨̟͇̻̻͕͈͈̋́̀̒̕͜͠l̵͈̤̲̫̯͕̮͈̓̂͒̿̓͜͟ḷ̶̢̯̱͕̗͙̋͑͆͛̐̔̿͋ s̜̺̳͎̘͕̃̎́̏̏͞e̡̢̼̖̰͎̙̞̖̋̊͐͛͆̂͘͡r̴̢̧̛̭̣̞͈̹͚͇͋͊́̈́͑̇̕͞v̧̡̡̗͎̞͕̞͔̹̆̇͆̐͗̏̉̃̓̚ȉ͓̰̳̞̩͌͆̓͘͠c̟̘̤͉͕̭̺̃̀̄̿̄͊̑̉̾͢e̙̬̞̬͇̽̈͌̆͘s̷̨̛̖̘̼͓͙̣̣̾̀͂̊̇̌͜͠,̢͓̗̙̥̯̗̯͍̦̑͐̒̏̃̿͞ A̵̭̱̺͓͈̤̞̥̙̾̆̌̇͛̓̕͘͘͞P̢͚͉̩̜̫̑̽̏͐͛͡͡Ì̶̠̗̯͎͓̮̺̜͍̃̂͆̍͘s̶͉͚̻̜̃̐̅̍͊̾̋̕͟͞͞,̵̖͔̟͍̹̝̈́̾͒͛͌͐͋͆͜ ȁ̵̡̤̗͈͇̲͙̠͇̽͛͞͞ń̵̲̥͙͉̼̜̖̥͐̃̍͒͞d̵̨̰̜̟͈̖̠̝̮̈͒̾̾͠ s̸̨̩̹̥̥̼̫̃̏̑̎͗̇̔͌͢͝ͅͅc̷̢̧̳̻͇̣͆̍̾͛̇̾̿ͅř̴̮̭̮̯̟̄̄͒̅̀͐̅̈́̚i̧͍͖̹̗̪̳̍̿̂̏̓̍̉̎̕͜p̶̧̧̤̞̺͔͉̤̲̈̓͂̉̍̕͡͝t̶̨͕͎͉͙͙͋̓̈̃͘͞s̢̛̟̦̙͙̓̉̾̅͌̓́ w̶̢̢̢͓̩̱̩̙̰̽̓̽̃̇̉̈̎̅͜͞h̵͚̬̩̣̫̬͎͚̻̋͋̋̊͋̀̽̚͞͝e̴̢̬̤̮̦͌̀̋̌͋̇̕ṟ̨͔̦̬̟͋͒̂͋̕e̶̟̝̼͍̜͇̼͎̊̇̈́̀̿ ą̸̝̲̙̼͖̾́͂͊̚ ḟ̞͔̣̹̯͚̠͌̅̋͌̓͞͡ù̸͈̥͕̳͌̒̏̀͌͘̕͜ḽ̵̨͖͕͉̟̙̜́̋̇͐͗́͂̕l̴̮̣͉̞͒̇͛̎͘͞͠ͅ Ơ̴̧͙̤̺̝̈̃̒̾̇̇̚͡R̸̝͎̝̬͎̒͛͌͑͆̓̌̎͠M̵̨̢̨̟̯̻̥̾̿̀͗̂̋͘͞ i̸̛̙̘͉̟̭͇̙̖̺͔̔́̊͒̓͋š̡̯̦͙͓͂̉̽͠ͅ ú̸̳̞̥̭̜̰̺̄͂̌̓̾͢n̴͇̼͓͉͙̗̝̍̾̌̾͛̓́͆͝n̤̭̤͇̼͗̓̒̈́̉̓̓̕͜e̷͇̫͇͎̣͚̭͒̂̂̃̈́͊̊̕͜͝c̢̛̜̮̣̤̔͒̿̓͂̓̀̎͜ȇ̺̱̙̟͑͑͋͆̔́̀͟s̘̦͔̘͕̺͊̂̋̿̚s̭̺͓̿̑̀͑̈́͘͢ͅa̢̨̦͎͖͉͊́̑̈̊͜r̨̧͓̯͖͚̄͒̎̊̀̂̃͘͢͠y̸̨̧͖̩̙͇͛͋̊̐̓ͅ.̶̨͍͔̞͚͌̈̒́͑͒̉
̸̧̞̹̦̟̫̲̹͉̓̉̅̑̑̿͒͜
̤̹̖͎̥̜̯͔͛̍̇̌̋͗̓̀L̴̨̧͇̼̫̼̘͒̎́͒̿̆́̕̚í̷̜̪̖̜̠̲̤̬̐̐͐͌̌́͘͝c̶̨̣̥̦̳̣͎̱̼̲̀͆̄̾͑̄͑̄͞ĕ̵̫̘͎̼͍̱͖̜̓̔̑̌̉́́̚n̵̩̟̳̞͇̅̔͊̿̏̃͗͗̕s̸̘͇͖̰̫̥̗̤̼̉͊̔́͋͂ę̶̠̭̻͚̠̺̩̓͑̒̓̂͒̚
̧̤̤͈̲͕̻̻̪̓̋̽̀̊̓̋̚͘͜
̬̳̰̺̻̗̦͉̼̑̃̉̓̄͂́͠Ń̸̪͙̦͎̹̳̣̓̓̔̎͞o̦̫̥̠̮͕̗̎̿̉͑͡n̰̬̙͚̟͓̰̑̈̎͋̽̓͆ͅȩ͉͎͈͇͂͋͑͑͒
̶̡͍̖̭̮̺̼͌͛͊̈́̇̊́͛̚͢͟͠
.
."]
)
Read
const result = await db.query(
  "SELECT * FROM users"
)

console.log(result.rows)
Update
await db.query(
  "UPDATE users SET name=$1 WHERE id=$2",
  ["Set",1]
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

None
