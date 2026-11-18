export const getProperties = async (req, res) => {
  const properties = [
    {
      id: 1,
      title: "Departamento en Vitacura",
      price: 350000,
      city: "Santiago",
      district: "Vitacura",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
    },
    {
      id: 2,
      title: "Penthouse en Las Condes",
      price: 550000,
      city: "Santiago",
      district: "Las Condes",
      bedrooms: 4,
      bathrooms: 3,
      area: 200,
    },
  ];

  res.json(properties);
};

export const getPropertyById = async (req, res) => {
  const { id } = req.params;

  res.json({
    id,
    title: "Penthouse con terraza en Vitacura",
    price: 720000,
    city: "Santiago",
    district: "Vitacura",
    bedrooms: 4,
    bathrooms: 3,
    area: 210,
  });
};

export const createProperty = async (req, res) => {
  const property = req.body;

  res.status(201).json({
    message: "Property created",
    property,
  });
};