const createRateLimit = (windowMs, max) => {
  const requests = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    let record = requests.get(key);
    if (!record || record.resetAt <= now) {
      record = { count: 0, resetAt: now + windowMs };
    }
    record.count += 1;
    requests.set(key, record);

    if (requests.size > 10000) {
      for (const [ip, entry] of requests) {
        if (entry.resetAt <= now) requests.delete(ip);
      }
    }

    if (record.count > max) {
      return res
        .status(429)
        .json({ success: false, message: "Too many requests. Try again later." });
    }
    return next();
  };
};

export default createRateLimit;
