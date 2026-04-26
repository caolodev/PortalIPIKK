import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faGear,
  faUser,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserMenu from "../UserMenu";

export default function NavBar({
  onOpen,
  title,
  shortName,
  firstName,
  lastName,
  role,
  activeAcademicYear,
  activeAcademicQuarter,
}) {
  const { logout } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  // Fecha o menu ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowDetails(false);
      }
    };

    if (showDetails) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDetails]);

  const academicYearLabel = activeAcademicYear
    ? activeAcademicYear.name ||
      `${new Date(activeAcademicYear.startDate).getFullYear()}-${new Date(
        activeAcademicYear.endDate,
      ).getFullYear()}`
    : "Nenhum activo";
  const academicQuarterLabel = activeAcademicQuarter
    ? `${activeAcademicQuarter.number}º activo`
    : "Nenhum activo";

  const menuItems = [
    {
      label: "Meu perfil",
      icon: faUser,
      divider: true,
      onClick: () => router.push("/dashboard/profile"),
    },
    {
      label: "Sair",
      icon: faRightFromBracket,
      onClick: logout,
      variant: "danger",
    },
  ];

  return (
    <header className="fixed top-0 border w-screen h-16 z-10 border-b border-gray-200 shadow-sm flex items-center md:px-16 pr-10 bg-white md:pl-70 transition-all justify-between">
      <div className="flex items-center gap-4 ml-4 md:ml-0">
        <span className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-3">
          <button
            onClick={onOpen}
            className="md:hidden -ml-2 text-[#0F2C59] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
          </button>
          {title}
        </span>
        
      </div>

      <div className="relative flex gap-3 items-center" ref={menuRef}>
        <div className="flex items-start flex-col rounded-lg border border-[#0F2C59] bg-blue-100 px-3 py-1 text-xs font-semibold text-[#0F2C59]">
          <span>Ano lectivo: {academicYearLabel}</span>
          <span className="text-[#0F2C59] font-light">
            Trimestre: {academicQuarterLabel}
          </span>
        </div>
        <div
          className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-transparent hover:border-gray-200 font-bold  bg-[#0F2C59] text-white transition-all hover:shadow-md active:scale-95"
          onClick={() => setShowDetails(!showDetails)}
        >
          {shortName}
        </div>
        {showDetails && (
          <UserMenu
            firstName={firstName}
            lastName={lastName}
            role={role}
            items={menuItems}
          />
        )}
      </div>
    </header>
  );
}
