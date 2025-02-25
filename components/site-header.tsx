'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleApply = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsOpen(false);
    router.push('/apply');
  };

  const navigationItems = [
    { href: '/strategic-innovation', label: 'Strategic Innovation' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/blog', label: 'FAQs' },
    { href: '/contact', label: 'Contact' },
  ] as const;

  if (!isMounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo & Brand Name */}
        <Link
          href="/"
          className="flex items-center space-x-0" // Removed horizontal spacing
        >
          <div className="flex items-center">
            <svg
              viewBox="0 0 200 200"
              width="48"
              height="48"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block sm:w-[56px] sm:h-[56px] md:w-[70px] md:h-[70px]"
            >
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                fontSize="85"
                fontFamily="Arial"
                fontWeight="bold"
                fill="currentColor"
                dy=".35em"
              >
                C
              </text>
              <text
                x="55%"
                y="60%"
                textAnchor="middle"
                fontSize="85"
                fontFamily="Arial"
                fontWeight="bold"
                fill="#4A5A5E"
                transform="rotate(20, 100, 100)"
                dy=".35em"
              >
                S
              </text>
              <text
                x="60%"
                y="28%"
                textAnchor="middle"
                fontSize="70"
                fontFamily="Arial"
                fontWeight="bold"
                fill="#4A5A5E"
                transform="rotate(20, 100, 100)"
                dy=".35em"
              >
                I
              </text>
            </svg>
            <span className="text-lg sm:text-xl md:text-2xl font-semibold">
              Carlora
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center justify-between ml-8">
          <div className="flex gap-6 text-sm">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button
              onClick={handleApply}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Apply
            </Button>
          </div>
        </nav>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            id="mobile-menu"
            className="fixed inset-0 z-50 md:hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Solid background overlay */}
            <div
              className="fixed inset-0 bg-black"
              aria-hidden="true"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu panel */}
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-900 border-l shadow-lg">
              <div className="flex items-center justify-between p-6">
                <Link
                  href="/"
                  className="flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="font-bold text-xl">
                    Carlora
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="px-6 py-4">
                <nav className="space-y-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block py-3 text-lg font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-4"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Button
                    onClick={handleApply}
                    className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Apply Now
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}