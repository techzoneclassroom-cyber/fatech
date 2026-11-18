"use client";
import { createContext, useContext } from "react";
import { DEFAULT_CONTACT, type Contact } from "@/lib/contact";

const ContactContext = createContext<Contact>(DEFAULT_CONTACT);

export function ContactProvider({ value, children }: { value: Contact; children: React.ReactNode }) {
  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}

// Client components read the admin-edited numbers from the layout.
export const useContact = () => useContext(ContactContext);
