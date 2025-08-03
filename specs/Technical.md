# Technical Specification

**App Name:** RecordVault
**Version:** 1.0

## 1.0 Introduction
This document outlines the technical requirements for this single-page web application.

### 1.1 Technology Stack
- **Frontend Framework:** React with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Data Storage:** Browser Local Storage

### 1.2 Development Environment
- The project must be configured to use Vite for development and builds.
- The primary HTML file (`index.html`) shall utilize an import map for loading external dependencies (`react`, `react-dom`).
- TypeScript configuration (`tsconfig.json`) must be set to `strict`.

### 1.3 Code Quality & Standards
- All code must be clean, readable, and well-documented.
- The application must be performant, responsive across devices, and adhere to modern accessibility standards (WCAG 2.1), including the use of ARIA attributes where appropriate.
- Custom styles, such as for scrollbars, should be implemented for a consistent look and feel.

## 2.0 Data Management (Local Storage)

### 2.1 User Identification
- The app stores active username and password in memory.

### 2.2 Data Structure
- All data for a given user (categories, records) is stored as a single JSON object in Local Storage.
- The key for this object is dynamically generated based on the username, e.g., `records-johndoe`.
- The object is encrypted using the password.
- The root object adheres to the `AppData` interface.

```typescript
// Defined in src/types.ts
export interface AppData {
    categories: Category[];
    records: RecordItem[];
}
```

#### 2.2.1 `Category` Interface
| Property      | Type      | Description                                                              |
|---------------|-----------|--------------------------------------------------------------------------|
| `category_id` | `number`  | Unique identifier (timestamp-based).                                     |
| `created_at`  | `string`  | ISO 8601 timestamp of creation.                                          |
| `name`        | `string`  | The name of the category.                                                |
| `is_enabled`  | `boolean` | If true, category is active. Disabled categories are grayed out and excluded from reports. |

#### 2.2.3 `RecordItem` Interface
| Property              | Type            | Description                                |
|-----------------------|-----------------|--------------------------------------------|
| `record_id`           | `number`        | Unique identifier (timestamp-based).       |
| `created_at`          | `string`        | ISO 8601 timestamp of creation.            |
| `name`                | `string`        | Auto-generated key, required.              |
| `contact_information` | `string | null` | Contact details (e.g., phone, email, contact person). |
| `category_id`         | `number`        | The ID of the parent category.             |
| `institute_name`      | `string | null` | Issuing institution (e.g., "UIDAI").       |
| `account_name`        | `string | null` | Name on the account or document.           |
| `account_owner`       | `string | null` | Owner (e.g., "Self", "Joint").             |
| `id_number`           | `string | null` | Relevant ID number (Account No, PAN, etc.).|
| `credentials`         | `string | null` | Hints for credentials (not passwords).     |
| `location`            | `string | null` | Location of physical documents.            |
| `nominee`             | `string | null` | Nominee listed on the record.              |
| `notes`               | `string | null` | Additional relevant information.           |

### 2.3 New User Onboarding
- When a user enters their name for the first time, the application checks if a key eists for the user
- If a key doesn't exist, user must register.
- On registration, user must provide username and password, a default object with default categories must be created, encrypted using the password.
  - Default Categories: `Personal IDs`, `Bank Accounts`, `Brokerage Accounts`, `Retirement/Pension Accounts`, `Loans`, `Insurance Policies`, `Properties`, `Valuables`.
- If the key eists, but the object can't be decrypted using the password, the password must be invalid.
- If the object was decrypted, render the dashboard

### 2.4 Data Helper Module (`src/lib/storage.ts`)
A dedicated module abstracts all Local Storage interactions.
- `getOrCreateUserData(username, password, initialCategories)`: Retrieves the user's `AppData` object, or creates it if it doesn't exist.
- `updateUserData(username, password, data)`: Serializes and saves the user's `AppData` object.

## 3.0 Frontend Specification

### 3.1 Core Architecture (`App.tsx`)
The `App.tsx` component serves as the application's root controller.
- **State Management:** It must manage the global application state, including:
  - `username`: The current user's name, or `null`.
  - `password`: The current user's password, or `null`.
  - `data`: An `AppData` object containing all categories and records for the current user.
  - `loading`: A boolean indicating initial auth check state.
  - `selectedCategoryId`: The `id` of the currently active category, or `null`.
  - `modalState`: A discriminated union to represent the currently open modal, or `null`.
- **Authentication Flow:** On mount, it checks for a user in local storage. If none, it displays the `Auth` component.
- **Data Flow:**
  - All data modifications (add, edit, delete) are performed by updating the `data` state object.
  - A `useEffect` hook listens for changes to the `data` state and calls `saveUserData` to persist them to Local Storage.
  - A `useMemo` hook computes the nested `categories` structure for the sidebar, including sorting by `is_enabled` status and then alphabetically.
- **Feature Handlers:** It must define handlers for all user actions, including:
  - CRUD operations on all data types.
  - Toggling a category's `is_enabled` status.
  - Generating and downloading the markdown report. When generating the report, skip categories that have no records; do not include them in the report at all.

### 3.2 Component Specifications
- **`Auth.tsx`:** Displays a single input field for the user's name to "log in".
- **`Sidebar.tsx`:** Renders the `categories` data structure.
  - Provides UI to select a category.
  - Provides controls for adding categories.
  - Provides controls for renaming categories. Renaming a category updates its name everywhere in the app.
  - Provides controls for deleting categories.
  - Includes a toggle button (eye/eye-slash icon) on each category to modify its `is_enabled` state.
  - Visually distinguishes disabled categories (e.g., grayed-out text).
  - Includes a button to trigger the markdown report generation.
  - Includes a "Sign Out" button.
- **`RecordList.tsx`:** Receives the selected category and its filtered records. Manages the `viewMode` state (`list`, `card`, `detail`).
- **`RecordItem.tsx`:** A dispatcher component that renders a record based on the current `viewMode`.
- **Modals (`RecordModal`, `CategoryModal`):** Forms for creating, editing, and renaming data. They receive data and callbacks from `App.tsx`.
- **`DeleteConfirmModal.tsx`:** A generic confirmation dialog.
- **`Icons.tsx`:** A utility component to provide SVG icons, including new icons for `eye`, `eyeSlash`, and `download`.

### 3.3 Type System
- All data structures are manually defined in `src/types.ts`.

## 4.0 UI/UX Implementation Details

### 4.1 Visual Design
- **Color Palette:** The design shall primarily use the `slate` and `blue` color families from Tailwind CSS for a professional and clean aesthetic.
- **Typography:** Use sans-serif fonts provided by the default Tailwind configuration (`font-sans`).
- **Layout:** The application must be fully responsive using Tailwind's breakpoint utilities (e.g., `md:`, `lg:`).

### 4.2 User Interaction
- All interactive elements must have distinct `hover:`, `focus:`, and `disabled:` states.
- Modal dialogs should appear with a smooth transition.
- Deletion actions require confirmation.
- Disabled categories in the sidebar are visually distinct and their records are not displayed.