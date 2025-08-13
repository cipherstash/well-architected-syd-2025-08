import { protectDynamoDB } from "@cipherstash/protect-dynamodb";
import { protect, csColumn, csTable } from "@cipherstash/protect";
import { PutCommand, GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// Define your protected table schema
const users = csTable("users", {
  email: csColumn("email").equality(),
});

// Initialize the Protect client
const protectClient = await protect({
  schemas: [users],
});

// Create the DynamoDB helper instance
const protectDynamo = protectDynamoDB({
  protectClient,
});

// Encrypt and store a user
const user = {
  email: "user@example.com",
};

const encryptResult = await protectDynamo.encryptModel(user, users);
if (encryptResult.failure) {
  throw new Error(`Failed to encrypt user: ${encryptResult.failure.message}`);
}

// Setup a DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

console.log(encryptResult.data);

// Store in DynamoDB
const put = new PutCommand({
  TableName: users.tableName,
  Item: encryptResult.data,
});
console.log(put);
await docClient.send(put);

process.exit(0);

// Create search terms for querying
const searchTermsResult = await protectDynamo.createSearchTerms([
  {
    value: "user@example.com",
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
