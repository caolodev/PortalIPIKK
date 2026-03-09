export default function HeaderForm({ title, description }) {
  return (
    <div className="flex flex-col space-y-1 p-6 pb-4 text-center">
      <h2 className="tracking-tight text-2xl font-black text-center text-[#0F2C59]">
        {title}
      </h2>
      <p className="text-sm text-center font-medium text-gray-500">
        {description}
      </p>
    </div>
  );
}
