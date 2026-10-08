export default function Footer() {
  return (
    <footer className="border-t border-line py-11 text-[13px] text-ink">
      <div className="wrap flex flex-wrap justify-between gap-5">
        <span>© {__BUILD_YEAR__} Wael Mansouri Photography · Tunisia</span>
        <span>English · Français · العربية</span>
      </div>
    </footer>
  );
}
