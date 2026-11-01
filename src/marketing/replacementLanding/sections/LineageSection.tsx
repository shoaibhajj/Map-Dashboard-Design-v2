import { useState } from "react"

const readings = [
  [
    "fa-temperature-half",
    "القراءة",
    <>
      حرارة الشحنة · <span className="font-mono">4.2 °C</span>
    </>,
    "ضمن النطاق المحدد 2–8 °C · متوسط آخر ساعة 4.3 °C",
  ],
  [
    "fa-microchip",
    "الحساس",
    <>
      مسبار حرارة · <span className="font-mono">T1</span>
    </>,
    "النوع: حرارة · الموقع: المقصورة الخلفية · مرتبط",
  ],
  [
    "fa-satellite-dish",
    "جهاز التتبع",
    <>
      GPS · <span className="font-mono">GT-4821</span>
    </>,
    "متصل · يرسل كل 10 ثوانٍ · الإشارة قوية",
  ],
  [
    "fa-truck",
    "المركبة",
    <>
      <span className="font-mono">RUH-4471</span> · شاحنة مبردة
    </>,
    <>
      في الرحلة <span className="font-mono">#0942</span> · جولة التوزيع الصباحية
    </>,
  ],
  [
    "fa-id-card",
    "السائق المسند",
    "خالد العتيبي",
    "مسند منذ 07:30 · رخصة نقل مبرد",
  ],
  [
    "fa-clock",
    "آخر تحديث",
    <>
      <span className="font-mono">09:42:18</span> · قبل 6 ث
    </>,
    "البيانات حديثة · لا تأخير في الاستلام",
  ],
] as const

export function LineageSection() {
  const [active, setActive] = useState(0)
  return (
    <section
      id="lineage"
      className="relative py-28 bg-pet-950/70 border-y border-pet-700 overflow-hidden"
    >
      <div className="absolute -right-40 top-20 w-[520px] h-[520px] rounded-full bg-mint/[.04] blur-3xl" />
      <div className="relative max-w-[1360px] mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-14 items-center">
        <div className="lg:col-span-5">
          <p className="font-mono text-[12px] tracking-[.18em] text-mint/90">
            الأجهزة والقراءات
          </p>
          <h2 className="font-display mt-5 text-[34px] lg:text-[46px] font-semibold leading-[1.25]">
            كل قراءة لها
            <br />
            مصدر وسياق.
          </h2>
          <p className="mt-6 text-mist leading-relaxed max-w-[440px]">
            الرقم وحده لا يكفي لاتخاذ قرار. تعرض TripMonitor كل قراءة مع الحساس
            الذي التقطها، والجهاز الذي أرسلها، والمركبة والسائق المرتبطين بها،
            ووقت آخر تحديث.
          </p>
          <p className="mt-6 text-[13px] text-mist">
            <i className="fa-regular fa-hand-pointer text-mint me-2" />
            مرّر أو اضغط على أي بطاقة لاستعراضها.
          </p>
        </div>
        <div className="lg:col-span-7">
          <div className="relative [perspective:1600px]">
            <div className="relative [transform:rotateY(12deg)_rotateX(5deg)] space-y-2">
              {readings.map(([icon, label, value, detail], i) => (
                <button
                  key={label}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className={`w-full text-right relative rounded-2xl border px-5 py-4 cursor-pointer transition-all duration-500 ease-out origin-right ${
                    active === i
                      ? "border-mint/70 bg-pet-800 scale-[1.03] -translate-x-2.5 shadow-2xl opacity-100 z-10"
                      : "border-pet-600 bg-pet-850/90 opacity-75"
                  }`}
                >
                  <span
                    className={`inline-grid align-middle me-4 w-10 h-10 rounded-lg place-items-center transition-all ${
                      active === i ? "bg-mint-deep scale-110" : "bg-pet-700"
                    }`}
                  >
                    <i className={`fa-solid ${icon} text-mint text-[14px]`} />
                  </span>
                  <span className="inline-block align-middle">
                    <span className="block text-[11px] text-mist">{label}</span>
                    <span className="block text-[15px] text-fog">{value}</span>
                  </span>
                  <span
                    className={`float-left mt-4 w-2 h-2 rounded-full ${
                      active === i ? "bg-mint" : "bg-pet-600"
                    }`}
                  />
                  <span
                    className={`block overflow-hidden transition-all duration-500 text-[12px] text-mist ${
                      active === i
                        ? "max-h-12 pt-2 ps-14 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {detail}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <p className="mt-6 font-mono text-[10px] tracking-[.14em] text-mist/80 text-left">
            سجل توضيحي · بيانات افتراضية
          </p>
        </div>
      </div>
    </section>
  )
}
