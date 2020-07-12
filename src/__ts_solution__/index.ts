const { onExit } = require('@rauschma/stringio')
const { spawn } = require('child_process')

async function main() {
  const filePath = process.argv[2]
  console.log('INPUT: ' + filePath)

  const childProcess = spawn('cat', [filePath], { stdio: [process.stdin, process.stdout, process.stderr] }) // (A)

  await onExit(childProcess) // (B)

  console.log('### DONE')
}

main()
