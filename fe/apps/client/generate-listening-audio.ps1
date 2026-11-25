param(
  [string]$BankPath = (Join-Path $PSScriptRoot '..\..\..\be\src\modules\student-assessment\domain\listening-bank.json'),
  [string]$OutputPath = (Join-Path $PSScriptRoot 'public\audio\listening')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech

$bank = Get-Content -Raw -LiteralPath $BankPath | ConvertFrom-Json
New-Item -ItemType Directory -Force -Path $OutputPath | Out-Null
$rates = @{
  'pre-A1' = -3
  'A1' = -2
  'A2' = -1
  'B1' = 0
  'B2' = 1
  'C1' = 2
  'C2' = 3
}

foreach ($test in $bank.tests) {
  $fileName = [System.IO.Path]::GetFileName($test.audioUrl)
  $destination = Join-Path $OutputPath $fileName
  $speaker = [System.Speech.Synthesis.SpeechSynthesizer]::new()
  try {
    $speaker.Rate = $rates[$test.level]
    $speaker.SetOutputToWaveFile($destination)
    $speaker.Speak($test.transcript)
  }
  finally {
    $speaker.Dispose()
  }
}

Write-Host "Generated $($bank.tests.Count) levelled listening files in $OutputPath"
