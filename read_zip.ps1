Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("20260421_6151945641_MiFitness_ams1_data_copy.zip")
$entry = $zip.Entries | Where-Object { $_.Name -like "*user_fitness_data_records.csv" }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
for($i=0; $i -lt 20; $i++) {
    $line = $reader.ReadLine()
    if ($null -eq $line) { break }
    Write-Host $line
}
$reader.Close()
$stream.Close()
$zip.Dispose()
