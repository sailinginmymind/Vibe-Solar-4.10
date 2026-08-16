import React from 'react';

export default function PowerDisplay({ total, services, ps }) {
  const totalW = total || 0;
  const servicesW = services || 0;
  const psW = ps || 0;

  const maxPower = 1000;
  const totalPercent = Math.min((totalW / maxPower) * 100, 100);
  const servicesPercent = Math.min((servicesW / maxPower) * 100, 100);
  const psPercent = Math.min((psW / maxPower) * 100, 100);

  return (
    <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-white/30">
          Potenza istantanea
        </span>
        <span className="text-[10px] text-white/20 font-mono">
          in tempo reale
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-4xl font-black text-[#38bdf8] drop-shadow-[0_0_20px_rgba(56,189,248,0.2)]">
              {Math.round(totalW)}
            </span>
            <span className="text-xl font-bold text-white/40 mb-1">W</span>
          </div>
          <div className="text-[10px] text-white/30 font-medium tracking-wider">
            Totale prodotto
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/20 font-mono">
            {totalW > 0 ? '☀️ In produzione' : '🌙 Inattivo'}
          </div>
        </div>
      </div>

      <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#38bdf8] to-[#1d4ed8] transition-all duration-700 ease-out"
          style={{ width: `${totalPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="glass-strong rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔋</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                Servizi
              </span>
            </div>
            <span className="text-lg font-bold text-[#fbbf24]">
              {Math.round(servicesW)} <span className="text-xs font-normal text-white/30">W</span>
            </span>
          </div>
          <div className="relative w-full h-1.5 mt-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#fbbf24] transition-all duration-700 ease-out"
              style={{ width: `${servicesPercent}%` }}
            />
          </div>
        </div>

        <div className="glass-strong rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔌</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                Power Station
              </span>
            </div>
            <span className="text-lg font-bold text-[#f472b6]">
              {Math.round(psW)} <span className="text-xs font-normal text-white/30">W</span>
            </span>
          </div>
          <div className="relative w-full h-1.5 mt-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#f472b6] transition-all duration-700 ease-out"
              style={{ width: `${psPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] text-white/20 font-medium tracking-wider">
        <div className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span>Sistema attivo</span>
        </div>
        <div>
          {totalW > 0 ? (
            <span>⚡ Rendimento: {Math.round((totalW / (servicesW + psW + 0.1)) * 100)}%</span>
          ) : (
            <span>⏳ In attesa di produzione</span>
          )}
        </div>
      </div>
    </div>
  );
}