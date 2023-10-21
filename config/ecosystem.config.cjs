module.exports = {
  apps: [
    {
      name: "production",
      script: "./dist/server.js",
      watch: ["./dist"],
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "development",
      script: "./dist/server.js",
      watch: ["./dist"],
      env: {
        NODE_ENV: "remoteDevelopment"
      }
    }
  ]
}