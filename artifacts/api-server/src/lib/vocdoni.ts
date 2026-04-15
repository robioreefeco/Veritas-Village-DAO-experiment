import {
  VocdoniSDKClient,
  EnvOptions,
  PlainCensus,
  Election,
  CspCensus,
  CspProofType,
} from "@vocdoni/sdk";
import { ethers } from "ethers";
import { createPublicClient, http, formatEther } from "viem";

const RSK_TESTNET_RPC = "https://public-node.testnet.rsk.co";
const CELO_ALFAJORES_RPC = "https://alfajores-forno.celo-testnet.org";

function getOrganizerWallet(): ethers.Wallet {
  const pk = process.env.VOCDONI_ORGANIZER_PRIVATE_KEY;
  if (!pk) throw new Error("VOCDONI_ORGANIZER_PRIVATE_KEY not set");
  return new ethers.Wallet(pk);
}

function getVocdoniEnv(): EnvOptions {
  const env = process.env.VOCDONI_ENV || "dev";
  return env === "stg" ? EnvOptions.STG : env === "prod" ? EnvOptions.PROD : EnvOptions.DEV;
}

function getCspPublicKey(): string {
  const pk = process.env.VOCDONI_ORGANIZER_PRIVATE_KEY;
  if (!pk) throw new Error("VOCDONI_ORGANIZER_PRIVATE_KEY not set");
  return ethers.utils.computePublicKey(pk, true).slice(2); // remove 0x prefix
}

function getBackendUrl(): string {
  const domain = process.env.REPLIT_DEV_DOMAIN;
  if (domain) return `https://${domain}/api/vocdoni`;
  return `http://localhost:${process.env.PORT || 3001}/api/vocdoni`;
}

export async function createVocdoniElection(opts: {
  title: string;
  description: string;
  endsAt: Date;
}): Promise<string> {
  const wallet = getOrganizerWallet();
  const env = getVocdoniEnv();

  const client = new VocdoniSDKClient({ env, wallet });

  // createAccount() fetches DEV faucet tokens automatically and is a no-op if already registered
  await client.createAccount();

  const cspUri = getBackendUrl();
  const cspPubKey = getCspPublicKey();

  const census = new CspCensus(cspPubKey, cspUri);

  const election = Election.from({
    title: opts.title,
    description: opts.description,
    census,
    startDate: new Date(),
    endDate: opts.endsAt,
    maxCensusSize: 1000,
    voteType: { maxVoteOverwrites: 1 },
  });

  const electionId = await client.createElection(election);
  return electionId;
}

export async function signCspProof(opts: {
  electionId: string;
  voterAddress: string;
}): Promise<string> {
  const wallet = getOrganizerWallet();
  // Vocdoni CSP ECDSA: sign the voter address bytes (standard Ethereum personal sign)
  const message = ethers.utils.arrayify(
    ethers.utils.keccak256(
      ethers.utils.concat([
        ethers.utils.arrayify("0x" + opts.electionId),
        ethers.utils.arrayify(ethers.utils.hexlify(Buffer.from(opts.voterAddress.toLowerCase())))
      ])
    )
  );
  return wallet.signMessage(message);
}

export async function getRskBalance(address: string): Promise<bigint> {
  const client = createPublicClient({
    transport: http(RSK_TESTNET_RPC),
  });
  return client.getBalance({ address: address as `0x${string}` });
}

export async function getCeloBalance(address: string): Promise<bigint> {
  const client = createPublicClient({
    transport: http(CELO_ALFAJORES_RPC),
  });
  return client.getBalance({ address: address as `0x${string}` });
}

export type VocdoniCspResult = {
  signature: string;
  electionId: string;
  proofType: number;
};
