import { protectDynamoDB } from "@cipherstash/protect-dynamodb";
import { protect, csColumn, csTable } from "@cipherstash/protect";
import { PutCommand, GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { users, exampleUsers } from "./insert.js";

// Initialize the Protect client
const protectClient = await protect({
  schemas: [users],
});

// Create the DynamoDB helper instance
const protectDynamo = protectDynamoDB({
  protectClient,
});

// Get email from command line argument or use random
const email =
  process.argv[2] || exampleUsers[Math.floor(Math.random() * exampleUsers.length)].email;

// Setup a DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Create search terms for querying
const searchTermsResult = await protectDynamo.createSearchTerms([
  {
    value: email,
    column: users.email,
    table: users,
  },
]);
console.log("searchtermsresult", searchTermsResult);

if (searchTermsResult.failure) {
  throw new Error(`Failed to create search terms: ${searchTermsResult.failure.message}`);
}

// Query using the search term
const getCommand = new GetCommand({
  TableName: users.tableName,
  Key: {
    email__hmac: searchTermsResult.data[0],
  },
});
console.log(getCommand);
const result = await docClient.send(getCommand);

if (!result.Item) {
  throw new Error("Item not found");
}

// Decrypt the result
const decryptResult = await protectDynamo.decryptModel(result.Item, users);

if (decryptResult.failure) {
  throw new Error(`Failed to decrypt user: ${decryptResult.failure.message}`);
}

const decryptedUser = decryptResult.data;
console.log("decryptedUser", decryptedUser);
