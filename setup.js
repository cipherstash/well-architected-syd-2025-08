import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand,
  DeleteTableCommand,
  BillingMode,
} from "@aws-sdk/client-dynamodb";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const tableName = "users";

// Setup a DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// delete the table if it exists
var listTablesCommandResponse = await docClient.send(new ListTablesCommand({}));
console.log("tables", listTablesCommandResponse.TableNames);

if (listTablesCommandResponse.TableNames.includes(tableName)) {
  const deleteTableCommandResponse = await docClient.send(
    new DeleteTableCommand({ TableName: tableName })
  );

  do {
    console.log(`checking if table ${tableName} deleted...`);
    listTablesCommandResponse = await docClient.send(new ListTablesCommand({}));
    await sleep(500);
  } while (listTablesCommandResponse.TableNames.includes(tableName));
  console.log(`table deleted: ${tableName}`);
}

console.log(`creating table: ${tableName}`);
// Create DynamoDB table
const createTableCommandResponse = await docClient.send(
  new CreateTableCommand({
    TableName: tableName,
    // This example performs a large write to the database.
    // Set the billing mode to PAY_PER_REQUEST to
    // avoid throttling the large write.
    BillingMode: BillingMode.PAY_PER_REQUEST,
    // Define the attributes that are necessary for the key schema.
    AttributeDefinitions: [
      /*
      {
        AttributeName: "year",
        // 'N' is a data type descriptor that represents a number type.
        // For a list of all data type descriptors, see the following link.
        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html#Programming.LowLevelAPI.DataTypeDescriptors
        AttributeType: "N",
      },
      */
      { AttributeName: "email__hmac", AttributeType: "S" },
      //{ AttributeName: "email__source", AttributeType: "S" },
    ],
    // The KeySchema defines the primary key. The primary key can be
    // a partition key, or a combination of a partition key and a sort key.
    // Key schema design is important. For more info, see
    // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html
    KeySchema: [
      // The way your data is accessed determines how you structure your keys.
      // The movies table will be queried for movies by year. It makes sense
      // to make year our partition (HASH) key.
      //{ AttributeName: "year", KeyType: "HASH" },
      { AttributeName: "email__hmac", KeyType: "HASH" },
    ],
  })
);

// wait for the damn table to be created in dynamo
do {
  console.log(`checking if table ${tableName} created...`);
  listTablesCommandResponse = await docClient.send(new ListTablesCommand({}));
  await sleep(500);
} while (!listTablesCommandResponse.TableNames.includes(tableName));
console.log(`table created: ${tableName}`);
