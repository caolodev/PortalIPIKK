"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

export default function DirectorLayout({ children }) {
  const pathName = usePathname();
  const beforeLocation = pathName.split("/").slice(-2)[0];

  const formatPageName = (path) => {
    return path
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const currentPage = pathName.split("/").slice(-1)[0];
  const parentPath = pathName.split("/").slice(0, -1).join("/");

  return (
    <div className="flex flex-col max-w-7xl mx-auto pt-8 p-4 md:px-0">
      {beforeLocation === "gestao" && (
        <div className="flex flex-col gap-4">
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href={parentPath}
              className="flex items-center gap-2 p-2 rounded-lg text-[#0F2C59] hover:bg-blue-50 transition-all duration-200 font-medium"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
              <span>Gestão Académica</span>
            </Link>
            <FontAwesomeIcon
              icon={faChevronRight}
              className="w-3 h-3 text-gray-300"
            />
            <span className="text-gray-600 font-semibold">
              {formatPageName(currentPage)}
            </span>
          </nav>
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}
