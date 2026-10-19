import type { Vehicle } from '../types'

export const mockVehicles: Vehicle[] = [
  {
    id: '1', name: 'Toyota Hilux', plate: 'AVX 1122', type: 'pickup', status: 'moving',
    driver: { name: 'أحمد العتيبي', initials: 'أع', color: '#0a6b5a' },
    lastSeen: 'منذ 3 دقائق', location: 'الرياض',
    fuel: 85, speed: 85, battery: 92, signal: 'قوية', distance: 128, lastTrip: 'طريق الملك فهد',
  },
  {
    id: '2', name: 'Isuzu D-Max', plate: '2345', type: 'pickup', status: 'needs_attention',
    driver: { name: 'خالد المطيري', initials: 'خم', color: '#3a5a8a' },
    lastSeen: 'منذ 21 دقيقة', location: 'الرياض',
    fuel: 8, speed: 0, battery: 78, signal: 'متوسطة', distance: 45, lastTrip: 'الدائري الشمالي',
  },
  {
    id: '3', name: 'Toyota Camry', plate: '456', type: 'sedan', status: 'stopped',
    driver: { name: 'محمد السلمان', initials: 'مس', color: '#7a4a2a' },
    lastSeen: 'منذ ساعتين', location: 'جدة',
    fuel: 12, speed: 0, battery: 65, signal: 'ضعيفة', distance: 23, lastTrip: 'شارع الأمير محمد',
  },
  {
    id: '4', name: 'Nissan Patrol', plate: 'NNS', type: 'suv', status: 'moving',
    driver: { name: 'سعد القحطاني', initials: 'سق', color: '#6a2a7a' },
    lastSeen: 'منذ 5 دقائق', location: 'الدمام',
    fuel: 72, speed: 95, battery: 88, signal: 'قوية', distance: 67, lastTrip: 'طريق الملك عبدالعزيز',
  },
  {
    id: '5', name: 'Ford Transit', plate: 'CA-7743', type: 'van', status: 'moving',
    driver: { name: 'ماجد العنزي', initials: 'مع', color: '#2a4a7a' },
    lastSeen: 'منذ 10 دقائق', location: 'الرياض',
    fuel: 90, speed: 65, battery: 94, signal: 'قوية', distance: 89, lastTrip: 'طريق الملك فهد',
  },
  {
    id: '6', name: 'Nissan Sunny', plate: '3456', type: 'sedan', status: 'stopped',
    driver: { name: 'ريم عبدالله', initials: 'رع', color: '#7a2a4a' },
    lastSeen: 'منذ ساعة', location: 'جدة',
    fuel: 5, speed: 0, battery: 55, signal: 'ضعيفة', distance: 12, lastTrip: 'شارع التحلية',
  },
  {
    id: '7', name: 'Toyota Hilux', plate: '7788', type: 'pickup', status: 'needs_attention',
    driver: { name: 'عبدالله سالم', initials: 'عس', color: '#3b7d75' },
    lastSeen: 'منذ 45 دقيقة', location: 'الرياض',
    fuel: 3, speed: 0, battery: 72, signal: 'متوسطة', distance: 34, lastTrip: 'الطريق السريع',
  },
  {
    id: '8', name: 'Isuzu D-Max', plate: '5500', type: 'pickup', status: 'moving',
    driver: { name: 'فهد الشهري', initials: 'فش', color: '#2a7a7a' },
    lastSeen: 'منذ 7 دقائق', location: 'الدمام',
    fuel: 68, speed: 78, battery: 86, signal: 'قوية', distance: 55, lastTrip: 'الطريق الساحلي',
  },
  {
    id: '9', name: 'Lexus LX 600', plate: '9901', type: 'suv', status: 'moving',
    driver: { name: 'ناصر العتيبي', initials: 'نع', color: '#7a6a2a' },
    lastSeen: 'منذ 4 دقائق', location: 'الرياض',
    fuel: 90, speed: 72, battery: 95, signal: 'قوية', distance: 113, lastTrip: 'طريق الملك سلمان',
  },
  {
    id: '10', name: 'Hyundai H1', plate: '3344', type: 'van', status: 'stopped',
    driver: { name: 'علي الحربي', initials: 'عح', color: '#5a2a7a' },
    lastSeen: 'منذ ساعتين', location: 'الخبر',
    fuel: 2, speed: 0, battery: 48, signal: 'ضعيفة', distance: 8, lastTrip: 'شارع الخليج',
  },
  {
    id: '11', name: 'Toyota Corolla', plate: '7781', type: 'sedan', status: 'moving',
    driver: { name: 'خالد العتيبي', initials: 'خع', color: '#2a6a66' },
    lastSeen: 'منذ 9 دقائق', location: 'الرياض',
    fuel: 55, speed: 68, battery: 79, signal: 'قوية', distance: 44, lastTrip: 'طريق الأمير سلطان',
  },
  {
    id: '12', name: 'Land Cruiser', plate: '2200', type: 'suv', status: 'needs_attention',
    driver: { name: 'عبدالمجيد', initials: 'عم', color: '#7a2a2a' },
    lastSeen: 'منذ 36 دقيقة', location: 'جدة',
    fuel: 6, speed: 0, battery: 61, signal: 'ضعيفة', distance: 29, lastTrip: 'طريق المدينة المنورة',
  },
]
