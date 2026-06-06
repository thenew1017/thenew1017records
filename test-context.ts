import { createMiddleware, createServerFn } from '@tanstack/react-start';

const myMiddleware = createMiddleware({ type: 'function' })
  .server(async ({ next }) => {
    return next({
      context: {
        userId: '123',
        userEmail: 'test@test.com'
      }
    });
  });

const myFunction = createServerFn({ method: 'GET' })
  .middleware([myMiddleware])
  .handler(async ({ context }) => {
    console.log("CONTEXT INSIDE HANDLER:", context);
    return { ok: true };
  });

myFunction().then(console.log).catch(console.error);
