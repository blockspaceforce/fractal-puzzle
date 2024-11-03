import * as bitcoin from 'bitcoinjs-lib';
import { loadWalletFromWIF } from '../../libs/wallet';
import { getUtxos } from '../../libs/unisat';
import { pickUtxos } from '../../libs/utxo';
import { Puzzle } from '../../../smartcontracts/src';
import { toByteString, sha256 } from 'scrypt-ts'
import { issue_xonly_pubkey } from '../../libs/tx';
import { DUST_LIMIT, FEE } from '../../libs/constants';

export async function deploy(props: { secret: string, amount: number }) {
  const { secret, amount } = props
  const fee = FEE
  const contract = new Puzzle(sha256(toByteString(secret, true)))

  const wallet = loadWalletFromWIF(process.env.PRIVATE_KEY!, bitcoin.networks.bitcoin)

  const scriptPubKey = bitcoin.payments.p2tr({
    internalPubkey: issue_xonly_pubkey,
    scriptTree: {
      output: contract.lockingScript.toBuffer(),
    },
    network: bitcoin.networks.bitcoin,
  })

  const utxos = await getUtxos(wallet.address)
  const utxo = pickUtxos(utxos, amount + fee)

  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.bitcoin })

  psbt.addInput({
    hash: utxo.txid,
    index: utxo.vout,
    witnessUtxo: {
      script: wallet.output!,
      value: BigInt(utxo.satoshi),
    },
    tapInternalKey: wallet.xOnlyPubKey,
  })

  psbt.addOutput({
    value: BigInt(amount),
    script: scriptPubKey.output!,
  })

  // Add change output
  const change = utxo.satoshi - amount - fee

  if (change > DUST_LIMIT) {
    psbt.addOutput({
      value: BigInt(change),
      script: wallet.output!,
    })
  }

  psbt.signInput(0, wallet.tweaked)
  psbt.finalizeAllInputs()

  const tx = psbt.extractTransaction()
  return {
    txid: tx.getId(),
    txHex: tx.toHex(),
  }
}
