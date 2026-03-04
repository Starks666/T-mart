import { Product, Category } from '../types';

export const CATEGORIES: Category[] = ['Audio', 'Computing', 'Wearables', 'Smart Home'];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Aether Pods Pro',
    description: 'Next-generation spatial audio with neural noise cancellation. Experience sound like never before with our proprietary bio-acoustic drivers.',
    price: 299,
    category: 'Audio',
    image: 'https://picsum.photos/seed/audio1/800/800',
    images: [
      'https://picsum.photos/seed/audio1/800/800',
      'https://picsum.photos/seed/audio2/800/800',
      'https://picsum.photos/seed/audio3/800/800',
    ],
    rating: 4.9,
    reviews: 1240,
    stock: 45,
    featured: true,
    specs: {
      'Battery Life': '40 Hours',
      'Connectivity': 'Bluetooth 5.3',
      'Water Resistance': 'IPX7',
      'Weight': '5.4g per bud'
    }
  },
  {
    id: '2',
    name: 'Quantum Core Laptop',
    description: 'The ultimate workstation for creators. Powered by the M3-X Neural Engine and a 120Hz Liquid Retina XDR display.',
    price: 2499,
    category: 'Computing',
    image: 'https://picsum.photos/seed/laptop1/800/800',
    images: [
      'https://picsum.photos/seed/laptop1/800/800',
      'https://picsum.photos/seed/laptop2/800/800',
    ],
    rating: 4.8,
    reviews: 850,
    stock: 12,
    featured: true,
    specs: {
      'Processor': 'Quantum X1',
      'RAM': '64GB Unified',
      'Storage': '2TB SSD',
      'Display': '16" OLED 120Hz'
    }
  },
  {
    id: '3',
    name: 'Horizon Watch Ultra',
    description: 'A rugged, capable timepiece designed for the extremes. Titanium casing and sapphire crystal glass.',
    price: 799,
    category: 'Wearables',
    image: 'https://picsum.photos/seed/watch1/800/800',
    images: [
      'https://picsum.photos/seed/watch1/800/800',
      'https://picsum.photos/seed/watch2/800/800',
    ],
    rating: 4.7,
    reviews: 2100,
    stock: 88,
    featured: true,
    specs: {
      'Material': 'Aerospace Titanium',
      'Battery': '72 Hours',
      'Sensors': 'ECG, SpO2, Temp',
      'Depth': '100m Water Resistant'
    }
  },
  {
    id: '4',
    name: 'Nebula Smart Hub',
    description: 'Control your entire ecosystem with a simple voice command or gesture. The brain of your futuristic home.',
    price: 199,
    category: 'Smart Home',
    image: 'https://picsum.photos/seed/home1/800/800',
    images: [
      'https://picsum.photos/seed/home1/800/800',
    ],
    rating: 4.6,
    reviews: 450,
    stock: 156,
    specs: {
      'Display': '7" Touchscreen',
      'Speakers': 'Dual 10W Drivers',
      'Connectivity': 'Matter, Thread, Zigbee',
      'Camera': '12MP Wide Angle'
    }
  },
  {
    id: '5',
    name: 'Sonic Beam Soundbar',
    description: 'Immersive Dolby Atmos sound that fills the room. Sleek, minimalist design that blends into any interior.',
    price: 599,
    category: 'Audio',
    image: 'https://picsum.photos/seed/audio4/800/800',
    images: [
      'https://picsum.photos/seed/audio4/800/800',
    ],
    rating: 4.8,
    reviews: 320,
    stock: 24,
    specs: {
      'Channels': '7.1.2 Surround',
      'Power': '500W Peak',
      'Inputs': 'HDMI eARC, Optical',
      'Wireless': 'AirPlay 2, Cast'
    }
  },
  {
    id: '6',
    name: 'Titan Desktop Pro',
    description: 'Unmatched performance for heavy rendering and data processing. The pinnacle of desktop computing.',
    price: 3999,
    category: 'Computing',
    image: 'https://picsum.photos/seed/pc1/800/800',
    images: [
      'https://picsum.photos/seed/pc1/800/800',
    ],
    rating: 4.9,
    reviews: 120,
    stock: 5,
    specs: {
      'GPU': 'RTX 5090 Ti',
      'CPU': 'Threadripper 7000',
      'Cooling': 'Liquid Nitrogen Loop',
      'Power': '1500W Platinum'
    }
  }
];
