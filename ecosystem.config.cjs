require('dotenv').config();

const port = process.env.PORT || 5173;

module.exports = {
    apps: [
        {
            name: "fpga-linux-lect",
            script: "./node_modules/serve/build/main.js",
            env: {
                PM2_SERVE_PATH: '.',
                PM2_SERVE_PORT: port,
                PM2_SERVE_SPA: 'true',
                PM2_SERVE_HOMEPAGE: '/index.html'
            },
            args: `-s dist -l ${port}`,
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "1G"
        }
    ]
};

