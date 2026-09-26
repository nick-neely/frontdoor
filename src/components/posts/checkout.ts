/**
 * The `Checkout` aggregate from "Domain-driven design in the age of AI",
 * trimmed to its status rules. The Post prints the same class, and the
 * playground beside it runs this one, so the error a reader triggers is the
 * invariant the prose describes rather than a message written to look like it.
 */
export type CheckoutStatus = "submitted" | "picking" | "cancelled";

export class Checkout {
  #status: CheckoutStatus = "submitted";

  get status(): CheckoutStatus {
    return this.#status;
  }

  cancel(): void {
    if (this.#status === "picking") {
      throw new Error("A Checkout cannot be cancelled once picking starts.");
    }
    this.#status = "cancelled";
  }

  startPicking(): void {
    if (this.#status !== "submitted") {
      throw new Error("Only a submitted Checkout can be picked.");
    }
    this.#status = "picking";
  }
}
