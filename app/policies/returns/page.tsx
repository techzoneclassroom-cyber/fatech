import type { Metadata } from "next";
import Link from "next/link";
import { Policy } from "@/components/policy";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "How returns, faulty items and refunds are handled for F.A TECHNOLOGIES orders.",
};

export default function ReturnsPolicy() {
  return (
    <Policy
      title="Returns & refunds"
      intro="What to do if an item is faulty, damaged or not what you ordered."
    >
      <h2>Report a problem first</h2>
      <p>
        Contact us on WhatsApp or by phone with your order details, a description of the issue and photos where
        possible. Please report faulty, damaged or wrong items within 48 hours of delivery so we can investigate quickly.
      </p>

      <h2>Faulty or wrong items</h2>
      <ul>
        <li>We inspect the item and confirm the fault before agreeing a repair, replacement or refund.</li>
        <li>Items under a manufacturer warranty may be handled through the warranty process.</li>
        <li>Delivery charges for returning a genuinely faulty item are discussed case by case.</li>
      </ul>

      <h2>Change of mind</h2>
      <p>
        Unused items in their original, undamaged packaging may be accepted for return within 7 days at our discretion.
        Delivery costs are not refunded and a restocking or handling charge may apply. Items that have been used,
        installed, configured or damaged are not accepted for change-of-mind returns.
      </p>

      <h2>What we cannot accept</h2>
      <ul>
        <li>Physical or liquid damage, or damage from incorrect power or installation.</li>
        <li>Devices that have been opened or repaired by someone else.</li>
        <li>Consumables, opened software, licences and activated services.</li>
        <li>Special-order and import items, unless they arrive faulty or different from the confirmed order.</li>
      </ul>

      <h2>Refunds</h2>
      <p>
        Approved refunds are made through the original payment method after inspection. The time it takes depends on
        the payment provider or bank. Where a refund is not appropriate, we will explain the alternative in writing.
      </p>

      <h2>Repairs</h2>
      <p>
        Repair work is quoted before it starts. If a device cannot be repaired, we tell you and agree what to do with it.
        See the <Link href="/repair">repair page</Link> for booking and status checks. Devices left uncollected for a long
        period may incur storage arrangements — we will contact you before that happens.
      </p>
    </Policy>
  );
}
