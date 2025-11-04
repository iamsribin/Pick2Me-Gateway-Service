import { Request, Response, RequestHandler } from "express";
import {
  createProxyMiddleware,
  responseInterceptor,
  Options,
} from "http-proxy-middleware";
import { IncomingMessage } from "http";
import type { ClientRequest } from "http";

// Build proxy middleware for a given target.
export const buildProxy = (target: string): RequestHandler => {
  const opts = {
    target,
    changeOrigin: true,
    proxyTimeout: 15_000,
    timeout: 30_000,
    logLevel: "warn",

    //error event handlers
    onError: (err: any, req: Request, res: Response) => {
      console.error("Proxy error:", err?.message ?? err, req.method, req.url);

      if (!res.headersSent) {
        res.status(502).json({ status: 502, message: "Bad Gateway" });
      }
    },

    // req event handlers
    onProxyReq: (proxyReq: ClientRequest, req: Request, res: Response) => {
    },

    // res event handlers
    onProxyRes: responseInterceptor(
      async (
        responseBuffer: Buffer,
        proxyRes: IncomingMessage,
        req: Request,
        res: Response
      ) => {
        return responseBuffer;
      }
    ),
  };

  return createProxyMiddleware(opts as any);
};
