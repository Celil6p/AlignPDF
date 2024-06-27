export function bytesToSize(bytes: number): string {
    const sizes: string[] = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";
    const i: number = parseInt(
      Math.floor(Math.log(bytes) / Math.log(1024)).toString()
    );
    const size = Math.round(bytes / Math.pow(1024, i) * 10) / 10;
    return size === Math.floor(size) ? size.toString() + " " + sizes[i] : size.toFixed(1) + " " + sizes[i];
  }