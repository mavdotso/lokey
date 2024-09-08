### Bugs

-   [ ] Fix the DialogContent / CardContent on create-workspace-header.tsx
-   [ ] User credentials -> Workspace credentials
-   [x] spaces-dropdown.tsx fix the dialog / space creation
-   [x] Fix the redirect on space creation
-   [x] On shared/id page make sure to display the right amount of Inputs based on the credentials type

### ToDo

-   [ ] Request passwords
    -   [ ] Add instructions on where to get the passwords from
-   [ ] Onboarding flow

    -   [x] Create a workspace
    -   [ ] Share first creadentials form (?)
            — might not need this as for the agencies, they will likely 'request' rather than 'share'

-   [x] Unify the credential types from one place
-   [ ] Share link via email / text
-   [ ] Send the link to a client to share the password with you (vice-versa process)
-   [ ] Insert the website you're providing the password for
    -   [ ] Fetch the website icon
-   [ ] Email templates

-   [ ] Sidebar menu

    -   [ ] Search
    -   [ ] Shared credentials
    -   [ ] Requested credentials
    -   [ ] Users
    -   [ ] Workspace settings
        -   General:
        -   [ ] ws name
        -   [ ] ws slug
        -   [ ] ws logo
        -   [ ] delete
        -   Tags
        -   Billing
        -   People / team
    -   [ ] Upgrade

-   [ ] User settings
    -   General:
    -   [ ] Change name
    -   [ ] Change email
    -   [ ] Default workspace
    -   [ ] Delete account
    -   Security:
    -   [ ] Create password
    -   [ ] 2FA

### Potentially:

-   [ ] Secure chats (p-2-p)
-   [ ] Access management
-   [ ] Custom SMTP
-   [ ] Custom URL
-   [ ] Secure file sharing
-   [ ] IP tracking
-   [ ] Geoblocking
-   [ ] Whitelisting
-   [ ] Reveal with a private key
-   [ ] Generate a QR code
-   [ ] Notifications / webhooks
-   [ ] Add to password manager button

###

**Unique one-time link generation process**
When creating a new one-time link for a secret, two 18-character long random strings are generated in the browser as public and private encryption key parts. The secret is encrypted using these key parts, with the encrypted secret and the private part sent to our backend. This process ensures that full encryption data is never fully accessible, requiring both the link and database information to decrypt the secret.

We perform all encryption and decryption processes in the browser and store half of the encryption key within the link itself. This ensures that the data is fully encrypted before our service sees it, rendering anyone incapable of decrypting it without the original link. Even in the unlikely event of a breach, your information remains unreadable to us and potential attackers.

Once you access the information, the link deactivates, ensuring that the data cannot be retrieved again.
