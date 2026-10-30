param(
  [int]$Port = 8000
)

$rootPath = [System.IO.Path]::GetFullPath($PSScriptRoot)
$rootPrefix = $rootPath.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

try {
  $listener.Start()
} catch {
  Write-Error "Could not start the chart server on port $Port. Choose another port with -Port."
  return
}

Write-Host "Charts available at http://127.0.0.1:$Port/ (press Ctrl+C to stop)"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $response = $context.Response

    try {
      if ($context.Request.HttpMethod -notin @("GET", "HEAD")) {
        $response.StatusCode = 405
      } else {
        $relativePath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
        if ([string]::IsNullOrWhiteSpace($relativePath)) {
          $relativePath = "index.html"
        }

        $filePath = [System.IO.Path]::GetFullPath((Join-Path $rootPath $relativePath))
        $isInRoot = $filePath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)
        $normalizedRelativePath = if ($isInRoot) {
          $filePath.Substring($rootPrefix.Length).Replace('\', '/')
        } else {
          ""
        }
        $isAllowedPath = $normalizedRelativePath -match '^(index\.html|load-data\.js|(css|charts|data)/.+)$'

        if (-not $isInRoot -or -not $isAllowedPath -or -not (Test-Path $filePath -PathType Leaf)) {
          $response.StatusCode = 404
        } else {
          $contentType = switch ([System.IO.Path]::GetExtension($filePath).ToLowerInvariant()) {
            ".html" { "text/html; charset=utf-8"; break }
            ".js" { "text/javascript; charset=utf-8"; break }
            ".css" { "text/css; charset=utf-8"; break }
            ".csv" { "text/csv; charset=utf-8"; break }
            default { "application/octet-stream" }
          }
          $bytes = [System.IO.File]::ReadAllBytes($filePath)
          $response.StatusCode = 200
          $response.ContentType = $contentType
          $response.ContentLength64 = $bytes.LongLength
          $response.Headers["Cache-Control"] = "no-cache"
          $response.Headers["X-Content-Type-Options"] = "nosniff"
          if ($context.Request.HttpMethod -eq "GET") {
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
          }
        }
      }
    } catch {
      $response.StatusCode = 500
    } finally {
      $response.Close()
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}