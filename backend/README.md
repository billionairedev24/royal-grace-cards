# Royal Grace Cards - Micronaut Backend

This is the backend API for the Royal Grace Cards e-commerce platform built with Micronaut Framework.

## Features

- RESTful API for card (product) management
- Order processing and management
- Shipping config configuration
- Stripe payment integration
- QR code generation for Zelle and Cash App payments
- CORS enabled for frontend integration

## Prerequisites

- Java 17 or higher
- Gradle 8.x

## Running the Application

### Development Mode

```bash
./gradlew run
```

The API will be available at `http://localhost:8080`

### Build

```bash
./gradlew build
```

### Run JAR

```bash
java -jar build/libs/royal-grace-cards-0.1-all.jar
```

## API Endpoints

### Cards (Products)

- `GET /api/cards` - Get all cards
- `GET /api/cards/{id}` - Get card by ID
- `POST /api/cards` - Create new card
- `PATCH /api/cards/{id}` - Update card
- `DELETE /api/cards/{id}` - Delete card

### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create new order
- `PATCH /api/orders/{id}` - Update order status

### Settings

- `GET /api/config/shipping` - Get shipping config
- `PUT /api/config/shipping` - Update shipping config

### Payment

- `POST /api/payment/stripe` - Create Stripe checkout session
- `POST /api/payment/qr-codes` - Generate QR codes for Zelle/Cash App

## Configuration

Update `src/main/resources/application.yml` with your:
- Stripe API keys
- Payment provider details (Zelle email, Cash App handle)
- CORS allowed origins for your frontend

## Data Storage

Currently using in-memory storage (ConcurrentHashMap). For production, integrate with a database:

1. Add database dependencies to `build.gradle`
2. Configure database connection in `application.yml`
3. Replace in-memory maps with proper repositories/DAOs

## Stripe Integration

To integrate with real Stripe:

1. Add Stripe Java SDK dependency
2. Update `PaymentService.createStripeCheckout()` to call actual Stripe API
3. Set up webhook endpoint for payment confirmations
4. Configure Stripe webhook secret in application.yml

## QR Code Generation

To generate real QR codes:

1. Add QR code generation library (e.g., ZXing)
2. Update `PaymentService.generateQRCodes()` to create actual QR codes
3. Encode payment URLs for Zelle and Cash App

## Testing

```bash
./gradlew test
```

## Deployment

Build the application and deploy the JAR file to your server or cloud platform.

For Heroku, AWS, GCP, or other platforms, follow their Java/Micronaut deployment guides.
