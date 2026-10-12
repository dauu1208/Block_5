// Cấu hình CRUD cho 3 model. Mỗi resource mô tả: cột trong bảng, field trong form,
// cách validate dữ liệu (parse) và cách lưu thêm quan hệ (afterSave).
const { Dish, Chef, Ingredient } = require('../models');
const { formatPrice } = require('../utils/format');

const raw = (v) => (typeof v === 'string' ? v : '');
const trim = (v) => raw(v).trim();

const dishes = {
  key: 'dishes',
  model: Dish,
  title: 'Món ăn',
  singular: 'món ăn',
  include: [
    { model: Chef, as: 'chef' },
    { model: Ingredient, as: 'ingredients' },
  ],
  order: [['id', 'ASC']],
  label: (r) => r.name,
  columns: [
    { label: 'Tên', value: (r) => r.name },
    { label: 'Giá', value: (r) => formatPrice(r.price) },
    { label: 'Danh mục', value: (r) => r.category || '—' },
    { label: 'Còn bán', value: (r) => (r.available ? 'Còn' : 'Hết') },
    { label: 'Đầu bếp', value: (r) => (r.chef ? r.chef.name : '—') },
  ],
  fields: [
    { name: 'name', label: 'Tên món', type: 'text' },
    { name: 'description', label: 'Mô tả', type: 'textarea' },
    { name: 'price', label: 'Giá (VNĐ)', type: 'text', inputmode: 'decimal' },
    { name: 'category', label: 'Danh mục', type: 'text' },
    { name: 'available', label: 'Còn bán', type: 'checkbox' },
    { name: 'chefId', label: 'Đầu bếp', type: 'select' },
    { name: 'ingredientIds', label: 'Nguyên liệu', type: 'multiselect' },
  ],
  async loadOptions() {
    const [chefs, ingredients] = await Promise.all([
      Chef.findAll({ order: [['name', 'ASC']] }),
      Ingredient.findAll({ order: [['name', 'ASC']] }),
    ]);
    return {
      chefId: chefs.map((c) => ({ value: String(c.id), label: c.name })),
      ingredientIds: ingredients.map((i) => ({ value: String(i.id), label: `${i.name} (${i.unit})` })),
    };
  },
  toValues(r) {
    return {
      name: r.name,
      description: r.description || '',
      price: String(Number(r.price)),
      category: r.category || '',
      available: r.available,
      chefId: r.chefId ? String(r.chefId) : '',
      ingredientIds: (r.ingredients || []).map((i) => String(i.id)),
    };
  },
  async parse(body) {
    const errors = {};
    const name = trim(body.name);
    const description = trim(body.description);
    const category = trim(body.category);
    const priceRaw = trim(body.price);
    const chefIdRaw = trim(body.chefId);
    const ingredientIds = [].concat(body.ingredientIds ?? []).map(String).filter(Boolean);

    if (!name) errors.name = 'Tên món là bắt buộc';
    else if (name.length > 120) errors.name = 'Tên món tối đa 120 ký tự';

    if (description.length > 1000) errors.description = 'Mô tả tối đa 1000 ký tự';
    if (category.length > 60) errors.category = 'Danh mục tối đa 60 ký tự';

    const price = Number(priceRaw);
    if (priceRaw === '') errors.price = 'Giá là bắt buộc';
    else if (!Number.isFinite(price) || price < 0 || price >= 1e10) errors.price = 'Giá phải là số từ 0 trở lên';

    let chefId = null;
    if (chefIdRaw) {
      if (!/^\d{1,9}$/.test(chefIdRaw) || !(await Chef.findByPk(Number(chefIdRaw)))) {
        errors.chefId = 'Đầu bếp không tồn tại';
      } else {
        chefId = Number(chefIdRaw);
      }
    }

    if (ingredientIds.some((id) => !/^\d{1,9}$/.test(id))) {
      errors.ingredientIds = 'Nguyên liệu không hợp lệ';
    } else if (ingredientIds.length) {
      const unique = [...new Set(ingredientIds.map(Number))];
      const count = await Ingredient.count({ where: { id: unique } });
      if (count !== unique.length) errors.ingredientIds = 'Có nguyên liệu không tồn tại';
    }

    return {
      errors,
      // giá trị người dùng đã nhập, để hiện lại trên form khi trả 400
      values: {
        name: raw(body.name),
        description: raw(body.description),
        price: raw(body.price),
        category: raw(body.category),
        available: body.available === 'on',
        chefId: chefIdRaw,
        ingredientIds,
      },
      data: {
        name,
        description: description || null,
        price,
        category: category || null,
        available: body.available === 'on',
        chefId,
        ingredientIds: [...new Set(ingredientIds.map(Number))],
      },
    };
  },
  async afterSave(record, data) {
    await record.setIngredients(data.ingredientIds);
  },
};

const chefs = {
  key: 'chefs',
  model: Chef,
  title: 'Đầu bếp',
  singular: 'đầu bếp',
  include: [],
  order: [['id', 'ASC']],
  label: (r) => r.name,
  columns: [
    { label: 'Tên', value: (r) => r.name },
    { label: 'Chuyên môn', value: (r) => r.specialty || '—' },
  ],
  fields: [
    { name: 'name', label: 'Tên đầu bếp', type: 'text' },
    { name: 'specialty', label: 'Chuyên môn', type: 'text' },
  ],
  async loadOptions() {
    return {};
  },
  toValues: (r) => ({ name: r.name, specialty: r.specialty || '' }),
  async parse(body) {
    const errors = {};
    const name = trim(body.name);
    const specialty = trim(body.specialty);
    if (!name) errors.name = 'Tên đầu bếp là bắt buộc';
    else if (name.length > 120) errors.name = 'Tên tối đa 120 ký tự';
    if (specialty.length > 120) errors.specialty = 'Chuyên môn tối đa 120 ký tự';
    return {
      errors,
      values: { name: raw(body.name), specialty: raw(body.specialty) },
      data: { name, specialty: specialty || null },
    };
  },
};

const ingredients = {
  key: 'ingredients',
  model: Ingredient,
  title: 'Nguyên liệu',
  singular: 'nguyên liệu',
  include: [],
  order: [['id', 'ASC']],
  label: (r) => r.name,
  columns: [
    { label: 'Tên', value: (r) => r.name },
    { label: 'Đơn vị', value: (r) => r.unit },
  ],
  fields: [
    { name: 'name', label: 'Tên nguyên liệu', type: 'text' },
    { name: 'unit', label: 'Đơn vị (kg, g, lít, quả...)', type: 'text' },
  ],
  async loadOptions() {
    return {};
  },
  toValues: (r) => ({ name: r.name, unit: r.unit }),
  async parse(body) {
    const errors = {};
    const name = trim(body.name);
    const unit = trim(body.unit);
    if (!name) errors.name = 'Tên nguyên liệu là bắt buộc';
    else if (name.length > 120) errors.name = 'Tên tối đa 120 ký tự';
    if (!unit) errors.unit = 'Đơn vị là bắt buộc';
    else if (unit.length > 30) errors.unit = 'Đơn vị tối đa 30 ký tự';
    return {
      errors,
      values: { name: raw(body.name), unit: raw(body.unit) },
      data: { name, unit },
    };
  },
};

module.exports = { dishes, chefs, ingredients };
