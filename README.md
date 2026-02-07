

# Toasties Sunday

Modern web application for managing user accounts, browsing a dynamic menu, placing orders, and handling payments. Built with Vite, React, and TypeScript.

## Features

- **User Account Management**
	- User registration and login with authentication context
	- Account management page for profile updates
	- Login popup for seamless authentication

- **Menu & Ordering**
	- Dynamic menu with courses and categories
	- Single course menu view for detailed item info
	- Add items to order and customize selections
	- Order popup with checkboxes for item customization

- **Orders & Checkout**
	- View and manage current and past orders
	- Integrated checkout process with payment API
	- Payment completion and confirmation screens
	- Payment request button for fast transactions

- **Admin Panel**
	- Admin dashboard for managing site content and orders

- **UI Components**
	- Reusable multi-page components: header, footer, fancy buttons, page headers, scroll-to-top, and generic text sections
	- Responsive design with SCSS modules for cards, forms, lists, and more

- **Theming & Assets**
	- Themed SCSS variables for easy customization
	- Organized assets and images for branding

- **Routing & Structure**
	- Centralized routing for all pages
	- Modular folder structure for scalability

## Getting Started

### Prerequisites

- Node.js (v20 or newer recommended)
- npm or yarn

### Installation

1. Clone the repository:
	 ```sh
	 git clone <repo-url>
	 cd toasties-sunday
	 ```
2. Install dependencies for both client and server:
	 ```sh
	 cd client
	 npm install
	 # In another terminal:
	 cd ../server
	 npm install
	 ```

### Running the App

#### Client (Frontend)
```sh
cd client
npm run dev
```

#### Server (Backend)
```sh
cd server
npm start
```
The app will run on [http://localhost:3000](http://localhost:3000) by default.

## Project Structure

```
toasties-sunday/
	client/         # Frontend (Vite + React)
		src/
			components/ # UI components
			pages/      # Page components
			context/    # React context (auth, etc.)
			scss/       # SCSS styles
			assets/     # Images and static assets
		...           # Config and entry files
	server/         # Backend (Node.js/Express)
		db/           # Database models/config
		routes/       # API routes
		...           # Server entry and config
```

## License
MIT (probably)