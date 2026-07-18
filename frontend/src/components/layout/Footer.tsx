import { Link } from "react-router-dom";
import { Briefcase, Github, Linkedin, Twitter } from "lucide-react";

const productLinks = [
  { label: "Browse Jobs", to: "/jobs" },
  { label: "For Recruiters", to: "/register" },
  { label: "Pricing", to: "/" },
];

const companyLinks = [
  { label: "About Us", to: "/" },
  { label: "Careers", to: "/" },
  { label: "Blog", to: "/" },
];

const legalLinks = [
  { label: "Privacy Policy", to: "/" },
  { label: "Terms of Service", to: "/" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
                <Briefcase className="h-5 w-5 text-white" />
              </span>
              <span className="text-lg font-bold text-slate-900">TalentHub</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              Connecting ambitious talent with companies that matter. Find your
              next opportunity today.
            </p>
            <div className="mt-4 flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-primary-200 hover:text-primary-600"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Legal" links={legalLinks} />
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} TalentHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; to: string }>;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="text-sm text-slate-500 transition-colors hover:text-primary-600"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
