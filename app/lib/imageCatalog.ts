import { ViolationType, ProductType, ErrorCategory } from '../types/agent';

export interface ImageMetadata {
  filename: string;
  path: string;
  productType: ProductType;
  errorCategory: ErrorCategory;
  violations: ViolationType[];
  description: string;
  expectedDecision: 'pass' | 'fail';
}

// This will be populated as you create images in Blender
export const IMAGE_CATALOG: ImageMetadata[] = [
  // GOOD PRODUCTS - Should Pass
  {
    filename: '84-day-no-price-good-1.jpg',
    path: '/images/good/84-day-no-price-good-1.jpg',
    productType: '84_day_no_price',
    errorCategory: 'good',
    violations: ['none'],
    description: '84-day product, no price marking, code date correctly positioned',
    expectedDecision: 'pass',
  },
  {
    filename: '84-day-price-good-1.jpg',
    path: '/images/good/84-day-price-good-1.jpg',
    productType: '84_day_price',
    errorCategory: 'good',
    violations: ['none'],
    description: '84-day product with price, code date correctly positioned',
    expectedDecision: 'pass',
  },
  {
    filename: '90-day-no-price-good-1.jpg',
    path: '/images/good/90-day-no-price-good-1.jpg',
    productType: '90_day_no_price',
    errorCategory: 'good',
    violations: ['none'],
    description: '90-day product, no price marking, code date correctly positioned',
    expectedDecision: 'pass',
  },
  {
    filename: '90-day-price-good-1.jpg',
    path: '/images/good/90-day-price-good-1.jpg',
    productType: '90_day_price',
    errorCategory: 'good',
    violations: ['none'],
    description: '90-day product with price, code date correctly positioned',
    expectedDecision: 'pass',
  },

  // POSITIONING ERRORS - Should Fail
  {
    filename: '84-day-off-bellmark-1.jpg',
    path: '/images/bad/positioning/84-day-off-bellmark-1.jpg',
    productType: '84_day_no_price',
    errorCategory: 'positioning',
    violations: ['code_date_off_bellmark'],
    description: 'Code date moved too far from bellmark - positioning violation',
    expectedDecision: 'fail',
  },
  {
    filename: '90-day-on-bellmark-1.jpg',
    path: '/images/bad/positioning/90-day-on-bellmark-1.jpg',
    productType: '90_day_no_price',
    errorCategory: 'positioning',
    violations: ['code_date_on_bellmark'],
    description: 'Code date printed ON bellmark - AUTOMATIC HOLD - critical violation',
    expectedDecision: 'fail',
  },

  // QUALITY ERRORS - Should Fail
  {
    filename: '84-day-faded-print-1.jpg',
    path: '/images/bad/quality/84-day-faded-print-1.jpg',
    productType: '84_day_no_price',
    errorCategory: 'quality',
    violations: ['faded_print'],
    description: 'Faded or smudged print - quality control failure',
    expectedDecision: 'fail',
  },

  // INCORRECT MARKING ERRORS - Should Fail
  {
    filename: '84-day-wrong-type-1.jpg',
    path: '/images/bad/incorrect/84-day-wrong-type-1.jpg',
    productType: '84_day_no_price',
    errorCategory: 'incorrect_marking',
    violations: ['wrong_code_type'],
    description: '90-day code on 84-day product - type mismatch',
    expectedDecision: 'fail',
  },
  {
    filename: '84-day-missing-price-1.jpg',
    path: '/images/bad/incorrect/84-day-missing-price-1.jpg',
    productType: '84_day_price',
    errorCategory: 'incorrect_marking',
    violations: ['wrong_price_marking'],
    description: 'Should have price marking but missing - marking violation',
    expectedDecision: 'fail',
  },
  {
    filename: '90-day-wrong-price-1.jpg',
    path: '/images/bad/incorrect/90-day-wrong-price-1.jpg',
    productType: '90_day_no_price',
    errorCategory: 'incorrect_marking',
    violations: ['wrong_price_marking'],
    description: 'Has price marking when it should not - marking violation',
    expectedDecision: 'fail',
  },
];

export function getImagesByCategory(category: ErrorCategory): ImageMetadata[] {
  return IMAGE_CATALOG.filter(img => img.errorCategory === category);
}

export function getImagesByProductType(productType: ProductType): ImageMetadata[] {
  return IMAGE_CATALOG.filter(img => img.productType === productType);
}

export function getAllGoodImages(): ImageMetadata[] {
  return IMAGE_CATALOG.filter(img => img.expectedDecision === 'pass');
}

export function getAllBadImages(): ImageMetadata[] {
  return IMAGE_CATALOG.filter(img => img.expectedDecision === 'fail');
}

export function getRandomImages(count: number): ImageMetadata[] {
  const shuffled = [...IMAGE_CATALOG].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// For demo: repeat each image 5 times to simulate production line
export function getImageSequenceForDemo(images: ImageMetadata[]): ImageMetadata[] {
  const sequence: ImageMetadata[] = [];
  images.forEach(img => {
    for (let i = 0; i < 5; i++) {
      sequence.push(img);
    }
  });
  return sequence;
}
