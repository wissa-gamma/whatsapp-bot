# WhatsApp Bot Service

A scalable and modular WhatsApp bot application built with NestJS and Baileys. This service is designed to efficiently route and process incoming messages across private chats and groups, utilizing a dynamic command registry and streamlined session management.

## Key Features

- **Modular Architecture:** Built on the NestJS framework, ensuring clear separation of concerns through dedicated handlers for distinct message sources (Groups vs. Private).
- **Dynamic Command Registry:** Extendable command execution system that parses prefixes, arguments, and handles environment-specific restrictions (e.g., group-only commands).
- **Automated Session Management:** Utilizes multi-file authentication state to manage credentials, generating terminal-based QR codes for seamless device linking.
- **Environment-Driven Access Control:** Configurable group permissions to restrict or allow specific bot interactions based on predefined JIDs.

## Prerequisites

Ensure you have the following installed on your system before proceeding:

- Node.js (v18.x or higher recommended)
- npm (v9.x or higher)

## Installation

1. Clone the repository to your local machine:

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install the required project dependencies:
   ```bash

   ```

npm install

````

Configuration
The application requires specific environment variables to function correctly. Create a .env file in the root directory and define the necessary configurations.

   ```bash
# Define WhatsApp Group JIDs that have specific permissions
# Must be a valid stringified JSON array
ALLOWED_GROUPS=["1234567890-123456@g.us", "0987654321-654321@g.us"]
````

Running the Application
Use the following npm scripts to run the application based on your current environment:

```bash
# Standard development mode
npm run start

# Watch mode (Recommended for active development)
npm run start:dev

# Production mode
npm run start:prod
```

Authentication Process
Upon starting the application for the first time without an existing session, a QR code will be generated and printed directly in the terminal. Open the WhatsApp mobile application, navigate to Linked Devices, and scan the QR code to authenticate.

Authentication data will be securely stored in the local session/ directory for subsequent logins.

Directory Structure
src/handlers/ - Contains the routing logic for specific scopes (group.handler.ts, private.handler.ts).

src/commands/ - Houses the command registry (command.registry.ts) and individual command implementations.

src/bot.service.ts - The core NestJS provider managing the Baileys socket initialization, connection state, and global event listeners.
