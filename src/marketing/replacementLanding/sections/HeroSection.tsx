import { useState } from "react"

export function HeroSection() {
  const [stage, setStage] = useState(0)

  const stages = ["device", "location", "movement", "time", "data"]

  const route = "M90 500 L90 450 L210 450 L210 300 L390 300 L390 120 L450 120"

  const cityBlocks = [
    [230, 20, 60, 70, 70],
    [300, 30, 70, 60, 46],
    [60, 140, 110, 60, 36],
    [240, 140, 120, 50, 58],
    [420, 240, 80, 40, 30],
    [230, 320, 70, 60, 24],
    [420, 320, 120, 90, 52],
    [60, 320, 120, 90, 40],
    [240, 470, 120, 90, 30],
    [440, 470, 110, 40, 18],
  ]

  return (
    <section
      id="hero"
      className="pre relative h-[1180px] lg:h-[880px] overflow-hidden"
    >
      {" "}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_32%_48%,#0E3A3D_0%,#082025_45%,#06181C_75%)]" />{" "}
      <svg
        className="absolute inset-0 w-full h-full opacity-[.16]"
        aria-hidden="true"
        preserveAspectRatio="none"
        viewBox="0 0 1440 880"
      >
        {" "}
        <g fill="none" stroke="#5EF2C2" strokeWidth=".7">
          {" "}
          <path d="M-20 700 C 200 640 360 720 560 660 S 900 560 1100 600 S 1360 640 1460 580" />{" "}
          <path d="M-20 760 C 220 700 380 780 580 720 S 920 620 1120 660 S 1380 700 1460 640" />{" "}
          <path d="M-20 820 C 240 760 400 840 600 780 S 940 680 1140 720 S 1400 760 1460 700" />{" "}
          <path d="M-20 160 C 260 220 420 120 700 170 S 1100 260 1460 180" />{" "}
          <path d="M-20 100 C 280 160 440 60 720 110 S 1120 200 1460 120" />{" "}
        </g>{" "}
      </svg>{" "}
      <div className="absolute inset-0 grain opacity-60" />{" "}
      <div className="relative max-w-[1360px] mx-auto px-6 lg:px-10 h-full grid lg:grid-cols-12">
        {" "}
        <div className="hero-copy lg:col-span-5 pt-[120px] lg:pt-[200px] relative z-20">
          {" "}
          <p className="font-mono text-[12px] tracking-[.18em] text-mint/90 flex items-center gap-3">
            {" "}
            <span className="w-6 h-px bg-mint/70" />
            <span>{"منصة متابعة الأساطيل · تتبّع GPS والحساسات"}</span>{" "}
          </p>{" "}
          <h1 className="font-display mt-7 text-[46px] sm:text-[60px] xl:text-[72px] leading-[1.15] font-semibold">
            {"من الطريق"}
            <br />
            {"إلى "}
            <span className="text-mint">{"القرار."}</span>
          </h1>{" "}
          <p className="mt-7 text-[17px] leading-[1.9] text-mist max-w-[470px]">
            {
              "حوّل بيانات مركباتك وحساساتها إلى رؤية تشغيلية متكاملة. اكتشف ما يستدعي الانتباه، وتابع الأحداث المهمة، واتخذ قرارات أسرع تساعدك على حماية عملياتك وتقليل الخسائر."
            }
          </p>{" "}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {" "}
            <a
              href="#cta"
              className="group inline-flex h-12 items-center gap-3 px-6 rounded-xl bg-mint text-pet-900 font-semibold text-[15px] hover:bg-[#8AF7D4] transition-colors"
            >
              {" "}
              <span>{"اطلب عرضًا توضيحيًا"}</span>
              <i className="fa-solid fa-arrow-left text-[13px] transition-transform group-hover:-translate-x-1" />{" "}
            </a>{" "}
            <a
              href="#preview"
              className="inline-flex h-12 items-center gap-3 px-5 rounded-xl border border-pet-600 text-fog text-[15px] hover:border-mist/60 hover:bg-pet-800/60 transition-colors"
            >
              {" "}
              <i className="fa-solid fa-map-location-dot text-mint text-[13px]" />
              <span>{"استكشف المنصة"}</span>{" "}
            </a>{" "}
          </div>{" "}
        </div>{" "}
        <div
          id="scene"
          data-stage={stages[stage]}
          dir="ltr"
          className="lg:col-span-7 relative h-[680px] lg:h-full lg:-ml-24"
        >
          {" "}
          <div className="stage-scale absolute inset-0">
            {" "}
            <div className="stage">
              {" "}
              <div className="plate" id="plate">
                {" "}
                <div className="wall-y slab-b" />{" "}
                <div className="wall-x slab-l" />{" "}
                <svg
                  className="absolute inset-0"
                  width="600"
                  height="600"
                  viewBox="0 0 600 600"
                  aria-hidden="true"
                >
                  {" "}
                  <defs>
                    {" "}
                    <pattern
                      id="g"
                      width="30"
                      height="30"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M30 0H0V30"
                        fill="none"
                        stroke="#1A434A"
                        strokeWidth=".6"
                      />
                    </pattern>{" "}
                    <linearGradient id="plateFill" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#0E3238" />
                      <stop offset="1" stopColor="#082226" />
                    </linearGradient>{" "}
                  </defs>{" "}
                  <rect width="600" height="600" fill="url(#plateFill)" />{" "}
                  <rect width="600" height="600" fill="url(#g)" />{" "}
                  <path
                    d="M600 0 L600 210 C 540 190 500 120 470 60 L450 0Z"
                    fill="#0A2B33"
                  />{" "}
                  <path
                    d="M600 0 L600 210 C 540 190 500 120 470 60 L450 0"
                    fill="none"
                    stroke="#1F5560"
                    strokeWidth="1"
                  />{" "}
                  <rect
                    x="400"
                    y="430"
                    width="150"
                    height="120"
                    rx="6"
                    fill="#0D3532"
                    opacity=".8"
                  />{" "}
                  <g stroke="#1E4D54" strokeLinecap="round" fill="none">
                    {" "}
                    <path d="M0 300 H600" strokeWidth="9" />{" "}
                    <path d="M210 0 V600" strokeWidth="9" />{" "}
                    <path d="M0 450 H600" strokeWidth="5" />{" "}
                    <path d="M390 0 V600" strokeWidth="5" />{" "}
                    <path d="M0 120 H460" strokeWidth="5" />{" "}
                    <path d="M90 470 V450" strokeWidth="5" />{" "}
                  </g>{" "}
                  <g
                    stroke="#2A5B62"
                    strokeWidth="1"
                    fill="none"
                    strokeDasharray="4 6"
                  >
                    <path d="M0 300 H600" />
                    <path d="M210 0 V600" />
                  </g>{" "}
                  <path
                    id="heroRoute"
                    d={route}
                    fill="none"
                    stroke="#5EF2C2"
                    strokeOpacity=".28"
                    strokeWidth="2"
                    strokeDasharray="3 6"
                    strokeLinejoin="round"
                  />{" "}
                  <path
                    id="heroDone"
                    d={route}
                    fill="none"
                    stroke="#5EF2C2"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={`${[0.18, 0.34, 0.54, 0.72, 0.9][stage] * 820} 1000`}
                  />{" "}
                  <rect
                    x="432"
                    y="102"
                    width="36"
                    height="36"
                    rx="4"
                    fill="rgba(94,242,194,.08)"
                    stroke="#5EF2C2"
                    stroke-opacity=".6"
                    strokeDasharray="3 3"
                  />{" "}
                  <g
                    id="crumbs"
                    fill="#06181C"
                    stroke="#5EF2C2"
                    strokeWidth="2"
                  >
                    {[
                      [90, 450],
                      [210, 450],
                      [210, 300],
                      [390, 300],
                      [390, 120],
                      [450, 120],
                    ].map(([x, y], i) => (
                      <circle
                        key={i}
                        className={`crumb ${i <= stage ? "on" : ""}`}
                        cx={x}
                        cy={y}
                        r="4"
                      />
                    ))}
                  </g>{" "}
                  <g fill="#3E6F72">
                    <circle cx="300" cy="450" r="5" />
                    <circle cx="520" cy="300" r="5" />
                    <circle cx="210" cy="190" r="5" />
                    <circle cx="470" cy="450" r="5" />
                  </g>{" "}
                </svg>{" "}
                <div
                  className="p3"
                  style={{
                    left: "30px",
                    top: "470px",
                    width: "120px",
                    height: "110px",
                  }}
                >
                  {" "}
                  <div className="absolute inset-0 border border-mint/50 bg-mint/[.06] rounded-sm" />{" "}
                  <div
                    className="wall-y fence-wall"
                    style={{
                      left: "0",
                      top: "0",
                      width: "120px",
                      height: "46px",
                    }}
                  />{" "}
                  <div
                    className="wall-y fence-wall"
                    style={{
                      left: "0",
                      top: "110px",
                      width: "120px",
                      height: "46px",
                    }}
                  />{" "}
                  <div
                    className="wall-x fence-wall"
                    style={{
                      left: "0",
                      top: "0",
                      width: "46px",
                      height: "110px",
                      background:
                        "linear-gradient(to right, rgba(94,242,194,.22), rgba(94,242,194,0))",
                      borderTop: "0",
                      borderLeft: "1px solid rgba(94,242,194,.55)",
                    }}
                  />{" "}
                  <div
                    className="wall-x fence-wall"
                    style={{
                      left: "120px",
                      top: "0",
                      width: "46px",
                      height: "110px",
                      background:
                        "linear-gradient(to right, rgba(94,242,194,.22), rgba(94,242,194,0))",
                      borderTop: "0",
                      borderLeft: "1px solid rgba(94,242,194,.55)",
                    }}
                  />{" "}
                </div>{" "}
                <div id="blocks" className="p3 inset-0">
                  {cityBlocks.map(([x, y, w, d, h], i) => (
                    <div
                      key={i}
                      className="p3"
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        width: `${w}px`,
                        height: `${d}px`,
                      }}
                    >
                      <div
                        className="wall-y"
                        style={{
                          left: 0,
                          top: `${d}px`,
                          width: `${w}px`,
                          height: `${h}px`,
                          background: "linear-gradient(#123E45,#0B2A30)",
                        }}
                      />
                      <div
                        className="wall-x"
                        style={{
                          left: 0,
                          top: 0,
                          width: `${h}px`,
                          height: `${d}px`,
                          background: "linear-gradient(90deg,#0E3238,#0A2328)",
                        }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          transform: `translateZ(${h}px)`,
                          background: "#16444B",
                          border: "1px solid rgba(94,242,194,.10)",
                        }}
                      />
                    </div>
                  ))}
                </div>{" "}
                <div
                  id="carrier"
                  className="p3"
                  style={{
                    left: "0",
                    top: "0",
                    width: "0",
                    height: "0",
                    transform: `translate3d(${[90, 90, 210, 210, 390][stage]}px,${[450, 450, 300, 300, 120][stage]}px,0)`,
                  }}
                >
                  {" "}
                  <div
                    className="p3"
                    style={{
                      left: "-24px",
                      top: "-24px",
                      width: "48px",
                      height: "48px",
                    }}
                  >
                    <span className="loc-hl absolute inset-0 rounded-full border-2 border-mint bg-mint/10" />
                  </div>{" "}
                  <div
                    id="vbody"
                    className="p3"
                    style={{
                      left: "-15px",
                      top: "-8px",
                      width: "30px",
                      height: "16px",
                    }}
                  >
                    {" "}
                    <div className="absolute inset-0 bg-black/40 blur-[3px]" />{" "}
                    <div
                      className="wall-y"
                      style={{
                        left: "0",
                        top: "0",
                        width: "30px",
                        height: "12px",
                        background: "#1E8F72",
                      }}
                    />{" "}
                    <div
                      className="wall-y"
                      style={{
                        left: "0",
                        top: "16px",
                        width: "30px",
                        height: "12px",
                        background: "#2FA987",
                      }}
                    />{" "}
                    <div
                      className="wall-x"
                      style={{
                        left: "0",
                        top: "0",
                        width: "12px",
                        height: "16px",
                        background: "#2FA987",
                      }}
                    />{" "}
                    <div
                      className="wall-x"
                      style={{
                        left: "30px",
                        top: "0",
                        width: "12px",
                        height: "16px",
                        background: "#1E8F72",
                      }}
                    />{" "}
                    <div
                      className="absolute inset-0 bg-[#CFFFF0] rounded-[2px]"
                      style={{ transform: "translateZ(12px)" }}
                    >
                      {" "}
                      <span className="absolute left-[19px] top-[4px] w-[7px] h-[8px] bg-pet-900 rounded-[1px]" />{" "}
                    </div>{" "}
                  </div>{" "}
                  <div
                    className="wall-y beam"
                    style={{
                      left: "-1px",
                      top: "0",
                      width: "2px",
                      height: "230px",
                    }}
                  >
                    <span className="packet" />
                  </div>{" "}
                  <div
                    id="node"
                    className="p3"
                    style={{
                      left: "-12px",
                      top: "-12px",
                      width: "24px",
                      height: "24px",
                      transform: "translateZ(230px)",
                    }}
                  >
                    {" "}
                    <span className="absolute inset-0 rounded-full border-2 border-mint bg-pet-900/60 transition-shadow" />{" "}
                    <span className="ring absolute inset-0 rounded-full border border-mint" />{" "}
                  </div>{" "}
                  <div
                    className="p3"
                    style={{
                      left: "-20px",
                      top: "-20px",
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    <span className="ring absolute inset-0 rounded-full border border-mint/70" />
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <svg
            id="wires"
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <path
              id="wire"
              className="wire"
              fill="none"
              stroke="rgba(94,242,194,.55)"
              strokeWidth="1"
            />
            <circle id="wireEnd" r="2.5" fill="#5EF2C2" />
          </svg>{" "}
          <div
            id="panes"
            dir="rtl"
            className="absolute left-1/2 -translate-x-1/2 bottom-[84px] lg:bottom-[100px] w-[calc(100%-24px)] max-w-[500px] h-[120px] z-10"
          >
            {" "}
            <div
              className={`pane rounded-xl border border-pet-600 bg-pet-850/80 backdrop-blur px-4 py-3 ${
                stage === 0 ? "active" : ""
              }`}
              data-k="device"
            >
              {" "}
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[13px] text-mist">
                  <i className="fa-solid fa-satellite-dish text-mint text-[11px] w-3" />
                  {"الجهاز"}
                </span>
                <span className="font-mono text-[12px] text-fog">
                  {"GT-4821"}
                </span>
              </div>{" "}
              <div className="pane-body">
                <div>
                  <div className="pt-2.5">
                    {" "}
                    <p className="text-[14px] text-fog">
                      {"شاحنة مبردة · "}
                      <span className="font-mono ltr">{"RUH-4471"}</span>
                    </p>{" "}
                    <p className="mt-1 text-[12px] text-mint flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                      {"متصل ويرسل التقارير"}
                    </p>{" "}
                  </div>
                </div>
              </div>{" "}
            </div>{" "}
            <div
              className={`pane rounded-xl border border-pet-600 bg-pet-850/80 backdrop-blur px-4 py-3 ${
                stage === 1 ? "active" : ""
              }`}
              data-k="location"
            >
              {" "}
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[13px] text-mist">
                  <i className="fa-solid fa-location-dot text-mint text-[11px] w-3" />
                  {"الموقع"}
                </span>
                <span id="hStreet" className="text-[12px] text-fog truncate">
                  {"شارع المستودعات"}
                </span>
              </div>{" "}
              <div className="pane-body">
                <div>
                  <div className="pt-2.5">
                    {" "}
                    <p
                      id="hCoord"
                      className="font-mono text-[14px] text-fog ltr text-right"
                    >
                      {"24.7080° N · 46.6720° E"}
                    </p>{" "}
                    <p className="mt-1 text-[12px] text-mist">
                      {"الرياض · خارج منطقة المستودع"}
                    </p>{" "}
                  </div>
                </div>
              </div>{" "}
            </div>{" "}
            <div
              className={`pane rounded-xl border border-pet-600 bg-pet-850/80 backdrop-blur px-4 py-3 ${
                stage === 2 ? "active" : ""
              }`}
              data-k="movement"
            >
              {" "}
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[13px] text-mist">
                  <i className="fa-solid fa-gauge-high text-mint text-[11px] w-3" />
                  {"الحركة"}
                </span>
                <span className="font-mono text-[12px] text-fog">
                  <span className="hSpdS">{"0"}</span>
                  {" كم/س"}
                </span>
              </div>{" "}
              <div className="pane-body">
                <div>
                  <div className="pt-2.5 flex items-end justify-between gap-3">
                    {" "}
                    <span className="font-latin text-[26px] leading-none">
                      <span className="hSpdS">{"0"}</span>
                      <span className="text-[12px] text-mist ms-1 font-sans">
                        {"كم/س"}
                      </span>
                    </span>{" "}
                    <span className="text-[12px] text-mist text-left">
                      {"الاتجاه: "}
                      <span id="hDir" className="text-fog">
                        {"شمال"}
                      </span>
                      <br />
                      <span id="hState" className="text-mint">
                        {"متحركة · المحرك يعمل"}
                      </span>
                    </span>{" "}
                  </div>
                </div>
              </div>{" "}
            </div>{" "}
            <div
              className={`pane rounded-xl border border-pet-600 bg-pet-850/80 backdrop-blur px-4 py-3 ${
                stage === 3 ? "active" : ""
              }`}
              data-k="time"
            >
              {" "}
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[13px] text-mist">
                  <i className="fa-regular fa-clock text-mint text-[11px] w-3" />
                  {"الوقت"}
                </span>
                <span className="font-mono text-[12px] text-fog hClockS">
                  {"09:38:30"}
                </span>
              </div>{" "}
              <div className="pane-body">
                <div>
                  <div className="pt-2.5">
                    {" "}
                    <p className="font-mono text-[18px] text-fog hClockS">
                      {"09:38:30"}
                    </p>{" "}
                    <p className="mt-1 text-[12px] text-mist">
                      {"آخر تحديث قبل "}
                      <span id="hFresh" className="font-mono text-fog">
                        {"2"}
                      </span>
                      {" ث · رحلة "}
                      <span className="font-mono">{"#0942"}</span>
                    </p>{" "}
                  </div>
                </div>
              </div>{" "}
            </div>{" "}
            <div
              className={`pane rounded-xl border border-pet-600 bg-pet-850/80 backdrop-blur px-4 py-3 ${
                stage === 4 ? "active" : ""
              }`}
              data-k="data"
            >
              {" "}
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[13px] text-mist">
                  <i className="fa-solid fa-temperature-half text-mint text-[11px] w-3" />
                  {"بيانات الحساسات"}
                </span>
                <span className="font-mono text-[12px] text-fog">
                  <span className="hTempS">{"4.2"}</span>
                  {"°C"}
                </span>
              </div>{" "}
              <div className="pane-body">
                <div>
                  <div className="pt-2.5 grid grid-cols-2 gap-2 text-[12px]">
                    {" "}
                    <div>
                      <span className="text-mist">{"حرارة الشحنة"}</span>
                      <p className="font-mono text-fog text-[15px]">
                        <span className="hTempS">{"4.2"}</span>
                        {" °C"}
                      </p>
                    </div>{" "}
                    <div>
                      <span className="text-mist">{"مستوى الوقود"}</span>
                      <p className="font-mono text-fog text-[15px]">
                        <span id="hFuel">{"61"}</span>
                        {" %"}
                      </p>
                    </div>{" "}
                    <p className="col-span-2 text-[11px] text-mint">
                      {"ضمن النطاق المحدد (2–8 °C)"}
                    </p>{" "}
                  </div>
                </div>
              </div>{" "}
            </div>{" "}
            <div className="ov rounded-xl border border-mint/50 bg-pet-800/95 backdrop-blur px-4 py-3.5">
              {" "}
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-fog">
                  {"نظرة تشغيلية"}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-mint/15 text-mint">
                  {"ضمن الخطة"}
                </span>
              </div>{" "}
              <ul className="mt-2 space-y-1 text-[12px] text-mist">
                {" "}
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-mint text-[10px]" />
                  {"وصلت إلى نقطة التسليم الثانية"}
                </li>{" "}
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-mint text-[10px]" />
                  {"الحرارة ضمن الحد المضبوط"}
                </li>{" "}
                <li className="flex items-center gap-2">
                  <i className="fa-solid fa-check text-mint text-[10px]" />
                  {"لا أحداث تستدعي التدخل"}
                </li>{" "}
              </ul>{" "}
            </div>{" "}
          </div>{" "}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-5 lg:bottom-9 z-20 flex flex-col items-center gap-2"
            dir="rtl"
          >
            {" "}
            <div
              id="chips"
              className="flex items-center gap-1 p-1 rounded-xl bg-pet-900/85 border border-pet-600 backdrop-blur"
              role="group"
              aria-label="مراحل القصة"
            >
              {" "}
              <button
                onClick={() => setStage(0)}
                className="chip relative overflow-hidden h-8 px-2.5 sm:px-3 rounded-lg border border-transparent text-[12px] text-mist hover:text-fog transition-colors"
                data-i="0"
                aria-pressed={stage === 0}
              >
                {"الجهاز"}
                <span className="chip-bar absolute bottom-0 inset-x-0 h-[2px] bg-pet-900/50" />
              </button>{" "}
              <button
                onClick={() => setStage(1)}
                className="chip relative overflow-hidden h-8 px-2.5 sm:px-3 rounded-lg border border-transparent text-[12px] text-mist hover:text-fog transition-colors"
                data-i="1"
                aria-pressed={stage === 1}
              >
                {"الموقع"}
                <span className="chip-bar absolute bottom-0 inset-x-0 h-[2px] bg-pet-900/50" />
              </button>{" "}
              <button
                onClick={() => setStage(2)}
                className="chip relative overflow-hidden h-8 px-2.5 sm:px-3 rounded-lg border border-transparent text-[12px] text-mist hover:text-fog transition-colors"
                data-i="2"
                aria-pressed={stage === 2}
              >
                {"الحركة"}
                <span className="chip-bar absolute bottom-0 inset-x-0 h-[2px] bg-pet-900/50" />
              </button>{" "}
              <button
                onClick={() => setStage(3)}
                className="chip relative overflow-hidden h-8 px-2.5 sm:px-3 rounded-lg border border-transparent text-[12px] text-mist hover:text-fog transition-colors"
                data-i="3"
                aria-pressed={stage === 3}
              >
                {"الوقت"}
                <span className="chip-bar absolute bottom-0 inset-x-0 h-[2px] bg-pet-900/50" />
              </button>{" "}
              <button
                onClick={() => setStage(4)}
                className="chip relative overflow-hidden h-8 px-2.5 sm:px-3 rounded-lg border border-transparent text-[12px] text-mist hover:text-fog transition-colors"
                data-i="4"
                aria-pressed={stage === 4}
              >
                {"البيانات"}
                <span className="chip-bar absolute bottom-0 inset-x-0 h-[2px] bg-pet-900/50" />
              </button>{" "}
            </div>{" "}
            <p
              id="heroStatus"
              className="font-mono text-[10px] tracking-[.12em] text-mist/80"
            >
              {"محاكاة توضيحية · بيانات افتراضية"}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </section>
  )
}
