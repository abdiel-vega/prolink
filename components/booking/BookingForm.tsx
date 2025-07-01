"use client";

import { useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookingProgress } from "./BookingProgress";
import { ServiceSummary } from "./ServiceSummary";
import { CalendarPicker } from "./CalendarPicker";
import { ProjectRequirementsForm } from "./ProjectRequirementsForm";
import { useBookingStore } from "@/lib/stores/bookingStore";
import type { ServiceWithProfile } from "@/types";

interface BookingFormProps {
  service: ServiceWithProfile;
  onClose: () => void;
  onSuccess?: (bookingId: string) => void;
  className?: string;
}

export function BookingForm({ service, onClose, onSuccess, className = "" }: BookingFormProps) {
  const {
    selectedService,
    bookingForm,
    availableSlots,
    currentStep,
    steps,
    isLoading,
    error,
    setSelectedService,
    updateBookingForm,
    nextStep,
    prevStep,
    fetchAvailableSlots,
    createBooking,
    resetBooking,
  } = useBookingStore();

  // Initialize the booking when component mounts
  useEffect(() => {
    setSelectedService(service);
    return () => {
      // Don't reset on unmount to preserve state during navigation
    };
  }, [service, setSelectedService]);

  const handleDateTimeSelect = (dateTime: Date) => {
    updateBookingForm({
      bookingDateTime: dateTime,
      duration: 60, // Default 1 hour for time-based services
    });
  };

  const handleLoadSlots = (date: Date) => {
    fetchAvailableSlots(date, service.profile_id);
  };

  const handleRequirementsChange = (requirements: string) => {
    updateBookingForm({ projectRequirements: requirements });
  };

  const handleSpecialRequestsChange = (requests: string) => {
    updateBookingForm({ specialRequests: requests });
  };

  const handleNext = () => {
    if (currentStep === "details") {
      // Validate details step
      if (service.service_type === "TIME_BASED") {
        if (!bookingForm.bookingDateTime) {
          return; // Don't proceed without selected time
        }
      } else if (service.service_type === "PROJECT_BASED") {
        if (!bookingForm.projectRequirements || bookingForm.projectRequirements.trim().length < 20) {
          return; // Don't proceed without adequate requirements
        }
      }
    }
    nextStep();
  };

  const handlePrevious = () => {
    prevStep();
  };

  const handleBookingSubmit = async () => {
    if (currentStep === "payment") {
      // For now, simulate payment success
      const result = await createBooking("simulated_payment_method");
      
      if (result.success && result.bookingId) {
        nextStep(); // Move to confirmation
        onSuccess?.(result.bookingId);
      }
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "service":
        return true; // Service is already selected
      case "details":
        if (service.service_type === "TIME_BASED") {
          return !!bookingForm.bookingDateTime;
        } else {
          return bookingForm.projectRequirements && bookingForm.projectRequirements.trim().length >= 20;
        }
      case "payment":
        return true; // Payment validation would happen in real implementation
      case "confirmation":
        return false; // No next step after confirmation
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "service":
        return (
          <div className="space-y-6">
            <Card className="card-surface">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Service Confirmation</h3>
                <p className="text-muted-foreground mb-4">
                  Please review the service details below and proceed to the next step 
                  to {service.service_type === "TIME_BASED" ? "select your preferred time" : "provide project requirements"}.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    What happens next?
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    {service.service_type === "TIME_BASED" ? (
                      <>
                        <li>• Select your preferred date and time</li>
                        <li>• Complete payment to confirm booking</li>
                        <li>• Receive booking confirmation</li>
                        <li>• Connect with the professional</li>
                      </>
                    ) : (
                      <>
                        <li>• Provide detailed project requirements</li>
                        <li>• Complete payment to submit request</li>
                        <li>• Professional reviews and accepts</li>
                        <li>• Work begins on your project</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "details":
        if (service.service_type === "TIME_BASED") {
          return (
            <CalendarPicker
              availableSlots={availableSlots}
              selectedDateTime={bookingForm.bookingDateTime || null}
              onDateTimeSelect={handleDateTimeSelect}
              onLoadSlots={handleLoadSlots}
              isLoading={isLoading}
            />
          );
        } else {
          return (
            <ProjectRequirementsForm
              service={service}
              requirements={bookingForm.projectRequirements || ""}
              specialRequests={bookingForm.specialRequests || ""}
              onRequirementsChange={handleRequirementsChange}
              onSpecialRequestsChange={handleSpecialRequestsChange}
            />
          );
        }

      case "payment":
        return (
          <div className="space-y-6">
            <Card className="card-surface">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Payment</h3>
                <p className="text-muted-foreground mb-4">
                  Complete your payment to {service.service_type === "TIME_BASED" ? "confirm your booking" : "submit your project request"}.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Payment Integration Coming Soon:</strong> Stripe payment processing will be integrated in the next phase. 
                    For now, bookings will be created with pending payment status.
                  </p>
                </div>
                <Button 
                  onClick={handleBookingSubmit}
                  disabled={isLoading}
                  className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold"
                >
                  {isLoading ? "Processing..." : `Complete Booking - $${(service.price_in_cents / 100).toFixed(2)}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "confirmation":
        return (
          <div className="space-y-6">
            <Card className="card-primary">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
                <p className="opacity-90 mb-4">
                  Your {service.service_type === "TIME_BASED" ? "session" : "project request"} has been submitted successfully.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-secondary">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-3">What's Next?</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {service.service_type === "TIME_BASED" ? (
                    <>
                      <li>• You'll receive a confirmation email shortly</li>
                      <li>• The professional will prepare for your session</li>
                      <li>• Join the session at your scheduled time</li>
                      <li>• Leave a review after completion</li>
                    </>
                  ) : (
                    <>
                      <li>• The professional will review your requirements</li>
                      <li>• You'll receive confirmation within 24 hours</li>
                      <li>• Work will begin once accepted</li>
                      <li>• Track progress in your dashboard</li>
                    </>
                  )}
                </ul>
                
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Close
                  </Button>
                  <Button onClick={() => window.location.href = '/dashboard/bookings'} className="flex-1 bg-white text-gray-900 hover:bg-gray-100">
                    View Bookings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          <BookingProgress steps={steps} currentStep={currentStep} />
          
          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardContent className="p-4">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Step Content */}
          {renderStepContent()}
          
          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={currentStep === "service" ? onClose : handlePrevious}
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === "service" ? "Cancel" : "Previous"}
            </Button>
            
            {currentStep !== "confirmation" && (
              <Button
                onClick={currentStep === "payment" ? handleBookingSubmit : handleNext}
                disabled={!canProceed() || isLoading}
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold"
              >
                {currentStep === "payment" ? "Complete Payment" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <ServiceSummary service={service} />
          </div>
        </div>
      </div>
    </div>
  );
}
