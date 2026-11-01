import { useState } from "react"

const fleet = [
  "RUH-4471",
  "RUH-3308",
  "RUH-1175",
  "RUH-2210",
  "RUH-0921",
  "RUH-5530",
  "RUH-6612",
]
const events = [
  {
    r: 2,
    c: 1,
    s: 2,
    alert: false,
    title: "تشغيل المحرك",
    vehicle: "RUH-1175",
    time: "07:05",
    detail: "بداية الوردية في مستودع الشمال.",
    icon: "fa-key",
    priority: "منخفضة",
  },
  {
    r: 4,
    c: 3,
    s: 3,
    alert: true,
    title: "تأخر تحديث المركبة",
    vehicle: "RUH-0921",
    time: "07:12",
    detail:
      "لم يصل أي تقرير منذ 07:12 — قد يكون الجهاز غير متصل أو خارج التغطية.",
    icon: "fa-tower-broadcast",
    priority: "متوسطة",
  },
  {
    r: 0,
    c: 8,
    s: 2,
    alert: false,
    title: "خروج من منطقة المستودع",
    vehicle: "RUH-4471",
    time: "07:40",
    detail: "مغادرة ضمن الجدول المخطط.",
    icon: "fa-right-from-bracket",
    priority: "منخفضة",
  },
  {
    r: 1,
    c: 17,
    s: 2,
    alert: false,
    title: "دخول منطقة عميل · العليا",
    vehicle: "RUH-3308",
    time: "08:25",
    detail: "وصول ضمن نافذة التسليم.",
    icon: "fa-location-dot",
    priority: "منخفضة",
  },
  {
    r: 5,
    c: 37,
    s: 4,
    alert: true,
    title: "حدث يستدعي فحصًا فنيًا",
    vehicle: "RUH-5530",
    time: "10:05",
    detail: "ارتفاع حرارة المحرك إلى 112 °C أثناء الحركة — الحمولة مجمدات.",
    icon: "fa-screwdriver-wrench",
    priority: "حرجة",
  },
  {
    r: 3,
    c: 39,
    s: 8,
    alert: true,
    title: "توقف غير متوقع",
    vehicle: "RUH-2210",
    time: "10:14",
    detail: "توقف 38 دقيقة خارج نقاط التسليم المخططة · حي الملز.",
    icon: "fa-circle-pause",
    priority: "متوسطة",
  },
  {
    r: 6,
    c: 40,
    s: 6,
    alert: true,
    title: "تجاوز حد حرارة الشحنة",
    vehicle: "RUH-6612",
    time: "10:22",
    detail:
      "9.1 °C أعلى من الحد المضبوط 8 °C لأكثر من 5 دقائق — الحمولة ألبان مبردة.",
    icon: "fa-temperature-arrow-up",
    priority: "حرجة",
  },
  {
    r: 1,
    c: 50,
    s: 2,
    alert: false,
    title: "خروج من منطقة عميل",
    vehicle: "RUH-3308",
    time: "11:10",
    detail: "مغادرة طبيعية بعد التسليم.",
    icon: "fa-right-from-bracket",
    priority: "منخفضة",
  },
]

export function EventSection() {
  const [selected, setSelected] = useState<number | null>(null)
  const [toast, setToast] = useState("")
  const event = selected === null ? null : events[selected]
  return (
    <section id="event" className="relative py-28">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <p className="font-mono text-[12px] tracking-[.18em] text-amber/90">
              الأحداث والتنبيهات
            </p>
            <h2 className="font-display mt-5 text-[34px] lg:text-[46px] font-semibold leading-[1.25]">
              معظم اليوم روتيني.
              <br />
              نُظهر لك ما يستحق انتباهك.
            </h2>
          </div>
          <div className="flex gap-6 text-[13px]">
            <div>
              <p className="text-mist">أحداث روتينية</p>
              <p className="font-mono text-[24px] text-fog">46</p>
            </div>
            <div>
              <p className="text-mist">تستدعي الانتباه</p>
              <p className="font-mono text-[24px] text-amber">4</p>
            </div>
          </div>
        </div>
        <div className="mt-12 rounded-[20px] border border-pet-700 bg-pet-850/60 p-5 lg:p-7 overflow-x-auto">
          <div dir="ltr" className="min-w-[680px]">
            <div className="flex justify-between font-mono text-[11px] text-mist mb-4 ps-[96px]">
              {[
                "07:00",
                "08:00",
                "09:00",
                "10:00",
                "11:00",
                "12:00",
                "13:00",
              ].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="space-y-3">
              {fleet.map((vehicle, r) => (
                <div key={vehicle} className="flex items-center gap-3">
                  <span
                    className={`w-[84px] shrink-0 font-mono text-[12px] ${
                      events.some((e) => e.r === r && e.alert)
                        ? "text-amber"
                        : "text-mist"
                    }`}
                  >
                    {vehicle}
                  </span>
                  <div className="flex-1 flex gap-[2px]">
                    {Array.from({ length: 72 }, (_, c) => {
                      const ei = events.findIndex(
                        (e) => e.r === r && c >= e.c && c < e.c + e.s,
                      )
                      const noise =
                        (Math.sin(r * 7.1 + c * 0.37) +
                          Math.sin(c * 0.11 + r)) *
                        0.5
                      const base =
                        noise > -0.15
                          ? "bg-mint/35"
                          : noise > -0.6
                            ? "bg-pet-600"
                            : "bg-pet-800 border border-pet-700"
                      const selectedCell = ei === selected
                      return (
                        <button
                          key={c}
                          title={ei >= 0 ? events[ei].title : undefined}
                          aria-label={
                            ei >= 0
                              ? `${events[ei].title}، ${events[ei].time}`
                              : `${vehicle} سجل الحركة`
                          }
                          onClick={() => ei >= 0 && setSelected(ei)}
                          className={`flex-1 h-6 rounded-[4px] cursor-pointer hover:brightness-150 transition-[filter] ${
                            ei < 0
                              ? base
                              : events[ei].alert
                                ? "bg-amber"
                                : "bg-mint"
                          } ${selectedCell ? "ring-2 ring-fog" : ""}`}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-5 text-[12px] text-mist">
            <span>متحركة</span>
            <span>متوقفة</span>
            <span>المحرك متوقف / بلا بيانات</span>
            <span className="text-mint">حدث روتيني</span>
            <span className="text-amber">يستدعي الانتباه</span>
            <span className="ms-auto">اضغط على الحدث لعرض تفاصيله</span>
          </div>
        </div>
        {event && (
          <div
            dir="rtl"
            className="mt-4 w-full max-w-[560px] rounded-2xl border border-amber/50 bg-pet-900 p-5 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-xl grid place-items-center bg-amber/15 text-amber">
                <i className={`fa-solid ${event.icon}`} />
              </span>
              <div className="flex-1">
                <p className="text-[11px] text-amber">
                  {event.alert ? "يستدعي الانتباه" : "حدث روتيني"} ·{" "}
                  {event.priority}
                </p>
                <p className="mt-1 font-semibold">{event.title}</p>
              </div>
              <button
                aria-label="إغلاق التفاصيل"
                onClick={() => setSelected(null)}
              >
                <i className="fa-solid fa-xmark text-mist" />
              </button>
            </div>
            <p className="mt-3 text-[13px] text-mist leading-relaxed">
              {event.detail}
            </p>
            <div className="mt-3 flex gap-5 text-[12px]">
              <span>
                المركبة <b className="font-mono ms-1">{event.vehicle}</b>
              </span>
              <span>
                الوقت <b className="font-mono ms-1">{event.time}</b>
              </span>
            </div>
            {event.alert && (
              <button
                onClick={() => {
                  setToast(
                    `عرض توضيحي: تمت محاكاة مراجعة ${event.vehicle} دون تنفيذ إجراء فعلي.`,
                  )
                  window.setTimeout(() => setToast(""), 2800)
                }}
                className="mt-4 h-9 px-4 rounded-lg bg-mint text-pet-900 text-[12px] font-semibold"
              >
                محاكاة مراجعة الحدث
              </button>
            )}
          </div>
        )}
        {toast && (
          <div
            role="status"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rounded-xl border border-mint/40 bg-pet-800 px-4 py-3 text-[13px] text-fog shadow-2xl"
          >
            {toast}
          </div>
        )}
      </div>
    </section>
  )
}
