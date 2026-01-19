module.exports = {
    apps: [
        {
            name: "fpga-linux-lect",
            script: "serve",
            env: {
                PM2_SERVE_PATH: '.',
                PM2_SERVE_PORT: 5173,
                PM2_SERVE_SPA: 'true',
                PM2_SERVE_HOMEPAGE: '/index.html'
            },
            // Using the 'server' package command usually implies invoking the binary.
            // However, a more robust way with 'serve' package is:
            script: "./node_modules/serve/build/main.js",
            args: "-s dist -l 5173",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "1G"
        }
    ]
};
