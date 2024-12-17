declare module 'node-fetch' {
    export default function fetch(url: string | URL | Request, init?: RequestInit): Promise<Response>;
} 