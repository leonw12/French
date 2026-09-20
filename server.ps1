# Francais ATAR - local server.
#  - serves the app from this folder
#  - saves your data as real files in ./userdata  (GET/PUT /api/data/<state|oral|custom-cards>)
# Run:  powershell -ExecutionPolicy Bypass -File server.ps1      (or double-click Start-French-App.bat)
param([int]$Port=5174)
$ErrorActionPreference='Continue'
$root=(Resolve-Path $PSScriptRoot).Path
$userdata=Join-Path $root 'userdata'
New-Item -ItemType Directory -Force $userdata | Out-Null
$allowed=@('state','oral','custom-cards')
$maxBody=25MB
$types=@{'.html'='text/html; charset=utf-8';'.js'='application/javascript; charset=utf-8';'.css'='text/css; charset=utf-8';'.json'='application/json; charset=utf-8';'.png'='image/png';'.jpg'='image/jpeg';'.jpeg'='image/jpeg';'.svg'='image/svg+xml';'.ico'='image/x-icon';'.txt'='text/plain; charset=utf-8';'.pdf'='application/pdf';'.woff2'='font/woff2'}
$blocked=@('userdata','tools','.claude','.git')

$listener=New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
try{ $listener.Start() }catch{ Write-Host "Could not start on port $Port : $($_.Exception.Message)"; exit 1 }
Write-Host "Francais ATAR running at http://localhost:$Port/   (data folder: $userdata)"

function Send($ctx,[int]$code,[byte[]]$bytes,[string]$ct){
  $r=$ctx.Response;$r.StatusCode=$code;$r.ContentType=$ct;$r.Headers.Add('Cache-Control','no-cache');$r.ContentLength64=$bytes.Length
  try{$r.OutputStream.Write($bytes,0,$bytes.Length)}catch{}
  try{$r.OutputStream.Close()}catch{}
}
function SendText($ctx,[int]$code,[string]$text,[string]$ct='application/json; charset=utf-8'){ Send $ctx $code ([Text.Encoding]::UTF8.GetBytes($text)) $ct }

try{
while($listener.IsListening){
  $ctx=$listener.GetContext()
  try{
    $req=$ctx.Request
    $path=[Uri]::UnescapeDataString($req.Url.AbsolutePath)
    if($path -like '/api/*'){
      if($path -eq '/api/ping'){ SendText $ctx 200 '{"ok":true,"files":true}'; continue }
      if($path -like '/api/data/*'){
        $name=$path.Substring('/api/data/'.Length)
        if($allowed -notcontains $name){ SendText $ctx 404 '{"error":"unknown"}'; continue }
        $file=Join-Path $userdata "$name.json"
        if($req.HttpMethod -eq 'GET'){
          if(Test-Path $file){ Send $ctx 200 ([IO.File]::ReadAllBytes($file)) 'application/json; charset=utf-8' } else { SendText $ctx 404 '{"error":"none"}' }
          continue
        }
        if($req.HttpMethod -eq 'PUT' -or $req.HttpMethod -eq 'POST'){
          if($req.ContentLength64 -gt $maxBody){ SendText $ctx 413 '{"error":"too large"}'; continue }
          $ms=New-Object IO.MemoryStream; $req.InputStream.CopyTo($ms); $bytes=$ms.ToArray()
          if($bytes.Length -gt $maxBody -or $bytes.Length -lt 2){ SendText $ctx 400 '{"error":"bad body"}'; continue }
          try{ [void]([Text.Encoding]::UTF8.GetString($bytes) | ConvertFrom-Json) }catch{ SendText $ctx 400 '{"error":"not json"}'; continue }
          $tmp="$file.tmp"; [IO.File]::WriteAllBytes($tmp,$bytes)
          if(Test-Path $file){ Copy-Item $file "$file.bak" -Force }
          Move-Item $tmp $file -Force
          SendText $ctx 200 '{"ok":true}'; continue
        }
      }
      SendText $ctx 404 '{"error":"not found"}'; continue
    }
    if($path -eq '/'){ $path='/index.html' }
    $rel=$path.TrimStart('/').Replace('/',[IO.Path]::DirectorySeparatorChar)
    $full=[IO.Path]::GetFullPath((Join-Path $root $rel))
    $top=($rel -split '[\\/]')[0]
    if(-not $full.StartsWith($root) -or $blocked -contains $top){ SendText $ctx 403 'Forbidden' 'text/plain'; continue }
    if(Test-Path $full -PathType Leaf){
      $ext=[IO.Path]::GetExtension($full).ToLower()
      $ct=if($types.ContainsKey($ext)){$types[$ext]}else{'application/octet-stream'}
      Send $ctx 200 ([IO.File]::ReadAllBytes($full)) $ct
    } else { SendText $ctx 404 'Not found' 'text/plain' }
  }catch{
    try{ SendText $ctx 500 ('{"error":"'+($_.Exception.Message -replace '"',"'")+'"}') }catch{}
  }
}
} finally { $listener.Stop() }
