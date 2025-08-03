# Functional Specification: 

**App Name:** RecordVault
**Version:** 1.0

## 1.0 Overview

### 1.1 Product Vision
Heirloom Records is a secure and organized digital vault designed for individuals to consolidate their essential personal, financial, and legal records.

### 1.2 Core Objective
The application provides an intuitive and reliable platform to manage sensitive information, ensuring that a user's designated heirs can have easy and complete access when needed. The organizational structure is based on a clear hierarchy: **Categories → Accounts → Records**.

### 1.3 Core Domain
The application uses the following domain language:
1. Users
   - User using the app, doesn't require authentication
2. Categories
   - Categories are the highest level of organization
   - Account types or categories to group similar accounts together
   - Example: Financial, Insurance
3. Records
   - Records are the individual data entries within a Category. Each record holds user specific information.
   - A category can have multiple records. 
   - Example: SBI Savings 

## 2.0 Key Features & Functionality

### 2.1 User Accounts & Security
- **Registration:** Users can create a new account stored client-side only using their display-name.
- **Data Privacy:** Each user's data is completely private, isolated and stored client-side only. No user can see another user's information.

### 2.2 The Vault Dashboard
- If a user is not recognized, they should be prompoted to register
- Dashboard is divided into a navigation sidebar and a content area and requires user to be registered.

### 2.3 Navigation Sidebar
- Displays all available Categories.
- Allows users to select a Category to view its associated records.
- The currently selected Category is always highlighted.
- Users can create new Categories.
- Users can rename Categories. Renaming a Category updates its name everywhere in the app, including the sidebar and record lists.
- Categories can be disabled. Disabling a Category will gray it out and hide its records from any reports.  
- Users can delete Categories. Deleting a Category will also delete all Records within it.
- Categories are sorted by their enabled status, then alphabetically
- If this is the first time user is using the app, create the following default categories: Personal Ids, Bank Accounts, Brokerage Accounts, Retirement/Pension Accounts, Loans, Insurance Policies, Properties, Valuables 
- A link to generate Export Report 

### 2.4 Content Area
- If no Category is selected, a welcome message is displayed.
- Displays a list of all records for the currently selected Category.
- The name of the selected Category is shown as the page title.
- Records are sorted alphabetically
- The list of records can be viewed in three different formats for user convenience:
  - **Detail View:** A comprehensive view showing all fields for each record.
  - **Card View:** A compact card format showing key information.
  - **List View:** A dense, single-line view for quick scanning.
- Users can add new records to any of the Category.
- Users can edit the details of any existing record.
- Users can delete individual records.
- Each record can store details such as:
  - Record Name (auto-generated, required, grayed out, always updated as user types Institute Name, Account Name, Account Owner; e.g., "SBI - Savings - Jon Doe")
  - Contact Information (e.g., phone, email, contact person)
  - Account Owner (Self/Spouse/Joint)
  - ID Number (e.g., Account Number, Policy Number)
  - Credential Information (hints, not passwords)
  - Location of Physical Item/Originals
  - Nominee Information
  - Notes

### 2.5 Export Report
- Exclude records of disabled Categories
- Skip categories that have no records; do not include them in the report at all.
- When generated, user is prompted to download a markdown file with the following format:
  ```
  # <Category_Name>
  ## <Record_Name>
  - <Field_Name>: <Value>
  ```

### 2.6 General User Experience
- The application is fully responsive and works well on desktops, tablets, and mobile devices.
- All interactive elements (buttons, links) provide clear visual feedback when hovered over or clicked.
- Any action that results in data deletion (deleting a record, account, or category) requires user confirmation through a pop-up dialog to prevent accidental loss of data.