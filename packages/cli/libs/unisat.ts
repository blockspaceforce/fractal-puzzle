import axios from "axios";
import type { UTXO } from "../types";

const api = axios.create({
  baseURL: process.env.UNISAT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.UNISAT_API_KEY}`,
  },
});

export async function getUtxos(address: string) {
  const response = await api.get(`/v1/indexer/address/${address}/utxo-data`, { params: { cursor: 0, size: 100 } });
  return response.data.data.utxo as UTXO[];
}

export async function broadcastTx(txHex: string) {
  const response = await api.post<{ code: number, msg: string, data: string }>('/v1/indexer/local_pushtx', { txHex });
  return response.data;
}
