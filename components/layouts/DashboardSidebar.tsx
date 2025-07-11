"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/stores/authStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  BriefcaseBusiness,
  User,
  Settings,
  ExternalLink,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/bookings", icon: Calendar, label: "Bookings" },
  { href: "/dashboard/services", icon: BriefcaseBusiness, label: "Services" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, profile } = useAuthStore();

  // Get user display data
  const username = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || null;
  const initials = username
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "h-screen bg-background border-r border-border transition-all duration-300 ease-in-out flex flex-col",
          isExpanded ? "w-52" : "w-20"
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            
            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg p-3 transition-all duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-accent",
                  "font-medium text-sm",
                  isActive && "bg-primary/10 text-primary border-l-3 border-primary"
                )}
              >
                <IconComponent className="h-5 w-5 flex-shrink-0" />
                {isExpanded && (
                  <span className="ml-3 truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            );

            // Wrap in tooltip when collapsed
            if (!isExpanded) {
              return (
                <Tooltip key={item.href} delayDuration={100}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover border-border text-popover-foreground">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4">
          <Link
            href="/dashboard/profile"
            className={cn(
              "flex items-center rounded-lg p-2 transition-all duration-200",
              "text-muted-foreground hover:text-foreground hover:bg-accent",
              pathname === "/dashboard/profile" && "bg-primary/10 text-primary"
            )}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={avatarUrl || undefined} alt={username} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isExpanded && (
              <span className="ml-3 text-sm font-medium truncate">
                {username}
              </span>
            )}
          </Link>
        </div>
      </aside>
    </TooltipProvider>
  );
}
