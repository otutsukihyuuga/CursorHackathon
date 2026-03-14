import Link from 'next/link';

const FEATURES = [
  { icon: '🎙', text: 'Record or upload audio directly in the browser' },
  { icon: '🔒', text: 'Stays on your device — nothing leaves your browser' },
  { icon: '💾', text: 'Save recordings locally to your file system' },
];

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col overflow-hidden relative">
      {/* Decorative gradient blob */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-700/15 rounded-full blur-3xl pointer-events-none"
      />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center relative z-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest">
            EchoVoice
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Preserve the voice
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-rose-400">
              you never want to forget
            </span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
            Upload a loved one&apos;s voice sample or record a question —
            all privately, right in your browser.
          </p>

          {/* CTA cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
            {/* Upload card */}
            <Link
              href="/upload"
              className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-2xl p-6 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <div className="text-4xl mb-4" aria-hidden="true">🎤</div>
              <h2 className="text-white font-semibold text-lg mb-2">
                Upload a Voice
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload an existing audio file or record a new voice sample for your loved one.
              </p>
              <span
                aria-hidden="true"
                className="absolute bottom-5 right-5 text-purple-400 group-hover:translate-x-1 transition-transform"
              >
                →
              </span>
            </Link>

            {/* Ask card */}
            <Link
              href="/ask"
              className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rose-500/50 rounded-2xl p-6 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <div className="text-4xl mb-4" aria-hidden="true">💬</div>
              <h2 className="text-white font-semibold text-lg mb-2">
                Ask a Question
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Record your spoken question and save it locally — ready for future voice responses.
              </p>
              <span
                aria-hidden="true"
                className="absolute bottom-5 right-5 text-rose-400 group-hover:translate-x-1 transition-transform"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-white/10 py-10 px-4 relative z-10">
        <ul className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-center gap-6 sm:gap-10">
          {FEATURES.map(({ icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-slate-400">
              <span className="text-xl flex-shrink-0" aria-hidden="true">{icon}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
