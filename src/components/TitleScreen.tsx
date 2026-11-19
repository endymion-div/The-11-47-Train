import type { Difficulty } from '../game/types';

interface TitleScreenProps {
  difficulty: Difficulty;
  hasSave: boolean;
  onSelectDifficulty: (d: Difficulty) => void;
  onStartNew: () => void;
  onContinue: () => void;
}

const DIFFICULTIES: { id: Difficulty; label: string; note: string }[] = [
  { id: 'casual', label: 'Casual Detective', note: 'Clearer observation glints & helpful cues' },
  { id: 'investigator', label: 'Investigator', note: 'Balanced deductions & subtle highlights' },
  { id: 'master', label: 'Master Detective', note: 'Minimal markers — pure manual deduction' },
];

export function TitleScreen({
  difficulty,
  hasSave,
  onSelectDifficulty,
  onStartNew,
  onContinue,
}: TitleScreenProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07090e] text-[#efe6d4]">
      {/* Illustrated Key-Art Backdrop */}
      <img
        src="/src/assets/images/title_silver_meridian_1795070417616.jpg"
        alt="The Silver Meridian steam train crossing a stormy viaduct at night"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover object-right select-none"
      />

      {/* Scrim strictly protecting left negative space for contrast */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#07090e]/95 via-[#07090e]/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#07090e]/90 via-transparent to-[#07090e]/40"
      />

      {/* Left-third asymmetric lockup */}
      <main className="relative z-10 flex h-full w-full max-w-4xl flex-col justify-between px-6 py-8 sm:px-12 sm:py-12">
        <div className="text-xs tracking-[0.22em] text-[#c89b48] uppercase font-mono-num">
          The Silver Meridian · 11:20 PM Dispatch
        </div>

        <section className="my-auto flex max-w-xl flex-col items-start gap-6">
          {/* Bespoke inline SVG Art-Deco Title Lockup */}
          <div className="w-full max-w-md">
            <svg
              viewBox="0 0 460 155"
              className="w-full h-auto drop-shadow-[0_6px_22px_rgba(0,0,0,0.85)]"
              role="img"
              aria-label="The 11:47 Train"
            >
              {/* Brass pocket-watch crest */}
              <circle cx="38" cy="48" r="26" fill="#14110e" stroke="#c89b48" strokeWidth="2.5" />
              <circle cx="38" cy="48" r="20" fill="none" stroke="#85632a" strokeWidth="1" />
              <rect x="34" y="15" width="8" height="7" rx="1.5" fill="#c89b48" />
              {/* Clock hands at 11:47 */}
              <line x1="38" y1="48" x2="32" y2="34" stroke="#f0dfb8" strokeWidth="2.4" strokeLinecap="round" />
              <line x1="38" y1="48" x2="23" y2="54" stroke="#c89b48" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="38" cy="48" r="2.5" fill="#c89b48" />

              {/* Decorative horizontal brass hairline */}
              <line x1="78" y1="30" x2="430" y2="30" stroke="#9d7735" strokeWidth="1" opacity="0.7" />
              <text
                x="80"
                y="24"
                fill="#c89b48"
                fontSize="11"
                letterSpacing="4"
                fontFamily="JetBrains Mono, monospace"
              >
                CASE FILE NO. 07 · CARRIAGE 7
              </text>

              <text
                x="78"
                y="74"
                fill="#f6efe0"
                fontSize="44"
                fontWeight="700"
                fontFamily="Playfair Display, Georgia, serif"
                letterSpacing="1"
              >
                THE 11:47 TRAIN
              </text>

              <line x1="12" y1="96" x2="430" y2="96" stroke="#c89b48" strokeWidth="1.2" opacity="0.55" />
              <text
                x="14"
                y="124"
                fill="#d6ccb9"
                fontSize="16"
                fontStyle="italic"
                fontFamily="Lora, Georgia, serif"
              >
                “The train has 90 seconds to hide the truth.”
              </text>
            </svg>
          </div>

          {/* Difficulty Selector */}
          <fieldset className="w-full max-w-md border-0 p-0 m-0">
            <legend className="mb-2 text-xs font-medium tracking-wider text-[#b7aa94]">
              Investigation Difficulty
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DIFFICULTIES.map((item) => {
                const active = difficulty === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectDifficulty(item.id)}
                    className={`min-h-[44px] px-3 py-2 text-left border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#2a2117] border-[#c89b48] text-[#f7eedc]'
                        : 'bg-[#120f0c]/85 border-[#3c3022] text-[#b4a792] hover:border-[#8a6830] hover:text-[#efe6d4]'
                    }`}
                  >
                    <div className="text-xs font-semibold whitespace-nowrap">{item.label}</div>
                    <div className="mt-0.5 text-[11px] leading-snug opacity-80">{item.note}</div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Primary Action CTAs (<= 3 actions total) */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-start="true"
              onClick={onStartNew}
              className="min-h-[46px] px-7 py-2.5 bg-[#c89b48] text-[#140f0a] font-semibold text-sm tracking-wide hover:bg-[#dbb05d] active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
            >
              Board Train · Start Investigation
            </button>

            {hasSave && (
              <button
                type="button"
                onClick={onContinue}
                className="min-h-[46px] px-6 py-2.5 bg-[#1b1611]/90 border border-[#c89b48]/60 text-[#efe6d4] text-sm font-medium hover:bg-[#2a2118] transition-colors cursor-pointer whitespace-nowrap"
              >
                Continue Saved Case
              </button>
            )}
          </div>
        </section>

        {/* Single flat control-hint line in bottom safe margin */}
        <footer className="text-xs text-[#b5a994]/90 font-mono-num tracking-wide">
          Enter / Space Start · A/D or Click Move · O Observation · N Notebook · M Mute · Esc Pause
        </footer>
      </main>
    </div>
  );
}
