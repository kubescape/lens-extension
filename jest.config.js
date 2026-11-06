module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testMatch: ["<rootDir>/tests/**/*.test.ts", "<rootDir>/tests/**/*.test.tsx"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  moduleNameMapper: {
    "^@k8slens/extensions$": "<rootDir>/tests/lens.js",
    "\\.scss$": "<rootDir>/tests/style.js",
  },
  clearMocks: true,
  restoreMocks: true,
};
