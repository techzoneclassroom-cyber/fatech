import { CATEGORIES } from "@/lib/catalogue";
import type { AdminProduct } from "@/lib/admin/data";
import { saveProduct } from "@/app/admin/actions";

const money = (p: number | null | undefined) => (p ? (p / 100).toFixed(2) : "");

export function ProductForm({ product }: { product?: AdminProduct }) {
  return (
    <form action={saveProduct} className="form-card" style={{ maxWidth: 820 }}>
      {product && <input type="hidden" name="original" value={product.slug} />}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required minLength={2} maxLength={120} defaultValue={product?.name} />
        </div>
        <div className="field">
          <label htmlFor="slug">Slug <span className="hint">{product ? "(fixed — links and orders use it)" : "(URL name — leave blank to generate)"}</span></label>
          <input id="slug" name="slug" maxLength={80} defaultValue={product?.slug} readOnly={Boolean(product)} placeholder="hp-elitebook-840-g6" />
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" required defaultValue={product?.category ?? CATEGORIES[0].slug}>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="brand">Brand</label>
          <input id="brand" name="brand" maxLength={60} defaultValue={product?.brand} />
        </div>
        <div className="field">
          <label htmlFor="price">Price in GH₵</label>
          <input id="price" name="price" required inputMode="decimal" defaultValue={money(product?.price_pesewas)} placeholder="4500.00" />
        </div>
        <div className="field">
          <label htmlFor="compare_at">Compare-at price in GH₵ <span className="hint">(optional)</span></label>
          <input id="compare_at" name="compare_at" inputMode="decimal" defaultValue={money(product?.compare_at_pesewas)} placeholder="4800.00" />
        </div>
        <div className="field">
          <label htmlFor="condition">Condition</label>
          <select id="condition" name="condition" defaultValue={product?.condition ?? "new"}>
            <option value="new">New</option>
            <option value="refurbished">Refurbished</option>
            <option value="used">Used</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="warranty">Warranty</label>
          <input id="warranty" name="warranty" maxLength={80} defaultValue={product?.warranty} placeholder="12 months" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="short">Short description</label>
        <textarea id="short" name="short" maxLength={300} defaultValue={product?.short} style={{ minHeight: 74 }} />
      </div>
      <div className="field">
        <label htmlFor="specs">Specifications <span className="hint">(one per line: Label: Value)</span></label>
        <textarea id="specs" name="specs" defaultValue={product?.specs.map(([a, b]) => `${a}: ${b}`).join("\n")} placeholder={"Processor: Intel Core i5\nRAM: 8 GB"} />
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="image">Image path <span className="hint">(starts with /)</span></label>
          <input id="image" name="image" maxLength={300} defaultValue={product?.image} placeholder="/images/p-desktop.webp" />
        </div>
        <div className="field">
          <label htmlFor="photo">Upload a photo <span className="hint">(JPG/PNG/WebP, max 5 MB — replaces the path)</span></label>
          <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="sort">Sort order <span className="hint">(lower shows first)</span></label>
          <input id="sort" name="sort" type="number" min={0} max={9999} defaultValue={product?.sort ?? 100} />
        </div>
        <div className="field" style={{ alignContent: "end", gap: 8 }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 600 }}>
            <input type="checkbox" name="featured" defaultChecked={product?.featured} style={{ width: "auto" }} /> Show on the home page
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 600 }}>
            <input type="checkbox" name="active" defaultChecked={product?.active ?? true} style={{ width: "auto" }} /> Visible in the shop
          </label>
        </div>
      </div>

      <button className="btn btn--dark" type="submit">{product ? "Save changes" : "Add product"}</button>
    </form>
  );
}
