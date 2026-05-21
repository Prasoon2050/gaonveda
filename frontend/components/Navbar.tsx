"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavbarProps {
  loggedIn: boolean;
  cartCount: number;
}

export function Navbar({ loggedIn, cartCount }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => {
    setIsOpen(false);
    setShowSearch(false);
  };

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      closeMenu();
      setSearchQuery("");
      setShowSearch(false);
    }
  };

  // Prevent scroll when Spotlight search overlay is open
  useEffect(() => {
    if (showSearch) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.removeProperty("overflow");
    }
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [showSearch]);

  // Spotlight Hotkeys: CMD+K / Ctrl+K toggles spotlight, ESC closes it
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes spotlightSlideIn {
          from {
            opacity: 0;
            transform: translateY(-40px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes spotlightFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .spotlight-input::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
          opacity: 1;
        }
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
        }
      `}</style>

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
            <button 
              aria-label="Search" 
              className="search-nav-btn" 
              onClick={() => {
                if (window.innerWidth <= 768) {
                  setIsOpen(true);
                  setTimeout(() => {
                    const searchInput = document.querySelector(".mobile-search-form input") as HTMLInputElement;
                    if (searchInput) {
                      searchInput.focus();
                    }
                  }, 350);
                } else {
                  setShowSearch(true);
                }
              }}
            >
              <span className="material-symbols-outlined">search</span>
            </button>
            
            <Link aria-label="Wishlist" className="desktop-only" href="/wishlist" onClick={closeMenu}>
              <span className="material-symbols-outlined">favorite</span>
            </Link>

            {loggedIn ? (
              <Link aria-label="Profile" className="desktop-only" href="/profile" onClick={closeMenu}>
                <span className="material-symbols-outlined">person</span>
              </Link>
            ) : (
              <Link className="login-pill desktop-only" href="/login" onClick={closeMenu}>
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

            {/* Drawer Header with Brand Logo and Close Button */}
            <div className="drawer-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(91, 75, 48, 0.1)", paddingBottom: "16px", marginBottom: "20px" }}>
              <div className="brand" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="/logo.png" alt="GAONVEDA Logo" style={{ height: "32px", width: "auto" }} />
                <span style={{ fontSize: "18px", fontWeight: "700", color: "var(--heritage-forest)", fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>GAONVEDA</span>
              </div>
              <button aria-label="Close menu" onClick={closeMenu} style={{ background: "none", border: "none", color: "var(--heritage-gold)", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", transition: "background 200ms ease" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>close</span>
              </button>
            </div>

            {/* Mobile Search Form inside Drawer */}
            <form onSubmit={handleSearchSubmit} className="mobile-search-form" style={{ padding: "0 0 16px", display: "flex", gap: "8px" }}>
              <input
                type="text"
                className="premium-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search treasures..."
                style={{
                  flex: 1,
                  borderRadius: "12px",
                  fontSize: "14px",
                  padding: "8px 12px",
                  border: "1px solid rgba(18, 53, 31, 0.15)",
                  background: "rgba(255, 255, 255, 0.9)",
                }}
              />
              <button type="submit" className="premium-button" style={{ padding: "0 12px", borderRadius: "12px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>search</span>
              </button>
            </form>

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

      {/* MAC SPOTLIGHT GLASSMORPHIC SEARCH BAR PILL */}
      {showSearch && (
        <div 
          className="spotlight-overlay"
          onClick={() => { setShowSearch(false); setSearchQuery(""); }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(12, 36, 20, 0.4)", // Translucent dark forest green theme overlay
            backdropFilter: "blur(20px)", // High intensity premium blur
            WebkitBackdropFilter: "blur(20px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            paddingTop: "22vh", // Perfectly balanced center-top position
            animation: "spotlightFadeIn 0.25s ease-out",
          }}
        >
          <form
            onSubmit={handleSearchSubmit}
            onClick={(e) => e.stopPropagation()} // Prevent overlay click click-through
            onMouseEnter={() => setIsSearchHovered(true)}
            onMouseLeave={() => setIsSearchHovered(false)}
            style={{
              width: "90%",
              maxWidth: "600px",
              height: "64px", // Sleek, clean pill height
              background: isSearchFocused ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.15)", // Frosted glassmorphism
              border: isSearchFocused 
                ? "1px solid rgba(180, 122, 26, 0.65)" // Bright gold border on focus
                : isSearchHovered 
                  ? "1px solid rgba(255, 255, 255, 0.45)" 
                  : "1px solid rgba(255, 255, 255, 0.25)",
              borderRadius: "9999px", // Perfect pill shape
              boxShadow: isSearchFocused
                ? "0 25px 60px rgba(12, 36, 20, 0.35), 0 0 0 4px rgba(180, 122, 26, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)"
                : "0 15px 40px rgba(12, 36, 20, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              display: "flex",
              alignItems: "center",
              padding: "0 24px",
              gap: "14px",
              animation: "spotlightSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <button
              type="submit"
              aria-label="Submit Search"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <span 
                className="material-symbols-outlined" 
                style={{ 
                  color: isSearchFocused ? "var(--heritage-gold)" : "rgba(255, 255, 255, 0.7)", 
                  fontSize: "26px",
                  fontWeight: "bold",
                  transition: "color 0.2s ease",
                }}
              >
                search
              </span>
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="spotlight-input"
              placeholder="Search GaaonVeda..."
              autoFocus
              style={{
                flex: 1,
                border: "none",
                background: "none",
                fontSize: "18px",
                fontFamily: "inherit",
                color: "#fff", // White text looks magnificent over glassmorphism
                outline: "none",
                caretColor: "var(--heritage-gold)", // Signature golden caret cursor
              }}
            />
            {/* Elegant glassmorphic close circle */}
            <button 
              type="button" 
              onClick={() => { setShowSearch(false); setSearchQuery(""); }}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255, 255, 255, 0.8)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
              }}
              title="Close Search (ESC)"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
