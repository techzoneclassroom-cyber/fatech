"use client";

import { useState, useTransition } from "react";
import { importProducts } from "@/app/admin/actions";
import { csvRows, productRow, type Fields } from "@/lib/admin/validate";
import { ghs } from "@/lib/site";

type Result = { saved: number; skipped: number; errors: string[] };

export function ImportForm() {
  const [rows, setRows] = useState<Fields[]>([]);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [pending, start] = useTransition();

  const load = (text: string) => {
    setResult(null);
    const parsed = csvRows(text);
    setRows(parsed.rows);
    setError(parsed.error);
  };

  const checked = rows.map((r) => ({ r, v: productRow(r) }));
  const valid = checked.filter((c) => c.v.row).length;

  const run = () =>
    start(async () => {
      const res = await importProducts(rows);
      setResult(res);
    });

  return (
    <div className="form-card" style={{ maxWidth: 900 }}>
      <div className="field">
        <label htmlFor="csv">CSV file</label>
        <input
          id="csv"
          type="file"
          accept=".csv,text/csv"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) load(await file.text());
          }}
        />
      </div>

      <div className="field">
        <label htmlFor="paste">…or paste the CSV <span className="hint">(header row included)</span></label>
        <textarea id="paste" onChange={(e) => load(e.target.value)} placeholder="slug,name,category,…" />
      </div>

      <p className="form-note">
        Columns: <code>slug, name, category, brand, price, compare_at, condition, warranty, short, specs, image, featured, active, verified, sort</code>.
        Required: name, category, price. Existing slugs are updated. Download{" "}
        <a href="/products-import-template.csv" download style={{ fontWeight: 700, textDecoration: "underline" }}>the template</a>.
      </p>

      {error && <p className="notice" role="alert">{error}</p>}

      {rows.length > 0 && !error && (
        <>
          <p className="form-note" role="status" style={{ marginTop: 6 }}>
            {rows.length} row{rows.length === 1 ? "" : "s"} read — {valid} ready, {rows.length - valid} need fixing.
          </p>
          <div className="table-wrap" style={{ marginBlock: 14 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Slug</th>
                  <th scope="col">Price</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {checked.slice(0, 50).map(({ r, v }, n) => (
                  <tr key={n}>
                    <td>{r.name || <span className="muted">(no name)</span>}</td>
                    <td>{v.row?.slug ?? r.slug ?? "—"}</td>
                    <td>{v.row ? ghs(v.row.price_pesewas) : "—"}</td>
                    <td>{v.row ? <span style={{ color: "#187a3c", fontWeight: 700 }}>Ready</span> : <span style={{ color: "var(--red)" }}>{v.error}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 50 && <p className="form-note">Showing the first 50 of {rows.length} rows.</p>}

          <button className="btn btn--dark" type="button" onClick={run} disabled={pending || valid === 0}>
            {pending ? "Importing…" : `Import ${valid} product${valid === 1 ? "" : "s"}`}
          </button>
        </>
      )}

      {result && (
        <p className="notice" role="status" style={{ marginTop: 16 }}>
          <b>{result.saved}</b> saved, <b>{result.skipped}</b> skipped.
          {result.errors.length > 0 && (
            <span style={{ display: "block", marginTop: 6 }}>
              {result.errors.map((e) => <span key={e} style={{ display: "block" }}>{e}</span>)}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
