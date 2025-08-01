# Forbidden Component

This component displays a 403 Forbidden error page when users try to access resources they don't have permission for.

## Features

- **Clean Design**: Modern, responsive design with smooth animations
- **User Actions**: 
  - Go Back button (uses browser history)
  - Go Home button (navigates to root path)
- **Responsive**: Works well on mobile and desktop devices
- **Animations**: Includes fade-in and shake animations for better UX

## Usage

The component is automatically used by the `authorizationGuard` when a user has a valid token but lacks the required permissions for a route.

You can also navigate to it directly:

```typescript
this.router.navigate(['/forbidden']);
```

## Route

The component is accessible at `/forbidden` route as defined in `app.routes.ts`.

## Styling

The component uses:
- CSS Grid and Flexbox for layout
- CSS animations for smooth transitions
- Responsive design principles
- Modern color scheme with proper contrast

## Testing

The component includes comprehensive unit tests covering:
- Component creation
- Navigation functionality
- UI rendering
- Button interactions
