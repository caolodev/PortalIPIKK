const PALETTE = [
  { bg: "#EEEDFE", color: "#3C3489" },
  { bg: "#E1F5EE", color: "#085041" },
  { bg: "#FAEEDA", color: "#633806" },
  { bg: "#E6F1FB", color: "#0C447C" },
  { bg: "#FBEAF0", color: "#72243E" },
  { bg: "#EAF3DE", color: "#27500A" },
];

function getInitials(name) {
  return name.slice(0,2).toUpperCase();
}

export default function Avatar({ name, index }) {
  const pal = PALETTE[index % PALETTE.length];
  return (
    <div
      className="w-7.5 h-7.5 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
      style={{ background: pal.bg, color: pal.color }}
    >
      {getInitials(name)}
    </div>
  );
}