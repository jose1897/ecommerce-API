const Sale = require('./model');
const Product = require('../products/model');

const { validateData, validateProduct } = require('./validation');

exports.create = async (req, res) => {
  const { error } = validateData(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const sale = new Sale({ user: req.user });
  try {
    const savedSale = await sale.save();
    res.send(savedSale);
  } catch (err) {
    res.status(400).send({ error: err });
  }
};

exports.index = async (req, res) => {
  if (!req.admin) return res.status(401).send('Access denied');

  try {
    const allSales = await Sale.find({});
    res.send(allSales);
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

exports.addProduct = async (req, res) => {
  console.log(req.params.id);
  try {
    const { error } = validateProduct(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const product = await Product.findById(req.body.products);

    if (!product) return res.status(404).send('Product no found');
    const newProducts = [...req.sale.products, product];
    const sale = await Sale.findByIdAndUpdate(
      req.param.id,
      { products: newProducts },
      {
        new: true,
      }
    );
    res.status(202).send(sale);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.removeProduct = async (req, res) => {
  try {
    const { error } = validateProduct(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const product = await Product.findById(req.body.products);

    if (!product) return res.status(404).send('Product no found');
    const newProducts = req.sale.products.filter(product => {
      return product._id != req.body.products;
    });
    const sale = await Sale.findOneAndUpdate(
      { _id: req.sale.id },
      { products: newProducts },
      {
        new: true,
      }
    );
    res.status(202).send(sale);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.pay = async (req, res) => {
  try {
    const sale = await Sale.findOneAndUpdate(
      { _id: req.sale.id },
      { paid: true },
      { new: true }
    );
    res.status(202).send(sale);
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

exports.find = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    res.send(sale);
  } catch (err) {
    res.status(404).send({ error: err });
  }
};
