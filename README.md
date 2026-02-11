# Cinema — Vintage Movie Ticketing System

A retro cinema-themed movie ticketing web application built with **React + Vite** and **Supabase**.

## Features

- **Landing Page** — Browse all movies in a vintage cinema grid
- **Movie Details** — View movie info and upcoming showtimes
- **Seat Selection** — Interactive, animated seat map with Standard/VIP types
- **Checkout** — Configure ticket types (Regular, Senior, PWD, Student, Child) with auto-discounts
- **Booking Confirmation** — Retro ticket-stub styled confirmation
- **User Dashboard** — View profile, loyalty tier, booking history with ticket stubs
- **Admin Panel** — Full CRUD for Movies, Sessions, Screens, Seats, Bookings, and Revenue reports

## Tech Stack

| Layer       | Technology                    |
|-------------|-------------------------------|
| Framework   | React 18 + Vite               |
| Styling     | Tailwind CSS 3                |
| Routing     | React Router 7                |
| Backend     | Supabase (Auth + PostgreSQL)  |
| Icons       | Lucide React                  |
| Dates       | date-fns                      |
| Toasts      | react-hot-toast               |

## Database Schema

The app maps to these Supabase tables:

| Table            | Purpose                                |
|------------------|----------------------------------------|
| `users`          | User accounts with role (Customer/Staff/Admin) |
| `customers`      | Customer profiles linked to users      |
| `staff`          | Staff profiles linked to users         |
| `loyaltyprofiles`| Loyalty tiers and points               |
| `screens`        | Cinema screens (Standard, IMAX, 4DX, Directors Club) |
| `seats`          | Seat layouts per screen (Standard/VIP) |
| `movies`         | Movie catalog with MTRCB ratings       |
| `sessions`       | Showtimes (movie + screen + experience type) |
| `bookings`       | Customer bookings with payment info    |
| `tickets`        | Individual tickets per seat per booking |
| `revenue`        | Revenue aggregation per branch/date    |

### Enum Types Used

- `user_role`: Customer, Staff, Admin
- `membership_tier`: Classic, Silver, Gold, Platinum
- `screen_type`: Standard, IMAX, Directors Club, 4DX
- `seat_type`: Standard, VIP
- `mtrcb_rating`: G, PG, PG-13, R-16, R-18, X
- `experience_type`: 2D, 3D, 4DX 2D, 4DX 3D, IMAX 2D, IMAX 3D, IMAX with Laser
- `payment_method`: GCash, Credit Card, Cash, Points
- `payment_status`: Pending, Paid, Refunded, Cancelled
- `ticket_type`: Regular, Senior Citizen, PWD, Student, Child

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the provided SQL schema in the Supabase SQL Editor to create all tables
3. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

4. Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Supabase Configuration

#### Enable Auth
- Go to **Authentication > Settings** in Supabase Dashboard
- Enable **Email** provider

#### Row Level Security (RLS)
For development, you may want to disable RLS or set permissive policies. For production, add appropriate policies:

```sql
-- Example: Allow authenticated users to read movies
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view movies" ON movies FOR SELECT USING (true);

-- Example: Allow authenticated users to read sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view sessions" ON sessions FOR SELECT USING (true);

-- Example: Allow authenticated users to read seats
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view seats" ON seats FOR SELECT USING (true);

-- Example: Allow authenticated users to read screens
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view screens" ON screens FOR SELECT USING (true);

-- Allow customers to create their own bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (true);

-- Allow ticket creation
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tickets" ON tickets FOR SELECT USING (true);
CREATE POLICY "Users can create tickets" ON tickets FOR INSERT WITH CHECK (true);

-- Users and customers
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public user operations" ON users FOR ALL USING (true);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public customer operations" ON customers FOR ALL USING (true);

ALTER TABLE loyaltyprofiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public loyalty operations" ON loyaltyprofiles FOR ALL USING (true);

ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view revenue" ON revenue FOR SELECT USING (true);
```

> **Note**: The policies above are permissive for development. Tighten them for production.

#### Create an Admin User
After registering a user through the app, promote them to Admin:

```sql
UPDATE users SET role = 'Admin' WHERE username = 'admin@example.com';
```

### 4. Run Development Server

```bash
npm run dev
```

The app will open at [http://localhost:5173](http://localhost:5173).

### 5. Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── main.jsx                          # App entry point
├── App.jsx                           # Route definitions
├── index.css                         # Tailwind + retro theme styles
├── lib/
│   └── supabase.js                   # Supabase client
├── context/
│   └── AuthContext.jsx               # Auth state & user management
├── hooks/
│   ├── useMovies.js                  # Movies CRUD
│   ├── useSessions.js                # Sessions CRUD
│   ├── useBookings.js                # Bookings CRUD
│   ├── useSeats.js                   # Seats management
│   ├── useScreens.js                 # Screens CRUD
│   ├── useRevenue.js                 # Revenue data
│   └── useLoyalty.js                 # Loyalty profiles
├── components/
│   ├── layout/
│   │   ├── Header.jsx                # Navigation header
│   │   ├── Footer.jsx                # Footer
│   │   ├── Layout.jsx                # Page layout wrapper
│   │   ├── ProtectedRoute.jsx        # Auth guard
│   │   └── AdminRoute.jsx            # Admin/Staff guard
│   ├── ui/
│   │   ├── RetroButton.jsx           # Themed button
│   │   ├── RetroCard.jsx             # Themed card
│   │   ├── RetroInput.jsx            # Themed input
│   │   ├── RetroSelect.jsx           # Themed select
│   │   ├── RetroModal.jsx            # Modal dialog
│   │   ├── RetroTicket.jsx           # Ticket stub component
│   │   ├── FilmGrain.jsx             # Film grain overlay
│   │   └── LoadingSpinner.jsx        # Loading indicator
│   ├── movies/
│   │   ├── MovieCard.jsx             # Movie poster card
│   │   └── MovieGrid.jsx             # Movie grid layout
│   ├── seats/
│   │   ├── SeatMap.jsx               # Interactive seat map
│   │   └── SeatLegend.jsx            # Seat type legend
│   └── booking/
│       ├── TicketTypeSelector.jsx     # Per-seat ticket type config
│       └── BookingSummary.jsx         # Checkout summary
└── pages/
    ├── Landing.jsx                    # Home / Now Showing
    ├── MovieDetails.jsx               # Movie info + showtimes
    ├── SeatSelection.jsx              # Seat picker
    ├── Checkout.jsx                   # Ticket config + payment
    ├── BookingConfirmation.jsx        # Success page
    ├── UserDashboard.jsx              # User profile & history
    ├── Login.jsx                      # Sign in
    ├── Register.jsx                   # Sign up
    └── admin/
        ├── AdminDashboard.jsx         # Admin home
        ├── ManageMovies.jsx           # Movies CRUD
        ├── ManageSessions.jsx         # Sessions CRUD
        ├── ManageScreens.jsx          # Screens CRUD
        ├── ManageSeats.jsx            # Seat layout generator
        ├── ManageBookings.jsx         # Booking management
        └── ViewRevenue.jsx            # Revenue reports
```

## Design Theme

**Vintage Retro Cinema** aesthetic featuring:
- Muted reds, cream, sepia, teal, and faded gold color palette
- Playfair Display headings, Source Serif body text, Special Elite accents
- Film grain overlay effect
- Jagged ticket-stub edge patterns
- Halftone dot background patterns
- Retro glow hover effects
- Animated seat selection with pop effects
- Flickering neon-style text animations
- Smooth page transitions

## License

This project is for educational purposes.
