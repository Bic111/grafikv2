#!/usr/bin/env pwsh
<#!
.SYNOPSIS
  Prosty wrapper do wywołań Claude (Anthropic) z PowerShell w Specify Kit.

.DESCRIPTION
  Czyta prompt z parametru, pliku lub STDIN i wysyła żądanie do /v1/messages.
  Wymaga ustawionego klucza ANTHROPIC_API_KEY w środowisku.

.PARAMETER Model
  Nazwa modelu, domyślnie 'claude-3-7-sonnet-latest'.

.PARAMETER Input
  Treść promptu jako string.

.PARAMETER File
  Ścieżka do pliku z promptem.

.EXAMPLE
  pwsh -File ./.specify/scripts/powershell/claude-ask.ps1 -Input "Napisz haiku o jesieni"

.EXAMPLE
  Get-Content prompt.txt | pwsh -File ./.specify/scripts/powershell/claude-ask.ps1

.EXAMPLE
  pwsh -File ./.specify/scripts/powershell/claude-ask.ps1 -File ./prompt.txt -Model claude-3-7-sonnet-latest

.NOTES
  Ustaw klucz w PowerShell (tylko bieżąca sesja):
    $env:ANTHROPIC_API_KEY = "sk-ant-..."

  Trwałe ustawienie (dla użytkownika):
    [Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-ant-...", "User")
#>

[CmdletBinding()]
param(
  [string]$Model = "claude-3-7-sonnet-latest",
  [string]$Prompt,
  [string]$File
)

$ErrorActionPreference = 'Stop'

function Read-InputText {
  param([string]$Prompt, [string]$File)

  if ($Prompt) { return $Prompt }

    if ($File) {
        if (-not (Test-Path -Path $File -PathType Leaf)) {
            throw "Plik nie istnieje: $File"
        }
        return (Get-Content -Path $File -Raw)
    }

    # STDIN
    if ($InputObject) { return $InputObject }
    $stdin = [Console]::In.ReadToEnd()
    if ($stdin -and $stdin.Trim().Length -gt 0) { return $stdin }

    throw "Brak wejścia. Podaj -Input, -File lub przekaż dane przez STDIN."
}

try {
    if (-not $env:ANTHROPIC_API_KEY) {
        throw "Nie ustawiono ANTHROPIC_API_KEY. Ustaw: $env:ANTHROPIC_API_KEY='sk-ant-...' lub trwale przez [Environment]::SetEnvironmentVariable(...)"
    }

  $text = Read-InputText -Prompt $Prompt -File $File

    $uri = "https://api.anthropic.com/v1/messages"
    $headers = @{
        "x-api-key" = $env:ANTHROPIC_API_KEY
        "anthropic-version" = "2023-06-01"
        "content-type" = "application/json"
    }

    $bodyObj = [ordered]@{
        model = $Model
        max_tokens = 1024
        messages = @(
            @{ role = "user"; content = $text }
        )
    }

    $body = $bodyObj | ConvertTo-Json -Depth 6

    $response = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body

    if ($response.content -and $response.content.Count -gt 0) {
        # content to tablica elementów z typem i textem
        $parts = $response.content | Where-Object { $_.type -eq 'text' }
        if ($parts) {
            $parts | ForEach-Object { $_.text }
        } else {
            $response | ConvertTo-Json -Depth 8
        }
    } else {
        $response | ConvertTo-Json -Depth 8
    }
}
catch {
    Write-Error $_
    exit 1
}
