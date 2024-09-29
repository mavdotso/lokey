### Bugs

-   [ ] User is not authenticated after avatar upload?
-   [ ] Can't click anything after editing credentials in popup, maybe something with the clickOutside
-   [ ] BUG: When I input the login link from another email, I get into the workplace I'm not supposed to be in
-   [ ] TODO: Test everything after the refactoring
-   [ ] Kicking user doesn't update the state
- [ ] Refactor ConvexErrors to status returns

### What's needed for launch:

-   [ ] Change workspace owner
-   [ ] Change credentials owner
-   [ ] User roles
    -   [ ] Admin — access to everything
    -   [ ] Manager — access to everything (CRUD all credentials) except workspace settings
    -   [ ] Member — access ONLY to CRUD personal credentials

    -   [ ] Share credentials via link / email

-   [ ] Share link via email / text

-   [ ] Sidebar
    -   [ ] Billing settings
    -   [ ] People / team
        -   [ ] Promote / demote

- [ ] Subscription popup

-   [ ] User settings
    -   General:
    -   [ ] email
        -   [ ] Send an email change request
    -   Security:
    -   [ ] Create password
    -   [ ] 2FA

-   [ ] Stripe
-   [ ] User / workspace limits
-   [ ] Error pages
-   [ ] Support (email)
-   [ ] Request feature

### AFTER THE FIRST 5 CUSTOMERS:

-   [ ] API
-   [ ] Secure file sharing — [Danger!](https://x.com/mfts0/status/1837871900149555606)
-   [ ] Secure chats (p2p)
-   [ ] Valut — Store passwords inside the app, encrypted with your passphrase and share them from there
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

### Nice to have

-   [ ] [optimizePachageImports](https://nextjs.org/docs/app/api-reference/next-config-js/optimizePackageImports)
-   [ ] ["server-only"](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment)

### UI

