import { describe, expect, it } from "vitest";

import {
  createDocumentRoutingRules,
  negotiateDocumentResponse,
  requestForDocumentRenderer,
} from "./agent-http.ts";

describe("agent HTTP representations", () => {
  it("asks the framework renderer for HTML without losing the agent preference", () => {
    const request = new Request("https://nickneely.dev/about", {
      headers: { accept: "text/markdown" },
    });
    const rendererRequest = requestForDocumentRenderer(request);

    expect(rendererRequest.headers.get("accept")).toBe("text/html");
    expect(request.headers.get("accept")).toBe("text/markdown");
  });

  it("serves the preferred markdown representation with cache-safe headers", async () => {
    const request = new Request("https://nickneely.dev/about", {
      headers: { accept: "text/html;q=0.5, text/markdown;q=0.9" },
    });
    const html =
      '<!doctype html><html><body><header>Navigation</header><main><h1>About Nick</h1><p>Build <a href="/work">maintainable software</a>.</p></main><script>secret()</script></body></html>';

    const response = await negotiateDocumentResponse(
      request,
      new Response(html, {
        headers: {
          "content-length": "999",
          "content-type": "text/html; charset=utf-8",
          vary: "Accept-Encoding",
        },
      })
    );

    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8"
    );
    expect(response.headers.get("content-length")).toBeNull();
    expect(response.headers.get("vary")).toBe("Accept-Encoding, Accept");
    await expect(response.text()).resolves.toBe(
      "# About Nick\n\nBuild [maintainable software](https://nickneely.dev/work).\n"
    );
  });

  it("honors explicit rejections and unsupported media types", async () => {
    const html = new Response("<main><h1>Home</h1></main>", {
      headers: { "content-type": "text/html; charset=utf-8" },
    });

    const htmlResponse = await negotiateDocumentResponse(
      new Request("https://nickneely.dev/", {
        headers: { accept: "text/markdown;q=0, text/html" },
      }),
      html.clone()
    );
    expect(htmlResponse.headers.get("content-type")).toContain("text/html");

    const unsupported = await negotiateDocumentResponse(
      new Request("https://nickneely.dev/", {
        headers: { accept: "application/pdf" },
      }),
      html.clone()
    );
    expect(unsupported.status).toBe(406);
    expect(unsupported.headers.get("vary")).toBe("Accept");
  });

  it("returns a useful markdown body while preserving a not-found status", async () => {
    const response = await negotiateDocumentResponse(
      new Request("https://nickneely.dev/missing", {
        headers: { accept: "text/markdown" },
      }),
      new Response("<main><h1>Wrong door.</h1></main>", {
        headers: { "content-type": "text/html; charset=utf-8" },
        status: 404,
      })
    );

    expect(response.status).toBe(404);
    const body = await response.text();
    expect(body).toContain(
      "[Agent instructions](https://nickneely.dev/llms.txt)"
    );
    expect(body).toContain("[Sitemap](https://nickneely.dev/sitemap.xml)");
  });

  it("places negotiation and Vary rules before Vercel's filesystem handler", () => {
    const rules = createDocumentRoutingRules(["/", "/about"]);

    expect(rules[0]).toMatchObject({
      continue: true,
      headers: { Vary: "Accept, Accept-Encoding" },
    });
    expect(rules).toContainEqual(
      expect.objectContaining({
        dest: "/__server",
        has: [expect.objectContaining({ key: "accept", type: "header" })],
      })
    );
  });
});
