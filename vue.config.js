module.exports = {
    devServer: {
        proxy: {
            '/send_sms': {
                target: 'http://localhost:5000', // Redirect requests to this target server
                changeOrigin: true // Changes the origin of the request to the target URL
            }
        }
    }
}
