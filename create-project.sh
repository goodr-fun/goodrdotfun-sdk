#!/bin/bash

# Create project directories
mkdir -p goodr-sdk/src
mkdir -p goodr-sdk/test
mkdir -p goodr-sdk/examples

# Move into project directory
cd goodr-sdk

# Initialize git
git init

# Create package.json
cat > package.json << 'EOF'
{
  "name": "goodr-sdk",
  "version": "0.1.0",
  "description": "SDK for goodr.fun",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rimraf dist",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  },
  "keywords": [
    "solana",
    "blockchain",
    "sdk",
    "goodr.fun"
  ],
  "author": "goodr.fun",
  "license": "MIT",
  "dependencies": {
    "@solana/web3.js": "^1.87.6",
    "@solana/spl-token": "^0.3.9",
    "bn.js": "^5.2.1"
  },
  "devDependencies": {
    "@types/bn.js": "^5.1.5",
    "@types/jest": "^29.5.11",
    "@types/node": "^20.10.5",
    "typescript": "^5.3.3",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "rimraf": "^5.0.5"
  }
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "test"]
}
EOF

# Create src/index.ts
cat > src/index.ts << 'EOF'
import { Connection, PublicKey } from '@solana/web3.js';

export class GoodrSDK {
  private connection: Connection;
  private programId: PublicKey;

  constructor(
    connection: Connection,
    programId: PublicKey
  ) {
    this.connection = connection;
    this.programId = programId;
  }

  // Add your SDK methods here
}

export * from './types';
EOF

# Create src/types.ts
cat > src/types.ts << 'EOF'
import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export interface GoodrConfig {
  connection: Connection;
  programId: PublicKey;
}

// Add your types here
EOF

# Create README.md
cat > README.md << 'EOF'
# Goodr SDK

JavaScript/TypeScript SDK for interacting with goodr.fun.

## Installation

```bash
npm install goodr-sdk
```

## Usage

```typescript
import { GoodrSDK } from 'goodr-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const programId = new PublicKey('YOUR_PROGRAM_ID');

const sdk = new GoodrSDK(connection, programId);
```

## License

MIT
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
.DS_Store
*.log
coverage/
EOF

# Create example test file
cat > test/sdk.test.ts << 'EOF'
import { GoodrSDK } from '../src';
import { Connection, PublicKey } from '@solana/web3.js';

describe('GoodrSDK', () => {
  it('should create SDK instance', () => {
    const connection = new Connection('http://localhost:8899');
    const programId = new PublicKey('11111111111111111111111111111111');
    const sdk = new GoodrSDK(connection, programId);
    expect(sdk).toBeDefined();
  });
});
EOF

# Create example usage file
cat > examples/basic-usage.ts << 'EOF'
import { GoodrSDK } from '../src';
import { Connection, PublicKey } from '@solana/web3.js';

async function main() {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const programId = new PublicKey('YOUR_PROGRAM_ID');
  
  const sdk = new GoodrSDK(connection, programId);
  
  // Add your example usage here
}

main().catch(console.error);
EOF

# Create jest.config.js
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
};
EOF

# Initialize npm
npm install

echo "Project created successfully!"
echo "To get started:"
echo "1. cd goodr-sdk"
echo "2. npm install"
echo "3. npm run build"