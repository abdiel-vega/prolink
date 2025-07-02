import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { BookingFormData, ServiceWithProfile, TimeSlot } from "@/types";

interface BookingFormStep {
  id: "service" | "details" | "payment" | "confirmation";
  title: string;
  description: string;
  completed: boolean;
}
import { createClient } from "@/lib/supabase/client";

interface BookingStore {
  // State
  selectedService: ServiceWithProfile | null;
  bookingForm: Partial<BookingFormData>;
  availableSlots: TimeSlot[];
  currentStep: BookingFormStep["id"];
  steps: BookingFormStep[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedService: (service: ServiceWithProfile) => void;
  updateBookingForm: (data: Partial<BookingFormData>) => void;
  setCurrentStep: (step: BookingFormStep["id"]) => void;
  nextStep: () => void;
  prevStep: () => void;
  fetchAvailableSlots: (date: Date, professionalId: string) => Promise<void>;
  createBooking: (
    paymentMethodId: string
  ) => Promise<{ success: boolean; bookingId?: string; error?: string }>;
  resetBooking: () => void;
  calculateDeliveryDate: (service: ServiceWithProfile) => Date;
}

const initialSteps: BookingFormStep[] = [
  {
    id: "service",
    title: "Service Details",
    description: "Review service information",
    completed: false,
  },
  {
    id: "details",
    title: "Booking Details",
    description: "Provide project details or select time",
    completed: false,
  },
  {
    id: "payment",
    title: "Payment",
    description: "Complete your payment",
    completed: false,
  },
  {
    id: "confirmation",
    title: "Confirmation",
    description: "Booking confirmed",
    completed: false,
  },
];

export const useBookingStore = create<BookingStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      selectedService: null,
      bookingForm: {},
      availableSlots: [],
      currentStep: "service",
      steps: initialSteps,
      isLoading: false,
      error: null,

      // Actions
      setSelectedService: (service) => {
        set({
          selectedService: service,
          bookingForm: {
            serviceId: service.id,
            serviceType: service.service_type,
            totalAmount: service.price_in_cents,
          },
        });
      },

      updateBookingForm: (data) => {
        set((state) => ({
          bookingForm: { ...state.bookingForm, ...data },
        }));
      },

      setCurrentStep: (step) => {
        set((state) => ({
          currentStep: step,
          steps: state.steps.map((s) => ({
            ...s,
            completed: s.id === step ? false : s.completed,
          })),
        }));
      },

      nextStep: () => {
        const { currentStep, steps } = get();
        const currentIndex = steps.findIndex((s) => s.id === currentStep);

        if (currentIndex < steps.length - 1) {
          const nextStep = steps[currentIndex + 1];
          set((state) => ({
            currentStep: nextStep.id,
            steps: state.steps.map((s, index) => ({
              ...s,
              completed: index <= currentIndex ? true : s.completed,
            })),
          }));
        }
      },

      prevStep: () => {
        const { currentStep, steps } = get();
        const currentIndex = steps.findIndex((s) => s.id === currentStep);

        if (currentIndex > 0) {
          const prevStep = steps[currentIndex - 1];
          set({
            currentStep: prevStep.id,
          });
        }
      },

      fetchAvailableSlots: async (date, professionalId) => {
        set({ isLoading: true, error: null });

        try {
          const supabase = createClient();
          const startOfDay = new Date(date);
          startOfDay.setHours(9, 0, 0, 0); // 9 AM

          const endOfDay = new Date(date);
          endOfDay.setHours(17, 0, 0, 0); // 5 PM

          // Generate hourly slots
          const slots: TimeSlot[] = [];
          const current = new Date(startOfDay);

          while (current < endOfDay) {
            const slotEnd = new Date(current.getTime() + 60 * 60 * 1000); // 1 hour slots
            slots.push({
              start: new Date(current),
              end: slotEnd,
              available: true,
            });
            current.setHours(current.getHours() + 1);
          }

          // Check for existing bookings
          const { data: existingBookings } = await supabase
            .from("bookings")
            .select("booking_start_time, booking_end_time")
            .eq("professional_profile_id", professionalId)
            .gte("booking_start_time", startOfDay.toISOString())
            .lt("booking_start_time", endOfDay.toISOString())
            .in("status", ["PENDING_CONFIRMATION", "CONFIRMED"]);

          // Mark unavailable slots
          const availableSlots = slots.map((slot) => {
            const isBooked = existingBookings?.some((booking) => {
              const bookingStart = new Date(booking.booking_start_time);
              const bookingEnd = booking.booking_end_time
                ? new Date(booking.booking_end_time)
                : bookingStart;

              return (
                (slot.start >= bookingStart && slot.start < bookingEnd) ||
                (slot.end > bookingStart && slot.end <= bookingEnd)
              );
            });

            return {
              ...slot,
              available: !isBooked,
            };
          });

          set({ availableSlots, isLoading: false });
        } catch (error) {
          console.error("Error fetching available slots:", error);
          set({
            error: "Failed to fetch available time slots",
            isLoading: false,
          });
        }
      },

      createBooking: async (paymentMethodId) => {
        const { selectedService, bookingForm } = get();

        if (!selectedService || !bookingForm.serviceId) {
          set({ error: "Missing service information", isLoading: false });
          return { success: false, error: "Missing service information" };
        }

        set({ isLoading: true, error: null });

        try {
          const supabase = createClient();

          // Get current user
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            throw new Error("User not authenticated");
          }

          // Create the booking
          const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .insert({
              client_id: user.id,
              professional_profile_id: selectedService.profile_id,
              service_id: selectedService.id,
              booking_start_time:
                bookingForm.bookingDateTime?.toISOString() ||
                new Date().toISOString(),
              booking_end_time:
                bookingForm.serviceType === "TIME_BASED" && bookingForm.duration
                  ? new Date(
                      (bookingForm.bookingDateTime?.getTime() || Date.now()) +
                        bookingForm.duration * 60 * 1000
                    ).toISOString()
                  : null,
              notes: [
                bookingForm.projectRequirements,
                bookingForm.specialRequests,
                bookingForm.clientNotes,
              ]
                .filter(Boolean)
                .join("\n\n"),
              amount_paid_in_cents: selectedService.price_in_cents,
              status: "PENDING_CONFIRMATION",
            })
            .select()
            .single();

          if (bookingError) {
            console.error("Booking creation error:", bookingError);
            throw new Error(bookingError.message || "Failed to create booking");
          }

          // TODO: Process payment with Stripe
          // For now, we'll simulate successful payment

          set({ isLoading: false, error: null });
          return { success: true, bookingId: booking.id };
        } catch (error) {
          console.error("Error creating booking:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create booking";
          set({
            error: errorMessage,
            isLoading: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      calculateDeliveryDate: (service) => {
        const now = new Date();
        const deliveryDate = new Date(now);

        switch (service.delivery_time_unit) {
          case "MINUTES":
            deliveryDate.setMinutes(
              now.getMinutes() + service.delivery_time_value
            );
            break;
          case "HOURS":
            deliveryDate.setHours(now.getHours() + service.delivery_time_value);
            break;
          case "DAYS":
            deliveryDate.setDate(now.getDate() + service.delivery_time_value);
            break;
          case "WEEKS":
            deliveryDate.setDate(
              now.getDate() + service.delivery_time_value * 7
            );
            break;
          case "MONTHS":
            deliveryDate.setMonth(now.getMonth() + service.delivery_time_value);
            break;
        }

        return deliveryDate;
      },

      resetBooking: () => {
        set({
          selectedService: null,
          bookingForm: {},
          availableSlots: [],
          currentStep: "service",
          steps: initialSteps,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: "booking-store",
    }
  )
);
