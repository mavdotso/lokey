### Bugs

-   [ ] Fix the DialogContent / CardContent on create-workspace-header.tsx
-   [x] Re-think the schema for workspaces / users and who does what — e.g. payments, access to features etc.

### What's needed for launch:

-   [x] Add a "free" plan limit of 2
-   [ ] Invite links:

    -   [ ] Change getIdentity functions in schema
    -   [x] Change to a permanent invite link (via link)

-   [ ] Workspace settings

    -   [ ] Invite users
        -   [ ] Via email
            -   [ ] New user
            -   [ ] Refistered user
        -   [ ] Via userId
    -   [ ] Remove users
    -   [ ] Change workspace owner
    -   [ ] Change credentials owner
    -   [ ] User roles (access?)
        -   [ ] CRUD
            -   [ ] only what they own
            -   [ ] all
            -   [ ] nothing (read only)

-   [ ] Request passwords from clients

    -   [ ] Add instructions on where to get the passwords from

-   [ ] Share link via email / text

-   [ ] Insert the website you're providing the password for

    -   [ ] Fetch the website icon

-   [ ] Sidebar menu

    -   [ ] Search
    -   [ ] Credentials
        -   [ ] Shared
        -   [ ] Requested
    -   [ ] Workspace settings
        -   General:
            -   [x] ws name
            -   [x] ws slug
            -   [x] ws logo
            -   [x] delete
        -   Tags (+ apply tag instead of label)
        -   Billing
        -   People / team
    -   [ ] Upgrade

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
-   [ ] Support

### Potentially:

-   [ ] Secure chats (p2p)
-   [ ] Secure file sharing
-   [ ] Custom SMTP
-   [ ] Custom URL
-   [ ] IP tracking
-   [ ] Geoblocking
-   [ ] Whitelisting
-   [ ] Generate a QR code
-   [ ] Notifications / webhooks
-   [ ] Add to password manager button
-   [ ] Import from CSV

###

### UI

-   [ ] Fix the Separator alignment with the content on the Sidebar
