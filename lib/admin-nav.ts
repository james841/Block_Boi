import {
  LayoutDashboard,
  Package,
  PlusSquare,
  FolderOpen,
  GalleryHorizontal,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  type: "link";
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  type: "group";
  label: string;
  icon: LucideIcon;
  items: { label: string; href: string }[];
};

export type NavItem = NavLink | NavGroup;

// Add/remove entries here only — Sidebar renders whatever is in this list.
export const ADMIN_NAV: NavItem[] = [
  {
    type: "link",
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    type: "group",
    label: "Catalog",
    icon: Package,
    items: [
      { label: "All Products", href: "/admin/products" },
      { label: "Add Product", href: "/admin/products/add" },
      { label: "Categories", href: "/admin/CategoryShowcase" },
    ],
  },
  {
    type: "link",
    label: "Hero Slider",
    href: "/admin/slider",
    icon: GalleryHorizontal,
  },
];

// Re-exported so other files don't need to import lucide icons just for this
export { PlusSquare, FolderOpen, GalleryHorizontal };
