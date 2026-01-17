const net = require('net');

const ports = [3000, 3001, 3002, 3003];

ports.forEach(port => {
    const client = new net.Socket();
    client.setTimeout(2000);

    client.on('connect', () => {
        console.log(`✅ Port ${port} is open.`);
        client.destroy();
    });

    client.on('timeout', () => {
        console.log(`❌ Port ${port} timed out.`);
        client.destroy();
    });

    client.on('error', (err) => {
        console.log(`❌ Port ${port} error: ${err.message}`);
    });

    client.connect(port, '127.0.0.1');
});
