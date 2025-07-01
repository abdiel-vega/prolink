import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingStep {
  id: "service" | "details" | "payment" | "confirmation";
  title: string;
  description: string;
  completed: boolean;
}

interface BookingProgressProps {
  steps: BookingStep[];
  currentStep: BookingStep["id"];
  className?: string;
}

export function BookingProgress({ steps, currentStep, className = "" }: BookingProgressProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.completed || index < currentStepIndex;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-200",
                    {
                      "bg-primary border-primary text-primary-foreground": isCompleted,
                      "bg-background border-primary text-primary": isActive && !isCompleted,
                      "bg-background border-border text-muted-foreground": !isActive && !isCompleted,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                
                {/* Step Label - Hidden on mobile */}
                <div className="hidden md:block text-center mt-2 min-w-0 max-w-[120px]">
                  <div
                    className={cn(
                      "text-xs font-medium truncate",
                      {
                        "text-primary": isActive || isCompleted,
                        "text-muted-foreground": !isActive && !isCompleted,
                      }
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 mx-4">
                  <div
                    className={cn(
                      "h-0.5 w-full transition-colors duration-200",
                      {
                        "bg-primary": isCompleted,
                        "bg-border": !isCompleted,
                      }
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Info */}
      <div className="md:hidden mt-4 text-center">
        <div className="text-sm font-medium text-foreground">
          {steps[currentStepIndex]?.title}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {steps[currentStepIndex]?.description}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Step {currentStepIndex + 1} of {steps.length}</span>
          <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-border rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
