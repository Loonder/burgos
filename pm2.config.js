module.exports = {
    apps: [
        {
            name: 'burgos-api',
            cwd: './apps/api',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3001
            }
        },
        {
            name: 'burgos-web',
            cwd: './apps/web',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        }
    ]
};
