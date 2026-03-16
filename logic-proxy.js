const http = require('http');
const httpProxy = require('http-proxy');

// Create the proxy server
const proxy = httpProxy.createProxyServer({});

// Define our backend instances
const BACKENDS = [
    { name: 'Alpha', host: 'localhost', port: 5001 },
    { name: 'Beta', host: 'localhost', port: 5002 }
];

let currentIdx = 0;

const server = http.createServer((req, res) => {
    // 1. Basic Stickiness for Socket.io (Handshake must stay on same server)
    const url = new URL(req.url, `http://${req.headers.host}`);
    const sid = url.searchParams.get('sid');
    
    let target;
    if (sid) {
        // If we have an SID, we use it to 'stick' the user to a specific backend
        // This is a simple hash-like logic: even SIDs go to Alpha, odd to Beta
        const sidNumber = sid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        target = BACKENDS[sidNumber % BACKENDS.length];
        console.log(`🔗 [Sticky Session] Routing SID ${sid.substring(0, 5)}... to ${target.name} (${target.port})`);
    } else {
        // 2. Standard Round-Robin for REST API
        target = BACKENDS[currentIdx];
        currentIdx = (currentIdx + 1) % BACKENDS.length;
        console.log(`🔀 [Round Robin] Routing to ${target.name} (${target.port}): ${req.method} ${req.url}`);
    }

    // 3. Forward the request with Failover
    function attemptForward(targetIdx, retries) {
        const potentialTarget = BACKENDS[targetIdx];
        
        proxy.web(req, res, { target: `http://${potentialTarget.host}:${potentialTarget.port}` }, (err) => {
            console.error(`⚠️ [Proxy Error] ${potentialTarget.name} (${potentialTarget.port}) is offline.`);
            
            if (retries > 0) {
                const nextIdx = (targetIdx + 1) % BACKENDS.length;
                console.log(`🔄 [Failover] Retrying with ${BACKENDS[nextIdx].name}...`);
                attemptForward(nextIdx, retries - 1);
            } else {
                res.writeHead(502);
                res.end('Deployment Error: No backend instances available.');
            }
        });
    }

    const initialIdx = BACKENDS.indexOf(target);
    attemptForward(initialIdx, BACKENDS.length - 1);
});

const PROXY_PORT = 5000;
server.listen(PROXY_PORT, () => {
    console.log(`🚀 [Logic Proxy] Production-Grade Load Balancer running on http://localhost:${PROXY_PORT}`);
    console.log(`📡 Failover Protection Enabled for: ${BACKENDS.map(b => b.name).join(', ')}`);
});
