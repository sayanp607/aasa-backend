module.exports = {
  apps: [
    {
      name: 'Alpha',
      script: 'server.js',
      env: {
        PORT: 5001,
        INSTANCE_ID: 'Alpha',
        NODE_ENV: 'production'
      }
    },
    {
      name: 'Beta',
      script: 'server.js',
      env: {
        PORT: 5002,
        INSTANCE_ID: 'Beta',
        NODE_ENV: 'production'
      }
    },
    {
      name: 'Proxy',
      script: 'logic-proxy.js',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
