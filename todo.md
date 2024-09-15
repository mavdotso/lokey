### Bugs

-   [ ] Fix the DialogContent / CardContent on create-workspace-header.tsx
-   [ ] Faster redirect after creating the first workspace
-   [ ] Remove workspace settings if 'member'

### What's needed for launch:

-   [x] Add a "free" plan limit of 2
    -   [ ] Change to "is a member of 2 free ones" instead of has created
-   [x] Invite links:

    -   [x] Change getIdentity functions in schema
    -   [x] Change to a permanent invite link (via link)

-   [ ] Workspace settings

    -   [ ] Invite users
        -   [x] Invite links
        -   [x] Via email
            -   [ ] New user
            -   [ ] Refistered user
        -   [ ] Via userId
    -   [ ] Accept invitations

        -   [ ] Sign in

    -   [ ] Remove users
    -   [ ] Change workspace owner
    -   [ ] Change credentials owner
    -   [ ] User roles
        -   [ ] Admin — access to everything
        -   [ ] Manager — access to everything (CRUD all credentials) except workspace settings
        -   [ ] Member — access ONLY to CRUD personal credentials

-   [ ] Request credentials from clients

-   [ ] Share link via email / text

-   [x] Sidebar menu

    -   [x] Credentials
        -   [x] Shared
        -   [x] Requested
    -   [x] Workspace settings
        -   General:
            -   [x] ws name
            -   [x] ws slug
            -   [x] ws logo
            -   [x] delete
        -   [ ] Billing
        -   [ ] People / team

-   [ ] User settings

    -   General:
    -   [x] name
    -   [ ] picture
    -   [ ] email
        - [ ] Send an email change request
    -   [ ] Default workspace
    -   [ ] Delete account
    -   Security:
    -   [ ] Create password
    -   [ ] 2FA

-   [ ] Stripe
-   [ ] User / workspace limits
-   [ ] Error pages
-   [ ] Support (email)

### AFTER THE FIRST 5 CUSTOMERS:

-   [ ] API
-   [ ] Secure file sharing
-   [ ] Secure chats (p2p)
-   [ ] Custom SMTP
-   [ ] Custom URL
-   [ ] IP tracking
-   [ ] Geoblocking
-   [ ] Whitelisting
-   [ ] Generate a QR code
-   [ ] Notifications
-   [ ] Webhooks
-   [ ] Import from CSV
-   [ ] Insert the website you're providing the password for and fetch the website icon
-   [ ] Credentials tags (+ apply tag instead of label)
-   [ ] Add instructions on where to get the passwords from to credentials requests
-   [ ] Master password encryption for the account to decrypt passwords inside
-   [ ] Team sharing credentials

### UI

-   [ ] Fix the Separator alignment with the content on the Sidebar
