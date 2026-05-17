"use client";

import React, { forwardRef } from "react";
import * as Icons from "lucide-react";

const iconMap = {
  Dashboard: Icons.LayoutDashboard,
  Suppliers: Icons.Truck,
  Ingredients: Icons.Package,
  Products: Icons.Cake,
  Recipes: Icons.ReceiptText,
  Sales: Icons.ShoppingCart,
  Purchases: Icons.ArrowDownToLine,
  Reports: Icons.FileText,
  Settings: Icons.Settings,
  Logout: Icons.LogOut,
  User: Icons.User,
  Search: Icons.Search,
  Bell: Icons.Bell,
  Menu: Icons.Menu,
  Close: Icons.X,
  Plus: Icons.Plus,
  Edit: Icons.Pencil,
  Delete: Icons.Trash2,
  Save: Icons.Save,
  Cancel: Icons.XCircle,
  ChevronLeft: Icons.ChevronLeft,
  ChevronRight: Icons.ChevronRight,
  TrendingUp: Icons.TrendingUp,
  TrendingDown: Icons.TrendingDown,
  DollarSign: Icons.DollarSign,
  Package2: Icons.Package,
  AlertTriangle: Icons.AlertTriangle,
  BarChart3: Icons.BarChart3,
  PieChart: Icons.PieChart,
  Download: Icons.Download,
  Filter: Icons.Filter,
  Eye: Icons.Eye,
  Mail: Icons.Mail,
  Phone: Icons.Phone,
  MapPin: Icons.MapPin,
  Calendar: Icons.Calendar,
  Clock: Icons.Clock,
  ArrowUpRight: Icons.ArrowUpRight,
  ArrowDownRight: Icons.ArrowDownRight,
  Store: Icons.Store,
  Lock: Icons.Lock,
  ReceiptText: Icons.ReceiptText,
  ShoppingBag: Icons.ShoppingBag,
  Money: Icons.Wallet,
  ShoppingCart: Icons.ShoppingCart,
} as const;

export type IconName = keyof typeof iconMap;

interface IconFactoryProps {
  name: IconName;
  className?: string;
  size?: number;
}

export const IconFactory = forwardRef<SVGSVGElement, IconFactoryProps>(
  ({ name, className, size = 20 }, ref) => {
    const LucideIcon = iconMap[name];
    if (!LucideIcon) return null;
    return <LucideIcon ref={ref} className={className} size={size} strokeWidth={2} />;
  }
);

IconFactory.displayName = "IconFactory";
