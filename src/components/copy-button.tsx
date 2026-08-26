import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { RefObject } from "react";

/**
 * How long the confirmation stands. Long enough to be read, short enough that
 * the control is back to naming its action before the reader looks again.
 */
const confirmationDuration = 1200;

/**
 * Whether the reader's browser can be handed text at all. Read through
 * `useSyncExternalStore` rather than an effect because the answer differs
 * between the server and the client by design: the prerendered HTML must not
 * contain the control, and the first client render is where it appears.
 *
 * The subscription is empty on purpose. The answer cannot change during a
 * session, so there is nothing to listen to.
 */
const unsubscribe = () => {
  // Nothing was subscribed to, so there is nothing to tear down.
};
const subscribe = () => unsubscribe;
const clipboardOnClient = () => navigator.clipboard !== undefined;
const clipboardOnServer = () => false;

interface CopyButtonProps {
  /** The element whose rendered text is copied. */
  source: RefObject<HTMLElement | null>;
}

/**
 * The copy control on a code block.
 *
 * It renders nothing on the server, which is deliberate twice over. The
 * prerendered HTML has no JavaScript behind it, so a button in it would be a
 * control that does nothing; and a clipboard write needs a secure context, so
 * a browser without one should not be offered the affordance either. Both
 * questions are answered by the same snapshot, and until the client answers
 * them the block is simply a block.
 *
 * The "Copied" state is the confirmation `DESIGN.md` sanctions: it exists
 * because the reader clicked, it says what happened, and it goes away. The
 * label swaps instantly under reduced motion.
 */
export function CopyButton({ source }: CopyButtonProps) {
  const available = useSyncExternalStore(
    subscribe,
    clipboardOnClient,
    clipboardOnServer
  );
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  if (!available) {
    return null;
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source.current?.textContent ?? "");
    } catch {
      // A refused clipboard write is the browser's answer, not an error the
      // reader can act on. The control simply does not confirm.
      return;
    }

    setCopied(true);

    if (timer.current !== null) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      setCopied(false);
    }, confirmationDuration);
  };

  return (
    <>
      <button
        aria-label="Copy code"
        className="code-copy"
        data-copied={copied ? "" : undefined}
        onClick={() => {
          void copy();
        }}
        type="button"
      >
        <span aria-hidden="true" className={copied ? "code-copy-swap" : ""}>
          {copied ? "Copied" : "Copy"}
        </span>
      </button>
      {/* The visible label is hidden from assistive technology, so the
          confirmation is announced here instead of by renaming the control
          mid-interaction. `output` is a polite live region without saying so. */}
      <output className="sr-only">{copied ? "Copied" : ""}</output>
    </>
  );
}
