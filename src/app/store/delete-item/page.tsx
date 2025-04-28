"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeleteItemPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [storeID, setStoreID] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("storeID");
      if (stored) {
        setStoreID(stored);
      }
    }
  }, []);

  useEffect(() => {
    if (!storeID) return;

    const fetchItems = async () => {
      try {
        const response = await fetch(`/api/view-items?storeID=${storeID}`);
        const data = await response.json();
        if (response.ok) {
          setItems(data.items);
        } else {
          alert("Error fetching items");
        }
      } catch (error: any) {
        alert(`Error: ${error.message}`);
      }
    };

    fetchItems();
  }, [storeID]);

  const handleItemSelect = (itemID: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemID)
        ? prev.filter((id) => id !== itemID)
        : [...prev, itemID]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to delete.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/delete-item`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeID, itemIDs: selectedItems }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Selected items deleted successfully!");
        setItems(items.filter((item) => !selectedItems.includes(item._id)));
        setSelectedItems([]);
      } else {
        setError("Error deleting items: " + data.message);
      }
    } catch (error: any) {
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10 px-4">
      <h2 className="text-3xl font-bold text-[#0F6466] mb-6">Delete Item</h2>

      {items.length === 0 ? (
        <p className="text-lg text-gray-600">No items found to delete.</p>
      ) : (
        <div className="w-full max-w-6xl bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#0F6466] text-white text-left">
                <th className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === items.length}
                    onChange={(e) =>
                      setSelectedItems(
                        e.target.checked ? items.map((i) => i._id) : []
                      )
                    }
                  />
                </th>
                <th className="px-4 py-2">Item Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => handleItemSelect(item._id)}
                    />
                  </td>
                  <td className="px-4 py-2 text-gray-800 font-medium">
                    {item.itemName}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{item.itemDescription}</td>
                  <td className="px-4 py-2 text-green-600 font-bold">
                    Rs.{item.itemPrice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end px-6 py-4 bg-gray-50">
            <button
              onClick={handleBulkDelete}
              disabled={loading || selectedItems.length === 0}
              className={`${
                loading || selectedItems.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              } text-white px-5 py-2 rounded-md font-medium transition`}
            >
              {loading ? "Deleting..." : `Delete Selected (${selectedItems.length})`}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center pb-4">{error}</div>
          )}
        </div>
      )}
    </div>
  );
}
