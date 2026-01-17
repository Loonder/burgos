const fs = require('fs');
const path = require('path');

const copyRecursiveSync = (src, dest, ignoreList = []) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (ignoreList.includes(path.basename(src))) return;

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(
                path.join(src, childItemName),
                path.join(dest, childItemName),
                ignoreList
            );
        });
    } else {
        fs.copyFileSync(src, dest);
    }
};

const ignore = ['node_modules', '.next', '.turbo', 'dist', 'coverage', '.git'];

console.log('🚀 Initiating SaaS Cloning...');

if (!fs.existsSync('apps/saas-web')) {
    console.log('📦 Cloning Web -> SaaS-Web...');
    copyRecursiveSync('apps/web', 'apps/saas-web', ignore);
} else {
    console.log('⚠️ apps/saas-web already exists. Skipping.');
}

if (!fs.existsSync('apps/saas-api')) {
    console.log('📦 Cloning API -> SaaS-API...');
    copyRecursiveSync('apps/api', 'apps/saas-api', ignore);
} else {
    console.log('⚠️ apps/saas-api already exists. Skipping.');
}

console.log('✅ Cloning complete! Now update package.json names.');
