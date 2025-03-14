import { defineConfig } from 'tsup';

export default defineConfig({
    format: ['cjs', 'esm'], // Generate both CommonJS and ES Modules
    entry: ['./index.ts', './eth_trust_manager.ts'], // Entry point(s)
    dts: true, // Generate TypeScript declaration files
    shims: true, // Inject shims for Node.js globals
    skipNodeModulesBundle: true, // Skip bundling node_modules
    clean: true, // Clean the output directory before building
    // external: ['multihashes-sync'], // Mark multihashes-sync as external
});
