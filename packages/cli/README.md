# Fractal Puzzle CLI

## Install dependencies

```bash
bun install
```

## Set the environment variables

Copy the `.env.example` file to `.env` and set the environment variables.

```
PRIVATE_KEY=<your private key>
UNISAT_BASE_URL=https://open-api-fractal.unisat.io # mainnet
# UNISAT_BASE_URL=https://open-api-fractal-testnet.unisat.io # testnet
UNISAT_API_KEY=<your unisat api key>
```

## Deploy the contract

You can deploy the contract by running the following command (in the project root directory):

```console
$ bun cli deploy
> Enter your secret(4 characters minimum): <hello>
> Enter amount(> 546 satoshis): <1000>
> Transaction ID: <txid>
> Transaction Hex: <txHex>
> Broadcast now? (y/N): y
> Broadcasted: <txid>
```

## Solve the puzzle and get the reward

You can solve the puzzle and get the reward by running the following command (in the project root directory):

```console
$ bun cli solve
> Enter your secret(4 characters minimum): <hello>
> Enter your utxo address: <utxo address>
> Broadcast now? (y/N): y
> Broadcasted: <txid>
```
