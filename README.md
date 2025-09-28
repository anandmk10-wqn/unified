# A Place of Hope - Website & CMS

This project is a website for "A Place of Hope," a community-focused organization providing support and resources for parents of children with special needs. The site is designed to be calming, appealing, and highly accessible.

It includes a simple but powerful Content Management System (CMS) built with Firebase, allowing administrators to update site content and view contact form inquiries without needing to touch the code.

## Features

- **Soothing & Accessible Design:** The user interface is designed to be calming and meets WCAG accessibility standards for color contrast and keyboard navigation.
- **Dynamic Home Page:** The main text content on the home page is loaded dynamically from the Firestore database.
- **Contact Form:** A fully functional contact form that saves user inquiries directly to Firestore.
- **Admin Panel:** A secure, password-protected admin dashboard where an administrator can:
  - View all contact form submissions in a clean, organized table.
  - Edit the content of the home page.

## Tech Stack

- **Frontend:** HTML5, Tailwind CSS, vanilla JavaScript (ESM)
- **Backend & Database:** Google Firebase
  - **Firebase Authentication:** For securing the admin panel.
  - **Firestore:** As the database for both site content and user inquiries.

## Setup and Configuration

To get this website up and running, you will need to create and configure a new Firebase project.

### Step 1: Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and follow the on-screen instructions to create a new project. You can disable Google Analytics if you wish.

### Step 2: Add a Web App to Your Project

1.  In your new project's dashboard, click the Web icon (`</>`) to add a new web app.
2.  Give your app a nickname (e.g., "A Place of Hope Website") and click **"Register app"**.

### Step 3: Get Your Firebase Configuration

1.  After registering the app, Firebase will display a `firebaseConfig` object. This object contains your project's unique keys and identifiers.
2.  **Copy this entire object.** It will look something like this:
    ```javascript
    const firebaseConfig = {
      apiKey: "AIzaSy...",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:abcdef123456"
    };
    ```

### Step 4: Update the `firebase.js` File

1.  Open the `firebase.js` file in this project.
2.  You will see a placeholder `firebaseConfig` object. **Replace the entire placeholder object with the one you copied from your Firebase project.**

### Step 5: Set Up Firebase Services

1.  **Enable Authentication:**
    - In the Firebase Console, go to the **"Authentication"** section (under the "Build" menu).
    - Click **"Get started"**.
    - On the "Sign-in method" tab, select **"Email/Password"** from the list of providers.
    - **Enable** it and click **"Save"**.
2.  **Create an Admin User:**
    - While still in the Authentication section, go to the **"Users"** tab.
    - Click **"Add user"**.
    - Enter the email and a secure password for your administrator account. This is the email and password you will use to log in to the admin panel.
3.  **Set Up Firestore Database:**
    - In the Firebase Console, go to the **"Firestore Database"** section (under the "Build" menu).
    - Click **"Create database"**.
    - Start in **production mode**. This is important for security. Click **"Next"**.
    - Choose a Firestore location and click **"Enable"**.

### Step 6: Create Initial Database Content

1.  **Create the `content` collection:**
    - In the Firestore Database section, click **"+ Start collection"**.
    - Enter `content` as the Collection ID.
2.  **Create the `home_page` document:**
    - Click **"Next"**. For the Document ID, enter `home_page`.
    - Now, add the following fields to the document. Click **"+ Add field"** for each one.
      - Field: `hero_title_part1`, Type: `string`, Value: `You Are Not Alone.`
      - Field: `hero_title_part2`, Type: `string`, Value: `Find Strength and Support Here.`
      - Field: `hero_subtitle`, Type: `string`, Value: `A community dedicated to helping parents of children with special needs navigate their journey with hope and resources.`
      - Field: `our_mission_text`, Type: `string`, Value: `Our mission is to provide a supportive and uplifting space for parents and caregivers of children with special needs. We aim to connect you with valuable resources, foster a strong community, and offer a place of understanding and shared experience. We believe that together, we can face any challenge with strength and hope.`
    - Click **"Save"**.

3.  **Create the `navigation` collection (Optional but Recommended):**
    - The main navigation menu is now managed through the CMS. To get started, you should create the initial menu items.
    - In Firestore, start a new collection named `navigation`.
    - Create a new document for each menu item you want. For example, to create an "About Us" link:
        - Click **"+ Add document"**.
        - For the Document ID, click **"Auto-ID"**.
        - Add three fields:
          - Field: `text`, Type: `string`, Value: `About Us`
          - Field: `url`, Type: `string`, Value: `index.html#about`
          - Field: `order`, Type: `number`, Value: `1`
    - Repeat this process for other links like "Resources" (order: 2) and "Contact" (order: 3). You can add, edit, or delete these at any time from the "Navigation" tab in the admin panel.

Your project is now fully configured!

## Running the Site

Because the site uses JavaScript modules, you cannot simply open the `index.html` file in your browser from the local file system (i.e., using a `file://` URL). You need to serve the files from a local web server.

A very simple way to do this is with Python:

1.  Open your terminal or command prompt.
2.  Navigate to the root directory of this project.
3.  Run the following command:
    ```bash
    python -m http.server
    ```
4.  Open your web browser and go to `http://localhost:8000`.

## Using the Admin Panel

-   To log in, navigate to `http://localhost:8000/login.html`.
-   Use the email and password you created in Step 5.2 to sign in.
-   From the dashboard, you can view all messages sent through the contact form and edit the text content of the home page.
