import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Check, Circle } from "lucide-react";

interface BookingLayoutProps {
  children: ReactNode;
  step: 1 | 2 | 3;
}

export default function BookingLayout({ children, step }: BookingLayoutProps) {
  const [location] = useLocation();

  const steps = [
    { id: 1, name: "Service Selection", href: "/booking" },
    { id: 2, name: "Payment", href: "#" },
    { id: 3, name: "Confirmation", href: "#" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol
            role="list"
            className="flex items-center"
          >
            {steps.map((stepItem, stepIdx) => (
              <li
                key={stepItem.name}
                className={`${
                  stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
                } relative flex-1 ${stepIdx !== 0 ? "ml-4 md:ml-0" : ""}`}
              >
                {stepItem.id < step ? (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-primary" />
                    </div>
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <Check className="h-5 w-5 text-white" aria-hidden="true" />
                      <span className="sr-only">{stepItem.name}</span>
                    </div>
                  </>
                ) : stepItem.id === step ? (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-neutral-200" />
                    </div>
                    <div
                      className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white"
                      aria-current="step"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                      <span className="sr-only">{stepItem.name}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-neutral-200" />
                    </div>
                    <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-300 bg-white">
                      <span
                        className="h-2.5 w-2.5 rounded-full bg-transparent"
                        aria-hidden="true"
                      />
                      <span className="sr-only">{stepItem.name}</span>
                    </div>
                  </>
                )}
                <div className="hidden sm:block absolute top-0 right-0 h-full w-5 md:w-10" />
                <div
                  className={`mt-3 whitespace-nowrap ${
                    stepItem.id <= step ? "text-primary font-medium" : "text-neutral-500"
                  }`}
                >
                  {stepItem.name}
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}
