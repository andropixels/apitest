const app = require("./app");
const connectDatabase = require("./config/database");
const cloudinary = require("cloudinary");

// Add colorful console logging
const consoleStyle = {
  success: '\x1b[32m%s\x1b[0m',  // Green
  info: '\x1b[36m%s\x1b[0m',     // Cyan
  error: '\x1b[31m%s\x1b[0m'     // Red
};

const PORT = process.env.PORT || 4099;

// UncaughtException Error
process.on("uncaughtException", (err) => {
  console.log(consoleStyle.error, `Error: ${err.message}`);
  process.exit(1);
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(PORT, () => {
  console.log(consoleStyle.success, '🚀 Server Started Successfully!');
  console.log(consoleStyle.info, `🌐 Server is running on http://localhost:${PORT}`);
  console.log(consoleStyle.info, `📡 API endpoint: http://localhost:${PORT}/api/niteshapitest`);
  console.log(consoleStyle.info, '👀 Waiting for API requests...\n');
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(consoleStyle.info, `\n📥 New Request: ${req.method} ${req.url}`);
  next();
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(consoleStyle.error, `Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});