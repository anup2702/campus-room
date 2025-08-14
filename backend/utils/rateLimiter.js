const rateLimitMap = new Map();

function rateLimiter(socketId, limit = 5, windowMs = 10000) {
  const now = Date.now();
  if (!rateLimitMap.has(socketId)) {
    rateLimitMap.set(socketId, []);
  }
  const timestamps = rateLimitMap.get(socketId).filter(ts => now - ts < windowMs);
  timestamps.push(now);
  rateLimitMap.set(socketId, timestamps);
  return timestamps.length <= limit;
}

module.exports = rateLimiter;
