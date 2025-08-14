# Well Architected Sydney Demo

Demo for Well Architected Sydney meetup on August 14, 2025.

This project demonstrates encrypted data storage and querying with [CipherStash Protect.js](https://github.com/cipherstash/protectjs/blob/main/packages/protect-dynamodb/README.md) and Amazon DynamoDB.

## Prerequisites

- Node.js
- AWS credentials configured for DynamoDB access
- [CipherStash account](https://cipherstash.com/signup)

## Installation

```bash
npm install
```

## Running the Demo

### Quick Start

Run the complete demo pipeline:

```bash
SETUP=true npm run dev
```

This will:
1. Set up DynamoDB tables (if `SETUP` environment variable is set)
2. Insert encrypted user data into the database
3. Run query examples

### Individual Commands

**Setup DynamoDB tables:**
```bash
npm run setup
```

**Insert encrypted user data:**
```bash
npm run insert
```

**Query encrypted data:**
```bash
npm run query
```

**Query with specific email:**
```bash
node index.js alice@example.com
```

**Format code:**
```bash
npm run format
```

## What This Demo Shows

- Encrypting user data with CipherStash Protect
- Storing encrypted data in DynamoDB
- Querying encrypted data while maintaining searchability
- Decrypting results for application use

## License

MIT
