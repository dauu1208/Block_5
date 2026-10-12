// Mock data: xóa & tạo lại bảng từ model (code-first) rồi thêm dữ liệu mẫu.
require('dotenv').config();
const { sequelize, Dish, Chef, Ingredient } = require('../src/models');

(async () => {
  await sequelize.sync({ force: true });

  const [an, binh] = await Chef.bulkCreate(
    [
      { name: 'Nguyễn Văn An', specialty: 'Món Huế' },
      { name: 'Trần Thị Bình', specialty: 'Món Ý' },
    ],
    { returning: true }
  );

  const ing = await Ingredient.bulkCreate(
    [
      { name: 'Thịt bò', unit: 'kg' },
      { name: 'Bánh phở', unit: 'kg' },
      { name: 'Hành lá', unit: 'g' },
      { name: 'Mì Ý', unit: 'g' },
      { name: 'Cà chua', unit: 'kg' },
      { name: 'Trứng gà', unit: 'quả' },
    ],
    { returning: true }
  );

  const phoBo = await Dish.create({ name: 'Phở bò', description: 'Phở bò nước dùng hầm xương 12 tiếng.', price: 65000, category: 'Món chính', available: true, chefId: an.id });
  const spaghetti = await Dish.create({ name: 'Spaghetti sốt cà', description: 'Mì Ý sốt cà chua tươi.', price: 89000, category: 'Món chính', available: true, chefId: binh.id });
  await Dish.create({ name: 'Trứng chiên hành', description: 'Món ăn nhanh.', price: 30000, category: 'Khai vị', available: false });

  await phoBo.setIngredients([ing[0], ing[1], ing[2]]);
  await spaghetti.setIngredients([ing[3], ing[4]]);

  console.log('Seed xong.');
  await sequelize.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
