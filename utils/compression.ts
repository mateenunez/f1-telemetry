import pako from "pako";

export function decompressData(compressedData: string): any {
  // Intentar descompresión estándar
  try {
    // Paso 1: Decodificar base64
    let binaryData;
    try {
      binaryData = Uint8Array.from(atob(compressedData), c => c.charCodeAt(0));
    } catch {
      // Si falla, intentar tratar como string no codificado
      binaryData = new TextEncoder().encode(compressedData);
    }

    // Paso 2: Intentar diferentes métodos de descompresión
    const methods = [
      { name: "gzip", fn: (data: Uint8Array) => pako.inflate(data) },
      { name: "zlib", fn: (data: Uint8Array) => pako.inflate(data) },  // pako maneja automáticamente
      { name: "raw", fn: (data: Uint8Array) => pako.inflateRaw(data) },
      { name: "brotli", fn: (data: Uint8Array) => {
        // Solo si el navegador soporta Brotli
        if (typeof window !== "undefined" && (window as any).BrotliDecode) {
          return (window as any).BrotliDecode(data);
        }
        throw new Error("Brotli no soportado");
      }}
    ];

    for (const method of methods) {
      try {
        const decompressed = method.fn(binaryData);
        const text = new TextDecoder().decode(decompressed);
        return JSON.parse(text);
      } catch (error) {
        // Continuar con el siguiente método
      }
    }

    // Paso 3: Intentar parsear directamente como JSON
    try {
      const text = new TextDecoder().decode(binaryData);
      return JSON.parse(text);
    } catch {
      // Último intento: tratar como string directo
      return JSON.parse(compressedData);
    }
  } catch (finalError) {
    console.error("Error en descompresión:", finalError);
    return null;
  }
}