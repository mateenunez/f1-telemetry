import pako from "pako"

// Utility para manejar datos comprimidos del WebSocket
export function decompressData(compressedData: string): any {
  try {

    // Método 1: Intentar decodificar directamente como base64 + gzip
    try {
      const binaryString = atob(compressedData)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Verificar si los primeros bytes son de gzip (1f 8b)
      if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
        const decompressed = pako.inflate(bytes, { to: "string" })
        return JSON.parse(decompressed)
      }
    } catch (gzipError) {
      console.log("Gzip decompression failed:", gzipError)
    }

    // Método 2: Intentar como deflate sin header gzip
    try {
      const binaryString = atob(compressedData)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      const decompressed = pako.inflateRaw(bytes, { to: "string" })
      return JSON.parse(decompressed)
    } catch (deflateError) {
      console.log("Deflate decompression failed:", deflateError)
    }

    // Método 3: Intentar decodificar directamente como JSON (puede no estar comprimido)
    try {
      const decoded = atob(compressedData)
      return JSON.parse(decoded)
    } catch (jsonError) {
      console.log("Direct JSON parse failed:", jsonError)
    }

    // Método 4: Intentar como string directo (puede ser JSON sin codificar)
    try {
      return JSON.parse(compressedData)
    } catch (directError) {
      console.log("Direct string JSON parse failed:", directError)
    }

    // Método 5: Analizar los primeros bytes para determinar el formato
    try {
      const binaryString = atob(compressedData)
      const bytes = new Uint8Array(Math.min(binaryString.length, 10))
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      if (bytes[0] === 0x78) {
        const fullBytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          fullBytes[i] = binaryString.charCodeAt(i)
        }
        const decompressed = pako.inflate(fullBytes, { to: "string" })
        return JSON.parse(decompressed)
      }
    } catch (headerError) {
      console.log("Header analysis failed:", headerError)
    }

    console.error("All decompression methods failed")
    return null
  } catch (error) {
    console.error("Error in decompressData:", error)
    return null
  }
}

export function formatTime(seconds = 0): string {
  if (!seconds || seconds === 0) return "---:---"
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(3)
  return `${mins}:${secs.padStart(6, "0")}`
}

export function formatInterval(seconds: number): string {
  if (!seconds || seconds === 0) return ""
  if (seconds < 60) {
    return `+${seconds.toFixed(3)}s`
  }
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(3)
  return `+${mins}:${secs.padStart(6, "0")}`
}
