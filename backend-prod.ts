// This file is made to expose the frontend code

import Bun, { BunRequest } from 'bun';
import { existsSync } from 'fs';
import path from 'path';

Bun.serve({
    routes: {
        '/': () => {
            return Response.redirect('/workspaces');
        },
        '/*': (req: BunRequest) => {
            const url = new URL(req.url);
            if (existsSync(path.join(__dirname, 'dist', url.pathname)))
                return new Response(Bun.file(path.join(__dirname, 'dist', url.pathname)))
            else
                return new Response(Bun.file(path.join(__dirname, 'dist', 'index.html')))
        }
    },
    port: 3000
});