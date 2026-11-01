export function FooterSection() {
  return (
    <footer id="footer" className="border-t border-pet-700">
      {" "}
      <div className="max-w-[1360px] mx-auto px-6 lg:px-10 py-10 flex flex-col md:flex-row justify-between gap-6 text-[13px] text-mist">
        {" "}
        <div className="flex items-center gap-3">
          <span className="font-latin tracking-[.18em] text-fog">
            {"TRIPMONITOR"}
          </span>
          <span className="opacity-70">{"من الطريق إلى القرار"}</span>
        </div>{" "}
        <div className="flex gap-8">
          <a href="#" className="hover:text-fog">
            {"المنصة"}
          </a>
          <a href="#" className="hover:text-fog">
            {"الخصوصية"}
          </a>
          <a href="#" className="hover:text-fog">
            {"تواصل معنا"}
          </a>
        </div>{" "}
      </div>{" "}
    </footer>
  )
}
