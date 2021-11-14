import getPlatform from './get-platform';

function getArchitecture() {
  let platform = getPlatform();
  if (platform.startsWith('win')) {
    return 'windows-amd64.exe';
  } else if (platform.includes('darwin')) {
    return 'darwin-amd64';
  } else {
    return 'linux-amd64';
  }
}

export function buildBintrayDownloadUrl(
  baseUrl: string,
  cliVersion: string
): string {
  const btPackage = 'gitleaks-' + getArchitecture();
  return baseUrl + cliVersion + '/' + btPackage;
}
