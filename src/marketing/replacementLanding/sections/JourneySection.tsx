import { useEffect, useState } from "react"

export function JourneySection() {
  const [progress, setProgress] = useState(220)

  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return

    const timer = window.setInterval(
      () => setProgress((value) => (value >= 1000 ? 0 : value + 5)),
      180,
    )

    return () => window.clearInterval(timer)
  }, [playing])

  const point = (progress / 1000) * 1120 + 40

  const speed =
    (progress > 150 && progress < 300) || (progress > 650 && progress < 780)
      ? 0
      : Math.round(16 + 40 * Math.abs(Math.sin(progress / 130)))

  const clockMinutes = 40 + Math.round((progress / 1000) * 300)

  return (
    <section id="journey" className="relative py-28 overflow-hidden">
      {" "}
      <div className="max-w-[1360px] mx-auto px-6 lg:px-10">
        {" "}
        <div className="grid lg:grid-cols-12 gap-10 mb-14">
          {" "}
          <div className="lg:col-span-5">
            {" "}
            <p className="font-mono text-[12px] tracking-[.18em] text-mint/90">
              {"الرحلات"}
            </p>{" "}
            <h2 className="font-display mt-5 text-[34px] lg:text-[46px] font-semibold leading-[1.25]">
              {"الرحلة ليست خطًا."}
              <br />
              {"إنها زمن يتكشف."}
            </h2>{" "}
          </div>{" "}
          <p className="lg:col-span-5 lg:col-start-8 self-end text-mist leading-relaxed">
            {
              "استعرض رحلة المركبة كاملة: المسار، والسرعة، والتوقفات، وأوقات كل حدث — في عرض واحد متزامن. "
            }
            <span className="text-fog/70">{"رحلة توضيحية، قيم افتراضية."}</span>
          </p>{" "}
        </div>{" "}
        <div
          id="journeyCard"
          className="relative rounded-[20px] border border-pet-700 bg-gradient-to-b from-pet-850 to-pet-900 p-6 lg:p-10"
        >
          {" "}
          <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
            {" "}
            <div className="flex items-center gap-4">
              {" "}
              <span className="w-10 h-10 rounded-xl bg-pet-800 border border-pet-600 grid place-items-center text-mint">
                <i className="fa-solid fa-truck text-[14px]" />
              </span>{" "}
              <div>
                <p className="text-[15px]">
                  <span className="font-mono">{"RUH-4471"}</span>
                  {" · جولة التوزيع الصباحية"}
                </p>
                <p className="text-[12px] text-mist">
                  {"مستودع الشمال ← 4 نقاط تسليم ← مستودع الشمال"}
                </p>
              </div>{" "}
            </div>{" "}
            <div className="flex items-center gap-8">
              {" "}
              <div>
                <p className="text-[11px] text-mist">{"الوقت"}</p>
                <p
                  id="jTime"
                  className="font-mono text-[20px] text-fog"
                >{`${String(7 + Math.floor(clockMinutes / 60)).padStart(2, "0")}:${String(clockMinutes % 60).padStart(2, "0")}`}</p>
              </div>{" "}
              <div>
                <p className="text-[11px] text-mist">{"السرعة"}</p>
                <p className="text-[20px] text-fog">
                  <span id="jSpeed" className="font-mono">
                    {speed}
                  </span>
                  <span className="text-[12px] text-mist">{" كم/س"}</span>
                </p>
              </div>{" "}
              <div>
                <p className="text-[11px] text-mist">{"الحالة"}</p>
                <p
                  id="jState"
                  className={`text-[18px] ${
                    speed ? "text-mint" : "text-amber"
                  }`}
                >
                  {speed ? "متحركة" : "متوقفة"}
                </p>
              </div>{" "}
              <div className="hidden md:block">
                <p className="text-[11px] text-mist">{"الحدث"}</p>
                <p id="jEvent" className="text-[14px] text-fog max-w-[180px]">
                  {progress > 650 && progress < 780
                    ? "توقف عند نقطة التسليم"
                    : progress > 380 && progress < 430
                      ? "دخول منطقة عميل · العليا"
                      : "—"}
                </p>
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div dir="ltr">
            {" "}
            <svg
              viewBox="0 0 1200 220"
              className="w-full h-auto"
              aria-hidden="true"
            >
              {" "}
              <defs>
                <pattern
                  id="g2"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M40 0H0V40"
                    fill="none"
                    stroke="#123A41"
                    strokeWidth=".7"
                  />
                </pattern>
              </defs>{" "}
              <rect width="1200" height="220" rx="14" fill="url(#g2)" />{" "}
              <path d="M0 150 H1200" stroke="#163F46" strokeWidth="10" />{" "}
              <path
                d="M300 0 V220 M760 0 V220"
                stroke="#163F46"
                strokeWidth="6"
              />{" "}
              <path
                id="jPath"
                d="M40 170 C 140 170 160 70 260 80 S 380 160 470 120 S 600 40 700 70 S 820 180 920 140 S 1080 60 1160 170"
                fill="none"
                stroke="#2FA987"
                strokeWidth="3"
                strokeLinecap="round"
              />{" "}
              <path
                id="jDone"
                d="M40 170 C 140 170 160 70 260 80 S 380 160 470 120 S 600 40 700 70 S 820 180 920 140 S 1080 60 1160 170"
                fill="none"
                stroke="#5EF2C2"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${progress * 1.2} 1400`}
              />{" "}
              <g id="jStops" />{" "}
              <g
                id="jMarker"
                transform={`translate(${point},${130 - Math.sin(progress / 150) * 65})`}
              >
                <circle r="14" fill="#5EF2C2" opacity=".15" />
                <circle r="7" fill="#06181C" stroke="#5EF2C2" strokeWidth="3" />
              </g>{" "}
            </svg>{" "}
            <svg
              id="profile"
              viewBox="0 0 1200 120"
              className="w-full h-auto mt-4"
              aria-hidden="true"
            >
              {" "}
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#5EF2C2" stopOpacity=".28" />
                  <stop offset="1" stopColor="#5EF2C2" stopOpacity="0" />
                </linearGradient>
              </defs>{" "}
              <g id="profStops" /> <path id="profArea" fill="url(#pg)" />{" "}
              <path
                id="profLine"
                fill="none"
                stroke="#5EF2C2"
                strokeWidth="1.6"
              />{" "}
              <line
                id="profCursor"
                y1="0"
                y2="120"
                stroke="#E4F1EE"
                strokeWidth="1"
                strokeDasharray="3 3"
              />{" "}
            </svg>{" "}
            <div className="flex justify-between font-mono text-[11px] text-mist mt-2 px-1">
              <span>{"07:00"}</span>
              <span>{"08:00"}</span>
              <span>{"09:00"}</span>
              <span>{"10:00"}</span>
              <span>{"11:00"}</span>
              <span>{"12:00"}</span>
            </div>{" "}
            <div className="relative mt-8">
              {" "}
              <div
                id="jTip"
                dir="rtl"
                className="absolute -top-12 -translate-x-1/2 whitespace-nowrap rounded-lg border border-mint/40 bg-pet-800 px-3 py-1.5 text-[12px] text-fog transition-opacity"
              >
                {"اسحب المؤشر لترى أين كانت المركبة، وبأي سرعة، ومتى توقفت."}
                <span className="absolute left-1/2 -bottom-1 w-2 h-2 bg-pet-800 border-r border-b border-mint/40 rotate-45 -translate-x-1/2" />
              </div>{" "}
              <input
                id="scrub"
                type="range"
                min="0"
                max="1000"
                value={progress}
                onChange={(event) => {
                  setProgress(Number(event.target.value))
                  setPlaying(false)
                }}
                className="scrub"
                aria-label="مؤشر زمن الرحلة"
              />{" "}
            </div>{" "}
          </div>{" "}
          <div className="mt-4 flex flex-wrap items-center gap-6 text-[12px] text-mist">
            {" "}
            <button
              id="jPlay"
              onClick={() => setPlaying((value) => !value)}
              className="h-8 px-3 rounded-lg border border-pet-600 text-fog hover:border-mint/50"
            >
              <i
                className={`fa-solid ${
                  playing ? "fa-pause" : "fa-play"
                } text-[10px] me-1.5`}
              />
              <span>{playing ? "إيقاف مؤقت" : "تشغيل"}</span>
            </button>{" "}
            <span className="flex items-center gap-2">
              <span className="w-3 h-[2px] bg-mint" />
              {"السرعة عبر الزمن"}
            </span>{" "}
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-pet-700" />
              {"توقف"}
            </span>{" "}
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-amber/70" />
              {"توقف أطول من المخطط"}
            </span>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </section>
  )
}
