import type { RequestHandler } from "express";

export interface CorsOptions {
  origin?:
    | boolean
    | string
    | RegExp
    | Array<string | RegExp>
    | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  credentials?: boolean;
}

declare module "cors" {
  function cors(options?: CorsOptions): RequestHandler;
  export default cors;
}

