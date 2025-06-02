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
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { signOutAction } from "@/app/actions";

export default function SidebarNav(props) {
  const { activeMenu } = props;

  const [activeLink, setActiveLink] = useState(activeMenu);


  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <h1 className="text-2xl font-bold text-glaucous">
            <span className="text-bittersweet">Finance</span> Tracker
          </h1>
          <p className="text-xs text-paynes-gray opacity-70 mt-1">
            Track your spending
          </p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-3 rounded-lg text-paynes-gray hover:bg-ghost-white transition-colors group"
                      style={
                        activeLink === "dashboard"
                          ? { backgroundColor: "#F7F7FF" }
                          : {}
                      }
                    >
                      <span
                        className="w-8 h-8 mr-3 flex items-center justify-center rounded-md group-hover:bg-columbia-blue transition-colors"
                        style={
                          activeLink === "dashboard"
                            ? { backgroundColor: "#BDD5EA" }
                            : { backgroundColor: "#F7F7FF" }
                        }
                      >
                        <Home
                          size={18}
                          className={
                            activeLink === "dashboard"
                              ? "text-white"
                              : "text-paynes-gray"
                          }
                        />
                      </span>
                      <span className="font-medium">Dashboard</span>
                      {activeLink === "dashboard" ? (
                        <span className="ml-auto text-xs bg-white px-2 py-1 rounded-md">
                          Active
                        </span>
                      ) : (
                        ""
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Link
                      href="/income"
                      className="flex items-center px-4 py-3 rounded-lg text-paynes-gray hover:bg-ghost-white font-medium transition-colors group"
                      style={
                        activeLink === "income"
                          ? { backgroundColor: "#F7F7FF" }
                          : {}
                      }
                    >
                      <span
                        className="w-8 h-8 mr-3 flex items-center justify-center rounded-md"
                        style={
                          activeLink === "income"
                            ? { backgroundColor: "#BDD5EA" }
                            : { backgroundColor: "#F7F7FF" }
                        }
                      >
                        <ArrowDownRight
                          size={18}
                          className={
                            activeLink === "income"
                              ? "text-white"
                              : "text-paynes-gray"
                          }
                        />
                      </span>
                      <span>Income</span>
                      {activeLink === "income" ? (
                        <span className="ml-auto text-xs bg-white px-2 py-1 rounded-md">
                          Active
                        </span>
                      ) : (
                        ""
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link
                href="/expenses"
                className="flex items-center px-4 py-3 rounded-lg text-paynes-gray hover:bg-ghost-white transition-colors group"
                style={
                  activeLink === "expenses"
                    ? { backgroundColor: "#F7F7FF" }
                    : {}
                }
              >
                <span className="w-8 h-8 mr-3 flex items-center justify-center bg-ghost-white rounded-md group-hover:bg-columbia-blue transition-colors"
                style={
                  activeLink === "expenses" ? { backgroundColor: "#BDD5EA" } : { backgroundColor: "#F7F7FF" }
                }
                >
                  <ArrowUpRight size={18} className={activeLink === "expenses" ? "text-white" : "text-paynes-gray"} />
                </span>
                <span>Expenses</span>
                {activeLink === "expenses" ? (
                  <span className="ml-auto text-xs bg-white px-2 py-1 rounded-md">
                    Active
                  </span>
                ) : (
                  ""
                )}
              </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Link
                      href="/purchases"
                      className="flex items-center px-4 py-3 rounded-lg text-paynes-gray hover:bg-ghost-white transition-colors group"
                      style={
                        activeLink === "purchases"
                          ? { backgroundColor: "#F7F7FF" }
                          : {}
                      }
                    >
                      <span
                        className="w-8 h-8 mr-3 flex items-center justify-center bg-ghost-white rounded-md group-hover:bg-columbia-blue transition-colors"
                        style={
                          activeLink === "purchases"
                            ? { backgroundColor: "#BDD5EA" }
                            : { backgroundColor: "#F7F7FF" }
                        }
                      >
                        <ShoppingCart
                          size={18}
                          className={
                            activeLink === "purchases"
                              ? "text-white"
                              : "text-paynes-gray"
                          }
                        />
                      </span>
                      <span>Purchases</span>
                      {activeLink === "purchases" ? (
                        <span className="ml-auto text-xs bg-white px-2 py-1 rounded-md">
                          Active
                        </span>
                      ) : (
                        ""
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Link
                      href="/add"
                      className="flex items-center px-4 py-3 rounded-lg text-paynes-gray hover:bg-ghost-white transition-colors group"
                      style={
                        activeLink === "add"
                          ? { backgroundColor: "#F7F7FF" }
                          : {}
                      }
                    >
                      <span
                        className="w-8 h-8 mr-3 flex items-center justify-center bg-ghost-white rounded-md group-hover:bg-columbia-blue transition-colors"
                        style={
                          activeLink === "add"
                            ? { backgroundColor: "#BDD5EA" }
                            : { backgroundColor: "#F7F7FF" }
                        }
                      >
                        <PlusCircle
                          size={18}
                          className={
                            activeLink === "add"
                              ? "text-white"
                              : "text-paynes-gray"
                          }
                        />
                      </span>
                      <span>Add Data</span>
                      {activeLink === "add" ? (
                        <span className="ml-auto text-xs bg-white px-2 py-1 rounded-md">
                          Active
                        </span>
                      ) : (
                        ""
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          {/* User/Settings */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center px-4 py-3 rounded-lg text-paynes-gray hover:bg-ghost-white transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-ghost-white flex items-center justify-center mr-3">
                <User size={18} className="text-paynes-gray" />
              </div>
              <div>
                <Button className="text-sm font-medium" onClick={signOutAction}>Log Out</Button>
                {/* <p className="text-xs opacity-70">Manage account</p> */}
              </div>
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail></SidebarRail>
      </Sidebar>

    </>
  );
}
