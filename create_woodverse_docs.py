from pathlib import Path
import zipfile


ROOT = Path("woodverse")


FILE_GROUPS = {
    "": [
        "README.md",
        "plan.md",
        "ui_ux.md",
        "MD_FILE_INDEX.md",
    ],

    "apps/web": [
        "README.md",
    ],

    "apps/api": [
        "README.md",
    ],

    "apps/ai-service": [
        "README.md",
    ],

    "database": [
        "README.md",
    ],

    "docs": [
        "README.md",
        "FULL_SYSTEM_DOCUMENTATION.md",
        "CONTRIBUTING.md",
        "CHANGELOG.md",
    ],

    "docs/architecture": [
        "SYSTEM_ARCHITECTURE.md",
        "MODULE_BOUNDARIES.md",
        "INTEGRATION_MAP.md",
        "MODULAR_MONOLITH.md",
        "FUTURE_MICROSERVICES.md",
    ],

    "docs/ux": [
        "UI_UX_GUIDELINES.md",
        "DESIGN_SYSTEM.md",
        "SCREEN_INVENTORY.md",
        "USER_FLOWS.md",
        "USER_PERSONAS.md",
        "RESPONSIVE_DESIGN.md",
        "ACCESSIBILITY.md",
    ],

    "docs/data": [
        "DATABASE_DESIGN.md",
        "ER_RELATIONSHIPS.md",
        "ECOMMERCE_SCHEMA.md",
        "SUPPLY_CHAIN_SCHEMA.md",
        "OPERATIONS_SCHEMA.md",
        "DATA_DICTIONARY.md",
    ],

    "docs/api": [
        "API_CONTRACTS.md",
        "AUTH_API.md",
        "CUSTOMER_API.md",
        "VENDOR_API.md",
        "SUPPLIER_API.md",
        "SUPPORT_API.md",
        "ADMIN_API.md",
        "PAYMENT_API.md",
        "AI_API.md",
        "ERROR_RESPONSE_STANDARD.md",
    ],

    "docs/features": [
        "AUTHENTICATION.md",
        "CUSTOMER_ECOMMERCE.md",
        "PRODUCT_CUSTOMIZATION.md",
        "QUOTATION_MANAGEMENT.md",
        "ORDER_MANAGEMENT.md",
        "PAYMENT_MANAGEMENT.md",
        "SHIPMENT_TRACKING.md",
        "VENDOR_MANAGEMENT.md",
        "PRODUCTION_TRACKING.md",
        "KANBAN_MANAGEMENT.md",
        "SUPPLIER_MANAGEMENT.md",
        "PURCHASE_ORDERS.md",
        "INVENTORY_MANAGEMENT.md",
        "WAREHOUSE_MANAGEMENT.md",
        "INDOOR_PLANT_SHOWROOM.md",
        "LASER_CUT_FILES.md",
        "AI_ROOM_MEASUREMENT.md",
        "AI_QUOTATION.md",
        "AI_CHATBOT.md",
        "REALTIME_CHAT.md",
        "NOTIFICATIONS.md",
        "SUPPORT_MANAGEMENT.md",
        "ADMIN_MANAGEMENT.md",
    ],

    "docs/guides": [
        "CUSTOMER_GUIDE.md",
        "VENDOR_GUIDE.md",
        "SUPPLIER_GUIDE.md",
        "SUPPORT_GUIDE.md",
        "ADMIN_GUIDE.md",
    ],

    "docs/security": [
        "SECURITY_REQUIREMENTS.md",
        "AUTH_RBAC.md",
        "PAYMENT_SECURITY.md",
        "FILE_UPLOAD_SECURITY.md",
        "AI_GOVERNANCE.md",
        "PRIVACY_POLICY.md",
    ],

    "docs/testing": [
        "TESTING_STRATEGY.md",
        "UNIT_TESTING.md",
        "API_TESTING.md",
        "INTEGRATION_TESTING.md",
        "E2E_SCENARIOS.md",
        "SECURITY_TESTING.md",
        "ACCESSIBILITY_TESTING.md",
        "RELEASE_CHECKLIST.md",
    ],

    "docs/infrastructure": [
        "LOCAL_DEVELOPMENT.md",
        "DOCKER.md",
        "ENVIRONMENT_VARIABLES.md",
        "DATABASE_DEPLOYMENT.md",
        "VERCEL_DEPLOYMENT.md",
        "RENDER_DEPLOYMENT.md",
        "SUPABASE_STORAGE.md",
        "CI_CD.md",
        "KUBERNETES_FUTURE.md",
    ],

    "docs/operations": [
        "MONITORING_LOGGING.md",
        "BACKUP_RECOVERY.md",
        "INCIDENT_PLAYBOOK.md",
        "SUPPORT_ESCALATION.md",
        "MAINTENANCE_GUIDE.md",
    ],

    "docs/phases": [
        "IMPLEMENTATION_ROADMAP.md",
        "PHASE_0_PROJECT_SETUP.md",
        "PHASE_1_DESIGN_SYSTEM.md",
        "PHASE_2_AUTHENTICATION_RBAC.md",
        "PHASE_3_CUSTOMER_ECOMMERCE.md",
        "PHASE_4_ORDERS_QUOTES_PAYMENTS.md",
        "PHASE_5_VENDOR_OPERATIONS.md",
        "PHASE_6_PRODUCTION_TRACKING.md",
        "PHASE_7_SUPPLY_CHAIN.md",
        "PHASE_8_SUPPLIER_PORTAL.md",
        "PHASE_9_ADMIN_SUPPORT.md",
        "PHASE_10_AI_CHAT_NOTIFICATIONS.md",
        "PHASE_11_TESTING_HARDENING.md",
        "PHASE_12_DEPLOYMENT_RELEASE.md",
    ],
}


PROJECT_CONTEXT = """
WoodVerse is an AI-assisted multi-vendor web platform for furniture,
wooden products, wooden gifts, standard laser-cut files, indoor plants,
custom furniture, supplier management, inventory, production tracking,
payments, shipments, support, and administration.

Main roles:

- Customer
- Vendor / Seller
- Supplier
- Support Staff
- System Administrator

Technology stack:

- React.js
- Tailwind CSS
- Node.js
- Express.js
- PostgreSQL
- Python
- FastAPI
- Scikit-learn
- OpenCV
- MiDaS / DPT
- Socket.IO
"""


def title_from_filename(filename: str) -> str:
    stem = Path(filename).stem
    return stem.replace("_", " ").replace("-", " ").title()


def common_header(title: str) -> str:
    return f"""# {title}

## Document Information

- Project: WoodVerse
- Status: Draft
- Version: 1.0
- Last Updated: To be updated
- Owner: WoodVerse Development Team

## Project Context

{PROJECT_CONTEXT.strip()}
"""


def phase_content(title: str) -> str:
    return common_header(title) + """

## Objective

The objective of this phase is to implement the related WoodVerse
features in a structured, secure, testable, and maintainable manner.

## Scope

- Review approved requirements.
- Review the related UI/UX screens.
- Implement database changes.
- Implement backend APIs.
- Implement frontend screens.
- Apply role-based permissions.
- Add validations and error handling.
- Add automated tests.
- Update documentation.

## UI Screens

List all screens that are included in this phase.

- Screen name
- User role
- Main purpose
- Required components
- Loading state
- Empty state
- Error state
- Success state
- Responsive behaviour

## Frontend Tasks

- Create routes.
- Add route guards.
- Build reusable components.
- Connect API services.
- Add form validation.
- Add loading and feedback states.
- Test desktop, tablet, and mobile layouts.

## Backend Tasks

- Create module routes.
- Create controllers.
- Create services.
- Create repositories.
- Create validation rules.
- Create permission checks.
- Add domain events where required.
- Add error handling.

## API Endpoints

Document each endpoint using:

- Method
- URL
- Required role
- Request body
- Response body
- Validation rules
- Error responses

## Database Entities

Document:

- Tables
- Primary keys
- Foreign keys
- Constraints
- Indexes
- Relationships
- Migration order

## Integrations

Possible integrations include:

- FastAPI AI service
- Socket.IO
- Payment gateway
- Supabase Storage
- Email or notification service

## Security Requirements

- Authentication must be enforced.
- Authorization must be checked server-side.
- Input must be validated.
- Sensitive values must not be logged.
- External callbacks must be verified.
- File uploads must be validated.

## Testing Tasks

- Unit testing
- API testing
- Integration testing
- Role-permission testing
- Responsive testing
- Accessibility testing
- Error-state testing

## Dependencies

List all required previous phases, entities, APIs, components, and
external services.

## Deliverables

- Completed screens
- Completed APIs
- Database migrations
- Automated tests
- Updated documentation
- Demonstration data

## Definition of Done

- Requirements are implemented.
- Role access is verified.
- Validation is complete.
- Error states are handled.
- Tests pass.
- Documentation is updated.
- The feature is ready for demonstration.

## Risks

- Scope expansion
- Integration delays
- Missing test data
- Incorrect permission rules
- Inconsistent status values

## Status

- [ ] Not Started
- [ ] In Progress
- [ ] Testing
- [ ] Completed
"""


def api_content(title: str) -> str:
    return common_header(title) + """

## Purpose

This document defines the API requirements for the related WoodVerse
module.

## Base Route

```text
/api/v1/
```

## Authentication

- Use JWT access tokens for protected endpoints.
- Validate the current user role before executing business logic.
- Return consistent error responses for unauthorized and forbidden access.

## Endpoint Checklist

For each endpoint, document:

- Method
- Path
- Required role
- Request parameters
- Request body
- Success response
- Error responses
- Validation rules
- Rate limits

## Standard Response Shape

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": {}
}
```

## Error Response Shape

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}
```

## Notes

- Keep controller logic thin.
- Put business rules in services.
- Validate all incoming data.
- Log operational failures without exposing sensitive data.
"""


def feature_content(title: str) -> str:
    return common_header(title) + """

## Purpose

This document describes the feature requirements, user flows, data needs,
API needs, UI states, security rules, and testing requirements.

## User Roles

- Customer
- Vendor / Seller
- Supplier
- Support Staff
- System Administrator

## Functional Requirements

- Define what users can create, view, update, and delete.
- Define approval, rejection, and status-change workflows.
- Define notifications and real-time updates where required.
- Define audit logging for important actions.

## UI Requirements

- Primary screen
- List or table view
- Detail view
- Create or edit form
- Confirmation dialog
- Loading state
- Empty state
- Error state
- Success state

## Backend Requirements

- Routes
- Controllers
- Services
- Repositories
- Validation rules
- Permission checks
- Events and notifications

## Data Requirements

- Tables
- Relationships
- Required fields
- Optional fields
- Status values
- Indexes

## Testing Requirements

- Unit tests
- API tests
- Integration tests
- Role-permission tests
- Responsive UI tests
"""


def guide_content(title: str) -> str:
    return common_header(title) + """

## Purpose

This guide explains the workflows, responsibilities, and expected actions
for the related WoodVerse user role.

## Getting Started

- Sign in with an approved account.
- Review the dashboard.
- Check notifications and pending tasks.
- Open the relevant module from the main navigation.

## Core Workflows

- View assigned records.
- Create or update records.
- Upload required files where applicable.
- Review status changes.
- Communicate with other roles when needed.

## Best Practices

- Keep information accurate and current.
- Verify all important details before submission.
- Use comments or chat for clarification.
- Report issues through the support process.

## Troubleshooting

- Check required fields.
- Confirm account permissions.
- Refresh data if status appears stale.
- Contact support for unresolved issues.
"""


def architecture_content(title: str) -> str:
    return common_header(title) + """

## Overview

WoodVerse is planned as a modular monolith that can later evolve into
separate services for commerce, operations, AI, payments, and notifications.

## Main Modules

- Authentication and RBAC
- Customer ecommerce
- Vendor operations
- Supplier management
- Inventory and warehouse management
- Production tracking
- Payment and shipment management
- AI services
- Support and administration

## Application Layers

- Frontend: React.js and Tailwind CSS
- Backend API: Node.js and Express.js
- AI service: Python and FastAPI
- Database: PostgreSQL
- Realtime: Socket.IO
- Storage: Supabase Storage or compatible object storage

## Design Principles

- Keep module boundaries clear.
- Centralize authentication and authorization.
- Use consistent API response standards.
- Store audit logs for sensitive actions.
- Prefer explicit status values and predictable workflows.
"""


def ux_content(title: str) -> str:
    return common_header(title) + """

## UX Goals

- Keep role-specific workflows easy to discover.
- Make order, quotation, production, and shipment status clear.
- Support desktop-first operational screens and responsive customer screens.
- Provide useful empty, loading, and error states.

## Screen Documentation

For each screen, document:

- Screen name
- User role
- Purpose
- Primary actions
- Data shown
- Components
- Responsive behavior
- Accessibility requirements

## Design System Notes

- Use consistent spacing, typography, colors, and buttons.
- Use clear status badges for workflow states.
- Use tables for dense operational data.
- Use forms with validation feedback close to the field.
"""


def data_content(title: str) -> str:
    return common_header(title) + """

## Purpose

This document captures database design decisions and data requirements.

## Entity Checklist

For each entity, document:

- Table name
- Primary key
- Foreign keys
- Required fields
- Optional fields
- Status fields
- Indexes
- Constraints
- Audit fields

## Common Fields

```text
id
created_at
updated_at
created_by
updated_by
status
```

## Data Quality Rules

- Validate required values before writing.
- Keep status values consistent across frontend and backend.
- Use foreign keys for important relationships.
- Add indexes for common filters and lookups.
"""


def security_content(title: str) -> str:
    return common_header(title) + """

## Security Goals

- Protect customer, vendor, supplier, and payment data.
- Enforce role-based access on the server.
- Validate all user input.
- Keep secrets out of source control and logs.

## Requirements

- Authentication for protected routes.
- Authorization checks for every privileged action.
- Secure password handling.
- File upload validation.
- Payment callback verification.
- Audit logging for sensitive actions.

## Review Checklist

- No sensitive data in logs.
- No client-only permission checks.
- No unchecked file uploads.
- No direct object access without ownership checks.
- Environment variables are documented.
"""


def testing_content(title: str) -> str:
    return common_header(title) + """

## Purpose

This document defines the testing scope for the related WoodVerse area.

## Test Types

- Unit tests
- API tests
- Integration tests
- End-to-end tests
- Security tests
- Accessibility tests
- Responsive layout tests

## Test Data

- Customer account
- Vendor account
- Supplier account
- Support account
- Admin account
- Products, materials, orders, quotations, payments, and shipments

## Acceptance Checklist

- Happy paths pass.
- Validation errors are covered.
- Permission errors are covered.
- Empty and loading states are checked.
- Regression risks are documented.
"""


def infrastructure_content(title: str) -> str:
    return common_header(title) + """

## Purpose

This document captures setup, deployment, environment, and operations
requirements for WoodVerse infrastructure.

## Environments

- Local development
- Test
- Staging
- Production

## Checklist

- Environment variables
- Database connection
- Storage configuration
- API service URL
- AI service URL
- Payment gateway configuration
- Logging and monitoring
- Backup and recovery
"""


def operations_content(title: str) -> str:
    return common_header(title) + """

## Purpose

This document defines operational processes for maintaining WoodVerse after
release.

## Operational Areas

- Monitoring
- Logging
- Backups
- Incident response
- Support escalation
- Maintenance windows
- Release verification

## Checklist

- Define ownership.
- Define alert thresholds.
- Define backup frequency.
- Define recovery steps.
- Define support escalation paths.
- Review incidents after resolution.
"""


def app_readme_content(title: str, folder: str) -> str:
    return common_header(title) + f"""

## Purpose

This folder contains the `{folder}` application area for WoodVerse.

## Expected Contents

- Source code
- Configuration
- Tests
- README notes
- Environment examples where required

## Setup Notes

Document installation, local development commands, test commands, and build
commands when implementation starts.
"""


def root_readme_content() -> str:
    return common_header("WoodVerse") + """

## Overview

WoodVerse is a multi-role platform for furniture ecommerce, product
customization, vendor operations, suppliers, production tracking, inventory,
payments, shipments, AI assistance, support, and administration.

## Repository Structure

- `apps/web`: React frontend.
- `apps/api`: Node.js and Express API.
- `apps/ai-service`: Python FastAPI service.
- `database`: PostgreSQL schema and migrations.
- `docs`: Product, architecture, API, security, testing, and deployment docs.

## Documentation

Start with:

- `docs/FULL_SYSTEM_DOCUMENTATION.md`
- `docs/architecture/SYSTEM_ARCHITECTURE.md`
- `docs/phases/IMPLEMENTATION_ROADMAP.md`
- `MD_FILE_INDEX.md`
"""


def index_content() -> str:
    lines = ["# WoodVerse Markdown File Index", ""]
    for folder, filenames in FILE_GROUPS.items():
        heading = folder or "root"
        lines.append(f"## {heading}")
        lines.append("")
        for filename in filenames:
            path = Path(folder) / filename if folder else Path(filename)
            lines.append(f"- `{path.as_posix()}`")
        lines.append("")
    return "\n".join(lines)


def ui_ux_content() -> str:
    image_dir = Path("UI_UX")
    images = sorted(path.name for path in image_dir.glob("*.png"))
    image_lines = "\n".join(f"- {name}" for name in images)
    return common_header("UI UX") + f"""

## Purpose

This document indexes the available UI/UX reference images and connects them
to the documentation workflow.

## Reference Screens

{image_lines if image_lines else "- Add exported UI/UX screens here."}

## Usage

- Map each screen to a role.
- Document the user goal for each screen.
- Connect each screen to features, APIs, and database entities.
- Review responsive and accessibility requirements.
"""


def generic_content(title: str) -> str:
    return common_header(title) + """

## Purpose

Describe the goals, scope, requirements, workflows, implementation notes, and
acceptance criteria for this WoodVerse area.

## Scope

- Background
- Requirements
- User roles
- Screens
- APIs
- Data model
- Security
- Testing
- Open questions

## Status

- [ ] Draft
- [ ] Reviewed
- [ ] Approved
- [ ] Implemented
"""


def content_for(folder: str, filename: str) -> str:
    title = title_from_filename(filename)

    if folder == "" and filename == "README.md":
        return root_readme_content()
    if folder == "" and filename == "MD_FILE_INDEX.md":
        return index_content()
    if folder == "" and filename == "ui_ux.md":
        return ui_ux_content()
    if folder == "" and filename == "plan.md":
        source_plan = Path("plan.md")
        if source_plan.exists():
            return source_plan.read_text(encoding="utf-8")
        return generic_content("Plan")

    if filename == "README.md":
        return app_readme_content(title, folder)
    if folder == "docs/api":
        return api_content(title)
    if folder == "docs/features":
        return feature_content(title)
    if folder == "docs/guides":
        return guide_content(title)
    if folder == "docs/architecture":
        return architecture_content(title)
    if folder == "docs/ux":
        return ux_content(title)
    if folder == "docs/data":
        return data_content(title)
    if folder == "docs/security":
        return security_content(title)
    if folder == "docs/testing":
        return testing_content(title)
    if folder == "docs/infrastructure":
        return infrastructure_content(title)
    if folder == "docs/operations":
        return operations_content(title)
    if folder == "docs/phases":
        return phase_content(title)

    return generic_content(title)


def write_docs() -> list[Path]:
    written_files = []
    for folder, filenames in FILE_GROUPS.items():
        directory = ROOT / folder
        directory.mkdir(parents=True, exist_ok=True)

        for filename in filenames:
            path = directory / filename
            path.write_text(content_for(folder, filename), encoding="utf-8")
            written_files.append(path)

    return written_files


def create_zip() -> Path:
    zip_path = Path("woodverse_docs.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(ROOT.rglob("*")):
            if path.is_file():
                archive.write(path, path.relative_to(ROOT.parent))
    return zip_path


def main() -> None:
    written_files = write_docs()
    zip_path = create_zip()
    print(f"Created {len(written_files)} markdown files in {ROOT}/")
    print(f"Created archive: {zip_path}")


if __name__ == "__main__":
    main()
