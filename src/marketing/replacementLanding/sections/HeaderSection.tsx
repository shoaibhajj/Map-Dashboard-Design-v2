export function HeaderSection() {
  return (
    <header id="header" className="absolute top-0 inset-x-0 z-50">
      {" "}
      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        {" "}
        <a
          href="#"
          className="flex items-center gap-3"
          aria-label="TRIPMONITOR"
        >
          {" "}
          <span className="relative w-8 h-8 grid place-items-center">
            {" "}
            <span className="absolute inset-0 rounded-lg border border-mint/40 rotate-45" />{" "}
            <span className="w-2 h-2 rounded-full bg-mint" />{" "}
          </span>{" "}
          <span className="font-latin font-semibold tracking-[.18em] text-[15px]">
            {"TRIPMONITOR"}
          </span>{" "}
        </a>{" "}
        <nav className="hidden lg:flex items-center gap-8 text-[14px] text-mist">
          {" "}
          <a href="#value" className="hover:text-fog transition-colors">
            {"المنصة"}
          </a>{" "}
          <a href="#journey" className="hover:text-fog transition-colors">
            {"الرحلات"}
          </a>{" "}
          <a href="#lineage" className="hover:text-fog transition-colors">
            {"الأجهزة والحساسات"}
          </a>{" "}
          <a href="#event" className="hover:text-fog transition-colors">
            {"الأحداث والتنبيهات"}
          </a>{" "}
          <a href="#preview" className="hover:text-fog transition-colors">
            {"التجربة التفاعلية"}
          </a>{" "}
        </nav>{" "}
        <div className="flex items-center gap-3">
          {" "}
          <a
            href="#"
            className="hidden sm:inline-flex h-9 items-center px-4 rounded-lg text-[14px] text-fog hover:bg-pet-800 transition-colors"
          >
            {"تسجيل الدخول"}
          </a>{" "}
          <a
            href="#cta"
            className="inline-flex h-9 items-center px-4 rounded-lg bg-fog text-pet-900 text-[14px] font-medium hover:bg-white transition-colors"
          >
            {"اطلب عرضًا توضيحيًا"}
          </a>{" "}
        </div>{" "}
      </div>{" "}
    </header>
  )
}
