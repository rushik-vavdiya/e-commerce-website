import StorefrontLayout from '../../components/layout/StorefrontLayout';
import PageBanner from '../../components/common/PageBanner';
import AboutPageIntro from '../../components/about/AboutPageIntro';
import ImageContentSection from '../../components/about/ImageContentSection';
import AboutGallery from '../../components/about/AboutGallery';
import { isVisible } from '../../data/content';

// The about page is a fixed stack of designed bands, each drawn straight from
// its component and each switchable off in src/data/sectionVisibility.json.
// Every band reads its copy from siteContent.json.
//
// The page opens with the shared simple banner (src/components/common/PageBanner)
// and then alternates words and photography: the intro with the photo mosaic,
// the photo-led how-we-work band and the studio gallery.
const About = () => {
  return (
    <StorefrontLayout>
      {isVisible('about.hero') && <PageBanner contentKey="about.hero" />}
      {isVisible('about.intro') && <AboutPageIntro />}
      {isVisible('about.howWeWork') && <ImageContentSection />}
      {isVisible('about.gallery') && <AboutGallery />}
    </StorefrontLayout>
  );
};

export default About;
