const os = require('os');
const interfaces = os.networkInterfaces();
let ipAddress = null;

for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
        if (interface.family === 'IPv4' && !interface.internal) {
            ipAddress = interface.address;
            break;
        }
    }
    if (ipAddress) break;
}

if (ipAddress) {
    console.log(`\x1b[36mready\x1b[0m - Network URL: \x1b[32mhttp://${ipAddress}:3000\x1b[0m`);
}
