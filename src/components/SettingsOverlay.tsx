import { useGameStore, GameMode, InputMethod, Region, SessionLength } from '../store/useGameStore';
import { Globe, Flag, MapPin, Keyboard, MousePointer2, Timer as TimerIcon, Play, ListOrdered } from 'lucide-react';
import { cn } from '../lib/utils';

export const SettingsOverlay = () => {
  const { gameMode, inputMethod, isTimed, selectedRegion, sessionLength, setSettings, startGame } = useGameStore();

  const regions: Region[] = ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];
  const modes: { id: GameMode; label: string; icon: any }[] = [
    { id: 'FLAGS', label: 'Flags', icon: Flag },
    { id: 'CAPITALS', label: 'Capitals', icon: MapPin },
    { id: 'MIXED', label: 'Mixed', icon: Globe },
  ];

  const lengths: { id: SessionLength; label: string; desc: string }[] = [
    { id: 10, label: 'Coffee Break', desc: '10 Questions' },
    { id: 25, label: 'Standard', desc: '25 Questions' },
    { id: 50, label: 'Marathon', desc: '50 Questions' },
    { id: 'All', label: 'Full World', desc: 'All Countries' },
    { id: 'Endless', label: 'Endless', desc: 'No Limit' },
  ];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 shadow-2xl my-auto">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 md:mb-4 tracking-tighter italic">GEOMASTER</h1>
          <p className="text-xs md:text-sm text-gray-400 font-medium uppercase tracking-widest">Configure your mission parameters</p>
        </div>

        <div className="space-y-6 md:space-y-10">
          {/* Region Selection */}
          <section>
            <h3 className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-gray-500 mb-3 md:mb-4 flex items-center gap-2">
              <Globe size={12} className="md:w-[14px] md:h-[14px]" /> Region
            </h3>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {regions.map((r) => (
                <button
                  key={r}
                  onClick={() => setSettings({ selectedRegion: r })}
                  className={cn(
                    "px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-sm font-bold transition-all border-2",
                    selectedRegion === r 
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </section>

          {/* Session Length */}
          <section>
            <h3 className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-gray-500 mb-3 md:mb-4 flex items-center gap-2">
              <ListOrdered size={12} className="md:w-[14px] md:h-[14px]" /> Session Length
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 md:gap-2">
              {lengths.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSettings({ sessionLength: l.id })}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 md:p-3 rounded-xl transition-all border-2 text-center",
                    sessionLength === l.id 
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  )}
                >
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-tighter">{l.label}</span>
                  <span className="text-[8px] md:text-[10px] opacity-60 font-medium">{l.desc}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
            {/* Game Mode */}
            <section>
              <h3 className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-gray-500 mb-3 md:mb-4 flex items-center gap-2">
                <Flag size={12} className="md:w-[14px] md:h-[14px]" /> Game Mode
              </h3>
              <div className="grid grid-cols-1 gap-1.5 md:gap-2">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSettings({ gameMode: m.id })}
                    className={cn(
                      "flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl text-left transition-all border-2",
                      gameMode === m.id 
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                        : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                    )}
                  >
                    <m.icon size={18} className="md:w-5 md:h-5" />
                    <span className="text-sm md:text-base font-bold">{m.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Input Method */}
            <section>
              <h3 className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-gray-500 mb-3 md:mb-4 flex items-center gap-2">
                <Keyboard size={12} className="md:w-[14px] md:h-[14px]" /> Input Method
              </h3>
              <div className="grid grid-cols-1 gap-1.5 md:gap-2">
                <button
                  onClick={() => setSettings({ inputMethod: 'CHOICE' })}
                  className={cn(
                    "flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl text-left transition-all border-2",
                    inputMethod === 'CHOICE' 
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  )}
                >
                  <MousePointer2 size={18} className="md:w-5 md:h-5" />
                  <div>
                    <p className="text-sm md:text-base font-bold">Multiple Choice</p>
                    <p className="text-[8px] md:text-[10px] opacity-60 uppercase tracking-wider font-black">1.0x Multiplier</p>
                  </div>
                </button>
                <button
                  onClick={() => setSettings({ inputMethod: 'TYPING' })}
                  className={cn(
                    "flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl text-left transition-all border-2",
                    inputMethod === 'TYPING' 
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  )}
                >
                  <Keyboard size={18} className="md:w-5 md:h-5" />
                  <div>
                    <p className="text-sm md:text-base font-bold">Typing</p>
                    <p className="text-[8px] md:text-[10px] opacity-60 uppercase tracking-wider font-black">2.0x Multiplier</p>
                  </div>
                </button>
              </div>
            </section>
          </div>

          {/* Difficulty / Timer */}
          <section className="flex items-center justify-between p-4 md:p-6 bg-gray-800/50 rounded-xl md:rounded-2xl border border-gray-700">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-yellow-500/10 rounded-lg md:rounded-xl text-yellow-500">
                <TimerIcon size={20} className="md:w-6 md:h-6" />
              </div>
              <div>
                <p className="text-sm md:text-base font-bold text-white">Competitive Mode</p>
                <p className="text-[10px] md:text-sm text-gray-400">10s timer + Speed bonus</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ isTimed: !isTimed })}
              className={cn(
                "w-12 md:w-14 h-6 md:h-8 rounded-full transition-colors relative",
                isTimed ? "bg-blue-600" : "bg-gray-700"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 md:w-6 h-4 md:h-6 bg-white rounded-full transition-all",
                isTimed ? "left-7 md:left-7" : "left-1"
              )} />
            </button>
          </section>

          <button
            onClick={startGame}
            className="w-full py-4 md:py-6 bg-white text-black font-black text-lg md:text-xl rounded-xl md:rounded-2xl hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-3 group"
          >
            <Play size={20} className="md:w-6 md:h-6 fill-current group-hover:scale-110 transition-transform" />
            START MISSION
          </button>
        </div>
      </div>
    </div>
  );
};
