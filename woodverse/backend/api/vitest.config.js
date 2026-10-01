import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // The API suites share a single PostgreSQL database: each file truncates and
    // reseeds the same tables in beforeAll. Running files in parallel made one file's
    // TRUNCATE block on another file's open transaction, so the files must be serial.
    fileParallelism: false,
    // bcrypt at the production cost of 12 plus a full HTTP round trip is slower than
    // the 5s default on a loaded machine.
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
