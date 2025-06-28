# Supabase TypeScript Integration

This project is now configured with automatic TypeScript type generation from your Supabase database schema.

## Generated Files

- `lib/supabase/database.types.ts` - Auto-generated types from your Supabase schema
- `lib/supabase/types.ts` - Helper types and convenient exports
- `lib/supabase/client.ts` - Browser client with TypeScript types
- `lib/supabase/server.ts` - Server client with TypeScript types
- `lib/supabase/middleware.ts` - Middleware with TypeScript types

## Usage

### Using the Supabase client with types:

```typescript
import { createClient } from "@/lib/supabase/client";
import { Profile, Service, Booking } from "@/lib/supabase/types";

const supabase = createClient();

// Now you get full TypeScript autocomplete and type safety
const { data: profiles } = await supabase
  .from("profiles")
  .select("*")
  .returns<Profile[]>();

const { data: services } = await supabase
  .from("services")
  .select("*")
  .eq("is_active", true)
  .returns<Service[]>();
```

### Available Types

The following table types are available:

- `Profile` - User profiles
- `Service` - Services offered by professionals
- `Booking` - Service bookings
- `Review` - Service reviews
- `Category` - Service categories
- `Skill` - User skills
- `PortfolioProject` - Portfolio projects
- `WorkExperience` - Work experience entries

### Available Enum Types

- `UserRole` - 'CLIENT' | 'PROFESSIONAL'
- `BookingStatus` - 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'DECLINED'
- `PricingType` - 'FIXED' | 'HOURLY'
- `ServiceType` - 'TIME_BASED' | 'PROJECT_BASED'
- `DeliveryTimeUnit` - 'MINUTES' | 'HOURS' | 'DAYS' | 'WEEKS' | 'MONTHS'

## Regenerating Types

When you make changes to your Supabase database schema, regenerate the types by running:

```bash
npm run types:generate
```

This will fetch the latest schema from your prolink Supabase project and update the type definitions.

## Commands

- `npm run types:generate` - Regenerate TypeScript types from Supabase schema
- `npx supabase link --project-ref omwemfshvuijjtdjgmha` - Re-link to the Supabase project if needed
- `npx supabase status` - Check the status of your local Supabase setup
