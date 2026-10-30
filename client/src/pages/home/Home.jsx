import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import StorefrontLayout from '../../components/layout/StorefrontLayout';
import Hero from '../../components/home/Hero';
import CategoryShowcase from '../../components/home/CategoryShowcase';
import SectionJoiner from '../../components/home/SectionJoiner';
import NewArrivals from '../../components/home/NewArrivals';
import PromoBanner from '../../components/home/PromoBanner';
import FeaturedCollections from '../../components/home/FeaturedCollections';
import TrendingProducts from '../../components/home/TrendingProducts';
import WebsiteReviews from '../../components/home/WebsiteReviews';
import BrandStory from '../../components/home/BrandStory';
import Newsletter from '../../components/home/Newsletter';
import { isVisible } from '../../data/content';
import { fetchCategories } from '../../slices/categorySlice';
import { fetchProducts } from '../../slices/productSlice';
import { fetchWebsiteReviews } from '../../slices/websiteReviewSlice';

// First 12 products feed the product rows on the homepage.
const HOMEPAGE_PRODUCT_LIMIT = 12;

// The homepage is a fixed stack of designed bands, each drawn straight from its
// component and each switchable off in src/data/sectionVisibility.json. Every
// band reads its copy from siteContent.json, so the page is fully static content
// wired to the real products, categories and reviews APIs.
const Home = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories.items);
  const reviewsVisible = isVisible('home.reviews');

  useEffect(() => {
    // The products slice feeds New Arrivals and Trending; the categories slice
    // feeds the department circles.
    dispatch(fetchProducts({ limit: HOMEPAGE_PRODUCT_LIMIT, sort: 'newest' }));
    if (categories.length === 0) dispatch(fetchCategories());
    if (reviewsVisible) dispatch(fetchWebsiteReviews());
  }, [dispatch, reviewsVisible, categories.length]);

  return (
    <StorefrontLayout>
      {isVisible('home.hero') && <Hero />}
      {/* The arch rule only draws when both of the bands it joins are on the
          page — it belongs to that seam, not to the stack in general. */}
      {isVisible('home.hero') && isVisible('home.categories') && <SectionJoiner />}
      {isVisible('home.categories') && <CategoryShowcase />}
      {isVisible('home.newArrivals') && <NewArrivals />}
      {isVisible('home.promo') && <PromoBanner />}
      {isVisible('home.featuredCollections') && <FeaturedCollections />}
      {isVisible('home.trending') && <TrendingProducts />}
      {isVisible('home.reviews') && <WebsiteReviews />}
      {isVisible('home.brandStory') && <BrandStory />}
      {isVisible('home.newsletter') && <Newsletter />}
    </StorefrontLayout>
  );
};

export default Home;
