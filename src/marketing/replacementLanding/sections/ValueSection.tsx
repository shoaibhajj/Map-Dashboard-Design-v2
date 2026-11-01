import { useState } from "react"

export function ValueSection() {
  const [active, setActive] = useState(0)

  const summaries = [
    [
      "01 · رؤية",
      "كل مركباتك على شاشة واحدة",
      "7 مركبات · 4 متحركة · 2 متوقفة · 1 بلا تحديث.",
    ],

    [
      "02 · تنبيه",
      "اعرف ما يستدعي انتباهك",
      "قاعدة حرارة الشحنة تجاوزت الحد المضبوط على المركبة RUH-6612.",
    ],

    [
      "03 · إجراء",
      "تابع الحدث حتى إغلاقه",
      "راجع حالة المركبة أو تواصل مع السائق أو ابدأ طلب دعم فني.",
    ],
  ] as const

  return (
    <section
      id="value"
      className="relative border-y border-pet-700 bg-pet-950/60"
    >
      {" "}
      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-20">
        {" "}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          {" "}
          <h2 className="font-display text-[32px] lg:text-[40px] font-semibold leading-tight">
            {"من البيانات إلى الإجراء."}
          </h2>{" "}
          <p className="text-mist max-w-[440px] leading-relaxed">
            {
              "ثلاث قدرات مترابطة تنقلك من معرفة ما يحدث، إلى معرفة ما يهم، إلى التصرف في الوقت المناسب."
            }
          </p>{" "}
        </div>{" "}
        <div className="relative">
          {" "}
          <div className="absolute top-[22px] inset-x-[8%] h-px bg-pet-600 hidden md:block" />{" "}
          <div
            id="vRail"
            className="absolute top-[22px] right-[8%] h-[2px] -mt-px bg-mint hidden md:block"
            style={{ width: "0" }}
          />{" "}
          <span className="absolute top-[17px] right-[8%] w-3 h-3 -me-1.5 rounded-full border-2 border-mint bg-pet-900 hidden md:block" />{" "}
          <span className="absolute top-[17px] right-[50%] w-3 h-3 -me-1.5 rounded-full border-2 border-pet-600 bg-pet-900 hidden md:block vnode" />{" "}
          <span className="absolute top-[17px] right-[92%] w-3 h-3 -me-1.5 rounded-full border-2 border-pet-600 bg-pet-900 hidden md:block vnode" />{" "}
          <div
            id="vTruck"
            className="absolute top-[-14px] hidden md:block z-10 pointer-events-none transition-opacity duration-300"
            style={{ right: "calc(8% - 34px)" }}
          >
            {" "}
            <svg width="68" height="36" viewBox="0 0 68 36" aria-hidden="true">
              {" "}
              <ellipse
                cx="34"
                cy="33"
                rx="30"
                ry="2.5"
                fill="#000"
                opacity=".35"
              />{" "}
              <rect
                x="22"
                y="3"
                width="44"
                height="21"
                rx="2.5"
                fill="#E4F1EE"
              />{" "}
              <rect x="22" y="3" width="44" height="4" rx="2" fill="#5EF2C2" />{" "}
              <rect x="19" y="6" width="3.5" height="9" rx="1" fill="#86A9A8" />{" "}
              <path d="M3 25 V16 L9 8 H20 V25 Z" fill="#5EF2C2" />{" "}
              <path d="M6.5 16 L10.5 10.5 H17 V16 Z" fill="#06181C" />{" "}
              <rect
                x="1.5"
                y="22"
                width="65"
                height="4.5"
                rx="1.5"
                fill="#2FA987"
              />{" "}
              <rect x="1" y="19" width="3" height="3" rx="1" fill="#FF9F45" />{" "}
              <g fill="#06181C" stroke="#E4F1EE" strokeWidth="2">
                <circle cx="12" cy="28" r="4.2" />
                <circle cx="40" cy="28" r="4.2" />
                <circle cx="55" cy="28" r="4.2" />
              </g>{" "}
            </svg>{" "}
          </div>{" "}
          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            {" "}
            <button
              onClick={() => setActive(0)}
              aria-pressed={active === 0}
              className="vst group text-right pt-0 md:pt-14"
              data-i="0"
            >
              <span className="vdot hidden" />
              <p className="font-mono text-[12px] text-mist">{"01"}</p>
              <p className="vt mt-1 text-[20px] font-semibold text-fog/70 transition-colors">
                {"رؤية تشغيلية"}
              </p>
              <p className="mt-2 text-[14px] text-mist leading-relaxed">
                {"تابع مواقع مركباتك وحركتها وحالاتها التشغيلية من مكان واحد."}
              </p>
            </button>{" "}
            <button
              onClick={() => setActive(1)}
              aria-pressed={active === 1}
              className="vst group text-right pt-0 md:pt-14"
              data-i="1"
            >
              <p className="font-mono text-[12px] text-mist">{"02"}</p>
              <p className="vt mt-1 text-[20px] font-semibold text-fog/70 transition-colors">
                {"تنبيهات مخصصة"}
              </p>
              <p className="mt-2 text-[14px] text-mist leading-relaxed">
                {
                  "حدّد الأحداث التي تستدعي انتباهك وفق احتياجاتك التشغيلية، مثل تجاوز حدود الحساسات أو الدخول إلى مناطق محددة والخروج منها."
                }
              </p>
            </button>{" "}
            <button
              onClick={() => setActive(2)}
              aria-pressed={active === 2}
              className="vst group text-right pt-0 md:pt-14"
              data-i="2"
            >
              <p className="font-mono text-[12px] text-mist">{"03"}</p>
              <p className="vt mt-1 text-[20px] font-semibold text-fog/70 transition-colors">
                {"إجراءات عملية"}
              </p>
              <p className="mt-2 text-[14px] text-mist leading-relaxed">
                {
                  "انتقل من اكتشاف المشكلة إلى متابعتها واتخاذ الإجراء المناسب، مثل مراجعة حالة المركبة أو بدء طلب دعم فني، وفق إمكانات النظام."
                }
              </p>
            </button>{" "}
          </div>{" "}
        </div>{" "}
        <div className="mt-12 rounded-[20px] border border-pet-700 bg-pet-850/70 p-6 lg:p-8 grid lg:grid-cols-12 gap-8 items-center min-h-[260px]">
          {" "}
          <div className="lg:col-span-4">
            <p id="vLabel" className="font-mono text-[12px] text-mint">
              {summaries[active][0]}
            </p>
            <p id="vHead" className="mt-3 text-[24px] font-semibold">
              {summaries[active][1]}
            </p>
            <p id="vText" className="mt-3 text-mist leading-relaxed">
              {summaries[active][2]}
            </p>
          </div>{" "}
          <div className="lg:col-span-8 relative h-[200px]">
            {" "}
            <div
              className={`vpan absolute inset-0 transition-opacity duration-500 ${
                active === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              data-i="0"
            >
              {" "}
              <svg viewBox="0 0 700 200" className="w-full h-full">
                <rect width="700" height="200" rx="14" fill="#0A2428" />
                <g stroke="#17434A" strokeWidth="8">
                  <path d="M0 110 H700" />
                  <path d="M240 0 V200" />
                  <path d="M500 0 V200" />
                </g>
                <path
                  d="M60 170 H240 V110 H500 V40"
                  fill="none"
                  stroke="#5EF2C2"
                  strokeWidth="3"
                />
                <g fill="#5EF2C2">
                  <circle cx="500" cy="60" r="7" />
                  <circle cx="360" cy="110" r="6" />
                  <circle cx="120" cy="110" r="6" />
                  <circle cx="600" cy="110" r="6" />
                </g>
                <g fill="#3E6F72">
                  <circle cx="240" cy="40" r="6" />
                  <circle cx="640" cy="170" r="6" />
                </g>
                <circle
                  cx="420"
                  cy="170"
                  r="6"
                  fill="none"
                  stroke="#86A9A8"
                  strokeDasharray="2 2"
                />
              </svg>{" "}
            </div>{" "}
            <div
              className={`vpan absolute inset-0 transition-opacity duration-500 flex flex-col justify-center gap-3 ${
                active === 1 ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              data-i="1"
            >
              {" "}
              <div className="rounded-xl border border-pet-600 bg-pet-900 p-4 flex items-center gap-4">
                <i className="fa-solid fa-sliders text-mint" />
                <div className="flex-1">
                  <p className="text-[14px]">
                    {"قاعدة: حرارة الشحنة أعلى من "}
                    <span className="font-mono">{"8 °C"}</span>
                    {" لأكثر من 5 دقائق"}
                  </p>
                  <p className="text-[12px] text-mist">
                    {"المركبات المبردة · إشعار للمشرف المناوب"}
                  </p>
                </div>
                <span className="text-[12px] text-mint">{"مفعّلة"}</span>
              </div>{" "}
              <div className="rounded-xl border border-amber/60 bg-amber/10 p-4 flex items-center gap-4">
                <i className="fa-solid fa-triangle-exclamation text-amber" />
                <div className="flex-1">
                  <p className="text-[14px]">
                    {"RUH-6612 · حرارة الشحنة "}
                    <span className="font-mono">{"9.1 °C"}</span>
                  </p>
                  <p className="text-[12px] text-mist">
                    {"10:22 · تجاوز الحد المضبوط"}
                  </p>
                </div>
                <span className="text-[12px] text-amber">
                  {"يستدعي الانتباه"}
                </span>
              </div>{" "}
            </div>{" "}
            <div
              className={`vpan absolute inset-0 transition-opacity duration-500 flex flex-col justify-center gap-3 ${
                active === 2 ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              data-i="2"
            >
              {" "}
              <div className="rounded-xl border border-pet-600 bg-pet-900 p-4">
                <p className="text-[13px] text-mist">
                  {"RUH-6612 · تجاوز حد الحرارة"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-mint text-pet-900 text-[13px] font-medium">
                    <i className="fa-solid fa-magnifying-glass me-1.5" />
                    {"مراجعة حالة المركبة"}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg border border-pet-600 text-[13px]">
                    <i className="fa-solid fa-phone me-1.5" />
                    {"التواصل مع السائق"}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg border border-pet-600 text-[13px]">
                    <i className="fa-solid fa-screwdriver-wrench me-1.5" />
                    {"بدء طلب دعم فني"}
                  </span>
                </div>
              </div>{" "}
              <div className="flex items-center gap-3 text-[13px] text-mist">
                <span className="w-2 h-2 rounded-full bg-mint" />
                {"الحالة: قيد المتابعة · أُسندت إلى سارة م. · 10:26"}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </section>
  )
}
