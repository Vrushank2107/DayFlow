"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  align?: "left" | "right";
  onClose?: () => void;
}

export function DropdownMenu({ children, trigger, align = "right", onClose }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeMenu}
          />
          <div
            className={cn(
              "absolute z-50 mt-2 min-w-[220px] rounded-xl border border-zinc-200 bg-white shadow-xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden animate-in fade-in-0 zoom-in-95",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            {React.Children.map(children, (child) => {
              // Skip Fragments - they can't receive props
              if (React.isValidElement(child) && child.type === React.Fragment) {
                return child;
              }
              // Clone valid elements and add onClose prop
              if (React.isValidElement(child) && typeof child.type !== 'string') {
                return React.cloneElement(child as React.ReactElement<any>, {
                  onClose: closeMenu,
                });
              }
              return child;
            })}
          </div>
        </>
      )}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  onClose?: () => void;
}

export function DropdownMenuItem({
  children,
  onClick,
  href,
  className,
  onClose,
}: DropdownMenuItemProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    if (onClose) {
      onClose();
    }
  };

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm text-zinc-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 transition-all duration-200 dark:text-zinc-300 dark:hover:from-indigo-500/10 dark:hover:to-purple-500/10 dark:hover:text-indigo-300 cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return content;
}

