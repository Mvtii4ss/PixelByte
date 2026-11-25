$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Test-Path node_modules)) { npm.cmd ci; if ($LASTEXITCODE -ne 0) {exit $LASTEXITCODE} }
npm.cmd run dev -- --strictPort
