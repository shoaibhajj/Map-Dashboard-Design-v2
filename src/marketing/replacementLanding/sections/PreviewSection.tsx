import { useState } from "react"

const demoVehicles = [
  {
    id: "RUH-4471",
    kind: "شاحنة مبردة",
    driver: "خالد العتيبي",
    status: "متحركة",
    speed: 64,
    alert: false,
    color: "#5EF2C2",
    route: "160,390 240,330 310,350 390,260 470,280 560,190 660,230",
    sensors: [
      ["حرارة الشحنة", "4.2 °C"],
      ["الرطوبة", "78%"],
    ],
    update: "قبل 6 ثوانٍ",
  },

  {
    id: "RUH-3308",
    kind: "فان توزيع",
    driver: "سارة الحربي",
    status: "متحركة",
    speed: 48,
    alert: false,
    color: "#5EF2C2",
    route: "110,220 190,180 280,210 380,150 500,170",
    sensors: [
      ["المحرك", "طبيعي"],
      ["الوقود", "61%"],
    ],
    update: "قبل 12 ثانية",
  },

  {
    id: "RUH-1175",
    kind: "مركبة خدمة",
    driver: "عمر القحطاني",
    status: "متوقفة",
    speed: 0,
    alert: false,
    color: "#86A9A8",
    route: "180,450 270,410 360,420 440,370",
    sensors: [
      ["المحرك", "متوقف"],
      ["البطارية", "12.6 V"],
    ],
    update: "قبل دقيقة",
  },

  {
    id: "RUH-2210",
    kind: "شاحنة نقل",
    driver: "ناصر الدوسري",
    status: "توقف غير متوقع",
    speed: 0,
    alert: true,
    color: "#FF9F45",
    route: "450,100 500,140 560,130 620,180",
    sensors: [
      ["مدة التوقف", "38 دقيقة"],
      ["الموقع", "حي الملز"],
    ],
    update: "قبل 4 دقائق",
  },

  {
    id: "RUH-0921",
    kind: "مركبة توصيل",
    driver: "ريم المطيري",
    status: "بلا تحديث",
    speed: 0,
    alert: true,
    color: "#FF9F45",
    route: "80,310 150,270 220,290",
    sensors: [
      ["GPS", "لا توجد قراءة"],
      ["آخر اتصال", "07:12"],
    ],
    update: "منذ 2 ساعة",
  },

  {
    id: "RUH-5530",
    kind: "شاحنة مبردة",
    driver: "فهد الشمري",
    status: "تستدعي الانتباه",
    speed: 52,
    alert: true,
    color: "#FF9F45",
    route: "310,100 380,130 420,90 490,110",
    sensors: [
      ["حرارة المحرك", "112 °C"],
      ["الحمولة", "مجمدات"],
    ],
    update: "قبل 8 ثوانٍ",
  },

  {
    id: "RUH-6612",
    kind: "شاحنة مبردة",
    driver: "محمد السالم",
    status: "تستدعي الانتباه",
    speed: 42,
    alert: true,
    color: "#FF9F45",
    route: "550,390 600,350 660,370 710,320",
    sensors: [
      ["حرارة الشحنة", "9.1 °C"],
      ["حد الحرارة", "8 °C"],
    ],
    update: "قبل 10 ثوانٍ",
  },
]

export function PreviewSection() {
  const [selected, setSelected] = useState(0)

  const [query, setQuery] = useState("")

  const [zoom, setZoom] = useState(1)

  const [alertsOpen, setAlertsOpen] = useState(true)

  const vehicle = demoVehicles[selected]

  const visible = demoVehicles
    .map((item, index) => ({ item, index }))
    .filter(({ item }) =>
      `${item.id} ${item.driver} ${item.kind}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )

  return (
    <section
      id="preview"
      className="relative pt-20 pb-28 overflow-hidden border-t border-pet-700"
    >
      {" "}
      <div className="absolute inset-x-0 top-40 h-[600px] bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(94,242,194,.07),transparent)]" />{" "}
      <div className="relative max-w-[1360px] mx-auto px-6 lg:px-10">
        {" "}
        <div className="text-center max-w-[720px] mx-auto">
          {" "}
          <p className="font-mono text-[12px] tracking-[.18em] text-mint/90">
            {"التجربة التفاعلية"}
          </p>{" "}
          <h2 className="font-display mt-5 text-[34px] lg:text-[50px] font-semibold leading-[1.2]">
            {"مكان واحد لترى وتفهم وتتصرف."}
          </h2>{" "}
          <p className="mt-5 text-mist leading-relaxed">
            {
              "تجتمع الخريطة والمركبات والرحلات والحساسات والأحداث في مساحة تشغيل واحدة. اختر مركبة، واستكشف مسارها، وافهم حالتها، وانتقل من المعلومة إلى الإجراء المناسب."
            }
          </p>{" "}
        </div>{" "}
        <div className="relative mt-14 mx-auto max-w-[1220px] rounded-[22px] border border-pet-600 bg-pet-900 shadow-[0_60px_120px_-30px_rgba(0,0,0,.8)] overflow-hidden">
          {" "}
          <div className="h-12 border-b border-pet-700 flex items-center gap-3 px-4">
            {" "}
            <span className="font-latin text-[12px] tracking-[.18em]">
              {"TRIPMONITOR"}
            </span>{" "}
            <label className="ms-4 flex-1 max-w-[320px] h-8 rounded-md bg-pet-850 border border-pet-700 flex items-center px-3 gap-2 text-[12px] text-mist focus-within:border-mint/50">
              <i className="fa-solid fa-magnifying-glass text-[11px]" />
              <input
                id="pSearch"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="bg-transparent outline-none flex-1 text-fog placeholder:text-mist"
                placeholder="ابحث برقم اللوحة أو السائق"
              />
            </label>{" "}
            <span className="ms-auto font-mono text-[11px] text-mist hidden sm:inline">
              {"لقطة توضيحية · 10:30"}
            </span>{" "}
          </div>{" "}
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:h-[560px]">
            {" "}
            <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-e border-pet-700 p-3 overflow-y-auto max-h-[260px] lg:max-h-none">
              <p className="text-[11px] text-mist mb-2 px-1">
                {"المركبات · "}
                <span id="pCount">{visible.length}</span>
              </p>
              <div id="pList" className="space-y-1.5">
                {visible.map(({ item, index }) => (
                  <button
                    key={item.id}
                    onClick={() => setSelected(index)}
                    className={`w-full text-right rounded-lg border px-3 py-2.5 transition-colors ${
                      selected === index
                        ? "border-mint/50 bg-pet-800"
                        : "border-transparent hover:border-pet-600 hover:bg-pet-850"
                    }`}
                  >
                    <span className="flex justify-between items-center text-[13px]">
                      <span className="font-mono">{item.id}</span>
                      <span
                        className={`flex items-center gap-1.5 text-[11px] ${
                          item.alert
                            ? "text-amber"
                            : item.speed
                              ? "text-mint"
                              : "text-mist"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.alert
                              ? "bg-amber"
                              : item.speed
                                ? "bg-mint"
                                : "bg-mist"
                          }`}
                        />
                        {item.status}
                      </span>
                    </span>
                    <span className="block text-[11px] text-mist mt-1">
                      {item.kind} · {item.driver}
                    </span>
                  </button>
                ))}
              </div>
            </div>{" "}
            <div
              id="pMapWrap"
              dir="ltr"
              className="lg:col-span-6 relative bg-[#0A2428] overflow-hidden h-[380px] lg:h-auto cursor-grab active:cursor-grabbing touch-none"
            >
              {" "}
              <svg
                id="pMap"
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 800 520"
                preserveAspectRatio="xMidYMid slice"
              >
                {" "}
                <defs>
                  <pattern
                    id="g3"
                    width="36"
                    height="36"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M36 0H0V36"
                      fill="none"
                      stroke="#123A41"
                      strokeWidth=".6"
                    />
                  </pattern>
                </defs>{" "}
                <g
                  id="pView"
                  transform={`translate(${400 - 400 * zoom} ${260 - 260 * zoom}) scale(${zoom})`}
                >
                  <rect
                    x="-400"
                    y="-300"
                    width="1600"
                    height="1120"
                    fill="url(#g3)"
                  />{" "}
                  <g
                    stroke="#17434A"
                    fill="none"
                    strokeLinecap="round"
                    strokeWidth="10"
                  >
                    <path d="M-400 120 H1200" />
                    <path d="M-400 260 H1200" />
                    <path d="M-400 420 H1200" />
                    <path d="M140 -300 V820" />
                    <path d="M300 -300 V820" />
                    <path d="M560 -300 V820" />
                    <path d="M700 -300 V820" />
                  </g>{" "}
                  <g id="pRoutes">
                    {demoVehicles.map((item, i) => (
                      <polyline
                        key={item.id}
                        points={item.route}
                        fill="none"
                        stroke={i === selected ? item.color : "#2FA987"}
                        strokeWidth={i === selected ? 4 : 2}
                        opacity={i === selected ? 0.9 : 0.3}
                        strokeDasharray={item.alert ? "7 6" : undefined}
                      />
                    ))}
                  </g>
                  <g id="pDots">
                    {demoVehicles.map((item, i) => {
                      const [x, y] = item.route
                        .split(" ")
                        .at(-1)!
                        .split(",")
                        .map(Number)
                      return (
                        <g
                          key={item.id}
                          className="cursor-pointer"
                          onClick={() => setSelected(i)}
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r={i === selected ? 14 : 9}
                            fill="#06181C"
                            stroke={item.color}
                            strokeWidth="3"
                          />
                          <circle cx={x} cy={y} r="3" fill={item.color} />
                          <title>
                            {item.id} · {item.status}
                          </title>
                        </g>
                      )
                    })}
                  </g>
                </g>{" "}
              </svg>{" "}
              <div className="absolute top-3 left-3 flex flex-col rounded-lg border border-pet-600 bg-pet-900/90 overflow-hidden">
                <button
                  id="zIn"
                  onClick={() => setZoom((value) => Math.min(2.4, value * 1.2))}
                  className="w-8 h-8 text-mist hover:text-fog"
                  aria-label="تكبير"
                >
                  <i className="fa-solid fa-plus text-[11px]" />
                </button>
                <button
                  id="zOut"
                  onClick={() => setZoom((value) => Math.max(0.7, value / 1.2))}
                  className="w-8 h-8 text-mist hover:text-fog border-t border-pet-700"
                  aria-label="تصغير"
                >
                  <i className="fa-solid fa-minus text-[11px]" />
                </button>
                <button
                  id="zReset"
                  onClick={() => setZoom(1)}
                  className="w-8 h-8 text-mist hover:text-fog border-t border-pet-700"
                  aria-label="إعادة الضبط"
                >
                  <i className="fa-solid fa-expand text-[11px]" />
                </button>
              </div>{" "}
              <p
                dir="rtl"
                className="absolute bottom-3 right-3 text-[11px] text-mist bg-pet-900/80 rounded px-2 py-1"
              >
                {"اسحب للتحريك · اضغط على مركبة لتحديدها"}
              </p>{" "}
              <button
                id="aBell"
                onClick={() => setAlertsOpen((open) => !open)}
                dir="rtl"
                className="absolute top-3 right-3 z-20 h-9 ps-3 pe-1.5 rounded-lg border border-amber/60 bg-pet-900/95 text-amber text-[12px] font-medium flex items-center gap-2 hover:bg-pet-800 transition-colors"
                aria-expanded={alertsOpen}
              >
                <i className="fa-solid fa-bell bell-shake" />
                {"تتطلب تدخلًا الآن"}
                <span className="min-w-[22px] h-[22px] px-1 rounded-md bg-amber text-pet-900 font-mono text-[11px] grid place-items-center">
                  {"3"}
                </span>
              </button>{" "}
              {alertsOpen && (
                <div
                  id="aPanel"
                  dir="rtl"
                  className="absolute top-14 right-3 z-20 w-[320px] max-w-[calc(100%-24px)] rounded-xl border border-amber/50 bg-pet-900/95 backdrop-blur-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,.85)] p-3"
                >
                  <p className="text-[12px] font-semibold text-amber mb-2">
                    تنبيهات تحتاج متابعة
                  </p>
                  {demoVehicles
                    .filter((item) => item.alert)
                    .slice(0, 3)
                    .map((item, i) => (
                      <button
                        key={item.id}
                        onClick={() => setSelected(demoVehicles.indexOf(item))}
                        className="block w-full text-right rounded-lg p-2 hover:bg-pet-800"
                      >
                        <span className="block text-[12px] text-fog">
                          {
                            [
                              "توقف غير متوقع",
                              "تأخر تحديث المركبة",
                              "تجاوز حد حرارة الشحنة",
                            ][i]
                          }
                        </span>
                        <span className="font-mono text-[10px] text-mist">
                          {item.id} · {item.driver}
                        </span>
                      </button>
                    ))}
                </div>
              )}{" "}
            </div>{" "}
            <div
              id="pDetail"
              className="lg:col-span-3 border-t lg:border-t-0 lg:border-s border-pet-700 p-4 overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[15px]">{vehicle.id}</p>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded ${
                    vehicle.alert
                      ? "bg-amber/15 text-amber"
                      : "bg-mint/15 text-mint"
                  }`}
                >
                  {vehicle.alert ? "يستدعي الانتباه" : "طبيعي"}
                </span>
              </div>
              <p className="text-[12px] text-mist mt-1">
                {vehicle.kind} · {vehicle.driver}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                <div>
                  <p className="text-mist">الحالة</p>
                  <p>{vehicle.status}</p>
                </div>
                <div>
                  <p className="text-mist">السرعة</p>
                  <p className="font-mono text-[15px]">{vehicle.speed} كم/س</p>
                </div>
                <div className="col-span-2">
                  <p className="text-mist">آخر تحديث</p>
                  <p>{vehicle.update}</p>
                </div>
              </div>
              <p className="mt-5 text-[11px] text-mist">قراءات الحساسات</p>
              <div className="mt-2 space-y-1.5">
                {vehicle.sensors.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between rounded-md bg-pet-850 px-3 py-2 text-[12px]"
                  >
                    <span className="text-mist">{label}</span>
                    <span className="font-mono">{value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[11px] text-mist">الأحداث</p>
              <button className="mt-2 w-full text-right rounded-md px-3 py-2 text-[12px] border border-pet-700 text-fog">
                {vehicle.alert
                  ? "مراجعة الحدث · بيانات توضيحية"
                  : "رحلة نشطة · تحديث مباشر تجريبي"}
              </button>
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <p className="mt-6 text-center font-mono text-[10px] tracking-[.14em] text-mist/80">
          {"بيانات توضيحية · الإجراءات محاكاة ولا تُنفَّذ فعليًا"}
        </p>{" "}
      </div>{" "}
    </section>
  )
}
