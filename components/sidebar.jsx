"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Home,
  ShoppingCart,
  PlusCircle,
  User,
  Menu,
  X,
  Wallet,
  PiggyBank,
} from "lucide-react";
import { signOutAction } from "@/app/actions";

export default function SidebarNav(props) {
  const { activeMenu } = props;
  const [activeLink] = useState(activeMenu);
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      href: "/home/dashboard",
      icon: Home,
      label: "Dashboard",
    },
    {
      id: "income",
      href: "/home/income",
      icon: ArrowDownRight,
      label: "Income",
    },
    {
      id: "expenses",
      href: "/home/expenses",
      icon: ArrowUpRight,
      label: "Expenses",
    },
    {
      id: "purchases",
      href: "/home/purchases",
      icon: ShoppingCart,
      label: "Purchases",
    },
    {
      id: "budget",
      href: "/home/budget",
      icon: Wallet,
      label: "Budget",
    },
    {
      id: "savings",
      href: "/home/savings",
      icon: PiggyBank,
      label: "Savings",
    },
    {
      id: "add",
      href: "/home/add",
      icon: PlusCircle,
      label: "Add Data",
    },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 p-2 rounded-lg bg-white shadow-md z-50"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsOpen(!isOpen)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 flex flex-col transition-transform duration-300 ease-in-out z-20"
        style={isOpen ? { transform: "translateX(0)" } : { transform: "translateX(-100%)" }}

      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 mt-12">
          <h1 className="text-2xl font-bold text-gray-700">
            <span className="text-red-400">Finance</span> Tracker
          </h1>
          <p className="text-xs text-gray-600 opacity-70 mt-1">
            Track your spending
          </p>
        </div>

        {/* Content */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeLink === item.id;

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}

                    className="flex items-center py-3 px-4 rounded-lg transition-colors"

                    style={isActive
                      ? { backgroundColor: "#BDD5EA" }
                      : { backgroundColor: "#F7F7FF" }
                    }
                    onClick={() => isOpen && setIsOpen(!isOpen)}
                  >
                    <span
                      className="w-8 h-8 mr-3 flex items-center justify-center rounded-md transition-colors"
                      style={isActive ? { backgroundColor: "#BDD5EA" } : { backgroundColor: "#F7F7FF" }}

                    >
                      <Icon
                        size={18}
                        style={isActive ? { color: "white" } : { color: "darkslategrey" }}
                      />
                    </span>
                    <span className="font-medium ml-2"
                    style={isActive ? { color: "white" } : { color: "darkslategrey" }}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3">
              <User size={18} className="text-gray-600" />
            </div>
            <button
              className="text-sm font-medium bg-transparent border-none cursor-pointer"
              onClick={signOutAction}
            >
              Log Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}