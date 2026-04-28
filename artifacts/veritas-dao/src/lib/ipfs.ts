import { createHelia } from "helia";
import { json as heliaJson } from "@helia/json";

let _node: Awaited<ReturnType<typeof createHelia>> | null = null;
let _initPromise: Promise<Awaited<ReturnType<typeof createHelia>>> | null = null;

async function getNode() {
  if (_node) return _node;
  if (!_initPromise) {
    _initPromise = createHelia().then((node) => {
      _node = node;
      return node;
    });
  }
  return _initPromise;
}

export interface ProposalIPFSRecord {
  title: string;
  description: string;
  chain: string;
  census: string;
  creatorAddress: string;
  pinnedAt: string;
  anchorTxHash?: string | null;
}

export async function pinProposalToIPFS(record: ProposalIPFSRecord): Promise<string> {
  const node = await getNode();
  const j = heliaJson(node);
  const cid = await j.add(record);
  return cid.toString();
}

export function ipfsGatewayUrl(cid: string): string {
  return `https://dweb.link/ipfs/${cid}`;
}

export function ipfsShortCid(cid: string): string {
  if (cid.length <= 20) return cid;
  return `${cid.slice(0, 10)}…${cid.slice(-6)}`;
}
