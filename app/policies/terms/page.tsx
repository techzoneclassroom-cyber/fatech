import type { Metadata } from "next";
import Link from "next/link";
import { Policy } from "@/components/policy";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that apply when you use the F.A TECHNOLOGIES website and order from us.",
};

export default function TermsPolicy() {
  return (
    <Policy
      title="Terms of use"
      intro="The basic terms that apply to this website and to orders placed with F.A TECHNOLOGIES."
    >
      <h2>About this website</h2>
      <p>
        This website is published by F.A TECHNOLOGIES, Kumasi–Kwadaso, Ghana. It shows our shop catalogue, services and
        ways to contact us. Prices are in Ghana cedis (GHS).
      </p>

      <h2>Sample catalogue</h2>
      <p>
        Products, prices and images shown at launch are sample listings for demonstration and are labelled as such.
        They do not confirm availability, stock or a final price. Every order is confirmed with us on WhatsApp or by
        phone before payment and delivery.
      </p>

      <h2>Ordering</h2>
      <ul>
        <li>Adding items to the cart on this site does not create a binding order or reserve stock.</li>
        <li>An order is confirmed only when we reply and agree the item, price, delivery location and payment method.</li>
        <li>We may decline or cancel an order where an item is unavailable, the price was listed in error, or the request appears fraudulent.</li>
      </ul>

      <h2>Prices and payment</h2>
      <p>
        Prices are confirmed at the time of order. Payment methods are agreed directly with you. We never ask for your
        mobile money PIN, OTP codes or card details in a chat message.
      </p>

      <h2>Delivery, returns and repairs</h2>
      <p>
        See our <Link href="/policies/shipping">shipping policy</Link>, <Link href="/policies/returns">returns policy</Link>{" "}
        and <Link href="/repair">repair process</Link> for how these are handled.
      </p>

      <h2>Repair and service work</h2>
      <ul>
        <li>Work is quoted before it starts, and a quote may change if we find an additional fault.</li>
        <li>Please back up your data before handing in a device. We take care, but cannot guarantee data will be preserved.</li>
        <li>Devices not collected within a reasonable period after completion will be handled as agreed with you in advance.</li>
      </ul>

      <h2>Content and intellectual property</h2>
      <p>
        The F.A TECHNOLOGIES name, logo and site design belong to the business. Product names and brands mentioned are
        the property of their respective owners and are used to describe goods we sell or service.
      </p>

      <h2>Liability</h2>
      <p>
        We aim to keep information on this site accurate and current, but it may contain errors or outdated details.
        We are not responsible for interruptions outside our control. Nothing in these terms limits rights you have
        under Ghanaian consumer law.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the Republic of Ghana.</p>
    </Policy>
  );
}
