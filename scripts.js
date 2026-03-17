import schema from "./schema.json"
import table from "./types.json"
import * from "./workers.js"

import { validateSchema } from "./types"

const result = validateSchema(schema, table)

console.log(result)
