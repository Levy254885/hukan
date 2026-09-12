import Link from 'next/link';

const footerLinks = {
  discover: [
    { href: '/search?purpose=buy', label: 'Buy' },
    { href: '/search?purpose=rent', label: 'Rent' },
    { href: '/search?purpose=land', label: 'Land' },
    { href: '/search?purpose=commercial', label: 'Commercial' },
    { href: '/developments', label: 'New Developments' },
    { href: '/market', label: 'Market insights' },
    { href: '/compare', label: 'Compare' },
  ],
  professionals: [
    { href: '/agents', label: 'Agents' },
    { href: '/agencies', label: 'Agencies' },
    { href: '/developers', label: 'Developers' },
    { href: '/list-property', label: 'List Property' },
  ],
  company: [
    { href: '/about', label: 'About' },
    { href: '/market', label: 'Market insights' },
    { href: '/help', label: 'Help' },
    { href: '/safety', label: 'Safety' },
    { href: '/contact', label: 'Contact' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/cookies', label: 'Cookies' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                H
              </span>
              <span className="text-lg">Hukan</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Kenya&apos;s property marketplace. Find a place that feels right.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Discover</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.discover.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Professionals</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.professionals.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Hukan. Kenya.
          </p>
          <p className="text-sm text-muted-foreground">
            Built for Kenyan property seekers & professionals.
          </p>
        </div>
      </div>
    </footer>
  );
}
