import React, { useState } from 'react';
import { Search, Shield, AlertCircle, ExternalLink, Scale, Info, Loader2, ChevronRight, Zap, MessageSquare, Send } from 'lucide-react';
import { analyzePolitician, expandInvestigation, askSpecificQuestion } from './services/geminiService';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QA {
  question: string;
  answer: string;
}

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const [asking, setAsking] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [expandedContent, setExpandedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [qaList, setQaList] = useState<QA[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setReport(null);
    setExpandedContent(null);
    setQaList([]);

    try {
      const result = await analyzePolitician(query);
      setReport(result);
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al realizar la investigación. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async () => {
    if (!report || !query) return;

    setExpanding(true);
    try {
      const result = await expandInvestigation(query, report);
      setExpandedContent(result);
    } catch (err) {
      console.error(err);
      setError('No se pudo ampliar la investigación. Intenta de nuevo.');
    } finally {
      setExpanding(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !query) return;

    setAsking(true);
    const currentQuestion = question;
    setQuestion('');

    try {
      const answer = await askSpecificQuestion(query, currentQuestion);
      setQaList(prev => [...prev, { question: currentQuestion, answer }]);
    } catch (err) {
      console.error(err);
      setError('No se pudo obtener respuesta a tu pregunta.');
    } finally {
      setAsking(false);
    }
  };

  const extractScore = (text: string | null) => {
    if (!text) return null;
    const match = text.match(/(\d+)\s*%/);
    return match ? parseInt(match[1]) : null;
  };

  const score = extractScore(expandedContent || report);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Monitor de Integridad <span className="text-emerald-600">Mendoza</span></h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span>Datos Públicos</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>Marcos Internacionales</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>Transparencia</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero & Search */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900"
          >
            Análisis de Integridad Pública
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto mb-10 text-lg leading-relaxed"
          >
            Investigación basada en datos abiertos y estándares internacionales de transparencia para el monitoreo de la función pública en Mendoza.
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="max-w-xl mx-auto relative group"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ingresa el nombre de un político (ej. Alfredo Cornejo)"
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-lg"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analizar'}
              </button>
            </div>
          </motion.form>
        </div>

        {/* Disclaimer */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Aviso Legal:</strong> Este informe es generado automáticamente mediante inteligencia artificial utilizando datos públicos disponibles en la web. Los resultados son análisis informativos basados en marcos de transparencia internacionales y no constituyen sentencias judiciales ni verdades absolutas. Se recomienda verificar la información con fuentes oficiales.
            </p>
          </div>
        </div>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-6"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <Shield className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-gray-900">Investigando registros públicos...</p>
                <p className="text-sm text-gray-500 animate-pulse">Consultando bases de datos, declaraciones juradas y reportes de prensa.</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 max-w-2xl mx-auto"
            >
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <h3 className="font-bold text-red-900 mb-1">Error en la investigación</h3>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {report && !loading && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Report Header */}
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider">
                      <Scale className="w-4 h-4" />
                      Reporte de Integridad Pública
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{query}</h3>
                    <p className="text-gray-500">Análisis basado en variables internacionales de transparencia</p>
                  </div>
                  
                  {/* Score Display */}
                  {score !== null && (
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-gray-400">Nivel de Integridad</div>
                        <div className={cn(
                          "text-2xl font-black",
                          score > 70 ? "text-emerald-600" : score > 40 ? "text-amber-500" : "text-red-600"
                        )}>
                          {score}%
                        </div>
                      </div>
                      <div className="w-16 h-16 rounded-full border-4 border-gray-100 relative flex items-center justify-center overflow-hidden">
                        <div 
                          className={cn(
                            "absolute bottom-0 left-0 right-0 transition-all duration-1000",
                            score > 70 ? "bg-emerald-600" : score > 40 ? "bg-amber-500" : "bg-red-600"
                          )}
                          style={{ height: `${score}%`, opacity: 0.2 }}
                        />
                        <Shield className={cn(
                          "w-6 h-6",
                          score > 70 ? "text-emerald-600" : score > 40 ? "text-amber-500" : "text-red-600"
                        )} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Markdown Content */}
                <div className="prose prose-emerald max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600">
                  <Markdown>{report}</Markdown>
                </div>

                {/* Expansion Area */}
                <AnimatePresence>
                  {expandedContent && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-12 pt-12 border-t border-dashed border-gray-200"
                    >
                      <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-wider mb-6">
                        <Zap className="w-4 h-4" />
                        Anexo de Investigación Exhaustiva
                      </div>
                      <div className="prose prose-amber max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700">
                        <Markdown>{expandedContent}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Q&A Area */}
                <div className="mt-12 pt-12 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider mb-8">
                    <MessageSquare className="w-4 h-4" />
                    Consultas Específicas sobre Fuentes Oficiales
                  </div>

                  <div className="space-y-6 mb-8">
                    {qaList.map((qa, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className="bg-emerald-100 p-1.5 rounded-lg shrink-0">
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                          </div>
                          <p className="font-bold text-gray-900">{qa.question}</p>
                        </div>
                        <div className="prose prose-sm prose-emerald max-w-none text-gray-600 pl-10">
                          <Markdown>{qa.answer}</Markdown>
                        </div>
                      </motion.div>
                    ))}
                    {asking && (
                      <div className="flex items-center gap-3 p-6 bg-gray-50 rounded-2xl animate-pulse">
                        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                        <p className="text-sm text-gray-500 font-medium">Buscando en boletines oficiales y registros gubernamentales...</p>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAskQuestion} className="relative">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Haz una pregunta específica (ej. ¿Tiene causas en el Boletín Oficial?)"
                      className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={asking || !question.trim()}
                      className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {!expandedContent && (
                  <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center">
                    <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
                      ¿Necesitas profundizar más? Nuestra IA puede realizar una búsqueda exhaustiva de vínculos empresariales, nepotismo y financiamiento.
                    </p>
                    <button
                      onClick={handleExpand}
                      disabled={expanding}
                      className="flex items-center gap-2 px-8 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50"
                    >
                      {expanding ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Ampliando investigación...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Ampliar Investigación Exhaustiva
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-500">
                <p>¿Deseas realizar otro análisis?</p>
                <button 
                  onClick={() => { setReport(null); setExpandedContent(null); setQuery(''); setQaList([]); }}
                  className="flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Nueva búsqueda <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Info */}
        {!report && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            {[
              {
                icon: <Scale className="w-6 h-6" />,
                title: "Marcos Internacionales",
                desc: "Evaluamos datos contra estándares de la OCDE y Transparency International."
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Datos Verificables",
                desc: "Priorizamos información de registros oficiales y prensa reconocida."
              },
              {
                icon: <ExternalLink className="w-6 h-6" />,
                title: "Fuentes Abiertas",
                desc: "Toda la información proviene de fuentes públicas y accesibles a la ciudadanía."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-emerald-600 mb-4">{feature.icon}</div>
                <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-semibold">Mendoza Integrity Monitor</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-emerald-600 transition-colors">Metodología</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Fuentes de Datos</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Contacto</a>
          </div>
          <p className="text-xs text-gray-400">© 2024 Iniciativa de Transparencia Ciudadana</p>
        </div>
      </footer>
    </div>
  );
}
