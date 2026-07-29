# UX Process for the WoodVerse Website

The UX process should be completed for four main roles:

- **Customer / User**

- **Vendor**

- **Supplier or Support Staff**

- **System Admin**

The complete UX process can be organized as:

```
`Research`

`   ↓`

`Define Requirements`

`   ↓`

`Create Personas`

`   ↓`

`Create User Flows`

`   ↓`

`Create Sitemap`

`   ↓`

`Low-Fidelity Wireframes`

`   ↓`

`Usability Testing`

`   ↓`

`Design System`

`   ↓`

`High-Fidelity UI`

`   ↓`

`Interactive Prototype`

`   ↓`

`Developer Handoff`

`   ↓`

`Testing and Improvement`
```


## 1. Understand the Project Goals

First, the purpose of WoodVerse should be clearly identified.

### Customer goals

Customers should be able to:

- Register and log in

- Browse furniture and wooden products

- View product details

- Customize products

- Request quotations

- Add products to cart

- Make payments

- Track orders

- View production progress

- Use the AI chatbot

- Communicate with vendors

### Vendor goals

Vendors should be able to:

- Manage products

- Update stock

- Receive customer orders

- Review quotations

- Manage production work

- Update completion percentages

- Contact suppliers

- Create purchase orders

- Manage inventory and warehouses

- Track shipments

- Chat with customers

### Supplier or Support goals

Suppliers should be able to:

- View purchase orders

- Accept or reject orders

- Manage timber and materials

- Update prices and availability

- Prepare shipments

- Update delivery status

- Communicate with vendors

If “Support” means customer support staff, they should be able to:

- View customer complaints

- Respond to support requests

- Monitor orders

- Escalate problems

- Close resolved tickets

### Admin goals

Admins should be able to:

- Manage customers

- Verify vendors

- Approve suppliers

- Manage products and categories

- Monitor orders

- Monitor payments

- Review complaints

- View audit logs

- Manage system settings


# 2. Conduct User Research

Information should be collected from real or sample users.

Possible research methods:

- Customer interviews

- Vendor interviews

- Supplier interviews

- Online surveys

- Competitor analysis

- Observation of current furniture-ordering methods

### Questions for customers

- How are furniture products currently ordered?

- What problems are experienced when requesting quotations?

- How are vendors contacted?

- How are order updates currently received?

- What information is needed before making a purchase?

### Questions for vendors

- How are products and customer orders managed?

- How are production stages tracked?

- How is stock checked?

- How are suppliers contacted?

- How are quotations prepared?

### Questions for suppliers

- How are purchase orders received?

- How is timber availability updated?

- How are shipments tracked?

- What information is needed from vendors?

### Research output

The following should be identified:

- User needs

- Pain points

- Current workflows

- Common tasks

- Technology skills

- Device usage

- Expected system features


# 3. Create User Personas

A persona represents a typical user.

## Customer Persona

**Name:** Nimal Perera  
**Role:** Homeowner  
**Goal:** Order a customized wardrobe  
**Pain points:**

- Prices are not clear

- Vendors take a long time to reply

- Production progress cannot be seen

- Order updates are difficult to receive

## Vendor Persona

**Name:** Lakshan Furniture  
**Role:** Furniture vendor  
**Goal:** Manage orders and production work  
**Pain points:**

- Orders are managed through notebooks or WhatsApp

- Stock is difficult to monitor

- Production work is not properly tracked

- Supplier orders are handled manually

## Supplier Persona

**Name:** ABC Timber Suppliers  
**Role:** Timber supplier  
**Goal:** Receive and complete vendor purchase orders  
**Pain points:**

- Purchase-order details are incomplete

- Material availability is updated manually

- Delivery progress is difficult to track

## Admin Persona

**Name:** System Administrator  
**Role:** Platform controller  
**Goal:** Keep the system secure and properly managed  
**Pain points:**

- Vendor verification requires manual checking

- User activities are difficult to monitor

- Complaints and platform activities need centralized control


# 4. Define Main User Journeys

## Customer Journey

```
`Register / Login`

`      ↓`

`Browse Products`

`      ↓`

`View Product Details`

`      ↓`

`Customize Product`

`      ↓`

`Request Quotation`

`      ↓`

`Accept Quotation`

`      ↓`

`Add to Cart`

`      ↓`

`Checkout and Payment`

`      ↓`

`Order Confirmation`

`      ↓`

`View Production Progress`

`      ↓`

`Track Shipment`

`      ↓`

`Receive Product`

`      ↓`

`Review Product`
```

## Vendor Journey

```
`Vendor Login`

`      ↓`

`View Dashboard`

`      ↓`

`Receive Customer Order`

`      ↓`

`Review Customization`

`      ↓`

`Confirm Quotation`

`      ↓`

`Check Material Inventory`

`      ↓`

`Order Missing Materials`

`      ↓`

`Start Production Work`

`      ↓`

`Update Kanban Progress`

`      ↓`

`Complete Quality Check`

`      ↓`

`Prepare Shipment`

`      ↓`

`Update Delivery Status`
```

## Supplier Journey

```
`Supplier Login`

`      ↓`

`View Purchase Orders`

`      ↓`

`Review Material Request`

`      ↓`

`Accept or Reject Order`

`      ↓`

`Prepare Materials`

`      ↓`

`Create Shipment`

`      ↓`

`Update Shipment Status`

`      ↓`

`Vendor Receives Materials`

`      ↓`

`Purchase Order Completed`
```

## Admin Journey

```
`Admin Login`

`      ↓`

`View Dashboard`

`      ↓`

`Review New Registrations`

`      ↓`

`Approve Vendors and Suppliers`

`      ↓`

`Manage Customers`

`      ↓`

`Monitor Products and Orders`

`      ↓`

`Monitor Payments`

`      ↓`

`Review Complaints`

`      ↓`

`Check Audit Logs`
```

## Support Staff Journey

```
`Support Login`

`      ↓`

`View Open Support Tickets`

`      ↓`

`Read Customer Problem`

`      ↓`

`Check Customer Order`

`      ↓`

`Contact Vendor or Supplier`

`      ↓`

`Update Ticket`

`      ↓`

`Resolve Problem`

`      ↓`

`Close Ticket`
```


# 5. Create the Information Architecture

The website content should be organized based on user roles.

## Public Pages

- Home

- Product Listing

- Product Details

- Indoor Plant Showroom

- About

- Contact

- Login

- Registration

## Customer Pages

- Customer Dashboard

- Product Listing

- Product Details

- Cart

- Checkout

- My Orders

- Order Details

- Production Tracking

- Shipment Tracking

- Quotations

- AI Chatbot

- Vendor Chat

- Wishlist

- Reviews

- Profile

- Notifications

## Vendor Pages

- Vendor Dashboard

- Product Management

- Add/Edit Product

- Customer Orders

- Order Details

- Quotations

- Production Work Tracking

- Work Order Details

- Supplier Directory

- Purchase Orders

- Inventory

- Warehouse Management

- Shipment Management

- Customer Chat

- Notifications

- Reports

- Profile and Settings

## Supplier Pages

- Supplier Dashboard

- Purchase Orders

- Purchase Order Details

- Timber and Material Management

- Shipment Management

- Vendor Directory

- Notifications

- Profile and Settings

## Admin Pages

- Admin Dashboard

- Customer Management

- Vendor Management

- Supplier Management

- Product Management

- Order Management

- Payment Management

- Category Management

- Complaint Management

- Audit Logs

- System Settings

- Notifications


# 6. Create Low-Fidelity Wireframes

Simple black-and-white wireframes should first be created.

The focus should be placed on:

- Page structure

- Navigation

- Button positions

- Content hierarchy

- Form placement

- User flow

- Dashboard layout

At this stage:

- Real images are not required

- Final colors are not required

- Detailed icons are not required

- Final typography is not required

Important screens should be designed first:

1. Login

2. Customer Home

3. Product Listing

4. Product Details

5. Cart

6. Checkout

7. Vendor Dashboard

8. Vendor Orders

9. Production Kanban Board

10. Supplier Dashboard

11. Supplier Purchase Orders

12. Admin Dashboard


# 7. Conduct Early Usability Testing

The low-fidelity screens should be tested with sample users.

Example testing tasks:

### Customer test

> Find a teak wardrobe, customize it, request a quotation, and place an order.

### Vendor test

> Open a customer order, start production, and update progress to 50%.

### Supplier test

> Open a purchase order, accept it, and create a shipment.

### Admin test

> Find a pending vendor account and approve it.

During testing, observe:

- Can users find the correct page?

- Are labels understandable?

- Are buttons easy to identify?

- Are users confused by any steps?

- Are important actions missing?

The wireframes should be updated based on the results.


# 8. Create a Design System

A shared design system should be created before high-fidelity screens are produced.

## Colors

- Forest Green: `\#2F5D50`

- Wood Brown: `\#8B5E3C`

- Warm Cream: `\#F7F3EC`

- Soft Sage: `\#A8BFA3`

- Charcoal: `\#1F2933`

- White: `\#FFFFFF`

## Typography

Use:

- Inter

- Manrope

- Plus Jakarta Sans

Typography levels:

- Page title

- Section heading

- Card heading

- Body text

- Caption

- Form label

- Button text

## Components

Reusable components should include:

- Primary button

- Secondary button

- Input field

- Dropdown

- Search bar

- Product card

- Vendor card

- Supplier card

- Order card

- Status badge

- Progress bar

- Notification

- Modal

- Table

- Sidebar

- Navbar

- Kanban card

- Timeline

- Pagination


# 9. Create High-Fidelity Screens

After the low-fidelity designs are approved, realistic high-fidelity screens should be created.

High-fidelity screens should include:

- Final colors

- Realistic product images

- Realistic sample data

- Final typography

- Icons

- Shadows

- Borders

- Status badges

- Progress indicators

- Charts

- Tables

- Hover states

- Validation messages

## Customer Design Style

The customer side should feel:

- Warm

- Premium

- Nature-inspired

- Product-focused

- Easy to use

## Vendor Design Style

The vendor side should feel:

- Professional

- Data-focused

- Task-oriented

- Similar to business management software

## Supplier Design Style

The supplier side should feel:

- Simple

- Operational

- Order-focused

- Shipment-focused

## Admin Design Style

The admin side should feel:

- Structured

- Secure

- Data-focused

- Easy to monitor


# 10. Create an Interactive Prototype

The high-fidelity screens should be connected in Figma.

Important prototype interactions:

- Login opens the correct role dashboard

- Product cards open product details

- Add to Cart updates the cart

- Checkout opens payment confirmation

- Order cards open order details

- Vendor can move production cards between Kanban columns

- Progress percentage is updated

- Supplier can accept a purchase order

- Supplier can create a shipment

- Admin can approve vendors

- Confirmation modals are opened

- Notifications are displayed


# 11. Test Responsive Design

The interface should be tested at three main sizes:

### Desktop

- Width: 1440px

- Full navigation

- Multiple dashboard columns

- Full data tables

- Full Kanban board

### Tablet

- Width: 768px

- Collapsible sidebar

- Two-column cards

- Horizontal table scrolling

### Mobile

- Width: 390px

- Hamburger or bottom navigation

- One-column layout

- Card-based order information

- Stacked forms

- Simplified tracking timeline


# 12. Accessibility Testing

The following should be checked:

- Text has sufficient color contrast

- Font sizes are readable

- Buttons have clear labels

- Form fields have labels

- Error messages are understandable

- Icons are supported by text

- Keyboard navigation is supported

- Important actions are not represented only by color

- Images contain alternative text


# 13. Developer Handoff

The final Figma file should contain:

- Organized pages

- Named frames

- Reusable components

- Design system

- Color variables

- Typography styles

- Auto-layout

- Component variants

- Interaction states

- Responsive screen versions

- Developer notes

The following should be provided to developers:

- Screen measurements

- Component spacing

- Color codes

- Font sizes

- Icons

- Image assets

- Button states

- Form validation rules

- Navigation flows


# 14. UX Testing After Development

After React development is completed, the real web application should be tested again.

Test areas:

- Login

- Product search

- Cart

- Checkout

- Payment

- Quotations

- Production tracking

- Purchase orders

- Shipments

- Notifications

- Chat

- Admin approval

Problems should be recorded and corrected before final deployment.


