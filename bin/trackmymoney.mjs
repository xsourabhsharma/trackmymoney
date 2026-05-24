#!/usr/bin/env node

import { Command } from 'commander'
import { spawn } from 'node:child_process'

const program = new Command()

program
  .name('trackmymoney')
  .description('TrackMyMoney CLI for AI/MCP-backed finance actions')
  .version('0.1.0')
  .option('--base-url <url>', 'TrackMyMoney base URL', process.env.TRACKMYMONEY_BASE_URL || 'http://localhost:3000')
  .option('--token <token>', 'TrackMyMoney external access token', process.env.TRACKMYMONEY_TOKEN)

function jsonOutput(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
}

function getGlobalOptions() {
  const opts = program.opts()
  if (!opts.token) {
    throw new Error('Missing token. Pass --token or set TRACKMYMONEY_TOKEN.')
  }
  return {
    baseUrl: String(opts.baseUrl).replace(/\/$/, ''),
    token: String(opts.token),
  }
}

async function callTool(tool, args, { yes = false } = {}) {
  const { baseUrl, token } = getGlobalOptions()
  const endpoint = `${baseUrl}/api/tmm-tools`

  async function post(payload) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'x-trackmymoney-actor': 'cli',
      },
      body: JSON.stringify(payload),
    })

    const body = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(body?.message || body?.error || `HTTP ${response.status}`)
    }
    return body
  }

  const preview = await post({ tool, args })
  if (!yes || !preview?.confirmationRequired || !preview?.confirmationId) {
    return preview
  }

  return post({
    tool,
    args: {
      ...args,
      confirm: true,
      confirmationId: preview.confirmationId,
    },
  })
}

program
  .command('tools')
  .description('List available TrackMyMoney tools')
  .action(async () => {
    const { baseUrl } = program.opts()
    const response = await fetch(`${String(baseUrl).replace(/\/$/, '')}/api/tmm-tools`)
    jsonOutput(await response.json())
  })

program
  .command('tool')
  .description('Run any TrackMyMoney tool with JSON args')
  .argument('<name>', 'Tool name, e.g. tmm_create_transaction')
  .argument('[argsJson]', 'JSON object for tool args', '{}')
  .option('--yes', 'Approve the confirmation preview and execute')
  .action(async (name, argsJson, options) => {
    const args = JSON.parse(argsJson)
    jsonOutput(await callTool(name, args, { yes: Boolean(options.yes) }))
  })

program
  .command('mcp-config')
  .description('Print MCP client configuration snippets')
  .action(() => {
    const { baseUrl, token } = getGlobalOptions()
    const mcpUrl = `${baseUrl}/api/mcp`
    jsonOutput({
      remote: {
        trackmymoney: {
          url: mcpUrl,
          headers: { Authorization: `Bearer ${token}` },
        },
      },
      stdioBridge: {
        trackmymoney: {
          command: 'npx',
          args: ['-y', 'mcp-remote', mcpUrl],
          env: {
            MCP_REMOTE_HEADERS: JSON.stringify({ Authorization: `Bearer ${token}` }),
          },
        },
      },
    })
  })

program
  .command('mcp')
  .description('Run a local stdio MCP bridge to the remote TrackMyMoney MCP endpoint')
  .action(() => {
    const { baseUrl, token } = getGlobalOptions()
    const mcpUrl = `${baseUrl}/api/mcp`
    const child = spawn(
      process.platform === 'win32' ? 'npx.cmd' : 'npx',
      ['-y', 'mcp-remote', mcpUrl],
      {
        stdio: 'inherit',
        env: {
          ...process.env,
          MCP_REMOTE_HEADERS: JSON.stringify({ Authorization: `Bearer ${token}` }),
        },
      }
    )
    child.on('exit', (code) => {
      process.exitCode = code ?? 0
    })
  })

const transaction = program.command('transaction').description('Manage transactions')

transaction
  .command('list')
  .option('--type <type>', 'income, expense, or transfer')
  .option('--limit <number>', 'Limit', '25')
  .option('--offset <number>', 'Offset', '0')
  .action(async (options) => {
    jsonOutput(await callTool('tmm_list_transactions', {
      type: options.type,
      limit: Number(options.limit),
      offset: Number(options.offset),
    }))
  })

transaction
  .command('add')
  .requiredOption('--amount <number>', 'Amount')
  .requiredOption('--type <type>', 'income, expense, or transfer')
  .requiredOption('--merchant <merchant>', 'Merchant or source')
  .requiredOption('--date <date>', 'Date, e.g. 2026-05-24')
  .option('--currency <code>', 'Currency', 'INR')
  .option('--category-id <id>', 'Category ID')
  .option('--account-id <id>', 'Account ID')
  .option('--description <text>', 'Description')
  .option('--confirm-id <id>', 'Confirmation ID from a previous preview')
  .option('--yes', 'Approve preview and execute in one command')
  .action(async (options) => {
    const args = {
      amount: Number(options.amount),
      type: options.type,
      merchant: options.merchant,
      date: options.date,
      currency: options.currency,
      categoryId: options.categoryId || null,
      accountId: options.accountId || null,
      description: options.description || null,
      confirm: Boolean(options.confirmId),
      confirmationId: options.confirmId,
    }
    jsonOutput(await callTool('tmm_create_transaction', args, { yes: Boolean(options.yes) }))
  })

function addCreateCommand(parent, commandName, toolName, optionsBuilder) {
  const command = parent.command(commandName).option('--yes', 'Approve preview and execute in one command')
  const toArgs = optionsBuilder(command)
  command.action(async (options) => {
    jsonOutput(await callTool(toolName, toArgs(options), { yes: Boolean(options.yes) }))
  })
}

addCreateCommand(program.command('budget').description('Manage budgets'), 'create', 'tmm_create_budget', (command) => {
  command
    .requiredOption('--category-id <id>', 'Expense category ID')
    .requiredOption('--limit-amount <number>', 'Budget limit')
    .option('--period-type <type>', 'monthly, quarterly, yearly, or custom', 'monthly')
  return (options) => ({
    categoryId: options.categoryId,
    limitAmount: Number(options.limitAmount),
    periodType: options.periodType,
  })
})

addCreateCommand(program.command('subscription').description('Manage subscriptions'), 'create', 'tmm_create_subscription', (command) => {
  command
    .requiredOption('--merchant <merchant>', 'Merchant')
    .requiredOption('--amount <number>', 'Amount')
    .option('--currency <code>', 'Currency', 'INR')
    .option('--interval <interval>', 'weekly, monthly, yearly, custom', 'monthly')
    .option('--status <status>', 'active, paused, cancelled', 'active')
    .option('--service-name <name>', 'Service name')
    .option('--next-charge-date <date>', 'Next charge date')
  return (options) => ({
    merchant: options.merchant,
    serviceName: options.serviceName || null,
    amount: Number(options.amount),
    currency: options.currency,
    interval: options.interval,
    status: options.status,
    nextChargeDate: options.nextChargeDate || null,
  })
})

addCreateCommand(program.command('goal').description('Manage savings goals'), 'create', 'tmm_create_goal', (command) => {
  command
    .requiredOption('--name <name>', 'Goal name')
    .requiredOption('--target-amount <number>', 'Target amount')
    .option('--current-amount <number>', 'Current amount', '0')
    .option('--target-date <date>', 'Target date')
  return (options) => ({
    name: options.name,
    targetAmount: Number(options.targetAmount),
    currentAmount: Number(options.currentAmount),
    targetDate: options.targetDate || null,
  })
})

addCreateCommand(program.command('debt').description('Manage debts'), 'create', 'tmm_create_debt', (command) => {
  command
    .requiredOption('--name <name>', 'Debt name')
    .requiredOption('--total-amount <number>', 'Original amount')
    .option('--remaining-amount <number>', 'Remaining amount')
    .option('--interest-rate <number>', 'Interest rate', '0')
    .option('--minimum-payment <number>', 'Minimum payment', '0')
  return (options) => ({
    name: options.name,
    totalAmount: Number(options.totalAmount),
    remainingAmount: options.remainingAmount ? Number(options.remainingAmount) : undefined,
    interestRate: Number(options.interestRate),
    minimumPayment: Number(options.minimumPayment),
  })
})

program.parseAsync(process.argv).catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
