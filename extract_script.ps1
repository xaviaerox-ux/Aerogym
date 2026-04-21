$path = "20260421_6151945641_MiFitness_ams1_data_copy.zip"
$out = "fitness_records.csv"
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($path)
$entry = $zip.Entries | Where-Object { $_.Name -match "user_fitness_data_records.csv" }
if ($entry) {
    [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $out, $true)
} else {
    Write-Host "Entry not found"
}
$zip.Dispose()
