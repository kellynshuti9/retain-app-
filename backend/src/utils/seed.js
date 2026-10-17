import Category from '../models/Category.js';

export const seedDefaultCategory = async () => {
  try {
    const existing = await Category.findOne({ name: 'Uncategorized' });
    if (!existing) {
      await Category.create({ name: 'Uncategorized', isDefault: true });
      console.log('✅ Seeded default "Uncategorized" category');
    } else {
      console.log('ℹ️  "Uncategorized" category already exists');
    }
  } catch (error) {
    console.error('❌ Failed to seed default category:', error.message);
  }
};