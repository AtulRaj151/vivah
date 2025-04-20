import { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { 
  UserCircle, 
  Menu,
  X, 
  ChevronDown,
  Camera,
  Video,
  Focus,
  Film,
  Calendar,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { UserContext } from "@/App";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, setUser } = useContext(UserContext);

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-display text-primary font-bold">Royal Videography</h1>
              </a>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:ml-6 md:flex md:space-x-6">
              <Link href="/">
                <a className={`px-3 py-2 text-sm font-medium ${isActive('/') ? 'text-primary' : 'text-neutral-600 hover:text-primary'}`}>
                  Home
                </a>
              </Link>
              <Link href="/photographers">
                <a className={`px-3 py-2 text-sm font-medium ${isActive('/photographers') ? 'text-primary' : 'text-neutral-600 hover:text-primary'}`}>
                  Photographers
                </a>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`px-3 py-2 text-sm font-medium inline-flex items-center ${isActive('/services') ? 'text-primary' : 'text-neutral-600 hover:text-primary'}`}>
                    Services <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <Link href="/services?category=1">
                    <DropdownMenuItem className="cursor-pointer">
                      <Camera className="mr-2 h-4 w-4" />
                      <span>Photography</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/services?category=2">
                    <DropdownMenuItem className="cursor-pointer">
                      <Video className="mr-2 h-4 w-4" />
                      <span>Videography</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/services?category=3">
                    <DropdownMenuItem className="cursor-pointer">
                      <Focus className="mr-2 h-4 w-4" />
                      <span>Focus Services</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/services?category=4">
                    <DropdownMenuItem className="cursor-pointer">
                      <Film className="mr-2 h-4 w-4" />
                      <span>Wedding Reels</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/booking">
                <a className={`px-3 py-2 text-sm font-medium ${isActive('/booking') ? 'text-primary' : 'text-neutral-600 hover:text-primary'}`}>
                  Book Now
                </a>
              </Link>
            </nav>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:ml-6 md:flex md:items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    {user?.fullName.split(' ')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href="/dashboard">
                    <DropdownMenuItem className="cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>My Bookings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/booking">
                  Book Now
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="font-display text-xl text-primary font-bold py-4">
                    Royal Videography
                  </div>

                  <nav className="flex flex-col space-y-4">
                    <SheetClose asChild>
                      <Link href="/">
                        <a className={`px-3 py-2 text-base font-medium rounded-md ${isActive('/') ? 'text-primary bg-primary/5' : 'text-neutral-600 hover:text-primary hover:bg-neutral-50'}`}>
                          Home
                        </a>
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link href="/photographers">
                        <a className={`px-3 py-2 text-base font-medium rounded-md ${isActive('/photographers') ? 'text-primary bg-primary/5' : 'text-neutral-600 hover:text-primary hover:bg-neutral-50'}`}>
                          Photographers
                        </a>
                      </Link>
                    </SheetClose>

                    <div className="px-3 py-2 text-sm font-medium text-neutral-500 uppercase">
                      Services
                    </div>

                    <SheetClose asChild>
                      <Link href="/services?category=1">
                        <a className="px-3 py-2 text-base font-medium rounded-md text-neutral-600 hover:text-primary hover:bg-neutral-50 flex items-center">
                          <Camera className="mr-2 h-4 w-4" />
                          <span>Photography</span>
                        </a>
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link href="/services?category=2">
                        <a className="px-3 py-2 text-base font-medium rounded-md text-neutral-600 hover:text-primary hover:bg-neutral-50 flex items-center">
                          <Video className="mr-2 h-4 w-4" />
                          <span>Videography</span>
                        </a>
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link href="/services?category=3">
                        <a className="px-3 py-2 text-base font-medium rounded-md text-neutral-600 hover:text-primary hover:bg-neutral-50 flex items-center">
                          <Focus className="mr-2 h-4 w-4" />
                          <span>Focus Services</span>
                        </a>
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link href="/services?category=4">
                        <a className="px-3 py-2 text-base font-medium rounded-md text-neutral-600 hover:text-primary hover:bg-neutral-50 flex items-center">
                          <Film className="mr-2 h-4 w-4" />
                          <span>Wedding Reels</span>
                        </a>
                      </Link>
                    </SheetClose>

                    <SheetClose asChild>
                      <Link href="/booking">
                        <a className={`px-3 py-2 text-base font-medium rounded-md ${isActive('/booking') ? 'text-primary bg-primary/5' : 'text-neutral-600 hover:text-primary hover:bg-neutral-50'}`}>
                          Book Now
                        </a>
                      </Link>
                    </SheetClose>
                  </nav>

                  <div className="mt-auto py-4">
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        <SheetClose asChild>
                          <Link href="/dashboard">
                            <Button variant="outline" className="w-full justify-start">
                              <Calendar className="mr-2 h-4 w-4" />
                              My Bookings
                            </Button>
                          </Link>
                        </SheetClose>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                          onClick={handleLogout}
                        >
                          <LogIn className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <SheetClose asChild>
                        <Link href="/booking">
                          <Button className="w-full">Book Now</Button>
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}