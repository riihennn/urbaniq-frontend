import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Bed, Bath, Square } from 'lucide-react';
import { IProperty } from '@/types/property';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { getPropertyThumbnail } from '@/lib/utils';

interface PropertyCardProps {
  property: IProperty;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-card">
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <Image
          src={getPropertyThumbnail(property.images?.[0])}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge variant="default" className="bg-primary text-white">
            {property.status}
          </Badge>
          <Badge variant="secondary" className="backdrop-blur-md bg-black/40 text-white border-none">
            {property.propertyType}
          </Badge>
        </div>
      </div>
      <CardContent className="p-5">
        <p className="text-2xl font-bold text-primary mb-1">
          ${property.price.toLocaleString()}
        </p>
        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          <Link href={`/agent/properties/${property._id}`}>
            {property.title}
          </Link>
        </h3>
        <div className="flex items-center text-muted-foreground text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{property.location.city}, {property.location.state}</span>
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border">
          {(property.features.bedrooms ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-primary/70" />
              <span>{property.features.bedrooms} Bed</span>
            </div>
          )}
          {(property.features.bathrooms ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-primary/70" />
              <span>{property.features.bathrooms} Bath</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Square className="w-4 h-4 text-primary/70" />
            <span>{property.features.area} sqft</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
