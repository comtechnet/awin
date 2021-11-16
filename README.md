# awin-monorepo

AWIN DAO is an experiment.  All Works In NFTs - an experiment to create a new Copyright system, DeCompose for Community Contributors as well as Creators.  Generative avatar/meme art element/components are contemplated to be a Community Member contribution adding to a Creators base media "offering".

A DAO and NFT "set" of core services are contemplated for this sevice / along with the respective UIs (Web, mobile voice, etc.)

## Contributing

If you're interested in contributing to AWIN DAO repos we're excited to have you. Please discuss any changes in `#developers` in [discord.gg/nouns](https://discord.gg/awin) prior to contributing to reduce duplication of effort and in case there is any prior art that may be useful to you.

## Packages

### awin-api

The [awin api](packages/awin-api) is an HTTP webserver that hosts token metadata. This is currently unused because on-chain, data URIs are enabled.  However - as an experiment - we are looking at creative possibilites for Community Contributors along with Original Creator of "All Works".

### awin-assets

The [awin assets](packages/awin-assets) package holds the Noun PNG and run-length encoded image data.

### awin-bots

The [awin bots](packages/awin-bots) package contains a bot that monitors for changes in AWIN auction state and notifies everyone via Twitter and Discord.

### awin-contracts

The [awin contracts](packages/awin-contracts) is the suite of Solidity contracts powering AWIN DAO.

### awin-sdk

The [nouns sdk](packages/nouns-sdk) exposes the Nouns contract addresses, ABIs, and instances as well as image encoding and SVG building utilities.

### awin-subgraph

In order to make retrieving more complex data from the auction history, [awins subgraph](packages/awins-subgraph) contains subgraph manifests that are deployed onto [The Graph](https://thegraph.com).

### awin-webapp

The [awin webapp](packages/awin-webapp) is the frontend for interacting with AWIN auctions as hosted at [awin.xxx](https://awin.xxx).

## Quickstart

### Install dependencies

```sh
yarn
```

### Build all packages

```sh
yarn build
```

### Run Linter

```sh
yarn lint
```

### Run Prettier

```sh
yarn format
```
