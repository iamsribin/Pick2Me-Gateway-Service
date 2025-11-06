import { ClientRequest, IncomingMessage } from "http";
import jwt from "jsonwebtoken";


export function createGatewayJwt(req: IncomingMessage, proxyReq: ClientRequest) {

  const headerValue = JSON.parse(req.headers["x-user-payload"] as string);
  const parsed = headerValue ? JSON.parse(headerValue) : null;

  // adding token for protected requests
  if (parsed && parsed.id && parsed.role) {
    try {
      // very short lived enough to survive transit
      const signed = jwt.sign(parsed, process.env.GATEWAY_SHARED_SECRET!, {
        algorithm: "HS256",
        expiresIn: "30s",
        issuer: "api-gateway",
      });      

      proxyReq.setHeader("x-gateway-jwt", signed);

    } catch (err) {
      console.warn("Invalid x-user-payload, skipping gateway jwt:", err);
    }
  }
}
