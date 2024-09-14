### Bugs

-   [ ] Fix the DialogContent / CardContent on create-workspace-header.tsx
-   [x] Re-think the schema for workspaces / users and who does what — e.g. payments, access to features etc.
-   [ ] Faster redirect after creating the first workspace
-   [ ] On regenerate invite link, make the previous one expired

-   [ ] When redirected to sign-in with /invite, pass it through the entire onboarding and open a popup with the 'Join workspace' instead of creating a new one
    -   Perhaps add a flag during user registration?
    -   Or simply add to a workspace as a 'role' on registration

### What's needed for launch:

-   [x] Add a "free" plan limit of 2
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
    -   [ ] User roles (access?)
        -   [ ] CRUD
            -   [ ] only what they own
            -   [ ] all
            -   [ ] nothing (read only)

-   [ ] Request credentials from clients

-   [ ] Share link via email / text

-   [ ] Sidebar menu

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
    -   [ ] name
    -   [ ] picture
    -   [ ] email
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
-   [ ] Secure chats (p2p)
-   [ ] Secure file sharing
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

### UI

-   [ ] Fix the Separator alignment with the content on the Sidebar
