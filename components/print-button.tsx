"use client";

export function PrintButton() {
  return (
    <button className="btn btn--dark btn--sm no-print" type="button" onClick={() => window.print()}>
      Print / save as PDF
    </button>
  );
}
