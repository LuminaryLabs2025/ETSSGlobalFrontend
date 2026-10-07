import { permissionModules } from "@/lib/mock-data";

export interface GuideTopic {
  heading: string;
  body: string;
  bullets?: string[];
  href?: string;
  hrefLabel?: string;
}

export interface GuideSection {
  id: string;
  title: string;
  summary: string;
  topics: GuideTopic[];
}

export const SMART_OPS_GUIDE_VERSION = "2026.1";
export const SMART_OPS_GUIDE_UPDATED = "7 October 2026";

export const SMART_OPS_GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    summary:
      "Official reference for how ETSS-Nigeria is intended to be operated, audited, and supported.",
    topics: [
      {
        heading: "Purpose of this guide",
        body:
          "The ETSS-Nigeria Smart-Ops Guide is the authoritative documentation for SuperAdmin and operations staff. It describes booking flows, user and permission models, payment behaviour, corridor oversight tools, and compliance expectations.",
        bullets: [
          "Use this guide when onboarding staff or resolving operational disputes.",
          "Dashboard behaviour should match the processes documented here; report gaps to platform owners.",
          "SuperAdmin users have full read access to this guide and to oversight modules referenced below.",
        ],
      },
      {
        heading: "Document control",
        body: `Version ${SMART_OPS_GUIDE_VERSION} · Last updated ${SMART_OPS_GUIDE_UPDATED}.`,
        bullets: [
          "Classification: Internal — Maritime-ETSS / ETSS-Nigeria operations.",
          "Supersedes informal walkthroughs and ad-hoc SOP notes where they conflict.",
        ],
      },
    ],
  },
  {
    id: "platform-overview",
    title: "Platform overview",
    summary: "How major dashboard areas fit together across the logistics corridor.",
    topics: [
      {
        heading: "Core modules",
        body: "The SuperAdmin dashboard groups capabilities into operations, infrastructure, traffic, revenue, and administration.",
        bullets: [
          "Overview — corridor KPIs, booking lifecycle snapshot, and quick links.",
          "Operations — bookings, daily truck requests (DTTR), trucks, drivers, companies.",
          "Infrastructure — ports, terminals, transit parks, facilities, barriers.",
          "Traffic Command — live trucks, live locations, OCC dashboard (SuperAdmin).",
          "e-Revenue — platform, NPA, facilities, transit parks, and tow-company revenue views.",
          "Administration — incidents, utility tickets, TEPs, penalties, users, team, activity log, app options.",
        ],
        href: "/dashboard",
        hrefLabel: "Open dashboard overview",
      },
    ],
  },
  {
    id: "booking-flows",
    title: "Booking flows",
    summary:
      "End-to-end booking types, payment, manifest lifecycle, and queue operations.",
    topics: [
      {
        heading: "Booking types",
        body:
          "Transporters (or SuperAdmin on their behalf) create bookings through dedicated book flows. Each flow collects truck, driver, terminal/facility, and transfer context before payment.",
        bullets: [
          "Bonded Terminal — import/export/empty/domestic container moves via bonded facilities.",
          "Truck Park — staging at designated truck parks before terminal access.",
          "Book Fish — specialised fish-port corridor bookings.",
          "EPT — export processing terminal bookings.",
        ],
        href: "/dashboard/bookings/all",
        hrefLabel: "View all bookings",
      },
      {
        heading: "Payment (Paystack)",
        body:
          "Completed bookings require online payment through Paystack. The application initializes payment, redirects the payer to Paystack, and verifies status on return via the payment callback route.",
        bullets: [
          "Do not mark bookings paid outside verified Paystack references.",
          "Payment types in App Options define linked forms (e.g. BOOK_BONDED_TERMINAL) and revenue triggers.",
          "SuperAdmin book-assist flows use the same Paystack path as transporter self-service.",
        ],
        href: "/dashboard/bookings/payment-callback",
        hrefLabel: "Payment callback route (reference verify)",
      },
      {
        heading: "Manifest & lifecycle",
        body:
          "After payment, bookings progress through facility, pregate, and terminal stages. Operations staff use queue views and mark-* lifecycle actions to reflect gate events.",
        bullets: [
          "Booking detail shows timeline with turnaround (TAT) between stages.",
          "Facility queue and pregate queue use terminal/facility context — confirm site before acting.",
          "Cancelled or flagged bookings remain auditable in the bookings database.",
        ],
        href: "/dashboard/bookings/queue",
        hrefLabel: "Open booking queues",
      },
      {
        heading: "SuperAdmin book assist",
        body:
          "When transporters cannot complete self-service, SuperAdmin may assist via bonded terminal, truck park, fish, or EPT book pages. All assists should be logged and tied to a valid business reason.",
        href: "/dashboard/bookings/book-bonded-terminal",
        hrefLabel: "Book bonded terminal (assist)",
      },
    ],
  },
  {
    id: "users-permissions",
    title: "User management & permissions",
    summary: "Accounts, teams, roles, and permission keys that gate dashboard features.",
    topics: [
      {
        heading: "Users and team",
        body:
          "Primary accounts represent organisations; sub-accounts receive scoped permissions. SuperAdmin manages platform users; team leads invite members within policy.",
        bullets: [
          "Create users with correct user type and department before granting sensitive permissions.",
          "Deactivate accounts instead of deleting when audit history must be preserved.",
          "My Team supports invite flows for sub-accounts under a primary organisation.",
        ],
        href: "/dashboard/users",
        hrefLabel: "User management",
      },
      {
        heading: "Permission model",
        body:
          "Permissions are grouped by module. Assign the minimum set required for each role. SuperAdmin bypasses most gates but should still follow operational SOPs.",
        bullets: permissionModules.flatMap((m) =>
          m.permissions.map((p) => `${m.module}: ${p.label} (${p.key}) — ${p.description}`),
        ),
        href: "/dashboard/team",
        hrefLabel: "My team",
      },
    ],
  },
  {
    id: "operations",
    title: "Operational processes",
    summary: "Day-to-day logistics registry, requests, and infrastructure maintenance.",
    topics: [
      {
        heading: "Fleet registry",
        body: "Trucks and drivers must be verified before booking eligibility. MSS verification, flags, and penalties affect whether a unit can be booked.",
        href: "/dashboard/trucks",
        hrefLabel: "Truck fleet",
      },
      {
        heading: "Daily truck requests (DTTR)",
        body:
          "DTTR captures planned daily movements and demand signals used for corridor planning and terminal coordination.",
        href: "/dashboard/dttr",
        hrefLabel: "Daily truck requests",
      },
      {
        heading: "Infrastructure",
        body:
          "Terminals, transit parks, facilities, and barriers must stay aligned with physical gate IDs and RFID/barrier configuration in App Options.",
        bullets: [
          "Barrier and handheld device records should match field hardware.",
          "Payment types and RFID tags link revenue and access control to booking categories.",
        ],
        href: "/dashboard/app-options",
        hrefLabel: "App options",
      },
      {
        heading: "Utility tickets & TEPs",
        body:
          "Terminal operators raise utility tickets for port/non-port terminal services. TEPs (Truck Entry Permits) support matching trucks at facility stage.",
        href: "/dashboard/utility-tickets",
        hrefLabel: "Utility tickets",
      },
      {
        heading: "Penalties & fines",
        body:
          "Enforcement officers issue penalties; paid penalties feed e-Revenue. Disputes and resolution paths must be documented in the penalty record.",
        href: "/dashboard/penalties",
        hrefLabel: "Penalties & fines",
      },
    ],
  },
  {
    id: "traffic-incidents",
    title: "Traffic command & incidents",
    summary: "Corridor visibility, OCC oversight, and incident lifecycle for SuperAdmin.",
    topics: [
      {
        heading: "Traffic Command",
        body:
          "Live truck updates show movement status counts and on-trip listings. Live location updates map facilities, pregates, and transit parks with barrier/TAT metrics. OCC consolidates capacity, emergencies, and cancelled bookings with AI-suggested command actions.",
        bullets: [
          "SuperAdmin-only — do not share OCC interventions outside authorised ops channels.",
          "Live feeds refresh on a short interval; use Last refresh timestamps when briefing stakeholders.",
        ],
        href: "/dashboard/traffic/live-trucks",
        hrefLabel: "Live truck updates",
      },
      {
        heading: "Incident reports",
        body:
          "Incidents reported across the platform surface for SuperAdmin review: severity, assignment, resolution approval, and closure.",
        href: "/dashboard/incidents",
        hrefLabel: "Incident reports",
      },
    ],
  },
  {
    id: "revenue-compliance",
    title: "e-Revenue & compliance",
    summary: "Financial transparency, exports, and operational standards.",
    topics: [
      {
        heading: "e-Revenue modules",
        body:
          "Maritime-ETSS view shows all platform revenue sources. NPA, Facilities, Transit Parks, and Tow Truck tabs show attributed shares for reconciliation.",
        bullets: [
          "Filter by source, date range, method, status, and amount before exporting CSV.",
          "Transaction detail must tie to booking ID or service reference for audit.",
        ],
        href: "/dashboard/revenue/etss",
        hrefLabel: "Maritime-ETSS e-Revenue",
      },
      {
        heading: "Activity log & audit",
        body:
          "Sensitive actions should be traceable via the activity log. Export reports only through authorised users with export permissions.",
        href: "/dashboard/activity-log",
        hrefLabel: "Activity log",
      },
      {
        heading: "Compliance reminders",
        body: "Operational standards for ETSS-Nigeria SuperAdmin usage:",
        bullets: [
          "Verify identity and authority before performing book-assist or user changes.",
          "Never share credentials or bypass Paystack for fee collection.",
          "Escalate corridor emergencies through OCC and incident workflows.",
          "Report extortion or coercion using official maritime reporting channels.",
        ],
      },
    ],
  },
];

export function filterGuideSections(query: string): GuideSection[] {
  const q = query.trim().toLowerCase();
  if (!q) return SMART_OPS_GUIDE_SECTIONS;

  return SMART_OPS_GUIDE_SECTIONS.map((section) => {
    const sectionHay = `${section.title} ${section.summary}`.toLowerCase();
    const matchingTopics = section.topics.filter((t) => {
      const hay = [
        t.heading,
        t.body,
        ...(t.bullets ?? []),
        t.hrefLabel ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q) || sectionHay.includes(q);
    });
    if (matchingTopics.length === 0 && !sectionHay.includes(q)) return null;
    return {
      ...section,
      topics: matchingTopics.length > 0 ? matchingTopics : section.topics,
    };
  }).filter(Boolean) as GuideSection[];
}
