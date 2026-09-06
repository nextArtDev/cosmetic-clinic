$env:PORT = '3477'
Set-Location -LiteralPath (Join-Path $PSScriptRoot '..')
node .next/standalone/server.js
