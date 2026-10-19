export default function AuthBrandMark() {
  return (
    <div className="mb-7 flex flex-col items-center">
      <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
        {/* soft ambient glow */}
        <span
          className="absolute -inset-3 rounded-full"
          style={{ background: 'radial-gradient(circle, #00e8b42a, transparent 70%)' }}
        />
        {/* pulsing ring, like a live GPS ping */}
        <span
          className="absolute inset-0 rounded-full border border-neon/30"
          style={{ animation: 'zone-pulse 2.6s ease infinite' }}
        />
        <span className="absolute inset-2 rounded-full border border-neon/15" />

        {/* badge */}
        <div
          className="relative w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, #00e8b4, #007a62)',
            boxShadow: '0 0 28px #00e8b455, inset 0 1px 1px #ffffff40',
          }}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-ground">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
      </div>
      <div className="font-display font-bold text-xl text-text tracking-widest">TRIPMONITOR</div>
    </div>
  )
}
