-- Demo seed data for admin dashboard (customers, orders, inventory movements)
-- Run after schema.sql and seed_products.sql

begin;

insert into public.profiles (id, email, name, phone, role, loyalty_points, tier, join_date)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'admin@uniqlo.vn', 'Quản trị viên', '0901000111', 'admin', 5000, 'Admin', now() - interval '360 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', 'editor@uniqlo.vn', 'Editor Demo', '0902000222', 'editor', 3200, 'Editor', now() - interval '210 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003', 'viewer@uniqlo.vn', 'Viewer Demo', '0903000333', 'viewer', 1800, 'Viewer', now() - interval '120 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001', 'customer.one@example.com', 'Nguyễn Văn A', '0904000444', 'customer', 1200, 'VIP', now() - interval '90 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002', 'customer.two@example.com', 'Trần Thị B', '0905000555', 'customer', 800, 'Member', now() - interval '60 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003', 'customer.three@example.com', 'Lê C', '0906000666', 'customer', 640, 'Member', now() - interval '40 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0004', 'customer.four@example.com', 'Phạm D', '0908000888', 'customer', 450, 'Member', now() - interval '25 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0005', 'customer.five@example.com', 'Võ E', '0909000999', 'customer', 300, 'Member', now() - interval '15 days')
on conflict (id) do update set
  email = excluded.email,
  name = excluded.name,
  phone = excluded.phone,
  role = excluded.role,
  loyalty_points = excluded.loyalty_points,
  tier = excluded.tier,
  join_date = excluded.join_date;

insert into public.orders (
  id, user_id, customer_name, customer_email, customer_phone, shipping_address,
  payment_method, status, note, tracking_number, source, metadata,
  total, items_count, date, last_status_change
)
values
  ('cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001', 'Nguyễn Văn A', 'customer.one@example.com', '0904000444', '12 Nguyễn Trãi, Hà Nội', 'cod', 'Đang giao', 'Đang vận chuyển đi Hà Nội', 'VNPOST0001', 'website', jsonb_build_object('channel', 'web'), 1590000, 3, now() - interval '2 days', now() - interval '1 days'),
  ('cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002', 'Trần Thị B', 'customer.two@example.com', '0905000555', '25 Lê Lợi, Đà Nẵng', 'card', 'Chờ xử lý', 'Chờ xác nhận kho', null, 'website', jsonb_build_object('channel', 'web'), 890000, 2, now() - interval '1 day', now() - interval '1 day'),
  ('cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003', 'Lê C', 'customer.three@example.com', '0906000666', '78 Pasteur, TP.HCM', 'cod', 'Đã giao', 'Khách đã nhận đủ hàng', 'GHN0003', 'website', jsonb_build_object('channel', 'mobile'), 2190000, 4, now() - interval '5 days', now() - interval '2 days'),
  ('cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0004', null, 'Walk-in Customer', 'walkin@example.com', '0907000777', 'Online order', 'cod', 'Đang chuẩn bị', 'Đơn ưu tiên flash sale', null, 'website', jsonb_build_object('channel', 'web'), 650000, 1, now() - interval '6 hours', now() - interval '6 hours'),
  ('cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0004', 'Phạm D', 'customer.four@example.com', '0908000888', '150 Nguyễn Huệ, TP.HCM', 'card', 'Đã giao', 'Khách nhận tại cửa hàng', 'HCMSTORE05', 'store', jsonb_build_object('channel', 'store'), 1320000, 2, now() - interval '12 days', now() - interval '9 days'),
  ('cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002', 'Trần Thị B', 'customer.two@example.com', '0905000555', '25 Lê Lợi, Đà Nẵng', 'cod', 'Đã hủy', 'Khách đổi ý', null, 'website', jsonb_build_object('channel', 'web'), 450000, 1, now() - interval '14 days', now() - interval '14 days'),
  ('cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0007', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0005', 'Võ E', 'customer.five@example.com', '0909000999', '88 Phan Đăng Lưu, Đà Nẵng', 'card', 'Đang giao', 'Đã rời kho Đà Nẵng', 'VNPOST0007', 'mobile', jsonb_build_object('channel', 'mobile'), 980000, 2, now() - interval '18 days', now() - interval '1 days'),
  ('cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0008', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001', 'Nguyễn Văn A', 'customer.one@example.com', '0904000444', '12 Nguyễn Trãi, Hà Nội', 'card', 'Đã giao', 'Đơn đặt đầu tháng', 'VNPOST0008', 'website', jsonb_build_object('channel', 'web'), 1750000, 3, now() - interval '30 days', now() - interval '27 days')
on conflict (id) do update set
  status = excluded.status,
  note = excluded.note,
  tracking_number = excluded.tracking_number,
  source = excluded.source,
  metadata = excluded.metadata,
  total = excluded.total,
  items_count = excluded.items_count,
  date = excluded.date,
  last_status_change = excluded.last_status_change;

insert into public.order_items (id, order_id, product_id, product_name, quantity, price)
values
  ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaa0001', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0001', 'men-tshirt-1', 'Áo T-shirt Nam Cotton Premium', 2, 290000),
  ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaa0002', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0001', 'men-jean-1', 'Quần Jean Nam Regular Fit', 1, 450000),
  ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaa0003', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0002', 'women-dress-1', 'Đầm Midi Nữ Linen', 1, 690000),
  ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaa0004', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0002', 'women-tshirt-1', 'Áo T-shirt Nữ Essential', 1, 200000),
  ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaa0005', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0003', 'kids-jacket-1', 'Áo Khoác Bé Trai', 2, 590000),
  ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaa0006', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0003', 'kids-jean-1', 'Quần Jean Bé Trai', 2, 390000),
  ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaa0007', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0004', 'men-polo-1', 'Áo Polo Nam Cotton Pique', 1, 390000),
  ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaa0008', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0005', 'women-dress-2', 'Đầm Linen Oversize', 1, 820000),
  ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaa0009', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0005', 'women-cardigan-1', 'Cardigan Len Mỏng', 1, 500000),
  ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaa0010', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0006', 'women-jean-1', 'Quần Jean Nữ Slim Fit', 1, 450000),
  ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaa0011', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0007', 'kids-dress-1', 'Đầm Công Chúa Bé Gái', 1, 450000),
  ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaa0012', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0007', 'kids-jean-2', 'Quần Jean Bé Gái', 1, 390000),
  ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaa0013', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0008', 'men-shirt-1', 'Áo Sơ Mi Nam Oxford', 1, 690000),
  ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaa0014', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0008', 'men-polo-2', 'Áo Polo Nam Dry Pique', 1, 450000),
  ('dddddddd-aaaa-aaaa-aaaa-aaaaaaaa0015', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0008', 'men-jean-2', 'Quần Jean Nam Slim Fit', 1, 610000)
on conflict (id) do update set
  quantity = excluded.quantity,
  price = excluded.price;

insert into public.order_status_history (id, order_id, status, note, changed_by, changed_at)
values
  ('eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaa0001', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0002', 'Đã xác nhận', 'Kho xác nhận tồn', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', now() - interval '23 hours'),
  ('eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaa0002', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0002', 'Đang chuẩn bị', 'Đang pick hàng', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', now() - interval '22 hours'),
  ('eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaa0003', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0007', 'Đã xác nhận', 'Đã xác nhận thanh toán', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', now() - interval '2 days'),
  ('eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaa0004', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0006', 'Chờ xử lý', 'Khách yêu cầu đổi', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', now() - interval '14 days'),
  ('eeeeeeee-aaaa-aaaa-aaaa-aaaaaaaa0005', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0006', 'Đã hủy', 'Hủy theo yêu cầu khách', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', now() - interval '13 days')
on conflict (id) do nothing;

insert into public.inventory_movements (id, product_id, change, reason, actor_id, metadata, created_at)
values
  ('ffffffff-aaaa-aaaa-aaaa-aaaaaaaa0001', 'men-tshirt-1', -5, 'Bán hàng', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', jsonb_build_object('order_id', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0001'), now() - interval '2 days'),
  ('ffffffff-aaaa-aaaa-aaaa-aaaaaaaa0002', 'men-tshirt-1', 30, 'Nhập kho', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', jsonb_build_object('vendor', 'UNQ Supplier'), now() - interval '7 days'),
  ('ffffffff-aaaa-aaaa-aaaa-aaaaaaaa0003', 'men-polo-1', -2, 'Bán hàng', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', jsonb_build_object('order_id', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0004'), now() - interval '6 hours'),
  ('ffffffff-aaaa-aaaa-aaaa-aaaaaaaa0004', 'women-dress-1', -3, 'Bán hàng', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', jsonb_build_object('order_id', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0002'), now() - interval '1 days'),
  ('ffffffff-aaaa-aaaa-aaaa-aaaaaaaa0005', 'kids-jacket-1', -4, 'Bán hàng', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', jsonb_build_object('order_id', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0003'), now() - interval '5 days'),
  ('ffffffff-aaaa-aaaa-aaaa-aaaaaaaa0006', 'kids-jacket-1', 20, 'Nhập kho', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', jsonb_build_object('vendor', 'Kids Factory'), now() - interval '10 days'),
  ('ffffffff-aaaa-aaaa-aaaa-aaaaaaaa0007', 'women-cardigan-1', 15, 'Nhập kho', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', jsonb_build_object('vendor', 'Knits Asia'), now() - interval '8 days'),
  ('ffffffff-aaaa-aaaa-aaaa-aaaaaaaa0008', 'women-cardigan-1', -3, 'Bán hàng', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', jsonb_build_object('order_id', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0005'), now() - interval '12 days'),
  ('ffffffff-aaaa-aaaa-aaaa-aaaaaaaa0009', 'men-jean-2', -1, 'Bán hàng', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', jsonb_build_object('order_id', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0008'), now() - interval '30 days')
on conflict (id) do update
set change = excluded.change,
    reason = excluded.reason,
    actor_id = excluded.actor_id,
    metadata = excluded.metadata;

insert into public.admin_activity_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at)
values
  ('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'update_status', 'order', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0001', jsonb_build_object('status', 'Đang giao'), now() - interval '20 hours'),
  ('aaaaaaaa-bbbb-cccc-dddd-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', 'adjust_inventory', 'product', 'men-tshirt-1', jsonb_build_object('change', 30), now() - interval '7 days'),
  ('aaaaaaaa-bbbb-cccc-dddd-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'create_order', 'order', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0004', jsonb_build_object('channel', 'website'), now() - interval '6 hours'),
  ('aaaaaaaa-bbbb-cccc-dddd-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', 'cancel_order', 'order', 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaa0006', jsonb_build_object('reason', 'customer_request'), now() - interval '13 days')
on conflict (id) do update
set action = excluded.action,
    entity_type = excluded.entity_type,
    entity_id = excluded.entity_id,
    metadata = excluded.metadata;

-- sync stock with inventory movements deltas
update public.products p
set stock = greatest(0, p.stock + delta.diff)
from (
  select product_id, coalesce(sum(change), 0) as diff
  from public.inventory_movements
  group by product_id
) as delta
where p.id = delta.product_id;

commit;
