"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  loggedIn: boolean;
  cartCount: number;
}

export function Navbar({ loggedIn, cartCount }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleShopClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      closeMenu();
      const shopSection = document.getElementById("shop");
      if (shopSection) {
        shopSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      closeMenu();
    }
  };

  return (
    <>
      <nav className="top-nav">
        <div className="nav-inner">
          <Link className="brand" href="/" onClick={closeMenu}>
            <img src="/logo.png" alt="GAONVEDA Logo" />
            <span>GAONVEDA</span>
          </Link>

          {/* Desktop links */}
          <div className="nav-links">
            <Link href="/products" onClick={handleShopClick}>Shop</Link>
            <Link href="/#story" onClick={closeMenu}>Our Story</Link>
            <Link href="/#process" onClick={closeMenu}>Process</Link>
            <Link href="/#coming-soon" onClick={closeMenu}>Coming Soon</Link>
          </div>

          {/* Action icons */}
          <div className="nav-actions">
            <button aria-label="Search" className="search-nav-btn">
              <span className="material-symbols-outlined">search</span>
            </button>
            
            <Link aria-label="Wishlist" href="/wishlist" onClick={closeMenu}>
              <span className="material-symbols-outlined">favorite</span>
            </Link>

            {loggedIn ? (
              <Link aria-label="Profile" href="/profile" onClick={closeMenu}>
                <span className="material-symbols-outlined">person</span>
              </Link>
            ) : (
              <Link className="login-pill" href="/login" onClick={closeMenu}>
                Login
              </Link>
            )}

            <Link className="cart-button" aria-label="Cart" href="/cart" onClick={closeMenu}>
              <span className="material-symbols-outlined">shopping_cart</span>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>

            {/* Mobile menu toggle */}
            <button className="mobile-menu" aria-label="Menu" onClick={toggleMenu}>
              <span className="material-symbols-outlined">{isOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Slide-out mobile menu overlay */}
      {isOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMenu}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>

            <div className="drawer-links">
              <Link href="/products" onClick={handleShopClick}>
                <span className="material-symbols-outlined">shopping_bag</span>
                Shop All
              </Link>
              <Link href="/#story" onClick={closeMenu}>
                <span className="material-symbols-outlined">history_edu</span>
                Our Story
              </Link>
              <Link href="/#process" onClick={closeMenu}>
                <span className="material-symbols-outlined">precision_manufacturing</span>
                Process
              </Link>
              <Link href="/#coming-soon" onClick={closeMenu}>
                <span className="material-symbols-outlined">upcoming</span>
                Coming Soon
              </Link>
            </div>

            <div className="drawer-footer">
              <Link href="/wishlist" onClick={closeMenu}>
                <span className="material-symbols-outlined">favorite</span>
                Wishlist
              </Link>
              {loggedIn ? (
                <Link href="/profile" onClick={closeMenu}>
                  <span className="material-symbols-outlined">person</span>
                  Profile
                </Link>
              ) : (
                <Link href="/login" onClick={closeMenu}>
                  <span className="material-symbols-outlined">login</span>
                  Login
                </Link>
              )}
              <Link href="/cart" onClick={closeMenu} className="drawer-cart-link">
                <span className="material-symbols-outlined">shopping_cart</span>
                Cart
                {cartCount > 0 && <span className="drawer-cart-count">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
