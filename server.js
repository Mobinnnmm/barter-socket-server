require('dotenv').config();
const { createServer } = require("http");
const { initializeSocketServer } = require("./socketServer");

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
        process.exit(1);
    }
}

console.log("📋 Loading environment variables...");
startServer();  