import { Client, WsClient } from '@space-operator/client';

export const restClient = new Client({
  host: process.env.NEXT_PUBLIC_FLOW_INSTANCE_URL,
});
export const wsClient = new WsClient({
  url: process.env.NEXT_PUBLIC_FLOW_INSTANCE_WS,
});
wsClient.setLogger(console.log);
