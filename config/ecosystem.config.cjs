module.exports = {
    apps: [
        {
            name: "production",
            script: "./dist/server.js",
            watch: ["./dist"],
            env: {
                NODE_ENV: "production",
                REMOTE: "enabled",
            },
        },
        {
            name: "development",
            script: "./dist/server.js",
            watch: ["./dist"],
            env: {
                NODE_ENV: "development",
                REMOTE: "enabled",
            },
        },
    ],
};
