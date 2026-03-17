"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SideBarItem({
  label,
  path,
  icon: Icon,
  active,
  onClick,
}) {
  return (
    <Link
      href={path}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
      ${
        active
          ? "bg-white/15 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {Icon && <FontAwesomeIcon icon={Icon} className="w-4 h-4" />}
      {label}
    </Link>
  );
}
