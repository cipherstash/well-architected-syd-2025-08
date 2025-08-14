import { protectDynamoDB } from "@cipherstash/protect-dynamodb";
import { protect, csColumn, csTable } from "@cipherstash/protect";
import { PutCommand, GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";

// Define your protected table schema
export const users = csTable("users", {
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
export const exampleUsers = [
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
  { email: "tina@container.docker" },
  { email: "gary@kubernetes.cluster" },
  { email: "lara@monitoring.observability" },
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
