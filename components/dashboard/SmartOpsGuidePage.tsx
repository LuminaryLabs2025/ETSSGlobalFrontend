"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookMarked,
  ChevronRight,
  ExternalLink,
  Search,
  Shield,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { SuperAdminGate } from "@/components/dashboard/book-assist/BookAssistUi";
import {
  filterGuideSections,
  SMART_OPS_GUIDE_SECTIONS,
  SMART_OPS_GUIDE_UPDATED,
  SMART_OPS_GUIDE_VERSION,
} from "@/lib/smart-ops-guide-content";

export function SmartOpsGuidePage() {
  const isSuperAdmin = useAuthStore((s) => s.user?.is_super_admin ?? false);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState(SMART_OPS_GUIDE_SECTIONS[0]?.id ?? "");

  const sections = useMemo(() => filterGuideSections(search), [search]);

  if (!isSuperAdmin) {
    return <SuperAdminGate featureLabel="ETSS-Nigeria Smart-Ops Guide" />;
  }

  return (
    <div className="space-y-5 p-5 lg:p-6">
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0f1e2e]">
              <BookMarked className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                ETSS-Nigeria Smart-Ops Guide
              </h1>
              <p className="mt-0.5 max-w-2xl text-sm text-gray-500">
                Authoritative reference for booking flows, user management, permissions, and
                operational processes on the ETSS application.
              </p>
              <p className="mt-2 text-[11px] text-gray-400">
                Version {SMART_OPS_GUIDE_VERSION} · Updated {SMART_OPS_GUIDE_UPDATED}
              </p>
            </div>
          </div>
          <span className="inline-flex h-fit items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200">
            <Shield className="h-3.5 w-3.5" />
            SuperAdmin documentation
          </span>
        </div>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guide — bookings, Paystack, permissions, OCC…"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[240px_1fr]">
        <nav
          className="hidden lg:block"
          aria-label="Guide sections"
        >
          <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-3">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Contents
            </p>
            <ul className="space-y-0.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => setActiveId(s.id)}
                    className={`block rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                      activeId === s.id
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="min-w-0 space-y-4">
          {sections.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
              <p className="text-sm text-gray-500">No sections match your search.</p>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-2 text-xs font-medium text-emerald-600 hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-xl border border-gray-200 bg-white overflow-hidden"
              >
                <div className="border-b border-gray-100 bg-gray-50/80 px-5 py-4">
                  <h2 className="text-base font-bold text-gray-900">{section.title}</h2>
                  <p className="mt-1 text-xs text-gray-500">{section.summary}</p>
                </div>
                <div className="divide-y divide-gray-100 px-5">
                  {section.topics.map((topic) => (
                    <article key={topic.heading} className="py-4">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {topic.heading}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {topic.body}
                      </p>
                      {topic.bullets && topic.bullets.length > 0 && (
                        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-gray-600">
                          {topic.bullets.map((b) => (
                            <li key={b} className="leading-relaxed">
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                      {topic.href && (
                        <Link
                          href={topic.href}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
                        >
                          {topic.hrefLabel ?? "Open in dashboard"}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-5 py-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
              <ChevronRight className="h-4 w-4" />
              Need a change to this guide?
            </p>
            <p className="mt-1 text-xs text-emerald-800/80">
              Request documentation updates through your Maritime-ETSS platform owner so SOPs
              stay aligned with production behaviour.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 lg:hidden">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-700"
          >
            {s.title}
          </a>
        ))}
      </div>
    </div>
  );
}
