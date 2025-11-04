import { IncomingMessage, ClientRequest, ServerResponse } from "http";
import { RequestHandler } from "express";
import { createProxyMiddleware, responseInterceptor } from "http-proxy-middleware";
import { createGatewayJwt } from "./gateway-token";

/**
 * Build proxy middleware for a given target.
 */
export const buildProxy = (target: string): RequestHandler => {
  const opts = {
    target,
    changeOrigin: true,
    proxyTimeout: 15_000,
    timeout: 30_000,
    logLevel: "warn",

    onError: (err: any, req: IncomingMessage, res: ServerResponse) => {
      console.error("Proxy error:", err?.message ?? err, (req as any).url);
      if (!res.headersSent) {
        res.statusCode = 502;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ status: 502, message: "Bad Gateway" }));
      }
    },

    onProxyReq: (proxyReq: ClientRequest, req: IncomingMessage, res: ServerResponse) => {
      // create gateway jwt for secure service communication     
      createGatewayJwt(req, proxyReq);
    },

    onProxyRes: responseInterceptor(async (responseBuffer: Buffer) => {
      return responseBuffer;
    }),
  };

  return createProxyMiddleware(opts as any);
};
