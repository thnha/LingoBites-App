declare global {
  var fetch: typeof globalThis.fetch;
  var crypto: {
    randomUUID: () => string;
  };
}

// Bundled image assets resolve to a numeric resource ID via Metro.
declare module '*.png' {
  const value: number;
  export default value;
}
export {};
