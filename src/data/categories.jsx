import { useState, useEffect } from "react";
import api from "../api/axios";

/**
 * useNavCategories
 * ─────────────────
 * GET /nav-categories/tree থেকে data আনে।
 * প্রতিটি parent এ shape:
 *   { _id, name, image, parentCategory: null, children: [ { _id, name, image, parentCategory } ] }
 *
 * HeroSection / MainHeader এ "subs" এর বদলে "children" ব্যবহার করা হয়।
 */
export function useNavCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/nav-categories/tree")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Nav categories fetch error:", err));
  }, []);

  return categories;
}
