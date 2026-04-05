import Link from "next/link";
export default function FooterForm({ link, question, linkText }) {
  return (
    <div className="flex items-center p-6 justify-center pt-8 pb-2">
      <p className="text-sm font-medium text-gray-500">
        {question}
        <Link href={link} className="font-black text-[#0F2C59] hover:underline">
          {linkText}
        </Link>
      </p>
    </div>
  );
}
