# Universal test runner that ALWAYS writes to file
# This avoids terminal visibility issues

param(
    [string]$Command = "",
    [string]$OutputFile = "command-output.txt"
)

if ($Command -eq "") {
    # Run the main test script
    & .\test-all-commands.ps1 *>&1 | Tee-Object -FilePath "test-output.log"
    Write-Output "Test complete. Check test-output.log for results."
} else {
    # Run a specific command
    try {
        $result = Invoke-Expression $Command 2>&1
        $result | Out-File $OutputFile
        Write-Output "Command executed. Check $OutputFile"
    } catch {
        $_.Exception.Message | Out-File $OutputFile
        Write-Output "Command failed. Check $OutputFile"
    }
}

# Always create a status file
@{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    status = "complete"
    outputFile = $OutputFile
} | ConvertTo-Json | Out-File "run-status.json"
