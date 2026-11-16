import type { Metadata } from "next";
import { Policy } from "@/components/policy";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: "Delivery and pickup arrangements for orders from F.A TECHNOLOGIES in Kumasi, Ghana.",
};

export default function ShippingPolicy() {
  return (
    <Policy
      title="Shipping & delivery"
      intro="How orders are delivered or collected, and what to expect."
    >
      <h2>Delivery areas</h2>
      <p>
        We deliver within Kumasi and, where a courier route is available, to other regions of Ghana.
        International delivery is only arranged when a confirmed shipping arrangement is in place — ask before ordering.
      </p>

      <h2>Delivery cost</h2>
      <p>
        Delivery is quoted per order based on your location and the size of the items. Charges are confirmed with you
        on WhatsApp before payment. The website does not charge delivery automatically.
      </p>

      <h2>Pickup</h2>
      <p>
        You can collect from our shop at F.A TECHNOLOGIES, Kumasi–Kwadaso. Call ahead so the item is ready and
        someone is available to hand it over.
      </p>

      <h2>Timing</h2>
      <p>
        We do not promise fixed delivery times on this website. When your order is confirmed we tell you the expected
        timing, and we contact you if it changes. Large appliances, networking jobs and site work are scheduled separately.
      </p>

      <h2>Receiving an order</h2>
      <ul>
        <li>Check the item and packaging when it arrives, before signing or paying any balance.</li>
        <li>Report visible damage or a wrong item within 48 hours, with photos where possible.</li>
        <li>Keep the packaging until you have tested the item.</li>
      </ul>

      <h2>Failed delivery</h2>
      <p>
        If you cannot be reached or the address is incomplete, the item may be returned to us and re-delivery may
        attract another charge. Please give a reachable phone number and clear directions.
      </p>
    </Policy>
  );
}
