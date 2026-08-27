import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { FastResponse } from "srvx";

import {
  negotiateDocumentResponse,
  requestForDocumentRenderer,
} from "./lib/agent-http.ts";

/**
 * srvx resolves `FastResponse` per runtime. On Node it is a Response with a
 * faster path to the underlying Node response, worth roughly 5% throughput. On
 * workerd and other runtimes srvx exports the platform `Response`, so this
 * assignment is a no-op and the optimization stays specific to Node hosts
 * without forking the entry point per preset.
 */
globalThis.Response = FastResponse;

export default createServerEntry({
  async fetch(request: Request): Promise<Response> {
    const response = await handler.fetch(requestForDocumentRenderer(request));

    return await negotiateDocumentResponse(request, response);
  },
});
