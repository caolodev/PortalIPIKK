import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faPersonChalkboard,
  faSchool,
} from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
export default function Funcionalidades() {
  return (
    <section id="sistema" className="px-6 py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-[#0F2C59] mb-4">
            Recursos Especializados
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
            Desenhado para cada necessidade
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-10 bg-white rounded-4xl border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-2 group">
            <div className="w-16 h-16 bg-blue-50 text-[#0F2C59] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#0F2C59] group-hover:text-white transition-colors">
              <FontAwesomeIcon icon={faGraduationCap} className="text-2xl" />
            </div>
            <h3 className="text-2xl font-black text-[#0F2C59] mb-4">
              Área do Aluno
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-500 font-medium">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="lucide lucide-circle-check h-5 w-5 text-green-500 shrink-0"
                />
                Consulta de notas em tempo real
              </li>
              <li className="flex items-center gap-3 text-gray-500 font-medium">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="lucide lucide-circle-check h-5 w-5 text-green-500 shrink-0"
                />
                Histórico académico completo
              </li>
              <li className="flex items-center gap-3 text-gray-500 font-medium">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="lucide lucide-circle-check h-5 w-5 text-green-500 shrink-0"
                />
                Informações de turma e desempenho
              </li>
            </ul>
          </div>
          <div className="p-10 bg-white rounded-4xl border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-2 group">
            <div className="w-16 h-16 bg-blue-50 text-[#0F2C59] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#0F2C59] group-hover:text-white transition-colors">
              <FontAwesomeIcon icon={faPersonChalkboard} className="text-2xl" />
            </div>
            <h3 className="text-2xl font-black text-[#0F2C59] mb-4">
              Área do Professor
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-500 font-medium">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="lucide lucide-circle-check h-5 w-5 text-green-500 shrink-0"
                />
                Lançamento ágil de avaliações
              </li>
              <li className="flex items-center gap-3 text-gray-500 font-medium">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="lucide lucide-circle-check h-5 w-5 text-green-500 shrink-0"
                />
                Gestão simplificada de turmas
              </li>
              <li className="flex items-center gap-3 text-gray-500 font-medium">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="lucide lucide-circle-check h-5 w-5 text-green-500 shrink-0"
                />
                Acompanhamento do progresso
              </li>
            </ul>
          </div>
          <div className="p-10 bg-white rounded-4xl border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-2 group">
            <div className="w-16 h-16 bg-blue-50 text-[#0F2C59] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#0F2C59] group-hover:text-white transition-colors">
              <FontAwesomeIcon icon={faSchool} className="text-2xl" />
            </div>
            <h3 className="text-2xl font-black text-[#0F2C59] mb-4">
              Área da Direcção
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-500 font-medium">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="lucide lucide-circle-check h-5 w-5 text-green-500 shrink-0"
                />
                Supervisão institucional global
              </li>
              <li className="flex items-center gap-3 text-gray-500 font-medium">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="lucide lucide-circle-check h-5 w-5 text-green-500 shrink-0"
                />
                Relatórios de desempenho
              </li>
              <li className="flex items-center gap-3 text-gray-500 font-medium">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="lucide lucide-circle-check h-5 w-5 text-green-500 shrink-0"
                />
                Gestão administrativa centralizada
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
