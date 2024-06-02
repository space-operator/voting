## Intro

Voter UI for SPL Governance using Space Operator


## Getting Started

Using Next.js 14 with App Router, Tailwind CSS, and shadcn/ui

```bash
npm install
npm run dev
```

## Space Operator Instance

Use the below documentation to setup your Space Operator instance

https://docs.spaceoperator.com/self-hosting/docker-compose
or 
https://docs.spaceoperator.com/self-hosting/lightsail-instance



## Environment Variables

### RPC ENDPOINTS
NEXT_PUBLIC_HELIUS_MAINNET
NEXT_PUBLIC_HELIUS_DEVNET

### FLOW INSTANCE AND DB
NEXT_PUBLIC_FLOW_INSTANCE_URL
NEXT_PUBLIC_FLOW_INSTANCE_WS
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

### FLOWS
NEXT_PUBLIC_FLOW_ID_MESSAGE
NEXT_PUBLIC_FLOW_ID_VOTE
NEXT_PUBLIC_FLOW_ID_RELINQUISH

