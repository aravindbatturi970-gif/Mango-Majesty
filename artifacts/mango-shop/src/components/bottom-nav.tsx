import { Link, useLocation } from "wouter";
import { Home, Leaf, Headphones, User, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useUserAuth } from "@/contexts/user-auth";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Mangoes", icon: Leaf },
  { href: "/help", label: "Help", icon: Headphones },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const [location] = useLocation();
  const { cart } = useCart();
  const { openLoginModal, user } = useUserAuth();
  const itemCount = cart?.itemCount || 0;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pb-safe pointer-events-none">
      <div className="relative pointer-events-auto">
        {/* Nav bar */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[28px] shadow-[0_4px_32px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center justify-around px-2 py-1.5 pr-16">
          {LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? location === "/"
                : location.startsWith(link.href);

            const handleClick =
              link.href === "/profile" && !user
                ? (e: React.MouseEvent) => {
                    e.preventDefault();
                    openLoginModal();
                  }
                : undefined;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleClick}
                className="flex flex-col items-center py-1.5 px-3 rounded-2xl transition-colors relative"
              >
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
                    isActive ? "bg-amber-400" : ""
                  }`}
                >
                  <link.icon
                    className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span
                  className={`text-[10px] mt-0.5 font-semibold ${
                    isActive ? "text-amber-500" : "text-gray-400"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Floating cart button */}
        <Link
          href="/cart"
          className="absolute right-1 top-1/2 -translate-y-1/2 w-14 h-14 bg-amber-400 hover:bg-amber-500 rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(251,191,36,0.5)] transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-6 h-6 text-white" strokeWidth={2.5} />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.div
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white"
                >
                  {itemCount}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Link>
      </div>
    </nav>
  );
}
