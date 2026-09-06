import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../data/products'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Cart() {
  useDocumentTitle('NIZALIAH — Bag')
  const { detailedItems, subtotal, setQuantity, removeItem, count } = useCart()

  return (
    <div className="min-h-[70vh] bg-[#F8F4EE] px-6 pb-24 pt-28 text-[#3E2E22] md:pt-36">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 font-sans text-[10px] tracking-[0.35em] text-[#7B5E3B]">
          YOUR BAG
        </p>
        <h1 className="font-display text-[clamp(2.4rem,5vw,3.8rem)] font-light">
          Cart
        </h1>

        {count === 0 ? (
          <div className="mt-14 border border-[#3E2E22]/12 bg-[#F4DEDF] px-8 py-14 text-center">
            <p className="font-display text-2xl font-light">Your bag is empty.</p>
            <Link
              to="/shop"
              className="mt-8 inline-block font-sans text-[10px] tracking-[0.3em] text-[#3E2E22] no-underline"
            >
              CONTINUE SHOPPING →
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-12 divide-y divide-[#3E2E22]/10 border-y border-[#3E2E22]/10">
              {detailedItems.map(({ slug, quantity, product, lineTotal }) => (
                <li
                  key={slug}
                  className="grid grid-cols-[88px_1fr] gap-5 py-8 md:grid-cols-[100px_1fr_auto]"
                >
                  <div className="flex aspect-[3/4] items-center justify-center bg-[#F4DEDF] p-2">
                    <img
                      src={product.image}
                      alt=""
                      className="max-h-full object-contain"
                    />
                  </div>
                  <div>
                    <Link
                      to={`/product/${slug}`}
                      className="font-display text-xl font-light text-[#3E2E22] no-underline"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 font-sans text-[10px] tracking-[0.24em] text-[#7B5E3B]">
                      {product.type}
                    </p>
                    <p className="mt-2 font-sans text-sm">
                      {formatPrice(product)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <label className="font-sans text-[10px] tracking-[0.2em] text-[#7B5E3B]">
                        QTY
                        <input
                          type="number"
                          min={1}
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(slug, Number(e.target.value) || 1)
                          }
                          className="ml-2 w-14 border border-[#3E2E22]/20 bg-transparent px-2 py-1 text-center text-sm text-[#3E2E22] outline-none focus:border-[#D4AF37]"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeItem(slug)}
                        className="border border-[#3E2E22]/25 px-4 py-2 font-sans text-[10px] tracking-[0.24em] text-[#3E2E22] transition-colors hover:border-[#3E2E22] hover:bg-[#3E2E22] hover:text-[#F8F4EE]"
                        aria-label={`Delete ${product.name} from cart`}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                  <p className="hidden font-display text-xl font-light md:block">
                    ${lineTotal}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-sans text-[10px] tracking-[0.28em] text-[#7B5E3B]">
                  SUBTOTAL
                </p>
                <p className="mt-2 font-display text-3xl font-light">
                  ${subtotal}
                </p>
              </div>
              <button
                type="button"
                className="border border-[#3E2E22] bg-[#3E2E22] px-8 py-3 font-sans text-[10px] tracking-[0.28em] text-[#F8F4EE]"
              >
                CHECKOUT — COMING SOON
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
