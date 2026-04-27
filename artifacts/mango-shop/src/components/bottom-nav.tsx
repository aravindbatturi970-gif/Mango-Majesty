import { Link, useLocation } from "wouter";
import { Home, Grid, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { motion, AnimatePresence } from "framer-motion";

export function BottomNav() {
  const [location] = useLocation();
  const { cart } = useCart();
  const itemCount = cart?.itemCount || 0;

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/shop", label: "Shop", icon: Grid },
    { href: "/cart", label: "Cart", icon: ShoppingBag, badge: itemCount },
    { href: "/subscribe", label: "Subscribe", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border pb-safe pt-2 px-6 flex justify-between items-center shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
      {links.map((link) => {
        const isActive = location === link.href;
        return (
          <Link key={link.href} href={link.href} className="relative flex flex-col items-center p-2 text-muted-foreground hover:text-primary transition-colors">
            <div className="relative">
              <link.icon className={`w-6 h-6 ${isActive ? 'text-primary' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              {link.badge && link.badge > 0 ? (
                <AnimatePresence>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-background"
                  >
                    {link.badge}
                  </motion.div>
                </AnimatePresence>
              ) : null}
            </div>
            <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-primary' : ''}`}>
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
