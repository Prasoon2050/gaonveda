import { AddToCartButton } from "../components/AddToCartButton";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { formatPrice, getProducts, ratingIcons, getCart } from "../lib/api";
import { productHref, productImage } from "../lib/images";
import { isLoggedIn } from "../lib/session";

export const dynamic = "force-dynamic";

const images = {
  logo: "/logo.png",
  hero: "/hero.png",
  pickle: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxUK1Nn6h5eBr2QmtNlA2D-fOnFf0YDVcTx8SelWfUDnPRF-Hu88fYuF8Mg9jJjPIqXJ4KtOMcozwG3AMlv9-jtDgXENjph3WUHht13BYk0dnWH6xnceYgoJcU-CzagmpUW1XPmyaLV4rI2bCE43pItqRi2JMF9anJoBxhwNVuH2D7rotwAEt15pwPKK96x8KxJ6hTAgL-3BupgLIgqdQdq1K9tIXRW4n_FO8vid_BoHv1NH7Ie12d4-lf9ouxoQec-XIzpUebBSjl",
  oil: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0aUYiofJPKC66txBS4OPkws27BF8O_kSoNGYzSI3qNjWwbPpQqy2RECRdQmVgUQ_N5eKx_0DuqajnkdXmCp0npbmToRuh5ax7sSCnnsnqqlriUhtfOGDdOIQE0xVS-cRLB3VfA56b9oMuUbMoGwXmhV1lkYmXWnkmakEdvxhjWvtg3VChoNoBwZJa1SzE3Rt-5In4cbUdm9Kt1zgj42GW5cnz0PBdXbQC6QRcLDNcLM_w7yf2pfC3z44TsyhQ42E7xCK6PfQiUcRC",
  atta: "https://lh3.googleusercontent.com/aida-public/AB6AXuCi4qYUOWUqkhN3Yo0_Yu91Pqkk078NbW34fvmcIzL0IGsLjN819rNT0TUWnxxb_dHWyFwe5TsJsxa718VeQ5RWBHy9Q-sxLARe98EWyJ87bjejoa4961Ofr6u4L1L0FvnUBunYbdlk-u2CefFnROHwTtmDEDyO3v_QgrZF_umajOeP0JqpBEq-ENhlHhuOdRZBuM-Tkn7FbLT96KOE86iye8uhjyqW8vkh4nDYh8_TkgKc1A4s7tCPL6m7AVOzrh4YYx2e_GXRGXo9",
  farmerHands: "https://lh3.googleusercontent.com/aida-public/AB6AXuAh8uxiiJU_HuQvP-c_oreyqev1r8TzHvn6qbbMTaGsbPyu_KAhb1geyKvlTaPR4fQri_DOM0bcSO1IeuFuawSAbSoD3uf8suHqsPFymPToLCOCqYgeEZ6fVVGV944YC04UX0QF6QaEN_32qpHUN1t9OAPqs7aO008WPGvB57BBzqksE_tpURN0EQ3XoO7NvQJpUKI1f6AR5FOTWPakl2smQo9FMZlrXjQs6zbLjn9djlogzk-u9vGEqYGkQrV9H5nQ_P4CCZnRcLlS",
  farmer: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBHCUkeA6KG4progkCWEBV2n7FmXqu5jXshJt6AQhIA4vcn7ApyLD9sEKV0xKfVCnXUbAt-QJ25fsACPmd_Sv-2_nSCbmZb5HjO43uki0p4azIuxvug5dNoFFNKv9MnC0FJbXCJthijC4qcn3Q8OF3bTpIVBDOqNGeTr7aQPrEEdZMHEs0oHYeIPgZNR9QI_KlmpbvFM_-jGsPVXl41LylLBb359qPWv5zU1g15JDNICG-pGItxgwk9tfUITo2TUS1YkhcQ38LQzel",
  artisan: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKmOtLmDP9-KN9D2rj0UK3ABtSJyxodq2bx5SZaxLTVW1TxzGg_RAdZulSQczV6hORhT0fuNaGKoadVVavc2gAi2fduFk-q96sf5pHT6PTgVPsRyV3m7tkU_j8nTXENHPPo6_ol6TUYbRGwpyxBjLt3q9YffdPNAe5WvcjmoZigqDoN9gNeADNg-HW5-nzOwvCMKZ7SSoa_AgmuT-4-zzy9E3t97Gw659UbDdbNeOcvzqWCsO0Kp6qhkAVECnJOee0TfCX8lS8Qilm",
  ghee: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaLUAA-5mi8a6e7jrY0r9FbUrmvihGyoHE4nsMbVDhSy2rnoaS3oafavw2ZYSbAGLJp2QLfHBZwWbwph5Xp9c4yAi818zqLYr3YY6fHrocqS4eP_zQLWmpum4cmmh0eZYjoTmW4_up8tdCiJsDz--GWHjxnlWWItfOyRrCfiVpbINlwLD-Hvj9DwJlc6GWhBVXN2KxNnek1FldHq43SII9IDqhxbo6fJhAlJWAtgt8Q2s7644TLkiILZRo1adoCrCRyuJlARkGerkn",
  honey: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjEwhfozDMMpXnp6oiOpy8q7GVxXHt-6nGCjbVuWqGmVnk_IM_fcXRaQzVbz1BU4VBr3q3H1n-mj6rxEd5z_rX9DulvBIeyO3F3LgLIYCxtKrHPtKsdnx1OrGyG-4WHgqUpOdVGmI7X3RWThzT0dHBF8K5dYZ9F7U4IYbucekqcUBvWHPBu7lqOGQ9v_dXnxHVHss-EHcHzaHVGONaO082a4eVba5waXCDSKe1NVjsNLa9hcMqWmVjxK9MoXatu8XepCHqx1SeHPrj",
  spices: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUtRSoc1dwCIG1Mkjz0M6XwFWKORo94OIdiTXaiWxeVL4I8MluuAUEeEWbv2crzXAj976_nYG5rwV-biHzwXLauCm9R306Eo9D_IxytAx164P3hvlJElsxlPO1QbWEYNf7BAXe5Q6h98vFwwPwHtDR05PfqIJPW0E_CynQFKooDQCHwLZdJjojN74ZTICCuFnIfbJu48IcVRvipftMJ5ZbvUShE7iwDszj-HspG_9axgw-V-tuPDDNwSyQQ_scGB2PZPbsGNkuF2gQ",
};

const features = [
  {
    icon: "spa",
    title: "100% Pure Ingredients",
    text: "Sourced directly from trusted village farmers who practice sustainable, chemical-free agriculture. We believe in transparency from soil to jar.",
    className: "feature-card feature-card-large",
  },
  {
    icon: "agriculture",
    title: "Farm Fresh",
    text: "Harvested at peak ripeness and processed immediately to lock in natural nutrients.",
    className: "feature-card",
  },
  {
    icon: "soup_kitchen",
    title: "Traditional Recipes",
    text: "Heirloom methods passed down through generations for authentic taste.",
    className: "feature-card",
  },
  {
    icon: "block",
    title: "No Chemicals",
    text: "Absolutely zero artificial preservatives, colors, or synthetic additives.",
    className: "feature-card",
  },
  {
    icon: "water_drop",
    title: "Cold Pressed",
    text: "Oils extracted using wooden ghani at low temperatures to retain purity.",
    className: "feature-card",
  },
];

const steps = [
  ["compost", "1. The Soil", "Cultivated on pesticide-free farms using sustainable, regenerative agricultural practices."],
  ["handyman", "2. The Craft", "Processed manually using stone grinders and wooden presses to preserve vital nutrients."],
  ["inventory_2", "3. The Seal", "Carefully packed in eco-friendly glass or paper to prevent contamination and plastic leeching."],
  ["local_shipping", "4. The Delivery", "Dispatched in small batches directly to your home, ensuring maximum freshness."],
];


function Icon({ name, fill = false }: { name: string; fill?: boolean }) {
  return <span className={`material-symbols-outlined${fill ? " fill" : ""}`}>{name}</span>;
}

export default async function Home() {
  const products = (await getProducts()).slice(0, 3);
  const loggedIn = await isLoggedIn();
  const cart = await getCart();

  return (
    <>
      <Navbar loggedIn={loggedIn} cartCount={cart.totals.itemCount} />

      <main className="home-main">
        <section className="hero">
          <img className="hero-image" src={images.hero} alt="GAONVEDA traditional ingredients arranged on a rustic table." />
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="eyebrow">Heritage Minimalism</p>
            <h1>
              Pure Taste From
              <br />
              <span>Indian Roots</span>
            </h1>
            <p className="hero-copy">
              Authentic, homemade flavors meticulously crafted from the heart of Indian villages directly to your kitchen table.
              Experience the tactile richness of tradition.
            </p>
            <div className="hero-buttons">
              <a className="button primary" href="#shop">
                Shop Now <Icon name="arrow_right_alt" />
              </a>
            </div>
          </div>
          <div className="scroll-cue">
            <span>Scroll</span>
            <Icon name="keyboard_arrow_down" />
          </div>
        </section>

        <div className="section-ornament" aria-hidden="true" />

        <section className="promise paper reveal" style={{ position: "relative", overflow: "hidden" }}>
          <div className="promise-ornament promise-ornament-left" aria-hidden="true">
            <img src="/leaf-ornament.svg" alt="" className="" />
          </div>
          <div className="container">
            <div className="section-heading centered">
              <h2>The GAONVEDA Promise</h2>
              <i />
            </div>
            <div className="feature-grid">
              {features.map((feature, index) => (
                <article className={`${feature.className} reveal`} key={feature.title} style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="feature-icon">
                    <Icon name={feature.icon} fill={feature.icon === "spa" || feature.icon === "water_drop"} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              ))}
              <article className="feature-wide reveal">
                <Icon name="favorite" />
                <div>
                  <h3>Homemade Taste</h3>
                  <p>
                    Every batch is crafted in small quantities by skilled village artisans, ensuring the love and care of a
                    home-cooked meal in every bite.
                  </p>
                  <a href="#story">
                    Discover our story <Icon name="arrow_forward" />
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <div className="section-ornament" aria-hidden="true" />

        <section className="products" id="shop" style={{ position: "relative" }}>
          <div className="promise-ornament promise-ornament-right" aria-hidden="true">
            <img src="/leaf-ornament.svg" alt="" className="" />
          </div>
          <div className="container">
            <div className="section-heading split reveal">
              <div>
                <h2>Curated Harvest</h2>
                <p>Experience the tactile richness of our foundational offerings, crafted with minimal intervention.</p>
              </div>
              <a href="/products">
                View All Pantry <Icon name="east" />
              </a>
            </div>
            <div className="product-grid">
              {products.map((product, index) => (
                <article className="product-card reveal" key={product.slug} style={{ animationDelay: `${index * 120}ms` }}>
                  <a className="card-cover-link" href={productHref(product.slug)} aria-label={`View ${product.title}`} />
                  <div className="product-image">
                    <span>{product.badge}</span>
                    <img src={productImage(product.slug)} alt={product.title} />
                  </div>
                  <div className="product-body">
                    <div className="rating">
                      <div>
                        {ratingIcons(product.rating).map((star, index) => (
                          <Icon key={`${star}-${index}`} name={star} fill={star !== "star_outline"} />
                        ))}
                      </div>
                      <span>({product.reviewCount})</span>
                    </div>
                    <h3>{product.title}</h3>
                    <p>{product.description}</p>
                    <div className="product-footer">
                      <div>
                        <span>{product.pack}</span>
                        <strong>{formatPrice(product.price)}</strong>
                      </div>
                      <AddToCartButton productSlug={product.slug} selectedSize={product.pack} iconOnly ariaLabel={`Add ${product.title} to cart`} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="section-ornament" aria-hidden="true" />

        <section className="story reveal" id="story">
          <div className="container story-grid">
            <figure className="story-photo">
              <img src={images.farmerHands} alt="Farmer holding grains" />
              <figcaption>"The soil remembers the hands that tend it."</figcaption>
            </figure>
            <div className="story-copy">
              <p className="kicker">
                <span />
                Our Heritage
              </p>
              <h2>
                Reconnecting with
                <br />
                the Earth's Rhythm
              </h2>
              <p>
                GAONVEDA was born from a profound nostalgia for the unadulterated flavors of our childhood. In a world of
                mass-produced convenience, we sought to return to the source-the quiet villages where food is still grown with
                reverence and prepared with patience.
              </p>
              <p>
                We partner directly with artisan farming communities across India. By bypassing commercial supply chains, we
                ensure that the traditional knowledge of our elders is preserved, and that you receive provisions exactly as
                nature intended: raw, wholesome, and alive with energy.
              </p>
              <div className="artisan-row">
                <div className="avatars">
                  <img src={images.farmer} alt="Farmer portrait" />
                  <img src={images.artisan} alt="Artisan portrait" />
                  <span>+50</span>
                </div>
                <small>Empowering over 50 rural artisans and farmers.</small>
              </div>
            </div>
          </div>
        </section>

        <div className="section-ornament" aria-hidden="true" />

        <section className="process reveal" id="process" style={{ position: "relative" }}>
          <div className="promise-ornament promise-ornament-right" aria-hidden="true">
            <img src="/leaf-ornament.svg" alt="" className="" />
          </div>
          <div className="promise-ornament promise-ornament-left" aria-hidden="true">
            <img src="/leaf-ornament.svg" alt="" className="" />
          </div>
          <div className="container">
            <div className="section-heading centered">
              <h2>Journey of Purity</h2>
              <p>From the rich soils of rural India directly to your pantry, our process is slow, deliberate, and entirely transparent.</p>
            </div>
            <div className="step-grid">
              <div className="step-line" />
              {steps.map(([icon, title, text], index) => (
                <article className={index % 2 ? "step dropped reveal" : "step reveal"} key={title} style={{ animationDelay: `${index * 100}ms` }}>
                  <div>
                    <Icon name={icon} />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="section-ornament" aria-hidden="true" />

        <section className="coming paper reveal" id="coming-soon">
          <div className="container coming-grid">
            <div>
              <span className="mini-badge">Future Harvest</span>
              <h2>Expanding Our Pantry</h2>
              <p>
                We are slowly cultivating new partnerships to bring you more staples rooted in tradition. Quality takes time.
              </p>
              <ul>
                <li>
                  <Icon name="check_circle" /> A2 Desi Cow Ghee (Bilona Method)
                </li>
                <li>
                  <Icon name="check_circle" /> Wild Forest Honey
                </li>
                <li>
                  <Icon name="check_circle" /> Hand-Pounded Spices
                </li>
              </ul>
              <button>Notify Me</button>
            </div>
            <div className="preview-grid">
              {[
                [images.ghee, "A2 Ghee"],
                [images.honey, "Wild Honey"],
                [images.spices, "Pure Spices"],
              ].map(([image, label], index) => (
                <figure className={index === 1 ? "preview-card lowered" : "preview-card"} key={label}>
                  <img src={image} alt={`${label} preview`} />
                  <figcaption>{label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
