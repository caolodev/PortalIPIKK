import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function UserMenu({ firstName, lastName, role, items = [] }) {
  return (
    <div className="absolute bg-white shadow-xl flex flex-col gap-2 py-5 top-12 right-0 rounded-[20px] w-[250px] border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
      <div className="flex flex-col space-y-1 px-5 border-b border-gray-200 pb-2">
        <span className="text-sm font-medium leading-none">
          {firstName} {lastName}
        </span>
        <span className="text-xs leading-none text-slate-500">{role}</span>
      </div>
      <div className="flex flex-col gap-1">
        {items.map((item, index) => {
          const ItemContent = (
            <div
              className={`px-5 flex items-center gap-3 text-sm font-medium leading-none py-2.5 cursor-pointer transition-colors ${
                item.variant === "danger"
                  ? "text-red-500 hover:bg-red-50"
                  : "hover:bg-[#0F2C59] hover:text-white"
              } ${item.divider ? "border-b border-gray-100 mb-1 pb-2" : ""}`}
              onClick={item.onClick}
            >
              {item.icon && (
                <FontAwesomeIcon
                  icon={item.icon}
                  className="w-4 h-4 opacity-70"
                />
              )}
              {item.label}
            </div>
          );
          return item.path ? (
            <Link key={index} href={item.path}>
              {ItemContent}
            </Link>
          ) : (
            <div key={index}>{ItemContent}</div>
          );
        })}
      </div>
    </div>
  );
}
