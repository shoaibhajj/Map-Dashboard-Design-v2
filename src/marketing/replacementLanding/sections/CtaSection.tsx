export function CtaSection() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden border-t border-pet-700"
    >
      {" "}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_75%_at_30%_50%,#0F3D40_0%,#082025_45%,#06181C_75%)]" />{" "}
      <div className="absolute inset-0 grain opacity-50" />{" "}
      <div className="relative max-w-[1360px] mx-auto px-6 lg:px-10 grid lg:grid-cols-12 items-center pt-24 lg:pt-0 lg:h-[780px]">
        {" "}
        <div className="lg:col-span-5 relative z-10">
          {" "}
          <p className="rv font-mono text-[12px] tracking-[.18em] text-mint/90 flex items-center gap-3">
            <span className="w-6 h-px bg-mint/70" />
            {"الخطوة التالية لأسطولك"}
          </p>{" "}
          <h2 className="rv font-display mt-6 text-[40px] sm:text-[52px] xl:text-[62px] font-semibold leading-[1.15]">
            {"شاهد أسطولك"}
            <br />
            {"كنظام "}
            <span className="text-mint">{"واحد متصل."}</span>
          </h2>{" "}
          <p className="rv mt-6 text-mist text-[17px] leading-[1.9] max-w-[480px]">
            {
              "اكتشف كيف تساعدك TripMonitor على ربط بيانات مركباتك وحساساتها وأحداثها التشغيلية في رؤية واحدة، تمنحك فهمًا أفضل لأسطولك وتساعدك على اتخاذ قرارات أكثر استنارة."
            }
          </p>{" "}
          <div className="rv mt-10 flex flex-wrap items-center gap-4">
            {" "}
            <a
              href="#"
              className="group inline-flex h-14 items-center gap-3 px-7 rounded-2xl bg-mint text-pet-900 font-semibold text-[16px] shadow-[0_18px_40px_-14px_rgba(94,242,194,.55)] hover:bg-[#8AF7D4] transition-all"
            >
              {" "}
              <span className="w-7 h-7 rounded-full bg-pet-900/15 grid place-items-center">
                <i className="fa-solid fa-play text-[10px]" />
              </span>
              {"جرّبها على أسطولك"}
              <i className="fa-solid fa-arrow-left text-[13px] transition-transform group-hover:-translate-x-1" />{" "}
            </a>{" "}
            <a
              href="#"
              className="inline-flex h-14 items-center gap-2.5 px-6 rounded-2xl border border-pet-600 text-fog hover:border-mint/50 hover:bg-pet-800/60 transition-colors"
            >
              <i className="fa-solid fa-headset text-mint" />
              {"تحدّث مع خبير تشغيل"}
            </a>{" "}
          </div>{" "}
          <ul className="rv mt-8 flex flex-wrap gap-x-6 gap-y-2.5 text-[13px] text-mist">
            {" "}
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-mint text-[12px]" />
              {"جلسة تعريفية على سيناريوهات أسطولك"}
            </li>{" "}
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-mint text-[12px]" />
              {"إعداد مُرافَق خطوة بخطوة"}
            </li>{" "}
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-mint text-[12px]" />
              {"واجهة عربية بالكامل"}
            </li>{" "}
          </ul>{" "}
        </div>{" "}
        <div
          id="ctaScene"
          dir="ltr"
          className="lg:col-span-7 relative h-[540px] lg:h-full lg:-ml-16"
        >
          {" "}
          <div className="cta-scale absolute inset-0">
            {" "}
            <div className="cta-stage">
              {" "}
              <div className="cta-plate">
                {" "}
                <div
                  className="wall-y"
                  style={{
                    left: "0",

                    top: "560px",

                    width: "560px",

                    height: "18px",

                    background: "linear-gradient(#0B2A30,#041114)",
                  }}
                />{" "}
                <div
                  className="wall-x"
                  style={{
                    left: "0",

                    top: "0",

                    width: "18px",

                    height: "560px",

                    background: "linear-gradient(90deg,#0B2A30,#041114)",
                  }}
                />{" "}
                <svg
                  className="absolute inset-0"
                  width="560"
                  height="560"
                  viewBox="0 0 560 560"
                  aria-hidden="true"
                >
                  {" "}
                  <defs>
                    {" "}
                    <pattern
                      id="g5"
                      width="28"
                      height="28"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M28 0H0V28"
                        fill="none"
                        stroke="#1A434A"
                        strokeWidth=".6"
                      />
                    </pattern>{" "}
                    <radialGradient id="hubGlow">
                      <stop offset="0" stopColor="#5EF2C2" stopOpacity=".35" />
                      <stop offset="1" stopColor="#5EF2C2" stopOpacity="0" />
                    </radialGradient>{" "}
                  </defs>{" "}
                  <rect width="560" height="560" fill="#0B2C31" />
                  <rect width="560" height="560" fill="url(#g5)" />{" "}
                  <circle cx="280" cy="280" r="150" fill="url(#hubGlow)" />{" "}
                  <g
                    stroke="#1E4D54"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                  >
                    <path d="M0 180 H560" />
                    <path d="M0 280 H560" />
                    <path d="M0 400 H560" />
                    <path d="M160 0 V560" />
                    <path d="M280 0 V560" />
                    <path d="M400 0 V560" />
                  </g>{" "}
                  <g
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="cta-flow"
                  >
                    {" "}
                    <path id="cr1" d="M0 180 H160 V280 H280" stroke="#5EF2C2" />{" "}
                    <path id="cr2" d="M400 0 V180 H280 V280" stroke="#5EF2C2" />{" "}
                    <path id="cr3" d="M0 400 H280 V280" stroke="#5EF2C2" />{" "}
                    <path
                      id="cr4"
                      d="M560 400 H400 V280 H280"
                      stroke="#FF9F45"
                    />{" "}
                    <path
                      id="cr5"
                      d="M560 180 H400 V280"
                      stroke="#5EF2C2"
                    />{" "}
                  </g>{" "}
                  <g>
                    {" "}
                    <circle
                      r="6"
                      fill="#E4F1EE"
                      stroke="#5EF2C2"
                      strokeWidth="2"
                    >
                      <animateMotion dur="7s" repeatCount="indefinite">
                        <mpath href="#cr1" />
                      </animateMotion>
                    </circle>{" "}
                    <circle
                      r="6"
                      fill="#E4F1EE"
                      stroke="#5EF2C2"
                      strokeWidth="2"
                    >
                      <animateMotion
                        dur="6s"
                        begin="-2s"
                        repeatCount="indefinite"
                      >
                        <mpath href="#cr2" />
                      </animateMotion>
                    </circle>{" "}
                    <circle
                      r="6"
                      fill="#E4F1EE"
                      stroke="#5EF2C2"
                      strokeWidth="2"
                    >
                      <animateMotion
                        dur="8s"
                        begin="-4s"
                        repeatCount="indefinite"
                      >
                        <mpath href="#cr3" />
                      </animateMotion>
                    </circle>{" "}
                    <circle
                      r="7"
                      fill="#FF9F45"
                      stroke="#06181C"
                      strokeWidth="2"
                    >
                      <animateMotion
                        dur="9s"
                        begin="-1s"
                        repeatCount="indefinite"
                      >
                        <mpath href="#cr4" />
                      </animateMotion>
                    </circle>{" "}
                    <circle
                      r="6"
                      fill="#E4F1EE"
                      stroke="#5EF2C2"
                      strokeWidth="2"
                    >
                      <animateMotion
                        dur="6.5s"
                        begin="-3s"
                        repeatCount="indefinite"
                      >
                        <mpath href="#cr5" />
                      </animateMotion>
                    </circle>{" "}
                  </g>{" "}
                  <rect
                    x="30"
                    y="440"
                    width="100"
                    height="90"
                    rx="4"
                    fill="rgba(94,242,194,.06)"
                    stroke="#5EF2C2"
                    stroke-opacity=".5"
                    strokeDasharray="4 4"
                  />{" "}
                </svg>{" "}
                <div id="ctaBlocks" className="p3 inset-0">
                  {[
                    [40, 40, 90, 110, 54],

                    [190, 40, 60, 110, 86],

                    [300, 30, 80, 120, 64],

                    [430, 210, 100, 50, 40],

                    [40, 300, 90, 70, 30],

                    [180, 300, 70, 70, 46],

                    [430, 300, 100, 70, 72],

                    [180, 430, 80, 100, 36],

                    [300, 420, 70, 110, 58],

                    [440, 430, 90, 100, 26],
                  ].map(([x, y, w, d, h], i) => (
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

                          background: "linear-gradient(#134047,#0B2A30)",
                        }}
                      />
                      <div
                        className="wall-x"
                        style={{
                          left: 0,

                          top: 0,

                          width: `${h}px`,

                          height: `${d}px`,

                          background: "linear-gradient(90deg,#0F353B,#0A2328)",
                        }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          transform: `translateZ(${h}px)`,

                          background: "#17474E",

                          border: "1px solid rgba(94,242,194,.12)",
                        }}
                      />
                    </div>
                  ))}
                </div>{" "}
                <div
                  className="p3"
                  style={{
                    left: "250px",

                    top: "250px",

                    width: "60px",

                    height: "60px",
                  }}
                >
                  <span className="ring absolute inset-0 rounded-full border border-mint" />
                  <span className="absolute inset-[18px] rounded-full bg-mint/30 border border-mint" />
                </div>{" "}
                <div
                  className="wall-y beam"
                  style={{
                    left: "279px",

                    top: "280px",

                    width: "2px",

                    height: "190px",
                  }}
                >
                  <span className="packet" />
                </div>{" "}
                <div
                  className="p3"
                  style={{
                    left: "266px",

                    top: "266px",

                    width: "28px",

                    height: "28px",

                    transform: "translateZ(190px)",
                  }}
                >
                  <span className="absolute inset-0 rounded-full border-2 border-mint bg-pet-900/70" />
                  <span className="ring absolute inset-0 rounded-full border border-mint" />
                </div>{" "}
                <div
                  className="wall-y beam"
                  style={{
                    left: "159px",

                    top: "180px",

                    width: "2px",

                    height: "100px",
                  }}
                />{" "}
                <div
                  className="wall-y"
                  style={{
                    left: "399px",

                    top: "400px",

                    width: "2px",

                    height: "120px",

                    background:
                      "linear-gradient(to bottom,rgba(255,159,69,.95),rgba(255,159,69,.05))",
                  }}
                />{" "}
                <div
                  className="p3"
                  style={{
                    left: "388px",

                    top: "388px",

                    width: "24px",

                    height: "24px",
                  }}
                >
                  <span className="ring absolute inset-0 rounded-full border-2 border-amber" />
                </div>{" "}
                <div
                  className="wall-y beam"
                  style={{
                    left: "399px",

                    top: "180px",

                    width: "2px",

                    height: "80px",
                  }}
                />{" "}
                <div
                  className="bb"
                  style={{
                    left: "280px",

                    top: "280px",

                    transform: "translateZ(205px)",
                  }}
                >
                  <div className="bbr">
                    <div
                      className="bbc rounded-xl border border-mint/50 bg-pet-900/95 px-4 py-3 shadow-[0_20px_40px_-12px_rgba(0,0,0,.7)]"
                      dir="rtl"
                      style={{ transitionDelay: "1.6s" }}
                    >
                      <p className="text-[11px] text-mist">
                        {"نظرة الأسطول · الآن"}
                      </p>
                      <p className="mt-1 text-[15px] text-fog font-semibold whitespace-nowrap">
                        {"7 مركبات · "}
                        <span className="text-mint">{"4 متحركة"}</span>
                        {" · "}
                        <span className="text-amber">{"3 تحتاج قرارًا"}</span>
                      </p>
                    </div>
                  </div>
                </div>{" "}
                <div
                  className="bb"
                  style={{
                    left: "160px",

                    top: "180px",

                    transform: "translateZ(110px)",
                  }}
                >
                  <div className="bbr">
                    <div
                      className="bbc rounded-lg border border-pet-600 bg-pet-850/95 px-3 py-2 text-[12px] whitespace-nowrap"
                      dir="rtl"
                      style={{ transitionDelay: "2s" }}
                    >
                      <i className="fa-solid fa-temperature-half text-mint me-1.5" />
                      <span className="font-mono">{"4.2 °C"}</span>
                      {" · RUH-4471"}
                    </div>
                  </div>
                </div>{" "}
                <div
                  className="bb"
                  style={{
                    left: "400px",

                    top: "400px",

                    transform: "translateZ(130px)",
                  }}
                >
                  <div className="bbc-wrap bbr">
                    <div
                      className="bbc rounded-lg border border-amber/60 bg-pet-850/95 px-3 py-2 text-[12px] whitespace-nowrap text-amber"
                      dir="rtl"
                      style={{ transitionDelay: "2.3s" }}
                    >
                      <i className="fa-solid fa-triangle-exclamation me-1.5" />
                      {"RUH-6612 · "}
                      <span className="font-mono">{"9.1 °C"}</span>
                    </div>
                  </div>
                </div>{" "}
                <div
                  className="bb"
                  style={{
                    left: "400px",

                    top: "180px",

                    transform: "translateZ(90px)",
                  }}
                >
                  <div className="bbr">
                    <div
                      className="bbc rounded-lg border border-pet-600 bg-pet-850/95 px-3 py-2 text-[12px] whitespace-nowrap"
                      dir="rtl"
                      style={{ transitionDelay: "2.6s" }}
                    >
                      <i className="fa-solid fa-screwdriver-wrench text-mint me-1.5" />
                      {"طلب صيانة · RUH-5530"}
                    </div>
                  </div>
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </section>
  )
}
