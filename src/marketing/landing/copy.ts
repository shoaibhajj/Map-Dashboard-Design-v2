import type { Lang } from '../../i18n/strings'

export type LayerId = 'asset' | 'device' | 'data' | 'decision'
export type FieldId = 'gnss' | 'speed' | 'fuel' | 'weight' | 'wasl' | 'camera'
export type LensId = 'fleet' | 'group' | 'vehicle' | 'trip'
export type ModuleId = 'map' | 'dashboard' | 'vehicles' | 'ads'

interface LandingCopy {
  nav: { system: string; signal: string; continuity: string; console: string; login: string; open: string; create: string }
  hero: {
    eyebrow: string
    titleA: string
    titleB: string
    body: string
    ctaPrimaryGuest: string
    ctaPrimaryAuth: string
    ctaSecondary: string
    demoNote: string
    stageLabel: string
    pause: string
    play: string
  }
  layers: Record<LayerId, { name: string; line: string }>
  signal: {
    kicker: string
    title: string
    body: string
    packetLabel: string
    packetTime: string
    readingsLabel: string
    disclaimer: string
    updated: string
    older: string
    fields: Record<FieldId, { raw: string; label: string; value: string; time: string; older?: boolean }>
  }
  lens: {
    kicker: string
    title: string
    body: string
    tablistLabel: string
    stops: Record<LensId, { name: string; caption: string }>
    selected: string
    fieldLabels: { plate: string; driver: string; speed: string; fuel: string; updated: string }
    vehicle: { name: string; plate: string; driver: string; status: string; speed: string; fuel: string; updated: string; group: string }
    groups: { root: string; a: string; b: string; c: string; a1: string; a2: string; vehicles: string }
    trip: { depot: string; stop1: string; stop2: string; now: string }
    demo: string
  }
  modules: {
    kicker: string
    title: string
    note: string
    items: Record<ModuleId, { name: string; line: string }>
  }
  closing: { title: string; body: string; primaryGuest: string; primaryAuth: string; secondary: string }
  footer: { tagline: string; status: string; product: string; company: string; legal: string; copyright: string }
}

export const landingCopy: Record<Lang, LandingCopy> = {
  en: {
    nav: { system: 'System', signal: 'Signal', continuity: 'Continuity', console: 'Console', login: 'Log in', open: 'Open console', create: 'Create account' },
    hero: {
      eyebrow: 'Connected fleet operations',
      titleA: 'Every asset,',
      titleB: 'connected to a decision.',
      body: 'TripMonitor links the vehicle, the device on board, the readings it sends and the map your operators work from — one continuous chain from the road to the control room.',
      ctaPrimaryGuest: 'Create an account',
      ctaPrimaryAuth: 'Open the console',
      ctaSecondary: 'Follow the signal',
      demoNote: 'Design preview · illustrated with demo data',
      stageLabel: 'Illustration: four stacked layers — a vehicle on the road, the tracker and sensors on board, the packet and readings they produce, and the operator map — joined by one signal path.',
      pause: 'Pause animation',
      play: 'Play animation',
    },
    layers: {
      asset: { name: 'Asset', line: 'The vehicle, its driver and its place on the road.' },
      device: { name: 'Device', line: 'Tracker and sensors: GNSS, fuel, weight, camera.' },
      data: { name: 'Data', line: 'Packets decoded into readings with their own times.' },
      decision: { name: 'Decision', line: 'The map and detail an operator acts on.' },
    },
    signal: {
      kicker: 'Signal',
      title: 'A packet arrives. Meaning is assembled.',
      body: 'Devices report raw values. TripMonitor keeps the packet time and the update time of each reading separate, so a fresh GPS fix never makes an older weight or WASL reading look current.',
      packetLabel: 'Raw packet',
      packetTime: 'received 11:27:04',
      readingsLabel: 'Interpreted readings',
      disclaimer: 'Simplified illustration with demo values — not a device protocol.',
      updated: 'updated',
      older: 'older than packet',
      fields: {
        gnss: { raw: 'GNSS 24.71362,46.67531 SAT=12', label: 'Position', value: '24.7136, 46.6753 · 12 sat', time: '11:27:04' },
        speed: { raw: 'SPD 062', label: 'Speed', value: '62 km/h', time: '11:27:04' },
        fuel: { raw: 'FUEL 0x4B', label: 'Fuel', value: '75 %', time: '11:27:04' },
        weight: { raw: 'WGT 08.8/12.0', label: 'Load weight', value: '8.8 t of 12 t', time: '11:27:00', older: true },
        wasl: { raw: 'WASL 1', label: 'WASL link', value: 'Connected', time: '11:15:00', older: true },
        camera: { raw: 'CAM 1', label: 'Camera', value: 'Working', time: '11:27:04' },
      },
    },
    lens: {
      kicker: 'Continuity',
      title: 'From the whole fleet to one trip, without losing your place.',
      body: 'Selection carries through every level. The vehicle you pick in a group is the same one you open, and the same one whose trip you replay.',
      tablistLabel: 'Zoom level',
      stops: {
        fleet: { name: 'Fleet', caption: 'Every vehicle, clustered by where it is.' },
        group: { name: 'Group', caption: 'Choosing a parent group includes all of its descendants.' },
        vehicle: { name: 'Vehicle', caption: 'Identity, state and freshness before detail.' },
        trip: { name: 'Trip', caption: 'Route, stops and speed over time.' },
      },
      selected: 'selected',
      fieldLabels: { plate: 'Plate', driver: 'Driver', speed: 'Speed', fuel: 'Fuel', updated: 'Last update' },
      vehicle: { name: 'Riyadh Hauler 07', plate: 'RUH 4821', driver: 'Khalid A.', status: 'Moving', speed: '62 km/h', fuel: '75 %', updated: '12 sec ago', group: 'North Logistics' },
      groups: { root: 'All vehicles', a: 'North Logistics', b: 'Central Delivery', c: 'Service Vans', a1: 'Heavy trucks', a2: 'Light vans', vehicles: 'vehicles' },
      trip: { depot: 'Depot', stop1: 'Stop · Olaya', stop2: 'Stop · Malqa', now: 'Now' },
      demo: 'Demo fleet',
    },
    modules: {
      kicker: 'Console',
      title: 'The surfaces your team works in.',
      note: 'Console routes require sign-in. They currently run on demo data.',
      items: {
        map: { name: 'Live map', line: 'Vehicles, clusters and selected-vehicle detail on one map.' },
        dashboard: { name: 'Dashboard', line: 'Fleet status, weekly activity, recent trips and alerts.' },
        vehicles: { name: 'Vehicles', line: 'Each vehicle with its telemetry, sensors, driver and group.' },
        ads: { name: 'Advertisements', line: 'Campaigns and their performance across the fleet.' },
      },
    },
    closing: {
      title: 'Walk the chain yourself.',
      body: 'Open the console and trace one vehicle from the map to its readings and back.',
      primaryGuest: 'Create an account',
      primaryAuth: 'Open the console',
      secondary: 'Log in',
    },
    footer: {
      tagline: 'Connected fleet operations — from the device to the decision.',
      status: 'Design preview · demo data',
      product: 'Product',
      company: 'Company',
      legal: 'Legal',
      copyright: '© 2026 TripMonitor. All rights reserved.',
    },
  },
  ar: {
    nav: { system: 'المنظومة', signal: 'الإشارة', continuity: 'الاستمرارية', console: 'لوحة التشغيل', login: 'تسجيل الدخول', open: 'افتح لوحة التشغيل', create: 'أنشئ حسابًا' },
    hero: {
      eyebrow: 'تشغيل أسطول متصل',
      titleA: 'كل أصل',
      titleB: 'متصل بقرار.',
      body: 'تربط TripMonitor المركبة والجهاز المثبّت عليها والقراءات التي يرسلها والخريطة التي يعمل منها المشغّل — سلسلة واحدة متصلة من الطريق إلى غرفة التحكم.',
      ctaPrimaryGuest: 'أنشئ حسابًا',
      ctaPrimaryAuth: 'افتح لوحة التشغيل',
      ctaSecondary: 'تتبّع الإشارة',
      demoNote: 'معاينة تصميم · موضّحة ببيانات تجريبية',
      stageLabel: 'رسم توضيحي: أربع طبقات متراصّة — مركبة على الطريق، وجهاز التتبع والحساسات على متنها، والحزمة والقراءات الناتجة، وخريطة المشغّل — يجمعها مسار إشارة واحد.',
      pause: 'إيقاف الحركة',
      play: 'تشغيل الحركة',
    },
    layers: {
      asset: { name: 'الأصل', line: 'المركبة وسائقها وموقعها على الطريق.' },
      device: { name: 'الجهاز', line: 'جهاز التتبع والحساسات: GNSS والوقود والوزن والكاميرا.' },
      data: { name: 'البيانات', line: 'حزم تُفكّ إلى قراءات لكلٍّ منها وقته.' },
      decision: { name: 'القرار', line: 'الخريطة والتفاصيل التي يتصرف بناءً عليها المشغّل.' },
    },
    signal: {
      kicker: 'الإشارة',
      title: 'تصل حزمة، ويتكوّن المعنى.',
      body: 'ترسل الأجهزة قيمًا خامًا. تفصل TripMonitor بين وقت الحزمة ووقت تحديث كل قراءة، فلا يجعل موقعٌ حديث قراءةَ وزنٍ أو ربطَ WASL أقدم تبدو حديثة.',
      packetLabel: 'الحزمة الخام',
      packetTime: 'وصلت 11:27:04',
      readingsLabel: 'القراءات المفسَّرة',
      disclaimer: 'رسم مبسّط بقيم تجريبية — وليس بروتوكول جهاز.',
      updated: 'حُدّثت',
      older: 'أقدم من الحزمة',
      fields: {
        gnss: { raw: 'GNSS 24.71362,46.67531 SAT=12', label: 'الموقع', value: '24.7136, 46.6753 · 12 قمرًا', time: '11:27:04' },
        speed: { raw: 'SPD 062', label: 'السرعة', value: '62 كم/س', time: '11:27:04' },
        fuel: { raw: 'FUEL 0x4B', label: 'الوقود', value: '75 %', time: '11:27:04' },
        weight: { raw: 'WGT 08.8/12.0', label: 'وزن الحمولة', value: '8.8 طن من 12 طن', time: '11:27:00', older: true },
        wasl: { raw: 'WASL 1', label: 'ربط وصل', value: 'متصل', time: '11:15:00', older: true },
        camera: { raw: 'CAM 1', label: 'الكاميرا', value: 'تعمل', time: '11:27:04' },
      },
    },
    lens: {
      kicker: 'الاستمرارية',
      title: 'من الأسطول كله إلى رحلة واحدة، دون أن تفقد مكانك.',
      body: 'يبقى الاختيار ثابتًا عبر كل مستوى. المركبة التي تختارها داخل مجموعة هي نفسها التي تفتح تفاصيلها، وهي نفسها التي تعيد عرض رحلتها.',
      tablistLabel: 'مستوى التكبير',
      stops: {
        fleet: { name: 'الأسطول', caption: 'كل المركبات، مجمّعة حسب موقعها.' },
        group: { name: 'المجموعة', caption: 'اختيار مجموعة رئيسية يشمل كل ما يتفرّع منها.' },
        vehicle: { name: 'المركبة', caption: 'الهوية والحالة وحداثة البيانات قبل التفاصيل.' },
        trip: { name: 'الرحلة', caption: 'المسار والتوقفات والسرعة عبر الزمن.' },
      },
      selected: 'محددة',
      fieldLabels: { plate: 'اللوحة', driver: 'السائق', speed: 'السرعة', fuel: 'الوقود', updated: 'آخر تحديث' },
      vehicle: { name: 'ناقلة الرياض 07', plate: 'RUH 4821', driver: 'خالد ع.', status: 'متحركة', speed: '62 كم/س', fuel: '75 %', updated: 'قبل 12 ثانية', group: 'لوجستيات الشمال' },
      groups: { root: 'كل المركبات', a: 'لوجستيات الشمال', b: 'توصيل الوسط', c: 'مركبات الخدمة', a1: 'شاحنات ثقيلة', a2: 'شاحنات خفيفة', vehicles: 'مركبة' },
      trip: { depot: 'المستودع', stop1: 'توقف · العليا', stop2: 'توقف · الملقا', now: 'الآن' },
      demo: 'أسطول تجريبي',
    },
    modules: {
      kicker: 'لوحة التشغيل',
      title: 'الواجهات التي يعمل فيها فريقك.',
      note: 'تتطلب صفحات لوحة التشغيل تسجيل الدخول، وتعمل حاليًا ببيانات تجريبية.',
      items: {
        map: { name: 'الخريطة المباشرة', line: 'المركبات والتجمعات وتفاصيل المركبة المحددة على خريطة واحدة.' },
        dashboard: { name: 'لوحة المؤشرات', line: 'حالة الأسطول والنشاط الأسبوعي وآخر الرحلات والتنبيهات.' },
        vehicles: { name: 'المركبات', line: 'كل مركبة مع قياساتها وحساساتها وسائقها ومجموعتها.' },
        ads: { name: 'الإعلانات', line: 'الحملات وأداؤها عبر الأسطول.' },
      },
    },
    closing: {
      title: 'امشِ في السلسلة بنفسك.',
      body: 'افتح لوحة التشغيل وتتبّع مركبة واحدة من الخريطة إلى قراءاتها ثم عُد.',
      primaryGuest: 'أنشئ حسابًا',
      primaryAuth: 'افتح لوحة التشغيل',
      secondary: 'تسجيل الدخول',
    },
    footer: {
      tagline: 'تشغيل أسطول متصل — من الجهاز إلى القرار.',
      status: 'معاينة تصميم · بيانات تجريبية',
      product: 'المنتج',
      company: 'الشركة',
      legal: 'قانوني',
      copyright: '© 2026 TripMonitor. جميع الحقوق محفوظة.',
    },
  },
}

export const LAYER_ORDER: LayerId[] = ['asset', 'device', 'data', 'decision']
export const FIELD_ORDER: FieldId[] = ['gnss', 'speed', 'fuel', 'weight', 'wasl', 'camera']
export const LENS_ORDER: LensId[] = ['fleet', 'group', 'vehicle', 'trip']
