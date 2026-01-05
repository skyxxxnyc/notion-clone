"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Settings,
  Bell,
  Palette,
  Globe,
  Shield,
  CreditCard,
  Users,
  Link,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SETTINGS_SECTIONS = [
  { id: "account", label: "Account", icon: User },
  { id: "settings", label: "Settings & members", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "language", label: "Language & region", icon: Globe },
  { id: "security", label: "Security", icon: Shield },
];

export function SettingsDialog() {
  const { settingsOpen, setSettingsOpen, currentUser, updateWorkspace, currentWorkspaceId, workspaces } = useAppStore();
  const [activeSection, setActiveSection] = useState("account");

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="max-w-4xl h-[600px] p-0">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-56 border-r border-neutral-200 bg-neutral-50 p-4">
            <nav className="space-y-1">
              {SETTINGS_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                    activeSection === section.id
                      ? "bg-white shadow-sm text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-6">
            {activeSection === "account" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Account</h2>

                  {/* Profile Photo */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-semibold">
                      {currentUser?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        Upload photo
                      </Button>
                      <p className="text-xs text-neutral-500 mt-1">
                        Recommended size: 280x280px
                      </p>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Full name
                      </label>
                      <Input defaultValue={currentUser?.name || ""} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Email
                      </label>
                      <Input defaultValue={currentUser?.email || ""} type="email" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="text-sm font-semibold text-red-600 mb-2">
                    Danger zone
                  </h3>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete account
                  </Button>
                </div>
              </div>
            )}

            {activeSection === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Workspace settings
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Workspace name
                      </label>
                      <Input
                        defaultValue={currentWorkspace?.name || ""}
                        onChange={(e) => {
                          if (currentWorkspaceId) {
                            updateWorkspace(currentWorkspaceId, {
                              name: e.target.value,
                            });
                          }
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Workspace icon
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-semibold">
                          {currentWorkspace?.icon ||
                            currentWorkspace?.name?.charAt(0) ||
                            "W"}
                        </div>
                        <Button variant="outline" size="sm">
                          Change icon
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="text-sm font-semibold mb-4">Members</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                          {currentUser?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {currentUser?.name || "You"}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {currentUser?.email}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs bg-neutral-100 px-2 py-1 rounded">
                        Owner
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Users className="h-4 w-4 mr-2" />
                    Invite members
                  </Button>
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Notifications</h2>

                <div className="space-y-4">
                  {[
                    { label: "Email notifications", desc: "Receive email updates about your pages" },
                    { label: "Desktop notifications", desc: "Show desktop notifications" },
                    { label: "Mobile push notifications", desc: "Receive notifications on mobile" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-neutral-500">
                          {item.desc}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-neutral-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Appearance</h2>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "light", label: "Light", bg: "bg-white" },
                      { id: "dark", label: "Dark", bg: "bg-neutral-900" },
                      { id: "system", label: "System", bg: "bg-gradient-to-r from-white to-neutral-900" },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        className="p-3 border border-neutral-200 rounded-lg hover:border-neutral-400 transition-colors"
                      >
                        <div
                          className={cn(
                            "h-16 rounded-md mb-2 border border-neutral-200",
                            theme.bg
                          )}
                        />
                        <span className="text-sm">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Text size
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-xs">A</span>
                    <input
                      type="range"
                      min="12"
                      max="18"
                      defaultValue="14"
                      className="flex-1"
                    />
                    <span className="text-lg">A</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Full-width pages</div>
                    <div className="text-xs text-neutral-500">
                      Stretch pages to the full width of the window
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                </div>
              </div>
            )}

            {activeSection === "language" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Language & region</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Language
                    </label>
                    <select className="w-full px-3 py-2 border border-neutral-200 rounded-md">
                      <option>English (UK)</option>
                      <option>English (US)</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Spanish</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Date format
                    </label>
                    <select className="w-full px-3 py-2 border border-neutral-200 rounded-md">
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Start week on
                    </label>
                    <select className="w-full px-3 py-2 border border-neutral-200 rounded-md">
                      <option>Monday</option>
                      <option>Sunday</option>
                      <option>Saturday</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "security" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold mb-4">Security</h2>

                <div className="space-y-4">
                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Password</h3>
                    <p className="text-sm text-neutral-500 mb-3">
                      Change your password to keep your account secure
                    </p>
                    <Button variant="outline" size="sm">
                      Change password
                    </Button>
                  </div>

                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">
                      Two-factor authentication
                    </h3>
                    <p className="text-sm text-neutral-500 mb-3">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline" size="sm">
                      Enable 2FA
                    </Button>
                  </div>

                  <div className="p-4 border border-neutral-200 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Active sessions</h3>
                    <p className="text-sm text-neutral-500 mb-3">
                      Manage and log out from your active sessions
                    </p>
                    <Button variant="outline" size="sm">
                      View sessions
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
