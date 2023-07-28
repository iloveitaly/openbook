export function addProtocolIfMissing(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  } else {
    return `https://${url}`
  }
}

export function reverseProtocol(protocol: string) {
  if (protocol === "https:") {
    return "http:"
  } else if (protocol === "http:") {
    return "https:"
  } else {
    console.log(`unknown protocol encountered ${protocol}`)
    return "http:"
  }
}
