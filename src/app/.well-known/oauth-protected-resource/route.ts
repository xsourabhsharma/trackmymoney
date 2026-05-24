import {
  metadataCorsOptionsRequestHandler,
  protectedResourceHandler,
} from 'mcp-handler'

export const runtime = 'nodejs'

function authServerUrl(request: Request) {
  const url = new URL(request.url)
  return url.origin
}

export function GET(request: Request) {
  return protectedResourceHandler({
    authServerUrls: [authServerUrl(request)],
  })(request)
}

export const OPTIONS = metadataCorsOptionsRequestHandler()
