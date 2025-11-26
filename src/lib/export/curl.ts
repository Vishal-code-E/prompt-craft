/**
 * Generate cURL command for generic API call
 */
export function generateCurlCommand(
  promptJson: Record<string, unknown>,
  endpoint: string = 'https://api.example.com/generate'
): string {
  return `curl ${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '${JSON.stringify(promptJson, null, 2)}'`;
}

/**
 * Download JSON file
 */
export function downloadJSON(promptJson: Record<string, unknown>, filename: string = 'prompt.json'): void {
  const jsonString = JSON.stringify(promptJson, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
