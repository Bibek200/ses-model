# Webhook Test Script
# This script sends test data to your webhook endpoint

Write-Host "🧪 Testing Webhook Endpoint..." -ForegroundColor Cyan
Write-Host ""

# Test data
$testData = @{
    event = "test_webhook"
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    data = @{
        name = "Test User"
        email = "test@example.com"
        message = "This is a test webhook payload"
        source = "PowerShell Test Script"
    }
} | ConvertTo-Json

# Local endpoint
$localEndpoint = "http://localhost:5001/api/webhook"

Write-Host "📤 Sending test data to: $localEndpoint" -ForegroundColor Yellow
Write-Host ""
Write-Host "Payload:" -ForegroundColor Green
Write-Host $testData
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $localEndpoint -Method Post -Body $testData -ContentType "application/json"
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 10)
    Write-Host ""
    Write-Host "✨ Webhook received successfully! Check your admin email and webhook logs." -ForegroundColor Green
    
} catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "⚠️  Make sure your server is running on port 5001" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
