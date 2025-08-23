import pako from "pako";

let cachedMethod: "gzip" | "zlib" | "raw" | null = null;
const decoder = new TextDecoder();

function b64ToUint8(arr: string): Uint8Array {
  return Uint8Array.from(atob(arr), c => c.charCodeAt(0));
}

function detectMethod(bytes: Uint8Array): "gzip" | "zlib" | "raw" {
  if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) return "gzip";
  if (bytes.length >= 2 && bytes[0] === 0x78) return "zlib";
  return "raw";
}

export function decompressData(compressedData: string): any {
  try {
    const bytes = b64ToUint8(compressedData);

    const method = cachedMethod ?? detectMethod(bytes);
    let decompressed: Uint8Array;

    switch (method) {
      case "gzip":
      case "zlib":
        decompressed = pako.inflate(bytes);
        break;
      case "raw":
        decompressed = pako.inflateRaw(bytes);
        break;
    }

    cachedMethod = method;
    const text = decoder.decode(decompressed);
    return JSON.parse(text);
  } catch (e) {
    console.error("Error en descompresión:", e);
    return null;
  }
}