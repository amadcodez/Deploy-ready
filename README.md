# 🛍️ Product Management Module – Multi-Vendor E-Commerce (Next.js + MongoDB)

This module handles all CRUD operations for products inside a multi-vendor e-commerce platform. It is inspired by Shopify’s clean layout and built using the latest Next.js App Router and MongoDB backend.

---

## 📄 Pages Included

### 1. ➕ Add Product Page

- Add new product with:
  - Product title
  - Description
  - Price, compare-at price, cost per item
  - Inventory quantity
  - Upload multiple images
- Images are converted to base64 and saved in MongoDB

### 2. 🔁 Update Product Page

- Select product from dropdown
- Pre-filled form for all product fields
- Replace existing images with new ones
- Two-column layout for better UX

### 3. 👁 View All Products Page

- Displays all products from the logged-in vendor’s store
- Each card shows:
  - Product name, description, price
  - First image as preview
- Responsive grid layout

### 4. 🗑 Delete Product Page

- Table format listing all products
- Each row includes:
  - Name, description, price
  - Delete button (with confirmation)
- Optional: Select multiple items for batch delete (coming soon)

---

## 🧰 Tech Stack

- **Framework**: Next.js 13+ App Router
- **Database**: MongoDB (via Mongoose)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (`useState`, `useEffect`)
- **File Upload**: FileReader + Base64 encoding

---

## 📂 File Structure

```bash
src/
├── app/
│   ├── store/
│   │   ├── add-item/page.tsx
│   │   ├── update-item/page.tsx
│   │   ├── view-items/page.tsx
│   │   └── delete-item/page.tsx
│   └── api/
│       ├── add-item/route.ts
│       ├── update-item/route.ts
│       ├── delete-item/route.ts
│       └── view-items/route.ts
├── models/
│   └── Item.ts
```
