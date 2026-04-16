import type { Request, RequestHandler } from "express";
import type { ZodType } from "zod";

type RequestSchema = ZodType<{
  body?: unknown;
  params?: unknown;
  query?: unknown;
}>;

export const validateRequest = <T extends RequestSchema>(schema: T): RequestHandler => {
  return (request, _response, next) => {
    const parsedRequest = schema.safeParse({
      body: request.body,
      params: request.params,
      query: request.query,
    });

    if (!parsedRequest.success) {
      next(parsedRequest.error);
      return;
    }

    request.body = parsedRequest.data.body ?? request.body;
    request.params = (parsedRequest.data.params ?? request.params) as Request["params"];

    Object.defineProperty(request, "query", {
      value: (parsedRequest.data.query ?? request.query) as Request["query"],
      writable: true,
      enumerable: true,
      configurable: true,
    });

    next();
  };
};
