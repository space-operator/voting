## Intro

Voter UI for SPL Governance using Space Operator

## Getting Started

Using Next.js 14 with App Router, Tailwind CSS, and shadcn/ui

```bash
npm install
npm run dev
```

Bundle Analyzer

```bash
ANALYZE=true npm run build
```

## Space Operator Instance

You can use your APIKEY and the [spaceoperator.com](https://spaceoperator.com) instance or set your own dedicated instance.

Use the below documentation to setup your Space Operator instance

https://docs.spaceoperator.com/self-hosting/docker-compose\
or \
https://docs.spaceoperator.com/self-hosting/lightsail-instance


## Environment Variables

#### RPC ENDPOINTS

NEXT_PUBLIC_HELIUS_MAINNET\
NEXT_PUBLIC_HELIUS_DEVNET\

#### FLOW INSTANCE AND DB

NEXT_PUBLIC_FLOW_INSTANCE_URL\
NEXT_PUBLIC_FLOW_INSTANCE_WS\
NEXT_PUBLIC_SUPABASE_URL\
NEXT_PUBLIC_SUPABASE_ANON_KEY\

#### FLOWS

NEXT_PUBLIC_FLOW_ID_MESSAGE\
NEXT_PUBLIC_FLOW_ID_VOTE\
NEXT_PUBLIC_FLOW_ID_RELINQUISH\


## Cluster Selection

Defaults to Mainnet\
http://localhost:3000/realm/ExJuzuE1wZbjFzQD1SMo47YrRtwA7NRHZzRLQF9EJ4b6

For Devnet add /devnet/ before the realm id
http://localhost:3000/realm/devnet/ExJuzuE1wZbjFzQD1SMo47YrRtwA7NRHZzRLQF9EJ4b6



## Running a Flow

#### Hook to access flow actions and events

```typescript
const { logs, startFlow, errors, flowRunningState } = useFlowEvents();
```

#### Calling a flow

```typescript
try {
    const flowId = parseInt(process.env.NEXT_PUBLIC_FLOW_ID_VOTE);

    // input structure should match your flow input nodes
    const inputBody = new Value({
    private_key: 'WALLET_ADAPTER', // will be replaced and signed by wallet
    realm: realm.pubkey,
    governance: proposal.account.governance,

    // ...add rest of the inputs
    }).M;

    console.log('inputBody', inputBody);

    await startFlow(flowId, prepFlowInputs(inputBody, wallet.publicKey));
} catch (e) {
    console.error(e);
}
```
