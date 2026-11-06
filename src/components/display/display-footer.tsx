import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { Copyright, Credits } from "@/components/brand/credits";
import type { DisplayCopy, DisplayLanguage } from "@/lib/display/copy";

/** Credits, copyright and a quiet way in for the staff. */
export function DisplayFooter({
  copy,
  language,
}: {
  copy: DisplayCopy;
  language: DisplayLanguage;
}) {
  return (
    <footer className="flex shrink-0 flex-col items-center justify-between gap-2 px-4 pt-1 pb-3 text-xs text-txt-muted md:flex-row lg:px-6">
      <Credits language={language} />
      <div className="flex items-center gap-4">
        <Copyright />
        <Link
          href="/monitor"
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 opacity-60 transition-opacity hover:opacity-100"
          title={copy.footer.operator}
        >
          <LockKeyhole className="size-3" />
          {copy.footer.operator}
        </Link>
      </div>
    </footer>
  );
}
