# Voting Component - Svelte to Angular Conversion

This document describes the conversion of the Svelte voting page to Angular components.

## Components Created

### 1. Main Voting Component
- **Location**: `src/app/module/client/game/voting/voting.component.ts`
- **Purpose**: Main voting interface with real-time updates
- **Features**:
  - Real-time voting via Socket.IO
  - Dish display with images and descriptions
  - Vote counting and winner determination
  - Responsive grid layout

### 2. Shared Components

#### NameDialogComponent
- **Location**: `src/app/shared/components/name-dialog/name-dialog.component.ts`
- **Purpose**: Modal dialog for entering user's name
- **Features**: Material Design dialog with form validation

#### CategoryComponent
- **Location**: `src/app/shared/components/category/category.component.ts`
- **Purpose**: Display meal categories as tags

#### VoteUserComponent
- **Location**: `src/app/shared/components/vote-user/vote-user.component.ts`
- **Purpose**: Display list of users who voted for a dish

#### TooltipComponent
- **Location**: `src/app/shared/components/tooltip/tooltip.component.ts`
- **Purpose**: Show tooltip with voter names on hover

#### PopoverComponent
- **Location**: `src/app/shared/components/popover/popover.component.ts`
- **Purpose**: Popover to display voting results

### 3. Services

#### SocketService
- **Location**: `src/app/service/socket.service.ts`
- **Purpose**: Handle Socket.IO real-time communication
- **Methods**:
  - `connect()`: Connect to socket server
  - `disconnect()`: Disconnect from socket
  - `joinRoom(roomID)`: Join voting room
  - `emitDishVoteUpdate()`: Send vote update
  - `onDishVoteUpdate()`: Listen for vote updates

#### Extended DishVoteService
- **Location**: `src/app/service/dish-vote.service.ts`
- **Purpose**: API calls for dish vote data
- **Added**: `findById(id)` method

## Key Features Converted

### 1. Real-time Voting
- Socket.IO integration for live updates
- Room-based voting sessions
- Instant vote reflection across all clients

### 2. Interactive UI
- Hover effects and animations
- Card-based dish layout
- Visual feedback for voted items
- Responsive design with Tailwind CSS

### 3. Vote Results
- Real-time vote counting
- Winner determination
- Voter list display with tooltips
- Results popover

### 4. User Experience
- Name entry dialog on first visit
- Loading and error states
- Accessibility features

## Dependencies Added

```bash
npm install socket.io-client
```

## Environment Configuration

Updated environment files to include Socket.IO endpoint:

```typescript
// environment.ts / environment.development.ts
export const environment = {
  production: false, // or true
  API_URL: 'http://localhost:1323',
  SOCKET_ENDPOINT: 'http://localhost:1323',
};
```

## Usage

### 1. Navigation
Access the voting page via: `/game/voting/{dishVoteId}`

### 2. Voting Flow
1. User enters their name in the dialog
2. View available dishes with descriptions and images
3. Click "Vote" to vote for a dish (toggle on/off)
4. View results in the popover
5. Real-time updates when others vote

### 3. Integration Requirements

#### Backend Requirements
- Socket.IO server running on the configured endpoint
- Dish vote API endpoints:
  - `GET /dish-vote/{id}` - Get dish vote by ID
  - `GET /dish/slug/{slug}` - Get dish by slug
- Socket events:
  - `join-room` - Join voting room
  - `dish-vote-update` - Update vote
  - `dish-vote-update-client` - Receive vote updates

#### Frontend Setup
1. Ensure Angular Material is configured with animations
2. Socket.IO client is installed
3. Tailwind CSS is configured
4. FontAwesome icons are available

## Styling

The component uses:
- **Tailwind CSS**: For responsive layout and utilities
- **Angular Material**: For dialogs, tooltips, and form controls
- **Custom SCSS**: For gradients and animations
- **FontAwesome**: For icons

## Error Handling

- Loading states while fetching data
- Error messages for failed requests
- Graceful fallbacks for missing data
- Socket connection error handling

## Testing

To test the component:
1. Start your backend with Socket.IO server
2. Create a dish vote record in your database
3. Navigate to `/game/voting/{id}` with the vote ID
4. Enter your name and start voting

## Key Differences from Svelte Version

1. **State Management**: Uses Angular's reactive patterns instead of Svelte stores
2. **Component Structure**: Follows Angular's component architecture
3. **Templates**: Uses Angular template syntax instead of Svelte
4. **Styling**: Maintains Tailwind CSS but adapts to Angular's ViewEncapsulation
5. **Lifecycle**: Uses Angular lifecycle hooks (OnInit, OnDestroy)
6. **Dependencies**: Uses Angular Material for UI components
