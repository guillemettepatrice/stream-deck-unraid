export function formatBytes(kilobytes: number | string): string {
    const kb = Number(kilobytes);
    if (isNaN(kb)) return kilobytes?.toString() || 'N/A';
    if (kb === 0) return '0 KB';
    
    const bytes = kb * 1024;
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}