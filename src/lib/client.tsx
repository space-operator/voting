import { Client, WsClient } from '@space-operator/client';

export const restClient = new Client({
  // host: 'http://localhost:8080',
  // host: 'https://dev-api.spaceoperator.com',
  host: process.env.NEXT_PUBLIC_SUPABASE_URL,
});

export const wsClient = new WsClient({
  // url: 'ws://localhost:8080/ws',
  // url: 'wss://dev-api.spaceoperator.com/ws',
  url: process.env.NEXT_PUBLIC_SUPABASE_WS,
});
wsClient.setLogger(console.log);
