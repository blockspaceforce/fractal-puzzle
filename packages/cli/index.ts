import yargs from 'yargs'
import { z } from 'zod'
import { hideBin } from 'yargs/helpers'
import { deploy } from './commands/deploy'
import chalk from 'chalk'
import { broadcastTx } from './libs/unisat'
import { DUST_LIMIT, FEE } from './libs/constants'
import { solve } from './commands/solve'

yargs(hideBin(process.argv))
  .command('deploy', 'deploy a contract', () => { }, async (argv) => {
    const secretSchema = z.string().min(4)
    const secretInput = prompt("Enter your secret(4 characters minimum):")
    const { success: secretSuccess, data: secret } = secretSchema.safeParse(secretInput)
    if (!secretSuccess) {
      console.error("Secret is invalid")
      return
    }

    const minAmount = DUST_LIMIT + FEE
    const amountSchema = z.coerce.number().min(minAmount)
    const amountInput = prompt(`Enter amount(> ${minAmount} satoshis):`)
    const { success: amountSuccess, data: amount, error: amountError } = amountSchema.safeParse(amountInput)
    if (!amountSuccess) {
      console.error(amountError)
      return
    }

    const { txid, txHex } = await deploy({ secret, amount })

    console.log(chalk.green(`Transaction ID: ${txid}`))
    console.log(chalk.blue(`Transaction Hex: ${txHex}`))

    const broadcastNow = prompt("Broadcast now? (y/N):")
    if (broadcastNow === 'y') {
      const result = await broadcastTx(txHex)
      if (result.code === 0) {
        console.log(chalk.green(`Broadcasted: ${result.data}`))
      } else {
        console.error(chalk.red(`Broadcast failed, message: ${result.msg}`))
      }
    } else {
      console.log(chalk.yellow('Bye!'))
    }
  })
  .command('solve', 'solve the puzzle and get the reward', () => { }, async (argv) => {
    const secretSchema = z.string().min(4)
    const secretInput = prompt("Enter your secret(4 characters minimum):")
    const { success: secretSuccess, data: secret } = secretSchema.safeParse(secretInput)
    if (!secretSuccess) {
      console.error("Secret is invalid")
      return
    }

    const utxoAddressSchema = z.string().regex(/^[bB]c1[pPqQ][a-zA-Z0-9]{58}$/, "Invalid address format")
    const utxoAddressInput = prompt("Enter your utxo address(taproot):")
    const { success: utxoAddressSuccess, data: utxoAddress } = utxoAddressSchema.safeParse(utxoAddressInput)
    if (!utxoAddressSuccess) {
      console.error("Utxo address is invalid")
      return
    }

    const { txid, txHex } = await solve({ utxoAddress, secret })
    console.log(chalk.green(`Transaction ID: ${txid}`))
    console.log(chalk.blue(`Transaction Hex: ${txHex}`))

    const broadcastNow = prompt("Broadcast now? (y/N):")
    if (broadcastNow === 'y') {
      const result = await broadcastTx(txHex)
      if (result.code === 0) {
        console.log(chalk.green(`Broadcasted: ${result.data}`))
      } else {
        console.error(chalk.red(`Broadcast failed, message: ${result.msg}`))
      }
    } else {
      console.log('Bye!')
    }
  })
  .demandCommand(1)
  .help()
  .parse()
