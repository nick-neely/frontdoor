import Negotiator from "negotiator";
import { NodeHtmlMarkdown } from "node-html-markdown";

import { siteConfig } from "./site-config.ts";

const htmlType = "text/html";
const markdownType = "text/markdown";
const documentTypes = [htmlType, markdownType] as const;
const varyValue = "Accept, Accept-Encoding";

interface VercelHeaderCondition {
  key: string;
  type: "header";
  value: { re: string };
}

export interface DocumentRoutingRule {
  continue?: boolean;
  dest?: string;
  has?: readonly VercelHeaderCondition[];
  headers?: Record<string, string>;
  src: string;
}

/**
 * TanStack renders documents only when the request permits HTML. Vercel sends
 * negotiated requests here before the filesystem, so ask the renderer for its
 * HTML source while keeping the original request for final selection.
 */
export function requestForDocumentRenderer(request: Request): Request {
  const accept = request.headers.get("accept");
  const methodCanRenderDocument =
    request.method === "GET" || request.method === "HEAD";

  if (
    !methodCanRenderDocument ||
    accept === null ||
    /(?:text\/html|\*\/\*)/iu.test(accept)
  ) {
    return request;
  }

  const headers = new Headers(request.headers);

  headers.set("accept", htmlType);

  return new Request(request.url, {
    headers,
    method: request.method,
    signal: request.signal,
  });
}

function appendVary(headers: Headers, field: string): void {
  const current = headers.get("vary");
  const fields =
    current === null
      ? []
      : current
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);

  if (!fields.some((value) => value.toLowerCase() === field.toLowerCase())) {
    fields.push(field);
  }

  headers.set("vary", fields.join(", "));
}

function absoluteDocumentLinks(html: string, origin: string): string {
  return html.replaceAll(
    /\b(?<attribute>href|src)="(?<path>\/[^"]*)"/gu,
    (_match, attribute: string, path: string) =>
      `${attribute}="${new URL(path, origin).toString()}"`
  );
}

function htmlToMarkdown(html: string, origin: string): string {
  const main = /<main\b[^>]*>(?<contents>[\s\S]*?)<\/main>/u.exec(html)?.groups
    ?.contents;
  const document = absoluteDocumentLinks(main ?? html, origin);

  return `${NodeHtmlMarkdown.translate(document).trim()}\n`;
}

function notFoundMarkdown(): string {
  return (
    `# 404 - Wrong door\n\n` +
    `That path does not exist on ${siteConfig.name}.\n\n` +
    `- [Home](${siteConfig.origin}/)\n` +
    `- [Agent instructions](${siteConfig.origin}/llms.txt)\n` +
    `- [Sitemap](${siteConfig.origin}/sitemap.xml)\n`
  );
}

/**
 * Selects the document representation using RFC 9110 quality values and
 * specificity. Non-document responses pass through unchanged.
 */
export async function negotiateDocumentResponse(
  request: Request,
  response: Response
): Promise<Response> {
  const contentType = response.headers.get("content-type");

  if (contentType === null || !contentType.includes(htmlType)) {
    return response;
  }

  const accept = request.headers.get("accept");
  const representation =
    accept === null
      ? htmlType
      : new Negotiator({ headers: { accept } }).mediaType(documentTypes);
  const headers = new Headers(response.headers);

  appendVary(headers, "Accept");
  appendVary(headers, "Accept-Encoding");

  if (representation === undefined) {
    headers.delete("content-encoding");
    headers.delete("content-length");
    headers.set("content-type", "text/plain; charset=utf-8");

    return new Response(
      request.method === "HEAD"
        ? null
        : "Not Acceptable\n\nAvailable representations: text/html, text/markdown.\n",
      { headers, status: 406, statusText: "Not Acceptable" }
    );
  }

  if (representation === htmlType) {
    return new Response(request.method === "HEAD" ? null : response.body, {
      headers,
      status: response.status,
      statusText: response.statusText,
    });
  }

  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.set("content-type", "text/markdown; charset=utf-8");
  let body: string | null = null;

  if (request.method !== "HEAD") {
    body =
      response.status === 404
        ? notFoundMarkdown()
        : htmlToMarkdown(await response.text(), new URL(request.url).origin);
  }

  return new Response(body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

function escapePattern(path: string): string {
  return path.replaceAll(/[|\\{}()[\]^$+*?.-]/gu, "\\$&");
}

/**
 * Routes negotiated document requests through Nitro before Vercel's
 * filesystem handler while static browser requests keep using prerendered
 * HTML. The first rule adds Vary to both variants.
 */
export function createDocumentRoutingRules(
  publicPaths: readonly string[]
): DocumentRoutingRule[] {
  const pathPattern = `^(?:${publicPaths.map(escapePattern).join("|")})$`;

  return [
    {
      continue: true,
      headers: { Vary: varyValue },
      src: pathPattern,
    },
    {
      dest: "/__server",
      has: [
        {
          key: "accept",
          type: "header",
          value: { re: "(?i)(?:^|,)\\s*text/markdown(?:\\s*;|\\s*(?:,|$))" },
        },
      ],
      src: pathPattern,
    },
    {
      dest: "/__server",
      has: [
        {
          key: "accept",
          type: "header",
          value: {
            re: "(?i)(?:text/html|text/markdown|\\*/\\*)\\s*;[^,]*\\bq=0(?:\\.0*)?(?:\\D|$)",
          },
        },
      ],
      src: pathPattern,
    },
    {
      dest: "/__server",
      has: [
        {
          key: "accept",
          type: "header",
          value: {
            re: "(?i)^(?!.*(?:text/html|text/markdown|\\*/\\*)).+$",
          },
        },
      ],
      src: pathPattern,
    },
  ];
}
