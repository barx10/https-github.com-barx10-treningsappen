/**
 * Small helpers shared by the serverless API routes.
 */

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

/**
 * Sets CORS headers and answers preflight/wrong-method requests.
 * Returns true if the request is already handled and the route should return.
 */
export const handleCors = (req, res, methods = ['POST']) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', [...methods, 'OPTIONS'].join(', '));
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }

  if (!methods.includes(req.method)) {
    res.status(405).json({ error: 'Method not allowed' });
    return true;
  }

  return false;
};

/**
 * Turns a thrown error into a response the client can show the user.
 */
export const sendError = (res, status, error, cause) => {
  console.error(error, cause);
  res.status(status).json({
    error,
    details: cause instanceof Error ? cause.message : cause ? String(cause) : undefined,
  });
};
