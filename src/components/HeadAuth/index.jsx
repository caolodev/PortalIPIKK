import Image from "next/image";
export default function HeadAuth({ description, title }) {
  return (
    <div className="text-center mb-8">
      <Image
        src={"/logo.png"}
        alt="Logotipo do Instituto"
        width={70}
        height={70}
        className="mx-auto mb-4 shadow-xl shadow-blue-900/20 rounded-full"
      />
      <h1 className="text-3xl font-black text-[#0F2C59]">{title}</h1>
      <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">
        {description}
      </span>
    </div>
  );
}
