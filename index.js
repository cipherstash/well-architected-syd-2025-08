import { protectDynamoDB } from "@cipherstash/protect-dynamodb";
import { protect, csColumn, csTable } from "@cipherstash/protect";
import { PutCommand, GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";

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
const exampleUsers = [
  { email: "alice@example.com" },
  { email: "bob@company.org" },
  { email: "carol@tech.io" },
  { email: "david@startup.com" },
  { email: "eve@university.edu" },
  { email: "frank@consulting.biz" },
  { email: "grace@design.studio" },
  { email: "henry@finance.net" },
  { email: "ivy@marketing.agency" },
  { email: "jack@development.dev" },
  { email: "lea@ux.design" },
  { email: "joe@backend.systems" },
  { email: "ivy@frontend.ui" },
  { email: "max@devops.cloud" },
  { email: "ava@ml.algorithms" },
  { email: "jim@database.admin" },
  { email: "eva@api.gateway" },
  { email: "leo@microservices.arch" },
  { email: "nora@blockchain.crypto" },
  { email: "owen@quantum.computing" },
  { email: "sara@edge.computing" },
  { email: "will@serverless.lambda" },
  /*
  { email: "tina@container.docker" },
  { email: "gary@kubernetes.cluster" },
  { email: "lara@monitoring.observability" },
  { email: "kyle@logging.metrics" },
  { email: "nina@testing.qa" },
  { email: "dean@automation.ci" },
  { email: "rosa@deployment.cd" },
  { email: "felix@infrastructure.iac" },
  { email: "gina@networking.vpc" },
  { email: "noah@storage.s3" },
  { email: "vera@cdn.cloudfront" },
  { email: "security@compliance.audit" },
  { email: "pete@backup.recovery" },
  { email: "cora@scaling.performance" },
  { email: "jake@optimization.speed" },
  { email: "luna@cache.redis" },
  */
];

const encryptResult = await protectDynamo.bulkEncryptModels(exampleUsers, users);
if (encryptResult.failure) {
  throw new Error(`Failed to encrypt user: ${encryptResult.failure.message}`);
}

const items = {
  RequestItems: {
    users: encryptResult.data.map((i) => {
      return {
        PutRequest: {
          Item: { email__hmac: { S: i.email__hmac }, email__source: { S: i.email__source } },
        },
      };
    }),
  },
};

// Setup a DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

console.log(encryptResult.data);
console.log(items);

// Store in DynamoDB
const batchWrite = new BatchWriteItemCommand(items);
await docClient.send(batchWrite);

// Create search terms for querying
const searchTermsResult = await protectDynamo.createSearchTerms([
  {
    value: exampleUsers[Math.floor(Math.random() * exampleUsers.length)].email,
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
