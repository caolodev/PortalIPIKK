import { AlertTriangle } from "lucide-react";

export default function UnderDevelopment({
  title = "Em desenvolvimento",
  description = "Esta página ainda está a ser construída. Lamentamos a inconveniência enquanto seguimos com a implementação.",
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
        <p className="mt-4 text-sm text-slate-400">
          Obrigado pela paciência. Voltaremos em breve com conteúdo funcional.
        </p>
      </div>
    </div>
  );
}
