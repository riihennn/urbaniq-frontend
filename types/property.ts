export interface IProperty {
  _id: string;
  status: string;
  propertyType: string;
  title: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  price: number;
  images?: string[];
  features: {
    area: number;
    bedrooms?: number;
    bathrooms?: number;
    furnishing?: 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
    suitableFor?: string[];
    zoning?: 'Residential' | 'Commercial' | 'Agricultural' | 'Industrial';
  };
  description: string;
  amenities?: string[];
  agentId?: {
    profileImage?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
  };
  ownerId?: {
    firstName: string;
    lastName: string;
  };
}

export interface IPropertyFilter {
  search?: string;
  status?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}
