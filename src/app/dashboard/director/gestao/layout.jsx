"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
export default function DirectorLayout({ children }) {
  const pathName = usePathname();
  const beforeLocation = pathName.split("/").slice(-2)[0];
  return (
    <div className="flex-col gap-10 max-w-7xl mx-auto py-5">
      {beforeLocation === "gestao" && (
        <div className="flex items-center mb-5">
          <Link
            href={pathName.split("/").slice(0, -1).join("/")}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span className="text-sm text-gray-500 mx-2">{" < "}</span>
            {beforeLocation === "gestao" ? "Gestão Académica" : beforeLocation}
          </Link>
          <span className="text-sm text-gray-500 mx-2">/</span>
          <span className="text-sm font-medium text-gray-700">
            {pathName.split("/").slice(-1)[0].charAt(0).toUpperCase() +
              pathName.split("/").slice(-1)[0].slice(1).replace(/_/g, " ")}
          </span>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
