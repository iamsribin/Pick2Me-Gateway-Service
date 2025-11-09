import { IncomingMessage, ClientRequest, ServerResponse } from "http";
import { RequestHandler } from "express";
import { createProxyMiddleware, responseInterceptor } from "http-proxy-middleware";
import { createGatewayJwt } from "../security-service/gateway-token";


/**
 * Build proxy middleware for a given target.
 */
export const buildProxy = (target: string, isPathRewrite?:string): RequestHandler => {

  const opts = {
    target,
    changeOrigin: true,
    proxyTimeout: 15_000,
    timeout: 30_000,
    logLevel: "warn",
    pathRewrite:(path: string) => {
      if(isPathRewrite){
        return isPathRewrite+path
      }
    },
    onError: (err: any, req: IncomingMessage, res: ServerResponse) => {
      console.error("Proxy error:", err?.message ?? err, (req as any).url);
      if (!res.headersSent) {
        res.statusCode = 502;
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ status: 502, message: "Bad Gateway" }));
      }
    },

    onProxyReq: (proxyReq: ClientRequest, req: IncomingMessage) => { createGatewayJwt(req, proxyReq); },
    onProxyRes: responseInterceptor(async (responseBuffer: Buffer) => responseBuffer),

  };

  return createProxyMiddleware(opts as any);
};
