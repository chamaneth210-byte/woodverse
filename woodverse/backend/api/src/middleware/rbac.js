export function authorizeRoles(...allowedRoles) {
  return (request, response, next) => {
    if (!request.user) {
      return response.status(401).json({ error: "Authentication required." });
    }
    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ error: "Insufficient permissions." });
    }
    next();
  };
}

export function isAdmin(request, response, next) {
  if (!request.user || request.user.role !== "admin") {
    return response.status(403).json({ error: "Admin access required." });
  }
  next();
}
