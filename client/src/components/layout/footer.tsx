import { Link } from "wouter";
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-display font-bold text-primary mb-4">Vivah</h3>
            <p className="text-neutral-400 text-sm">
              Capturing the magic of Indian weddings with artistry and passion. Our team of photographers and videographers create timeless memories of your special celebration.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
                <Instagram />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
                <Facebook />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
                <Youtube />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/services?category=1">
                  <a className="text-neutral-400 hover:text-primary transition-colors">Photography</a>
                </Link>
              </li>
              <li>
                <Link href="/services?category=2">
                  <a className="text-neutral-400 hover:text-primary transition-colors">Videography</a>
                </Link>
              </li>
              <li>
                <Link href="/services?category=3">
                  <a className="text-neutral-400 hover:text-primary transition-colors">Drone Services</a>
                </Link>
              </li>
              <li>
                <Link href="/services?category=4">
                  <a className="text-neutral-400 hover:text-primary transition-colors">Wedding Reels</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/photographers">
                  <a className="text-neutral-400 hover:text-primary transition-colors">Our Photographers</a>
                </Link>
              </li>
              <li>
                <Link href="/booking">
                  <a className="text-neutral-400 hover:text-primary transition-colors">Book Now</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-primary transition-colors">Testimonials</a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-primary transition-colors">Portfolio</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-neutral-400">
                <Phone className="h-4 w-4 mr-2" />
                <span>+91 8340608143, +91 7004711393</span>
              </li>
              <li className="flex items-center text-neutral-400">
                <Mail className="h-4 w-4 mr-2" />
                <span>atulsid156@gmail.com</span>
              </li>
              <li className="flex items-start text-neutral-400">
                <MapPin className="h-4 w-4 mr-2 mt-1" />
                <span>Royal Video Graphy, Dehri-on-Sone, Bihar 821305</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm">
            &copy; {new Date().getFullYear()} Vivah Photography. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-neutral-400 hover:text-primary text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-neutral-400 hover:text-primary text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
