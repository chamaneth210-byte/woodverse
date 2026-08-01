BEGIN;

TRUNCATE TABLE messages, quotations, orders, products, vendors, users RESTART IDENTITY CASCADE;

INSERT INTO users (id, email, role, full_name, status)
VALUES
  ('00000000-0000-4000-8000-000000000101', 'vendor01@woodverse.lk', 'vendor', 'Moratuwa Crafts Admin', 'active'),
  ('00000000-0000-4000-8000-000000000102', 'vendor02@woodverse.lk', 'vendor', 'Ceylon Woods Admin', 'active'),
  ('00000000-0000-4000-8000-000000000103', 'vendor03@woodverse.lk', 'vendor', 'Urban Log Admin', 'active'),
  ('00000000-0000-4000-8000-000000000104', 'vendor04@woodverse.lk', 'vendor', 'Grand Timber Admin', 'active'),
  ('00000000-0000-4000-8000-000000000105', 'vendor05@woodverse.lk', 'vendor', 'Lumbini Timber Studio', 'active'),
  ('00000000-0000-4000-8000-000000000106', 'vendor06@woodverse.lk', 'vendor', 'Kandy Hardwood Works', 'active'),
  ('00000000-0000-4000-8000-000000000107', 'vendor07@woodverse.lk', 'vendor', 'Galle Craft House', 'active'),
  ('00000000-0000-4000-8000-000000000108', 'vendor08@woodverse.lk', 'vendor', 'Kurunegala Joinery', 'active'),
  ('00000000-0000-4000-8000-000000000109', 'vendor09@woodverse.lk', 'vendor', 'Colombo Wood Lab', 'active'),
  ('00000000-0000-4000-8000-000000000110', 'vendor10@woodverse.lk', 'vendor', 'Negombo Artisan Co', 'active'),
  ('00000000-0000-4000-8000-000000000111', 'vendor11@woodverse.lk', 'vendor', 'Matara Home Craft', 'active'),
  ('00000000-0000-4000-8000-000000000112', 'vendor12@woodverse.lk', 'vendor', 'Jaffna Timber Works', 'active'),
  ('00000000-0000-4000-8000-000000000113', 'vendor13@woodverse.lk', 'vendor', 'Nuwara Oak Studio', 'active'),
  ('00000000-0000-4000-8000-000000000114', 'vendor14@woodverse.lk', 'vendor', 'Ratnapura Woodline', 'active'),
  ('00000000-0000-4000-8000-000000000115', 'vendor15@woodverse.lk', 'vendor', 'Anuradhapura Craft Mill', 'active'),
  ('00000000-0000-4000-8000-000000000116', 'vendor16@woodverse.lk', 'vendor', 'Batticaloa Cane Works', 'active'),
  ('00000000-0000-4000-8000-000000000117', 'vendor17@woodverse.lk', 'vendor', 'Trinco Coastal Craft', 'active'),
  ('00000000-0000-4000-8000-000000000118', 'vendor18@woodverse.lk', 'vendor', 'Ella Wood Studio', 'active'),
  ('00000000-0000-4000-8000-000000000119', 'vendor19@woodverse.lk', 'vendor', 'Hikkaduwa Gift Works', 'active'),
  ('00000000-0000-4000-8000-000000000120', 'vendor20@woodverse.lk', 'vendor', 'Panadura Furniture Co', 'active');

INSERT INTO vendors (id, user_id, business_name, registration_number, description, verification_status, documents)
VALUES
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 'Moratuwa Crafts', 'WV-VEN-0001', 'Specializing in Burmese Teak reproductions since 1992.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000102', 'Ceylon Woods', 'WV-VEN-0002', 'Certified sustainable Mahogany experts from Kurunegala.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000103', 'Urban Log', 'WV-VEN-0003', 'Modern, ergonomic office furniture specialists.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000104', 'Grand Timber', 'WV-VEN-0004', 'Premium bedroom, living-room, and bespoke hardwood furniture.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000105', 'Lumbini Timber Studio', 'WV-VEN-0005', 'Custom desks, dining pieces, and made-to-order teak furniture.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000206', '00000000-0000-4000-8000-000000000106', 'Kandy Hardwood Works', 'WV-VEN-0006', 'Hardwood beds, wardrobes, and traditional storage furniture.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000207', '00000000-0000-4000-8000-000000000107', 'Galle Craft House', 'WV-VEN-0007', 'Coastal-inspired home accents and wooden gift products.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000208', '00000000-0000-4000-8000-000000000108', 'Kurunegala Joinery', 'WV-VEN-0008', 'Joinery, shelving, sideboards, and living-room furniture.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000209', '00000000-0000-4000-8000-000000000109', 'Colombo Wood Lab', 'WV-VEN-0009', 'Compact urban furniture for apartments and workspaces.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000210', '00000000-0000-4000-8000-000000000110', 'Negombo Artisan Co', 'WV-VEN-0010', 'Handmade gift sets, trays, and decorative wooden accessories.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000211', '00000000-0000-4000-8000-000000000111', 'Matara Home Craft', 'WV-VEN-0011', 'Dining, lounge, and planter furniture for modern homes.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000212', '00000000-0000-4000-8000-000000000112', 'Jaffna Timber Works', 'WV-VEN-0012', 'Durable hardwood furniture with regional craft detailing.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000213', '00000000-0000-4000-8000-000000000113', 'Nuwara Oak Studio', 'WV-VEN-0013', 'Oak wardrobes, bedroom sets, and premium storage furniture.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000214', '00000000-0000-4000-8000-000000000114', 'Ratnapura Woodline', 'WV-VEN-0014', 'Rosewood consoles, display tables, and polished home accents.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000215', '00000000-0000-4000-8000-000000000115', 'Anuradhapura Craft Mill', 'WV-VEN-0015', 'Traditional hardwood furniture and carved keepsake pieces.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000216', '00000000-0000-4000-8000-000000000116', 'Batticaloa Cane Works', 'WV-VEN-0016', 'Cane seating, lounge chairs, and breezy living-room pieces.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000217', '00000000-0000-4000-8000-000000000117', 'Trinco Coastal Craft', 'WV-VEN-0017', 'Lightweight coastal decor, bamboo sets, and small furniture.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000218', '00000000-0000-4000-8000-000000000118', 'Ella Wood Studio', 'WV-VEN-0018', 'Mountain-home furniture, planter stands, and warm wood accents.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000219', '00000000-0000-4000-8000-000000000119', 'Hikkaduwa Gift Works', 'WV-VEN-0019', 'Gift boards, keepsake boxes, and handcrafted tabletop products.', 'approved', '[]'::jsonb),
  ('00000000-0000-4000-8000-000000000220', '00000000-0000-4000-8000-000000000120', 'Panadura Furniture Co', 'WV-VEN-0020', 'Everyday furniture, desks, tables, and storage for family homes.', 'approved', '[]'::jsonb);

INSERT INTO products (id, vendor_id, name, description, category, material, price, stock_quantity, status, image_url)
VALUES
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000201', 'Royal Majesty Set', 'A carved solid-teak sofa set with deep cushions, ornate arm detail, and a formal living-room presence.', 'furniture', 'Solid Teak', 245000.00, 6, 'published', '/assets/royal-majesty-sofa-set.png'),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000202', 'Heritage Sideboard', 'Handcarved mahogany storage for dining rooms and lounges, finished with warm heritage detailing.', 'furniture', 'Mahogany', 112500.00, 2, 'published', '/assets/living-sofa-plants.png'),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000203', 'Linear Teak Desk', 'A clean-lined teak workspace desk designed for daily office use, laptops, and compact storage needs.', 'furniture', 'Solid Teak', 88000.00, 12, 'published', '/assets/workspace-desk-neutral.png'),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000204', 'Signature Bedframe', 'A luxury mahogany bedframe with a sturdy profile, polished finish, and long-lasting bedroom comfort.', 'furniture', 'Mahogany', 310000.00, 0, 'published', '/assets/signature-bedframe.png'),
  ('00000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000205', 'Walnut Task Table', 'A walnut task table with a smooth work surface, practical proportions, and refined modern grain.', 'furniture', 'Walnut', 74500.00, 18, 'published', '/assets/product-walnut-task-table.png'),
  ('00000000-0000-4000-8000-000000000306', '00000000-0000-4000-8000-000000000206', 'Modular Shelf Unit', 'A modular teak shelving unit for books, decor, and flexible living-room or studio organization.', 'furniture', 'Solid Teak', 56000.00, 10, 'published', '/assets/product-modular-shelf-unit.png'),
  ('00000000-0000-4000-8000-000000000307', '00000000-0000-4000-8000-000000000207', 'Carved Gift Box', 'A compact jackwood keepsake box with carved detailing, ideal for gifting jewelry or small mementos.', 'gift', 'Jackwood', 9800.00, 32, 'published', '/assets/product-carved-gift-box.png'),
  ('00000000-0000-4000-8000-000000000308', '00000000-0000-4000-8000-000000000208', 'Bamboo Coaster Set', 'A six-piece bamboo coaster set made for everyday table protection and natural serving style.', 'gift', 'Bamboo', 6800.00, 45, 'published', '/assets/product-bamboo-coaster-set.png'),
  ('00000000-0000-4000-8000-000000000309', '00000000-0000-4000-8000-000000000209', 'Teak Desk Tray', 'A solid teak desk tray for organizing stationery, keys, letters, and workspace accessories.', 'gift', 'Teak', 12500.00, 24, 'published', '/assets/product-wooden-tray.png'),
  ('00000000-0000-4000-8000-000000000310', '00000000-0000-4000-8000-000000000210', 'Housewarming Gift Set', 'A curated wooden gift bundle with ready-to-wrap home accents for new homes and celebrations.', 'gift', 'Curated Wood', 22000.00, 15, 'published', '/assets/product-housewarming-gift-set.png'),
  ('00000000-0000-4000-8000-000000000311', '00000000-0000-4000-8000-000000000211', 'Teak Dining Bench', 'A sturdy solid-teak dining bench with softened edges and family-table proportions.', 'furniture', 'Solid Teak', 64000.00, 9, 'published', '/assets/dining-table-floral.png'),
  ('00000000-0000-4000-8000-000000000312', '00000000-0000-4000-8000-000000000212', 'Mahogany Coffee Table', 'A warm mahogany coffee table with a low profile, open shelf, and hand-polished finish.', 'furniture', 'Mahogany', 89000.00, 3, 'published', '/assets/living-sofa-plants.png'),
  ('00000000-0000-4000-8000-000000000313', '00000000-0000-4000-8000-000000000213', 'Oak Wardrobe', 'A full-height oak wardrobe with soft-close doors, drawer storage, and a natural matte finish.', 'furniture', 'Oak', 310000.00, 5, 'published', '/assets/bedroom-soft-neutral.png'),
  ('00000000-0000-4000-8000-000000000314', '00000000-0000-4000-8000-000000000214', 'Cane Lounge Chair', 'A relaxed lounge chair combining a hardwood frame, cane back, and washable cushion seat.', 'furniture', 'Cane and Fabric', 126500.00, 8, 'published', '/assets/living-room-hero.png'),
  ('00000000-0000-4000-8000-000000000315', '00000000-0000-4000-8000-000000000215', 'Teak Executive Desk', 'A large teak executive desk with concealed cable access, drawers, and a durable satin topcoat.', 'furniture', 'Solid Teak', 245000.00, 0, 'published', '/assets/workspace-desk-neutral.png'),
  ('00000000-0000-4000-8000-000000000316', '00000000-0000-4000-8000-000000000216', 'Walnut TV Console', 'A long walnut media console with sliding doors, ventilation slots, and cable management.', 'furniture', 'Walnut', 168000.00, 4, 'published', '/assets/product-modular-shelf-unit.png'),
  ('00000000-0000-4000-8000-000000000317', '00000000-0000-4000-8000-000000000217', 'Rosewood Console Table', 'A narrow rosewood console for entryways, finished with tapered legs and a smooth display surface.', 'furniture', 'Rosewood', 156000.00, 6, 'published', '/assets/material-premium-rosewood.png'),
  ('00000000-0000-4000-8000-000000000318', '00000000-0000-4000-8000-000000000218', 'Jackwood Serving Board', 'A food-safe jackwood serving board with a broad handle and smooth rounded edge.', 'gift', 'Jackwood', 11800.00, 28, 'published', '/assets/product-wooden-tray.png'),
  ('00000000-0000-4000-8000-000000000319', '00000000-0000-4000-8000-000000000219', 'Satinwood Jewelry Stand', 'A compact satinwood jewelry stand with tiered bars for rings, bracelets, and necklaces.', 'gift', 'Satinwood', 16500.00, 22, 'published', '/assets/product-carved-gift-box.png'),
  ('00000000-0000-4000-8000-000000000320', '00000000-0000-4000-8000-000000000220', 'Planter Stand Set', 'A pair of wooden planter stands sized for indoor greenery, balconies, and small lounge corners.', 'gift', 'Bamboo', 27500.00, 16, 'published', '/assets/home-plants-hero.png');

INSERT INTO orders (id, customer_id, vendor_id, status, total_amount, requires_manufacturing, fulfillment_plan, shipping_address)
VALUES
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', 'processing', 245000.00, false, '[{"product":"Royal Majesty Set","quantity":1,"decision":"stock"}]'::jsonb, '{"city":"Colombo","line1":"12 Lake Road"}'::jsonb),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000202', 'vendor_approval', 112500.00, true, '[{"product":"Heritage Sideboard","quantity":1,"decision":"manufacture"}]'::jsonb, '{"city":"Kandy","line1":"48 Hill Street"}'::jsonb),
  ('00000000-0000-4000-8000-000000000403', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000203', 'manufacturing', 88000.00, true, '[{"product":"Linear Teak Desk","quantity":1,"decision":"manufacture"}]'::jsonb, '{"city":"Galle","line1":"7 Fort Lane"}'::jsonb),
  ('00000000-0000-4000-8000-000000000404', '00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000204', 'ready_for_delivery', 310000.00, false, '[{"product":"Signature Bedframe","quantity":1,"decision":"stock"}]'::jsonb, '{"city":"Nugegoda","line1":"21 Temple Road"}'::jsonb),
  ('00000000-0000-4000-8000-000000000405', '00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000205', 'shipped', 74500.00, false, '[{"product":"Walnut Task Table","quantity":1,"decision":"stock"}]'::jsonb, '{"city":"Moratuwa","line1":"90 Station Road"}'::jsonb),
  ('00000000-0000-4000-8000-000000000406', '00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000206', 'completed', 56000.00, false, '[{"product":"Modular Shelf Unit","quantity":1,"decision":"stock"}]'::jsonb, '{"city":"Kurunegala","line1":"5 Mill Road"}'::jsonb),
  ('00000000-0000-4000-8000-000000000407', '00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000207', 'cancelled', 9800.00, false, '[{"product":"Carved Gift Box","quantity":1,"decision":"stock"}]'::jsonb, '{"city":"Matara","line1":"33 Beach Road"}'::jsonb),
  ('00000000-0000-4000-8000-000000000408', '00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000208', 'processing', 6800.00, false, '[{"product":"Bamboo Coaster Set","quantity":1,"decision":"stock"}]'::jsonb, '{"city":"Negombo","line1":"14 Lagoon View"}'::jsonb),
  ('00000000-0000-4000-8000-000000000409', '00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000209', 'vendor_approval', 12500.00, true, '[{"product":"Teak Desk Tray","quantity":3,"decision":"manufacture"}]'::jsonb, '{"city":"Panadura","line1":"8 Garden Avenue"}'::jsonb),
  ('00000000-0000-4000-8000-000000000410', '00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000210', 'manufacturing', 22000.00, true, '[{"product":"Housewarming Gift Set","quantity":2,"decision":"manufacture"}]'::jsonb, '{"city":"Jaffna","line1":"17 Market Street"}'::jsonb),
  ('00000000-0000-4000-8000-000000000411', '00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000211', 'ready_for_delivery', 64000.00, false, '[{"product":"Teak Dining Bench","quantity":1,"decision":"stock"}]'::jsonb, '{"city":"Batticaloa","line1":"22 Lake Drive"}'::jsonb),
  ('00000000-0000-4000-8000-000000000412', '00000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000212', 'shipped', 89000.00, false, '[{"product":"Mahogany Coffee Table","quantity":1,"decision":"stock"}]'::jsonb, '{"city":"Trincomalee","line1":"6 Dock Road"}'::jsonb),
  ('00000000-0000-4000-8000-000000000413', '00000000-0000-4000-8000-000000000113', '00000000-0000-4000-8000-000000000213', 'completed', 310000.00, false, '[{"product":"Oak Wardrobe","quantity":1,"decision":"stock"}]'::jsonb, '{"city":"Nuwara Eliya","line1":"11 Park Road"}'::jsonb),
  ('00000000-0000-4000-8000-000000000414', '00000000-0000-4000-8000-000000000114', '00000000-0000-4000-8000-000000000214', 'processing', 126500.00, false, '[{"product":"Cane Lounge Chair","quantity":1,"decision":"stock"}]'::jsonb, '{"city":"Ratnapura","line1":"42 Gem Street"}'::jsonb),
  ('00000000-0000-4000-8000-000000000415', '00000000-0000-4000-8000-000000000115', '00000000-0000-4000-8000-000000000215', 'vendor_approval', 245000.00, true, '[{"product":"Teak Executive Desk","quantity":1,"decision":"manufacture"}]'::jsonb, '{"city":"Anuradhapura","line1":"18 Tank Road"}'::jsonb),
  ('00000000-0000-4000-8000-000000000416', '00000000-0000-4000-8000-000000000116', '00000000-0000-4000-8000-000000000216', 'manufacturing', 168000.00, true, '[{"product":"Walnut TV Console","quantity":2,"decision":"manufacture"}]'::jsonb, '{"city":"Hikkaduwa","line1":"2 Coral Road"}'::jsonb),
  ('00000000-0000-4000-8000-000000000417', '00000000-0000-4000-8000-000000000117', '00000000-0000-4000-8000-000000000217', 'ready_for_delivery', 156000.00, false, '[{"product":"Rosewood Console Table","quantity":1,"decision":"stock"}]'::jsonb, '{"city":"Ella","line1":"9 View Point"}'::jsonb),
  ('00000000-0000-4000-8000-000000000418', '00000000-0000-4000-8000-000000000118', '00000000-0000-4000-8000-000000000218', 'shipped', 11800.00, false, '[{"product":"Jackwood Serving Board","quantity":2,"decision":"stock"}]'::jsonb, '{"city":"Badulla","line1":"27 Main Street"}'::jsonb),
  ('00000000-0000-4000-8000-000000000419', '00000000-0000-4000-8000-000000000119', '00000000-0000-4000-8000-000000000219', 'completed', 16500.00, false, '[{"product":"Satinwood Jewelry Stand","quantity":1,"decision":"stock"}]'::jsonb, '{"city":"Kalutara","line1":"3 River Road"}'::jsonb),
  ('00000000-0000-4000-8000-000000000420', '00000000-0000-4000-8000-000000000120', '00000000-0000-4000-8000-000000000220', 'processing', 27500.00, false, '[{"product":"Planter Stand Set","quantity":1,"decision":"stock"}]'::jsonb, '{"city":"Colombo","line1":"58 Flower Road"}'::jsonb);

INSERT INTO quotations (id, order_id, customer_id, vendor_id, status, amount, notes, valid_until)
VALUES
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', 'accepted', 245000.00, 'Confirmed stock order with standard delivery.', '2026-08-10'),
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000202', 'sent', 112500.00, 'Manufacturing approval required before work starts.', '2026-08-11'),
  ('00000000-0000-4000-8000-000000000503', '00000000-0000-4000-8000-000000000403', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000203', 'draft', 88000.00, 'Workspace delivery quote pending final measurements.', '2026-08-12'),
  ('00000000-0000-4000-8000-000000000504', '00000000-0000-4000-8000-000000000404', '00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000204', 'accepted', 310000.00, 'Bedroom furniture quotation approved.', '2026-08-13'),
  ('00000000-0000-4000-8000-000000000505', '00000000-0000-4000-8000-000000000405', '00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000205', 'sent', 74500.00, 'Walnut surface finish included.', '2026-08-14'),
  ('00000000-0000-4000-8000-000000000506', '00000000-0000-4000-8000-000000000406', '00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000206', 'accepted', 56000.00, 'Shelf delivery completed from existing stock.', '2026-08-15'),
  ('00000000-0000-4000-8000-000000000507', '00000000-0000-4000-8000-000000000407', '00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000207', 'declined', 9800.00, 'Customer cancelled gift box request.', '2026-08-16'),
  ('00000000-0000-4000-8000-000000000508', '00000000-0000-4000-8000-000000000408', '00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000208', 'sent', 6800.00, 'Coaster set packed for dispatch.', '2026-08-17'),
  ('00000000-0000-4000-8000-000000000509', '00000000-0000-4000-8000-000000000409', '00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000209', 'draft', 12500.00, 'Bulk desk tray pricing under review.', '2026-08-18'),
  ('00000000-0000-4000-8000-000000000510', '00000000-0000-4000-8000-000000000410', '00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000210', 'sent', 22000.00, 'Gift wrapping and card note included.', '2026-08-19'),
  ('00000000-0000-4000-8000-000000000511', '00000000-0000-4000-8000-000000000411', '00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000211', 'accepted', 64000.00, 'Dining bench ready for dispatch.', '2026-08-20'),
  ('00000000-0000-4000-8000-000000000512', '00000000-0000-4000-8000-000000000412', '00000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000212', 'sent', 89000.00, 'Coffee table shipment scheduled.', '2026-08-21'),
  ('00000000-0000-4000-8000-000000000513', '00000000-0000-4000-8000-000000000413', '00000000-0000-4000-8000-000000000113', '00000000-0000-4000-8000-000000000213', 'accepted', 310000.00, 'Wardrobe delivery confirmed.', '2026-08-22'),
  ('00000000-0000-4000-8000-000000000514', '00000000-0000-4000-8000-000000000414', '00000000-0000-4000-8000-000000000114', '00000000-0000-4000-8000-000000000214', 'draft', 126500.00, 'Cushion color confirmation pending.', '2026-08-23'),
  ('00000000-0000-4000-8000-000000000515', '00000000-0000-4000-8000-000000000415', '00000000-0000-4000-8000-000000000115', '00000000-0000-4000-8000-000000000215', 'sent', 245000.00, 'Executive desk manufacturing quote sent.', '2026-08-24'),
  ('00000000-0000-4000-8000-000000000516', '00000000-0000-4000-8000-000000000416', '00000000-0000-4000-8000-000000000116', '00000000-0000-4000-8000-000000000216', 'accepted', 168000.00, 'Media console quotation accepted.', '2026-08-25'),
  ('00000000-0000-4000-8000-000000000517', '00000000-0000-4000-8000-000000000417', '00000000-0000-4000-8000-000000000117', '00000000-0000-4000-8000-000000000217', 'sent', 156000.00, 'Rosewood console ready for delivery.', '2026-08-26'),
  ('00000000-0000-4000-8000-000000000518', '00000000-0000-4000-8000-000000000418', '00000000-0000-4000-8000-000000000118', '00000000-0000-4000-8000-000000000218', 'accepted', 11800.00, 'Serving boards dispatched.', '2026-08-27'),
  ('00000000-0000-4000-8000-000000000519', '00000000-0000-4000-8000-000000000419', '00000000-0000-4000-8000-000000000119', '00000000-0000-4000-8000-000000000219', 'expired', 16500.00, 'Expired jewelry stand quotation kept for audit.', '2026-07-31'),
  ('00000000-0000-4000-8000-000000000520', '00000000-0000-4000-8000-000000000420', '00000000-0000-4000-8000-000000000120', '00000000-0000-4000-8000-000000000220', 'sent', 27500.00, 'Planter stand delivery pending.', '2026-08-28');

INSERT INTO messages (id, sender_id, recipient_id, thread_id, body, read_at)
VALUES
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000701', 'Can you confirm the mahogany stock for the sideboard order?', NOW()),
  ('00000000-0000-4000-8000-000000000602', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000702', 'The sideboard has moved to vendor approval.', NOW()),
  ('00000000-0000-4000-8000-000000000603', '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000703', 'Linear desk measurements are ready for production review.', NULL),
  ('00000000-0000-4000-8000-000000000604', '00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000704', 'The bedframe order is ready for delivery.', NOW()),
  ('00000000-0000-4000-8000-000000000605', '00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000705', 'Walnut table shipment left the workshop.', NOW()),
  ('00000000-0000-4000-8000-000000000606', '00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000706', 'Shelf unit delivery was completed this morning.', NOW()),
  ('00000000-0000-4000-8000-000000000607', '00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000707', 'Gift box cancellation has been recorded.', NOW()),
  ('00000000-0000-4000-8000-000000000608', '00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000708', 'Coaster set is packed and waiting for courier pickup.', NULL),
  ('00000000-0000-4000-8000-000000000609', '00000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000709', 'Desk tray bulk quote needs one more stock check.', NULL),
  ('00000000-0000-4000-8000-000000000610', '00000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000710', 'Housewarming set wrapping details are confirmed.', NOW()),
  ('00000000-0000-4000-8000-000000000611', '00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000711', 'Dining bench quality check passed.', NOW()),
  ('00000000-0000-4000-8000-000000000612', '00000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000113', '00000000-0000-4000-8000-000000000712', 'Coffee table dispatch is scheduled for tomorrow.', NULL),
  ('00000000-0000-4000-8000-000000000613', '00000000-0000-4000-8000-000000000113', '00000000-0000-4000-8000-000000000114', '00000000-0000-4000-8000-000000000713', 'Oak wardrobe customer confirmed receipt.', NOW()),
  ('00000000-0000-4000-8000-000000000614', '00000000-0000-4000-8000-000000000114', '00000000-0000-4000-8000-000000000115', '00000000-0000-4000-8000-000000000714', 'Please confirm the cane chair cushion color.', NULL),
  ('00000000-0000-4000-8000-000000000615', '00000000-0000-4000-8000-000000000115', '00000000-0000-4000-8000-000000000116', '00000000-0000-4000-8000-000000000715', 'Executive desk quote is waiting for customer approval.', NOW()),
  ('00000000-0000-4000-8000-000000000616', '00000000-0000-4000-8000-000000000116', '00000000-0000-4000-8000-000000000117', '00000000-0000-4000-8000-000000000716', 'Walnut TV console manufacturing is in polishing.', NULL),
  ('00000000-0000-4000-8000-000000000617', '00000000-0000-4000-8000-000000000117', '00000000-0000-4000-8000-000000000118', '00000000-0000-4000-8000-000000000717', 'Rosewood console is ready for delivery handoff.', NOW()),
  ('00000000-0000-4000-8000-000000000618', '00000000-0000-4000-8000-000000000118', '00000000-0000-4000-8000-000000000119', '00000000-0000-4000-8000-000000000718', 'Serving board order has been shipped.', NOW()),
  ('00000000-0000-4000-8000-000000000619', '00000000-0000-4000-8000-000000000119', '00000000-0000-4000-8000-000000000120', '00000000-0000-4000-8000-000000000719', 'Jewelry stand quotation expired and needs a refresh.', NULL),
  ('00000000-0000-4000-8000-000000000620', '00000000-0000-4000-8000-000000000120', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000720', 'Planter stand delivery is pending final route assignment.', NULL);

COMMIT;
