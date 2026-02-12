problem 1:
when i click subscribe in /subscribe it says processing but doesnt go to sign in, if the user is already signed in and token is generated it should go to payment gateway of safepay and then subscribe to the retainer.
[Nest] 58485  - 02/12/2026, 5:09:00 PM   ERROR [SubscriptionsService] User 6da9c888-fd78-4e7e-910e-59b6640158c9 attempted to create subscription without CLIENT role
[Nest] 58485  - 02/12/2026, 5:09:14 PM   ERROR [SubscriptionsService] User 6da9c888-fd78-4e7e-910e-59b6640158c9 attempted to create subscription without CLIENT role

problem 2:
when in http://localhost:3000/client/dashboard
it gives: No active session. Please sign in again. instead of going back to the sign in page.

problem 3: Im unable to fetch complaints in admin and client and new complaints are not being registered. In both active and inactive cases with no proper error messages. 
http://localhost:3000/client/complaints
complaints.ts:131** ** **GET **http://localhost:3000/api/complaints?page=1&limit=20** 500 (Internal Server Error)**Failed to fetch complaints.
When i click new complaint it doesnt register a new complaint:

complaints.ts:82** ** **POST **http://localhost:3000/api/complaints** 403 (Forbidden)**

|   | submitComplaint          | @ | complaints.ts:82 |
| - | ------------------------ | - | ---------------- |
|   | await in submitComplaint |   |                  |
| - | -                        | - | -                |
|   | handleFormSubmit         | @ | page.tsx:100     |
|   |                          |   |                  |
| - | -                        |   |                  |

script.debug.js:1[Vercel Web Analytics] [pageview] http://localhost:3000/client/subscription** **1. **{**o**: **'http://localhost:3000/client/subscription'**, **sv**: **'0.1.3'**, **sdkn**: **'@vercel/analytics/next'**, **sdkv**: **'1.3.1'**, **ts**: **1770909169227, …**}**

script.debug.js:1[Vercel Web Analytics] [pageview] http://localhost:3000/client/complaints** **1. **{**o**: **'http://localhost:3000/client/complaints'**, **sv**: **'0.1.3'**, **sdkn**: **'@vercel/analytics/next'**, **sdkv**: **'1.3.1'**, **ts**: **1770909182547, …**}**

complaints.ts:131** ** **GET **http://localhost:3000/api/complaints?page=1&limit=20** 500 (Internal Server Error)**

complaints.ts:131** ** **GET **http://localhost:3000/api/complaints?page=1&limit=20** 500 (Internal Server Error)**

problem 3:
 no sign out button in sidebar of both client and admin

problem 4:
#: 4.4
  Test: Resubscribe CTA
  Page: After cancel, resubscribe button
  Expected: Should show "Subscribe" button / redirect to /subscribe
  5. CLIENT - COMPLAINTS (login as i222460@nu.edu.pk)
  #: 5.1
  Test: Complaints list
  Page: /client/complaints
  Expected: Shows table with CMP-2026-0005, status badges

when i click subscribe, it redirect to https://getsafepay.pk/

problem 5:
in admin/clients -> when i click view to view client details it redirects to http://localhost:3000/admin/clients/c1111111-1111-1111-1111-111111111111 ->

# 404

## This page could not be found. and when i click back button it redirect to auth/signin.

problem 6:
 no filtering options in /admin/users and /admin/clients

problem 7:


All Complaints

Showing 0 of 0 total complaints

Failed to fetch complaints

problem 8:
http://localhost:4000/api/service-registrations/status?referenceNumber=SRV-2026-0001&emai l=usman.ali@test.com
{
  "statusCode": 400,
  "timestamp": "2026-02-12T15:19:08.201Z",
  "path": "/api/service-registrations/status?referenceNumber=SRV-2026-0001&emai%20l=usman.ali@test.com",
  "message": [
    "ref: Required",
    "email: Required"
  ]
}

problem 9:
http://localhost:4000/api/complaints (with bearer token)
{
  "statusCode": 500,
  "timestamp": "2026-02-12T15:26:17.661Z",
  "path": "/api/complaints",
  "message": "Failed to fetch complaints"
}
