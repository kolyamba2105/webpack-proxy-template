module.exports = function (api) {
  const development = api.cache(() => process.env.NODE_ENV === "development");

  return {
    presets: [
      ["@babel/preset-env", { useBuiltIns: "usage", corejs: "3.30.1" }],
      ["@babel/preset-react", { development, runtime: "automatic" }],
      ["@babel/preset-typescript"],
    ],
    ...(development && { plugins: ["react-refresh/babel"] }),
  };
};
