import { useState } from "react"

const sensors = [
  {
    id: "T1",
    name: "حرارة الشحنة",
    icon: "fa-temperature-half",
    value: "4.2",
    unit: "°C",
    type: "مسبار حرارة · المقصورة الخلفية",
    time: "09:42:18",
    ago: "6 ث",
    x: 150,
    y: 100,
  },

  {
    id: "H1",
    name: "الرطوبة",
    icon: "fa-droplet",
    value: "78",
    unit: "%",
    type: "حساس رطوبة · منتصف المقصورة",
    time: "09:42:18",
    ago: "6 ث",
    x: 290,
    y: 160,
  },

  {
    id: "D1",
    name: "الباب الخلفي",
    icon: "fa-door-closed",
    value: "مغلق",
    unit: "",
    type: "حساس باب · مغناطيسي",
    time: "09:41:50",
    ago: "34 ث",
    x: 44,
    y: 130,
  },

  {
    id: "F1",
    name: "مستوى الوقود",
    icon: "fa-gas-pump",
    value: "61",
    unit: "%",
    type: "حساس وقود · الخزان الأيمن",
    time: "09:42:10",
    ago: "14 ث",
    x: 420,
    y: 200,
  },

  {
    id: "GT-4821",
    name: "جهاز التتبع",
    icon: "fa-satellite-dish",
    value: "12",
    unit: "قمرًا",
    type: "GPS · سقف المقصورة الأمامية",
    time: "09:42:18",
    ago: "6 ث",
    x: 540,
    y: 130,
  },
]

export function SensorsSection() {
  const [active, setActive] = useState(0)

  const sensor = sensors[active]

  return (
    <section
      id="sensors"
      className="relative py-28 bg-pet-950/70 border-y border-pet-700 overflow-hidden"
    >
      {" "}
      <div className="relative max-w-[1360px] mx-auto px-6 lg:px-10">
        {" "}
        <div className="max-w-[640px]">
          {" "}
          <p className="font-mono text-[12px] tracking-[.18em] text-mint/90">
            {"مصدر القراءة"}
          </p>{" "}
          <h2 className="font-display mt-5 text-[34px] lg:text-[46px] font-semibold leading-[1.25]">
            {"كل قراءة تعرف مصدرها، ووقت وصولها."}
          </h2>{" "}
          <p className="mt-5 text-mist leading-relaxed">
            {
              "اعرف موقع كل حساس على المركبة، وما الذي يقيسه، ومتى وصلت قراءته الأخيرة — لتثق بالرقم قبل أن تتصرف بناءً عليه."
            }
          </p>{" "}
        </div>{" "}
        <div className="mt-12 grid lg:grid-cols-12 gap-8 items-center">
          {" "}
          <div
            className="lg:col-span-7 rounded-[20px] border border-pet-700 bg-pet-850/60 p-6"
            dir="ltr"
          >
            {" "}
            <svg id="truck" viewBox="0 0 640 260" className="w-full h-auto">
              {" "}
              <defs>
                <pattern
                  id="g4"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M20 0H0V20"
                    fill="none"
                    stroke="#123A41"
                    strokeWidth=".5"
                  />
                </pattern>
              </defs>{" "}
              <rect width="640" height="260" fill="url(#g4)" />{" "}
              <g fill="#0B2A30" stroke="#2A5B62" strokeWidth="1.5">
                {" "}
                <rect x="40" y="50" width="420" height="160" rx="10" />
                <rect x="470" y="62" width="130" height="136" rx="22" />{" "}
                <rect
                  x="480"
                  y="76"
                  width="34"
                  height="108"
                  rx="6"
                  fill="#113840"
                />{" "}
              </g>{" "}
              <g fill="#06181C" stroke="#2A5B62">
                <rect x="80" y="38" width="56" height="14" rx="4" />
                <rect x="80" y="208" width="56" height="14" rx="4" />
                <rect x="330" y="38" width="56" height="14" rx="4" />
                <rect x="330" y="208" width="56" height="14" rx="4" />
                <rect x="520" y="50" width="50" height="14" rx="4" />
                <rect x="520" y="196" width="50" height="14" rx="4" />
              </g>{" "}
              <path
                d="M60 70 H440 M60 190 H440"
                stroke="#1A434A"
                strokeDasharray="3 5"
              />{" "}
              <line x1="40" y1="130" x2="40" y2="130" stroke="#5EF2C2" />{" "}
              <text
                x="250"
                y="135"
                textAnchor="middle"
                font-family="IBM Plex Mono"
                fontSize="12"
                fill="#2A5B62"
              >
                {"RUH-4471 · CARGO"}
              </text>{" "}
              {sensors.map((item, i) => (
                <g
                  key={item.id}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="cursor-pointer"
                  transform={`translate(${item.x} ${item.y})`}
                >
                  <circle
                    r="16"
                    fill="#5EF2C2"
                    opacity={active === i ? ".18" : "0"}
                  />
                  <circle
                    r="7"
                    fill={active === i ? "#5EF2C2" : "#06181C"}
                    stroke="#5EF2C2"
                    strokeWidth="2"
                  />
                  <text
                    y="-14"
                    textAnchor="middle"
                    fontFamily="IBM Plex Mono"
                    fontSize="11"
                    fill={active === i ? "#E4F1EE" : "#86A9A8"}
                  >
                    {item.id}
                  </text>
                </g>
              ))}{" "}
            </svg>{" "}
          </div>{" "}
          <div className="lg:col-span-5">
            {" "}
            <div
              id="sMain"
              className="rounded-[20px] border border-mint/40 bg-pet-800 p-6 min-h-[250px]"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[13px] text-mist">
                  <i className={`fa-solid ${sensor.icon} text-mint`} />
                  {sensor.name}
                </span>
                <span className="flex items-center gap-1.5 text-[12px] text-mint">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                  متصل
                </span>
              </div>
              <p className="mt-4 font-latin text-[60px] leading-none font-light">
                {sensor.value}
                <span className="text-[22px] text-mist ms-2 font-sans">
                  {sensor.unit}
                </span>
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-[13px]">
                <div>
                  <dt className="text-[11px] text-mist">هوية الحساس</dt>
                  <dd className="font-mono">{sensor.id}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-mist">المركبة</dt>
                  <dd className="font-mono">RUH-4471</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-mist">آخر تحديث</dt>
                  <dd>
                    <span className="font-mono">{sensor.time}</span> · قبل{" "}
                    {sensor.ago}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-mist">النوع والموضع</dt>
                  <dd>{sensor.type}</dd>
                </div>
              </dl>
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div id="sCards" className="mt-6 flex flex-col sm:flex-row gap-3">
          {sensors.map((item, i) => (
            <button
              key={item.id}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={`flex-1 text-right rounded-xl border p-4 transition-all duration-500 min-w-0 ${
                i === active
                  ? "border-mint/60 bg-pet-800 flex-[1.8]"
                  : "border-pet-600 bg-pet-850"
              }`}
            >
              <span className="flex items-center gap-2 text-[12px] text-mist">
                <i className={`fa-solid ${item.icon} text-mint`} />
                {item.name}
              </span>
              <span className="block mt-2 font-latin text-fog text-[18px]">
                {item.value}{" "}
                <small className="text-[11px] text-mist font-sans">
                  {item.unit}
                </small>
              </span>
            </button>
          ))}
        </div>{" "}
      </div>{" "}
    </section>
  )
}
