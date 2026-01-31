import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer id="about" className="bg-sidebar py-16">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-xl text-sidebar-foreground">ChamberBox</span>
            </Link>
            <p className="text-sidebar-foreground/70 max-w-md mb-6">
              The complete digital chamber management system for individual doctors in Bangladesh. 
              Simple, affordable, and built for local needs.
            </p>
            <p className="text-sidebar-foreground/50 text-sm">
              Made with ❤️ in Bangladesh
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sidebar-foreground font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <Link to="/login" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sidebar-foreground font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-sidebar-border">
          <p className="text-center text-sidebar-foreground/50 text-sm">
            © {new Date().getFullYear()} ChamberBox. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
