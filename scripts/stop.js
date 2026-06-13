const fs = require('fs');
const { execFileSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const pidFile = path.join(rootDir, '.server.pid');
const envFile = path.join(rootDir, '.env');

const runPowerShell = (script) => execFileSync(
  'powershell.exe',
  ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
  { encoding: 'utf8' }
);

const readPort = () => {
  if (!fs.existsSync(envFile)) return 5173;
  const matched = fs.readFileSync(envFile, 'utf8').match(/^PORT=(\d+)/m);
  return matched ? Number(matched[1]) : 5173;
};

const stopByPid = (pid) => `
$pidToStop = ${pid}
$process = Get-Process -Id $pidToStop -ErrorAction SilentlyContinue
if (-not $process) {
  Write-Output 'No process found for saved server PID.'
  exit 0
}
Stop-Process -Id $pidToStop -Force
Write-Output ("Stopped TT-talking-twice server process {0}." -f $pidToStop)
`;

const stopByPort = (port) => `
$connections = Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue
if (-not $connections) {
  Write-Output 'No running TT-talking-twice server process found.'
  exit 0
}
$stopped = $false
$connections | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
  $process = Get-Process -Id $_ -ErrorAction SilentlyContinue
  if ($process -and $process.ProcessName -eq 'node') {
    Stop-Process -Id $_ -Force
    Write-Output ("Stopped Node process {0} listening on port ${port}." -f $_)
    $script:stopped = $true
  } elseif ($process) {
    Write-Output ("Port ${port} is used by non-Node process {0} ({1}); not stopping it." -f $_, $process.ProcessName)
  }
}
if (-not $stopped) {
  Write-Output 'No Node process was stopped.'
}
`;

try {
  if (fs.existsSync(pidFile)) {
    const pid = fs.readFileSync(pidFile, 'utf8').trim();
    if (/^\d+$/.test(pid)) {
      process.stdout.write(runPowerShell(stopByPid(pid)));
    } else {
      console.log('Removed invalid server PID file.');
    }
    fs.rmSync(pidFile, { force: true });
    process.exit(0);
  }

  process.stdout.write(runPowerShell(stopByPort(readPort())));
} catch (error) {
  process.stderr.write(error.stdout || 'Failed to stop server.\n');
  if (error.stderr) process.stderr.write(error.stderr);
  process.exit(error.status || 1);
}
