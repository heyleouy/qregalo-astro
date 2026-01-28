import { getEstimatedPriceUSD, getEstimatedPriceUYU } from "@qregalo/domain";
import { formatPrice } from "@qregalo/shared";
import type { Product } from "@qregalo/shared";

interface Props {
  product: Product;
  sessionId: string;
}

export default function ProductCard({ product, sessionId }: Props) {
  const estimatedUSD = getEstimatedPriceUSD(product);
  const estimatedUYU = getEstimatedPriceUYU(product);


  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price_original, product.currency_original)}
            </span>
            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
              Oficial
            </span>
          </div>

          {estimatedUSD && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-700">
                {estimatedUSD.formatted}
              </span>
              <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded">
                Estimado
              </span>
            </div>
          )}

          {estimatedUYU && product.currency_original !== "UYU" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                {estimatedUYU.formatted}
              </span>
              <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded">
                Estimado
              </span>
            </div>
          )}
        </div>

        {product.location && (
          <p className="text-xs text-gray-500 mb-4">📍 {product.location}</p>
        )}

        <a
          href={`/producto/${product.id}?session_id=${sessionId}`}
          className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
        >
          Ver en tienda
        </a>
      </div>
    </div>
  );
}
