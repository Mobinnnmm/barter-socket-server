require('dotenv').config();
const { createServer } = require("http");
const { initializeSocketServer } = require("./socketServer");
const path = require('path');

// Add environment debugging
console.log("📊 Environment Information:");
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- Current directory: ${process.cwd()}`);
console.log(`- Available files: ${require('fs').readdirSync('.').join(', ')}`);
console.log(`- MONGODB_URI exists: ${!!process.env.MONGODB_URI}`);
console.log(`- CLIENT_URL: ${process.env.CLIENT_URL}`);

async function startServer() {
    console.log("🚀 Starting server initialization...");
    
    try {
        console.log("📡 Creating HTTP server...");
        const httpServer = createServer();
        
        console.log("🔌 Initializing Socket.IO server...");
        const io = await initializeSocketServer(httpServer);
        
        const PORT = process.env.PORT || 3000;

        httpServer.listen(PORT, () => {
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log(`🌟 Server is running on port ${PORT}`);
            console.log(`📱 Client URL: ${process.env.CLIENT_URL}`);
            console.log("🔄 Waiting for Socket.IO connections...");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        });

    } catch (error) {
        console.error("❌ Failed to start the server:", error);
        console.error("Error details:", error.stack);
        process.exit(1);
    }
}

console.log("📋 Loading environment variables...");
startServer();  